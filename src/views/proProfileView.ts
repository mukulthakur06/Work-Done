// Workdone Professional Public Profile Page View
import type { ProfessionalProfile } from '../types/index.ts';

export function renderProProfileView(pro: ProfessionalProfile, isSaved: boolean = false): string {
  const user = pro.user;
  const services = pro.services || [];
  const portfolios = pro.portfolios || [];
  const reviews = pro.reviews || [];

  return `
    <div style="background: var(--bg-surface); border-bottom: 1px solid var(--border); padding: 3rem 0;">
      <div class="container">
        <div style="display: flex; gap: 2rem; align-items: flex-start; justify-content: space-between; flex-wrap: wrap;">
          <div style="display: flex; gap: 1.5rem; align-items: center;">
            <div style="width: 90px; height: 90px; border-radius: var(--radius-md); background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%); color: #fff; font-size: 2.2rem; font-weight: 800; display: flex; align-items: center; justify-content: center; box-shadow: var(--shadow-md);">
              ${escapeHtml(user?.name.charAt(0) || 'P')}
            </div>
            <div>
              <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.35rem;">
                <h1 style="font-size: 1.85rem; font-weight: 800; color: var(--primary);">${escapeHtml(user?.name || '')}</h1>
                ${getVerificationBadge(pro.verificationStatus)}
              </div>
              <div style="font-size: 1.1rem; color: var(--text-muted); margin-bottom: 0.5rem; font-weight: 500;">
                ${escapeHtml(pro.businessName || 'Independent Home Services Specialist')}
              </div>
              <div style="display: flex; align-items: center; gap: 1.25rem; font-size: 0.875rem; color: var(--text-muted);">
                <span style="display: flex; align-items: center; gap: 0.3rem;">
                  <span style="color: #f59e0b; font-size: 1rem;">★</span>
                  <strong style="color: var(--text-main);">${pro.averageRating > 0 ? pro.averageRating.toFixed(1) : 'New'}</strong>
                  (${pro.totalReviews} reviews)
                </span>
                <span>&bull;</span>
                <span>${pro.yearsExperience} Years Experience</span>
                <span>&bull;</span>
                <span>📍 ${escapeHtml(pro.city)}${pro.locality ? `, ${escapeHtml(pro.locality)}` : ''}</span>
              </div>
            </div>
          </div>

          <!-- Actions Header -->
          <div style="display: flex; align-items: center; gap: 0.75rem;">
            <button onclick="WorkdoneApp.toggleSave('${pro.id}', this)" class="btn btn-outline" style="${isSaved ? 'color: #ef4444;' : ''}">
              ♥ ${isSaved ? 'Saved' : 'Save'}
            </button>
            <button onclick="WorkdoneApp.toggleCompare('${pro.id}', '${escapeHtml(user?.name || '')}')" class="btn btn-outline">
              ⚖️ Compare
            </button>
            <a href="#book-section" class="btn btn-primary">Request a Booking</a>
          </div>
        </div>
      </div>
    </div>

    <div class="container" style="padding-top: 2.5rem; padding-bottom: 4rem;">
      <div style="display: grid; grid-template-columns: 1fr 360px; gap: 2.5rem; align-items: flex-start;">
        
        <!-- Left Column: Biography, Services, Portfolio, Reviews -->
        <div>
          <!-- Biography -->
          <section style="background: var(--bg-surface); border: 1px solid var(--border); border-radius: var(--radius-md); padding: 1.75rem; margin-bottom: 2rem;">
            <h2 style="font-size: 1.25rem; font-weight: 700; color: var(--primary); margin-bottom: 0.85rem;">About &amp; Experience</h2>
            <p style="color: var(--text-main); font-size: 0.95rem; line-height: 1.7;">
              ${escapeHtml(pro.bio)}
            </p>
            ${
              pro.languages
                ? `<div style="margin-top: 1rem; font-size: 0.85rem; color: var(--text-muted);"><strong>Languages:</strong> ${escapeHtml(pro.languages)}</div>`
                : ''
            }
          </section>

          <!-- Services & Rates -->
          <section style="background: var(--bg-surface); border: 1px solid var(--border); border-radius: var(--radius-md); padding: 1.75rem; margin-bottom: 2rem;">
            <h2 style="font-size: 1.25rem; font-weight: 700; color: var(--primary); margin-bottom: 1rem;">Services &amp; Pricing Guidance</h2>
            <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 1.25rem;">
              Estimates are provided following inspection and scope agreement. All prices are transparent and subject to agreed written quotes.
            </p>
            <div style="display: flex; flex-direction: column; gap: 0.75rem;">
              ${services
                .map(
                  (s) => `
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.85rem 1rem; background: var(--bg-page); border-radius: var(--radius-sm); border: 1px solid var(--border);">
                  <div>
                    <div style="font-weight: 700; color: var(--primary); font-size: 0.95rem;">${escapeHtml(s.serviceName)}</div>
                    <div style="font-size: 0.825rem; color: var(--text-muted);">${escapeHtml(s.description || 'Standard trade service')}</div>
                  </div>
                  <div style="text-align: right;">
                    <div style="font-weight: 700; color: var(--secondary); font-size: 0.95rem;">
                      ${s.baseRate ? `$${s.baseRate} / ${s.rateType === 'PER_HOUR' ? 'hour' : 'project'}` : 'Quote on Request'}
                    </div>
                  </div>
                </div>
              `
                )
                .join('')}
            </div>
          </section>

          <!-- Work Portfolio Gallery -->
          <section style="background: var(--bg-surface); border: 1px solid var(--border); border-radius: var(--radius-md); padding: 1.75rem; margin-bottom: 2rem;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem;">
              <h2 style="font-size: 1.25rem; font-weight: 700; color: var(--primary);">Work Portfolio (${portfolios.length} Projects)</h2>
            </div>

            ${
              portfolios.length === 0
                ? `<p style="font-size: 0.9rem; color: var(--text-muted);">No portfolio projects published yet.</p>`
                : `
              <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.25rem;">
                ${portfolios
                  .map(
                    (proj) => `
                  <div style="border: 1px solid var(--border); border-radius: var(--radius-sm); overflow: hidden;">
                    ${
                      proj.media && proj.media.length > 0
                        ? `<img src="${proj.media[0].mediaUrl}" alt="${escapeHtml(proj.title)}" style="width: 100%; height: 180px; object-fit: cover; display: block;">`
                        : `<div style="height: 180px; background: #e2e8f0; display: flex; align-items: center; justify-content: center; color: #94a3b8;">No photo</div>`
                    }
                    <div style="padding: 1rem;">
                      <h4 style="font-size: 1rem; font-weight: 700; color: var(--primary); margin-bottom: 0.35rem;">${escapeHtml(proj.title)}</h4>
                      <div style="font-size: 0.75rem; color: var(--secondary); font-weight: 600; margin-bottom: 0.5rem;">${escapeHtml(proj.categoryName)}</div>
                      <p style="font-size: 0.85rem; color: var(--text-muted); line-height: 1.45; margin-bottom: 0.75rem;">${escapeHtml(proj.description)}</p>
                      <div style="display: flex; justify-content: space-between; font-size: 0.8rem; color: var(--text-muted); border-top: 1px solid var(--border); padding-top: 0.5rem;">
                        <span>${proj.completionDate ? `Completed: ${proj.completionDate}` : ''}</span>
                        <span>${proj.projectCost ? `Approx: $${proj.projectCost.toLocaleString()}` : ''}</span>
                      </div>
                    </div>
                  </div>
                `
                  )
                  .join('')}
              </div>
            `
            }
          </section>

          <!-- Customer Reviews & Quality Control -->
          <section style="background: var(--bg-surface); border: 1px solid var(--border); border-radius: var(--radius-md); padding: 1.75rem;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
              <h2 style="font-size: 1.25rem; font-weight: 700; color: var(--primary);">Verified Customer Reviews (${reviews.length})</h2>
              <div style="display: flex; align-items: center; gap: 0.35rem; font-weight: 700;">
                <span style="color: #f59e0b; font-size: 1.1rem;">★</span>
                <span style="font-size: 1.1rem;">${pro.averageRating > 0 ? pro.averageRating.toFixed(1) : 'New'}</span>
              </div>
            </div>

            ${
              reviews.length === 0
                ? `<p style="font-size: 0.9rem; color: var(--text-muted);">No reviews posted yet. Reviews can only be submitted after jobs are completed through Workdone.</p>`
                : `
              <div style="display: flex; flex-direction: column; gap: 1.5rem;">
                ${reviews
                  .map(
                    (rev) => `
                  <div style="border-bottom: 1px solid var(--border); padding-bottom: 1.5rem;">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem;">
                      <div>
                        <div style="font-weight: 700; font-size: 0.95rem; color: var(--primary);">${escapeHtml(rev.customerName || 'Verified Homeowner')}</div>
                        <div style="font-size: 0.75rem; color: var(--text-muted);">${escapeHtml(rev.customerCity || 'Local')} &bull; ${rev.createdAt.substring(0, 10)}</div>
                      </div>
                      <div style="text-align: right;">
                        <span style="color: #f59e0b; font-weight: 700;">${'★'.repeat(rev.overallRating)}${'☆'.repeat(5 - rev.overallRating)}</span>
                        <div style="font-size: 0.75rem; color: #059669; font-weight: 600;">✓ Verified Completed Job</div>
                      </div>
                    </div>

                    <!-- 4-criteria breakdown -->
                    <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.5rem; background: var(--bg-page); padding: 0.5rem 0.75rem; border-radius: var(--radius-sm); margin: 0.75rem 0; font-size: 0.78rem;">
                      <div>Punctuality: <strong>${rev.punctualityRating}/5</strong></div>
                      <div>Workmanship: <strong>${rev.workmanshipRating}/5</strong></div>
                      <div>Communication: <strong>${rev.communicationRating}/5</strong></div>
                      <div>Value: <strong>${rev.valueRating}/5</strong></div>
                    </div>

                    <p style="font-size: 0.9rem; color: var(--text-main); line-height: 1.5; margin: 0.5rem 0;">
                      ${escapeHtml(rev.comment)}
                    </p>

                    ${
                      rev.proResponse
                        ? `
                      <div style="margin-top: 0.75rem; padding: 0.75rem 1rem; background: #f0fdfa; border-left: 3px solid var(--secondary); border-radius: 4px; font-size: 0.85rem;">
                        <strong style="color: var(--secondary-hover);">Response from ${escapeHtml(user?.name || 'Professional')}:</strong>
                        <p style="margin-top: 0.25rem; color: var(--text-main);">${escapeHtml(rev.proResponse)}</p>
                      </div>
                    `
                        : ''
                    }

                    <div style="margin-top: 0.5rem; text-align: right;">
                      <button onclick="WorkdoneApp.reportReview('${rev.id}')" style="background: none; border: none; font-size: 0.75rem; color: #94a3b8; cursor: pointer; text-decoration: underline;">
                        Report review
                      </button>
                    </div>
                  </div>
                `
                  )
                  .join('')}
              </div>
            `
            }
          </section>
        </div>

        <!-- Right Column: Availability, Working Hours, Booking Request Widget -->
        <aside style="position: sticky; top: 90px; display: flex; flex-direction: column; gap: 1.5rem;">
          
          <!-- Availability & Status Card -->
          <div style="background: var(--bg-surface); border: 1px solid var(--border); border-radius: var(--radius-md); padding: 1.5rem;">
            <h3 style="font-size: 1.1rem; font-weight: 700; color: var(--primary); margin-bottom: 0.75rem;">Availability &amp; Status</h3>
            
            <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.75rem;">
              <span style="width: 10px; height: 10px; border-radius: 50%; background: ${pro.availabilityStatus === 'AVAILABLE' ? '#10b981' : '#f59e0b'};"></span>
              <strong style="font-size: 0.95rem; color: var(--primary);">${pro.availabilityStatus === 'AVAILABLE' ? 'Available for New Jobs' : 'Busy / Booked'}</strong>
            </div>

            <div style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 1.25rem;">
              Status updated: ${pro.availabilityUpdatedAt ? pro.availabilityUpdatedAt.substring(0, 10) : 'Recently'}
            </div>

            <div style="border-top: 1px solid var(--border); padding-top: 1rem; font-size: 0.875rem;">
              <div style="font-weight: 600; color: var(--text-main); margin-bottom: 0.25rem;">Working Hours:</div>
              <div style="color: var(--text-muted);">${escapeHtml(pro.workingHours || '9:00 AM - 6:00 PM, Mon-Sat')}</div>
            </div>

            <div style="border-top: 1px solid var(--border); padding-top: 1rem; margin-top: 1rem; font-size: 0.875rem;">
              <div style="font-weight: 600; color: var(--text-main); margin-bottom: 0.25rem;">Completed Bookings:</div>
              <div style="color: var(--text-muted);">${pro.completedJobsCount} jobs completed on Workdone</div>
            </div>
          </div>

          <!-- Direct Booking Request Card -->
          <div id="book-section" style="background: var(--bg-surface); border: 2px solid var(--secondary); border-radius: var(--radius-md); padding: 1.75rem; box-shadow: var(--shadow-md);">
            <h3 style="font-size: 1.2rem; font-weight: 800; color: var(--primary); margin-bottom: 0.5rem;">Request a Booking</h3>
            <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 1.25rem;">
              Submit your project details to receive an itemized estimate and schedule confirmation.
            </p>

            <form onsubmit="WorkdoneApp.handleBookingSubmit(event, this)">
              <input type="hidden" name="proProfileId" value="${pro.id}">
              <input type="hidden" name="categoryId" value="${services[0]?.categoryId || ''}">

              <div class="form-group">
                <label class="form-label">Service Title</label>
                <input type="text" name="serviceTitle" required class="form-input" value="${escapeHtml(services[0]?.serviceName || 'Home Improvement Job')}">
              </div>

              <div class="form-group">
                <label class="form-label">Project Scope &amp; Details *</label>
                <textarea name="description" required class="form-textarea" placeholder="Describe the work required, measurements, or specific issues..."></textarea>
              </div>

              <div class="form-group">
                <label class="form-label">Project Area / Locality *</label>
                <input type="text" name="approximateLocation" required class="form-input" placeholder="e.g. Austin Downtown">
              </div>

              <div class="form-group">
                <label class="form-label">City *</label>
                <input type="text" name="city" required class="form-input" value="${escapeHtml(pro.city)}">
              </div>

              <div class="form-group">
                <label class="form-label">Preferred Date *</label>
                <input type="date" name="requestedDate" required class="form-input">
              </div>

              <div class="form-group">
                <label class="form-label">Estimated Budget ($)</label>
                <input type="number" name="budgetRangeMax" class="form-input" placeholder="e.g. 1000">
              </div>

              <button type="submit" class="btn btn-primary" style="width: 100%; padding: 0.85rem; font-weight: 700;">
                Send Request to ${escapeHtml(user?.name.split(' ')[0] || 'Pro')}
              </button>
            </form>
          </div>
        </aside>

      </div>
    </div>
  `;
}

function getVerificationBadge(status: string): string {
  if (status === 'FULLY_VERIFIED') {
    return `<span class="badge badge-verified">✓ Fully Verified</span>`;
  }
  if (status === 'BUSINESS_VERIFIED') {
    return `<span class="badge badge-verified">✓ Business Verified</span>`;
  }
  if (status === 'IDENTITY_VERIFIED') {
    return `<span class="badge badge-verified">✓ ID Verified</span>`;
  }
  return `<span class="badge badge-pending">Verification Pending</span>`;
}

function escapeHtml(str: string): string {
  if (typeof str !== 'string') return '';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}
