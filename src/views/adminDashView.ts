// Workdone Administrator Dashboard View Implementation
import type { AdminMetrics, VerificationRecord, CustomerComplaint, AuditLog } from '../types/index.ts';

export interface AdminDashProps {
  metrics: AdminMetrics;
  pendingVerifications: any[];
  users: any[];
  reportedReviews: any[];
  complaints: CustomerComplaint[];
  auditLogs: AuditLog[];
  activeTab: string;
}

export function renderAdminDashView(props: AdminDashProps): string {
  const { metrics, pendingVerifications, users, reportedReviews, complaints, auditLogs, activeTab } = props;

  return `
    <div style="background: var(--bg-surface); border-bottom: 1px solid var(--border); padding: 2rem 0;">
      <div class="container">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
          <div>
            <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.25rem;">
              <span class="badge" style="background: #0f172a; color: #fff;">Super Admin</span>
              <h1 style="font-size: 1.75rem; font-weight: 800; color: var(--primary);">
                Platform Administration
              </h1>
            </div>
            <p style="color: var(--text-muted); font-size: 0.9rem;">
              Manage verification pipelines, moderate content, resolve disputes, and maintain platform security.
            </p>
          </div>
        </div>
      </div>
    </div>

    <div class="container dashboard-layout">
      <!-- Admin Sidebar Navigation -->
      <aside class="dash-sidebar">
        <ul class="dash-nav">
          <li>
            <a href="/admin?tab=overview" class="dash-nav-item ${activeTab === 'overview' ? 'active' : ''}">
              📊 System Overview
            </a>
          </li>
          <li>
            <a href="/admin?tab=verifications" class="dash-nav-item ${activeTab === 'verifications' ? 'active' : ''}">
              🛡️ Verifications (${metrics.pendingVerifications})
            </a>
          </li>
          <li>
            <a href="/admin?tab=users" class="dash-nav-item ${activeTab === 'users' ? 'active' : ''}">
              👥 User Management (${users.length})
            </a>
          </li>
          <li>
            <a href="/admin?tab=moderation" class="dash-nav-item ${activeTab === 'moderation' ? 'active' : ''}">
              🚩 Moderation (${metrics.reportedReviews})
            </a>
          </li>
          <li>
            <a href="/admin?tab=disputes" class="dash-nav-item ${activeTab === 'disputes' ? 'active' : ''}">
              ⚖️ Disputes &amp; Complaints (${metrics.openComplaints})
            </a>
          </li>
          <li>
            <a href="/admin?tab=audit" class="dash-nav-item ${activeTab === 'audit' ? 'active' : ''}">
              📜 Audit Logs
            </a>
          </li>
        </ul>
      </aside>

      <!-- Admin Main Content Panel -->
      <main class="dash-content">
        ${
          activeTab === 'verifications'
            ? renderVerificationsTab(pendingVerifications)
            : activeTab === 'users'
            ? renderUsersTab(users)
            : activeTab === 'moderation'
            ? renderModerationTab(reportedReviews)
            : activeTab === 'disputes'
            ? renderDisputesTab(complaints)
            : activeTab === 'audit'
            ? renderAuditTab(auditLogs)
            : renderOverviewTab(metrics)
        }
      </main>
    </div>

    <script>
      async function handleVerificationAction(recordId, approved) {
        let reason = '';
        if (!approved) {
          reason = prompt('Enter rejection reason for documentation:');
          if (!reason) return;
        }
        try {
          const res = await fetch('/api/admin/verifications/' + recordId + '/review', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ approved, reason })
          });
          const data = await res.json();
          if (!res.ok) {
            WorkdoneApp.showToast(data.error || 'Failed to update verification.', 'error');
            return;
          }
          WorkdoneApp.showToast(approved ? 'Verification approved & badge granted.' : 'Verification rejected.');
          setTimeout(() => window.location.reload(), 800);
        } catch {
          WorkdoneApp.showToast('Network error.', 'error');
        }
      }

      async function toggleUserActive(userId, currentIsActive) {
        const nextState = !currentIsActive;
        const confirmMsg = nextState ? 'Reactivate this user account?' : 'Suspend this user account?';
        if (!confirm(confirmMsg)) return;

        try {
          const res = await fetch('/api/admin/users/' + userId + '/toggle-active', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ isActive: nextState })
          });
          const data = await res.json();
          if (!res.ok) {
            WorkdoneApp.showToast(data.error || 'Failed to change account status.', 'error');
            return;
          }
          WorkdoneApp.showToast(nextState ? 'User account reactivated.' : 'User account suspended.');
          setTimeout(() => window.location.reload(), 800);
        } catch {
          WorkdoneApp.showToast('Network error.', 'error');
        }
      }

      async function handleModerateReview(reportId, action) {
        try {
          const res = await fetch('/api/admin/reviews/moderate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ reportId, action })
          });
          const data = await res.json();
          if (!res.ok) {
            WorkdoneApp.showToast(data.error || 'Failed to moderate review.', 'error');
            return;
          }
          WorkdoneApp.showToast(action === 'REMOVE_REVIEW' ? 'Review removed due to policy violation.' : 'Report dismissed.');
          setTimeout(() => window.location.reload(), 800);
        } catch {
          WorkdoneApp.showToast('Network error.', 'error');
        }
      }

      async function resolveComplaint(compId) {
        const notes = prompt('Enter resolution notes for customer & professional:');
        if (!notes) return;
        try {
          const res = await fetch('/api/admin/complaints/' + compId + '/resolve', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'RESOLVED', resolutionNotes: notes })
          });
          const data = await res.json();
          if (!res.ok) {
            WorkdoneApp.showToast(data.error || 'Failed to resolve complaint.', 'error');
            return;
          }
          WorkdoneApp.showToast('Complaint marked as RESOLVED.');
          setTimeout(() => window.location.reload(), 800);
        } catch {
          WorkdoneApp.showToast('Network error.', 'error');
        }
      }
    </script>
  `;
}

