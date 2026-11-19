import { useLayoutEffect } from "react";
import gsap from "gsap";

const DECOR_PARALLAX = [
  { selector: ".about-section__plant", section: ".about-section", from: -12, to: 12 },
  { selector: ".contact-section__flower", section: ".contact-section", from: -28, to: 0 },
];

export function useDecorParallax(containerRef) {
  useLayoutEffect(() => {
    const root = containerRef?.current || document;
    const elements = DECOR_PARALLAX
      .map(({ selector }) => root.querySelector(selector))
      .filter(Boolean);
    const mm = gsap.matchMedia();

    mm.add(
      {
        isDesktop: "(min-width: 769px)",
        motionOk: "(prefers-reduced-motion: no-preference)",
      },
      (context) => {
        const { isDesktop, motionOk } = context.conditions;
        if (!isDesktop || !motionOk) return undefined;

        DECOR_PARALLAX.forEach(({ selector, section, from, to }) => {
          const element = root.querySelector(selector);
          const trigger = element?.closest(section);
          if (!element || !trigger) return;

          gsap.fromTo(
            element,
            { "--parallax-y": `${from}px` },
            {
              "--parallax-y": `${to}px`,
              ease: "none",
              scrollTrigger: {
                trigger,
                start: "top bottom",
                end: "bottom top",
                scrub: true,
                invalidateOnRefresh: true,
              },
            },
          );
        });

        return undefined;
      },
    );

    return () => {
      mm.revert();
      elements.forEach((element) => element.style.removeProperty("--parallax-y"));
    };
  }, [containerRef]);
}
