import { useEffect, useRef, useState } from "react";
import { Menu, X } from "lucide-react";

const floatingNavLinks = [
  { label: "Home", id: "home" },
  { label: "About", id: "about" },
  { label: "Projects", id: "projects" },
  { label: "Skills", id: "skills" },
  { label: "Contact", id: "contact" },
];

export default function FloatingNav() {
  const [visible, setVisible] = useState(false);
  const [open, setOpen] = useState(false);
  const [activeId, setActiveId] = useState("home");
  const [isOnDark, setIsOnDark] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [direction, setDirection] = useState({ top: false, left: false, maxHeight: 0 });
  const wrapRef = useRef(null);
  const buttonRef = useRef(null);
  const dragOffsetRef = useRef({ x: 0, y: 0 });
  const dragSessionRef = useRef(null);
  const suppressClickRef = useRef(false);
  const suppressClickTimerRef = useRef(null);
  const scheduleContextRef = useRef(null);

  const getViewportRect = () => {
    const viewport = window.visualViewport;
    const left = viewport?.offsetLeft ?? 0;
    const top = viewport?.offsetTop ?? 0;
    const width = viewport?.width ?? window.innerWidth;
    const height = viewport?.height ?? window.innerHeight;
    return { left, top, right: left + width, bottom: top + height, width, height };
  };

  const getSafeInsets = () => {
    if (!wrapRef.current) return { top: 0, right: 0, bottom: 0, left: 0 };
    const styles = window.getComputedStyle(wrapRef.current);
    const read = (side) => Number.parseFloat(styles.getPropertyValue(`--floating-nav-safe-${side}`)) || 0;
    return { top: read("top"), right: read("right"), bottom: read("bottom"), left: read("left") };
  };

  const moveBy = (dx, dy, scheduleContext = true) => {
    const button = buttonRef.current;
    if (!button || !wrapRef.current) return;

    const buttonRect = button.getBoundingClientRect();
    const viewport = getViewportRect();
    const safe = getSafeInsets();
    const marginLeft = Math.max(8, safe.left);
    const marginRight = Math.max(8, safe.right);
    const marginTop = Math.max(8, safe.top);
    const marginBottom = Math.max(8, safe.bottom);
    const clamp = (value, min, max) =>
      min > max ? (min + max) / 2 : Math.min(max, Math.max(min, value));
    const moveX = clamp(dx, viewport.left + marginLeft - buttonRect.left, viewport.right - marginRight - buttonRect.right);
    const moveY = clamp(dy, viewport.top + marginTop - buttonRect.top, viewport.bottom - marginBottom - buttonRect.bottom);

    dragOffsetRef.current.x += moveX;
    dragOffsetRef.current.y += moveY;
    wrapRef.current.style.translate = `${dragOffsetRef.current.x}px ${dragOffsetRef.current.y}px`;
    if (scheduleContext) scheduleContextRef.current?.();
  };

  const updateMenuDirection = () => {
    const button = buttonRef.current;
    if (!button) return;

    const rect = button.getBoundingClientRect();
    const viewport = getViewportRect();
    const safe = getSafeInsets();
    const top = rect.top + rect.height / 2 < viewport.top + viewport.height / 2;
    const left = rect.left + rect.width / 2 < viewport.left + viewport.width / 2;
    const gap = 10;
    const availableHeight = top
      ? viewport.bottom - Math.max(8, safe.bottom) - rect.bottom - gap
      : rect.top - viewport.top - Math.max(8, safe.top) - gap;
    const maxHeight = Math.max(0, Math.floor(availableHeight));

    setDirection((current) =>
      current.top === top && current.left === left && current.maxHeight === maxHeight
        ? current
        : { top, left, maxHeight },
    );
  };

  const updateTheme = () => {
    const button = buttonRef.current;
    if (!button) return;

    const rect = button.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const hits = document.elementsFromPoint(centerX, centerY);
    let theme = "light";
    let foundTheme = false;
    for (const element of hits) {
      if (wrapRef.current?.contains(element)) continue;
      const themedSection = element.closest?.("[data-nav-theme]");
      if (themedSection && !wrapRef.current?.contains(themedSection)) {
        theme = themedSection.dataset.navTheme;
        foundTheme = true;
        break;
      }
    }

    if (!foundTheme) {
      let topmostSection = null;
      let topmostZIndex = Number.NEGATIVE_INFINITY;
      document.querySelectorAll("section[data-nav-theme]").forEach((section) => {
        const sectionRect = section.getBoundingClientRect();
        const containsCenter =
          centerX >= sectionRect.left &&
          centerX <= sectionRect.right &&
          centerY >= sectionRect.top &&
          centerY <= sectionRect.bottom;
        if (!containsCenter) return;

        const zIndex = Number.parseInt(window.getComputedStyle(section).zIndex, 10) || 0;
        if (zIndex >= topmostZIndex) {
          topmostSection = section;
          topmostZIndex = zIndex;
        }
      });
      if (topmostSection) theme = topmostSection.dataset.navTheme;
    }

    const onDark = theme === "dark";
    setIsOnDark((current) => (current === onDark ? current : onDark));
  };

  useEffect(() => {
    const button = buttonRef.current;
    const sections = floatingNavLinks
      .map(({ id }) => document.getElementById(id))
      .filter(Boolean);
    const about = document.getElementById("about");
    let frame = null;

    const update = () => {
      frame = null;
      const vh = window.innerHeight;
      const focusLine = vh * 0.35;
      let current = sections[0];
      sections.forEach((section) => {
        if (section.getBoundingClientRect().top <= focusLine) current = section;
      });
      const atBottom =
        vh + window.scrollY >= document.documentElement.scrollHeight - 2;
      if (atBottom && sections.length) current = sections[sections.length - 1];
      if (current) setActiveId(current.id);
      const nextVisible =
        about ? about.getBoundingClientRect().top <= vh * 0.5 : window.scrollY > vh * 0.6;
      setVisible(nextVisible);
      if (!nextVisible) setOpen(false);
      updateTheme();
      updateMenuDirection();
    };
    const schedule = (event) => {
      if (event && event.type !== "scroll") moveBy(0, 0, false);
      if (frame === null) frame = window.requestAnimationFrame(update);
    };

    scheduleContextRef.current = schedule;
    update();
    window.addEventListener("load", updateTheme);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    window.addEventListener("orientationchange", schedule);
    window.visualViewport?.addEventListener("resize", schedule);
    window.visualViewport?.addEventListener("scroll", schedule);
    return () => {
      if (frame !== null) window.cancelAnimationFrame(frame);
      window.removeEventListener("load", updateTheme);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      window.removeEventListener("orientationchange", schedule);
      window.visualViewport?.removeEventListener("resize", schedule);
      window.visualViewport?.removeEventListener("scroll", schedule);
      if (scheduleContextRef.current === schedule) scheduleContextRef.current = null;
      if (suppressClickTimerRef.current !== null) {
        window.clearTimeout(suppressClickTimerRef.current);
      }
      const pointerId = dragSessionRef.current?.pointerId;
      if (pointerId !== undefined && button?.hasPointerCapture(pointerId)) {
        button.releasePointerCapture(pointerId);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- Global listeners intentionally use stable ref-based movement and direction helpers.
  }, []);

  useEffect(() => {
    if (!open) return undefined;
    const onPointerDown = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    const onKeyDown = (e) => {
      if (e.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const handlePointerDown = (event) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    if (dragSessionRef.current) return;

    if (suppressClickTimerRef.current !== null) {
      window.clearTimeout(suppressClickTimerRef.current);
      suppressClickTimerRef.current = null;
    }
    suppressClickRef.current = false;
    event.currentTarget.setPointerCapture(event.pointerId);
    dragSessionRef.current = {
      pointerId: event.pointerId,
      originX: event.clientX,
      originY: event.clientY,
      startX: dragOffsetRef.current.x,
      startY: dragOffsetRef.current.y,
      dragging: false,
    };
  };

  const handlePointerMove = (event) => {
    const session = dragSessionRef.current;
    if (!session || session.pointerId !== event.pointerId) return;

    const dx = event.clientX - session.originX;
    const dy = event.clientY - session.originY;
    if (!session.dragging && Math.hypot(dx, dy) <= 6) return;

    if (!session.dragging) {
      session.dragging = true;
      setIsDragging(true);
      setOpen(false);
    }
    event.preventDefault();
    moveBy(session.startX + dx - dragOffsetRef.current.x, session.startY + dy - dragOffsetRef.current.y);
  };

  const finishPointer = (event, cancelled = false) => {
    const session = dragSessionRef.current;
    if (!session || session.pointerId !== event.pointerId) return;

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    dragSessionRef.current = null;
    if (!session.dragging) return;

    setIsDragging(false);
    updateMenuDirection();
    scheduleContextRef.current?.();
    suppressClickRef.current = !cancelled;
    if (suppressClickRef.current) {
      suppressClickTimerRef.current = window.setTimeout(() => {
        suppressClickRef.current = false;
        suppressClickTimerRef.current = null;
      }, 0);
    }
  };

  const handleToggleClick = (event) => {
    if (suppressClickRef.current) {
      event.preventDefault();
      suppressClickRef.current = false;
      if (suppressClickTimerRef.current !== null) {
        window.clearTimeout(suppressClickTimerRef.current);
        suppressClickTimerRef.current = null;
      }
      return;
    }

    const nextOpen = !open;
    if (nextOpen) updateMenuDirection();
    setOpen(nextOpen);
  };

  const handleToggleKeyDown = (event) => {
    if (open) return;

    const nudges = {
      ArrowLeft: [-16, 0],
      ArrowRight: [16, 0],
      ArrowUp: [0, -16],
      ArrowDown: [0, 16],
    };
    const nudge = nudges[event.key];
    if (nudge) {
      event.preventDefault();
      moveBy(nudge[0], nudge[1]);
      updateMenuDirection();
      return;
    }

    if (event.key === "Home") {
      event.preventDefault();
      dragOffsetRef.current = { x: 0, y: 0 };
      if (wrapRef.current) wrapRef.current.style.translate = "0px 0px";
      updateMenuDirection();
      scheduleContextRef.current?.();
    }
  };

  return (
    <div
      ref={wrapRef}
      className={`floating-nav${visible ? " is-visible" : ""}${open ? " is-open" : ""}${isOnDark ? " is-on-dark" : ""}${isDragging ? " is-dragging" : ""}${direction.top ? " is-top" : ""}${direction.left ? " is-left" : ""}`}
      style={{
        "--floating-nav-menu-max-height": `${direction.maxHeight}px`,
      }}
      aria-hidden={!visible}
      inert={!visible}
    >
      <nav
        id="floating-nav-menu"
        className="floating-nav__menu"
        aria-label="Section navigation"
        inert={!open}
      >
        <ul>
          {floatingNavLinks.map((link, index) => {
            const isActive = activeId === link.id && link.id !== "home";
            return (
              <li key={link.id} style={{ "--i": index }}>
                <a
                  href={`#${link.id}`}
                  className={isActive ? "is-active" : undefined}
                  aria-current={isActive ? "location" : undefined}
                  onClick={() => {
                    setActiveId(link.id);
                    setOpen(false);
                  }}
                >
                  {link.label}
                </a>
              </li>
            );
          })}
        </ul>
      </nav>
      <button
        ref={buttonRef}
        className="floating-nav__toggle"
        type="button"
        aria-label={open ? "Close section menu" : "Open section menu"}
        aria-expanded={open}
        aria-controls="floating-nav-menu"
        aria-description="Drag to move. Arrow keys nudge it, Home resets"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={finishPointer}
        onPointerCancel={(event) => finishPointer(event, true)}
        onClick={handleToggleClick}
        onKeyDown={handleToggleKeyDown}
      >
        {open ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
      </button>
    </div>
  );
}