function renderOverviewTab(metrics: AdminMetrics): string {
  return `
    <div>
      <h2 style="font-size: 1.25rem; font-weight: 800; color: var(--primary); margin-bottom: 1.5rem;">
        Platform Health &amp; Activity Overview
      </h2>

      <!-- Metrics Grid -->
      <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 1.25rem; margin-bottom: 2rem;">
        <div style="background: var(--bg-page); border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 1.25rem;">
          <div style="font-size: 0.8rem; color: var(--text-muted); font-weight: 600;">Registered Customers</div>
          <div style="font-size: 1.75rem; font-weight: 800; color: var(--primary); margin-top: 0.25rem;">${metrics.totalCustomers}</div>
        </div>
        <div style="background: var(--bg-page); border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 1.25rem;">
          <div style="font-size: 0.8rem; color: var(--text-muted); font-weight: 600;">Registered Professionals</div>
          <div style="font-size: 1.75rem; font-weight: 800; color: var(--primary); margin-top: 0.25rem;">${metrics.totalProfessionals}</div>
        </div>
        <div style="background: var(--bg-page); border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 1.25rem;">
          <div style="font-size: 0.8rem; color: var(--text-muted); font-weight: 600;">Pending Verifications</div>
          <div style="font-size: 1.75rem; font-weight: 800; color: #d97706; margin-top: 0.25rem;">${metrics.pendingVerifications}</div>
        </div>
        <div style="background: var(--bg-page); border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 1.25rem;">
          <div style="font-size: 0.8rem; color: var(--text-muted); font-weight: 600;">Total Bookings</div>
          <div style="font-size: 1.75rem; font-weight: 800; color: #0d9488; margin-top: 0.25rem;">${metrics.totalBookings}</div>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.25rem; margin-bottom: 2rem;">
        <div style="background: var(--bg-page); border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 1.25rem;">
          <div style="font-size: 0.8rem; color: var(--text-muted); font-weight: 600;">Booking Completion Rate</div>
          <div style="font-size: 1.75rem; font-weight: 800; color: #15803d; margin-top: 0.25rem;">${metrics.bookingCompletionRate}%</div>
        </div>
        <div style="background: var(--bg-page); border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 1.25rem;">
          <div style="font-size: 0.8rem; color: var(--text-muted); font-weight: 600;">Open Customer Complaints</div>
          <div style="font-size: 1.75rem; font-weight: 800; color: #dc2626; margin-top: 0.25rem;">${metrics.openComplaints}</div>
        </div>
        <div style="background: var(--bg-page); border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 1.25rem;">
          <div style="font-size: 0.8rem; color: var(--text-muted); font-weight: 600;">Reported Reviews Pending</div>
          <div style="font-size: 1.75rem; font-weight: 800; color: #d97706; margin-top: 0.25rem;">${metrics.reportedReviews}</div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div style="border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 1.5rem; background: #fff;">
        <h3 style="font-size: 1.1rem; font-weight: 700; color: var(--primary); margin-bottom: 0.75rem;">Administrator Guidance</h3>
        <p style="font-size: 0.875rem; color: var(--text-muted); line-height: 1.5;">
          • All verification actions and moderation decisions are recorded in the immutable audit log with administrator user IDs.<br>
          • Legitimate critical customer reviews must not be removed unless they contain abusive language, fraud, or violations of platform guidelines.<br>
          • Verified badges reflect checked identity, license, or business records.
        </p>
      </div>
    </div>
  `;
}

