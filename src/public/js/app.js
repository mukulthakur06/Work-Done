// Workdone Client-side Interactivity & App State Management

const WorkdoneApp = (() => {
  // Compare Tray state in LocalStorage
  const getCompareList = () => {
    try {
      return JSON.parse(localStorage.getItem('wd_compare_list') || '[]');
    } catch {
      return [];
    }
  };

  const saveCompareList = (list) => {
    localStorage.setItem('wd_compare_list', JSON.stringify(list.slice(0, 4)));
    renderCompareTray();
  };

  const toggleCompare = (proId, proName) => {
    let list = getCompareList();
    const existingIdx = list.findIndex(item => item.id === proId);
    if (existingIdx >= 0) {
      list.splice(existingIdx, 1);
      showToast(`Removed ${proName} from comparison.`);
    } else {
      if (list.length >= 4) {
        showToast('You can compare a maximum of 4 professionals at a time.', 'warning');
        return;
      }
      list.push({ id: proId, name: proName });
      showToast(`Added ${proName} to comparison.`);
    }
    saveCompareList(list);
  };

  const clearCompare = () => {
    localStorage.removeItem('wd_compare_list');
    renderCompareTray();
  };

  const renderCompareTray = () => {
    const list = getCompareList();
    let tray = document.getElementById('compare-tray');
    if (!tray) {
      tray = document.createElement('div');
      tray.id = 'compare-tray';
      tray.className = 'compare-tray';
      document.body.appendChild(tray);
    }

    if (list.length === 0) {
      tray.style.display = 'none';
      return;
    }

    tray.style.display = 'flex';
    const names = list.map(item => item.name).join(', ');
    const ids = list.map(item => item.id).join(',');
    tray.innerHTML = `
      <div style="font-size: 0.9rem; font-weight: 600;">
        Comparing (${list.length}/4): <span style="font-weight: 400; opacity: 0.9;">${names}</span>
      </div>
      <div style="display: flex; gap: 0.5rem; align-items: center;">
        <a href="/professionals/compare?ids=${ids}" class="btn btn-secondary btn-sm" style="border-radius: 9999px;">View Comparison</a>
        <button onclick="WorkdoneApp.clearCompare()" style="background: transparent; border: none; color: #fff; opacity: 0.7; cursor: pointer; font-size: 0.8rem; text-decoration: underline;">Clear</button>
      </div>
    `;
  };

  // Toast notifications
  const showToast = (message, type = 'info') => {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.style.cssText = 'position: fixed; top: 1.5rem; right: 1.5rem; z-index: 9999; display: flex; flex-direction: column; gap: 0.5rem; pointer-events: none;';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    const bg = type === 'error' ? '#ef4444' : type === 'warning' ? '#f59e0b' : '#0d9488';
    toast.style.cssText = `background: ${bg}; color: #fff; padding: 0.75rem 1.25rem; border-radius: 8px; font-size: 0.9rem; font-weight: 500; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.2); pointer-events: auto; animation: slideIn 0.2s ease-out;`;
    toast.innerText = message;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transition = 'opacity 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  };

  // Generic Modal opener/closer
  const openModal = (modalId) => {
    const el = document.getElementById(modalId);
    if (el) el.style.display = 'flex';
  };

  const closeModal = (modalId) => {
    const el = document.getElementById(modalId);
    if (el) el.style.display = 'none';
  };

  // Toggle Saved Bookmark
  const toggleSave = async (proId, btnElement) => {
    try {
      const res = await fetch(`/api/professionals/saved/${proId}`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || 'Please sign in as a customer to save professionals.', 'warning');
        return;
      }
      if (data.saved) {
        btnElement.classList.add('saved');
        btnElement.style.color = '#ef4444';
        showToast('Saved to your bookmarked professionals.');
      } else {
        btnElement.classList.remove('saved');
        btnElement.style.color = 'inherit';
        showToast('Removed from bookmarked professionals.');
      }
    } catch {
      showToast('Network error while saving.', 'error');
    }
  };

  // Submit Booking Request
  const handleBookingSubmit = async (e, form) => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    const originalText = btn.innerText;
    btn.disabled = true;
    btn.innerText = 'Submitting Request...';

    const formData = new FormData(form);
    const body = Object.fromEntries(formData.entries());

    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || 'Failed to submit booking request.', 'error');
        btn.disabled = false;
        btn.innerText = originalText;
        return;
      }
      showToast('Booking request submitted successfully!');
      closeModal('booking-modal');
      setTimeout(() => {
        window.location.href = '/dashboard/customer?tab=requests';
      }, 1000);
    } catch {
      showToast('Network error submitting request.', 'error');
      btn.disabled = false;
      btn.innerText = originalText;
    }
  };

  // Accept Estimate
  const acceptEstimate = async (estimateId) => {
    if (!confirm('Are you sure you want to accept this estimate and lock the scope of work?')) return;
    try {
      const res = await fetch(`/api/estimates/${estimateId}/accept`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || 'Failed to accept estimate.', 'error');
        return;
      }
      showToast('Estimate accepted! Scope and price confirmed.');
      setTimeout(() => window.location.reload(), 1000);
    } catch {
      showToast('Network error accepting estimate.', 'error');
    }
  };

  // Update Booking Status
  const updateStatus = async (bookingId, status, note = '') => {
    try {
      const res = await fetch(`/api/bookings/${bookingId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, note })
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || 'Failed to update booking status.', 'error');
        return;
      }
      showToast(`Booking updated to ${status.replace('_', ' ')}.`);
      setTimeout(() => window.location.reload(), 1000);
    } catch {
      showToast('Network error updating status.', 'error');
    }
  };

  // Submit Review
  const handleReviewSubmit = async (e, form) => {
    e.preventDefault();
    const formData = new FormData(form);
    const body = Object.fromEntries(formData.entries());

    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || 'Failed to submit review.', 'error');
        return;
      }
      showToast('Thank you! Your verified review has been posted.');
      closeModal('review-modal');
      setTimeout(() => window.location.reload(), 1000);
    } catch {
      showToast('Network error submitting review.', 'error');
    }
  };

  // Report Review
  const reportReview = async (reviewId) => {
    const reason = prompt('Please describe why this review violates community guidelines:');
    if (!reason || reason.trim().length < 5) return;
    try {
      const res = await fetch(`/api/reviews/${reviewId}/report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason })
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || 'Failed to report review.', 'error');
        return;
      }
      showToast('Report submitted. Our moderation team will review it.');
    } catch {
      showToast('Network error.', 'error');
    }
  };

  // Mark notification read
  const markNotification = async (notifId, el) => {
    try {
      await fetch(`/api/notifications/${notifId}/read`, { method: 'POST' });
      if (el) el.style.opacity = '0.6';
    } catch (e) {
      console.error(e);
    }
  };

  // Initialize on DOM load
  document.addEventListener('DOMContentLoaded', () => {
    renderCompareTray();
  });

  return {
    getCompareList,
    toggleCompare,
    clearCompare,
    showToast,
    openModal,
    closeModal,
    toggleSave,
    handleBookingSubmit,
    acceptEstimate,
    updateStatus,
    handleReviewSubmit,
    reportReview,
    markNotification
  };
})();

