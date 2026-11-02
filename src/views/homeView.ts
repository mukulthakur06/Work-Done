// Workdone Homepage View Implementation
import type { ProfessionalProfile, ServiceCategory } from '../types/index.ts';

export function renderHomeView(
  categories: ServiceCategory[],
  featuredPros: (ProfessionalProfile & { primaryServiceName?: string; coverImage?: string })[]
): string {
  // 4. Category-specific theming
  const catColors: Record<string, { bg: string; color: string }> = {
    'carpentry':       { bg: '#fef3c7', color: '#92400e' },
    'plumbing':        { bg: '#eff6ff', color: '#1d4ed8' },
    'electrical':      { bg: '#fef9c3', color: '#854d0e' },
    'tile-flooring':   { bg: '#f0fdf4', color: '#166534' },
    'painting':        { bg: '#fdf4ff', color: '#7e22ce' },
    'interior-design': { bg: '#fff1f2', color: '#be123c' },
    'masonry-civil':   { bg: '#f1f5f9', color: '#334155' },
    'ac-repair':       { bg: '#ecfeff', color: '#0e7490' },
    'home-cleaning':   { bg: '#f0fdfa', color: '#0f766e' },
    'welding':         { bg: '#fff7ed', color: '#c2410c' },
    'false-ceiling':   { bg: '#f5f3ff', color: '#6d28d9' },
    'renovation':      { bg: '#fafaf9', color: '#0f172a' },
  };
  return `
    <!-- Hero Section -->
    <section class="hero-section">
      <div class="container hero-grid">
        <div>
          <div class="hero-tag">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
            Verified Local Contractors &amp; Specialists
          </div>

          <h1 class="hero-title">Find Skilled Professionals You Can Trust.</h1>
          
          <p class="hero-desc">
            From tiles and furniture to plumbing, electrical work, and home renovations, discover the right professional for your next project.
          </p>

          <!-- Search Box -->
          <div class="search-box-card">
            <form action="/professionals" method="GET" class="search-form" id="hero-search-form">
              <div class="search-field">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="2">
                  <circle cx="11" cy="11" r="8"/>
                  <path d="m21 21-4.35-4.35"/>
                </svg>
                <input type="text" name="keyword" id="hero-keyword" placeholder="Service or job type (e.g. Carpenter, Rewiring)">
              </div>

              <div class="search-field" id="hero-city-field">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="2">
                  <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
                <input type="text" name="city" id="hero-city" placeholder="City, locality, or PIN code">
              </div>

              <button type="submit" class="btn btn-secondary btn-lg" style="padding: 0.75rem 1.75rem;">
                Search
              </button>
            </form>
          </div>

          <!-- Seasonal / Festive Smart Recommendations (Diwali Priority Order) -->
          <div class="popular-pills" id="popular-pills-row">
            <span style="font-size: 0.78rem; font-weight: 700; color: #334155; letter-spacing: 0.01em; display:flex;align-items:center;gap:0.35rem;">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
              Trending:
            </span>
            <a href="/professionals?category=electrical" class="pill-link" title="Electrician — decorative & home lighting">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
              Electrician
            </a>
            <a href="/professionals?category=painting" class="pill-link" title="Painter / Wall Finisher">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m19 11-8-8-8.6 8.6a2 2 0 0 0 0 2.8l5.2 5.2c.8.8 2 .8 2.8 0L19 11Z"/><path d="m5 2 5 5"/><path d="M22 20a2 2 0 1 1-4 0c0-1.6 1.7-2.4 2-4 .3 1.6 2 2.4 2 4Z"/></svg>
              Painter
            </a>
            <a href="/professionals?category=tile-flooring" class="pill-link" title="Tile & Flooring Installer">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M3 15h18"/><path d="M9 3v18"/><path d="M15 3v18"/></svg>
              Tile Installer
            </a>
            <a href="/professionals?category=home-cleaning" class="pill-link" title="Deep Cleaning & Sanitization">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
              Deep Cleaning
            </a>
            <a href="/professionals?category=carpentry" class="pill-link" title="Carpenter">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m15 12-8.5 8.5c-.83.83-2.17.83-3 0a2.12 2.12 0 0 1 0-3L12 9"/><path d="M17.64 15 22 10.64"/><path d="m20.91 3.26-6.5 6.5"/><path d="m16.5 4.5 3 3"/></svg>
              Carpenter
            </a>
            <a href="/professionals?category=interior-design" class="pill-link" title="Interior Design">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/></svg>
              Interior Designer
            </a>
            <a href="/professionals?category=ac-repair" class="pill-link" title="AC Installation & Repair">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M17.7 7.7a2.5 2.5 0 1 1 1.8 4.3H2"/><path d="M9.6 4.6A2 2 0 1 1 11 8H2"/><path d="M12.6 19.4A2 2 0 1 0 14 16H2"/></svg>
              AC Service
            </a>
            <a href="/professionals?category=plumbing" class="pill-link" title="Plumber">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M7 16.3c2.2 0 4-1.83 4-4.05 0-1.16-.57-2.26-1.71-3.19S7.29 6.75 7 5.3c-.29 1.45-1.14 2.84-2.29 3.76S3 11.1 3 12.25c0 2.22 1.8 4.05 4 4.05z"/></svg>
              Plumber
            </a>
            <a href="/professionals?category=false-ceiling" class="pill-link" title="False Ceiling & Gypsum Work">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M3 9h18"/><path d="M3 5h18"/><rect x="3" y="3" width="18" height="18" rx="2"/></svg>
              False Ceiling
            </a>
            <a href="/professionals?category=masonry-civil" class="pill-link" title="Masonry & Civil Work">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M3 15h18"/><path d="M9 3v6"/><path d="M15 9v6"/><path d="M9 15v6"/></svg>
              Masonry
            </a>
          </div>
          <!-- Saved Location Row — filled by client JS -->
          <div class="location-saved-row" id="saved-location-row" style="display:none;">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
            Searching near <span class="loc-name" id="saved-loc-name"></span>
            <button onclick="WdLocation.clearSaved()">Change</button>
          </div>
        </div>

        <!-- Hero Visual Banner -->
        <div style="position: relative;">
          <div style="border-radius: var(--radius-lg); overflow: hidden; box-shadow: var(--shadow-xl); border: 4px solid #fff;">
            <img src="https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=800&q=80" alt="Home Improvement Craftsmanship" style="width: 100%; height: 420px; object-fit: cover; display: block;">
          </div>
          <!-- Floating Credential Card -->
          <div style="position: absolute; bottom: -20px; left: -20px; background: #fff; border: 1px solid var(--border); border-radius: var(--radius-md); padding: 1rem 1.25rem; box-shadow: var(--shadow-lg); display: flex; align-items: center; gap: 0.75rem;">
            <div style="width: 40px; height: 40px; border-radius: 50%; background: #ecfdf5; color: #059669; display: flex; align-items: center; justify-content: center;">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
            </div>
            <div>
              <div style="font-weight: 700; font-size: 0.9rem; color: var(--primary);">100% Verified Profiles</div>
              <div style="font-size: 0.78rem; color: var(--text-muted);">Identity &amp; License Documentation Reviewed</div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Trust Indicators Bar -->
    <section class="trust-bar">
      <div class="container trust-grid">
        <div class="trust-item">
          <div class="trust-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
          </div>
          <div>
            <div class="trust-title">Independent Profiles</div>
            <div class="trust-sub">Real trade backgrounds, biographies &amp; service areas</div>
          </div>
        </div>

        <div class="trust-item">
          <div class="trust-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/>
              <circle cx="9" cy="9" r="2"/>
              <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
            </svg>
          </div>
          <div>
            <div class="trust-title">Portfolio-Based Discovery</div>
            <div class="trust-sub">Examine real project photos and cost estimates</div>
          </div>
        </div>

        <div class="trust-item">
          <div class="trust-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
          </div>
          <div>
            <div class="trust-title">Verified Job Reviews</div>
            <div class="trust-sub">Reviews exclusively collected from completed bookings</div>
          </div>
        </div>

        <div class="trust-item">
          <div class="trust-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
          </div>
          <div>
            <div class="trust-title">Transparent Availability</div>
            <div class="trust-sub">Live working hours, status updates &amp; schedules</div>
          </div>
        </div>
      </div>
    </section>

    <!-- Popular Service Categories Section -->
    <section class="section" style="background: var(--bg-surface);">
      <div class="container">
        <div class="section-header">
          <span class="section-tag">Explore By Trade</span>
          <h2 class="section-title">Popular Service Categories</h2>
          <p class="section-desc">Connect with experienced local craftspeople across 12 core home improvement and renovation disciplines.</p>
        </div>

        <div class="categories-grid">
          ${categories
            .map((cat) => {
              const theme = catColors[cat.slug] || { bg: '#f1f5f9', color: '#0f172a' };
              return `
            <a href="/professionals?category=${cat.slug}" class="category-card">
              <div class="category-card-watermark" style="color:${theme.color};">${getCategoryIconSvgLarge(cat.iconName)}</div>
              <div>
                <div class="category-icon-box" style="background:${theme.bg};color:${theme.color};">
                  ${getCategoryIconSvg(cat.iconName)}
                </div>
                <h3 class="category-name">${escapeHtml(cat.name)}</h3>
                <p class="category-desc">${escapeHtml(cat.description)}</p>
              </div>
              <div style="margin-top: 1.25rem; font-size: 0.85rem; font-weight: 600; color: var(--secondary); display: flex; align-items: center; gap: 0.35rem;">
                Browse Professionals &rarr;
              </div>
            </a>
          `})
            .join('')}
        </div>
      </div>
    </section>

    <!-- Featured Professionals Section -->
    <section class="section" style="background: var(--bg-page);">
      <div class="container">
        <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 2.5rem;">
          <div>
            <span class="section-tag">Top-Rated Specialists</span>
            <h2 class="section-title" style="margin-bottom: 0;">Featured Professionals</h2>
          </div>
          <a href="/professionals" class="btn btn-outline">View All Professionals &rarr;</a>
        </div>

        <div class="pros-grid">
          ${featuredPros
            .map(
              (pro) => `
            <div class="pro-card">
              <img src="${pro.coverImage || 'https://images.unsplash.com/photo-1541888946425-d0fbb186f5f7?auto=format&fit=crop&w=800&q=80'}" alt="${escapeHtml(pro.businessName || pro.user?.name || '')}" class="pro-card-cover">
              
              <div class="pro-card-body">
                <div class="pro-header">
                  <div>
                    <h3 class="pro-name">${escapeHtml(pro.user?.name || '')}</h3>
                    <div class="pro-biz">${escapeHtml(pro.businessName || pro.primaryServiceName || 'Contractor')}</div>
                  </div>
                  ${getVerificationBadge(pro.verificationStatus)}
                </div>

                <div class="pro-rating-row">
                  <span style="color: #f59e0b;">★</span>
                  <span>${pro.averageRating > 0 ? pro.averageRating.toFixed(1) : 'New'}</span>
                  <span style="font-weight: 400; color: var(--text-muted); font-size: 0.825rem;">(${pro.totalReviews} reviews)</span>
                  <span style="color: var(--text-light); margin: 0 0.35rem;">&bull;</span>
                  <span style="font-weight: 500; font-size: 0.825rem; color: var(--text-muted);">${pro.yearsExperience} yrs exp</span>
                </div>

                <p class="pro-bio-snippet">${escapeHtml(pro.bio)}</p>

                <div class="pro-meta-row">
                  <span>📍 ${escapeHtml(pro.city)}${pro.locality ? `, ${escapeHtml(pro.locality)}` : ''}</span>
                  <span style="margin-left: auto;">${pro.startingPrice ? `From $${pro.startingPrice}/hr` : 'Custom Quote'}</span>
                </div>

                <div class="pro-actions-row">
                  <a href="/professionals/${pro.id}" class="btn btn-outline btn-sm" style="flex: 1;">View Profile</a>
                  <button onclick="openBookingModalFor('${pro.id}', '${escapeHtml(pro.user?.name || '')}', '${escapeHtml(pro.primaryServiceName || '')}')" class="btn btn-primary btn-sm" style="flex: 1;">Request Booking</button>
                  <button onclick="WorkdoneApp.toggleCompare('${pro.id}', '${escapeHtml(pro.user?.name || '')}')" class="btn btn-outline btn-sm" title="Compare" style="padding: 0.4rem 0.65rem;">⚖️</button>
                </div>
              </div>
            </div>
          `
            )
            .join('')}
        </div>
      </div>
    </section>

    <!-- How Workdone Works Section -->
    <section class="section" style="background: var(--bg-surface); border-top: 1px solid var(--border);">
      <div class="container">
        <div class="section-header">
          <span class="section-tag">Simple &amp; Transparent</span>
          <h2 class="section-title">How Workdone Works</h2>
          <p class="section-desc">From initial search to verified completion, our four-step process guarantees transparency, safety, and quality.</p>
        </div>

        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 2rem;">
          <div style="text-align: center; padding: 1.5rem;">
            <div style="width: 56px; height: 56px; border-radius: 50%; background: #0f172a; color: #fff; font-size: 1.25rem; font-weight: 800; display: flex; align-items: center; justify-content: center; margin: 0 auto 1.25rem;">1</div>
            <h3 style="font-size: 1.15rem; font-weight: 700; color: var(--primary); margin-bottom: 0.5rem;">Search the Service</h3>
            <p style="font-size: 0.875rem; color: var(--text-muted); line-height: 1.5;">Enter the trade you need and your locality to view available, active local professionals.</p>
          </div>

          <div style="text-align: center; padding: 1.5rem;">
            <div style="width: 56px; height: 56px; border-radius: 50%; background: #0d9488; color: #fff; font-size: 1.25rem; font-weight: 800; display: flex; align-items: center; justify-content: center; margin: 0 auto 1.25rem;">2</div>
            <h3 style="font-size: 1.15rem; font-weight: 700; color: var(--primary); margin-bottom: 0.5rem;">Compare Portfolios</h3>
            <p style="font-size: 0.875rem; color: var(--text-muted); line-height: 1.5;">Inspect real project photos, credentials, verified customer reviews, and starting rates.</p>
          </div>

          <div style="text-align: center; padding: 1.5rem;">
            <div style="width: 56px; height: 56px; border-radius: 50%; background: #0f172a; color: #fff; font-size: 1.25rem; font-weight: 800; display: flex; align-items: center; justify-content: center; margin: 0 auto 1.25rem;">3</div>
            <h3 style="font-size: 1.15rem; font-weight: 700; color: var(--primary); margin-bottom: 0.5rem;">Send Booking Request</h3>
            <p style="font-size: 0.875rem; color: var(--text-muted); line-height: 1.5;">Describe your project scope and schedule. Receive an itemized estimate with materials and labour.</p>
          </div>

          <div style="text-align: center; padding: 1.5rem;">
            <div style="width: 56px; height: 56px; border-radius: 50%; background: #0d9488; color: #fff; font-size: 1.25rem; font-weight: 800; display: flex; align-items: center; justify-content: center; margin: 0 auto 1.25rem;">4</div>
            <h3 style="font-size: 1.15rem; font-weight: 700; color: var(--primary); margin-bottom: 0.5rem;">Complete &amp; Review</h3>
            <p style="font-size: 0.875rem; color: var(--text-muted); line-height: 1.5;">Get the job done right. Confirm completion and publish your verified rating across 4 quality criteria.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Why Choose Workdone Section -->
    <section class="section" style="background: #f1f5f9;">
      <div class="container">
        <div class="section-header">
          <span class="section-tag">The Workdone Advantage</span>
          <h2 class="section-title">Built For Transparency</h2>
          <p class="section-desc">Say goodbye to guesswork and unverified phone referrals. Here is why homeowners choose Workdone.</p>
        </div>

        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.75rem;">
          <div style="background: #fff; padding: 1.75rem; border-radius: var(--radius-md); border: 1px solid var(--border);">
            <div style="font-size: 1.5rem; margin-bottom: 0.75rem;">🔍</div>
            <h3 style="font-size: 1.1rem; font-weight: 700; color: var(--primary); margin-bottom: 0.4rem;">Discover Professionals Nearby</h3>
            <p style="font-size: 0.875rem; color: var(--text-muted); line-height: 1.5;">Filter by your exact city, locality, and trade with verified service coverage areas.</p>
          </div>

          <div style="background: #fff; padding: 1.75rem; border-radius: var(--radius-md); border: 1px solid var(--border);">
            <div style="font-size: 1.5rem; margin-bottom: 0.75rem;">📸</div>
            <h3 style="font-size: 1.1rem; font-weight: 700; color: var(--primary); margin-bottom: 0.4rem;">Review Previous Projects</h3>
            <p style="font-size: 0.875rem; color: var(--text-muted); line-height: 1.5;">Examine documented project portfolios with completion dates, descriptions, and approximate costs.</p>
          </div>

          <div style="background: #fff; padding: 1.75rem; border-radius: var(--radius-md); border: 1px solid var(--border);">
            <div style="font-size: 1.5rem; margin-bottom: 0.75rem;">📋</div>
            <h3 style="font-size: 1.1rem; font-weight: 700; color: var(--primary); margin-bottom: 0.4rem;">Compare Itemized Estimates</h3>
            <p style="font-size: 0.875rem; color: var(--text-muted); line-height: 1.5;">Receive clear breakdowns separating labour, materials, exclusions, and agreed duration before work begins.</p>
          </div>

          <div style="background: #fff; padding: 1.75rem; border-radius: var(--radius-md); border: 1px solid var(--border);">
            <div style="font-size: 1.5rem; margin-bottom: 0.75rem;">📅</div>
            <h3 style="font-size: 1.1rem; font-weight: 700; color: var(--primary); margin-bottom: 0.4rem;">Check Real-Time Availability</h3>
            <p style="font-size: 0.875rem; color: var(--text-muted); line-height: 1.5;">See whether a pro is Available, Busy, or taking bookings next week, with explicit last-updated timestamps.</p>
          </div>

          <div style="background: #fff; padding: 1.75rem; border-radius: var(--radius-md); border: 1px solid var(--border);">
            <div style="font-size: 1.5rem; margin-bottom: 0.75rem;">⭐</div>
            <h3 style="font-size: 1.1rem; font-weight: 700; color: var(--primary); margin-bottom: 0.4rem;">Genuine Feedback Only</h3>
            <p style="font-size: 0.875rem; color: var(--text-muted); line-height: 1.5;">Reviews cannot be faked or purchased; our system unlocks review submissions exclusively upon completed jobs.</p>
          </div>

          <div style="background: #fff; padding: 1.75rem; border-radius: var(--radius-md); border: 1px solid var(--border);">
            <div style="font-size: 1.5rem; margin-bottom: 0.75rem;">🛡️</div>
            <h3 style="font-size: 1.1rem; font-weight: 700; color: var(--primary); margin-bottom: 0.4rem;">Transparent Verification</h3>
            <p style="font-size: 0.875rem; color: var(--text-muted); line-height: 1.5;">Badges are backed by real identity and business registration checks recorded by platform admins.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Customer Testimonials Section (Clearly Labelled Sample Verification) -->
    <section class="section" style="background: var(--bg-surface);">
      <div class="container">
        <div class="section-header">
          <span class="section-tag">Customer Experience</span>
          <h2 class="section-title">Verified Customer Stories</h2>
          <p class="section-desc"><span style="background: #fef3c7; color: #92400e; padding: 2px 8px; border-radius: 4px; font-size: 0.8rem; font-weight: 600;">Sample Preview</span> Genuine feedback collected from completed Workdone demo bookings.</p>
        </div>

        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.75rem;">
          <div style="background: var(--bg-page); border: 1px solid var(--border); border-radius: var(--radius-md); padding: 1.75rem;">
            <div style="color: #f59e0b; margin-bottom: 0.75rem; font-size: 1.1rem;">★★★★★</div>
            <p style="font-size: 0.9rem; color: var(--text-main); line-height: 1.6; margin-bottom: 1.25rem;">
              "Marcus Vance built our solid maple butcher block kitchen island. The craftsmanship is flawless, the quote was adhered to penny for penny, and clean-up was immaculate."
            </p>
            <div style="display: flex; align-items: center; gap: 0.75rem;">
              <div style="width: 36px; height: 36px; border-radius: 50%; background: #0d9488; color: #fff; display: flex; align-items: center; justify-content: center; font-weight: 700;">S</div>
              <div>
                <div style="font-weight: 700; font-size: 0.875rem;">Sarah Jenkins</div>
                <div style="font-size: 0.75rem; color: var(--text-muted);">Austin, TX &bull; Completed Custom Cabinetry Job</div>
              </div>
            </div>
          </div>

          <div style="background: var(--bg-page); border: 1px solid var(--border); border-radius: var(--radius-md); padding: 1.75rem;">
            <div style="color: #f59e0b; margin-bottom: 0.75rem; font-size: 1.1rem;">★★★★★</div>
            <p style="font-size: 0.9rem; color: var(--text-main); line-height: 1.6; margin-bottom: 1.25rem;">
              "David Miller replaced our faulty main pressure regulator and added a whole-home filter. Extremely punctual, gave clear explanations of options, and provided a formal receipt."
            </p>
            <div style="display: flex; align-items: center; gap: 0.75rem;">
              <div style="width: 36px; height: 36px; border-radius: 50%; background: #1e293b; color: #fff; display: flex; align-items: center; justify-content: center; font-weight: 700;">M</div>
              <div>
                <div style="font-weight: 700; font-size: 0.875rem;">Michael Chang</div>
                <div style="font-size: 0.75rem; color: var(--text-muted);">Austin, TX &bull; Completed Plumbing Overhaul</div>
              </div>
            </div>
          </div>

          <div style="background: var(--bg-page); border: 1px solid var(--border); border-radius: var(--radius-md); padding: 1.75rem;">
            <div style="color: #f59e0b; margin-bottom: 0.75rem; font-size: 1.1rem;">★★★★★</div>
            <p style="font-size: 0.9rem; color: var(--text-main); line-height: 1.6; margin-bottom: 1.25rem;">
              "Elena Rostova helped us reconfigure our open-plan living and dining space. Her 3D material models made choosing lighting and cabinetry effortless."
            </p>
            <div style="display: flex; align-items: center; gap: 0.75rem;">
              <div style="width: 36px; height: 36px; border-radius: 50%; background: #0d9488; color: #fff; display: flex; align-items: center; justify-content: center; font-weight: 700;">P</div>
              <div>
                <div style="font-weight: 700; font-size: 0.875rem;">Priya Patel</div>
                <div style="font-size: 0.75rem; color: var(--text-muted);">Seattle, WA &bull; Completed Interior Design Job</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Professional Registration CTA Section -->
    <section class="section" style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); color: #fff; text-align: center;">
      <div class="container" style="max-width: 720px;">
        <span style="color: #2dd4bf; font-size: 0.85rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; display: block; margin-bottom: 0.5rem;">For Skilled Trades &amp; Contractors</span>
        <h2 style="font-size: 2.5rem; font-weight: 800; line-height: 1.2; margin-bottom: 1rem; color: #fff;">Your Skills Deserve More Opportunities.</h2>
        <p style="font-size: 1.1rem; color: #94a3b8; line-height: 1.6; margin-bottom: 2rem;">
          Create your professional profile, showcase your work, and connect with customers looking for your skills. Build an enduring reputation with verified reviews.
        </p>
        <a href="/register/pro" class="btn btn-secondary btn-lg" style="font-size: 1.05rem; padding: 0.85rem 2.25rem;">Join Workdone</a>
      </div>
    </section>

    <!-- Booking Modal (dynamic popup for homepage action) -->
    <div id="booking-modal" class="modal-overlay" style="display: none;">
      <div class="modal-dialog">
        <div class="modal-header">
          <h3 class="modal-title" id="bm-title">Request a Booking</h3>
          <button class="modal-close" onclick="WorkdoneApp.closeModal('booking-modal')">&times;</button>
        </div>
        <form onsubmit="WorkdoneApp.handleBookingSubmit(event, this)">
          <input type="hidden" name="proProfileId" id="bm-pro-id">
          <input type="hidden" name="categoryId" id="bm-cat-id" value="${categories[0]?.id || ''}">
          <input type="hidden" name="serviceTitle" id="bm-service-title" value="Home Service Request">

          <div class="form-group">
            <label class="form-label">Professional</label>
            <input type="text" id="bm-pro-name" readonly class="form-input" style="background: #f1f5f9; font-weight: 600;">
          </div>

          <div class="form-group">
            <label class="form-label">Describe Project Scope &amp; Requirements *</label>
            <textarea name="description" required class="form-textarea" placeholder="E.g., Need 3 interior doors planed and fitted with new brushed nickel hinges and locksets."></textarea>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
            <div class="form-group">
              <label class="form-label">Project Locality / Area *</label>
              <input type="text" name="approximateLocation" required class="form-input" placeholder="e.g. South Congress, Austin">
            </div>
            <div class="form-group">
              <label class="form-label">City *</label>
              <input type="text" name="city" required class="form-input" placeholder="e.g. Austin">
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
            <div class="form-group">
              <label class="form-label">Preferred Date *</label>
              <input type="date" name="requestedDate" required class="form-input">
            </div>
            <div class="form-group">
              <label class="form-label">Approximate Budget ($)</label>
              <input type="number" name="budgetRangeMax" class="form-input" placeholder="e.g. 500">
            </div>
          </div>

          <button type="submit" class="btn btn-primary" style="width: 100%; padding: 0.75rem; margin-top: 0.5rem;">
            Send Booking Request
          </button>
        </form>
      </div>
    </div>

    <script>
      function openBookingModalFor(proId, proName, primaryService) {
        document.getElementById('bm-pro-id').value = proId;
        document.getElementById('bm-pro-name').value = proName;
        document.getElementById('bm-service-title').value = primaryService || 'Home Service Request';
        document.getElementById('bm-title').innerText = 'Request Booking: ' + proName;
        WorkdoneApp.openModal('booking-modal');
      }

      // 1. Persistent Location Auto-fill on homepage
      document.addEventListener('DOMContentLoaded', function() {
        var saved = WdLocation.getSaved();
        var cityInput = document.getElementById('hero-city');
        var savedRow = document.getElementById('saved-location-row');
        var savedName = document.getElementById('saved-loc-name');
        if (saved && cityInput) {
          cityInput.value = saved;
          var field = document.getElementById('hero-city-field');
          if (field) field.classList.add('search-field-prefilled');
          if (savedRow) savedRow.style.display = 'flex';
          if (savedName) savedName.textContent = saved;
        }
        // Save city when form is submitted
        var form = document.getElementById('hero-search-form');
        if (form) {
          form.addEventListener('submit', function() {
            var v = cityInput ? cityInput.value.trim() : '';
            if (v) WdLocation.save(v);
          });
        }
      });
    </script>
  `;
}

