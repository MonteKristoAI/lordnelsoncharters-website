/* ============================================
   REVIEW GATING MODAL
   ============================================ */

(function() {
  let currentRating = 0;
  let selectedCategories = [];
  const CATEGORIES = ['Sailing Experience', 'Captain & Crew', 'Boat Condition', 'Value', 'Safety', 'Communication'];

  function openReviewModal() {
    const modal = document.getElementById('review-modal');
    if (!modal) return;
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    currentRating = 0;
    selectedCategories = [];
    showStep('rating');
    renderStars();
  }

  function closeReviewModal() {
    const modal = document.getElementById('review-modal');
    if (!modal) return;
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }

  function showStep(name) {
    document.querySelectorAll('[data-review-step]').forEach(el => el.style.display = 'none');
    const step = document.querySelector(`[data-review-step="${name}"]`);
    if (step) step.style.display = 'block';
  }

  function renderStars() {
    const container = document.getElementById('star-container');
    if (!container) return;
    container.innerHTML = '';
    for (let i = 1; i <= 5; i++) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.innerHTML = '<svg width="32" height="32" viewBox="0 0 24 24" fill="' + (i <= currentRating ? '#F59E0B' : 'none') + '" stroke="' + (i <= currentRating ? '#F59E0B' : '#D1D5DB') + '" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>';
      btn.className = 'star-btn' + (i <= currentRating ? ' active' : '');
      btn.addEventListener('click', () => {
        currentRating = i;
        renderStars();
        document.getElementById('review-continue').disabled = false;
      });
      container.appendChild(btn);
    }
  }

  function handleRatingSubmit() {
    if (currentRating >= 4) {
      const url = typeof CONFIG !== 'undefined' ? CONFIG.googleReviewsUrl : '';
      if (url) window.open(url, '_blank');
      showStep('thanks');
      setTimeout(closeReviewModal, 2500);
    } else {
      showStep('feedback');
      renderCategoryPills();
    }
  }

  function renderCategoryPills() {
    const container = document.getElementById('category-pills');
    if (!container) return;
    container.innerHTML = '';
    CATEGORIES.forEach(cat => {
      const pill = document.createElement('button');
      pill.type = 'button';
      pill.className = 'pill';
      pill.textContent = cat;
      pill.addEventListener('click', () => {
        pill.classList.toggle('selected');
        if (selectedCategories.includes(cat)) {
          selectedCategories = selectedCategories.filter(c => c !== cat);
        } else {
          selectedCategories.push(cat);
        }
      });
      container.appendChild(pill);
    });
  }

  function submitFeedback() {
    const improvement = document.getElementById('review-improvement');
    const message = document.getElementById('review-message');
    const webhookUrl = typeof CONFIG !== 'undefined' ? CONFIG.reviewWebhookUrl : '';

    if (webhookUrl) {
      fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'review_feedback',
          rating: currentRating,
          categories: selectedCategories,
          improvement: improvement ? improvement.value : '',
          message: message ? message.value : '',
          timestamp: new Date().toISOString()
        })
      }).catch(() => {});
    }

    showStep('thanks');
    setTimeout(closeReviewModal, 2500);
  }

  // Expose globally
  window.openReviewModal = openReviewModal;
  window.closeReviewModal = closeReviewModal;
  window.handleRatingSubmit = handleRatingSubmit;
  window.submitFeedback = submitFeedback;

  // Wire up button listeners
  document.addEventListener('DOMContentLoaded', function() {
    var continueBtn = document.getElementById('review-continue');
    if (continueBtn) continueBtn.addEventListener('click', handleRatingSubmit);
    var submitBtn = document.getElementById('review-submit');
    if (submitBtn) submitBtn.addEventListener('click', submitFeedback);
    var closeBtn = document.getElementById('modal-close');
    if (closeBtn) closeBtn.addEventListener('click', closeReviewModal);
  });

  // Close on overlay click or Escape
  document.addEventListener('click', (e) => {
    if (e.target.id === 'review-modal') closeReviewModal();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeReviewModal();
  });
})();