// ─── Enhancement #1 — Persistent Location Module ─────────────────────────────
const WdLocation = (() => {
  const KEY = 'wd_saved_city';
  const getSaved = () => { try { return localStorage.getItem(KEY) || ''; } catch (e) { return ''; } };
  const save = (city) => { try { if (city && city.trim()) localStorage.setItem(KEY, city.trim()); } catch (e) {} };
  const clearSaved = () => { try { localStorage.removeItem(KEY); } catch (e) {} };
  return { getSaved, save, clearSaved };
})();

// ─── Enhancement #2 — Smart Keyword→Category Filter Sync ─────────────────────
const WdSmartFilter = (() => {
  const MAP = {
    'electrician': 'electrical', 'electrical': 'electrical', 'wiring': 'electrical', 'rewiring': 'electrical',
    'plumber': 'plumbing', 'plumbing': 'plumbing', 'pipe': 'plumbing', 'leak': 'plumbing',
    'carpenter': 'carpentry', 'carpentry': 'carpentry', 'furniture': 'carpentry', 'cabinet': 'carpentry', 'wood': 'carpentry',
    'painter': 'painting', 'painting': 'painting', 'wall finish': 'painting', 'texture': 'painting', 'wall finisher': 'painting',
    'tile': 'tile-flooring', 'flooring': 'tile-flooring', 'marble': 'tile-flooring', 'hardwood': 'tile-flooring',
    'interior': 'interior-design', 'design': 'interior-design', 'decor': 'interior-design',
    'mason': 'masonry-civil', 'masonry': 'masonry-civil', 'brick': 'masonry-civil', 'civil': 'masonry-civil',
    'ac': 'ac-repair', 'hvac': 'ac-repair', 'air conditioning': 'ac-repair', 'cooling': 'ac-repair',
    'cleaning': 'home-cleaning', 'deep clean': 'home-cleaning', 'sanitiz': 'home-cleaning',
    'welding': 'welding', 'fabrication': 'welding', 'grille': 'welding',
    'false ceiling': 'false-ceiling', 'gypsum': 'false-ceiling', 'pop ceiling': 'false-ceiling', 'pop': 'false-ceiling',
    'renovation': 'renovation', 'remodel': 'renovation',
  };
  const getCategory = (keyword) => {
    if (!keyword) return null;
    const kw = keyword.toLowerCase().trim();
    for (const [term, slug] of Object.entries(MAP)) {
      if (kw.includes(term)) return slug;
    }
    return null;
  };
  return { getCategory };
})();

