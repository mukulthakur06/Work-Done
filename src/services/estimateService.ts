// Workdone Estimates & Price Transparency Service
import * as crypto from 'node:crypto';
import { queryOne, queryAll, execute, runTransaction } from '../db/database.ts';
import { createNotification } from './notificationService.ts';
import { getBookingById } from './bookingService.ts';
import type { Estimate, EstimateRevision } from '../types/index.ts';

export interface CreateEstimateInput {
  bookingId: string;
  proUserId: string;
  labourCost: number;
  materialCost?: number;
  additionalCharges?: number;
  estimatedDuration: string;
  workIncluded: string;
  workExcluded?: string;
  paymentTerms?: string;
  expiresInDays?: number;
  notes?: string;
}

export function createEstimate(input: CreateEstimateInput): { success: boolean; estimate?: Estimate; error?: string } {
  const booking = getBookingById(input.bookingId);
  if (!booking) {
    return { success: false, error: 'Associated booking not found.' };
  }

  // Authorization check
  if (booking.proProfile?.userId !== input.proUserId) {
    return { success: false, error: 'Unauthorized to issue an estimate for this booking.' };
  }

  if (Number(input.labourCost) < 0) {
    return { success: false, error: 'Labour cost cannot be negative.' };
  }
  if (!input.workIncluded || input.workIncluded.trim().length < 5) {
    return { success: false, error: 'Please specify the exact work included in this estimate.' };
  }
  if (!input.estimatedDuration || input.estimatedDuration.trim().length < 2) {
    return { success: false, error: 'Please specify the estimated duration (e.g. 2 days, 4 hours).' };
  }

  return runTransaction(() => {
    const estimateId = crypto.randomUUID();
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const estimateNumber = `EST-${Date.now().toString().slice(-4)}-${randomSuffix}`;
    const now = new Date().toISOString();

    const labourCost = Math.max(0, Number(input.labourCost) || 0);
    const materialCost = Math.max(0, Number(input.materialCost) || 0);
    const additionalCharges = Math.max(0, Number(input.additionalCharges) || 0);
    const totalCost = labourCost + materialCost + additionalCharges;

    const daysValid = Math.max(1, Number(input.expiresInDays) || 14);
    const expiresAt = new Date(Date.now() + daysValid * 24 * 60 * 60 * 1000).toISOString();

    execute(
      `INSERT INTO estimates (
         id, booking_id, estimate_number, labour_cost, material_cost, additional_charges,
         total_cost, estimated_duration, work_included, work_excluded, payment_terms,
         expires_at, status, customer_accepted_at, notes, created_at, updated_at
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'SENT', NULL, ?, ?, ?)`,
      [
        estimateId,
        input.bookingId,
        estimateNumber,
        labourCost,
        materialCost,
        additionalCharges,
        totalCost,
        input.estimatedDuration.trim(),
        input.workIncluded.trim(),
        input.workExcluded?.trim() || null,
        input.paymentTerms?.trim() || 'Payment upon satisfactory completion',
        expiresAt,
        input.notes?.trim() || null,
        now,
        now
      ]
    );

    // Initial revision record
    execute(
      `INSERT INTO estimate_revisions (id, estimate_id, revision_number, labour_cost, material_cost, additional_charges, total_cost, change_reason, created_at)
       VALUES (?, ?, 1, ?, ?, ?, ?, 'Initial Estimate Issued', ?)`,
      [crypto.randomUUID(), estimateId, labourCost, materialCost, additionalCharges, totalCost, now]
    );

    // Notify customer
    if (booking.customer?.userId) {
      createNotification({
        userId: booking.customer.userId,
        title: 'New Estimate Received',
        message: `Estimate #${estimateNumber} totaling $${totalCost.toFixed(2)} has been submitted for booking #${booking.bookingNumber}.`,
        type: 'ESTIMATE',
        linkUrl: `/dashboard/customer?tab=requests&id=${booking.id}`
      });
    }

    const created = getEstimateById(estimateId);
    return { success: true, estimate: created || undefined };
  });
}

export function acceptEstimate(estimateId: string, customerUserId: string): { success: boolean; error?: string } {
  const estimate = getEstimateById(estimateId);
  if (!estimate) {
    return { success: false, error: 'Estimate not found.' };
  }

  const booking = getBookingById(estimate.bookingId);
  if (!booking) {
    return { success: false, error: 'Associated booking not found.' };
  }

  if (booking.customer?.userId !== customerUserId) {
    return { success: false, error: 'Only the customer who requested this booking can accept the estimate.' };
  }

  if (estimate.status === 'ACCEPTED') {
    return { success: false, error: 'This estimate has already been accepted.' };
  }

  if (new Date(estimate.expiresAt) < new Date()) {
    return { success: false, error: 'This estimate has expired. Please request a revised estimate.' };
  }

  return runTransaction(() => {
    const now = new Date().toISOString();

    // Mark estimate as accepted
    execute(
      `UPDATE estimates SET status = 'ACCEPTED', customer_accepted_at = ?, updated_at = ? WHERE id = ?`,
      [now, now, estimateId]
    );

    // Update booking final amount and ensure status is confirmed
    execute(
      `UPDATE bookings SET final_amount = ?, status = CASE WHEN status = 'REQUESTED' THEN 'ACCEPTED' ELSE status END, updated_at = ? WHERE id = ?`,
      [estimate.totalCost, now, booking.id]
    );

    // Record in booking history
    execute(
      `INSERT INTO booking_status_history (id, booking_id, from_status, to_status, actor_role, actor_id, note, created_at)
       VALUES (?, ?, ?, ?, 'CUSTOMER', ?, ?, ?)`,
      [
        crypto.randomUUID(),
        booking.id,
        booking.status,
        booking.status === 'REQUESTED' ? 'ACCEPTED' : booking.status,
        customerUserId,
        `Customer accepted estimate #${estimate.estimateNumber} for $${estimate.totalCost.toFixed(2)}`,
        now
      ]
    );

    // Notify professional
    if (booking.proProfile?.userId) {
      createNotification({
        userId: booking.proProfile.userId,
        title: 'Estimate Accepted!',
        message: `Customer accepted estimate #${estimate.estimateNumber} for booking #${booking.bookingNumber}. Agreed total: $${estimate.totalCost.toFixed(2)}.`,
        type: 'ESTIMATE',
        linkUrl: `/dashboard/pro?tab=requests&id=${booking.id}`
      });
    }

    return { success: true };
  });
}

export function getEstimateById(estimateId: string): Estimate | null {
  const row = queryOne<any>('SELECT * FROM estimates WHERE id = ?', [estimateId]);
  if (!row) return null;
  return {
    id: row.id,
    bookingId: row.booking_id,
    estimateNumber: row.estimate_number,
    labourCost: row.labour_cost,
    materialCost: row.material_cost,
    additionalCharges: row.additional_charges,
    totalCost: row.total_cost,
    estimatedDuration: row.estimated_duration,
    workIncluded: row.work_included,
    workExcluded: row.work_excluded,
    paymentTerms: row.payment_terms,
    expiresAt: row.expires_at,
    status: row.status,
    customerAcceptedAt: row.customer_accepted_at,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}
