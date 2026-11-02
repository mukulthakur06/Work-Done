// Workdone Search & Discovery Results View
import type { ProfessionalProfile, ServiceCategory } from '../types/index.ts';

export interface SearchViewProps {
  categories: ServiceCategory[];
  professionals: (ProfessionalProfile & { primaryServiceName?: string; coverImage?: string })[];
  total: number;
  page: number;
  totalPages: number;
  filters: {
    keyword?: string;
    categorySlug?: string;
    city?: string;
    minRating?: number;
    experience?: string;
    verification?: string;
    availability?: string;
    sortBy?: string;
  };
}

// Build server-side pagination URL from current filters
function buildPageUrl(pageNum: number, filters: SearchViewProps['filters']): string {
  const params = new URLSearchParams();
  if (filters.keyword) params.set('keyword', filters.keyword);
  if (filters.categorySlug && filters.categorySlug !== 'all') params.set('category', filters.categorySlug);
  if (filters.city) params.set('city', filters.city);
  if (filters.minRating) params.set('minRating', String(filters.minRating));
  if (filters.experience) params.set('experience', filters.experience);
  if (filters.verification) params.set('verification', filters.verification);
  if (filters.availability) params.set('availability', filters.availability);
  if (filters.sortBy) params.set('sortBy', filters.sortBy);
  params.set('page', String(pageNum));
  const qs = params.toString();
  return `/professionals${qs ? `?${qs}` : ''}`;
}

