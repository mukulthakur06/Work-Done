// Workdone Ratings, Reviews & Quality Control Service
import * as crypto from 'node:crypto';
import { queryOne, queryAll, execute, runTransaction } from '../db/database.ts';
import { getBookingById } from './bookingService.ts';
import { createNotification } from './notificationService.ts';
import { logAuditEvent } from '../auth/auth.ts';
import type { Review, ReviewReport } from '../types/index.ts';

export interface SubmitReviewInput {
  bookingId: string;
  customerUserId: string;
  overallRating: number;
  punctualityRating: number;
  workmanshipRating: number;
  communicationRating: number;
  valueRating: number;
  comment: string;
  photos?: string[];
}

export function submitReview(input: SubmitReviewInput): { success: boolean; review?: Review; error?: string } {
  // Validate ratings 1 to 5
  const ratings = [
    input.overallRating,
    input.punctualityRating,
    input.workmanshipRating,
    input.communicationRating,
    input.valueRating
  ];

  for (const r of ratings) {
    if (!r || r < 1 || r > 5 || !Number.isInteger(Number(r))) {
      return { success: false, error: 'All rating criteria must be whole numbers between 1 and 5 stars.' };
    }
  }

  if (!input.comment || input.comment.trim().length < 10) {
    return { success: false, error: 'Please provide detailed review feedback (minimum 10 characters).' };
  }

  const booking = getBookingById(input.bookingId);
  if (!booking) {
    return { success: false, error: 'Associated booking not found.' };
  }

  // Check booking eligibility: Must be COMPLETED
  if (booking.status !== 'COMPLETED') {
    return {
      success: false,
      error: `Reviews can only be submitted for completed jobs. Current booking status is: ${booking.status}.`
    };
  }

  // Check customer authorization: Customer who made booking
  if (booking.customer?.userId !== input.customerUserId) {
    return { success: false, error: 'Only the customer who completed this booking can submit a review.' };
  }

  // Check duplicate review
  const existingReview = queryOne<{ id: string }>('SELECT id FROM reviews WHERE booking_id = ?', [input.bookingId]);
  if (existingReview) {
    return { success: false, error: 'A review has already been submitted for this booking.' };
  }

  // Prevent pro from reviewing themselves
  if (booking.proProfile?.userId === input.customerUserId) {
    return { success: false, error: 'Professionals cannot review their own services.' };
  }

  return runTransaction(() => {
    const reviewId = crypto.randomUUID();
    const now = new Date().toISOString();
    const photosJson = input.photos && input.photos.length > 0 ? JSON.stringify(input.photos) : null;

    execute(
      `INSERT INTO reviews (
         id, booking_id, customer_id, pro_profile_id, overall_rating,
         punctuality_rating, workmanship_rating, communication_rating, value_rating,
         comment, photos, pro_response, pro_response_date, is_verified_booking,
         is_moderated, is_flagged, created_at, updated_at
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NULL, NULL, 1, 0, 0, ?, ?)`,
      [
        reviewId,
        input.bookingId,
        booking.customerId,
        booking.proProfileId,
        Number(input.overallRating),
        Number(input.punctualityRating),
        Number(input.workmanshipRating),
        Number(input.communicationRating),
        Number(input.valueRating),
        input.comment.trim(),
        photosJson,
        now,
        now
      ]
    );

    // Recalculate professional average rating and total reviews from actual stored reviews
    recalculateProRating(booking.proProfileId);

    // Notify professional
    if (booking.proProfile?.userId) {
      createNotification({
        userId: booking.proProfile.userId,
        title: 'New Customer Review Received',
        message: `A ${input.overallRating}-star review was posted for booking #${booking.bookingNumber}.`,
        type: 'REVIEW',
        linkUrl: `/dashboard/pro?tab=reviews`
      });
    }

    logAuditEvent(input.customerUserId, 'SUBMIT_REVIEW', 'REVIEW', reviewId, {
      proProfileId: booking.proProfileId,
      overallRating: input.overallRating
    });

    const created = getReviewById(reviewId);
    return { success: true, review: created || undefined };
  });
}

