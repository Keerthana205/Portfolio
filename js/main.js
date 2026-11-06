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

    let typeTimeout = null;
    let fadeTimeout = null;
    let isTyping = false;

    function playTypewriter() {
      // Clear any pending timeouts
      if (typeTimeout) clearTimeout(typeTimeout);
      if (fadeTimeout) clearTimeout(fadeTimeout);

      isTyping = true;
      target.textContent = '';
      if (cursor) {
        cursor.classList.remove('cursor-faded');
        cursor.style.display = 'inline-block';
        cursor.style.opacity = '1';
        cursor.style.visibility = 'visible';
      }

      let index = 0;

      function typeChar() {
        if (index < fullText.length) {
          target.textContent += fullText.charAt(index);
          index++;
          const char = fullText.charAt(index - 1);
          let delay = 60;
          if (char === ' ') delay = 110;
          else if (char === '.') delay = 200;
          typeTimeout = setTimeout(typeChar, delay);
        } else {
          isTyping = false;
          // Writing cursor disappears right after writing completes
          fadeTimeout = setTimeout(function () {
            if (cursor) {
              cursor.classList.add('cursor-faded');
              cursor.style.display = 'none';
            }
          }, 150);
        }
      }

      typeTimeout = setTimeout(typeChar, 200);
    }

    // Expose globally so navigation or external triggers can play it
    window.playHeroTypewriter = playTypewriter;

    // Listen for sectionEnter event from navigation.js whenever user enters Home
    window.addEventListener('sectionEnter', function (e) {
      if (e.detail && e.detail.sectionId === 'home') {
        // Trigger once when arriving from another section
        if (e.detail.previousSection && e.detail.previousSection !== 'home') {
          playTypewriter();
        }
      }
    });

    const introScreen = document.getElementById('intro-screen');
    const alreadySeen = sessionStorage.getItem('keerthana_portfolio_intro_seen') === 'true';
    const urlParams = new URLSearchParams(window.location.search);
    const skipIntro = urlParams.get('skip_intro') === 'true';
    const initialHash = window.location.hash;
    const isHomeStart = !initialHash || initialHash === '#home';

    if (isHomeStart) {
      if (introScreen && !alreadySeen && !skipIntro && introScreen.style.display !== 'none') {
        window.addEventListener('introFinished', function () {
          setTimeout(playTypewriter, 250);
        }, { once: true });
      } else {
        setTimeout(playTypewriter, 300);
      }
    } else {
      // If landing directly on #about or another section, show text statically
      target.textContent = fullText;
      if (cursor) cursor.style.display = 'none';
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
  } else {
    initApp();
  }
})();

