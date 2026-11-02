// Workdone Informational & Legal Static Pages
import type { ServiceCategory } from '../types/index.ts';

export function renderCategoriesView(categories: ServiceCategory[]): string {
  // Category-specific SVG watermark icons (large, decorative)
  const watermarks: Record<string, string> = {
    'hammer':       `<svg width="96" height="96" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><path d="m15 12-8.5 8.5c-.83.83-2.17.83-3 0a2.12 2.12 0 0 1 0-3L12 9"/><path d="M17.64 15 22 10.64"/><path d="m20.91 3.26-6.5 6.5"/><path d="m16.5 4.5 3 3"/></svg>`,
    'droplets':     `<svg width="96" height="96" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><path d="M7 16.3c2.2 0 4-1.83 4-4.05 0-1.16-.57-2.26-1.71-3.19S7.29 6.75 7 5.3c-.29 1.45-1.14 2.84-2.29 3.76S3 11.1 3 12.25c0 2.22 1.8 4.05 4 4.05z"/><path d="M12.56 6.6A10.97 10.97 0 0 0 14 3.02c.5 2.5 2 4.9 4 6.5s3 3.5 3 5.5a6.98 6.98 0 0 1-11.91 4.97"/></svg>`,
    'zap':          `<svg width="96" height="96" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`,
    'grid':         `<svg width="96" height="96" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M3 15h18"/><path d="M9 3v18"/><path d="M15 3v18"/></svg>`,
    'paint-bucket': `<svg width="96" height="96" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><path d="m19 11-8-8-8.6 8.6a2 2 0 0 0 0 2.8l5.2 5.2c.8.8 2 .8 2.8 0L19 11Z"/><path d="m5 2 5 5"/><path d="M2 13h15"/><path d="M22 20a2 2 0 1 1-4 0c0-1.6 1.7-2.4 2-4 .3 1.6 2 2.4 2 4Z"/></svg>`,
    'layout':       `<svg width="96" height="96" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/></svg>`,
    'brick-wall':   `<svg width="96" height="96" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M3 15h18"/><path d="M9 3v6"/><path d="M15 9v6"/><path d="M9 15v6"/></svg>`,
    'wind':         `<svg width="96" height="96" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><path d="M17.7 7.7a2.5 2.5 0 1 1 1.8 4.3H2"/><path d="M9.6 4.6A2 2 0 1 1 11 8H2"/><path d="M12.6 19.4A2 2 0 1 0 14 16H2"/></svg>`,
    'sparkles':     `<svg width="96" height="96" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>`,
  };
  const defaultWm = `<svg width="96" height="96" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>`;

  // Icon foreground colors per category (for themed icon-box tint)
  const catColors: Record<string, { bg: string; color: string }> = {
    'carpentry':      { bg: '#fef3c7', color: '#92400e' },
    'plumbing':       { bg: '#eff6ff', color: '#1d4ed8' },
    'electrical':     { bg: '#fef9c3', color: '#854d0e' },
    'tile-flooring':  { bg: '#f0fdf4', color: '#166534' },
    'painting':       { bg: '#fdf4ff', color: '#7e22ce' },
    'interior-design':{ bg: '#fff1f2', color: '#be123c' },
    'masonry-civil':  { bg: '#f1f5f9', color: '#334155' },
    'ac-repair':      { bg: '#ecfeff', color: '#0e7490' },
    'home-cleaning':  { bg: '#f0fdfa', color: '#0f766e' },
    'welding':        { bg: '#fff7ed', color: '#c2410c' },
    'false-ceiling':  { bg: '#f5f3ff', color: '#6d28d9' },
    'renovation':     { bg: '#fafaf9', color: '#0f172a' },
  };

  return `
    <!-- 3. Enhanced Categories Page Hero with gradient mesh + line pattern -->
    <div class="cats-page-hero">
      <div class="container cats-page-hero-inner">
        <div>
          <span style="color: #2dd4bf; font-size: 0.8rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; display:block; margin-bottom:0.5rem;">
            Service Directory
          </span>
          <h1 style="font-size: 2.4rem; font-weight: 800; color: #fff; margin: 0 0 0.6rem; letter-spacing: -0.025em; line-height:1.15;">
            All Home Service Disciplines
          </h1>
          <p style="color: #94a3b8; font-size: 0.975rem; max-width: 560px; line-height: 1.6;">
            Discover verified local specialists across <strong style="color:#2dd4bf;">12 core home repair, improvement, and renovation</strong> fields. Compare portfolios, check credentials, and book with confidence.
          </p>
        </div>
        <div class="cats-page-stats">
          <div class="cats-page-stat">
            <div class="cats-page-stat-num">12</div>
            <div class="cats-page-stat-label">Service Trades</div>
          </div>
          <div class="cats-page-stat">
            <div class="cats-page-stat-num">5+</div>
            <div class="cats-page-stat-label">Verification Tiers</div>
          </div>
          <div class="cats-page-stat">
            <div class="cats-page-stat-num">4★</div>
            <div class="cats-page-stat-label">Avg. Platform Rating</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 5. Two-column layout: info sidebar + category cards -->
    <div class="container">
      <div class="cats-layout">

        <!-- 5. Left info panel -->
        <div class="cats-info-panel">

          <!-- Verified Workmanship CTA -->
          <div class="cats-cta-box">
            <div style="display:flex;align-items:center;gap:0.6rem;margin-bottom:0.75rem;">
              <div style="width:36px;height:36px;border-radius:50%;background:#0d9488;display:flex;align-items:center;justify-content:center;flex-shrink:0;">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              </div>
              <span style="font-size:0.75rem;font-weight:700;color:#2dd4bf;text-transform:uppercase;letter-spacing:0.05em;">Verified Workmanship</span>
            </div>
            <h3>Work you can trust — backed by documentation</h3>
            <p>Every verified professional has passed identity, business, and credential checks administered by our moderation team. Badges are never self-awarded.</p>
            <a href="/how-it-works" class="btn btn-secondary btn-sm" style="border-radius:9999px;font-size:0.8rem;">Learn How It Works &rarr;</a>
          </div>

          <!-- How It Works mini-timeline -->
          <div class="cats-how-box">
            <div style="font-weight:700;color:var(--primary);font-size:0.9rem;margin-bottom:0.75rem;">How to Book</div>
            <div class="cats-how-step">
              <div class="cats-how-num">1</div>
              <div class="cats-how-text">
                <strong>Pick a Category</strong>
                <span>Browse 12 trade disciplines &amp; filter by city</span>
              </div>
            </div>
            <div class="cats-how-step">
              <div class="cats-how-num">2</div>
              <div class="cats-how-text">
                <strong>Compare Profiles</strong>
                <span>View portfolios, ratings &amp; itemized estimates</span>
              </div>
            </div>
            <div class="cats-how-step">
              <div class="cats-how-num">3</div>
              <div class="cats-how-text">
                <strong>Request a Booking</strong>
                <span>Describe scope, get an estimate &amp; confirm</span>
              </div>
            </div>
            <div class="cats-how-step">
              <div class="cats-how-num">4</div>
              <div class="cats-how-text">
                <strong>Review After Completion</strong>
                <span>Leave a verified 4-criteria rating</span>
              </div>
            </div>
          </div>

          <!-- Emergency callout -->
          <div class="cats-emergency-box">
            <div style="display:flex;align-items:center;gap:0.5rem;margin-bottom:0.5rem;">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#92400e" stroke-width="2.5"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
              <span style="font-size:0.8rem;font-weight:700;color:#92400e;">Need Emergency Service?</span>
            </div>
            <p style="font-size:0.78rem;color:#78350f;line-height:1.5;margin-bottom:0.75rem;">
              Filter by "Available Now" to find on-call professionals ready for urgent plumbing leaks, electrical faults, or lockouts.
            </p>
            <a href="/professionals?availability=available" class="btn btn-sm" style="background:#f59e0b;color:#fff;border-radius:9999px;font-size:0.78rem;border:none;">
              Find Available Pros Now
            </a>
          </div>

        </div>

        <!-- 4. Category cards grid with themed icons & watermarks -->
        <div class="categories-grid">
          ${categories
            .map((cat) => {
              const theme = catColors[cat.slug] || { bg: '#f1f5f9', color: '#0f172a' };
              const wm = watermarks[cat.iconName] || defaultWm;
              return `
            <a href="/professionals?category=${cat.slug}" class="category-card">
              <div class="category-card-watermark" style="color:${theme.color};">${wm}</div>
              <div>
                <div class="category-icon-box" style="background:${theme.bg};color:${theme.color};">
                  ${getCategoryIconSvg(cat.iconName)}
                </div>
                <h3 class="category-name">${escapeHtml(cat.name)}</h3>
                <p class="category-desc">${escapeHtml(cat.description)}</p>
              </div>
              <div style="margin-top: 1.25rem; font-size: 0.85rem; font-weight: 600; color: var(--secondary); display: flex; align-items: center; gap: 0.35rem;">
                Find Local Specialists &rarr;
              </div>
            </a>
          `})
            .join('')}
        </div>

      </div>
    </div>
  `;
}

