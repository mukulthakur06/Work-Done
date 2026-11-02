// Workdone Booking & Job Management Service
import * as crypto from 'node:crypto';
import { queryOne, queryAll, execute, runTransaction } from '../db/database.ts';
import { createNotification } from './notificationService.ts';
import type { Booking, BookingStatus, UserRole, BookingStatusHistory } from '../types/index.ts';

export interface CreateBookingInput {
  customerId: string;
  proProfileId: string;
  categoryId: string;
  serviceTitle: string;
  description: string;
  approximateLocation: string;
  city: string;
  locality?: string;
  pinCode?: string;
  requestedDate: string;
  budgetRangeMin?: number;
  budgetRangeMax?: number;
}

export function createBooking(input: CreateBookingInput): { success: boolean; booking?: Booking; error?: string } {
  if (!input.description || input.description.trim().length < 10) {
    return { success: false, error: 'Please describe the project or service required (minimum 10 characters).' };
  }
  if (!input.approximateLocation || input.approximateLocation.trim().length < 3) {
    return { success: false, error: 'Project location or area is required.' };
  }
  if (!input.requestedDate) {
    return { success: false, error: 'Preferred date is required.' };
  }

  // Verify pro exists
  const pro = queryOne<{ id: string; user_id: string }>(
    'SELECT id, user_id FROM professional_profiles WHERE id = ?',
    [input.proProfileId]
  );
  if (!pro) {
    return { success: false, error: 'Selected professional profile could not be found.' };
  }

  return runTransaction(() => {
    const bookingId = crypto.randomUUID();
    const randomSuffix = Math.floor(10000 + Math.random() * 90000);
    const bookingNumber = `WD-2026-${randomSuffix}`;
    const now = new Date().toISOString();

    execute(
      `INSERT INTO bookings (
         id, booking_number, customer_id, pro_profile_id, category_id,
         service_title, description, approximate_location, city, locality, pin_code,
         requested_date, budget_range_min, budget_range_max, status, created_at, updated_at
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'REQUESTED', ?, ?)`,
      [
        bookingId,
        bookingNumber,
        input.customerId,
        input.proProfileId,
        input.categoryId,
        input.serviceTitle.trim(),
        input.description.trim(),
        input.approximateLocation.trim(),
        input.city.trim(),
        input.locality || null,
        input.pinCode || null,
        input.requestedDate,
        input.budgetRangeMin || null,
        input.budgetRangeMax || null,
        now,
        now
      ]
    );

    // Initial status history
    execute(
      `INSERT INTO booking_status_history (id, booking_id, from_status, to_status, actor_role, actor_id, note, created_at)
       VALUES (?, ?, NULL, 'REQUESTED', 'CUSTOMER', ?, 'Booking request submitted by customer.', ?)`,
      [crypto.randomUUID(), bookingId, input.customerId, now]
    );

    // Notify professional
    createNotification({
      userId: pro.user_id,
      title: 'New Booking Request',
      message: `You have received a new booking request #${bookingNumber} for ${input.serviceTitle}.`,
      type: 'BOOKING',
      linkUrl: `/dashboard/pro?tab=requests&id=${bookingId}`
    });

    const created = getBookingById(bookingId);
    return { success: true, booking: created || undefined };
  });
}

