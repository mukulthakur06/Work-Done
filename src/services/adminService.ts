// Workdone Administrator & Platform Governance Service
import * as crypto from 'node:crypto';
import { queryOne, queryAll, execute, runTransaction } from '../db/database.ts';
import { logAuditEvent } from '../auth/auth.ts';
import { recalculateProRating } from './reviewService.ts';
import type { AuditLog, ServiceCategory } from '../types/index.ts';

export interface AdminMetrics {
  totalCustomers: number;
  totalProfessionals: number;
  pendingVerifications: number;
  totalBookings: number;
  completedBookings: number;
  bookingCompletionRate: number;
  openComplaints: number;
  reportedReviews: number;
}

export function getAdminMetrics(): AdminMetrics {
  const custCount = queryOne<{ count: number }>("SELECT COUNT(*) as count FROM users WHERE role = 'CUSTOMER'")?.count || 0;
  const proCount = queryOne<{ count: number }>("SELECT COUNT(*) as count FROM users WHERE role = 'PROFESSIONAL'")?.count || 0;
  const pendingVerif = queryOne<{ count: number }>("SELECT COUNT(*) as count FROM verification_records WHERE status = 'PENDING'")?.count || 0;
  const totalBookings = queryOne<{ count: number }>("SELECT COUNT(*) as count FROM bookings")?.count || 0;
  const completedBookings = queryOne<{ count: number }>("SELECT COUNT(*) as count FROM bookings WHERE status = 'COMPLETED'")?.count || 0;
  const openComplaints = queryOne<{ count: number }>("SELECT COUNT(*) as count FROM customer_complaints WHERE status = 'OPEN'")?.count || 0;
  const reportedReviews = queryOne<{ count: number }>("SELECT COUNT(*) as count FROM review_reports WHERE status = 'PENDING'")?.count || 0;

  const bookingCompletionRate = totalBookings > 0 ? Math.round((completedBookings / totalBookings) * 100) : 0;

  return {
    totalCustomers: custCount,
    totalProfessionals: proCount,
    pendingVerifications: pendingVerif,
    totalBookings,
    completedBookings,
    bookingCompletionRate,
    openComplaints,
    reportedReviews
  };
}

export function getAllUsers(roleFilter?: string, search?: string): any[] {
  let sql = `
    SELECT u.id, u.email, u.role, u.name, u.phone, u.avatar_url, u.is_active,
           u.is_email_verified, u.created_at,
           pp.business_name, pp.city as pro_city, pp.verification_status, pp.average_rating,
           cp.city as cust_city
    FROM users u
    LEFT JOIN professional_profiles pp ON pp.user_id = u.id
    LEFT JOIN customer_profiles cp ON cp.user_id = u.id
  `;
  const where: string[] = [];
  const params: any[] = [];

  if (roleFilter && roleFilter !== 'all') {
    where.push('u.role = ?');
    params.push(roleFilter);
  }

  if (search && search.trim().length > 0) {
    const s = `%${search.trim().toLowerCase()}%`;
    where.push('(LOWER(u.name) LIKE ? OR LOWER(u.email) LIKE ? OR LOWER(COALESCE(pp.business_name, "")) LIKE ?)');
    params.push(s, s, s);
  }

  if (where.length > 0) {
    sql += ` WHERE ${where.join(' AND ')}`;
  }

  sql += ` ORDER BY u.created_at DESC`;
  return queryAll<any>(sql, params);
}

export function toggleUserActiveStatus(userId: string, adminUserId: string, isActive: boolean, reason?: string): { success: boolean; error?: string } {
  // Prevent admin from deactivating themselves
  if (userId === adminUserId) {
    return { success: false, error: 'Administrators cannot deactivate their own account.' };
  }

  execute('UPDATE users SET is_active = ?, updated_at = ? WHERE id = ?', [isActive ? 1 : 0, new Date().toISOString(), userId]);
  logAuditEvent(adminUserId, isActive ? 'REACTIVATE_USER' : 'SUSPEND_USER', 'USER', userId, { reason: reason || 'Admin action' });
  return { success: true };
}