export function renderHowItWorksView(): string {
  return `
    <div style="background: var(--bg-surface); border-bottom: 1px solid var(--border); padding: 3rem 0;">
      <div class="container" style="text-align: center;">
        <h1 style="font-size: 2.2rem; font-weight: 800; color: var(--primary); margin-bottom: 0.5rem;">
          How Workdone Works
        </h1>
        <p style="color: var(--text-muted); font-size: 1rem; max-width: 620px; margin: 0 auto;">
          A transparent, step-by-step marketplace connecting homeowners with independently verified local craftspeople.
        </p>
      </div>
    </div>

    <div class="container" style="padding: 4rem 1.25rem; max-width: 860px;">
      <div style="display: flex; flex-direction: column; gap: 3rem;">
        
        <div style="display: flex; gap: 2rem; align-items: flex-start;">
          <div style="width: 52px; height: 52px; border-radius: 50%; background: var(--primary); color: #fff; font-size: 1.35rem; font-weight: 800; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">1</div>
          <div>
            <h3 style="font-size: 1.3rem; font-weight: 700; color: var(--primary); margin-bottom: 0.5rem;">Discover &amp; Compare Local Specialists</h3>
            <p style="color: var(--text-muted); line-height: 1.6; font-size: 0.95rem;">
              Search by trade and locality. Filter by minimum rating, experience, verification tier, and live availability. Compare up to 4 professionals side-by-side on credentials, portfolio projects, and customer feedback.
            </p>
          </div>
        </div>

        <div style="display: flex; gap: 2rem; align-items: flex-start;">
          <div style="width: 52px; height: 52px; border-radius: 50%; background: var(--secondary); color: #fff; font-size: 1.35rem; font-weight: 800; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">2</div>
          <div>
            <h3 style="font-size: 1.3rem; font-weight: 700; color: var(--primary); margin-bottom: 0.5rem;">Submit Booking Request &amp; Scope</h3>
            <p style="color: var(--text-muted); line-height: 1.6; font-size: 0.95rem;">
              Send an enquiry detailing your project requirements, approximate location, and preferred timeline without exposing your exact private address or phone number publicly.
            </p>
          </div>
        </div>

        <div style="display: flex; gap: 2rem; align-items: flex-start;">
          <div style="width: 52px; height: 52px; border-radius: 50%; background: var(--primary); color: #fff; font-size: 1.35rem; font-weight: 800; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">3</div>
          <div>
            <h3 style="font-size: 1.3rem; font-weight: 700; color: var(--primary); margin-bottom: 0.5rem;">Review &amp; Accept Itemized Estimate</h3>
            <p style="color: var(--text-muted); line-height: 1.6; font-size: 0.95rem;">
              Receive a formal itemized estimate separating labour costs, materials, estimated duration, and work inclusions/exclusions. When you accept the estimate, the scope and schedule are locked into the audit trail.
            </p>
          </div>
        </div>

        <div style="display: flex; gap: 2rem; align-items: flex-start;">
          <div style="width: 52px; height: 52px; border-radius: 50%; background: var(--secondary); color: #fff; font-size: 1.35rem; font-weight: 800; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">4</div>
          <div>
            <h3 style="font-size: 1.3rem; font-weight: 700; color: var(--primary); margin-bottom: 0.5rem;">Job Completion &amp; Verified Review</h3>
            <p style="color: var(--text-muted); line-height: 1.6; font-size: 0.95rem;">
              Once work is delivered, the job is marked complete and you are invited to rate punctuality, workmanship, communication, and value for money. Verified reviews build honest, high-trust contractor reputations.
            </p>
          </div>
        </div>

      </div>
    </div>
  `;
}

