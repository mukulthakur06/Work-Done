// Workdone Customer Complaint & Dispute Resolution Service
import * as crypto from 'node:crypto';
import { queryOne, queryAll, execute, runTransaction } from '../db/database.ts';
import { getBookingById } from './bookingService.ts';
import { createNotification } from './notificationService.ts';
import { logAuditEvent } from '../auth/auth.ts';
import type { CustomerComplaint, ComplaintCategory, ComplaintStatus } from '../types/index.ts';

export interface SubmitComplaintInput {
  bookingId: string;
  customerUserId: string;
  category: ComplaintCategory;
  description: string;
}

export function submitComplaint(input: SubmitComplaintInput): { success: boolean; complaint?: CustomerComplaint; error?: string } {
  if (!input.description || input.description.trim().length < 15) {
    return { success: false, error: 'Please provide a thorough description of the issue (minimum 15 characters).' };
  }

  const booking = getBookingById(input.bookingId);
  if (!booking) {
    return { success: false, error: 'Associated booking not found.' };
  }

  if (booking.customer?.userId !== input.customerUserId) {
    return { success: false, error: 'Only the customer on this booking can submit a formal complaint.' };
  }

  return runTransaction(() => {
    const complaintId = crypto.randomUUID();
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const complaintNumber = `CMP-2026-${randomSuffix}`;
    const now = new Date().toISOString();

    execute(
      `INSERT INTO customer_complaints (
         id, complaint_number, booking_id, customer_id, pro_profile_id,
         category, description, status, resolution_notes, resolved_by, resolved_at,
         created_at, updated_at
       ) VALUES (?, ?, ?, ?, ?, ?, ?, 'OPEN', NULL, NULL, NULL, ?, ?)`,
      [
        complaintId,
        complaintNumber,
        input.bookingId,
        input.customerUserId,
        booking.proProfileId,
        input.category,
        input.description.trim(),
        now,
        now
      ]
    );

    // If booking was in progress or accepted, update status to DISPUTED
    if (booking.status !== 'COMPLETED' && booking.status !== 'CANCELLED') {
      execute(`UPDATE bookings SET status = 'DISPUTED', updated_at = ? WHERE id = ?`, [now, booking.id]);
      execute(
        `INSERT INTO booking_status_history (id, booking_id, from_status, to_status, actor_role, actor_id, note, created_at)
         VALUES (?, ?, ?, 'DISPUTED', 'CUSTOMER', ?, ?, ?)`,
        [crypto.randomUUID(), booking.id, booking.status, input.customerUserId, `Complaint #${complaintNumber} filed`, now]
      );
    }

    // Notify customer
    createNotification({
      userId: input.customerUserId,
      title: 'Complaint Filed Successfully',
      message: `Your complaint #${complaintNumber} has been submitted and escalated to our moderation team.`,
      type: 'COMPLAINT',
      linkUrl: `/dashboard/customer?tab=complaints`
    });

    // Notify pro
    if (booking.proProfile?.userId) {
      createNotification({
        userId: booking.proProfile.userId,
        title: 'Dispute / Complaint Notice',
        message: `A complaint #${complaintNumber} has been logged regarding booking #${booking.bookingNumber}. Workdone support will review this matter.`,
        type: 'COMPLAINT',
        linkUrl: `/dashboard/pro?tab=complaints`
      });
    }

    logAuditEvent(input.customerUserId, 'SUBMIT_COMPLAINT', 'COMPLAINT', complaintId, {
      complaintNumber,
      bookingId: input.bookingId,
      category: input.category
    });

    const created = getComplaintById(complaintId);
    return { success: true, complaint: created || undefined };
  });
}

export function updateComplaintStatus(
  complaintId: string,
  adminUserId: string,
  status: ComplaintStatus,
  resolutionNotes: string
): { success: boolean; error?: string } {
  const complaint = getComplaintById(complaintId);
  if (!complaint) {
    return { success: false, error: 'Complaint not found.' };
  }

  const now = new Date().toISOString();
  execute(
    `UPDATE customer_complaints
     SET status = ?, resolution_notes = ?, resolved_by = ?, resolved_at = ?, updated_at = ?
     WHERE id = ?`,
    [status, resolutionNotes.trim(), adminUserId, now, now, complaintId]
  );

  // Notify customer
  createNotification({
    userId: complaint.customerId,
    title: `Complaint #${complaint.complaintNumber} Update`,
    message: `Your complaint status has been updated to ${status}. Notes: ${resolutionNotes}`,
    type: 'COMPLAINT',
    linkUrl: `/dashboard/customer?tab=complaints`
  });

  logAuditEvent(adminUserId, 'UPDATE_COMPLAINT', 'COMPLAINT', complaintId, {
    status,
    resolutionNotes
  });

  return { success: true };
}

export function getComplaintById(complaintId: string): CustomerComplaint | null {
  const row = queryOne<any>(
    `SELECT c.*, cu.name as customer_name, cu.email as customer_email, pu.name as pro_name
     FROM customer_complaints c
     JOIN users cu ON c.customer_id = cu.id
     JOIN professional_profiles pp ON c.pro_profile_id = pp.id
     JOIN users pu ON pp.user_id = pu.id
     WHERE c.id = ?`,
    [complaintId]
  );
  if (!row) return null;
  return {
    id: row.id,
    complaintNumber: row.complaint_number,
    bookingId: row.booking_id,
    customerId: row.customer_id,
    proProfileId: row.pro_profile_id,
    category: row.category as ComplaintCategory,
    description: row.description,
    status: row.status as ComplaintStatus,
    resolutionNotes: row.resolution_notes,
    resolvedBy: row.resolved_by,
    resolvedAt: row.resolved_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    customerEmail: row.customer_email,
    customerName: row.customer_name,
    proName: row.pro_name
  };
}

export function getAllComplaints(status?: string): CustomerComplaint[] {
  let sql = `
    SELECT c.*, cu.name as customer_name, cu.email as customer_email, pu.name as pro_name
    FROM customer_complaints c
    JOIN users cu ON c.customer_id = cu.id
    JOIN professional_profiles pp ON c.pro_profile_id = pp.id
    JOIN users pu ON pp.user_id = pu.id
  `;
  const params: any[] = [];
  if (status && status !== 'all') {
    sql += ` WHERE c.status = ?`;
    params.push(status);
  }
  sql += ` ORDER BY c.created_at DESC`;

  return queryAll<any>(sql, params).map((row) => ({
    id: row.id,
    complaintNumber: row.complaint_number,
    bookingId: row.booking_id,
    customerId: row.customer_id,
    proProfileId: row.pro_profile_id,
    category: row.category as ComplaintCategory,
    description: row.description,
    status: row.status as ComplaintStatus,
    resolutionNotes: row.resolution_notes,
    resolvedBy: row.resolved_by,
    resolvedAt: row.resolved_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    customerEmail: row.customer_email,
    customerName: row.customer_name,
    proName: row.pro_name
  }));
}
