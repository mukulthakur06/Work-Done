// Workdone Professional Dashboard View Implementation
import type { Booking, ProfessionalProfile, Notification, User } from '../types/index.ts';

export interface ProDashProps {
  user: User;
  proProfile: ProfessionalProfile;
  bookings: Booking[];
  notifications: Notification[];
  activeTab: string;
}

export function renderProDashView(props: ProDashProps): string {
  const { user, proProfile, bookings, notifications, activeTab } = props;

  const pendingRequests = bookings.filter((b) => b.status === 'REQUESTED');
  const activeJobs = bookings.filter((b) => b.status === 'ACCEPTED' || b.status === 'CONFIRMED' || b.status === 'IN_PROGRESS');
  const completedJobs = bookings.filter((b) => b.status === 'COMPLETED');

  // Compute profile completion percentage
  let completedSteps = 0;
  const totalSteps = 4;
  if (user.avatarUrl || user.name) completedSteps++;
  if (proProfile.services && proProfile.services.length > 0) completedSteps++;
  if (proProfile.portfolios && proProfile.portfolios.length > 0) completedSteps++;
  if (proProfile.workingHours && proProfile.availabilityStatus) completedSteps++;
  const completionPercentage = Math.round((completedSteps / totalSteps) * 100);

  return `
    <div style="background: var(--bg-surface); border-bottom: 1px solid var(--border); padding: 2rem 0;">
      <div class="container">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
          <div>
            <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.25rem;">
              <h1 style="font-size: 1.75rem; font-weight: 800; color: var(--primary);">
                Professional Workspace
              </h1>
              ${getVerificationBadge(proProfile.verificationStatus)}
            </div>
            <p style="color: var(--text-muted); font-size: 0.9rem;">
              ${escapeHtml(proProfile.businessName || user.name)} &bull; ${escapeHtml(proProfile.city)} &bull;
              Status: <strong style="color: ${proProfile.availabilityStatus === 'AVAILABLE' ? '#059669' : '#d97706'};">${proProfile.availabilityStatus}</strong>
            </p>
          </div>
          <div style="display: flex; gap: 0.75rem;">
            <a href="/professionals/${proProfile.id}" class="btn btn-outline btn-sm" target="_blank">View Public Profile ↗</a>
            <button onclick="WorkdoneApp.openModal('pro-avail-modal')" class="btn btn-secondary btn-sm">Update Availability</button>
          </div>
        </div>
      </div>
    </div>

    <div class="container dashboard-layout">
      <!-- Sidebar Navigation -->
      <aside class="dash-sidebar">
        <!-- Profile Completion Card -->
        <div style="background: var(--bg-page); border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 1rem; margin-bottom: 1.25rem;">
          <div style="display: flex; justify-content: space-between; font-size: 0.85rem; font-weight: 700; color: var(--primary); margin-bottom: 0.35rem;">
            <span>Profile Completion</span>
            <span>${completionPercentage}%</span>
          </div>
          <div style="width: 100%; height: 6px; background: #e2e8f0; border-radius: 9999px; overflow: hidden; margin-bottom: 0.75rem;">
            <div style="width: ${completionPercentage}%; height: 100%; background: var(--secondary);"></div>
          </div>
          <div style="font-size: 0.75rem; color: var(--text-muted); line-height: 1.4;">
            ${completionPercentage === 100 ? '✓ Your profile is 100% complete!' : 'Add portfolios & services to increase booking requests.'}
          </div>
        </div>

        <ul class="dash-nav">
          <li>
            <a href="/dashboard/pro?tab=requests" class="dash-nav-item ${activeTab === 'requests' ? 'active' : ''}">
              📥 Booking Requests (${pendingRequests.length})
            </a>
          </li>
          <li>
            <a href="/dashboard/pro?tab=jobs" class="dash-nav-item ${activeTab === 'jobs' ? 'active' : ''}">
              🔨 Active Jobs (${activeJobs.length})
            </a>
          </li>
          <li>
            <a href="/dashboard/pro?tab=portfolio" class="dash-nav-item ${activeTab === 'portfolio' ? 'active' : ''}">
              🖼️ Work Portfolio (${proProfile.portfolios?.length || 0})
            </a>
          </li>
          <li>
            <a href="/dashboard/pro?tab=reviews" class="dash-nav-item ${activeTab === 'reviews' ? 'active' : ''}">
              ⭐ Customer Reviews (${proProfile.reviews?.length || 0})
            </a>
          </li>
          <li>
            <a href="/dashboard/pro?tab=notifications" class="dash-nav-item ${activeTab === 'notifications' ? 'active' : ''}">
              🔔 Notifications (${notifications.filter((n) => !n.isRead).length})
            </a>
          </li>
        </ul>
      </aside>

      <!-- Main Dashboard Panel -->
      <main class="dash-content">
        ${
          activeTab === 'jobs'
            ? renderActiveJobsTab(activeJobs, completedJobs)
            : activeTab === 'portfolio'
            ? renderPortfolioTab(proProfile)
            : activeTab === 'reviews'
            ? renderReviewsTab(proProfile)
            : activeTab === 'notifications'
            ? renderNotificationsTab(notifications)
            : renderRequestsTab(bookings, pendingRequests)
        }
      </main>
    </div>

    <!-- Modal: Create Estimate -->
    <div id="estimate-modal" class="modal-overlay" style="display: none;">
      <div class="modal-dialog">
        <div class="modal-header">
          <h3 class="modal-title">Create Itemized Estimate</h3>
          <button class="modal-close" onclick="WorkdoneApp.closeModal('estimate-modal')">&times;</button>
        </div>
        <form onsubmit="handleEstimateSubmit(event, this)">
          <input type="hidden" name="bookingId" id="em-booking-id">

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
            <div class="form-group">
              <label class="form-label">Labour Cost ($) *</label>
              <input type="number" step="0.01" name="labourCost" id="em-labour" required class="form-input" oninput="calculateEstimateTotal()">
            </div>
            <div class="form-group">
              <label class="form-label">Material Cost ($)</label>
              <input type="number" step="0.01" name="materialCost" id="em-material" class="form-input" value="0" oninput="calculateEstimateTotal()">
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
            <div class="form-group">
              <label class="form-label">Additional / Permit Charges ($)</label>
              <input type="number" step="0.01" name="additionalCharges" id="em-addl" class="form-input" value="0" oninput="calculateEstimateTotal()">
            </div>
            <div class="form-group">
              <label class="form-label">Total Estimate ($)</label>
              <input type="text" id="em-total" readonly class="form-input" style="background: #f1f5f9; font-weight: 700; color: var(--secondary);" value="$0.00">
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Estimated Duration *</label>
            <input type="text" name="estimatedDuration" required class="form-input" placeholder="e.g. 3 days, 1 week, 4 hours">
          </div>

          <div class="form-group">
            <label class="form-label">Work Included (Agreed Scope) *</label>
            <textarea name="workIncluded" required class="form-textarea" placeholder="Detail all tasks, materials provided, prep work, and cleanup..."></textarea>
          </div>

          <div class="form-group">
            <label class="form-label">Work Excluded (Out of Scope)</label>
            <textarea name="workExcluded" class="form-textarea" placeholder="Specify any customer-provided items, painting, electrical hookup, etc."></textarea>
          </div>

          <div class="form-group">
            <label class="form-label">Payment Terms</label>
            <input type="text" name="paymentTerms" class="form-input" value="50% deposit, 50% upon satisfactory completion">
          </div>

          <button type="submit" class="btn btn-primary" style="width: 100%; padding: 0.75rem;">Issue Formal Estimate</button>
        </form>
      </div>
    </div>

    <!-- Modal: Propose Reschedule -->
    <div id="reschedule-modal" class="modal-overlay" style="display: none;">
      <div class="modal-dialog" style="max-width: 440px;">
        <div class="modal-header">
          <h3 class="modal-title">Propose Reschedule</h3>
          <button class="modal-close" onclick="WorkdoneApp.closeModal('reschedule-modal')">&times;</button>
        </div>
        <form onsubmit="handleRescheduleSubmit(event, this)">
          <input type="hidden" name="bookingId" id="rm-b-id">

          <div class="form-group">
            <label class="form-label">Proposed New Date *</label>
            <input type="date" name="rescheduledDate" required class="form-input">
          </div>

          <div class="form-group">
            <label class="form-label">Note to Customer *</label>
            <textarea name="note" required class="form-textarea" placeholder="Explain the reason for proposing an alternate time slot..."></textarea>
          </div>

          <button type="submit" class="btn btn-primary" style="width: 100%;">Send Reschedule Proposal</button>
        </form>
      </div>
    </div>

    <!-- Modal: Update Availability -->
    <div id="pro-avail-modal" class="modal-overlay" style="display: none;">
      <div class="modal-dialog" style="max-width: 460px;">
        <div class="modal-header">
          <h3 class="modal-title">Manage Availability Status</h3>
          <button class="modal-close" onclick="WorkdoneApp.closeModal('pro-avail-modal')">&times;</button>
        </div>
        <form onsubmit="handleAvailabilitySubmit(event, this)">
          <div class="form-group">
            <label class="form-label">Current Status</label>
            <select name="status" class="form-select">
              <option value="AVAILABLE" ${proProfile.availabilityStatus === 'AVAILABLE' ? 'selected' : ''}>Available (Accepting Requests)</option>
              <option value="BUSY" ${proProfile.availabilityStatus === 'BUSY' ? 'selected' : ''}>Busy (Booked for Current Week)</option>
              <option value="TEMPORARILY_UNAVAILABLE" ${proProfile.availabilityStatus === 'TEMPORARILY_UNAVAILABLE' ? 'selected' : ''}>Temporarily Unavailable (On Leave)</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">Standard Working Hours</label>
            <input type="text" name="workingHours" value="${escapeHtml(proProfile.workingHours || '9:00 AM - 6:00 PM, Mon-Sat')}" class="form-input">
          </div>

          <button type="submit" class="btn btn-primary" style="width: 100%;">Save Availability</button>
        </form>
      </div>
    </div>

    <script>
      function openEstimateModal(bookingId) {
        document.getElementById('em-booking-id').value = bookingId;
        WorkdoneApp.openModal('estimate-modal');
      }

      function openRescheduleModal(bookingId) {
        document.getElementById('rm-b-id').value = bookingId;
        WorkdoneApp.openModal('reschedule-modal');
      }

      function calculateEstimateTotal() {
        const labour = parseFloat(document.getElementById('em-labour').value) || 0;
        const mat = parseFloat(document.getElementById('em-material').value) || 0;
        const addl = parseFloat(document.getElementById('em-addl').value) || 0;
        const total = labour + mat + addl;
        document.getElementById('em-total').value = '$' + total.toFixed(2);
      }

      async function handleEstimateSubmit(e, form) {
        e.preventDefault();
        const body = Object.fromEntries(new FormData(form).entries());
        try {
          const res = await fetch('/api/estimates', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
          });
          const data = await res.json();
          if (!res.ok) {
            WorkdoneApp.showToast(data.error || 'Failed to issue estimate.', 'error');
            return;
          }
          WorkdoneApp.showToast('Estimate issued and sent to customer.');
          WorkdoneApp.closeModal('estimate-modal');
          setTimeout(() => window.location.reload(), 1000);
        } catch {
          WorkdoneApp.showToast('Network error issuing estimate.', 'error');
        }
      }

      async function handleRescheduleSubmit(e, form) {
        e.preventDefault();
        const { bookingId, rescheduledDate, note } = Object.fromEntries(new FormData(form).entries());
        try {
          const res = await fetch('/api/bookings/' + bookingId + '/status', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'RESCHEDULE_PROPOSED', rescheduledDate, note })
          });
          const data = await res.json();
          if (!res.ok) {
            WorkdoneApp.showToast(data.error || 'Failed to propose reschedule.', 'error');
            return;
          }
          WorkdoneApp.showToast('Reschedule proposal sent to customer.');
          WorkdoneApp.closeModal('reschedule-modal');
          setTimeout(() => window.location.reload(), 1000);
        } catch {
          WorkdoneApp.showToast('Network error.', 'error');
        }
      }

      async function handleAvailabilitySubmit(e, form) {
        e.preventDefault();
        const body = Object.fromEntries(new FormData(form).entries());
        try {
          const res = await fetch('/api/professionals/availability', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
          });
          const data = await res.json();
          if (!res.ok) {
            WorkdoneApp.showToast(data.error || 'Failed to update availability.', 'error');
            return;
          }
          WorkdoneApp.showToast('Availability status updated.');
          WorkdoneApp.closeModal('pro-avail-modal');
          setTimeout(() => window.location.reload(), 800);
        } catch {
          WorkdoneApp.showToast('Network error.', 'error');
        }
      }
    </script>
  `;
}

