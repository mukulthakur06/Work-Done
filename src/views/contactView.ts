// Workdone Contact & Inquiry View
import type { SessionData } from '../types/index.ts';

export function renderContactView(session?: SessionData | null): string {
  return `
    <div style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); color: #fff; padding: 4rem 1.25rem 3.5rem; text-align: center;">
      <div class="container" style="max-width: 720px;">
        <span style="color: #2dd4bf; font-size: 0.825rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; display: inline-block; margin-bottom: 0.75rem;">
          Get in Touch
        </span>
        <h1 style="font-size: 2.5rem; font-weight: 800; color: #fff; margin-bottom: 0.75rem; letter-spacing: -0.02em;">
          Contact Workdone Support & Inquiries
        </h1>
        <p style="color: #94a3b8; font-size: 1.05rem; line-height: 1.6; margin: 0 auto;">
          Have questions about booking a professional, joining our verified contractor network, or seeking custom project consultation? Fill out the form below.
        </p>
      </div>
    </div>

    <div class="container" style="max-width: 900px; padding: 3.5rem 1.25rem;">
      <div style="display: grid; grid-template-columns: 1fr 1.6fr; gap: 2.5rem; align-items: start;">
        
        <!-- Left Column: Info Card -->
        <div>
          <div style="background: var(--bg-surface); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 1.75rem; margin-bottom: 1.5rem; box-shadow: var(--shadow-sm);">
            <h3 style="font-size: 1.15rem; font-weight: 700; color: var(--primary); margin-bottom: 1rem;">
              Direct Channels
            </h3>
            
            <div style="display: flex; gap: 0.75rem; margin-bottom: 1.25rem; align-items: flex-start;">
              <div style="width: 38px; height: 38px; border-radius: 50%; background: #f0fdfa; color: #0d9488; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
              </div>
              <div>
                <strong style="display: block; font-size: 0.9rem; color: var(--text-dark);">Email Support</strong>
                <span style="font-size: 0.85rem; color: var(--text-muted);">support@workdone.local</span>
              </div>
            </div>

            <div style="display: flex; gap: 0.75rem; margin-bottom: 1.25rem; align-items: flex-start;">
              <div style="width: 38px; height: 38px; border-radius: 50%; background: #eff6ff; color: #2563eb; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
              </div>
              <div>
                <strong style="display: block; font-size: 0.9rem; color: var(--text-dark);">Helpline &amp; WhatsApp</strong>
                <span style="font-size: 0.85rem; color: var(--text-muted);">+91 (080) 4123-8899</span>
              </div>
            </div>

            <div style="display: flex; gap: 0.75rem; align-items: flex-start;">
              <div style="width: 38px; height: 38px; border-radius: 50%; background: #fef3c7; color: #d97706; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              </div>
              <div>
                <strong style="display: block; font-size: 0.9rem; color: var(--text-dark);">Support Hours</strong>
                <span style="font-size: 0.85rem; color: var(--text-muted);">Mon &ndash; Sat: 8:00 AM &ndash; 8:00 PM</span>
              </div>
            </div>
          </div>

          <div style="background: #f8fafc; border: 1px dashed var(--border); border-radius: var(--radius-lg); padding: 1.5rem;">
            <div style="font-size: 0.875rem; font-weight: 700; color: var(--primary); margin-bottom: 0.5rem; display: flex; align-items: center; gap: 0.5rem;">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0d9488" stroke-width="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              Cloud Synchronized Backend
            </div>
            <p style="font-size: 0.825rem; color: var(--text-muted); line-height: 1.5; margin: 0;">
              All inquiries submitted through this portal are instantly logged to our secure Supabase database and dispatched to our moderation queue for rapid response.
            </p>
          </div>
        </div>

        <!-- Right Column: Interactive Form -->
        <div style="background: var(--bg-surface); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 2.25rem; box-shadow: var(--shadow-md);">
          <h2 style="font-size: 1.4rem; font-weight: 700; color: var(--primary); margin-bottom: 0.5rem;">
            Send Us an Inquiry
          </h2>
          <p style="font-size: 0.875rem; color: var(--text-muted); margin-bottom: 1.75rem;">
            We typically reply within 2 to 4 business hours.
          </p>

          <form id="contact-inquiry-form" onsubmit="handleContactInquirySubmit(event, this)">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1.25rem;">
              <div class="form-group" style="margin-bottom: 0;">
                <label class="form-label">Full Name <span style="color:#ef4444;">*</span></label>
                <input type="text" name="name" required class="form-input" placeholder="e.g. Vikram Malhotra" value="${session ? escapeHtml(session.name) : ''}">
              </div>
              <div class="form-group" style="margin-bottom: 0;">
                <label class="form-label">Email Address <span style="color:#ef4444;">*</span></label>
                <input type="email" name="email" required class="form-input" placeholder="name@example.com" value="${session ? escapeHtml(session.email) : ''}">
              </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1.25rem;">
              <div class="form-group" style="margin-bottom: 0;">
                <label class="form-label">Phone / WhatsApp</label>
                <input type="tel" name="phone" class="form-input" placeholder="+91 98765 43210">
              </div>
              <div class="form-group" style="margin-bottom: 0;">
                <label class="form-label">Inquiry Type <span style="color:#ef4444;">*</span></label>
                <select name="inquiry_type" required class="form-input">
                  <option value="general">General Inquiry</option>
                  <option value="support">Customer &amp; Booking Support</option>
                  <option value="partnership">Contractor / Pro Partnership</option>
                  <option value="report">Report a Concern</option>
                  <option value="feedback">Platform Feedback</option>
                </select>
              </div>
            </div>

            <div class="form-group" style="margin-bottom: 1.25rem;">
              <label class="form-label">Subject</label>
              <input type="text" name="subject" class="form-input" placeholder="Brief summary of your inquiry">
            </div>

            <div class="form-group" style="margin-bottom: 1.5rem;">
              <label class="form-label">Message / Details <span style="color:#ef4444;">*</span></label>
              <textarea name="message" required rows="5" class="form-input" placeholder="Please describe how we can assist you with your home services project..."></textarea>
            </div>

            <div id="contact-alert" style="display: none; padding: 0.85rem 1rem; border-radius: var(--radius-md); font-size: 0.875rem; margin-bottom: 1.25rem;"></div>

            <button type="submit" class="btn btn-secondary btn-lg" style="width: 100%; display: flex; align-items: center; justify-content: center; gap: 0.5rem;">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
              <span>Submit Inquiry</span>
            </button>
          </form>
        </div>

      </div>
    </div>

    <script>
      async function handleContactInquirySubmit(e, form) {
        e.preventDefault();
        const btn = form.querySelector('button[type="submit"]');
        const alertBox = document.getElementById('contact-alert');
        const originalText = btn.innerHTML;

        btn.disabled = true;
        btn.innerHTML = '<span class="spinner"></span> Submitting...';
        alertBox.style.display = 'none';

        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        try {
          const res = await fetch('/api/contact', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
          });
          const result = await res.json();

          if (!res.ok || !result.success) {
            throw new Error(result.error || 'Failed to submit inquiry. Please try again.');
          }

          alertBox.style.display = 'block';
          alertBox.style.background = '#f0fdf4';
          alertBox.style.color = '#166534';
          alertBox.style.border = '1px solid #bbf7d0';
          alertBox.innerHTML = '<strong>Inquiry Submitted!</strong> Thank you for contacting Workdone. Your request has been securely recorded in our Supabase backend and our support team will reach out shortly.';
          form.reset();
        } catch (err) {
          alertBox.style.display = 'block';
          alertBox.style.background = '#fef2f2';
          alertBox.style.color = '#991b1b';
          alertBox.style.border = '1px solid #fecaca';
          alertBox.innerHTML = '<strong>Error:</strong> ' + (err.message || 'Unable to submit inquiry.');
        } finally {
          btn.disabled = false;
          btn.innerHTML = originalText;
        }
      }
    </script>
  `;
}

function escapeHtml(str: string): string {
  if (typeof str !== 'string') return '';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}