export function getReportedReviews(): any[] {
  return queryAll<any>(`
    SELECT rr.*,
           r.comment as review_comment, r.overall_rating, r.pro_profile_id, r.is_moderated,
           u.name as reporter_name, u.email as reporter_email,
           pu.name as pro_name, pp.business_name
    FROM review_reports rr
    JOIN reviews r ON rr.review_id = r.id
    JOIN users u ON rr.reported_by = u.id
    JOIN professional_profiles pp ON r.pro_profile_id = pp.id
    JOIN users pu ON pp.user_id = pu.id
    WHERE rr.status = 'PENDING'
    ORDER BY rr.created_at ASC
  `);
}

export function moderateReview(
  reportId: string,
  adminUserId: string,
  action: 'DISMISS' | 'REMOVE_REVIEW',
  moderationNotes?: string
): { success: boolean; error?: string } {
  const report = queryOne<any>('SELECT * FROM review_reports WHERE id = ?', [reportId]);
  if (!report) {
    return { success: false, error: 'Report not found.' };
  }

  return runTransaction(() => {
    const now = new Date().toISOString();

    if (action === 'DISMISS') {
      execute(
        `UPDATE review_reports SET status = 'DISMISSED', action_taken = 'Report dismissed after review', created_at = ? WHERE id = ?`,
        [now, reportId]
      );
      execute(`UPDATE reviews SET is_flagged = 0, updated_at = ? WHERE id = ?`, [now, report.review_id]);
    } else if (action === 'REMOVE_REVIEW') {
      execute(
        `UPDATE review_reports SET status = 'ACTIONED', action_taken = 'Review hidden/moderated due to policy violation', created_at = ? WHERE id = ?`,
        [now, reportId]
      );
      execute(
        `UPDATE reviews SET is_moderated = 1, is_flagged = 0, comment = '[This review has been removed by platform moderation for violating community standards]', updated_at = ? WHERE id = ?`,
        [now, report.review_id]
      );

      // Recalculate pro rating now that moderated review is excluded
      const rev = queryOne<any>('SELECT pro_profile_id FROM reviews WHERE id = ?', [report.review_id]);
      if (rev) {
        recalculateProRating(rev.pro_profile_id);
      }
    }

    logAuditEvent(adminUserId, 'MODERATE_REVIEW', 'REVIEW', report.review_id, {
      reportId,
      action,
      notes: moderationNotes
    });

    return { success: true };
  });
}

export function getServiceCategories(includeInactive: boolean = false): ServiceCategory[] {
  let sql = 'SELECT * FROM service_categories';
  if (!includeInactive) {
    sql += ' WHERE is_active = 1';
  }
  sql += ' ORDER BY sort_order ASC';
  return queryAll<any>(sql).map((r) => ({
    id: r.id,
    slug: r.slug,
    name: r.name,
    description: r.description,
    iconName: r.icon_name,
    bannerImage: r.banner_image,
    sortOrder: r.sort_order,
    isActive: Boolean(r.is_active),
    createdAt: r.created_at
  }));
}

export function getAuditLogs(limit: number = 50): AuditLog[] {
  return queryAll<any>(
    `SELECT al.*, u.email as user_email, u.name as user_name
     FROM audit_logs al
     LEFT JOIN users u ON al.user_id = u.id
     ORDER BY al.created_at DESC
     LIMIT ?`,
    [limit]
  ).map((r) => ({
    id: r.id,
    userId: r.user_id,
    action: r.action,
    entityType: r.entity_type,
    entityId: r.entity_id,
    details: r.details,
    ipAddress: r.ip_address,
    createdAt: r.created_at,
    userEmail: r.user_email,
    userName: r.user_name
  }));
}