function renderRequestsTab(allBookings: Booking[], pending: Booking[]): string {
  if (pending.length === 0) {
    return `
      <div>
        <h2 style="font-size: 1.25rem; font-weight: 800; color: var(--primary); margin-bottom: 1.25rem;">New Booking Requests (0)</h2>
        <div style="text-align: center; padding: 3rem 1rem; color: var(--text-muted); background: var(--bg-page); border-radius: var(--radius-sm); border: 1px dashed var(--border);">
          No pending booking requests at this time.
        </div>
      </div>
    `;
  }

  return `
    <div>
      <h2 style="font-size: 1.25rem; font-weight: 800; color: var(--primary); margin-bottom: 1.25rem;">Pending Booking Requests (${pending.length})</h2>
      <div style="display: flex; flex-direction: column; gap: 1.25rem;">
        ${pending
          .map(
            (b) => `
          <div style="border: 1px solid var(--border); border-radius: var(--radius-md); padding: 1.5rem; background: var(--bg-surface);">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.75rem;">
              <div>
                <span style="font-size: 0.8rem; font-weight: 700; color: var(--text-muted);">${b.bookingNumber}</span>
                <h3 style="font-size: 1.15rem; font-weight: 700; color: var(--primary); margin-top: 0.2rem;">${escapeHtml(b.serviceTitle)}</h3>
              </div>
              <div style="text-align: right;">
                <div style="font-size: 0.95rem; font-weight: 700; color: var(--primary);">${escapeHtml(b.customer?.user?.name || 'Customer')}</div>
                <div style="font-size: 0.8rem; color: var(--text-muted);">Requested: ${b.requestedDate}</div>
              </div>
            </div>

            <p style="font-size: 0.9rem; color: var(--text-main); line-height: 1.5; margin-bottom: 1rem;">
              ${escapeHtml(b.description)}
            </p>

            <div style="background: var(--bg-page); padding: 0.75rem 1rem; border-radius: var(--radius-sm); font-size: 0.825rem; color: var(--text-muted); margin-bottom: 1rem;">
              📍 <strong>Location:</strong> ${escapeHtml(b.approximateLocation)}, ${escapeHtml(b.city)}
              ${b.budgetRangeMax ? ` &bull; <strong>Customer Budget:</strong> Up to $${b.budgetRangeMax}` : ''}
            </div>

            <div style="display: flex; gap: 0.75rem; border-top: 1px solid var(--border); padding-top: 1rem;">
              <button onclick="WorkdoneApp.updateStatus('${b.id}', 'ACCEPTED', 'Professional accepted booking')" class="btn btn-secondary btn-sm">Accept Request</button>
              <button onclick="openRescheduleModal('${b.id}')" class="btn btn-outline btn-sm">Propose New Date</button>
              <button onclick="if(confirm('Decline this request?')) WorkdoneApp.updateStatus('${b.id}', 'REJECTED', 'Professional unavailable')" class="btn btn-outline btn-sm" style="color: #ef4444; border-color: #fca5a5;">Decline</button>
            </div>
          </div>
        `
          )
          .join('')}
      </div>
    </div>
  `;
}

