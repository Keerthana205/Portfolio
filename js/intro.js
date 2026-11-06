/**
 * Keerthana Devan — Personal Portfolio
 * Intro Screen Controller
 * Reference: PRD v1.0 Section 4.1 & User Requirements
 */

(function () {
  'use strict';

  const STORAGE_KEY = 'keerthana_portfolio_intro_seen';
  const INTRO_DURATION = 2800; // ~2.8 seconds animation sequence
  const REDUCED_DURATION = 1200;

  function initIntro() {
    const introScreen = document.getElementById('intro-screen');
    if (!introScreen) return;

    // Check if intro has already played in this browsing session
    const urlParams = new URLSearchParams(window.location.search);
    const forceIntro = urlParams.get('intro') === 'true' || window.location.hash === '#replay-intro';
    const alreadySeen = sessionStorage.getItem(STORAGE_KEY) === 'true';

    if (alreadySeen && !forceIntro) {
      // Skip intro immediately for repeat navigations
      introScreen.style.display = 'none';
      document.body.classList.add('intro-complete');
      return;
    }

    // Lock scrolling while intro is running
    document.body.style.overflow = 'hidden';

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const duration = prefersReducedMotion ? REDUCED_DURATION : INTRO_DURATION;

    let hasTransitioned = false;

    function transitionToHome() {
      if (hasTransitioned) return;
      hasTransitioned = true;

      // Begin smooth fade-out
      introScreen.classList.add('fade-out');
      document.body.style.overflow = '';
      document.body.classList.add('intro-complete');

      // Record in session storage so it plays once per browsing session
      try {
        sessionStorage.setItem(STORAGE_KEY, 'true');
      } catch (e) {
        // Handle private browsing storage exceptions gracefully
      }

      // Hide from DOM completely after fade animation completes
      setTimeout(function () {
        introScreen.style.display = 'none';
        window.dispatchEvent(new CustomEvent('introFinished'));
      }, 850);
    }

    // Automatically transition into homepage after sequence completes
    const timer = setTimeout(transitionToHome, duration);

    // Allow user to skip immediately with click, tap, or Escape
    introScreen.addEventListener('click', function () {
      clearTimeout(timer);
      transitionToHome();
    });

    document.addEventListener('keydown', function (e) {
      if (introScreen.style.display !== 'none' && (e.key === 'Escape' || e.key === 'Enter')) {
        clearTimeout(timer);
        transitionToHome();
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initIntro);
  } else {
    initIntro();
  }
})();