export function updateBookingStatus(
  bookingId: string,
  actorUserId: string,
  actorRole: UserRole,
  newStatus: BookingStatus,
  options?: {
    note?: string;
    rescheduledDate?: string;
    cancellationReason?: string;
  }
): { success: boolean; error?: string } {
  const booking = getBookingById(bookingId);
  if (!booking) {
    return { success: false, error: 'Booking not found.' };
  }

  const currentStatus = booking.status;
  const now = new Date().toISOString();

  // Role authorization and state validation
  const isCustomer = booking.customer?.userId === actorUserId || actorRole === 'ADMIN';
  const isPro = booking.proProfile?.userId === actorUserId || actorRole === 'ADMIN';

  if (!isCustomer && !isPro && actorRole !== 'ADMIN') {
    return { success: false, error: 'Unauthorized to modify this booking.' };
  }

  // Enforce valid transitions
  let valid = false;

  switch (currentStatus) {
    case 'REQUESTED':
      if (isPro && (newStatus === 'ACCEPTED' || newStatus === 'REJECTED' || newStatus === 'RESCHEDULE_PROPOSED')) {
        valid = true;
      }
      if (isCustomer && newStatus === 'CANCELLED') {
        valid = true;
      }
      break;

    case 'RESCHEDULE_PROPOSED':
      if (isCustomer && (newStatus === 'CONFIRMED' || newStatus === 'CANCELLED')) {
        valid = true;
      }
      if (isPro && (newStatus === 'CANCELLED' || newStatus === 'ACCEPTED')) {
        valid = true;
      }
      break;

    case 'ACCEPTED':
    case 'CONFIRMED':
      if ((isPro || isCustomer) && (newStatus === 'IN_PROGRESS' || newStatus === 'CANCELLED')) {
        valid = true;
      }
      break;

    case 'IN_PROGRESS':
      if (isPro && newStatus === 'COMPLETED') {
        valid = true;
      }
      if ((isPro || isCustomer) && newStatus === 'DISPUTED') {
        valid = true;
      }
      break;

    default:
      if (actorRole === 'ADMIN') {
        valid = true; // Admin override
      }
      break;
  }

  if (!valid) {
    return {
      success: false,
      error: `Invalid status transition from ${currentStatus} to ${newStatus} for role ${actorRole}.`
    };
  }

  return runTransaction(() => {
    let confirmedDate = booking.confirmedDate;
    let rescheduledDate = booking.rescheduledDate;
    let cancellationReason = booking.cancellationReason;
    let rescheduleNotes = booking.rescheduleNotes;

    if (newStatus === 'ACCEPTED') {
      confirmedDate = booking.requestedDate;
    } else if (newStatus === 'RESCHEDULE_PROPOSED') {
      rescheduledDate = options?.rescheduledDate || null;
      rescheduleNotes = options?.note || null;
    } else if (newStatus === 'CONFIRMED' && currentStatus === 'RESCHEDULE_PROPOSED') {
      confirmedDate = booking.rescheduledDate || booking.requestedDate;
    } else if (newStatus === 'CANCELLED') {
      cancellationReason = options?.cancellationReason || options?.note || 'Cancelled by user';
    }

    execute(
      `UPDATE bookings
       SET status = ?, confirmed_date = ?, rescheduled_date = ?, cancellation_reason = ?, reschedule_notes = ?, updated_at = ?
       WHERE id = ?`,
      [newStatus, confirmedDate, rescheduledDate, cancellationReason, rescheduleNotes, now, bookingId]
    );

    // If completed, increment professional completed jobs count
    if (newStatus === 'COMPLETED' && currentStatus !== 'COMPLETED') {
      execute(
        `UPDATE professional_profiles SET completed_jobs_count = completed_jobs_count + 1 WHERE id = ?`,
        [booking.proProfileId]
      );
    }

    // Audit trail
    execute(
      `INSERT INTO booking_status_history (id, booking_id, from_status, to_status, actor_role, actor_id, note, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [crypto.randomUUID(), bookingId, currentStatus, newStatus, actorRole, actorUserId, options?.note || null, now]
    );

    // Notify the other party
    const recipientUserId = isPro ? booking.customer?.userId : booking.proProfile?.userId;
    if (recipientUserId) {
      createNotification({
        userId: recipientUserId,
        title: `Booking #${booking.bookingNumber} Status Updated`,
        message: `Status changed to ${newStatus.replace('_', ' ')}. ${options?.note || ''}`,
        type: 'BOOKING',
        linkUrl: `/dashboard/${isPro ? 'customer' : 'pro'}?tab=requests&id=${bookingId}`
      });
    }

    return { success: true };
  });
}