export function renderForProfessionalsView(): string {
  return `
    <div style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); color: #fff; padding: 4.5rem 0;">
      <div class="container" style="text-align: center; max-width: 720px;">
        <span style="color: #2dd4bf; font-weight: 700; font-size: 0.85rem; text-transform: uppercase;">For Independent Contractors</span>
        <h1 style="font-size: 2.75rem; font-weight: 800; margin: 0.5rem 0 1rem; line-height: 1.2;">
          Your Craftsmanship Deserves a Premium Showcase.
        </h1>
        <p style="color: #94a3b8; font-size: 1.1rem; line-height: 1.6; margin-bottom: 2rem;">
          Connect with homeowners looking for skilled professionals. Build your online portfolio, manage appointments, send formal itemized quotes, and collect verified reviews.
        </p>
        <a href="/register/pro" class="btn btn-secondary btn-lg">Join as a Professional</a>
      </div>
    </div>

    <div class="container" style="padding: 4rem 1.25rem; max-width: 960px;" id="verification">
      <div style="text-align: center; margin-bottom: 3rem;">
        <span class="section-tag">Trust Standards</span>
        <h2 class="section-title">The Workdone Verification Program</h2>
        <p class="section-desc">We never grant automated or decorative badges. Every badge reflects checked credentials.</p>
      </div>

      <div class="verification-cards-grid">
        <!-- Card 1: ID Verification -->
        <div class="verification-tier-card" 
             role="button" 
             tabindex="0" 
             onclick="openVerificationModal('id')"
             onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();openVerificationModal('id');}"
             aria-haspopup="dialog"
             aria-label="View ID Verification tier details and requirements">
          <div>
            <div class="verification-card-top">
              <div class="verification-icon-box" style="background: #ecfdf5; color: #059669;">
                🪪
              </div>
              <span class="verification-tier-badge" style="background: #f0fdf4; color: #166534; border: 1px solid #bbf7d0;">
                Tier 1 Verified
              </span>
            </div>
            <h3 class="verification-card-title">ID Verification</h3>
            <p class="verification-card-desc">Government-issued photo identification verified against registered professional records.</p>
          </div>
          <div class="verification-card-cta">
            <span>View Requirements</span>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
          </div>
        </div>

        <!-- Card 2: Business License Check -->
        <div class="verification-tier-card" 
             role="button" 
             tabindex="0" 
             onclick="openVerificationModal('business')"
             onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();openVerificationModal('business');}"
             aria-haspopup="dialog"
             aria-label="View Business License Check tier details and requirements">
          <div>
            <div class="verification-card-top">
              <div class="verification-icon-box" style="background: #eff6ff; color: #2563eb;">
                📑
              </div>
              <span class="verification-tier-badge" style="background: #eff6ff; color: #1e40af; border: 1px solid #bfdbfe;">
                Business Tier
              </span>
            </div>
            <h3 class="verification-card-title">Business License Check</h3>
            <p class="verification-card-desc">Verification of state/local business registration, contractor licenses, and active standing.</p>
          </div>
          <div class="verification-card-cta">
            <span>View Requirements</span>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
          </div>
        </div>

        <!-- Card 3: Verified Job Reviews -->
        <div class="verification-tier-card" 
             role="button" 
             tabindex="0" 
             onclick="openVerificationModal('reviews')"
             onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();openVerificationModal('reviews');}"
             aria-haspopup="dialog"
             aria-label="View Verified Job Reviews tier details and requirements">
          <div>
            <div class="verification-card-top">
              <div class="verification-icon-box" style="background: #fef3c7; color: #d97706;">
                ⭐
              </div>
              <span class="verification-tier-badge" style="background: #fffbeb; color: #92400e; border: 1px solid #fde68a;">
                Quality Standard
              </span>
            </div>
            <h3 class="verification-card-title">Verified Job Reviews</h3>
            <p class="verification-card-desc">Customer feedback tied directly to audited bookings completed through the platform.</p>
          </div>
          <div class="verification-card-cta">
            <span>View Requirements</span>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
          </div>
        </div>
      </div>
    </div>

    <!-- Verification Details Modal Dialog -->
    <div id="verification-detail-modal" class="modal-overlay" style="display: none;" onclick="if(event.target===this)closeVerificationModal()">
      <div class="modal-dialog" style="max-width: 560px; max-height: 90vh; overflow-y: auto;">
        <div class="modal-header" style="border-bottom: 1px solid var(--border); padding-bottom: 1rem;">
          <div style="display: flex; align-items: center; gap: 0.75rem;">
            <div id="vm-icon" style="width: 42px; height: 42px; border-radius: var(--radius-sm); display: flex; align-items: center; justify-content: center; font-size: 1.35rem;"></div>
            <div>
              <h3 id="vm-title" class="modal-title" style="margin: 0; font-size: 1.25rem; font-weight: 700; color: var(--primary);"></h3>
              <span id="vm-badge" style="font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em;"></span>
            </div>
          </div>
          <button class="modal-close" onclick="closeVerificationModal()" aria-label="Close dialog">&times;</button>
        </div>

        <div class="modal-body" style="padding: 1.5rem 0 0.5rem;">
          <div style="margin-bottom: 1.25rem;">
            <h4 style="font-size: 0.8rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted); margin-bottom: 0.4rem;">Overview &amp; Purpose</h4>
            <p id="vm-overview" style="font-size: 0.925rem; color: var(--text-main); line-height: 1.6; margin: 0;"></p>
          </div>

          <div style="background: #f8fafc; border: 1px solid var(--border); border-radius: var(--radius-md); padding: 1.25rem; margin-bottom: 1.25rem;">
            <h4 style="font-size: 0.825rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: var(--primary); margin-bottom: 0.75rem; display: flex; align-items: center; gap: 0.4rem;">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
              Step-by-Step Requirements
            </h4>
            <ul id="vm-requirements" style="list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 0.65rem; font-size: 0.875rem; color: var(--text-main);">
            </ul>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1.5rem;">
            <div style="background: var(--bg-surface); border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 0.85rem;">
              <span style="font-size: 0.75rem; color: var(--text-muted); display: block; margin-bottom: 0.25rem;">Review Turnaround</span>
              <strong id="vm-turnaround" style="font-size: 0.9rem; color: var(--primary);"></strong>
            </div>
            <div style="background: var(--bg-surface); border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 0.85rem;">
              <span style="font-size: 0.75rem; color: var(--text-muted); display: block; margin-bottom: 0.25rem;">Trust Advantage</span>
              <strong id="vm-benefit" style="font-size: 0.9rem; color: #059669;"></strong>
            </div>
          </div>

          <div style="display: flex; gap: 0.75rem; justify-content: flex-end; padding-top: 1rem; border-top: 1px solid var(--border);">
            <button type="button" class="btn btn-outline btn-sm" onclick="closeVerificationModal()">Close</button>
            <a href="/register/pro" class="btn btn-primary btn-sm" style="display: inline-flex; align-items: center; gap: 0.4rem;">
              <span>Get Verified Today</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
            </a>
          </div>
        </div>
      </div>
    </div>

    <script>
      const verificationTierData = {
        'id': {
          title: 'ID Verification',
          badge: 'Tier 1 Standard',
          badgeColor: '#059669',
          iconBg: '#ecfdf5',
          iconColor: '#059669',
          iconSvg: '🪪',
          overview: 'ID Verification establishes that you are a genuine, individual craftsperson or contractor legally recognized by state or national authorities. This badge is displayed on your public profile and search results.',
          requirements: [
            'Upload a clear color scan or photo of your government-issued ID (Passport, Aadhaar Card, Voter ID, or Driver\'s License).',
            'Full name on the uploaded document must match your Workdone professional account name.',
            'Document must be currently valid and not expired.',
            'Liveness selfie check to prevent identity impersonation.'
          ],
          turnaround: '12 – 24 Hours',
          benefit: '+40% Customer Trust'
        },
        'business': {
          title: 'Business License Check',
          badge: 'Business Verified Tier',
          badgeColor: '#2563eb',
          iconBg: '#eff6ff',
          iconColor: '#2563eb',
          iconSvg: '📑',
          overview: 'The Business License Check verifies that your business entity, trade registration, or company is officially registered and licensed to provide construction, renovation, or home maintenance services.',
          requirements: [
            'Submit your official business registration certificate, Trade License, or Incorporation Document.',
            'Provide active GSTIN, Tax Registration number, or MSME / Udyam Certificate.',
            'Provide proof of active standing and registered business address.',
            'Commercial contractor license numbers (for electrical, plumbing, HVAC, or structural trades).'
          ],
          turnaround: '24 – 48 Hours',
          benefit: 'Eligible for Commercial & Large Jobs'
        },
        'reviews': {
          title: 'Verified Job Reviews',
          badge: 'Quality Standard',
          badgeColor: '#d97706',
          iconBg: '#fef3c7',
          iconColor: '#d97706',
          iconSvg: '⭐',
          overview: 'Workdone strictly protects review integrity. Reviews and ratings cannot be purchased or fabricated — each review is verified against an audited completed booking on the platform.',
          requirements: [
            'Complete home improvement bookings through the Workdone platform.',
            'Customers submit 4-criteria ratings: Quality, Punctuality, Communication, and Value for Money.',
            'Reviews pass automated anti-fraud checks (no duplicate IPs or self-reviews).',
            'Maintain a minimum 4.0 star average rating to earn Top-Rated Specialist status.'
          ],
          turnaround: 'Instant upon Customer Completion',
          benefit: '3.4x Higher Booking Conversion'
        }
      };

      function openVerificationModal(tierKey) {
        const data = verificationTierData[tierKey];
        if (!data) return;

        document.getElementById('vm-title').innerText = data.title;
        const badgeEl = document.getElementById('vm-badge');
        badgeEl.innerText = data.badge;
        badgeEl.style.color = data.badgeColor;

        const iconEl = document.getElementById('vm-icon');
        iconEl.innerText = data.iconSvg;
        iconEl.style.backgroundColor = data.iconBg;
        iconEl.style.color = data.iconColor;

        document.getElementById('vm-overview').innerText = data.overview;
        document.getElementById('vm-turnaround').innerText = data.turnaround;
        document.getElementById('vm-benefit').innerText = data.benefit;

        const reqList = document.getElementById('vm-requirements');
        reqList.innerHTML = data.requirements
          .map(r => '<li style="display:flex;align-items:flex-start;gap:0.5rem;"><span style="color:#059669;font-weight:bold;">✓</span><span>' + r + '</span></li>')
          .join('');

        const modal = document.getElementById('verification-detail-modal');
        if (modal) modal.style.display = 'flex';
      }

      function closeVerificationModal() {
        const modal = document.getElementById('verification-detail-modal');
        if (modal) modal.style.display = 'none';
      }
    </script>
  `;
}

