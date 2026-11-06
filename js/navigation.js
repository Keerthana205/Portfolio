/**
 * Keerthana Devan — Personal Portfolio
 * Navigation Controller
 * Reference: PRD v1.0 Section 2.1 & 2.2
 */

(function () {
  'use strict';

  function initNavigation() {
    const header = document.querySelector('.site-header');
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');
    const brandLink = document.querySelector('.nav-brand');

    if (!header) return;

    // Header scroll background effect
    function onScroll() {
      if (window.scrollY > 40) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    // Mobile menu toggle
    if (navToggle && navMenu) {
      navToggle.addEventListener('click', function () {
        const isOpen = navMenu.classList.toggle('open');
        navToggle.classList.toggle('open');
        navToggle.setAttribute('aria-expanded', String(isOpen));
        document.body.style.overflow = isOpen ? 'hidden' : '';
      });

      // Close mobile menu on ESC
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && navMenu.classList.contains('open')) {
          navMenu.classList.remove('open');
          navToggle.classList.remove('open');
          navToggle.setAttribute('aria-expanded', 'false');
          document.body.style.overflow = '';
        }
      });
    }

    // All internal anchor links smooth scroll & active state update
    const internalLinks = document.querySelectorAll('a[href^="#"]');
    internalLinks.forEach(function (link) {
      link.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href && href.startsWith('#')) {
          e.preventDefault();
          const targetId = href.substring(1);
          
          // Instantly switch active state with zero lag
          updateActiveNav(targetId);

          const targetElement = document.getElementById(targetId);
          if (targetElement) {
            targetElement.scrollIntoView({ behavior: 'smooth' });
            if (history.pushState) {
              history.pushState(null, null, '#' + targetId);
            }
          }

          // Close mobile menu if open
          if (navMenu && navMenu.classList.contains('open')) {
            navMenu.classList.remove('open');
            navToggle.classList.remove('open');
            navToggle.setAttribute('aria-expanded', 'false');
            document.body.style.overflow = '';
          }
        }
      });
    });

    // Wordmark returns to Home
    if (brandLink) {
      brandLink.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href && href.startsWith('#')) {
          e.preventDefault();
          updateActiveNav('home');
          const homeSection = document.getElementById('home');
          if (homeSection) {
            homeSection.scrollIntoView({ behavior: 'smooth' });
          } else {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
        }
      });
    }

    // Active Section Tracking using IntersectionObserver
    const sections = document.querySelectorAll('section[id]');
    if ('IntersectionObserver' in window && sections.length > 0) {
      const observerOptions = {
        root: null,
        rootMargin: '-35% 0px -35% 0px',
        threshold: 0
      };

      const sectionObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            const currentId = entry.target.getAttribute('id');
            updateActiveNav(currentId);
          }
        });
      }, observerOptions);

      sections.forEach(function (sec) {
        sectionObserver.observe(sec);
      });

      // Quick activation for Contact when scrolled near bottom of page
      window.addEventListener('scroll', function () {
        if ((window.innerHeight + window.scrollY) >= (document.documentElement.scrollHeight - 60)) {
          updateActiveNav('contact');
        }
      }, { passive: true });
    }

    function updateActiveNav(activeId) {
      navLinks.forEach(function (link) {
        const linkHref = link.getAttribute('href');
        if (linkHref === `#${activeId}`) {
          link.classList.add('active');
          link.setAttribute('aria-current', 'page');
        } else {
          link.classList.remove('active');
          link.removeAttribute('aria-current');
        }
      });
    }
    // Check initial hash on load (e.g. #about)
    const initialHash = window.location.hash;
    if (initialHash && initialHash.length > 1) {
      const targetSec = document.querySelector(initialHash);
      if (targetSec) {
        window.scrollTo(0, targetSec.offsetTop);
        updateActiveNav(initialHash.substring(1));
      }
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initNavigation);
  } else {
    initNavigation();
  }
})();

