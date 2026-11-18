import { useLayoutEffect } from "react";
import gsap from "gsap";

/**
 * Tunable configuration for the scroll-linked enter/hold/exit flow.
 * - enterY: distance (px) element rises from below natural position.
 * - exitY: distance (px) element moves upward past natural position when exiting.
 * - enterViewportThreshold: top enters viewport until reaching this fraction from top (0.90 = 90% of vh) to reach full opacity & y:0.
 * - exitViewportThreshold: bottom reaches this fraction from the top to begin exiting.
 * - scrub: ScrollTrigger scrub smoothing factor (0.15).
 * - tallThresholdRatio: element height / viewport height ratio considered "tall".
 * - tallEnterBonus: accelerates enter zone for tall elements so they become fully visible even faster.
 * - tallExitViewportThreshold: exit start position for tall elements.
 */
export const SCROLL_FLOW_CONFIG = {
  enterY: 50,
  exitY: -60,
  enterViewportThreshold: 0.90,
  exitViewportThreshold: 0.12,
  scrub: 0.15,
  tallThresholdRatio: 0.7,
  tallEnterBonus: 0.04,
  tallExitViewportThreshold: 0.10,
  easeEnter: "power1.out",
  easeExit: "power1.in",
};

/**
 * Reusable scroll-linked content flow hook.
 * Applies a 3-phase scrubbed animation to each matched element:
 *   1. Entering from below: rises from enterY and fades from opacity 0 -> 1.
 *   2. Reading zone (Hold): rests at natural position (y: 0, opacity: 1).
 *   3. Exiting upward: moves to exitY and fades from opacity 1 -> 0.
 *
 * Automatically disabled on screen widths <= 768px and when prefers-reduced-motion is active.
 * Cleans up cleanly on unmount or context revert.
 */
export function useScrollFlow(containerRef, selector = "[data-scroll-flow]", customConfig = {}) {
  useLayoutEffect(() => {
    const root = containerRef?.current || document;
    const config = { ...SCROLL_FLOW_CONFIG, ...customConfig };

    const mm = gsap.matchMedia();

    mm.add(
      {
        isDesktop: "(min-width: 769px)",
        motionOk: "(prefers-reduced-motion: no-preference)",
      },
      (context) => {
        const { isDesktop, motionOk } = context.conditions;
        if (!isDesktop || !motionOk) return;

        const elements = root.querySelectorAll(selector);
        if (!elements.length) return;

        elements.forEach((el) => {
          const getPhaseTimings = () => {
            const vh = window.innerHeight;
            const rect = el.getBoundingClientRect();
            const elHeight = rect.height || el.offsetHeight || 100;
            const totalDistance = elHeight + vh;
            const isTall = elHeight > vh * config.tallThresholdRatio;
            const enterThreshold = isTall
              ? Math.min(0.94, config.enterViewportThreshold + config.tallEnterBonus)
              : config.enterViewportThreshold;
            const exitThreshold = isTall
              ? config.tallExitViewportThreshold
              : config.exitViewportThreshold;

            const dEnter = Math.max(1, (1.0 - enterThreshold) * vh);
            const p1 = Math.min(0.45, Math.max(0.05, dEnter / totalDistance));
            const dExitStart = totalDistance - (exitThreshold * vh);
            const p2 = Math.max(p1 + 0.05, dExitStart / totalDistance);

            return { p1, p2 };
          };
          const { p1, p2 } = getPhaseTimings();
          const fromX = parseFloat(el.dataset.flowX) || 0;
          const exitX = parseFloat(el.dataset.flowExitX) || 0;
          const tiltX = parseFloat(el.dataset.flowRotateX) || 0;
          const enterYValue = el.dataset.flowY !== undefined ? parseFloat(el.dataset.flowY) : config.enterY;
          const skipExit = Boolean(el.closest(".contact-section"));
          let timeline;
          const enterTween = gsap.fromTo(
            el,
            {
              y: enterYValue,
              x: fromX,
              rotationX: tiltX,
              transformPerspective: tiltX ? 1200 : 0,
              opacity: 0,
            },
            {
              y: 0,
              x: 0,
              rotationX: 0,
              opacity: 1,
              duration: p1,
              ease: config.easeEnter,
            }
          );
          const exitTween = skipExit
            ? null
            : gsap.to(el, {
                y: config.exitY,
                x: exitX,
                rotationX: tiltX ? tiltX * 0.6 : 0,
                opacity: 0,
                duration: 1.0 - p2,
                ease: config.easeExit,
              });

          timeline = gsap.timeline({
            scrollTrigger: {
              trigger: el,
              start: "top bottom",
              end: "bottom top",
              scrub: config.scrub,
              invalidateOnRefresh: true,
              onRefresh: () => {
                if (!timeline) return;

                const refreshedTimings = getPhaseTimings();
                enterTween.duration(refreshedTimings.p1);
                if (exitTween) {
                  exitTween.duration(1.0 - refreshedTimings.p2);
                  timeline.remove(exitTween);
                  timeline.add(exitTween, refreshedTimings.p2);
                }
                timeline.invalidate();
              },
            },
          });

          timeline.add(enterTween, 0);

          // Phase 2: Hold zone (p1 to p2) — no transformation, holds y:0, opacity:1

          // Phase 3: Exit upward (p2 to 1.0). The final Contact section cannot
          // scroll its content to the top edge, so it stays fully visible.
          if (exitTween) {
            timeline.add(exitTween, p2);
          } else {
            // Preserve the 1.0 timeline span so the Contact enter timing stays
            // aligned with the same ScrollTrigger progress as other sections.
            timeline.call(() => {}, null, 1.0);
          }
        });
      }
    );

    return () => mm.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- customConfig defaults to a fresh object, so tracking it would rerun this effect each render.
  }, [containerRef, selector]);
}
