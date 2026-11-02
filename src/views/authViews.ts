// Workdone Authentication & Registration Dedicated Views
import type { ServiceCategory } from '../types/index.ts';

export function renderCustomerRegisterView(): string {
  return `
    <div class="container" style="max-width: 520px; padding: 4rem 1.25rem;">
      <div style="background: var(--bg-surface); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 2.5rem; box-shadow: var(--shadow-lg);">
        <div style="text-align: center; margin-bottom: 2rem;">
          <h1 style="font-size: 1.75rem; font-weight: 800; color: var(--primary); margin-bottom: 0.5rem;">
            Create Customer Account
          </h1>
          <p style="color: var(--text-muted); font-size: 0.9rem;">
            Discover, hire, and review verified local professionals with confidence.
          </p>
        </div>

        <form onsubmit="handleCustomerRegisterSubmit(event, this)">
          <div class="form-group">
            <label class="form-label">Full Name *</label>
            <input type="text" name="name" required class="form-input" placeholder="e.g. Sarah Jenkins">
          </div>

          <div class="form-group">
            <label class="form-label">Email Address *</label>
            <input type="email" name="email" required class="form-input" placeholder="name@example.com">
          </div>

          <div class="form-group">
            <label class="form-label">Password *</label>
            <input type="password" name="password" required minlength="8" class="form-input" placeholder="At least 8 characters">
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
            <div class="form-group">
              <label class="form-label">City</label>
              <input type="text" name="city" class="form-input" placeholder="e.g. Austin">
            </div>
            <div class="form-group">
              <label class="form-label">Locality / Area</label>
              <input type="text" name="locality" class="form-input" placeholder="e.g. Downtown">
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Phone Number (Optional)</label>
            <input type="tel" name="phone" class="form-input" placeholder="+1-555-0100">
          </div>

          <button type="submit" class="btn btn-primary" style="width: 100%; padding: 0.85rem; font-weight: 700; margin-top: 0.5rem;">
            Create Customer Account
          </button>
        </form>

        <div style="margin-top: 1.5rem; text-align: center; font-size: 0.875rem; color: var(--text-muted);">
          Are you a professional contractor?
          <a href="/register/pro" style="color: var(--secondary); font-weight: 600;">Join as a Professional &rarr;</a>
        </div>
      </div>
    </div>

    <script>
      async function handleCustomerRegisterSubmit(e, form) {
        e.preventDefault();
        const btn = form.querySelector('button[type="submit"]');
        btn.disabled = true;
        btn.innerText = 'Creating Account...';

        const body = Object.fromEntries(new FormData(form).entries());
        try {
          const res = await fetch('/api/auth/register-customer', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
          });
          const data = await res.json();
          if (!res.ok) {
            WorkdoneApp.showToast(data.error || 'Registration failed.', 'error');
            btn.disabled = false;
            btn.innerText = 'Create Customer Account';
            return;
          }
          WorkdoneApp.showToast('Account created! Welcome to Workdone.');
          setTimeout(() => {
            window.location.href = '/dashboard/customer';
          }, 800);
        } catch {
          WorkdoneApp.showToast('Network error during registration.', 'error');
          btn.disabled = false;
          btn.innerText = 'Create Customer Account';
        }
      }
    </script>
  `;
}

