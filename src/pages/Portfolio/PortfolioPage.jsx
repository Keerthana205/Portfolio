import { useLayoutEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import gsap from "gsap";
import CustomEase from "gsap/CustomEase";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useScrollFlow } from "../../hooks/useScrollFlow.js";
import PortfolioNav from "./components/PortfolioNav.jsx";
import FloatingNav from "./components/FloatingNav.jsx";
import CandleGlow from "./components/CandleGlow.jsx";
import HeroSection from "./components/HeroSection.jsx";
import AboutSection from "./components/AboutSection.jsx";
import EducationSection from "./components/EducationSection.jsx";
import LeadershipSection from "./components/LeadershipSection.jsx";
import ProjectsSection from "./components/ProjectsSection.jsx";
import SkillsSection from "./components/SkillsSection.jsx";
import ContactSection from "./components/ContactSection.jsx";
import "./portfolio.css";

gsap.registerPlugin(ScrollTrigger, CustomEase);
CustomEase.create("refEaseOut", "0.16, 1, 0.3, 1");

const SMOOTH_EASE = 0.12;

// ============================================================================
// SCROLL-TRIGGERED REVEAL CONFIGURATION (Matching Reference Site Parameters)
// Tweak timing, distances, easing, and stagger values here:
// ============================================================================
export const SCROLL_REVEAL_CONFIG = {
  yOffset: 42,                  // Initial vertical travel in px (42px)
  zDepth: -60,                  // Initial depth push in px (-60px)
  perspective: 1200,            // Perspective field in px (1200px)
  opacityDuration: 1.0,         // Opacity fade-in duration (1s)
  transformDuration: 1.2,       // Transform slide/depth duration (1.2s)
  easeBezier: "0.16, 1, 0.3, 1",// Exact cubic-bezier from reference site
  staggerDelay: 0.1,            // Stagger step between children (0.1s / 100ms)
  triggerThreshold: "top 88%",  // Viewport trigger line (88% from top)
};

