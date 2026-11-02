// Workdone Verification & Trust Service
import * as crypto from 'node:crypto';
import { queryOne, queryAll, execute, runTransaction } from '../db/database.ts';
import { createNotification } from './notificationService.ts';
import { logAuditEvent } from '../auth/auth.ts';
import type { VerificationRecord, VerificationStatus } from '../types/index.ts';

export interface SubmitVerificationInput {
  proProfileId: string;
  stage: 'IDENTITY' | 'BUSINESS' | 'QUALIFICATIONS' | 'REFERENCES' | 'WORK_HISTORY';
  documentType?: string;
  documentNumber?: string;
  notes?: string;
}

export function submitVerification(input: SubmitVerificationInput): { success: boolean; recordId?: string; error?: string } {
  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  execute(
    `INSERT INTO verification_records (
       id, pro_profile_id, stage, document_type, document_number, status, notes, created_at
     ) VALUES (?, ?, ?, ?, ?, 'PENDING', ?, ?)`,
    [
      id,
      input.proProfileId,
      input.stage,
      input.documentType || null,
      input.documentNumber || null,
      input.notes || null,
      now
    ]
  );

  // Set pro verification_status to PENDING_REVIEW if currently UNVERIFIED
  execute(
    `UPDATE professional_profiles
     SET verification_status = CASE WHEN verification_status = 'UNVERIFIED' THEN 'PENDING_REVIEW' ELSE verification_status END,
         updated_at = ?
     WHERE id = ?`,
    [now, input.proProfileId]
  );

  return { success: true, recordId: id };
}

export function reviewVerificationRecord(
  recordId: string,
  adminUserId: string,
  approved: boolean,
  reason?: string
): { success: boolean; error?: string } {
  const record = queryOne<any>('SELECT * FROM verification_records WHERE id = ?', [recordId]);
  if (!record) {
    return { success: false, error: 'Verification record not found.' };
  }

  const pro = queryOne<any>('SELECT * FROM professional_profiles WHERE id = ?', [record.pro_profile_id]);
  if (!pro) {
    return { success: false, error: 'Associated professional profile not found.' };
  }

  const now = new Date().toISOString();
  const status = approved ? 'APPROVED' : 'REJECTED';

  return runTransaction(() => {
    execute(
      `UPDATE verification_records
       SET status = ?, verified_by = ?, verified_at = ?, rejection_reason = ?, notes = COALESCE(?, notes)
       WHERE id = ?`,
      [status, adminUserId, now, approved ? null : reason || 'Criteria not met', reason || null, recordId]
    );

    // Compute updated profile verification status based on all records
    const allApproved = queryAll<{ stage: string }>(
      `SELECT stage FROM verification_records WHERE pro_profile_id = ? AND status = 'APPROVED'`,
      [record.pro_profile_id]
    );

    const stagesApproved = new Set(allApproved.map((r) => r.stage));
    let newProStatus: VerificationStatus = 'PENDING_REVIEW';

    if (stagesApproved.has('IDENTITY') && stagesApproved.has('BUSINESS')) {
      newProStatus = 'FULLY_VERIFIED';
    } else if (stagesApproved.has('BUSINESS')) {
      newProStatus = 'BUSINESS_VERIFIED';
    } else if (stagesApproved.has('IDENTITY')) {
      newProStatus = 'IDENTITY_VERIFIED';
    } else if (!approved && allApproved.length === 0) {
      newProStatus = 'REJECTED';
    }

    const verificationNotes = approved
      ? `Verified checks: ${Array.from(stagesApproved).join(', ')}`
      : `Verification rejected: ${reason || 'Incomplete documentation'}`;

    execute(
      `UPDATE professional_profiles
       SET verification_status = ?, verification_notes = ?, updated_at = ?
       WHERE id = ?`,
      [newProStatus, verificationNotes, now, record.pro_profile_id]
    );

    // Notify pro
    createNotification({
      userId: pro.user_id,
      title: approved ? 'Verification Check Approved' : 'Verification Check Update',
      message: approved
        ? `Your ${record.stage} verification check was approved by the administration team.`
        : `Your ${record.stage} verification was not approved: ${reason || 'Please submit updated documentation.'}`,
      type: 'VERIFICATION',
      linkUrl: `/dashboard/pro?tab=profile`
    });

    logAuditEvent(adminUserId, 'REVIEW_VERIFICATION', 'VERIFICATION', recordId, {
      proProfileId: record.pro_profile_id,
      stage: record.stage,
      approved,
      newStatus: newProStatus
    });

    return { success: true };
  });
}

export function getProVerificationRecords(proProfileId: string): VerificationRecord[] {
  return queryAll<VerificationRecord>(
    'SELECT * FROM verification_records WHERE pro_profile_id = ? ORDER BY created_at DESC',
    [proProfileId]
  );
}

export function getPendingVerifications(): (VerificationRecord & { proName: string; businessName: string; city: string; proEmail: string })[] {
  return queryAll<any>(
    `SELECT vr.*, u.name as pro_name, u.email as pro_email, pp.business_name, pp.city
     FROM verification_records vr
     JOIN professional_profiles pp ON vr.pro_profile_id = pp.id
     JOIN users u ON pp.user_id = u.id
     WHERE vr.status = 'PENDING'
     ORDER BY vr.created_at ASC`
  ).map((r) => ({
    id: r.id,
    proProfileId: r.pro_profile_id,
    stage: r.stage,
    documentType: r.document_type,
    documentNumber: r.document_number,
    status: r.status,
    verifiedBy: r.verified_by,
    verifiedAt: r.verified_at,
    rejectionReason: r.rejection_reason,
    notes: r.notes,
    createdAt: r.created_at,
    proName: r.pro_name,
    businessName: r.business_name,
    city: r.city,
    proEmail: r.pro_email
  }));
}