export function getBookingById(bookingId: string): Booking | null {
  const row = queryOne<any>(
    `SELECT b.*,
            cp.user_id as cust_user_id, cp.city as cust_city, cp.locality as cust_locality,
            cu.name as cust_name, cu.email as cust_email, cu.phone as cust_phone,
            pp.user_id as pro_user_id, pp.business_name as pro_business_name, pp.city as pro_city,
            pu.name as pro_name, pu.email as pro_email, pu.phone as pro_phone,
            sc.name as category_name, sc.slug as category_slug
     FROM bookings b
     JOIN customer_profiles cp ON b.customer_id = cp.id
     JOIN users cu ON cp.user_id = cu.id
     JOIN professional_profiles pp ON b.pro_profile_id = pp.id
     JOIN users pu ON pp.user_id = pu.id
     JOIN service_categories sc ON b.category_id = sc.id
     WHERE b.id = ?`,
    [bookingId]
  );
  if (!row) return null;

  const estimates = queryAll<any>(
    'SELECT * FROM estimates WHERE booking_id = ? ORDER BY created_at DESC',
    [bookingId]
  ).map((est) => ({
    id: est.id,
    bookingId: est.booking_id,
    estimateNumber: est.estimate_number,
    labourCost: est.labour_cost,
    materialCost: est.material_cost,
    additionalCharges: est.additional_charges,
    totalCost: est.total_cost,
    estimatedDuration: est.estimated_duration,
    workIncluded: est.work_included,
    workExcluded: est.work_excluded,
    paymentTerms: est.payment_terms,
    expiresAt: est.expires_at,
    status: est.status,
    customerAcceptedAt: est.customer_accepted_at,
    notes: est.notes,
    createdAt: est.created_at,
    updatedAt: est.updated_at
  }));

  const reviewRow = queryOne<any>('SELECT * FROM reviews WHERE booking_id = ?', [bookingId]);
  const review = reviewRow
    ? {
        id: reviewRow.id,
        bookingId: reviewRow.booking_id,
        customerId: reviewRow.customer_id,
        proProfileId: reviewRow.pro_profile_id,
        overallRating: reviewRow.overall_rating,
        punctualityRating: reviewRow.punctuality_rating,
        workmanshipRating: reviewRow.workmanship_rating,
        communicationRating: reviewRow.communication_rating,
        valueRating: reviewRow.value_rating,
        comment: reviewRow.comment,
        photos: reviewRow.photos,
        proResponse: reviewRow.pro_response,
        proResponseDate: reviewRow.pro_response_date,
        isVerifiedBooking: Boolean(reviewRow.is_verified_booking),
        isModerated: Boolean(reviewRow.is_moderated),
        isFlagged: Boolean(reviewRow.is_flagged),
        createdAt: reviewRow.created_at,
        updatedAt: reviewRow.updated_at
      }
    : null;

  return {
    id: row.id,
    bookingNumber: row.booking_number,
    customerId: row.customer_id,
    proProfileId: row.pro_profile_id,
    categoryId: row.category_id,
    serviceTitle: row.service_title,
    description: row.description,
    approximateLocation: row.approximate_location,
    city: row.city,
    locality: row.locality,
    pinCode: row.pin_code,
    requestedDate: row.requested_date,
    confirmedDate: row.confirmed_date,
    rescheduledDate: row.rescheduled_date,
    budgetRangeMin: row.budget_range_min,
    budgetRangeMax: row.budget_range_max,
    finalAmount: row.final_amount,
    status: row.status as BookingStatus,
    cancellationReason: row.cancellation_reason,
    rescheduleNotes: row.reschedule_notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    customer: {
      id: row.customer_id,
      userId: row.cust_user_id,
      city: row.cust_city,
      locality: row.cust_locality,
      preferredContact: 'IN_APP',
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      user: {
        id: row.cust_user_id,
        email: row.cust_email,
        passwordHash: '',
        role: 'CUSTOMER',
        name: row.cust_name,
        phone: row.cust_phone,
        isActive: true,
        isEmailVerified: true,
        isPhoneVerified: false,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      }
    },
    proProfile: {
      id: row.pro_profile_id,
      userId: row.pro_user_id,
      businessName: row.pro_business_name,
      bio: '',
      yearsExperience: 0,
      city: row.pro_city,
      availabilityStatus: 'AVAILABLE',
      availabilityUpdatedAt: row.created_at,
      verificationStatus: 'UNVERIFIED',
      averageRating: 0,
      totalReviews: 0,
      completedJobsCount: 0,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      user: {
        id: row.pro_user_id,
        email: row.pro_email,
        passwordHash: '',
        role: 'PROFESSIONAL',
        name: row.pro_name,
        phone: row.pro_phone,
        isActive: true,
        isEmailVerified: true,
        isPhoneVerified: false,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      }
    },
    category: {
      id: row.category_id,
      slug: row.category_slug,
      name: row.category_name,
      description: '',
      iconName: '',
      sortOrder: 0,
      isActive: true,
      createdAt: ''
    },
    estimates,
    review
  };
}

export function getCustomerBookings(customerId: string, status?: string): Booking[] {
  let sql = `SELECT id FROM bookings WHERE customer_id = ?`;
  const params: any[] = [customerId];
  if (status && status !== 'all') {
    sql += ` AND status = ?`;
    params.push(status);
  }
  sql += ` ORDER BY created_at DESC`;

  const rows = queryAll<{ id: string }>(sql, params);
  return rows.map((r) => getBookingById(r.id)).filter((b): b is Booking => b !== null);
}

export function getProBookings(proProfileId: string, status?: string): Booking[] {
  let sql = `SELECT id FROM bookings WHERE pro_profile_id = ?`;
  const params: any[] = [proProfileId];
  if (status && status !== 'all') {
    sql += ` AND status = ?`;
    params.push(status);
  }
  sql += ` ORDER BY created_at DESC`;

  const rows = queryAll<{ id: string }>(sql, params);
  return rows.map((r) => getBookingById(r.id)).filter((b): b is Booking => b !== null);
}