function renderActiveJobsTab(active: Booking[], completed: Booking[]): string {
  return `
    <div>
      <h2 style="font-size: 1.25rem; font-weight: 800; color: var(--primary); margin-bottom: 1.25rem;">Active &amp; Confirmed Jobs (${active.length})</h2>
      
      ${
        active.length === 0
          ? `<p style="font-size: 0.9rem; color: var(--text-muted); margin-bottom: 2rem;">No active jobs in progress currently.</p>`
          : `
        <div style="display: flex; flex-direction: column; gap: 1.25rem; margin-bottom: 2.5rem;">
          ${active
            .map(
              (b) => `
            <div style="border: 1px solid var(--border); border-radius: var(--radius-md); padding: 1.5rem; background: var(--bg-surface);">
              <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.75rem;">
                <div>
                  <div style="display: flex; align-items: center; gap: 0.5rem;">
                    <span style="font-size: 0.8rem; font-weight: 700; color: var(--text-muted);">${b.bookingNumber}</span>
                    <span class="badge badge-status-success">${b.status}</span>
                  </div>
                  <h3 style="font-size: 1.15rem; font-weight: 700; color: var(--primary); margin-top: 0.25rem;">${escapeHtml(b.serviceTitle)}</h3>
                </div>
                <div style="text-align: right; font-size: 0.85rem;">
                  <div>Customer: <strong>${escapeHtml(b.customer?.user?.name || '')}</strong></div>
                  <div>Phone: ${escapeHtml(b.customer?.user?.phone || 'In-app')}</div>
                </div>
              </div>

              <p style="font-size: 0.9rem; color: var(--text-main); margin-bottom: 1rem;">${escapeHtml(b.description)}</p>

              <!-- Actions -->
              <div style="display: flex; gap: 0.75rem; border-top: 1px solid var(--border); padding-top: 1rem;">
                <button onclick="openEstimateModal('${b.id}')" class="btn btn-outline btn-sm">📝 Create/Update Estimate</button>
                ${
                  b.status !== 'IN_PROGRESS'
                    ? `<button onclick="WorkdoneApp.updateStatus('${b.id}', 'IN_PROGRESS', 'Work started')" class="btn btn-secondary btn-sm">Start Work</button>`
                    : `<button onclick="WorkdoneApp.updateStatus('${b.id}', 'COMPLETED', 'Work finished and delivered')" class="btn btn-primary btn-sm">Mark as Completed</button>`
                }
              </div>
            </div>
          `
            )
            .join('')}
        </div>
      `
      }

      <!-- Completed Jobs Summary -->
      <h3 style="font-size: 1.1rem; font-weight: 700; color: var(--primary); margin-bottom: 1rem;">Completed Job History (${completed.length})</h3>
      <div style="display: flex; flex-direction: column; gap: 0.75rem;">
        ${completed
          .map(
            (b) => `
          <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.85rem 1rem; background: var(--bg-page); border: 1px solid var(--border); border-radius: var(--radius-sm); font-size: 0.85rem;">
            <div>
              <strong>${escapeHtml(b.serviceTitle)}</strong> (${b.bookingNumber}) &bull; ${escapeHtml(b.customer?.user?.name || '')}
            </div>
            <div style="display: flex; align-items: center; gap: 1rem;">
              <span>${b.finalAmount ? `$${b.finalAmount.toFixed(2)}` : 'Completed'}</span>
              <span class="badge badge-verified">Completed</span>
            </div>
          </div>
        `
          )
          .join('')}
      </div>
    </div>
  `;
}

