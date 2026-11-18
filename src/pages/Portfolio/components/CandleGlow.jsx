import { useEffect, useRef } from "react";

// Frame-rate-independent pointer easing: the fraction approached per 1/60 s.
const FOLLOW_EASE = 0.12;
// Limit how often the section theme is read from the DOM.
const THEME_SAMPLE_MS = 100;

function CandleGlow() {
  const glowRef = useRef(null);

  useEffect(() => {
    const glow = glowRef.current;
    if (!glow) return undefined;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const coarsePointer = window.matchMedia("(pointer: coarse)");
    const noHover = window.matchMedia("(hover: none)");
    if (reducedMotion.matches || coarsePointer.matches || noHover.matches) return undefined;

    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
    let hasPosition = false;
    let lastThemeSample = -Infinity;
    let frame = null;
    let lastFrameTime = 0;

    const hide = () => glow.classList.remove("is-on");

    const animate = (time) => {
      frame = null;
      if (document.hidden) return;
      if (document.querySelector(".intro-scene")) {
        hide();
        return;
      }

      const dt = lastFrameTime ? Math.min((time - lastFrameTime) / 1000, 1 / 30) : 1 / 60;
      lastFrameTime = time;
      const factor = 1 - Math.pow(1 - FOLLOW_EASE, dt * 60);
      currentX += (targetX - currentX) * factor;
      currentY += (targetY - currentY) * factor;
      glow.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`;

      if (Math.hypot(targetX - currentX, targetY - currentY) >= 0.5) {
        frame = window.requestAnimationFrame(animate);
      } else {
        currentX = targetX;
        currentY = targetY;
        glow.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`;
        lastFrameTime = 0;
      }
    };

    const scheduleFrame = () => {
      if (frame === null && !document.hidden) {
        frame = window.requestAnimationFrame(animate);
      }
    };

    const onPointerMove = (event) => {
      if (event.pointerType !== "mouse" && event.pointerType !== "pen") return;
      if (document.hidden || document.querySelector(".intro-scene")) {
        hide();
        return;
      }

      targetX = event.clientX;
      targetY = event.clientY;
      if (!hasPosition) {
        currentX = targetX;
        currentY = targetY;
        hasPosition = true;
        glow.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`;
      }

      const now = performance.now();
      if (now - lastThemeSample >= THEME_SAMPLE_MS) {
        lastThemeSample = now;
        const theme = document
          .elementFromPoint(targetX, targetY)
          ?.closest("[data-nav-theme]")?.dataset.navTheme;
        if (theme === "dark") glow.classList.add("is-on");
        else hide();
      }

      scheduleFrame();
    };

    const onPointerLeave = () => hide();
    const onVisibilityChange = () => {
      if (document.hidden) {
        hide();
        if (frame !== null) window.cancelAnimationFrame(frame);
        frame = null;
        lastFrameTime = 0;
        return;
      }
      if (hasPosition && Math.hypot(targetX - currentX, targetY - currentY) >= 0.5) {
        scheduleFrame();
      }
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    document.addEventListener("mouseleave", onPointerLeave);
    window.addEventListener("pointerleave", onPointerLeave);
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      if (frame !== null) window.cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("mouseleave", onPointerLeave);
      window.removeEventListener("pointerleave", onPointerLeave);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      glow.classList.remove("is-on");
      glow.style.removeProperty("transform");
      frame = null;
    };
  }, []);

  return <div ref={glowRef} className="candle-glow" aria-hidden="true" />;
}

export default CandleGlow;