function renderVerificationsTab(verifications: any[]): string {
  if (verifications.length === 0) {
    return `
      <div>
        <h2 style="font-size: 1.25rem; font-weight: 800; color: var(--primary); margin-bottom: 1.25rem;">Verification Queue (0)</h2>
        <div style="text-align: center; padding: 3rem 1rem; color: var(--text-muted); background: var(--bg-page); border-radius: var(--radius-sm);">
          ✓ All professional verification submissions have been reviewed.
        </div>
      </div>
    `;
  }

  return `
    <div>
      <h2 style="font-size: 1.25rem; font-weight: 800; color: var(--primary); margin-bottom: 1.25rem;">
        Pending Professional Verifications (${verifications.length})
      </h2>

      <div style="display: flex; flex-direction: column; gap: 1rem;">
        ${verifications
          .map(
            (v) => `
          <div style="border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 1.25rem; background: var(--bg-surface);">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem;">
              <div>
                <h4 style="font-size: 1.05rem; font-weight: 700; color: var(--primary);">${escapeHtml(v.proName)}</h4>
                <div style="font-size: 0.8rem; color: var(--text-muted);">${escapeHtml(v.businessName || 'Pro')} &bull; ${escapeHtml(v.city)} &bull; ${escapeHtml(v.proEmail)}</div>
              </div>
              <span class="badge badge-pending">${v.stage} Check</span>
            </div>

            <div style="background: var(--bg-page); padding: 0.65rem 0.85rem; border-radius: 4px; font-size: 0.825rem; margin-bottom: 0.85rem;">
              <strong>Document Type:</strong> ${escapeHtml(v.documentType || 'Identity Record')} &bull;
              <strong>Reference Number:</strong> ${escapeHtml(v.documentNumber || 'Self-submitted')}
              ${v.notes ? `<br><strong>Notes:</strong> ${escapeHtml(v.notes)}` : ''}
            </div>

            <div style="display: flex; gap: 0.5rem;">
              <button onclick="handleVerificationAction('${v.id}', true)" class="btn btn-secondary btn-sm">Approve &amp; Grant Verified Badge</button>
              <button onclick="handleVerificationAction('${v.id}', false)" class="btn btn-outline btn-sm" style="color: #ef4444; border-color: #fca5a5;">Reject with Reason</button>
            </div>
          </div>
        `
          )
          .join('')}
      </div>
    </div>
  `;
}