function renderPortfolioTab(pro: ProfessionalProfile): string {
  const portfolios = pro.portfolios || [];
  return `
    <div>
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
        <div>
          <h2 style="font-size: 1.25rem; font-weight: 800; color: var(--primary);">Portfolio Management</h2>
          <p style="font-size: 0.85rem; color: var(--text-muted);">Showcase your craft to prospective customers.</p>
        </div>
        <button onclick="WorkdoneApp.openModal('add-portfolio-modal')" class="btn btn-primary btn-sm">+ Add Project</button>
      </div>

      <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.25rem;">
        ${portfolios
          .map(
            (p) => `
          <div style="border: 1px solid var(--border); border-radius: var(--radius-sm); overflow: hidden; background: var(--bg-surface);">
            ${
              p.media && p.media.length > 0
                ? `<img src="${p.media[0].mediaUrl}" alt="${escapeHtml(p.title)}" style="width: 100%; height: 160px; object-fit: cover;">`
                : `<div style="height: 160px; background: #e2e8f0; display: flex; align-items: center; justify-content: center; color: #94a3b8;">No Image</div>`
            }
            <div style="padding: 1rem;">
              <h4 style="font-size: 1rem; font-weight: 700; color: var(--primary); margin-bottom: 0.25rem;">${escapeHtml(p.title)}</h4>
              <div style="font-size: 0.75rem; color: var(--secondary); font-weight: 600; margin-bottom: 0.5rem;">${escapeHtml(p.categoryName)}</div>
              <p style="font-size: 0.825rem; color: var(--text-muted); line-height: 1.45; margin-bottom: 0.75rem;">${escapeHtml(p.description)}</p>
              <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--border); padding-top: 0.5rem; font-size: 0.8rem;">
                <span>${p.projectCost ? `Approx: $${p.projectCost}` : ''}</span>
                <button onclick="handleDeleteProject('${p.id}')" style="background: none; border: none; color: #ef4444; cursor: pointer; text-decoration: underline;">Delete</button>
              </div>
            </div>
          </div>
        `
          )
          .join('')}
      </div>
    </div>

    <!-- Modal: Add Portfolio Project -->
    <div id="add-portfolio-modal" class="modal-overlay" style="display: none;">
      <div class="modal-dialog">
        <div class="modal-header">
          <h3 class="modal-title">Add Portfolio Project</h3>
          <button class="modal-close" onclick="WorkdoneApp.closeModal('add-portfolio-modal')">&times;</button>
        </div>
        <form onsubmit="handleAddProjectSubmit(event, this)">
          <div class="form-group">
            <label class="form-label">Project Title *</label>
            <input type="text" name="title" required class="form-input" placeholder="e.g. Custom Live-Edge Dining Table">
          </div>
          <div class="form-group">
            <label class="form-label">Trade / Category Name</label>
            <input type="text" name="categoryName" class="form-input" value="Custom Woodwork">
          </div>
          <div class="form-group">
            <label class="form-label">Project Description *</label>
            <textarea name="description" required class="form-textarea" placeholder="Describe materials used, challenges solved, craftsmanship methods..."></textarea>
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
            <div class="form-group">
              <label class="form-label">Approximate Cost ($)</label>
              <input type="number" name="projectCost" class="form-input" placeholder="e.g. 2500">
            </div>
            <div class="form-group">
              <label class="form-label">Completion Date</label>
              <input type="date" name="completionDate" class="form-input">
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Project Photo URL</label>
            <input type="url" name="mediaUrl" class="form-input" placeholder="https://images.unsplash.com/photo-...">
          </div>
          <button type="submit" class="btn btn-primary" style="width: 100%;">Publish to Portfolio</button>
        </form>
      </div>
    </div>

    <script>
      async function handleAddProjectSubmit(e, form) {
        e.preventDefault();
        const data = Object.fromEntries(new FormData(form).entries());
        const body = {
          title: data.title,
          categoryName: data.categoryName,
          description: data.description,
          projectCost: data.projectCost ? parseFloat(data.projectCost) : undefined,
          completionDate: data.completionDate,
          mediaUrls: data.mediaUrl ? [data.mediaUrl] : []
        };
        try {
          const res = await fetch('/api/professionals/portfolio', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
          });
          const resData = await res.json();
          if (!res.ok) {
            WorkdoneApp.showToast(resData.error || 'Failed to add project.', 'error');
            return;
          }
          WorkdoneApp.showToast('Project added to portfolio!');
          WorkdoneApp.closeModal('add-portfolio-modal');
          setTimeout(() => window.location.reload(), 800);
        } catch {
          WorkdoneApp.showToast('Network error.', 'error');
        }
      }

      async function handleDeleteProject(projId) {
        if (!confirm('Are you sure you want to delete this portfolio project?')) return;
        try {
          const res = await fetch('/api/professionals/portfolio/' + projId, { method: 'DELETE' });
          if (!res.ok) {
            WorkdoneApp.showToast('Failed to delete project.', 'error');
            return;
          }
          WorkdoneApp.showToast('Project removed.');
          setTimeout(() => window.location.reload(), 800);
        } catch {
          WorkdoneApp.showToast('Network error.', 'error');
        }
      }
    </script>
  `;
}

