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

    // Scroll-triggered refined entrance animation for About section
    initAboutEntrance();
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

  /**
   * Refined, scroll-triggered entrance animation for About section
   * Elements drift smoothly down from uppermost part of screen (120–180px)
   * with a feather-light deceleration curve.
   * Replays on every Home → About transition.
   */
  function initAboutEntrance() {
    const aboutSection = document.getElementById('about');
    if (!aboutSection) return;

    // Accessibility check: do not animate if user prefers reduced motion
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      aboutSection.classList.add('about-anim-done');
      return;
    }

    let isAboutRevealed = false;
    let settleTimer = null;

    function playAboutEntrance() {
      if (isAboutRevealed) return;
      isAboutRevealed = true;

      if (settleTimer) clearTimeout(settleTimer);

      aboutSection.classList.add('about-animated');

      // Total stagger sequence finishes at ~1330ms, settle at 1400ms
      settleTimer = setTimeout(function () {
        aboutSection.classList.add('about-anim-done');
        aboutSection.classList.remove('about-anim-ready');
      }, 1400);
    }

    function resetAboutEntrance() {
      if (!isAboutRevealed) return;
      isAboutRevealed = false;

      if (settleTimer) clearTimeout(settleTimer);

      // Instant reset to ready state without transition because About is completely off-screen
      aboutSection.classList.remove('about-animated', 'about-anim-done');
      aboutSection.classList.add('about-anim-ready');
    }

    // Set initial ready state
    aboutSection.classList.add('about-anim-ready');

    function checkAboutScroll() {
      const rect = aboutSection.getBoundingClientRect();
      const vh = window.innerHeight || document.documentElement.clientHeight || 800;

      // 1. Entering About from Home above:
      // When About has scrolled at least 30% into the viewport from above
      if (!isAboutRevealed && rect.top <= vh * 0.70 && rect.bottom >= vh * 0.20) {
        playAboutEntrance();
      }

      // 2. Returned to Home above:
      // When About is completely off-screen at the bottom of the viewport
      if (isAboutRevealed && rect.top >= vh - 20) {
        resetAboutEntrance();
      }
    }

    // 1. Passive scroll and resize listeners
    window.addEventListener('scroll', checkAboutScroll, { passive: true });
    window.addEventListener('resize', checkAboutScroll, { passive: true });

    // 2. IntersectionObserver tracking
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(function (entries) {
        entries.forEach(function () {
          checkAboutScroll();
        });
      }, {
        threshold: [0, 0.2, 0.4, 0.6, 0.8, 1.0]
      });
      observer.observe(aboutSection);
    }

    // 3. Navigation sectionEnter custom event
    window.addEventListener('sectionEnter', function (e) {
      if (!e.detail) return;
      if (e.detail.sectionId === 'about') {
        const rect = aboutSection.getBoundingClientRect();
        const vh = window.innerHeight || 800;
        if (rect.top <= vh * 0.75) {
          playAboutEntrance();
        }
      } else if (e.detail.sectionId === 'home') {
        setTimeout(checkAboutScroll, 400);
      }
    });

    // 4. Navbar links click handlers
    const aboutNavLinks = document.querySelectorAll('a[href="#about"]');
    aboutNavLinks.forEach(function (link) {
      link.addEventListener('click', function () {
        if (isAboutRevealed) {
          resetAboutEntrance();
        }
        // Poll briefly during smooth scroll to trigger right when arriving at About
        let attempts = 0;
        const scrollCheckInterval = setInterval(function () {
          attempts++;
          checkAboutScroll();
          if (isAboutRevealed || attempts > 25) {
            clearInterval(scrollCheckInterval);
          }
        }, 40);
      });
    });

    const homeNavLinks = document.querySelectorAll('a[href="#home"], .nav-brand');
    homeNavLinks.forEach(function (link) {
      link.addEventListener('click', function () {
        setTimeout(checkAboutScroll, 450);
      });
    });

    // 5. Initial load / direct anchor landing
    const urlParams = new URLSearchParams(window.location.search);
    const isAboutLanding = window.location.hash === '#about' || urlParams.get('test_view') === 'about';

    if (isAboutLanding) {
      const introScreen = document.getElementById('intro-screen');
      const alreadySeen = sessionStorage.getItem('keerthana_portfolio_intro_seen') === 'true';
      const skipIntro = urlParams.get('skip_intro') === 'true';

      if (introScreen && !alreadySeen && !skipIntro && introScreen.style.display !== 'none') {
        window.addEventListener('introFinished', function () {
          setTimeout(playAboutEntrance, 250);
        }, { once: true });
      } else {
        setTimeout(playAboutEntrance, 150);
      }
    } else {
      checkAboutScroll();
    }
  }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initApp);
    } else {
      initApp();
    }
  }) ();