function renderUsersTab(users: any[]): string {
  return `
    <div>
      <h2 style="font-size: 1.25rem; font-weight: 800; color: var(--primary); margin-bottom: 1.25rem;">
        User Directory &amp; Permissions (${users.length})
      </h2>

      <div style="overflow-x: auto; border: 1px solid var(--border); border-radius: var(--radius-sm);">
        <table style="width: 100%; border-collapse: collapse; font-size: 0.85rem; text-align: left;">
          <thead>
            <tr style="background: var(--bg-page); border-bottom: 1px solid var(--border);">
              <th style="padding: 0.75rem 1rem;">Name / Email</th>
              <th style="padding: 0.75rem 1rem;">Role</th>
              <th style="padding: 0.75rem 1rem;">Location</th>
              <th style="padding: 0.75rem 1rem;">Status</th>
              <th style="padding: 0.75rem 1rem;">Action</th>
            </tr>
          </thead>
          <tbody>
            ${users
              .map(
                (u) => `
              <tr style="border-bottom: 1px solid var(--border);">
                <td style="padding: 0.75rem 1rem;">
                  <strong>${escapeHtml(u.name)}</strong>
                  <div style="color: var(--text-muted); font-size: 0.78rem;">${escapeHtml(u.email)}</div>
                </td>
                <td style="padding: 0.75rem 1rem;">
                  <span class="badge" style="background: ${u.role === 'ADMIN' ? '#0f172a' : u.role === 'PROFESSIONAL' ? '#0d9488' : '#e2e8f0'}; color: ${u.role === 'CUSTOMER' ? '#1e293b' : '#fff'};">
                    ${u.role}
                  </span>
                </td>
                <td style="padding: 0.75rem 1rem;">${escapeHtml(u.pro_city || u.cust_city || '—')}</td>
                <td style="padding: 0.75rem 1rem;">
                  <span style="color: ${u.is_active ? '#059669' : '#dc2626'}; font-weight: 600;">
                    ${u.is_active ? 'Active' : 'Suspended'}
                  </span>
                </td>
                <td style="padding: 0.75rem 1rem;">
                  ${
                    u.role !== 'ADMIN'
                      ? `<button onclick="toggleUserActive('${u.id}', ${Boolean(u.is_active)})" class="btn btn-outline btn-sm" style="font-size: 0.75rem; padding: 0.25rem 0.5rem; color: ${u.is_active ? '#dc2626' : '#059669'};">
                          ${u.is_active ? 'Suspend' : 'Reactivate'}
                        </button>`
                      : '<span style="color: var(--text-muted); font-size: 0.75rem;">Admin</span>'
                  }
                </td>
              </tr>
            `
              )
              .join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function renderModerationTab(reports: any[]): string {
  if (reports.length === 0) {
    return `
      <div>
        <h2 style="font-size: 1.25rem; font-weight: 800; color: var(--primary); margin-bottom: 1.25rem;">Review Moderation Queue (0)</h2>
        <div style="text-align: center; padding: 3rem 1rem; color: var(--text-muted); background: var(--bg-page); border-radius: var(--radius-sm);">
          ✓ No flagged or reported reviews requiring moderation.
        </div>
      </div>
    `;
  }

  return `
    <div>
      <h2 style="font-size: 1.25rem; font-weight: 800; color: var(--primary); margin-bottom: 1.25rem;">
        Flagged Reviews Awaiting Moderation (${reports.length})
      </h2>

      <div style="display: flex; flex-direction: column; gap: 1rem;">
        ${reports
          .map(
            (r) => `
          <div style="border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 1.25rem; background: var(--bg-surface);">
            <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
              <div>
                <strong>Reported on Review for Pro:</strong> ${escapeHtml(r.pro_name || 'Professional')} (${escapeHtml(r.businessName || '')})
              </div>
              <span class="badge" style="background: #fee2e2; color: #b91c1c;">Flagged</span>
            </div>

            <div style="background: var(--bg-page); padding: 0.75rem; border-radius: 4px; font-size: 0.85rem; margin-bottom: 0.75rem;">
              <strong style="color: #b91c1c;">Report Reason:</strong> ${escapeHtml(r.reason)}<br>
              <span style="color: var(--text-muted); font-size: 0.75rem;">Reported by: ${escapeHtml(r.reporter_name)} (${escapeHtml(r.reporter_email)})</span>
            </div>

            <div style="border-left: 3px solid #cbd5e1; padding-left: 0.75rem; font-size: 0.875rem; color: var(--text-main); margin-bottom: 1rem;">
              <strong>Review Text (${r.overall_rating}★):</strong> "${escapeHtml(r.review_comment)}"
            </div>

            <div style="display: flex; gap: 0.5rem;">
              <button onclick="handleModerateReview('${r.id}', 'DISMISS')" class="btn btn-outline btn-sm">Dismiss Report (Keep Review)</button>
              <button onclick="handleModerateReview('${r.id}', 'REMOVE_REVIEW')" class="btn btn-primary btn-sm" style="background: #dc2626; border-color: #dc2626;">Remove Review for Violation</button>
            </div>
          </div>
        `
          )
          .join('')}
      </div>
    </div>
  `;
}

function renderDisputesTab(complaints: CustomerComplaint[]): string {
  if (complaints.length === 0) {
    return `
      <div>
        <h2 style="font-size: 1.25rem; font-weight: 800; color: var(--primary); margin-bottom: 1.25rem;">Customer Complaints &amp; Disputes (0)</h2>
        <div style="text-align: center; padding: 3rem 1rem; color: var(--text-muted); background: var(--bg-page); border-radius: var(--radius-sm);">
          ✓ No active customer complaints filed.
        </div>
      </div>
    `;
  }

  return `
    <div>
      <h2 style="font-size: 1.25rem; font-weight: 800; color: var(--primary); margin-bottom: 1.25rem;">
        Customer Complaints &amp; Disputes (${complaints.length})
      </h2>

      <div style="display: flex; flex-direction: column; gap: 1rem;">
        ${complaints
          .map(
            (c) => `
          <div style="border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 1.25rem; background: var(--bg-surface);">
            <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
              <div>
                <strong>${c.complaintNumber}</strong> &bull; <span style="color: #dc2626; font-weight: 700;">${c.category}</span>
                <div style="font-size: 0.8rem; color: var(--text-muted);">
                  Customer: ${escapeHtml(c.customerName || '')} &bull; Pro: ${escapeHtml(c.proName || '')} &bull; Filed: ${c.createdAt.substring(0, 10)}
                </div>
              </div>
              <span class="badge ${c.status === 'RESOLVED' ? 'badge-verified' : 'badge-pending'}">${c.status}</span>
            </div>

            <p style="font-size: 0.875rem; color: var(--text-main); margin-bottom: 0.75rem; background: var(--bg-page); padding: 0.75rem; border-radius: 4px;">
              ${escapeHtml(c.description)}
            </p>

            ${
              c.resolutionNotes
                ? `
              <div style="font-size: 0.8rem; color: #047857; margin-bottom: 0.75rem;">
                <strong>Resolution Notes:</strong> ${escapeHtml(c.resolutionNotes)}
              </div>
            `
                : ''
            }

            ${
              c.status !== 'RESOLVED'
                ? `
              <div>
                <button onclick="resolveComplaint('${c.id}')" class="btn btn-secondary btn-sm">Resolve &amp; Record Resolution</button>
              </div>
            `
                : ''
            }
          </div>
        `
          )
          .join('')}
      </div>
    </div>
  `;
}

function renderAuditTab(auditLogs: AuditLog[]): string {
  return `
    <div>
      <h2 style="font-size: 1.25rem; font-weight: 800; color: var(--primary); margin-bottom: 1.25rem;">
        System Audit Logs Trail (${auditLogs.length})
      </h2>

      <div style="overflow-x: auto; border: 1px solid var(--border); border-radius: var(--radius-sm);">
        <table style="width: 100%; border-collapse: collapse; font-size: 0.8rem; text-align: left;">
          <thead>
            <tr style="background: var(--bg-page); border-bottom: 1px solid var(--border);">
              <th style="padding: 0.65rem 0.85rem;">Timestamp</th>
              <th style="padding: 0.65rem 0.85rem;">Action</th>
              <th style="padding: 0.65rem 0.85rem;">Entity</th>
              <th style="padding: 0.65rem 0.85rem;">Details</th>
            </tr>
          </thead>
          <tbody>
            ${auditLogs
              .map(
                (log) => `
              <tr style="border-bottom: 1px solid var(--border);">
                <td style="padding: 0.65rem 0.85rem; color: var(--text-muted);">${log.createdAt.replace('T', ' ').substring(0, 19)}</td>
                <td style="padding: 0.65rem 0.85rem;"><strong>${escapeHtml(log.action)}</strong></td>
                <td style="padding: 0.65rem 0.85rem;">${escapeHtml(log.entityType)} (${escapeHtml(log.entityId.substring(0, 8))}...)</td>
                <td style="padding: 0.65rem 0.85rem; color: var(--text-muted); font-family: monospace;">${escapeHtml(log.details || '—')}</td>
              </tr>
            `
              )
              .join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function escapeHtml(str: string): string {
  if (typeof str !== 'string') return '';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}