function renderReviewsTab(pro: ProfessionalProfile): string {
  const reviews = pro.reviews || [];
  return `
    <div>
      <h2 style="font-size: 1.25rem; font-weight: 800; color: var(--primary); margin-bottom: 0.5rem;">
        Customer Reviews &amp; Feedback (${reviews.length})
      </h2>
      <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 1.5rem;">
        Maintain an active professional reputation by responding politely to all customer reviews.
      </p>

      ${
        reviews.length === 0
          ? `<p style="font-size: 0.9rem; color: var(--text-muted);">No reviews received yet.</p>`
          : `
        <div style="display: flex; flex-direction: column; gap: 1.25rem;">
          ${reviews
            .map(
              (r) => `
            <div style="border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 1.25rem; background: var(--bg-surface);">
              <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem;">
                <div>
                  <strong>${escapeHtml(r.customerName || 'Homeowner')}</strong>
                  <div style="font-size: 0.75rem; color: var(--text-muted);">${r.createdAt.substring(0, 10)}</div>
                </div>
                <span style="color: #f59e0b; font-weight: 700;">${'★'.repeat(r.overallRating)} (${r.overallRating}/5)</span>
              </div>
              <p style="font-size: 0.9rem; color: var(--text-main); margin-bottom: 0.75rem;">${escapeHtml(r.comment)}</p>
              
              ${
                r.proResponse
                  ? `
                <div style="background: #f0fdfa; border-left: 3px solid var(--secondary); padding: 0.75rem; border-radius: 4px; font-size: 0.85rem; margin-top: 0.5rem;">
                  <strong>Your Response:</strong> ${escapeHtml(r.proResponse)}
                </div>
              `
                  : `
                <form onsubmit="handleReviewResponse(event, this, '${r.id}')" style="margin-top: 0.75rem; display: flex; gap: 0.5rem;">
                  <input type="text" name="response" required class="form-input" placeholder="Type a professional public response..." style="font-size: 0.85rem; padding: 0.4rem 0.65rem;">
                  <button type="submit" class="btn btn-secondary btn-sm">Respond</button>
                </form>
              `
              }
            </div>
          `
            )
            .join('')}
        </div>
      `
      }
    </div>

    <script>
      async function handleReviewResponse(e, form, reviewId) {
        e.preventDefault();
        const responseText = form.querySelector('input[name="response"]').value;
        try {
          const res = await fetch('/api/reviews/' + reviewId + '/respond', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ response: responseText })
          });
          const data = await res.json();
          if (!res.ok) {
            WorkdoneApp.showToast(data.error || 'Failed to post response.', 'error');
            return;
          }
          WorkdoneApp.showToast('Response posted successfully.');
          setTimeout(() => window.location.reload(), 800);
        } catch {
          WorkdoneApp.showToast('Network error.', 'error');
        }
      }
    </script>
  `;
}

