// Workdone Customer Dashboard View
import type { Booking, CustomerProfile, ProfessionalProfile, Notification, User } from '../types/index.ts';

export interface CustomerDashProps {
  user: User;
  profile: CustomerProfile | null;
  bookings: Booking[];
  savedPros: ProfessionalProfile[];
  notifications: Notification[];
  activeTab: string;
}

export function renderCustomerDashView(props: CustomerDashProps): string {
  const { user, profile, bookings, savedPros, notifications, activeTab } = props;

  const pendingBookings = bookings.filter((b) => b.status === 'REQUESTED' || b.status === 'RESCHEDULE_PROPOSED');
  const activeBookings = bookings.filter((b) => b.status === 'ACCEPTED' || b.status === 'CONFIRMED' || b.status === 'IN_PROGRESS');
  const completedBookings = bookings.filter((b) => b.status === 'COMPLETED');
  const cancelledBookings = bookings.filter((b) => b.status === 'CANCELLED' || b.status === 'REJECTED' || b.status === 'DISPUTED');

  return `
    <div style="background: var(--bg-surface); border-bottom: 1px solid var(--border); padding: 2rem 0;">
      <div class="container">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
          <div>
            <h1 style="font-size: 1.75rem; font-weight: 800; color: var(--primary); margin-bottom: 0.25rem;">
              Customer Dashboard
            </h1>
            <p style="color: var(--text-muted); font-size: 0.9rem;">
              Welcome back, ${escapeHtml(user.name)}. Manage your booking requests, estimates, and saved professionals.
            </p>
          </div>
          <a href="/professionals" class="btn btn-secondary btn-sm">+ Find New Professional</a>
        </div>
      </div>
    </div>

    <div class="container dashboard-layout">
      <!-- Dashboard Sidebar Navigation -->
      <aside class="dash-sidebar">
        <ul class="dash-nav">
          <li>
            <a href="/dashboard/customer?tab=requests" class="dash-nav-item ${activeTab === 'requests' ? 'active' : ''}">
              📋 Booking Requests (${bookings.length})
            </a>
          </li>
          <li>
            <a href="/dashboard/customer?tab=saved" class="dash-nav-item ${activeTab === 'saved' ? 'active' : ''}">
              ♥ Saved Professionals (${savedPros.length})
            </a>
          </li>
          <li>
            <a href="/dashboard/customer?tab=notifications" class="dash-nav-item ${activeTab === 'notifications' ? 'active' : ''}">
              🔔 Notifications (${notifications.filter((n) => !n.isRead).length})
            </a>
          </li>
          <li>
            <a href="/dashboard/customer?tab=settings" class="dash-nav-item ${activeTab === 'settings' ? 'active' : ''}">
              ⚙️ Account Settings
            </a>
          </li>
        </ul>
      </aside>

      <!-- Dashboard Main Content Panel -->
      <main class="dash-content">
        ${
          activeTab === 'saved'
            ? renderSavedProsTab(savedPros)
            : activeTab === 'notifications'
            ? renderNotificationsTab(notifications)
            : activeTab === 'settings'
            ? renderSettingsTab(user, profile)
            : renderBookingsTab(bookings, pendingBookings, activeBookings, completedBookings, cancelledBookings)
        }
      </main>
    </div>

    <!-- Review Modal Container -->
    <div id="review-modal" class="modal-overlay" style="display: none;">
      <div class="modal-dialog">
        <div class="modal-header">
          <h3 class="modal-title">Leave a Verified Review</h3>
          <button class="modal-close" onclick="WorkdoneApp.closeModal('review-modal')">&times;</button>
        </div>
        <form onsubmit="WorkdoneApp.handleReviewSubmit(event, this)">
          <input type="hidden" name="bookingId" id="rm-booking-id">

          <div style="background: #f0fdfa; border: 1px solid #ccfbf1; padding: 0.85rem; border-radius: var(--radius-sm); margin-bottom: 1.25rem; font-size: 0.85rem; color: #0f766e;">
            ✓ <strong>Verified Completed Job:</strong> Your review will be publicly attached to the professional profile and help future homeowners make confident decisions.
          </div>

          <div class="form-group">
            <label class="form-label">Overall Rating (1 - 5 Stars) *</label>
            <select name="overallRating" required class="form-select">
              <option value="5">★★★★★ (5 Stars - Exceptional)</option>
              <option value="4">★★★★☆ (4 Stars - Very Good)</option>
              <option value="3">★★★☆☆ (3 Stars - Average)</option>
              <option value="2">★★☆☆☆ (2 Stars - Below Expectation)</option>
              <option value="1">★☆☆☆☆ (1 Star - Unsatisfactory)</option>
            </select>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1.25rem;">
            <div>
              <label class="form-label">Punctuality</label>
              <select name="punctualityRating" class="form-select">
                <option value="5">5 / 5</option>
                <option value="4">4 / 5</option>
                <option value="3">3 / 5</option>
                <option value="2">2 / 5</option>
                <option value="1">1 / 5</option>
              </select>
            </div>
            <div>
              <label class="form-label">Workmanship</label>
              <select name="workmanshipRating" class="form-select">
                <option value="5">5 / 5</option>
                <option value="4">4 / 5</option>
                <option value="3">3 / 5</option>
                <option value="2">2 / 5</option>
                <option value="1">1 / 5</option>
              </select>
            </div>
            <div>
              <label class="form-label">Communication</label>
              <select name="communicationRating" class="form-select">
                <option value="5">5 / 5</option>
                <option value="4">4 / 5</option>
                <option value="3">3 / 5</option>
                <option value="2">2 / 5</option>
                <option value="1">1 / 5</option>
              </select>
            </div>
            <div>
              <label class="form-label">Value for Money</label>
              <select name="valueRating" class="form-select">
                <option value="5">5 / 5</option>
                <option value="4">4 / 5</option>
                <option value="3">3 / 5</option>
                <option value="2">2 / 5</option>
                <option value="1">1 / 5</option>
              </select>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Detailed Review Feedback *</label>
            <textarea name="comment" required class="form-textarea" placeholder="Describe the quality of work, cleanup, adherence to estimate, and overall experience..."></textarea>
          </div>

          <button type="submit" class="btn btn-primary" style="width: 100%; padding: 0.75rem;">Post Verified Review</button>
        </form>
      </div>
    </div>

    <!-- Complaint Modal Container -->
    <div id="complaint-modal" class="modal-overlay" style="display: none;">
      <div class="modal-dialog">
        <div class="modal-header">
          <h3 class="modal-title">File a Complaint / Report Problem</h3>
          <button class="modal-close" onclick="WorkdoneApp.closeModal('complaint-modal')">&times;</button>
        </div>
        <form onsubmit="handleComplaintSubmit(event, this)">
          <input type="hidden" name="bookingId" id="cm-booking-id">

          <div class="form-group">
            <label class="form-label">Issue Category *</label>
            <select name="category" required class="form-select">
              <option value="INCOMPLETE_WORK">Incomplete Work</option>
              <option value="SCOPE_DISPUTE">Scope or Price Dispute</option>
              <option value="SUSPECTED_FRAUD">Suspected Fraud or Misrepresentation</option>
              <option value="NO_SHOW">Professional Did Not Show Up</option>
              <option value="INAPPROPRIATE_CONDUCT">Inappropriate Conduct</option>
              <option value="OTHER">Other Issue</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">Describe the Problem in Detail *</label>
            <textarea name="description" required class="form-textarea" placeholder="Please provide specific dates, communications, and factual summary..."></textarea>
          </div>

          <button type="submit" class="btn btn-primary" style="width: 100%; background: #dc2626; border-color: #dc2626;">Submit Formal Complaint</button>
        </form>
      </div>
    </div>

    <script>
      function openReviewModal(bookingId) {
        document.getElementById('rm-booking-id').value = bookingId;
        WorkdoneApp.openModal('review-modal');
      }

      function openComplaintModal(bookingId) {
        document.getElementById('cm-booking-id').value = bookingId;
        WorkdoneApp.openModal('complaint-modal');
      }

      async function handleComplaintSubmit(e, form) {
        e.preventDefault();
        const body = Object.fromEntries(new FormData(form).entries());
        try {
          const res = await fetch('/api/complaints', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
          });
          const data = await res.json();
          if (!res.ok) {
            WorkdoneApp.showToast(data.error || 'Failed to file complaint.', 'error');
            return;
          }
          WorkdoneApp.showToast('Complaint submitted. Support is investigating.');
          WorkdoneApp.closeModal('complaint-modal');
          setTimeout(() => window.location.reload(), 1000);
        } catch {
          WorkdoneApp.showToast('Network error filing complaint.', 'error');
        }
      }
    </script>
  `;
}

