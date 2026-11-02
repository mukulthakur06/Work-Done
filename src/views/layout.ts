// Workdone Base HTML Layout Shell with Navigation & Modals
import type { SessionData } from '../types/index.ts';

export interface LayoutOptions {
  title?: string;
  description?: string;
  currentPath?: string;
  session?: SessionData | null;
  unreadNotificationsCount?: number;
}

export function renderLayout(content: string, options: LayoutOptions = {}): string {
  const title = options.title ? `${options.title} — Workdone` : 'Workdone — Find the Right Professional. Get the Job Done Right.';
  const description = options.description || 'Discover and hire verified local home improvement, repair, and renovation professionals with portfolios, transparent estimates, and genuine reviews.';
  const session = options.session || null;
  const currentPath = options.currentPath || '/';
  const notifCount = options.unreadNotificationsCount || 0;

  let dashboardUrl = '/dashboard/customer';
  let dashboardLabel = 'Customer Dashboard';
  if (session?.role === 'PROFESSIONAL') {
    dashboardUrl = '/dashboard/pro';
    dashboardLabel = 'Professional Dashboard';
  } else if (session?.role === 'ADMIN') {
    dashboardUrl = '/admin';
    dashboardLabel = 'Admin Dashboard';
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}">
  <link rel="stylesheet" href="/css/app.css">
  <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🔨</text></svg>">
</head>
<body class="${currentPath === '/professionals' ? 'layout-professionals' : ''}">

  <!-- Navigation Bar -->
  <header class="site-header">
    <div class="container nav-container">
      <!-- Brand Logo -->
      <a href="/" class="logo-link" title="Work Done Homepage">
        <div class="logo-badge">
          <!-- House & Tools Checkmark Symbol -->
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            <polyline points="9 22 9 12 15 12 15 22"/>
            <path d="m9 12 2 2 4-4" stroke="#10b981" stroke-width="2.5"/>
          </svg>
        </div>
        <span class="logo-text">Work <span class="logo-text-accent">Done</span></span>
      </a>

      <!-- Desktop Nav Links -->
      <nav aria-label="Main Navigation">
        <ul class="nav-links">
          <li><a href="/professionals" class="nav-link ${currentPath.startsWith('/professionals') ? 'active' : ''}">Find Talent</a></li>
          <li><a href="/categories" class="nav-link ${currentPath === '/categories' ? 'active' : ''}">Services</a></li>
          <li><a href="/how-it-works" class="nav-link ${currentPath === '/how-it-works' ? 'active' : ''}">How It Works</a></li>
          <li><a href="/for-professionals" class="nav-link ${currentPath === '/for-professionals' ? 'active' : ''}">Join as a Pro</a></li>
        </ul>
      </nav>

      <!-- User Auth & Action Buttons -->
      <div class="nav-actions">
        ${
          session
            ? `
          <!-- Notifications Pill -->
          <div style="position: relative;">
            <a href="${dashboardUrl}?tab=notifications" class="btn btn-ghost btn-sm" title="Notifications" style="position: relative; padding: 0.5rem 0.65rem;">
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
              </svg>
              ${
                notifCount > 0
                  ? `<span style="position: absolute; top: -3px; right: -3px; background: #ef4444; color: #fff; border-radius: 9999px; width: 18px; height: 18px; font-size: 0.7rem; display: flex; align-items: center; justify-content: center; font-weight: bold;">${notifCount}</span>`
                  : ''
              }
            </a>
          </div>

          <!-- User Menu Dropdown -->
          <div style="display: flex; align-items: center; gap: 0.5rem;">
            <a href="${dashboardUrl}" class="btn btn-outline btn-sm" style="font-weight: 600;">
              ${escapeHtml(session.name)} (${session.role === 'PROFESSIONAL' ? 'Pro' : session.role === 'ADMIN' ? 'Admin' : 'Customer'})
            </a>
            <button onclick="handleLogout()" class="btn btn-ghost btn-sm" style="color: #ef4444;">Sign Out</button>
          </div>
        `
            : `
          <button onclick="WorkdoneApp.openModal('signin-modal')" class="btn btn-ghost btn-sm">Sign In</button>
          <a href="/professionals" class="btn btn-primary btn-sm">Get Started</a>
        `
        }

        <!-- Mobile Menu Toggle Button -->
        <button class="mobile-menu-btn" onclick="toggleMobileNav()" aria-label="Toggle navigation menu">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </button>
      </div>
    </div>

    <!-- Mobile Dropdown Menu -->
    <div id="mobile-nav-menu" class="mobile-nav-menu">
      <a href="/professionals" class="mobile-nav-link ${currentPath.startsWith('/professionals') ? 'active' : ''}">Find Talent</a>
      <a href="/categories" class="mobile-nav-link ${currentPath === '/categories' ? 'active' : ''}">Services</a>
      <a href="/how-it-works" class="mobile-nav-link ${currentPath === '/how-it-works' ? 'active' : ''}">How It Works</a>
      <a href="/for-professionals" class="mobile-nav-link ${currentPath === '/for-professionals' ? 'active' : ''}">Join as a Pro</a>
      <a href="/contact" class="mobile-nav-link ${currentPath === '/contact' ? 'active' : ''}">Contact Support</a>
    </div>
  </header>

  <!-- Main Content Container -->
  <main class="${currentPath === '/professionals' ? 'main-professionals' : 'main-default'}" style="flex: 1;">
    ${content}
  </main>

  <!-- Site Footer -->
  <footer class="site-footer" style="background: #0f172a; color: #cbd5e1; padding: 4.5rem 0 2.5rem; border-top: 1px solid #1e293b;">
    <div class="container">
      
      <!-- Newsletter & Inquiries Bar (Saved to Supabase) -->
      <div style="background: rgba(30, 41, 59, 0.7); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: var(--radius-lg); padding: 1.75rem 2rem; margin-bottom: 3.5rem; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1.5rem;">
        <div style="max-width: 500px;">
          <h4 style="font-size: 1.1rem; font-weight: 700; color: #fff; margin-bottom: 0.35rem;">
            Stay Updated with Verified Home Guidance
          </h4>
          <p style="font-size: 0.85rem; color: #94a3b8; margin: 0;">
            Subscribe to receive seasonal price guidance, renovation checklists, and verified contractor insights.
          </p>
        </div>
        <form onsubmit="handleNewsletterSubmit(event, this)" style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
          <input type="email" name="email" required placeholder="Enter your email address" style="background: #0f172a; border: 1px solid #334155; color: #fff; padding: 0.65rem 1rem; border-radius: var(--radius-md); font-size: 0.875rem; min-width: 260px;">
          <button type="submit" class="btn btn-secondary btn-sm" style="padding: 0.65rem 1.25rem;">
            Subscribe
          </button>
        </form>
      </div>

      <div style="display: grid; grid-template-columns: 1.5fr repeat(4, 1fr); gap: 2.5rem; margin-bottom: 3.5rem;">
        <div>
          <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 1rem;">
            <div style="width: 32px; height: 32px; border-radius: 8px; background: #0d9488; display: flex; align-items: center; justify-content: center; color: #fff;">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                <polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
            </div>
            <span style="font-size: 1.3rem; font-weight: 800; color: #fff;">Work <span style="color: #2dd4bf;">Done</span></span>
          </div>
          <p style="font-size: 0.9rem; color: #94a3b8; line-height: 1.6; margin-bottom: 1.25rem;">
            Find the right professional. Get the job done right. A modern marketplace connecting homeowners with verified local craftspeople and contractors.
          </p>
          <div style="font-size: 0.8rem; color: #64748b;">
            Austin, Texas &bull; Seattle, Washington
          </div>
        </div>

        <div>
          <div style="font-weight: 700; color: #fff; margin-bottom: 1rem; font-size: 0.95rem;">Customers</div>
          <ul style="list-style: none; display: flex; flex-direction: column; gap: 0.65rem; font-size: 0.875rem;">
            <li><a href="/professionals" style="color: #94a3b8; transition: color 0.15s;" onmouseover="this.style.color='#fff'" onmouseout="this.style.color='#94a3b8'">Find Talent</a></li>
            <li><a href="/categories" style="color: #94a3b8; transition: color 0.15s;" onmouseover="this.style.color='#fff'" onmouseout="this.style.color='#94a3b8'">Services</a></li>
            <li><a href="/how-it-works" style="color: #94a3b8; transition: color 0.15s;" onmouseover="this.style.color='#fff'" onmouseout="this.style.color='#94a3b8'">How It Works</a></li>
            <li><a href="/dashboard/customer" style="color: #94a3b8; transition: color 0.15s;" onmouseover="this.style.color='#fff'" onmouseout="this.style.color='#94a3b8'">Customer Dashboard</a></li>
          </ul>
        </div>

        <div>
          <div style="font-weight: 700; color: #fff; margin-bottom: 1rem; font-size: 0.95rem;">Professionals</div>
          <ul style="list-style: none; display: flex; flex-direction: column; gap: 0.65rem; font-size: 0.875rem;">
            <li><a href="/for-professionals" style="color: #94a3b8; transition: color 0.15s;" onmouseover="this.style.color='#fff'" onmouseout="this.style.color='#94a3b8'">Join as a Pro</a></li>
            <li><a href="/for-professionals#verification" style="color: #94a3b8; transition: color 0.15s;" onmouseover="this.style.color='#fff'" onmouseout="this.style.color='#94a3b8'">Verification Program</a></li>
            <li><a href="/dashboard/pro" style="color: #94a3b8; transition: color 0.15s;" onmouseover="this.style.color='#fff'" onmouseout="this.style.color='#94a3b8'">Pro Dashboard</a></li>
            <li><a href="/community-guidelines" style="color: #94a3b8; transition: color 0.15s;" onmouseover="this.style.color='#fff'" onmouseout="this.style.color='#94a3b8'">Workmanship Standards</a></li>
          </ul>
        </div>

        <div>
          <div style="font-weight: 700; color: #fff; margin-bottom: 1rem; font-size: 0.95rem;">Trust & Legal</div>
          <ul style="list-style: none; display: flex; flex-direction: column; gap: 0.65rem; font-size: 0.875rem;">
            <li><a href="/privacy-policy" style="color: #94a3b8;" onmouseover="this.style.color='#fff'" onmouseout="this.style.color='#94a3b8'">Privacy Policy</a></li>
            <li><a href="/terms-conditions" style="color: #94a3b8;" onmouseover="this.style.color='#fff'" onmouseout="this.style.color='#94a3b8'">Terms & Conditions</a></li>
            <li><a href="/community-guidelines" style="color: #94a3b8;" onmouseover="this.style.color='#fff'" onmouseout="this.style.color='#94a3b8'">Community Guidelines</a></li>
            <li><a href="/report-a-problem" style="color: #94a3b8;" onmouseover="this.style.color='#fff'" onmouseout="this.style.color='#94a3b8'">Report a Problem</a></li>
          </ul>
        </div>

        <div>
          <div style="font-weight: 700; color: #fff; margin-bottom: 1rem; font-size: 0.95rem;">Support</div>
          <ul style="list-style: none; display: flex; flex-direction: column; gap: 0.65rem; font-size: 0.875rem;">
            <li><a href="/help-center" style="color: #94a3b8;" onmouseover="this.style.color='#fff'" onmouseout="this.style.color='#94a3b8'">Help Center</a></li>
            <li><a href="/contact" style="color: #94a3b8;" onmouseover="this.style.color='#fff'" onmouseout="this.style.color='#94a3b8'">Contact Support</a></li>
            <li><a href="/admin" style="color: #94a3b8;" onmouseover="this.style.color='#fff'" onmouseout="this.style.color='#94a3b8'">Admin Portal</a></li>
          </ul>
        </div>
      </div>

      <div style="padding-top: 2rem; border-top: 1px solid #1e293b; display: flex; justify-content: space-between; align-items: center; font-size: 0.85rem; color: #64748b;">
        <div>&copy; 2026 Workdone Technologies, Inc. All rights reserved.</div>
        <div style="display: flex; gap: 1.5rem;">
          <span>Austin &bull; Seattle &bull; Dallas &bull; Houston</span>
        </div>
      </div>
    </div>
  </footer>

  <!-- Modal: Sign In -->
  <div id="signin-modal" class="modal-overlay" style="display: none;">
    <div class="modal-dialog" style="max-width: 440px;">
      <div class="modal-header">
        <h3 class="modal-title">Sign In to Workdone</h3>
        <button class="modal-close" onclick="WorkdoneApp.closeModal('signin-modal')">&times;</button>
      </div>
      <form onsubmit="handleLoginSubmit(event, this)">
        <div class="form-group">
          <label class="form-label">Email Address</label>
          <input type="email" name="email" required class="form-input" placeholder="name@example.com">
        </div>
        <div class="form-group">
          <label class="form-label">Password</label>
          <input type="password" name="password" required class="form-input" placeholder="••••••••">
        </div>
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem; font-size: 0.85rem;">
          <label style="display: flex; align-items: center; gap: 0.35rem; color: var(--text-muted); cursor: pointer;">
            <input type="checkbox" checked> Remember me
          </label>
          <a href="#" onclick="alert('Password reset instructions will be sent to your verified email.'); return false;" style="color: var(--secondary);">Forgot password?</a>
        </div>
        <button type="submit" class="btn btn-primary" style="width: 100%; padding: 0.75rem;">Sign In</button>
        <div style="margin-top: 1.25rem; text-align: center; font-size: 0.875rem; color: var(--text-muted);">
          Don't have an account yet?
          <button type="button" onclick="WorkdoneApp.closeModal('signin-modal'); WorkdoneApp.openModal('register-choice-modal');" style="color: var(--secondary); background: none; border: none; font-weight: 600; cursor: pointer;">Create Account</button>
        </div>
      </form>
    </div>
  </div>

  <!-- Modal: Registration Choice -->
  <div id="register-choice-modal" class="modal-overlay" style="display: none;">
    <div class="modal-dialog" style="max-width: 520px;">
      <div class="modal-header">
        <h3 class="modal-title">Join Workdone</h3>
        <button class="modal-close" onclick="WorkdoneApp.closeModal('register-choice-modal')">&times;</button>
      </div>
      <p style="color: var(--text-muted); font-size: 0.95rem; margin-bottom: 1.5rem;">
        Choose the account type that best matches your needs:
      </p>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1.5rem;">
        <div onclick="window.location.href='/register/customer'" style="border: 2px solid var(--border); border-radius: var(--radius-md); padding: 1.5rem 1rem; text-align: center; cursor: pointer; transition: all 0.15s;" onmouseover="this.style.borderColor='var(--secondary)'" onmouseout="this.style.borderColor='var(--border)'">
          <div style="font-size: 2rem; margin-bottom: 0.5rem;">🏡</div>
          <div style="font-weight: 700; color: var(--primary); margin-bottom: 0.35rem;">Customer</div>
          <div style="font-size: 0.8rem; color: var(--text-muted);">I want to hire professionals for home repairs & renovation.</div>
        </div>
        <div onclick="window.location.href='/register/pro'" style="border: 2px solid var(--border); border-radius: var(--radius-md); padding: 1.5rem 1rem; text-align: center; cursor: pointer; transition: all 0.15s;" onmouseover="this.style.borderColor='var(--secondary)'" onmouseout="this.style.borderColor='var(--border)'">
          <div style="font-size: 2rem; margin-bottom: 0.5rem;">🛠️</div>
          <div style="font-weight: 700; color: var(--primary); margin-bottom: 0.35rem;">Professional</div>
          <div style="font-size: 0.8rem; color: var(--text-muted);">I am a craftsperson or contractor offering services.</div>
        </div>
      </div>
    </div>
  </div>

  <script src="/js/app.js"></script>
  <script>
    async function handleLoginSubmit(e, form) {
      e.preventDefault();
      const btn = form.querySelector('button[type="submit"]');
      btn.disabled = true;
      btn.innerText = 'Signing In...';
      const body = Object.fromEntries(new FormData(form).entries());
      try {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        });
        const data = await res.json();
        if (!res.ok) {
          WorkdoneApp.showToast(data.error || 'Login failed.', 'error');
          btn.disabled = false;
          btn.innerText = 'Sign In';
          return;
        }
        WorkdoneApp.showToast('Welcome back, ' + data.user.name + '!');
        setTimeout(() => window.location.reload(), 800);
      } catch {
        WorkdoneApp.showToast('Network error during login.', 'error');
        btn.disabled = false;
        btn.innerText = 'Sign In';
      }
    }

    async function handleLogout() {
      try {
        await fetch('/api/auth/logout', { method: 'POST' });
        window.location.href = '/';
      } catch (err) {
        window.location.reload();
      }
    }

    async function handleNewsletterSubmit(e, form) {
      e.preventDefault();
      const btn = form.querySelector('button[type="submit"]');
      const input = form.querySelector('input[type="email"]');
      const orig = btn.innerText;
      btn.disabled = true;
      btn.innerText = 'Subscribing...';
      try {
        const res = await fetch('/api/newsletter', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: input.value.trim() })
        });
        const data = await res.json();
        if (res.ok && data.success) {
          WorkdoneApp.showToast('Subscribed! Saved to Supabase backend.', 'success');
          form.reset();
        } else {
          WorkdoneApp.showToast(data.error || 'Subscription failed.', 'error');
        }
      } catch (err) {
        WorkdoneApp.showToast('Error subscribing. Please try again.', 'error');
      } finally {
        btn.disabled = false;
        btn.innerText = orig;
      }
    }

    function toggleMobileNav() {
      const menu = document.getElementById('mobile-nav-menu');
      if (menu) {
        menu.classList.toggle('open');
      }
    }
  </script>
</body>
</html>`;
}

function escapeHtml(str: string): string {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