export default function PortfolioPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const navigateRef = useRef({ navigate, pathname: location.pathname });
  useLayoutEffect(() => {
    navigateRef.current = { navigate, pathname: location.pathname };
  });
  const pageRef = useRef(null);

  useScrollFlow(pageRef);

  useLayoutEffect(() => {
    const root = pageRef.current;
    if (!root) return undefined;

    const heroInner = root.querySelector(".hero-inner");
    const scrollRailBar = root.querySelector(".scroll-rail__bar");
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const isReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const smooth = {
      enabled: finePointer && !isReduced,
      target: 0,
      current: 0,
      ease: SMOOTH_EASE,
      lastSet: -1,
      running: false,
    };

    const maxScroll = () =>
      Math.max(0, document.documentElement.scrollHeight - window.innerHeight);

    let smoothRaf = null;
    let visualRaf = null;

    function updateScrollVisuals(scrollPosition) {
      if (document.hidden) return;

      const max = maxScroll();
      const progress = max > 0 ? Math.min(1, Math.max(0, scrollPosition / max)) : 0;
      if (scrollRailBar) {
        scrollRailBar.style.transform = `scaleX(${progress.toFixed(4)})`;
      }

      if (heroInner) {
        const travel = window.innerHeight * 0.55 || 1;
        const heroOut = Number(Math.min(1, Math.max(0, scrollPosition / travel)).toFixed(4));
        heroInner.style.transform = `translate3d(0, ${-50 * heroOut}px, ${340 * heroOut}px)`;
        heroInner.style.opacity = String(1 - heroOut * 1.2);
      }
    }

    function scheduleNativeScrollVisuals() {
      if (visualRaf !== null) return;
      visualRaf = requestAnimationFrame(() => {
        visualRaf = null;
        updateScrollVisuals(window.scrollY);
      });
    }

    function smoothTick() {
      const diff = smooth.target - smooth.current;
      if (Math.abs(diff) < 0.35) {
        smooth.current = smooth.target;
        smooth.running = false;
      } else {
        smooth.current += diff * smooth.ease;
      }
      smooth.lastSet = Math.round(smooth.current);
      window.scrollTo(0, smooth.current);
      updateScrollVisuals(smooth.current);
      ScrollTrigger.update();
      if (smooth.running) {
        smoothRaf = requestAnimationFrame(smoothTick);
      } else {
        smoothRaf = null;
      }
    }

    function startSmooth() {
      if (!smooth.running) {
        smooth.running = true;
        smoothRaf = requestAnimationFrame(smoothTick);
      }
    }

    function scrollToY(y) {
      const dest = Math.min(maxScroll(), Math.max(0, y));
      if (smooth.enabled) {
        smooth.target = dest;
        startSmooth();
      } else {
        window.scrollTo({
          top: dest,
          behavior: isReduced ? "auto" : "smooth",
        });
      }
    }

    const canScrollNatively = (target, deltaY) => {
      let element = target instanceof Element ? target : target?.parentElement;

      while (element && element !== document.body) {
        if (element !== document.documentElement) {
          const overflowY = window.getComputedStyle(element).overflowY;
          const isTextarea = element.tagName === "TEXTAREA";
          const isVerticallyScrollable = ["auto", "scroll", "overlay"].includes(overflowY);

          if (
            (isTextarea || isVerticallyScrollable) &&
            element.scrollHeight > element.clientHeight + 1
          ) {
            if (deltaY < 0 && element.scrollTop > 0) return true;
            if (deltaY > 0 && element.scrollTop + element.clientHeight < element.scrollHeight - 1) {
              return true;
            }
          }
        }

        if (element === root) break;
        element = element.parentElement;
      }

      return false;
    };

    // Wheel listener for inertia scrolling
    const onWheel = (e) => {
      if (
        e.ctrlKey ||
        e.defaultPrevented ||
        Math.abs(e.deltaY) < Math.abs(e.deltaX) ||
        canScrollNatively(e.target, e.deltaY)
      ) return;
      e.preventDefault();
      const unit = e.deltaMode === 1 ? 18 : e.deltaMode === 2 ? window.innerHeight : 1;
      smooth.target = Math.min(maxScroll(), Math.max(0, smooth.target + e.deltaY * unit));
      startSmooth();
    };

    // Resync current & target if scrolled externally (scrollbar drag, page up/down)
    const onScroll = () => {
      if (!smooth.enabled) {
        scheduleNativeScrollVisuals();
        return;
      }

      const diff = Math.abs(window.scrollY - smooth.lastSet);
      if (!smooth.running) {
        if (diff > 2) {
          smooth.target = smooth.current = window.scrollY;
          updateScrollVisuals(smooth.current);
        }
      } else if (diff > 80) {
        // User forcefully dragged scrollbar or pressed page up/down during smooth scroll
        smooth.running = false;
        smooth.target = smooth.current = window.scrollY;
        updateScrollVisuals(smooth.current);
      }
    };

    const onResize = () => {
      updateScrollVisuals(smooth.enabled ? smooth.current : window.scrollY);
    };

    if (smooth.enabled) {
      smooth.target = smooth.current = window.scrollY;
      window.addEventListener("wheel", onWheel, { passive: false });
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    updateScrollVisuals(smooth.enabled ? smooth.current : window.scrollY);

    // Anchor click handler for smooth, pixel-accurate landing
    const onAnchorClick = (e) => {
      const anchor = e.target.closest('a[href^="#"]');
      if (!anchor) return;
      const href = anchor.getAttribute("href");
      if (!href || href === "#") return;
      const targetEl = document.querySelector(href);
      if (targetEl) {
        e.preventDefault();
        const dest = targetEl.getBoundingClientRect().top + window.scrollY;
        scrollToY(dest);
        try {
          const current = navigateRef.current;
          current.navigate(
            { pathname: current.pathname, hash: href },
            { replace: false, preventScrollReset: true },
          );
        } catch {
          // A route change can invalidate the anchor navigation during the click.
        }
      }
    };

    root.addEventListener("click", onAnchorClick);

    // GSAP context for content reveals (if not reduced motion)
    let context = null;
    if (!isReduced) {
      context = gsap.context(() => {
        // Scroll-Triggered Section & Item Reveals
        const revealGroups = root.querySelectorAll("[data-reveal-group]");

        revealGroups.forEach((group) => {
          const items = Array.from(group.querySelectorAll("[data-reveal]"));
          if (!items.length) return;

          gsap.set(items, {
            opacity: 0,
            y: SCROLL_REVEAL_CONFIG.yOffset,
            z: SCROLL_REVEAL_CONFIG.zDepth,
            transformPerspective: SCROLL_REVEAL_CONFIG.perspective,
          });

          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: group,
              start: SCROLL_REVEAL_CONFIG.triggerThreshold,
              once: true,
            },
            onComplete: () => {
              gsap.set(items, { clearProps: "transform,opacity" });
            },
          });

          tl.to(
            items,
            {
              opacity: 1,
              duration: SCROLL_REVEAL_CONFIG.opacityDuration,
              ease: "refEaseOut",
              stagger: SCROLL_REVEAL_CONFIG.staggerDelay,
            },
            0
          );

          tl.to(
            items,
            {
              y: 0,
              z: 0,
              duration: SCROLL_REVEAL_CONFIG.transformDuration,
              ease: "refEaseOut",
              stagger: SCROLL_REVEAL_CONFIG.staggerDelay,
            },
            0
          );
        });

        const standaloneItems = Array.from(root.querySelectorAll("[data-reveal]")).filter(
          (item) => !item.closest("[data-reveal-group]")
        );

        standaloneItems.forEach((item) => {
          gsap.set(item, {
            opacity: 0,
            y: SCROLL_REVEAL_CONFIG.yOffset,
            z: SCROLL_REVEAL_CONFIG.zDepth,
            transformPerspective: SCROLL_REVEAL_CONFIG.perspective,
          });

          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: item,
              start: SCROLL_REVEAL_CONFIG.triggerThreshold,
              once: true,
            },
            onComplete: () => {
              gsap.set(item, { clearProps: "transform,opacity" });
            },
          });

          tl.to(
            item,
            {
              opacity: 1,
              duration: SCROLL_REVEAL_CONFIG.opacityDuration,
              ease: "refEaseOut",
            },
            0
          );

          tl.to(
            item,
            {
              y: 0,
              z: 0,
              duration: SCROLL_REVEAL_CONFIG.transformDuration,
              ease: "refEaseOut",
            },
            0
          );
        });
      }, root);
    }

    ScrollTrigger.refresh();

    return () => {
      if (context) context.revert();
      if (smoothRaf) cancelAnimationFrame(smoothRaf);
      if (visualRaf !== null) cancelAnimationFrame(visualRaf);
      if (smooth.enabled) {
        window.removeEventListener("wheel", onWheel);
      }
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      root.removeEventListener("click", onAnchorClick);
    };
  }, []);

  return (
    <main className="portfolio-page" ref={pageRef}>
      <div className="scroll-rail" aria-hidden="true">
        <i className="scroll-rail__bar" />
      </div>
      <PortfolioNav />
      <FloatingNav />
      <CandleGlow />
      <HeroSection />
      <AboutSection />
      <EducationSection />
      <LeadershipSection />
      <ProjectsSection />
      <SkillsSection />
      <ContactSection />
    </main>
  );
}