function renderBookingsTab(
  allBookings: Booking[],
  pending: Booking[],
  active: Booking[],
  completed: Booking[],
  cancelled: Booking[]
): string {
  if (allBookings.length === 0) {
    return `
      <div style="text-align: center; padding: 3rem 1rem;">
        <div style="font-size: 3rem; margin-bottom: 1rem;">📋</div>
        <h3 style="font-size: 1.25rem; font-weight: 700; color: var(--primary); margin-bottom: 0.5rem;">No Bookings Yet</h3>
        <p style="color: var(--text-muted); font-size: 0.9rem; max-width: 440px; margin: 0 auto 1.5rem;">
          You haven't requested any home service appointments yet. Discover top-rated local carpenters, plumbers, electricians and more.
        </p>
        <a href="/professionals" class="btn btn-primary">Find a Professional</a>
      </div>
    `;
  }

  return `
    <div style="display: flex; flex-direction: column; gap: 2rem;">
      <!-- Summary metrics cards -->
      <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem;">
        <div style="background: var(--bg-page); border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 1rem;">
          <div style="font-size: 0.8rem; color: var(--text-muted); font-weight: 600;">Pending Requests</div>
          <div style="font-size: 1.5rem; font-weight: 800; color: #1d4ed8;">${pending.length}</div>
        </div>
        <div style="background: var(--bg-page); border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 1rem;">
          <div style="font-size: 0.8rem; color: var(--text-muted); font-weight: 600;">Active / In Progress</div>
          <div style="font-size: 1.5rem; font-weight: 800; color: #0d9488;">${active.length}</div>
        </div>
        <div style="background: var(--bg-page); border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 1rem;">
          <div style="font-size: 0.8rem; color: var(--text-muted); font-weight: 600;">Completed Jobs</div>
          <div style="font-size: 1.5rem; font-weight: 800; color: #15803d;">${completed.length}</div>
        </div>
        <div style="background: var(--bg-page); border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 1rem;">
          <div style="font-size: 0.8rem; color: var(--text-muted); font-weight: 600;">Total Bookings</div>
          <div style="font-size: 1.5rem; font-weight: 800; color: var(--primary);">${allBookings.length}</div>
        </div>
      </div>

      <!-- Bookings List -->
      <div style="display: flex; flex-direction: column; gap: 1.25rem;">
        ${allBookings.map((b) => renderBookingCardCustomer(b)).join('')}
      </div>
    </div>
  `;
}