export function renderPrivacyPolicyView(): string {
  return `
    <div class="container" style="max-width: 820px; padding: 4rem 1.25rem;">
      <h1 style="font-size: 2.2rem; font-weight: 800; color: var(--primary); margin-bottom: 1rem;">Workdone Privacy Policy</h1>
      <p style="color: var(--text-muted); font-size: 0.85rem; margin-bottom: 2rem;">Last Updated: October 2026 &bull; Production Compliance Notice</p>

      <div style="color: var(--text-main); line-height: 1.7; font-size: 0.95rem; display: flex; flex-direction: column; gap: 1.5rem;">
        <section>
          <h2 style="font-size: 1.25rem; font-weight: 700; color: var(--primary); margin-bottom: 0.5rem;">1. Information We Collect</h2>
          <p>We collect only the personal information strictly required to operate the home-services marketplace, including user names, email addresses, phone numbers, service localities, and trade experience. Customer private residential addresses and exact contact details are never exposed publicly or indexed by search engines.</p>
        </section>

        <section>
          <h2 style="font-size: 1.25rem; font-weight: 700; color: var(--primary); margin-bottom: 0.5rem;">2. Security &amp; Password Handling</h2>
          <p>Passwords are never stored in plaintext. All authentication credentials are cryptographically hashed using salted, high-work-factor functions (scrypt). Session tokens are signed using HMAC-SHA256 and transmitted over secure HTTP-only cookies.</p>
        </section>

        <section>
          <h2 style="font-size: 1.25rem; font-weight: 700; color: var(--primary); margin-bottom: 0.5rem;">3. Data Sharing &amp; Third Parties</h2>
          <p>We do not sell user data. Information submitted during a booking request (project description, approximate area, preferred dates) is shared only with the specifically selected professional for the purposes of project estimation and scheduling.</p>
        </section>
      </div>
    </div>
  `;
}

