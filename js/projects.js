/**
 * Keerthana Devan — Personal Portfolio
 * Phase 3: True Cyclic Three-Card Project Carousel Controller
 *
 * Implements an exact cyclic permutation of the 3 portfolio project cards:
 * - Left Card: UniX (initially)
 * - Center Card: SignBridge (initially featured)
 * - Right Card: SkySense (initially)
 *
 * Movement:
 * - Move LEFT: Left -> Right, Center -> Left, Right -> Center
 * - Move RIGHT: Right -> Left, Center -> Right, Left -> Center
 *
 * Triggers:
 * - Mouse wheel when hovering over ANY of the 3 project cards (Left, Center, Right)
 * - Bottom navigation arrows (Right -> move Left, Left -> move Right)
 * - Side card clicks (bringing clicked card to center)
 * - Touch swipe on mobile
 */

(function () {
  'use strict';

  function initProjectsShowcase() {
    const wrap = document.querySelector('.projects-showcase-wrap');
    const prevBtn = document.querySelector('.projects-nav-prev');
    const nextBtn = document.querySelector('.projects-nav-next');

    if (!wrap) return;

    // Project live/repo links
    const projectUrls = {
      skysense: 'https://keerthana205.github.io/SkySense/',
      unix: 'https://keerthana205.github.io/UniX/',
      signbridge: 'https://github.com/keerthana205/SignBridge'
    };

    // Grab the 3 exact project cards
    const initialLeft = wrap.querySelector('.project-card.slot--1');
    const initialCenter = wrap.querySelector('.project-card.slot-0');
    const initialRight = wrap.querySelector('.project-card.slot-1');

    if (!initialLeft || !initialCenter || !initialRight) return;

    // Tag Pill Color Definitions (Jewel tones on hover)
    const TAG_COLORS = {
      'ai-ml': { bg: '#5b21b6', border: '#7c3aed', color: '#ffffff', shadow: '0 4px 14px rgba(91, 33, 182, 0.5)' },
      'accessibility': { bg: '#9f1239', border: '#e11d48', color: '#ffffff', shadow: '0 4px 14px rgba(159, 18, 57, 0.5)' },
      'web-dev': { bg: '#0f766e', border: '#14b8a6', color: '#ffffff', shadow: '0 4px 14px rgba(15, 118, 110, 0.5)' },
      'fullstack': { bg: '#9a3412', border: '#ea580c', color: '#ffffff', shadow: '0 4px 14px rgba(154, 52, 18, 0.5)' },
      'frontend': { bg: '#1d4ed8', border: '#3b82f6', color: '#ffffff', shadow: '0 4px 14px rgba(29, 78, 216, 0.5)' },
      'weather-api': { bg: '#854d0e', border: '#ca8a04', color: '#ffffff', shadow: '0 4px 14px rgba(133, 77, 14, 0.5)' }
    };

    // Auto-assign data-tag attribute and attach direct hover handlers to tag pills
    wrap.querySelectorAll('.project-tag-pill').forEach(function (pill) {
      let tagKey = pill.getAttribute('data-tag');
      if (!tagKey) {
        const text = pill.textContent.trim().toLowerCase();
        if (text.includes('ai') || text.includes('ml')) tagKey = 'ai-ml';
        else if (text.includes('accessib')) tagKey = 'accessibility';
        else if (text.includes('web')) tagKey = 'web-dev';
        else if (text.includes('full')) tagKey = 'fullstack';
        else if (text.includes('front')) tagKey = 'frontend';
        else if (text.includes('weather')) tagKey = 'weather-api';
        if (tagKey) pill.setAttribute('data-tag', tagKey);
      }

      const styleDef = TAG_COLORS[tagKey];
      if (styleDef) {
        pill.addEventListener('mouseenter', function () {
          // Pill hover styling
          pill.style.setProperty('background-color', styleDef.bg, 'important');
          pill.style.setProperty('border-color', styleDef.border, 'important');
          pill.style.setProperty('color', styleDef.color, 'important');
          pill.style.setProperty('box-shadow', styleDef.shadow, 'important');
          pill.style.setProperty('transform', 'translateY(-2px) scale(1.06)', 'important');
        });

        pill.addEventListener('mouseleave', function () {
          pill.style.removeProperty('background-color');
          pill.style.removeProperty('border-color');
          pill.style.removeProperty('color');
          pill.style.removeProperty('box-shadow');
          pill.style.removeProperty('transform');
        });
      }
    });

    // Maintain current slot assignment
    const slots = {
      left: initialLeft,
      center: initialCenter,
      right: initialRight
    };

    // Restore previous carousel position if returning from detail page
    (function restoreCarouselPosition() {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        let returnProject = urlParams.get('project');
        if (!returnProject) {
          returnProject = sessionStorage.getItem('portfolio_return_project');
        }
        if (returnProject) {
          sessionStorage.removeItem('portfolio_return_project');

          // If the early inline script already positioned the target card in center, re-sync slot references
          if (slots.center && slots.center.getAttribute('data-project-id') === returnProject) {
            slots.left = wrap.querySelector('.project-card.slot--1');
            slots.center = wrap.querySelector('.project-card.slot-0');
            slots.right = wrap.querySelector('.project-card.slot-1');
            return;
          }

          // Otherwise position cleanly without animation transition
          wrap.querySelectorAll('.project-card').forEach(function (c) {
            c.style.transition = 'none';
          });

          const prevLeft = slots.left;
          const prevCenter = slots.center;
          const prevRight = slots.right;

          if (returnProject === 'unix') {
            prevCenter.className = 'project-card slot-1';
            prevLeft.className = 'project-card slot-0';
            prevRight.className = 'project-card slot--1';
            slots.left = prevRight;
            slots.center = prevLeft;
            slots.right = prevCenter;
          } else if (returnProject === 'skysense') {
            prevCenter.className = 'project-card slot--1';
            prevRight.className = 'project-card slot-0';
            prevLeft.className = 'project-card slot-1';
            slots.left = prevCenter;
            slots.center = prevRight;
            slots.right = prevLeft;
          }

          // Force reflow and re-enable transition for user clicks
          void wrap.offsetWidth;
          requestAnimationFrame(function () {
            wrap.querySelectorAll('.project-card').forEach(function (c) {
              c.style.transition = '';
            });
          });
        }
      } catch (err) {}
    })();

    // Record clicked project in sessionStorage for seamless return navigation
    wrap.querySelectorAll('.project-expand-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        const card = this.closest('.project-card');
        const projId = card ? card.getAttribute('data-project-id') : null;
        if (projId) {
          try {
            sessionStorage.setItem('portfolio_return_project', projId);
          } catch (e) {}
        }
      });
    });

    let isAnimating = false;
    let wheelCooldown = false;
    const ANIMATION_DURATION = 800; // 800ms matching CSS --carousel-duration

    /**
     * Move one position to the LEFT:
     * - The LEFT card moves to the RIGHT position (passes behind).
     * - The CENTER card moves to the LEFT position (shrinks to side).
     * - The RIGHT card moves to the CENTER position (grows to featured).
     */
    function rotateLeft() {
      if (isAnimating) return;
      isAnimating = true;

      const prevLeft = slots.left;
      const prevCenter = slots.center;
      const prevRight = slots.right;

      // 1. Enforce precise layering during transition:
      // - Incoming center card (prevRight) is on top
      // - Outgoing center card (prevCenter) is in the middle
      // - Back-crossing card (prevLeft) glides behind both
      prevRight.style.zIndex = '10';
      prevCenter.style.zIndex = '5';
      prevLeft.style.zIndex = '1';

      // 2. Trigger simultaneous physical CSS transforms:
      prevCenter.className = 'project-card slot--1';
      prevRight.className = 'project-card slot-0';
      prevLeft.className = 'project-card slot-1';

      // 3. Update logical slot references
      slots.left = prevCenter;
      slots.center = prevRight;
      slots.right = prevLeft;

      // 4. Settle transition cleanly after duration without texture pop
      setTimeout(function () {
        prevRight.style.zIndex = '';
        prevCenter.style.zIndex = '';
        prevLeft.style.zIndex = '';
        isAnimating = false;
      }, ANIMATION_DURATION);
    }

    /**
     * Move one position to the RIGHT:
     * - The RIGHT card moves to the LEFT position (passes behind).
     * - The CENTER card moves to the RIGHT position (shrinks to side).
     * - The LEFT card moves to the CENTER position (grows to featured).
     */
    function rotateRight() {
      if (isAnimating) return;
      isAnimating = true;

      const prevLeft = slots.left;
      const prevCenter = slots.center;
      const prevRight = slots.right;

      // 1. Enforce precise layering during transition:
      // - Incoming center card (prevLeft) is on top
      // - Outgoing center card (prevCenter) is in the middle
      // - Back-crossing card (prevRight) glides behind both
      prevLeft.style.zIndex = '10';
      prevCenter.style.zIndex = '5';
      prevRight.style.zIndex = '1';

      // 2. Trigger simultaneous physical CSS transforms:
      prevCenter.className = 'project-card slot-1';
      prevLeft.className = 'project-card slot-0';
      prevRight.className = 'project-card slot--1';

      // 3. Update logical slot references
      slots.left = prevRight;
      slots.center = prevLeft;
      slots.right = prevCenter;

      // 4. Settle transition cleanly after duration without texture pop
      setTimeout(function () {
        prevLeft.style.zIndex = '';
        prevCenter.style.zIndex = '';
        prevRight.style.zIndex = '';
        isAnimating = false;
      }, ANIMATION_DURATION);
    }

    // -------------------------------------------------------------------------
    // Interaction Controls
    // -------------------------------------------------------------------------

    // A. Bottom Navigation Arrows
    if (nextBtn) {
      nextBtn.addEventListener('click', function (e) {
        e.preventDefault();
        rotateLeft(); // Clicking right arrow moves one position to the LEFT
      });
    }

    if (prevBtn) {
      prevBtn.addEventListener('click', function (e) {
        e.preventDefault();
        rotateRight(); // Clicking left arrow moves one position to the RIGHT
      });
    }

    // B. Card Clicks (Side cards bring into center, expand button navigates to detail page)
    wrap.addEventListener('click', function (e) {
      // 1. Expand button handler: Open dedicated project detail page in the existing tab
      const expandBtn = e.target.closest('.project-expand-btn');
      if (expandBtn) {
        e.stopPropagation();
        e.preventDefault();
        const card = expandBtn.closest('.project-card');
        const id = card ? card.getAttribute('data-project-id') : null;
        if (id) {
          try {
            sessionStorage.setItem('portfolio_return_project', id);
          } catch (err) {}
          window.location.href = 'projects/' + id + '.html';
        }
        return;
      }

      // If user clicked anywhere inside .project-info (title, category, description, tags),
      // DO NOT trigger card rotation — allow selecting, highlighting, and interacting with text freely!
      if (e.target.closest('.project-info')) {
        return;
      }

      // If user highlighted or selected text, do not interpret as a navigation click
      const selection = window.getSelection ? window.getSelection().toString() : '';
      if (selection && selection.trim().length > 0) {
        return;
      }

      // 2. Side card click handler (clicking the card background or laptop mockup)
      const clickedCard = e.target.closest('.project-card');
      if (!clickedCard || isAnimating) return;

      if (clickedCard === slots.left) {
        rotateRight(); // Brings left card into center
      } else if (clickedCard === slots.right) {
        rotateLeft(); // Brings right card into center
      }
      // Clicking center card does not trigger any transition
    });

    // C. Mouse Wheel Handler — Active over ANY of the 3 Project Cards (Left, Center, Right)
    // Scrolling when pointer is over any project card controls only the carousel without vertical page scrolling.
    // Scrolling outside the project cards allows normal browser page scrolling.
    wrap.addEventListener('wheel', function (e) {
      // Check if mouse event occurred over any project card
      const card = e.target.closest('.project-card');
      if (!card) {
        // Outside the project cards: do NOT prevent default, allow normal page scroll
        return;
      }

      // Pointer IS over a project card: prevent vertical page scroll and stop propagation
      e.preventDefault();
      e.stopPropagation();

      if (isAnimating || wheelCooldown) return;

      // Threshold check to avoid micro-scroll jitter
      if (Math.abs(e.deltaY) > 20) {
        wheelCooldown = true;

        if (e.deltaY > 0) {
          // Scrolling down over any card -> moves one position to the LEFT
          rotateLeft();
        } else {
          // Scrolling up over any card -> moves one position to the RIGHT
          rotateRight();
        }

        // Debounce continuous wheel gestures
        setTimeout(function () {
          wheelCooldown = false;
        }, ANIMATION_DURATION + 80);
      }
    }, { passive: false });

    // D. Touch Swipe Gestures (Mobile)
    let touchStartX = 0;
    let touchEndX = 0;

    wrap.addEventListener('touchstart', function (e) {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    wrap.addEventListener('touchend', function (e) {
      touchEndX = e.changedTouches[0].screenX;
      if (isAnimating) return;

      const threshold = 40;
      if (touchEndX < touchStartX - threshold) {
        rotateLeft();
      } else if (touchEndX > touchStartX + threshold) {
        rotateRight();
      }
    }, { passive: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initProjectsShowcase);
  } else {
    initProjectsShowcase();
  }
})();