function renderBookingCardCustomer(b: Booking): string {
  const estimates = b.estimates || [];
  const latestEstimate = estimates[0];

  return `
    <div style="border: 1px solid var(--border); border-radius: var(--radius-md); padding: 1.5rem; background: var(--bg-surface);">
      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.75rem; flex-wrap: wrap; gap: 0.5rem;">
        <div>
          <div style="display: flex; align-items: center; gap: 0.75rem;">
            <span style="font-size: 0.85rem; font-weight: 700; color: var(--text-muted);">${escapeHtml(b.bookingNumber)}</span>
            ${getStatusBadge(b.status)}
          </div>
          <h3 style="font-size: 1.15rem; font-weight: 700; color: var(--primary); margin-top: 0.25rem;">
            ${escapeHtml(b.serviceTitle)}
          </h3>
        </div>
        <div style="text-align: right;">
          <div style="font-size: 0.95rem; font-weight: 700; color: var(--primary);">
            Professional: ${escapeHtml(b.proProfile?.user?.name || 'Professional')}
          </div>
          <div style="font-size: 0.8rem; color: var(--text-muted);">
            ${escapeHtml(b.proProfile?.businessName || '')}
          </div>
        </div>
      </div>

      <p style="font-size: 0.9rem; color: var(--text-main); margin-bottom: 1rem; line-height: 1.5;">
        ${escapeHtml(b.description)}
      </p>

      <div style="display: flex; flex-wrap: wrap; gap: 1.5rem; font-size: 0.825rem; color: var(--text-muted); background: var(--bg-page); padding: 0.75rem 1rem; border-radius: var(--radius-sm); margin-bottom: 1rem;">
        <div>📍 <strong>Location:</strong> ${escapeHtml(b.approximateLocation)}, ${escapeHtml(b.city)}</div>
        <div>📅 <strong>Requested Date:</strong> ${b.requestedDate}</div>
        ${b.confirmedDate ? `<div>✅ <strong>Confirmed Date:</strong> ${b.confirmedDate}</div>` : ''}
        ${b.finalAmount ? `<div>💰 <strong>Agreed Total:</strong> $${b.finalAmount.toFixed(2)}</div>` : ''}
      </div>

      <!-- Reschedule Notice if proposed -->
      ${
        b.status === 'RESCHEDULE_PROPOSED'
          ? `
        <div style="background: #fffbeb; border: 1px solid #fde68a; border-radius: var(--radius-sm); padding: 0.85rem; margin-bottom: 1rem; font-size: 0.875rem; color: #92400e;">
          <strong>Reschedule Proposed by Professional:</strong> New Proposed Date: <strong>${b.rescheduledDate || 'Next available slot'}</strong>.
          ${b.rescheduleNotes ? `<br>Note: ${escapeHtml(b.rescheduleNotes)}` : ''}
          <div style="margin-top: 0.75rem; display: flex; gap: 0.5rem;">
            <button onclick="WorkdoneApp.updateStatus('${b.id}', 'CONFIRMED', 'Customer confirmed proposed schedule')" class="btn btn-secondary btn-sm">Accept New Date</button>
            <button onclick="WorkdoneApp.updateStatus('${b.id}', 'CANCELLED', 'Customer declined proposed schedule')" class="btn btn-outline btn-sm" style="color: #ef4444;">Decline &amp; Cancel</button>
          </div>
        </div>
      `
          : ''
      }

      <!-- Estimate Box if issued -->
      ${
        latestEstimate
          ? `
        <div style="border: 1px solid var(--border); background: #f8fafc; border-radius: var(--radius-sm); padding: 1rem; margin-bottom: 1rem;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
            <strong style="color: var(--primary); font-size: 0.9rem;">Itemized Estimate #${escapeHtml(latestEstimate.estimateNumber)}</strong>
            <span class="badge ${latestEstimate.status === 'ACCEPTED' ? 'badge-verified' : 'badge-pending'}">${latestEstimate.status}</span>
          </div>
          <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.5rem; font-size: 0.825rem; margin-bottom: 0.5rem;">
            <div>Labour: $${latestEstimate.labourCost.toFixed(2)}</div>
            <div>Materials: $${latestEstimate.materialCost.toFixed(2)}</div>
            <div>Additional: $${latestEstimate.additionalCharges.toFixed(2)}</div>
            <div><strong style="color: var(--secondary);">Total: $${latestEstimate.totalCost.toFixed(2)}</strong></div>
          </div>
          <div style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 0.5rem;">
            <strong>Scope Included:</strong> ${escapeHtml(latestEstimate.workIncluded)}
          </div>
          ${
            latestEstimate.status === 'SENT'
              ? `
            <div style="display: flex; gap: 0.5rem; margin-top: 0.75rem;">
              <button onclick="WorkdoneApp.acceptEstimate('${latestEstimate.id}')" class="btn btn-secondary btn-sm">Accept Estimate &amp; Lock Scope</button>
            </div>
          `
              : ''
          }
        </div>
      `
          : ''
      }

      <!-- Actions Row -->
      <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--border); padding-top: 0.85rem;">
        <div style="display: flex; gap: 0.5rem;">
          ${
            b.status === 'COMPLETED' && !b.review
              ? `<button onclick="openReviewModal('${b.id}')" class="btn btn-primary btn-sm">⭐ Leave a Review</button>`
              : ''
          }
          ${
            b.status === 'COMPLETED' && b.review
              ? `<span style="font-size: 0.825rem; color: #059669; font-weight: 600;">✓ Review Posted (${b.review.overallRating}★)</span>`
              : ''
          }
          <button onclick="openComplaintModal('${b.id}')" class="btn btn-outline btn-sm" style="color: #64748b;">Report Problem</button>
        </div>

        <div>
          ${
            b.status === 'REQUESTED' || b.status === 'ACCEPTED' || b.status === 'CONFIRMED'
              ? `<button onclick="if(confirm('Cancel this booking request?')) WorkdoneApp.updateStatus('${b.id}', 'CANCELLED', 'Cancelled by customer')" class="btn btn-outline btn-sm" style="color: #ef4444; border-color: #fca5a5;">Cancel Booking</button>`
              : ''
          }
        </div>
      </div>
    </div>
  `;
}