export function renderTermsView(): string {
  return `
    <div class="container" style="max-width: 820px; padding: 4rem 1.25rem;">
      <h1 style="font-size: 2.2rem; font-weight: 800; color: var(--primary); margin-bottom: 1rem;">Terms and Conditions</h1>
      <p style="color: var(--text-muted); font-size: 0.85rem; margin-bottom: 2rem;">Last Updated: October 2026</p>

      <div style="color: var(--text-main); line-height: 1.7; font-size: 0.95rem; display: flex; flex-direction: column; gap: 1.5rem;">
        <section>
          <h2 style="font-size: 1.25rem; font-weight: 700; color: var(--primary); margin-bottom: 0.5rem;">1. Marketplace Role &amp; Pricing Transparency</h2>
          <p>Workdone is a platform connecting independent home-service contractors with customers. Starting rates shown on professional profiles represent estimates or base consultation guidance. Binding project scopes, prices, material allowances, and timelines are established through written estimates agreed upon by customer and professional.</p>
        </section>

        <section>
          <h2 style="font-size: 1.25rem; font-weight: 700; color: var(--primary); margin-bottom: 0.5rem;">2. Booking Lifecycle &amp; Cancellation</h2>
          <p>Customers and professionals agree to adhere to confirmed schedules. Reschedule proposals must be communicated through the platform. Workdone maintains an immutable audit trail of booking status transitions.</p>
        </section>
      </div>
    </div>
  `;
}

