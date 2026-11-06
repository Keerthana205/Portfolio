/**
 * Keerthana Devan — Personal Portfolio
 * Main Application Orchestrator
 * Reference: PRD v1.0 Section 5.2
 */

(function () {
  'use strict';

  function initApp() {
    // Dynamic copyright year (PRD 4.7)
    const yearSpan = document.getElementById('current-year');
    if (yearSpan) {
      yearSpan.textContent = new Date().getFullYear();
    }

    // Back-to-top handler (PRD 4.7)
    const backToTopBtn = document.querySelector('.btn-back-to-top');
    if (backToTopBtn) {
      backToTopBtn.addEventListener('click', function (e) {
        e.preventDefault();
        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      });
    }

    // Scroll indicators handler
    const scrollIndicators = document.querySelectorAll('[data-scroll-to]');
    scrollIndicators.forEach(function (btn) {
      btn.addEventListener('click', function () {
        const targetSelector = this.getAttribute('data-scroll-to');
        if (targetSelector) {
          const targetEl = document.querySelector(targetSelector);
          if (targetEl) {
            targetEl.scrollIntoView({ behavior: 'smooth' });
          }
        }
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
  } else {
    initApp();
  }
})();