function renderSavedProsTab(savedPros: ProfessionalProfile[]): string {
  if (savedPros.length === 0) {
    return `
      <div style="text-align: center; padding: 3rem 1rem;">
        <div style="font-size: 2.5rem; margin-bottom: 0.75rem;">♥</div>
        <h3 style="font-size: 1.15rem; font-weight: 700; color: var(--primary); margin-bottom: 0.5rem;">No Saved Professionals</h3>
        <p style="color: var(--text-muted); font-size: 0.875rem; margin-bottom: 1.5rem;">Click the heart icon on any professional's card or profile to bookmark them for future projects.</p>
        <a href="/professionals" class="btn btn-primary btn-sm">Browse Professionals</a>
      </div>
    `;
  }

  return `
    <div>
      <h2 style="font-size: 1.25rem; font-weight: 800; color: var(--primary); margin-bottom: 1.25rem;">Saved Professionals (${savedPros.length})</h2>
      <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.25rem;">
        ${savedPros
          .map(
            (p) => `
          <div style="border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 1.25rem; background: var(--bg-surface); display: flex; flex-direction: column; justify-content: space-between;">
            <div>
              <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem;">
                <h4 style="font-size: 1.05rem; font-weight: 700; color: var(--primary);">${escapeHtml(p.user?.name || '')}</h4>
                <span style="color: #f59e0b; font-weight: 700; font-size: 0.85rem;">★ ${p.averageRating > 0 ? p.averageRating.toFixed(1) : 'New'}</span>
              </div>
              <div style="font-size: 0.825rem; color: var(--text-muted); margin-bottom: 0.5rem;">${escapeHtml(p.businessName || 'Specialist')} &bull; ${escapeHtml(p.city)}</div>
              <p style="font-size: 0.85rem; color: var(--text-muted); line-height: 1.45; margin-bottom: 1rem; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">${escapeHtml(p.bio)}</p>
            </div>
            <div style="display: flex; gap: 0.5rem;">
              <a href="/professionals/${p.id}" class="btn btn-outline btn-sm" style="flex: 1;">View Profile</a>
              <a href="/professionals/${p.id}#book" class="btn btn-primary btn-sm" style="flex: 1;">Book</a>
            </div>
          </div>
        `
          )
          .join('')}
      </div>
    </div>
  `;
}