export function respondToReview(reviewId: string, proUserId: string, responseText: string): { success: boolean; error?: string } {
  if (!responseText || responseText.trim().length < 5) {
    return { success: false, error: 'Response must be at least 5 characters long.' };
  }

  const review = getReviewById(reviewId);
  if (!review) {
    return { success: false, error: 'Review not found.' };
  }

  // Check that the pro owns this review
  const pro = queryOne<{ id: string; user_id: string }>(
    'SELECT id, user_id FROM professional_profiles WHERE id = ?',
    [review.proProfileId]
  );
  if (!pro || pro.user_id !== proUserId) {
    return { success: false, error: 'Only the professional who received this review can submit a response.' };
  }

  const now = new Date().toISOString();
  execute(
    `UPDATE reviews SET pro_response = ?, pro_response_date = ?, updated_at = ? WHERE id = ?`,
    [responseText.trim(), now, now, reviewId]
  );

  return { success: true };
}

export function reportReview(reviewId: string, reportedByUserId: string, reason: string): { success: boolean; error?: string } {
  if (!reason || reason.trim().length < 5) {
    return { success: false, error: 'Please specify the reason for reporting this review (minimum 5 characters).' };
  }

  const review = getReviewById(reviewId);
  if (!review) {
    return { success: false, error: 'Review not found.' };
  }

  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  runTransaction(() => {
    execute(
      `INSERT INTO review_reports (id, review_id, reported_by, reason, status, created_at)
       VALUES (?, ?, ?, ?, 'PENDING', ?)`,
      [id, reviewId, reportedByUserId, reason.trim(), now]
    );

    // Flag the review for moderation queue
    execute(`UPDATE reviews SET is_flagged = 1, updated_at = ? WHERE id = ?`, [now, reviewId]);

    logAuditEvent(reportedByUserId, 'REPORT_REVIEW', 'REVIEW', reviewId, { reason: reason.trim() });
  });

  return { success: true };
}

export function recalculateProRating(proProfileId: string): void {
  const stats = queryOne<{ avgRating: number; count: number }>(
    `SELECT AVG(overall_rating) as avgRating, COUNT(*) as count
     FROM reviews
     WHERE pro_profile_id = ? AND is_moderated = 0`,
    [proProfileId]
  );

  const avg = stats && stats.avgRating ? Math.round(stats.avgRating * 10) / 10 : 0.0;
  const count = stats && stats.count ? stats.count : 0;

  execute(
    `UPDATE professional_profiles SET average_rating = ?, total_reviews = ?, updated_at = ? WHERE id = ?`,
    [avg, count, new Date().toISOString(), proProfileId]
  );
}

export function getReviewById(reviewId: string): Review | null {
  const row = queryOne<any>(
    `SELECT r.*, u.name as customer_name, cp.city as customer_city
     FROM reviews r
     JOIN customer_profiles cp ON r.customer_id = cp.id
     JOIN users u ON cp.user_id = u.id
     WHERE r.id = ?`,
    [reviewId]
  );
  if (!row) return null;
  return {
    id: row.id,
    bookingId: row.booking_id,
    customerId: row.customer_id,
    proProfileId: row.pro_profile_id,
    overallRating: row.overall_rating,
    punctualityRating: row.punctuality_rating,
    workmanshipRating: row.workmanship_rating,
    communicationRating: row.communication_rating,
    valueRating: row.value_rating,
    comment: row.comment,
    photos: row.photos,
    proResponse: row.pro_response,
    proResponseDate: row.pro_response_date,
    isVerifiedBooking: Boolean(row.is_verified_booking),
    isModerated: Boolean(row.is_moderated),
    isFlagged: Boolean(row.is_flagged),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    customerName: row.customer_name,
    customerCity: row.customer_city
  };
}