export function renderProRegisterView(categories: ServiceCategory[]): string {
  return `
    <div class="container" style="max-width: 680px; padding: 4rem 1.25rem;">
      <div style="background: var(--bg-surface); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 2.5rem; box-shadow: var(--shadow-lg);">
        <div style="text-align: center; margin-bottom: 2rem;">
          <span style="color: var(--secondary); font-size: 0.85rem; font-weight: 700; text-transform: uppercase;">Professional Registration</span>
          <h1 style="font-size: 1.85rem; font-weight: 800; color: var(--primary); margin: 0.25rem 0 0.5rem;">
            Grow Your Home Service Business
          </h1>
          <p style="color: var(--text-muted); font-size: 0.9rem;">
            Showcase your craft, manage bookings with itemized quotes, and collect verified customer reviews.
          </p>
        </div>

        <form onsubmit="handleProRegisterSubmit(event, this)">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
            <div class="form-group">
              <label class="form-label">Full Name *</label>
              <input type="text" name="name" required class="form-input" placeholder="e.g. Marcus Vance">
            </div>
            <div class="form-group">
              <label class="form-label">Business / Brand Name</label>
              <input type="text" name="businessName" class="form-input" placeholder="e.g. Vance Custom Woodcraft">
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
            <div class="form-group">
              <label class="form-label">Email Address *</label>
              <input type="email" name="email" required class="form-input" placeholder="pro@example.com">
            </div>
            <div class="form-group">
              <label class="form-label">Phone Number *</label>
              <input type="tel" name="phone" required class="form-input" placeholder="+1-555-0100">
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Password *</label>
            <input type="password" name="password" required minlength="8" class="form-input" placeholder="At least 8 characters">
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
            <div class="form-group">
              <label class="form-label">Primary Trade / Specialty *</label>
              <select name="primaryServiceSlug" required class="form-select">
                ${categories
                  .map(
                    (cat) => `
                  <option value="${cat.slug}">${escapeHtml(cat.name)}</option>
                `
                  )
                  .join('')}
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Years of Experience *</label>
              <input type="number" name="yearsExperience" min="1" max="50" value="5" required class="form-input">
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
            <div class="form-group">
              <label class="form-label">Primary Service City *</label>
              <input type="text" name="city" required class="form-input" placeholder="e.g. Austin">
            </div>
            <div class="form-group">
              <label class="form-label">Starting Hourly Rate ($) (Optional)</label>
              <input type="number" name="startingPrice" class="form-input" placeholder="e.g. 75">
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Professional Bio &amp; Qualifications *</label>
            <textarea name="bio" required minlength="15" class="form-textarea" placeholder="Detail your training, equipment, warranty policies, and types of projects you take on..."></textarea>
          </div>

          <div class="form-group">
            <label class="form-label">Working Hours &amp; Days</label>
            <input type="text" name="workingHours" value="8:00 AM - 6:00 PM, Mon-Sat" class="form-input">
          </div>

          <button type="submit" class="btn btn-secondary" style="width: 100%; padding: 0.85rem; font-weight: 700; margin-top: 0.5rem;">
            Register as a Workdone Professional
          </button>
        </form>

        <div style="margin-top: 1.5rem; text-align: center; font-size: 0.875rem; color: var(--text-muted);">
          Looking to hire a professional instead?
          <a href="/register/customer" style="color: var(--secondary); font-weight: 600;">Sign up as a Customer &rarr;</a>
        </div>
      </div>
    </div>

    <script>
      async function handleProRegisterSubmit(e, form) {
        e.preventDefault();
        const btn = form.querySelector('button[type="submit"]');
        btn.disabled = true;
        btn.innerText = 'Creating Profile...';

        const body = Object.fromEntries(new FormData(form).entries());
        try {
          const res = await fetch('/api/auth/register-pro', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
          });
          const data = await res.json();
          if (!res.ok) {
            WorkdoneApp.showToast(data.error || 'Registration failed.', 'error');
            btn.disabled = false;
            btn.innerText = 'Register as a Workdone Professional';
            return;
          }
          WorkdoneApp.showToast('Professional account created! Welcome to your workspace.');
          setTimeout(() => {
            window.location.href = '/dashboard/pro';
          }, 800);
        } catch {
          WorkdoneApp.showToast('Network error during registration.', 'error');
          btn.disabled = false;
          btn.innerText = 'Register as a Workdone Professional';
        }
      }
    </script>
  `;
}

function escapeHtml(str: string): string {
  if (typeof str !== 'string') return '';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}