function renderNotificationsTab(notifications: Notification[]): string {
  if (notifications.length === 0) {
    return `<div style="text-align: center; padding: 3rem 1rem; color: var(--text-muted);">No notifications yet.</div>`;
  }

  return `
    <div>
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem;">
        <h2 style="font-size: 1.25rem; font-weight: 800; color: var(--primary);">Notifications</h2>
        <button onclick="fetch('/api/notifications/read-all', {method: 'POST'}).then(() => window.location.reload())" class="btn btn-outline btn-sm">Mark All as Read</button>
      </div>

      <div style="display: flex; flex-direction: column; gap: 0.75rem;">
        ${notifications
          .map(
            (n) => `
          <div onclick="WorkdoneApp.markNotification('${n.id}', this)" style="padding: 1rem; border-radius: var(--radius-sm); border: 1px solid var(--border); background: ${n.isRead ? 'var(--bg-surface)' : '#f0fdfa'}; cursor: pointer;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.25rem;">
              <strong style="font-size: 0.95rem; color: var(--primary);">${escapeHtml(n.title)}</strong>
              <span style="font-size: 0.75rem; color: var(--text-muted);">${n.createdAt.substring(0, 10)}</span>
            </div>
            <p style="font-size: 0.875rem; color: var(--text-main); line-height: 1.45;">${escapeHtml(n.message)}</p>
            ${n.linkUrl ? `<a href="${n.linkUrl}" style="font-size: 0.8rem; color: var(--secondary); font-weight: 600; margin-top: 0.35rem; display: inline-block;">View Details &rarr;</a>` : ''}
          </div>
        `
          )
          .join('')}
      </div>
    </div>
  `;
}