function getVerificationBadge(status: string): string {
  if (status === 'FULLY_VERIFIED') {
    return `<span class="badge badge-verified" title="Identity, Business Registration and Qualifications reviewed by platform administration">✓ Fully Verified</span>`;
  }
  if (status === 'BUSINESS_VERIFIED') {
    return `<span class="badge badge-verified" title="Business registration documents reviewed">✓ Business Verified</span>`;
  }
  if (status === 'IDENTITY_VERIFIED') {
    return `<span class="badge badge-verified" title="Government identity credentials reviewed">✓ ID Verified</span>`;
  }
  return `<span class="badge badge-pending" title="Self-reported details. Verification pending administrative review">Verification Pending</span>`;
}

function getCategoryIconSvg(icon: string): string {
  // Return clean SVG icons
  switch (icon) {
    case 'hammer':
      return `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m15 12-8.5 8.5c-.83.83-2.17.83-3 0 0 0 0 0 0 0a2.12 2.12 0 0 1 0-3L12 9"/><path d="M17.64 15 22 10.64"/><path d="m20.91 3.26-6.5 6.5"/><path d="m16.5 4.5 3 3"/></svg>`;
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

function getCategoryIconSvgLarge(icon: string): string {
  // 96×96 stroke-weight-1 watermark version for background decoration
  const d: Record<string, string> = {
    'hammer':       `<path d="m15 12-8.5 8.5c-.83.83-2.17.83-3 0a2.12 2.12 0 0 1 0-3L12 9"/><path d="M17.64 15 22 10.64"/><path d="m20.91 3.26-6.5 6.5"/><path d="m16.5 4.5 3 3"/>`,
    'droplets':     `<path d="M7 16.3c2.2 0 4-1.83 4-4.05 0-1.16-.57-2.26-1.71-3.19S7.29 6.75 7 5.3c-.29 1.45-1.14 2.84-2.29 3.76S3 11.1 3 12.25c0 2.22 1.8 4.05 4 4.05z"/><path d="M12.56 6.6A10.97 10.97 0 0 0 14 3.02c.5 2.5 2 4.9 4 6.5s3 3.5 3 5.5a6.98 6.98 0 0 1-11.91 4.97"/>`,
    'zap':          `<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>`,
    'grid':         `<rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M3 15h18"/><path d="M9 3v18"/><path d="M15 3v18"/>`,
    'paint-bucket': `<path d="m19 11-8-8-8.6 8.6a2 2 0 0 0 0 2.8l5.2 5.2c.8.8 2 .8 2.8 0L19 11Z"/><path d="m5 2 5 5"/><path d="M2 13h15"/><path d="M22 20a2 2 0 1 1-4 0c0-1.6 1.7-2.4 2-4 .3 1.6 2 2.4 2 4Z"/>`,
    'layout':       `<rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/>`,
    'brick-wall':   `<rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M3 15h18"/><path d="M9 3v6"/><path d="M15 9v6"/><path d="M9 15v6"/>`,
    'wind':         `<path d="M17.7 7.7a2.5 2.5 0 1 1 1.8 4.3H2"/><path d="M9.6 4.6A2 2 0 1 1 11 8H2"/><path d="M12.6 19.4A2 2 0 1 0 14 16H2"/>`,
    'sparkles':     `<path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>`,
  };
  const paths = d[icon] || `<path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>`;
  return `<svg width="88" height="88" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="0.9">${paths}</svg>`;
}

function escapeHtml(str: string): string {
  if (typeof str !== 'string') return '';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}
