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

    // Typewriter writing effect for "Keerthana Devan."
    initTypewriter();
  }

  function initTypewriter() {
    const target = document.querySelector('.hero-typewriter-target');
    const cursor = document.querySelector('.hero-typewriter-cursor');
    if (!target) return;

    const fullText = target.getAttribute('data-text') || target.textContent.trim() || 'Keerthana Devan.';
    target.setAttribute('data-text', fullText);

    // Accessibility: instant text if user prefers reduced motion
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      target.textContent = fullText;
      if (cursor) cursor.style.display = 'none';
      return;
    }

    // Clear initial text for animated typing reveal
    target.textContent = '';

    function startTyping() {
      let index = 0;
      target.textContent = '';

      function typeChar() {
        if (index < fullText.length) {
          target.textContent += fullText.charAt(index);
          index++;
          const char = fullText.charAt(index - 1);
          let delay = 65;
          if (char === ' ') delay = 120;
          else if (char === '.') delay = 240;
          setTimeout(typeChar, delay);
        } else {
          // After finishing typing, leave cursor gently blinking for 4 seconds then fade
          setTimeout(function () {
            if (cursor) cursor.classList.add('cursor-faded');
          }, 4000);
        }
      }

      setTimeout(typeChar, 200);
    }

    const introScreen = document.getElementById('intro-screen');
    const alreadySeen = sessionStorage.getItem('keerthana_portfolio_intro_seen') === 'true';
    const urlParams = new URLSearchParams(window.location.search);
    const skipIntro = urlParams.get('skip_intro') === 'true';

    if (introScreen && !alreadySeen && !skipIntro && introScreen.style.display !== 'none') {
      window.addEventListener('introFinished', function () {
        setTimeout(startTyping, 250);
      }, { once: true });
    } else {
      setTimeout(startTyping, 350);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
  } else {
    initApp();
  }
})();