function renderSettingsTab(user: User, profile: CustomerProfile | null): string {
  return `
    <div>
      <h2 style="font-size: 1.25rem; font-weight: 800; color: var(--primary); margin-bottom: 1.25rem;">Customer Account Settings</h2>
      
      <form onsubmit="handleProfileUpdate(event, this)">
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
          <div class="form-group">
            <label class="form-label">Full Name</label>
            <input type="text" name="name" value="${escapeHtml(user.name)}" required class="form-input">
          </div>
          <div class="form-group">
            <label class="form-label">Email Address</label>
            <input type="email" value="${escapeHtml(user.email)}" disabled class="form-input" style="background: #f1f5f9;">
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
          <div class="form-group">
            <label class="form-label">Phone Number</label>
            <input type="text" name="phone" value="${escapeHtml(user.phone || '')}" class="form-input" placeholder="+1-555-0100">
          </div>
          <div class="form-group">
            <label class="form-label">Primary City</label>
            <input type="text" name="city" value="${escapeHtml(profile?.city || '')}" class="form-input" placeholder="e.g. Austin">
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
          <div class="form-group">
            <label class="form-label">Locality / Neighborhood</label>
            <input type="text" name="locality" value="${escapeHtml(profile?.locality || '')}" class="form-input" placeholder="e.g. Downtown">
          </div>
          <div class="form-group">
            <label class="form-label">PIN / Postal Code</label>
            <input type="text" name="pinCode" value="${escapeHtml(profile?.pinCode || '')}" class="form-input" placeholder="e.g. 78701">
          </div>
        </div>

        <button type="submit" class="btn btn-primary" style="margin-top: 1rem;">Save Profile Settings</button>
      </form>

      <script>
        async function handleProfileUpdate(e, form) {
          e.preventDefault();
          const body = Object.fromEntries(new FormData(form).entries());
          try {
            const res = await fetch('/api/customer/profile', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(body)
            });
            const data = await res.json();
            if (!res.ok) {
              WorkdoneApp.showToast(data.error || 'Failed to update profile.', 'error');
              return;
            }
            WorkdoneApp.showToast('Profile settings saved successfully.');
          } catch {
            WorkdoneApp.showToast('Network error updating profile.', 'error');
          }
        }
      </script>
    </div>
  `;
}

function getStatusBadge(status: string): string {
  switch (status) {
    case 'REQUESTED':
      return `<span class="badge badge-status-req">Pending Professional Review</span>`;
    case 'ACCEPTED':
      return `<span class="badge badge-status-success">Accepted</span>`;
    case 'CONFIRMED':
      return `<span class="badge badge-status-success">Confirmed</span>`;
    case 'RESCHEDULE_PROPOSED':
      return `<span class="badge badge-pending">Reschedule Proposed</span>`;
    case 'IN_PROGRESS':
      return `<span class="badge" style="background: #fef3c7; color: #92400e;">In Progress</span>`;
    case 'COMPLETED':
      return `<span class="badge badge-verified">Completed</span>`;
    case 'CANCELLED':
      return `<span class="badge" style="background: #f1f5f9; color: #64748b;">Cancelled</span>`;
    case 'DISPUTED':
      return `<span class="badge" style="background: #fee2e2; color: #b91c1c;">Disputed</span>`;
    default:
      return `<span class="badge">${status}</span>`;
  }
}

function escapeHtml(str: string): string {
  if (typeof str !== 'string') return '';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}