export function renderSearchView(props: SearchViewProps): string {
  const { categories, professionals, total, page, totalPages, filters } = props;

  return `
    <!-- Persistent Dual-Scroll Architecture with Horizontal Scroll Safety -->
    <div class="pros-split-container">
      
      <!-- Left Sidebar (Filters Panel) - Fixed full height with independent scroll -->
      <aside class="pros-filters-panel" id="pros-filters-sidebar" aria-label="Search Filters">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem; padding-bottom: 0.75rem; border-bottom: 1px solid var(--border);">
          <div style="display: flex; align-items: center; gap: 0.5rem;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
            <h3 style="font-size: 1.1rem; font-weight: 700; color: var(--primary); margin: 0;">Filters</h3>
          </div>
          <a href="/professionals" style="font-size: 0.8rem; font-weight: 600; color: var(--secondary); text-decoration: none;" onmouseover="this.style.textDecoration='underline'" onmouseout="this.style.textDecoration='none'">Reset All</a>
        </div>

        <form action="/professionals" method="GET" id="search-filters-form">
          <!-- Keyword search -->
          <div class="form-group">
            <label class="form-label">Keyword or Trade</label>
            <input type="text" name="keyword" value="${escapeHtml(filters.keyword || '')}" class="form-input" placeholder="e.g. Cabinetry, Plumber">
          </div>

          <!-- Category -->
          <div class="form-group">
            <label class="form-label">Service Category</label>
            <select name="category" class="form-select">
              <option value="all">All Categories</option>
              ${categories
                .map(
                  (cat) => `
                <option value="${cat.slug}" ${filters.categorySlug === cat.slug ? 'selected' : ''}>
                  ${escapeHtml(cat.name)}
                </option>
              `
                )
                .join('')}
            </select>
          </div>

          <!-- City / Location — with saved location pre-fill support -->
          <div class="form-group">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.4rem;">
              <label class="form-label" style="margin:0;">City or Locality</label>
              <button type="button" id="loc-change-btn" onclick="WdLocation.clearSaved();document.getElementById('search-city-input').value='';document.getElementById('search-city-input').classList.remove('search-field-prefilled');document.getElementById('loc-saved-hint').style.display='none';this.style.display='none';"
                style="display:none;font-size:0.75rem;color:var(--secondary);background:none;border:none;cursor:pointer;font-weight:600;text-decoration:underline;padding:0;">
                ✕ Change
              </button>
            </div>
            <input type="text" name="city" id="search-city-input" value="${escapeHtml(filters.city || '')}" class="form-input${filters.city ? ' search-field-prefilled' : ''}" placeholder="Austin, Seattle, Mumbai...">
            <div id="loc-saved-hint" style="display:${filters.city ? 'none' : 'none'};font-size:0.75rem;color:var(--secondary);margin-top:0.3rem;">
              📍 Pre-filled from your saved location
            </div>
          </div>

          <!-- Minimum Rating -->
          <div class="form-group">
            <label class="form-label">Minimum Rating</label>
            <select name="minRating" class="form-select">
              <option value="">Any Rating</option>
              <option value="4.8" ${filters.minRating === 4.8 ? 'selected' : ''}>★ 4.8 &amp; above</option>
              <option value="4.5" ${filters.minRating === 4.5 ? 'selected' : ''}>★ 4.5 &amp; above</option>
              <option value="4.0" ${filters.minRating === 4.0 ? 'selected' : ''}>★ 4.0 &amp; above</option>
              <option value="3.5" ${filters.minRating === 3.5 ? 'selected' : ''}>★ 3.5 &amp; above</option>
            </select>
          </div>

          <!-- Experience -->
          <div class="form-group">
            <label class="form-label">Years of Experience</label>
            <select name="experience" class="form-select">
              <option value="">Any Experience</option>
              <option value="0-2" ${filters.experience === '0-2' ? 'selected' : ''}>0 - 2 years</option>
              <option value="3-5" ${filters.experience === '3-5' ? 'selected' : ''}>3 - 5 years</option>
              <option value="6-10" ${filters.experience === '6-10' ? 'selected' : ''}>6 - 10 years</option>
              <option value="10+" ${filters.experience === '10+' ? 'selected' : ''}>10+ years (Master)</option>
            </select>
          </div>

          <!-- Verification Status -->
          <div class="form-group">
            <label class="form-label">Verification Status</label>
            <select name="verification" class="form-select">
              <option value="">All Profiles</option>
              <option value="verified" ${filters.verification === 'verified' ? 'selected' : ''}>Verified (ID or Business)</option>
              <option value="fully_verified" ${filters.verification === 'fully_verified' ? 'selected' : ''}>Fully Verified</option>
            </select>
          </div>

          <!-- Availability -->
          <div class="form-group">
            <label class="form-label">Availability</label>
            <select name="availability" class="form-select">
              <option value="">Any Status</option>
              <option value="available" ${filters.availability === 'available' ? 'selected' : ''}>Available Now</option>
            </select>
          </div>

          <button type="submit" class="btn btn-primary" style="width: 100%; margin-top: 0.5rem; font-weight: 600;">
            Apply Filters
          </button>
        </form>
      </aside>

      <!-- Right Section (Professional Cards Grid) - Independent Scroll -->
      <section class="pros-results-panel" id="pros-results-scroll-container">
        
        <!-- Desktop Page Header -->
        <div class="pros-desktop-header" style="margin-bottom: 1.5rem;">
          <h1 style="font-size: 1.85rem; font-weight: 800; color: var(--primary); margin-bottom: 0.35rem; letter-spacing: -0.02em;">
            Find Skilled Professionals
          </h1>
          <p style="color: var(--text-muted); font-size: 0.95rem; margin: 0;">
            Showing ${total} verified trade specialists and contractors ready for your project.
          </p>
        </div>

        <!-- Sort & Count Header Bar -->
        <div style="background: var(--bg-surface); border: 1px solid var(--border); border-radius: var(--radius-md); padding: 0.85rem 1.25rem; margin-bottom: 1.5rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.75rem; box-shadow: var(--shadow-sm);">
          <div style="font-size: 0.9rem; font-weight: 600; color: var(--text-main); display: flex; align-items: center; gap: 0.5rem;">
            <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: #10b981;"></span>
            <span>${total} professionals found</span>
          </div>
          
          <div style="display: flex; align-items: center; gap: 0.75rem;">
            <span style="font-size: 0.85rem; color: var(--text-muted); font-weight: 500;">Sort By:</span>
            <select onchange="handleSortChange(this.value)" class="form-select" style="width: auto; padding: 0.4rem 0.85rem; font-size: 0.85rem; border-radius: var(--radius-sm);">
              <option value="rating" ${filters.sortBy === 'rating' ? 'selected' : ''}>Highest Rated</option>
              <option value="experience" ${filters.sortBy === 'experience' ? 'selected' : ''}>Most Experienced</option>
              <option value="reviews" ${filters.sortBy === 'reviews' ? 'selected' : ''}>Most Reviews</option>
              <option value="price_asc" ${filters.sortBy === 'price_asc' ? 'selected' : ''}>Starting Price: Low to High</option>
            </select>
          </div>
        </div>

        <!-- Cards Grid -->
        ${
          professionals.length === 0
            ? `
          <div style="background: var(--bg-surface); border: 1px solid var(--border); border-radius: var(--radius-md); padding: 3.5rem 1.5rem; text-align: center;">
            <div style="font-size: 2.5rem; margin-bottom: 1rem;">🔍</div>
            <h3 style="font-size: 1.25rem; font-weight: 700; color: var(--primary); margin-bottom: 0.5rem;">No professionals found</h3>
            <p style="color: var(--text-muted); font-size: 0.9rem; max-width: 420px; margin: 0 auto 1.5rem;">
              Try broadening your search keywords, clearing your location filters, or checking back soon as more verified specialists join Workdone.
            </p>
            <a href="/professionals" class="btn btn-outline btn-sm">Clear All Filters</a>
          </div>
        `
            : `
          <div class="pros-cards-grid">
            ${professionals
              .map(
                (pro) => `
              <div class="pro-card">
                <div style="position: relative;">
                  <img src="${pro.coverImage || 'https://images.unsplash.com/photo-1541888946425-d0fbb186f5f7?auto=format&fit=crop&w=800&q=80'}" alt="${escapeHtml(pro.businessName || pro.user?.name || '')}" class="pro-card-cover" style="height: 160px;">
                  <button onclick="WorkdoneApp.toggleSave('${pro.id}', this)" class="btn btn-sm" style="position: absolute; top: 10px; right: 10px; background: rgba(255,255,255,0.85); backdrop-filter: blur(4px); border-radius: 50%; width: 34px; height: 34px; padding: 0; display: flex; align-items: center; justify-content: center; font-size: 1rem;" title="Save / Bookmark">
                    ♥
                  </button>
                </div>

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
                    <span style="margin-left: auto; font-weight: 600; color: var(--primary);">
                      ${pro.startingPrice ? `From $${pro.startingPrice}/hr` : 'Custom Quote'}
                    </span>
                  </div>

                  <div class="pro-actions-row">
                    <a href="/professionals/${pro.id}" class="btn btn-outline btn-sm" style="flex: 1;">View Profile</a>
                    <a href="/professionals/${pro.id}#book" class="btn btn-primary btn-sm" style="flex: 1;">Request Booking</a>
                    <button onclick="WorkdoneApp.toggleCompare('${pro.id}', '${escapeHtml(pro.user?.name || '')}')" class="btn btn-outline btn-sm" title="Compare" style="padding: 0.4rem 0.65rem;">⚖️</button>
                  </div>
                </div>
              </div>
            `
              )
              .join('')}
          </div>

          <!-- Pagination -->
          ${
            totalPages > 1
              ? `
            <div style="display: flex; justify-content: center; align-items: center; gap: 0.5rem; margin-top: 2.5rem; margin-bottom: 2rem;">
              ${page > 1 ? `<a href="${buildPageUrl(page - 1, filters)}" class="btn btn-outline btn-sm">&larr; Previous</a>` : ''}
              <span style="font-size: 0.875rem; color: var(--text-muted); margin: 0 0.5rem;">
                Page ${page} of ${totalPages}
              </span>
              ${page < totalPages ? `<a href="${buildPageUrl(page + 1, filters)}" class="btn btn-outline btn-sm">Next &rarr;</a>` : ''}
            </div>
          `
              : ''
          }
        `
        }

        <!-- Compact Bottom Note / End of results -->
        <div style="margin-top: 3.5rem; padding-top: 1.5rem; border-top: 1px solid var(--border); text-align: center; color: var(--text-muted); font-size: 0.825rem;">
          Need emergency repairs or custom enterprise estimates? <a href="/contact" style="color: var(--secondary); font-weight: 600; text-decoration: underline;">Contact Support</a> or call 24/7 on-call specialists.
        </div>
      </section>
    </div>

    <script>
      function handleSortChange(sortBy) {
        const url = new URL(window.location.href);
        url.searchParams.set('sortBy', sortBy);
        url.searchParams.set('page', '1');
        window.location.href = url.toString();
      }

      function getPageUrl(pageNum) {
        const url = new URL(window.location.href);
        url.searchParams.set('page', pageNum.toString());
        return url.pathname + url.search;
      }

      document.addEventListener('DOMContentLoaded', function() {
        // Enhancement #1: Location pre-fill on search page
        var cityInput = document.getElementById('search-city-input');
        var locHint = document.getElementById('loc-saved-hint');
        var locChangeBtn = document.getElementById('loc-change-btn');
        if (cityInput && !cityInput.value.trim()) {
          var saved = WdLocation.getSaved();
          if (saved) {
            cityInput.value = saved;
            cityInput.classList.add('search-field-prefilled');
            if (locHint) locHint.style.display = 'block';
            if (locChangeBtn) locChangeBtn.style.display = 'inline';
          }
        } else if (cityInput && cityInput.value.trim()) {
          if (locChangeBtn) locChangeBtn.style.display = 'inline';
        }

        // Save city on filter form submit
        var form = document.getElementById('search-filters-form');
        if (form) {
          form.addEventListener('submit', function() {
            var v = cityInput ? cityInput.value.trim() : '';
            if (v) WdLocation.save(v);
          });
        }

        // Enhancement #2: Smart keyword→category sync
        var params = new URLSearchParams(window.location.search);
        var kw = params.get('keyword') || '';
        var catSelect = document.querySelector('select[name="category"]');
        if (kw && catSelect && (catSelect.value === '' || catSelect.value === 'all' || catSelect.value === 'All Categories')) {
          var matched = WdSmartFilter.getCategory(kw);
          if (matched) {
            var opt = catSelect.querySelector('option[value="' + matched + '"]');
            if (opt) {
              catSelect.value = matched;
              // Update URL to reflect synced category (passive — no redirect)
              var newUrl = new URL(window.location.href);
              newUrl.searchParams.set('category', matched);
              window.history.replaceState({}, '', newUrl.toString());
            }
          }
        }
      });
    </script>
  `;
}

function getVerificationBadge(status: string): string {
  if (status === 'FULLY_VERIFIED') {
    return `<span class="badge badge-verified" title="Identity, Business Registration and Qualifications reviewed">✓ Verified</span>`;
  }
  if (status === 'BUSINESS_VERIFIED') {
    return `<span class="badge badge-verified" title="Business registration documents reviewed">✓ Business Verified</span>`;
  }
  if (status === 'IDENTITY_VERIFIED') {
    return `<span class="badge badge-verified" title="Government identity credentials reviewed">✓ ID Verified</span>`;
  }
  return `<span class="badge badge-pending" title="Verification in progress">Pending Review</span>`;
}

function escapeHtml(str: string): string {
  if (typeof str !== 'string') return '';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}
