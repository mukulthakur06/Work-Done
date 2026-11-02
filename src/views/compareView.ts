// Workdone Professional Comparison Matrix View
import type { ProfessionalProfile } from '../types/index.ts';

export function renderCompareView(professionals: ProfessionalProfile[]): string {
  if (professionals.length === 0) {
    return `
      <div class="container" style="padding: 4rem 1.25rem; text-align: center;">
        <h1 style="font-size: 1.85rem; font-weight: 800; color: var(--primary); margin-bottom: 0.75rem;">Professional Comparison</h1>
        <p style="color: var(--text-muted); font-size: 1rem; margin-bottom: 2rem;">No professionals selected for comparison yet.</p>
        <a href="/professionals" class="btn btn-primary">Browse Professionals</a>
      </div>
    `;
  }

  return `
    <div style="background: var(--bg-surface); border-bottom: 1px solid var(--border); padding: 2.5rem 0;">
      <div class="container">
        <h1 style="font-size: 1.85rem; font-weight: 800; color: var(--primary); margin-bottom: 0.5rem;">
          Side-by-Side Professional Comparison
        </h1>
        <p style="color: var(--text-muted); font-size: 0.95rem;">
          Compare experience, verified credentials, ratings, and starting rates to make an informed hiring decision.
        </p>
      </div>
    </div>

    <div class="container" style="padding-top: 2.5rem; padding-bottom: 4rem;">
      <div style="overflow-x: auto; background: var(--bg-surface); border: 1px solid var(--border); border-radius: var(--radius-md); box-shadow: var(--shadow-sm);">
        <table style="width: 100%; border-collapse: collapse; min-width: 760px; text-align: left;">
          <thead>
            <tr style="background: var(--bg-page); border-bottom: 2px solid var(--border);">
              <th style="padding: 1.25rem 1rem; width: 220px; font-weight: 700; color: var(--text-muted); font-size: 0.85rem; text-transform: uppercase;">
                Comparison Criteria
              </th>
              ${professionals
                .map(
                  (p) => `
                <th style="padding: 1.25rem 1rem; vertical-align: top; border-left: 1px solid var(--border);">
                  <div style="font-size: 1.15rem; font-weight: 800; color: var(--primary); margin-bottom: 0.25rem;">
                    ${escapeHtml(p.user?.name || '')}
                  </div>
                  <div style="font-size: 0.825rem; color: var(--text-muted); font-weight: 500; margin-bottom: 0.5rem;">
                    ${escapeHtml(p.businessName || 'Independent Pro')}
                  </div>
                  <div>
                    <a href="/professionals/${p.id}" class="btn btn-outline btn-sm" style="font-size: 0.8rem; padding: 0.35rem 0.65rem;">View Profile</a>
                  </div>
                </th>
              `
                )
                .join('')}
            </tr>
          </thead>
          <tbody>
            <!-- Verification Status -->
            <tr style="border-bottom: 1px solid var(--border);">
              <td style="padding: 1rem; font-weight: 600; color: var(--primary); background: #f8fafc;">
                Verified Credentials
              </td>
              ${professionals
                .map(
                  (p) => `
                <td style="padding: 1rem; border-left: 1px solid var(--border);">
                  ${getVerificationBadge(p.verificationStatus)}
                  <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 0.35rem;">
                    ${escapeHtml(p.verificationNotes || 'Administrative review completed.')}
                  </div>
                </td>
              `
                )
                .join('')}
            </tr>

            <!-- Rating & Reviews -->
            <tr style="border-bottom: 1px solid var(--border);">
              <td style="padding: 1rem; font-weight: 600; color: var(--primary); background: #f8fafc;">
                Rating &amp; Completed Jobs
              </td>
              ${professionals
                .map(
                  (p) => `
                <td style="padding: 1rem; border-left: 1px solid var(--border);">
                  <div style="font-weight: 700; font-size: 1rem; color: var(--primary);">
                    <span style="color: #f59e0b;">★</span> ${p.averageRating > 0 ? p.averageRating.toFixed(1) : 'New'}
                  </div>
                  <div style="font-size: 0.8rem; color: var(--text-muted);">
                    ${p.totalReviews} verified reviews &bull; ${p.completedJobsCount} completed jobs
                  </div>
                </td>
              `
                )
                .join('')}
            </tr>

            <!-- Experience -->
            <tr style="border-bottom: 1px solid var(--border);">
              <td style="padding: 1rem; font-weight: 600; color: var(--primary); background: #f8fafc;">
                Trade Experience
              </td>
              ${professionals
                .map(
                  (p) => `
                <td style="padding: 1rem; border-left: 1px solid var(--border); font-size: 0.95rem; font-weight: 600; color: var(--primary);">
                  ${p.yearsExperience} Years in Practice
                </td>
              `
                )
                .join('')}
            </tr>

            <!-- Starting Rate -->
            <tr style="border-bottom: 1px solid var(--border);">
              <td style="padding: 1rem; font-weight: 600; color: var(--primary); background: #f8fafc;">
                Starting Price Guidance
              </td>
              ${professionals
                .map(
                  (p) => `
                <td style="padding: 1rem; border-left: 1px solid var(--border);">
                  <div style="font-weight: 700; font-size: 1rem; color: var(--secondary);">
                    ${p.startingPrice ? `$${p.startingPrice} / hr` : 'Custom Quote'}
                  </div>
                  <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 0.2rem;">
                    *Starting estimate only; final cost agreed upon written scope.
                  </div>
                </td>
              `
                )
                .join('')}
            </tr>

            <!-- Availability -->
            <tr style="border-bottom: 1px solid var(--border);">
              <td style="padding: 1rem; font-weight: 600; color: var(--primary); background: #f8fafc;">
                Current Availability
              </td>
              ${professionals
                .map(
                  (p) => `
                <td style="padding: 1rem; border-left: 1px solid var(--border);">
                  <span style="font-weight: 700; color: ${p.availabilityStatus === 'AVAILABLE' ? '#047857' : '#b45309'}; font-size: 0.9rem;">
                    ${p.availabilityStatus === 'AVAILABLE' ? '● Available' : '● Busy / Advance Booking'}
                  </span>
                  <div style="font-size: 0.8rem; color: var(--text-muted); margin-top: 0.25rem;">
                    ${escapeHtml(p.workingHours || 'Standard hours')}
                  </div>
                </td>
              `
                )
                .join('')}
            </tr>

            <!-- Action Row -->
            <tr>
              <td style="padding: 1.25rem 1rem; background: #f8fafc;"></td>
              ${professionals
                .map(
                  (p) => `
                <td style="padding: 1.25rem 1rem; border-left: 1px solid var(--border);">
                  <a href="/professionals/${p.id}#book" class="btn btn-primary" style="width: 100%;">
                    Request Booking
                  </a>
                </td>
              `
                )
                .join('')}
            </tr>
          </tbody>
        </table>
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
  return `<span class="badge badge-pending">Pending Review</span>`;
}

function escapeHtml(str: string): string {
  if (typeof str !== 'string') return '';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}