export function renderGuidelinesView(): string {
  return `
    <div class="container" style="max-width: 820px; padding: 4rem 1.25rem;">
      <h1 style="font-size: 2.2rem; font-weight: 800; color: var(--primary); margin-bottom: 1rem;">Community Standards &amp; Review Policy</h1>
      <p style="color: var(--text-muted); font-size: 0.85rem; margin-bottom: 2rem;">High Quality Workmanship &bull; Genuine Reviews</p>

      <div style="color: var(--text-main); line-height: 1.7; font-size: 0.95rem; display: flex; flex-direction: column; gap: 1.5rem;">
        <section>
          <h2 style="font-size: 1.25rem; font-weight: 700; color: var(--primary); margin-bottom: 0.5rem;">Review Integrity</h2>
          <p>Only customers with completed bookings are permitted to submit reviews. Professionals may not review their own profiles or solicit fake feedback. Legitimate negative feedback cannot be deleted merely because it is critical. Reviews containing abusive language, harassment, or personal threats are subject to administrative moderation with full audit logging.</p>
        </section>
      </div>
    </div>
  `;
}

export function renderProblemReportView(session?: any): string {
  return `
    <div style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); color: #fff; padding: 3.5rem 1.25rem 3rem; text-align: center;">
      <div class="container" style="max-width: 720px;">
        <span style="color: #f87171; font-size: 0.8rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; display: inline-block; margin-bottom: 0.5rem;">
          Trust &amp; Safety
        </span>
        <h1 style="font-size: 2.25rem; font-weight: 800; color: #fff; margin-bottom: 0.5rem; letter-spacing: -0.02em;">
          Report a Problem or Dispute
        </h1>
        <p style="color: #94a3b8; font-size: 1rem; line-height: 1.6; margin: 0 auto;">
          Our trust &amp; safety team reviews all reports. Issues with workmanship, billing, or conduct are logged to our audit pipeline and handled within 24 hours.
        </p>
      </div>
    </div>

    <div class="container" style="max-width: 720px; padding: 3.5rem 1.25rem;">
      <div style="background: var(--bg-surface); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 2.25rem; box-shadow: var(--shadow-md);">
        <form id="problem-report-form" onsubmit="handleProblemReportSubmit(event, this)">
          
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1.25rem;">
            <div class="form-group" style="margin-bottom: 0;">
              <label class="form-label">Your Name <span style="color:#ef4444;">*</span></label>
              <input type="text" name="complainant_name" required class="form-input" placeholder="Your full name" value="${session ? escapeHtml(session.name) : ''}">
            </div>
            <div class="form-group" style="margin-bottom: 0;">
              <label class="form-label">Your Email <span style="color:#ef4444;">*</span></label>
              <input type="email" name="complainant_email" required class="form-input" placeholder="name@example.com" value="${session ? escapeHtml(session.email) : ''}">
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1.25rem;">
            <div class="form-group" style="margin-bottom: 0;">
              <label class="form-label">Phone Number</label>
              <input type="tel" name="complainant_phone" class="form-input" placeholder="+91 98765 43210">
            </div>
            <div class="form-group" style="margin-bottom: 0;">
              <label class="form-label">Against Professional / Contractor <span style="color:#ef4444;">*</span></label>
              <input type="text" name="against_professional" required class="form-input" placeholder="Name or business of professional">
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1.25rem;">
            <div class="form-group" style="margin-bottom: 0;">
              <label class="form-label">Booking Reference (if any)</label>
              <input type="text" name="booking_reference" class="form-input" placeholder="e.g. WD-2026-12345">
            </div>
            <div class="form-group" style="margin-bottom: 0;">
              <label class="form-label">Issue Category <span style="color:#ef4444;">*</span></label>
              <select name="complaint_type" required class="form-input">
                <option value="quality">Poor Quality or Incomplete Work</option>
                <option value="overcharge">Pricing Dispute or Overcharge</option>
                <option value="no_show">No-Show / Unannounced Absence</option>
                <option value="rude_behaviour">Unprofessional or Rude Behavior</option>
                <option value="fraud">Fraud / Unauthorized Material Charges</option>
                <option value="other">Other Dispute</option>
              </select>
            </div>
          </div>

          <div class="form-group" style="margin-bottom: 1.25rem;">
            <label class="form-label">Detailed Description <span style="color:#ef4444;">*</span></label>
            <textarea name="description" required rows="5" class="form-input" placeholder="Provide full context, dates, and what occurred during the service..."></textarea>
          </div>

          <div class="form-group" style="margin-bottom: 1.5rem;">
            <label class="form-label">Resolution Sought</label>
            <input type="text" name="resolution_sought" class="form-input" placeholder="e.g. Free rework, partial refund, formal explanation">
          </div>

          <div id="report-alert" style="display: none; padding: 0.85rem 1rem; border-radius: var(--radius-md); font-size: 0.875rem; margin-bottom: 1.25rem;"></div>

          <button type="submit" class="btn btn-primary btn-lg" style="width: 100%; display: flex; align-items: center; justify-content: center; gap: 0.5rem; background: #dc2626; border-color: #dc2626;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            <span>Submit Formal Report</span>
          </button>
        </form>
      </div>
    </div>

    <script>
      async function handleProblemReportSubmit(e, form) {
        e.preventDefault();
        const btn = form.querySelector('button[type="submit"]');
        const alertBox = document.getElementById('report-alert');
        const originalText = btn.innerHTML;

        btn.disabled = true;
        btn.innerHTML = '<span class="spinner"></span> Filing Report...';
        alertBox.style.display = 'none';

        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        try {
          const res = await fetch('/api/complaints/public', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
          });
          const result = await res.json();

          if (!res.ok || !result.success) {
            throw new Error(result.error || 'Failed to submit report. Please try again.');
          }

          alertBox.style.display = 'block';
          alertBox.style.background = '#f0fdf4';
          alertBox.style.color = '#166534';
          alertBox.style.border = '1px solid #bbf7d0';
          alertBox.innerHTML = '<strong>Report Filed Successfully.</strong> Your complaint has been recorded in our Supabase security backend. Our Trust &amp; Safety team has been notified.';
          form.reset();
        } catch (err) {
          alertBox.style.display = 'block';
          alertBox.style.background = '#fef2f2';
          alertBox.style.color = '#991b1b';
          alertBox.style.border = '1px solid #fecaca';
          alertBox.innerHTML = '<strong>Error:</strong> ' + (err.message || 'Unable to file report.');
        } finally {
          btn.disabled = false;
          btn.innerHTML = originalText;
        }
      }
    </script>
  `;
}