function renderNotificationsTab(notifications: Notification[]): string {
  return `
    <div>
      <h2 style="font-size: 1.25rem; font-weight: 800; color: var(--primary); margin-bottom: 1.25rem;">Notifications</h2>
      <div style="display: flex; flex-direction: column; gap: 0.75rem;">
        ${notifications
          .map(
            (n) => `
          <div style="padding: 1rem; border-radius: var(--radius-sm); border: 1px solid var(--border); background: ${n.isRead ? 'var(--bg-surface)' : '#f0fdfa'};">
            <div style="display: flex; justify-content: space-between; margin-bottom: 0.25rem;">
              <strong style="font-size: 0.95rem; color: var(--primary);">${escapeHtml(n.title)}</strong>
              <span style="font-size: 0.75rem; color: var(--text-muted);">${n.createdAt.substring(0, 10)}</span>
            </div>
            <p style="font-size: 0.875rem; color: var(--text-main);">${escapeHtml(n.message)}</p>
          </div>
        `
          )
          .join('')}
      </div>
    </div>
  `;
}

function getVerificationBadge(status: string): string {
  if (status === 'FULLY_VERIFIED') return `<span class="badge badge-verified">✓ Fully Verified</span>`;
  if (status === 'BUSINESS_VERIFIED') return `<span class="badge badge-verified">✓ Business Verified</span>`;
  if (status === 'IDENTITY_VERIFIED') return `<span class="badge badge-verified">✓ ID Verified</span>`;
  return `<span class="badge badge-pending">Verification Pending</span>`;
}

function escapeHtml(str: string): string {
  if (typeof str !== 'string') return '';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}