function getCategoryIconSvg(icon: string): string {
  switch (icon) {
    case 'hammer':
      return `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m15 12-8.5 8.5c-.83.83-2.17.83-3 0a2.12 2.12 0 0 1 0-3L12 9"/><path d="M17.64 15 22 10.64"/><path d="m20.91 3.26-6.5 6.5"/><path d="m16.5 4.5 3 3"/></svg>`;
    case 'droplets':
      return `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 16.3c2.2 0 4-1.83 4-4.05 0-1.16-.57-2.26-1.71-3.19S7.29 6.75 7 5.3c-.29 1.45-1.14 2.84-2.29 3.76S3 11.1 3 12.25c0 2.22 1.8 4.05 4 4.05z"/><path d="M12.56 6.6A10.97 10.97 0 0 0 14 3.02c.5 2.5 2 4.9 4 6.5s3 3.5 3 5.5a6.98 6.98 0 0 1-11.91 4.97"/></svg>`;
    case 'zap':
      return `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`;
    case 'grid':
      return `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M3 15h18"/><path d="M9 3v18"/><path d="M15 3v18"/></svg>`;
    case 'paint-bucket':
      return `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m19 11-8-8-8.6 8.6a2 2 0 0 0 0 2.8l5.2 5.2c.8.8 2 .8 2.8 0L19 11Z"/><path d="m5 2 5 5"/><path d="M2 13h15"/><path d="M22 20a2 2 0 1 1-4 0c0-1.6 1.7-2.4 2-4 .3 1.6 2 2.4 2 4Z"/></svg>`;
    case 'layout':
      return `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/></svg>`;
    case 'brick-wall':
      return `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M3 15h18"/><path d="M9 3v6"/><path d="M15 9v6"/><path d="M9 15v6"/></svg>`;
    case 'wind':
      return `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.7 7.7a2.5 2.5 0 1 1 1.8 4.3H2"/><path d="M9.6 4.6A2 2 0 1 1 11 8H2"/><path d="M12.6 19.4A2 2 0 1 0 14 16H2"/></svg>`;
    case 'sparkles':
      return `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>`;
    default:
      return `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>`;
  }
}

function escapeHtml(str: string): string {
  if (typeof str !== 'string') return '';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}
