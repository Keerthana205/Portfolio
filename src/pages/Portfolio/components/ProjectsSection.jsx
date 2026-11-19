import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { ArrowRight, ArrowUpRight, Cloud, Code2, Cpu, Eye, Github, Play, Zap } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { projects } from "../../../data/portfolioContent.js";
import SectionHeading from "./SectionHeading.jsx";

// 3D Interactive Card Deck geometry slots based on reference arrangement
const DECK_SLOTS_DESKTOP = [
  { x: 22, y: 14, rotate: 5, zIndex: 3, scale: 1 },        // Slot 0: Front Card
  { x: -16, y: -6, rotate: -1, zIndex: 2, scale: 0.98 },    // Slot 1: Middle Card
  { x: -54, y: -24, rotate: -7, zIndex: 1, scale: 0.96 },   // Slot 2: Back Card
];

const DECK_SLOTS_MOBILE = [
  { x: 14, y: 8, rotate: 4, zIndex: 3, scale: 1 },         // Slot 0: Front Card
  { x: -6, y: -4, rotate: -1, zIndex: 2, scale: 0.98 },     // Slot 1: Middle Card
  { x: -26, y: -16, rotate: -6, zIndex: 1, scale: 0.96 },   // Slot 2: Back Card
];

const DECK_STACK_DESKTOP = [
  { x: 0, y: 0, rotate: 0, zIndex: 3, scale: 1 },
  { x: 0, y: -10, rotate: 0, zIndex: 2, scale: 0.98 },
  { x: 0, y: -20, rotate: 0, zIndex: 1, scale: 0.96 },
];

const DECK_STACK_MOBILE = [
  { x: 0, y: 0, rotate: 0, zIndex: 3, scale: 1 },
  { x: 0, y: -8, rotate: 0, zIndex: 2, scale: 0.98 },
  { x: 0, y: -16, rotate: 0, zIndex: 1, scale: 0.96 },
];

function DeckCard({
  project,
  slotIndex,
  isFront,
  cardRef,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onPointerCancel,
  onClick,
}) {
  return (
    <article
      ref={cardRef}
      className={`deck-card${isFront ? " deck-card--front" : ""}`}
      data-project-id={project.id}
      data-slot={slotIndex}
      role="button"
      tabIndex={0}
      aria-label={`${project.name} project card (position ${slotIndex + 1} of 3)`}
      onPointerDown={(e) => onPointerDown(project.id, e)}
      onPointerMove={(e) => onPointerMove(project.id, e)}
      onPointerUp={() => onPointerUp(project.id)}
      onPointerCancel={() => onPointerCancel(project.id)}
      onClick={() => onClick(project.id)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick(project.id);
        }
      }}
    >
      {/* Vertical project name along its exposed side, reading bottom to top */}
      <div className="deck-card__spine" aria-hidden="true">
        <span className="deck-card__spine-name">{project.name}</span>
      </div>

      {/* Main card preview image: descriptions, horizontal titles, tags, and buttons removed */}
      <div className="deck-card__preview">
        <img
          src={project.image}
          alt={project.imageAlt}
          width={{ unix: 1082, signbridge: 1365, skysense: 870 }[project.id]}
          height={{ unix: 792, signbridge: 768, skysense: 632 }[project.id]}
          loading="lazy"
        />
      </div>
    </article>
  );
}

function TechIconBadge({ tech }) {
  const renderIcon = () => {
    if (tech.icon) {
      return (
        <img
          src={tech.icon}
          alt={tech.name}
          className="project-tech-badge__img"
          width="26"
          height="26"
        />
      );
    }
    if (tech.type === "zap") {
      return <Zap size={22} className="project-tech-badge__zap" />;
    }
    if (tech.type === "cloud") {
      return <Cloud size={23} className="project-tech-badge__cloud" />;
    }
    if (tech.type === "cpu") {
      return <Cpu size={22} className="project-tech-badge__cpu" />;
    }
    if (tech.type === "eye") {
      return <Eye size={22} className="project-tech-badge__eye" />;
    }
    return <Code2 size={22} />;
  };

  return (
    <div className="project-tech-badge" title={tech.name} aria-label={tech.name}>
      {renderIcon()}
    </div>
  );
}

function ProjectsDivider() {
  return (
    <div className="projects-divider" aria-hidden="true" data-reveal>
      <div className="projects-divider__line projects-divider__line--top" />
      <div className="projects-divider__star">
        <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor">
          <path d="M8 0 L9.8 6.2 L16 8 L9.8 9.8 L8 16 L6.2 9.8 L0 8 L6.2 6.2 Z" />
        </svg>
      </div>
      <div className="projects-divider__line projects-divider__line--bottom" />
    </div>
  );
}

function ProjectInfoPanel({ project, isActive }) {
  if (!project) return null;

  return (
    <div
      className={`project-info-panel${isActive ? " is-active" : ""}`}
      data-project-panel={project.id}
      aria-hidden={!isActive}
      inert={!isActive}
    >
      <div className="project-info-panel__header project-info-panel__anim">
        <h3
          className="project-info-panel__title"
          data-full={project.name}
          aria-label={project.name}
        >
          <span data-tw-shown>{project.name}</span>
          <span data-tw-rest aria-hidden="true" />
        </h3>
        {project.status && (
          <span className="project-info-panel__status">{project.status}</span>
        )}
        {project.tagline && (
          <p
            className="project-info-panel__tagline"
            data-full={project.tagline}
            aria-label={project.tagline}
          >
            <span data-tw-shown>{project.tagline}</span>
            <span data-tw-rest aria-hidden="true" />
          </p>
        )}
        <div className="project-info-panel__accent-line" aria-hidden="true" />
      </div>

      <div className="project-info-panel__section project-info-panel__anim">
        <h4 className="project-info-panel__label">Description</h4>
        <p className="project-info-panel__description">{project.description}</p>
      </div>

      <div className="project-info-panel__section project-info-panel__anim">
        <h4 className="project-info-panel__label">Tech Stack</h4>
        <div className="project-info-panel__tech-row">
          {project.techStack?.map((tech) => (
            <TechIconBadge key={tech.name} tech={tech} />
          ))}
        </div>
      </div>

      <div className="project-info-panel__divider project-info-panel__anim" aria-hidden="true" />

      <div className="project-info-panel__actions project-info-panel__anim">
        <a
          href={project.repoUrl || `https://github.com/Keerthana205/${project.id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="project-action-btn project-action-btn--repo"
        >
          <Github size={18} aria-hidden="true" />
          <span>View Repository</span>
          <ArrowUpRight size={16} aria-hidden="true" />
        </a>

        {project.liveUrl && (
          <a
            href={project.liveUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="project-action-btn project-action-btn--demo"
          >
            <Play size={13} fill="currentColor" strokeWidth={0} aria-hidden="true" />
            <span>Live Demo</span>
            <ArrowUpRight size={16} aria-hidden="true" />
          </a>
        )}
      </div>
    </div>
  );
}

const PROJECTS_FLOW = {
  enterStart: "top 60%",   // section top reaches 60% of viewport height -> entry plays
  exitStart: "bottom 40%", // section bottom reaches 40% of viewport height -> exit plays
  enterDuration: 1.4,
  exitDuration: 0.7,
  enterStagger: 0.18,
  enterEase: "power3.out",
  exitEase: "power2.in",
  enterY: 40,
  exitY: -140,
  leftX: -90,
  rightX: 90,
  leftExitX: -50,
  rightExitX: 50,
  leftTilt: 12,
};

export default function ProjectsSection() {
  // Circular order initially: UniX (Front) -> SignBridge (Middle) -> SkySense (Back)
  const [order, setOrder] = useState(["unix", "signbridge", "skysense"]);
  const [displayProjectId, setDisplayProjectId] = useState("unix");
  const sectionRef = useRef(null);
  const cardRefs = useRef({});
  const orderRef = useRef(order);
  useLayoutEffect(() => {
    orderRef.current = order;
  }, [order]);
  const deckWrapperRef = useRef(null);
  const deckStageRef = useRef(null);
  const deckDotsRef = useRef(null);
  const nextProjectRef = useRef(null);
  const infoStackRef = useRef(null);
  const infoTlRef = useRef(null);
  const isAnimatingRef = useRef(false);
  const deckTimelineRef = useRef(null);
  const isFannedRef = useRef(false);
  const pointerZonesRef = useRef(new Set());
  const focusWithinRef = useRef(false);
  const touchActiveRef = useRef(false);
  const interactionModalityRef = useRef("keyboard");
  const collapseTimerRef = useRef(null);
  const touchTimerRef = useRef(null);
  const dragRef = useRef({
    isDragging: false,
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0,
    pointerId: null,
  });

  const getSlots = () => {
    const isMobile = typeof window !== "undefined" && window.innerWidth < 960;
    if (isMobile) {
      return isFannedRef.current ? DECK_SLOTS_MOBILE : DECK_STACK_MOBILE;
    }
    return isFannedRef.current ? DECK_SLOTS_DESKTOP : DECK_STACK_DESKTOP;
  };

  const clearCollapseTimer = () => {
    if (collapseTimerRef.current !== null) {
      window.clearTimeout(collapseTimerRef.current);
      collapseTimerRef.current = null;
    }
  };

  const clearTouchTimer = () => {
    if (touchTimerRef.current !== null) {
      window.clearTimeout(touchTimerRef.current);
      touchTimerRef.current = null;
    }
  };

  const hasDeckInteraction = () =>
    pointerZonesRef.current.size > 0 || focusWithinRef.current || touchActiveRef.current;

  const isDeckInteractionTarget = (target) =>
    deckStageRef.current?.contains(target) ||
    deckDotsRef.current?.contains(target) ||
    nextProjectRef.current?.contains(target);

  const setDeckMode = (fanned) => {
    if (isAnimatingRef.current || dragRef.current.isDragging) return;
    if (isFannedRef.current === fanned) return;

    isFannedRef.current = fanned;
    const slots = getSlots();
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    orderRef.current.forEach((id, slotIdx) => {
      const el = cardRefs.current[id];
      const slot = slots[slotIdx];
      if (!el || !slot) return;

      const pose = {
        x: slot.x,
        y: slot.y,
        rotation: slot.rotate,
        scale: slot.scale,
        zIndex: slot.zIndex,
      };

      if (reducedMotion) {
        gsap.killTweensOf(el);
        gsap.set(el, pose);
      } else {
        gsap.to(el, {
          ...pose,
          duration: 0.4,
          ease: "power2.out",
          overwrite: "auto",
        });
      }
    });
  };

  const scheduleDeckCollapse = () => {
    clearCollapseTimer();
    collapseTimerRef.current = window.setTimeout(() => {
      collapseTimerRef.current = null;
      if (hasDeckInteraction() || isAnimatingRef.current || dragRef.current.isDragging) return;
      setDeckMode(false);
    }, 120);
  };

  const reconcileDeckMode = () => {
    if (isAnimatingRef.current || dragRef.current.isDragging) return;
    if (hasDeckInteraction()) {
      clearCollapseTimer();
      setDeckMode(true);
    } else {
      scheduleDeckCollapse();
    }
  };

  const startTouchInteraction = () => {
    interactionModalityRef.current = "touch";
    focusWithinRef.current = false;
    pointerZonesRef.current.clear();
    touchActiveRef.current = true;
    clearCollapseTimer();
    clearTouchTimer();
    setDeckMode(true);
    touchTimerRef.current = window.setTimeout(() => {
      touchTimerRef.current = null;
      touchActiveRef.current = false;
      if (pointerZonesRef.current.size || focusWithinRef.current) return;
      if (isAnimatingRef.current || dragRef.current.isDragging) return;
      setDeckMode(false);
    }, 1500);
  };

  const handleDeckZonePointerEnter = (zone, event) => {
    if (event.pointerType === "touch") {
      startTouchInteraction();
      return;
    }
    interactionModalityRef.current = "pointer";
    pointerZonesRef.current.add(zone);
    clearCollapseTimer();
    clearTouchTimer();
    touchActiveRef.current = false;
    setDeckMode(true);
  };

  const handleDeckZonePointerLeave = (zone, event) => {
    if (event.pointerType === "touch") {
      startTouchInteraction();
      return;
    }
    pointerZonesRef.current.delete(zone);
    if (pointerZonesRef.current.size === 0 && !focusWithinRef.current) {
      scheduleDeckCollapse();
    }
  };

  const handleDeckPointerDownCapture = (event) => {
    if (event.pointerType === "touch") {
      if (isDeckInteractionTarget(event.target)) startTouchInteraction();
      return;
    }
    interactionModalityRef.current = "pointer";
    focusWithinRef.current = false;
    clearCollapseTimer();
    clearTouchTimer();
    touchActiveRef.current = false;
  };

  const handleDeckFocusCapture = () => {
    if (interactionModalityRef.current !== "keyboard") return;
    clearCollapseTimer();
    clearTouchTimer();
    touchActiveRef.current = false;
    focusWithinRef.current = true;
    setDeckMode(true);
  };

  const handleDeckBlurCapture = (event) => {
    if (event.currentTarget.contains(event.relatedTarget)) return;
    focusWithinRef.current = false;
    scheduleDeckCollapse();
  };

  const handleDeckKeyDownCapture = () => {
    interactionModalityRef.current = "keyboard";
    clearTouchTimer();
    touchActiveRef.current = false;
    if (deckWrapperRef.current?.contains(document.activeElement)) {
      focusWithinRef.current = true;
      clearCollapseTimer();
      setDeckMode(true);
    }
  };

  useEffect(() => {
    const onDocumentPointerDown = (event) => {
      const insideDeck = isDeckInteractionTarget(event.target);
      if (event.pointerType === "touch") {
        if (insideDeck) return;
        clearTouchTimer();
        touchActiveRef.current = false;
        focusWithinRef.current = false;
        pointerZonesRef.current.clear();
        setDeckMode(false);
        return;
      }

      interactionModalityRef.current = "pointer";
      focusWithinRef.current = false;
      if (!insideDeck) {
        pointerZonesRef.current.clear();
        scheduleDeckCollapse();
      }
    };
    const onDocumentKeyDown = (event) => {
      if (event.key === "Tab" || event.key === "Enter" || event.key === " ") {
        interactionModalityRef.current = "keyboard";
      }
    };

    document.addEventListener("pointerdown", onDocumentPointerDown, true);
    document.addEventListener("keydown", onDocumentKeyDown, true);
    return () => {
      document.removeEventListener("pointerdown", onDocumentPointerDown, true);
      document.removeEventListener("keydown", onDocumentKeyDown, true);
      clearCollapseTimer();
      clearTouchTimer();
      deckTimelineRef.current?.kill();
      // eslint-disable-next-line react-hooks/exhaustive-deps -- Read the current card refs at unmount to kill their active tweens.
      Object.values(cardRefs.current).forEach((el) => {
        if (el) gsap.killTweensOf(el);
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- Mount-only document listeners intentionally use ref-based deck callbacks.
  }, []);

  // Sync positions when order updates or on initial mount
  useLayoutEffect(() => {
    const slots = getSlots();
    order.forEach((id, slotIdx) => {
      const el = cardRefs.current[id];
      if (el) {
        const slot = slots[slotIdx];
        gsap.set(el, {
          x: slot.x,
          y: slot.y,
          rotation: slot.rotate,
          scale: slot.scale,
          zIndex: slot.zIndex,
          transformOrigin: "center center",
        });
      }
    });
  }, [order]);

  // Window resize handler
  useEffect(() => {
    const handleResize = () => {
      if (isAnimatingRef.current) return;
      const slots = getSlots();
      order.forEach((id, slotIdx) => {
        const el = cardRefs.current[id];
        if (el) {
          const slot = slots[slotIdx];
          gsap.killTweensOf(el);
          gsap.set(el, {
            x: slot.x,
            y: slot.y,
            rotation: slot.rotate,
            scale: slot.scale,
            zIndex: slot.zIndex,
          });
        }
      });
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [order]);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section) return undefined;
    const left = section.querySelector(".projects-layout__left");
    const right = section.querySelector(".projects-layout__right");
    if (!left || !right) return undefined;
    const targets = [left, right];
    const F = PROJECTS_FLOW;
    const mm = gsap.matchMedia();

    mm.add(
      {
        isDesktop: "(min-width: 769px)",
        motionOk: "(prefers-reduced-motion: no-preference)",
      },
      (context) => {
        const { isDesktop, motionOk } = context.conditions;
        if (!isDesktop || !motionOk) return undefined;

        const hiddenPose = [
          { x: F.leftX, y: F.enterY, rotationX: F.leftTilt, transformPerspective: 1200, opacity: 0 },
          { x: F.rightX, y: F.enterY, rotationX: 0, transformPerspective: 1200, opacity: 0 },
        ];
        const exitPose = [
          { x: F.leftExitX, y: F.exitY, rotationX: F.leftTilt * 0.6, transformPerspective: 1200, opacity: 0 },
          { x: F.rightExitX, y: F.exitY, rotationX: 0, transformPerspective: 1200, opacity: 0 },
        ];
        let state = "hidden";

        const setPose = (poses) => targets.forEach((el, i) => gsap.set(el, poses[i]));

        const playIn = () => {
          if (state === "in") return;
          state = "in";
          gsap.killTweensOf(targets);
          targets.forEach((el, i) => {
            gsap.to(el, {
              x: 0,
              y: 0,
              rotationX: 0,
              opacity: 1,
              duration: F.enterDuration,
              delay: i * F.enterStagger,
              ease: F.enterEase,
              clearProps: "transform,opacity",
            });
          });
        };

        const playOut = () => {
          if (state === "out") return;
          state = "out";
          gsap.killTweensOf(targets);
          targets.forEach((el, i) => {
            gsap.to(el, { ...exitPose[i], duration: F.exitDuration, ease: F.exitEase });
          });
        };

        const playReset = () => {
          if (state === "hidden") return;
          state = "hidden";
          gsap.killTweensOf(targets);
          targets.forEach((el, i) => {
            gsap.to(el, { ...hiddenPose[i], duration: 0.5, ease: "power2.in" });
          });
        };

        setPose(hiddenPose);
        const st = ScrollTrigger.create({
          trigger: section,
          start: F.enterStart,
          end: F.exitStart,
          onEnter: playIn,
          onLeave: playOut,
          onEnterBack: playIn,
          onLeaveBack: playReset,
        });

        // Page loaded or resized while already inside / past the section
        if (st.isActive) {
          playIn();
        } else if (st.progress >= 1) {
          state = "out";
          setPose(exitPose);
        }

        return () => {
          gsap.killTweensOf(targets);
          gsap.set(targets, { clearProps: "transform,opacity" });
        };
      },
    );

    return () => mm.revert();
  }, []);

  const typeInto = (el, full, count) => {
    if (!el) return;
    const shown = el.querySelector("[data-tw-shown]");
    const rest = el.querySelector("[data-tw-rest]");
    if (!shown || !rest) return;
    shown.textContent = full.slice(0, count);
    rest.textContent = full.slice(count);
  };

  const INFO_OUT = 0.2;
  const INFO_IN = 0.24;

  const swapInfo = (fromId, toId) => {
    const root = infoStackRef.current;
    const outEl = root?.querySelector(`[data-project-panel="${fromId}"]`);
    const inEl = root?.querySelector(`[data-project-panel="${toId}"]`);
    if (!outEl || !inEl) {
      setDisplayProjectId(toId);
      return;
    }

    infoTlRef.current?.progress(1).kill();

    const title = inEl.querySelector(".project-info-panel__title");
    const tagline = inEl.querySelector(".project-info-panel__tagline");
    const line = inEl.querySelector(".project-info-panel__accent-line");
    const blocks = inEl.querySelectorAll(
      ".project-info-panel__section, .project-info-panel__divider, .project-info-panel__actions",
    );
    const badges = inEl.querySelectorAll(".project-tech-badge");
    const titleFull = title?.dataset.full || "";
    const tagFull = tagline?.dataset.full || "";
    const typed = { t: 0, g: 0 };
    const titleDur = Math.min(0.6, titleFull.length * 0.025);
    const tagDur = Math.min(0.5, tagFull.length * 0.02);

    // Prepare the incoming panel while it is still hidden (visibility:hidden via CSS)
    gsap.set(inEl, { opacity: 1, y: 0 });
    gsap.set(blocks, { opacity: 0, y: 18 });
    gsap.set(badges, { opacity: 0, scale: 0.6 });
    gsap.set(line, { scaleX: 0, transformOrigin: "left center" });
    typeInto(title, titleFull, 0);
    typeInto(tagline, tagFull, 0);

    const tl = gsap.timeline({
      onComplete: () => {
        typeInto(title, titleFull, titleFull.length);
        typeInto(tagline, tagFull, tagFull.length);
      },
    });
    infoTlRef.current = tl;
    tl.to(outEl, { opacity: 0, y: -10, duration: INFO_OUT, ease: "power2.in" }, 0);
    tl.add(() => setDisplayProjectId(toId), INFO_OUT);
    tl.to(line, { scaleX: 1, duration: 0.4, ease: "power3.out" }, INFO_IN);
    tl.to(typed, {
      t: titleFull.length,
      duration: titleDur,
      ease: "none",
      onUpdate: () => typeInto(title, titleFull, Math.round(typed.t)),
    }, INFO_IN);
    tl.to(typed, {
      g: tagFull.length,
      duration: tagDur,
      ease: "none",
      onUpdate: () => typeInto(tagline, tagFull, Math.round(typed.g)),
    }, INFO_IN + titleDur + 0.05);
    tl.to(blocks, { opacity: 1, y: 0, duration: 0.55, stagger: 0.07, ease: "power3.out" }, INFO_IN + 0.15);
    tl.to(badges, { opacity: 1, scale: 1, duration: 0.35, stagger: 0.05, ease: "back.out(1.6)" }, INFO_IN + 0.3);
  };

  // Physical card deck animation: active card falls sideways, loops behind, remaining cards shift forward
  // Synchronized with right-side information panel
  const goToNext = () => {
    if (isAnimatingRef.current) return;
    isAnimatingRef.current = true;

    const midId = order[1];
    const backId = order[2];
    const frontId = order[0];

    const reduceMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduceMotion) {
      setDisplayProjectId(midId);
      setOrder([midId, backId, frontId]);
      isAnimatingRef.current = false;
      reconcileDeckMode();
      return;
    }

    const slots = getSlots();
    const frontEl = cardRefs.current[frontId];
    const midEl = cardRefs.current[midId];
    const backEl = cardRefs.current[backId];

    if (!frontEl || !midEl || !backEl) {
      isAnimatingRef.current = false;
      reconcileDeckMode();
      return;
    }

    gsap.killTweensOf([frontEl, midEl, backEl]);
    const tl = gsap.timeline({
      onComplete: () => {
        setOrder([midId, backId, frontId]);
        isAnimatingRef.current = false;
        deckTimelineRef.current = null;
        reconcileDeckMode();
      },
    });
    deckTimelineRef.current = tl;
    swapInfo(frontId, midId);

    const isSmall = typeof window !== "undefined" && window.innerWidth < 960;
    const flyX = isSmall ? 180 : 240;
    const flyY = isSmall ? 35 : 45;

    // 1. Front card rotates and falls sideways following its tilt
    tl.to(
      frontEl,
      {
        x: flyX,
        y: flyY,
        rotation: 12,
        scale: 0.98,
        duration: 0.28,
        ease: "power2.in",
      },
      0
    );

    // 2. Middle card smoothly moves to the front
    tl.to(
      midEl,
      {
        x: slots[0].x,
        y: slots[0].y,
        rotation: slots[0].rotate,
        scale: slots[0].scale,
        zIndex: slots[0].zIndex,
        duration: 0.42,
        ease: "power2.out",
      },
      0.1
    );

    // 3. Back card smoothly moves to middle
    tl.to(
      backEl,
      {
        x: slots[1].x,
        y: slots[1].y,
        rotation: slots[1].rotate,
        scale: slots[1].scale,
        zIndex: slots[1].zIndex,
        duration: 0.42,
        ease: "power2.out",
      },
      0.1
    );

    // 4. Front card switches behind deck (zIndex 0) as it clears, slides in to back slot
    tl.set(frontEl, { zIndex: 0 }, 0.28);
    tl.to(
      frontEl,
      {
        x: slots[2].x,
        y: slots[2].y,
        rotation: slots[2].rotate,
        scale: slots[2].scale,
        zIndex: slots[2].zIndex,
        duration: 0.32,
        ease: "power2.out",
      },
      0.28
    );
  };

  // Dedicated transition to bring back card directly to front, synchronized with info panel
  const bringBackToFront = () => {
    if (isAnimatingRef.current) return;
    isAnimatingRef.current = true;

    const backId = order[2];
    const frontId = order[0];
    const midId = order[1];

    const reduceMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduceMotion) {
      setDisplayProjectId(backId);
      setOrder([backId, frontId, midId]);
      isAnimatingRef.current = false;
      reconcileDeckMode();
      return;
    }

    const slots = getSlots();
    const frontEl = cardRefs.current[frontId];
    const midEl = cardRefs.current[midId];
    const backEl = cardRefs.current[backId];

    if (!frontEl || !midEl || !backEl) {
      isAnimatingRef.current = false;
      reconcileDeckMode();
      return;
    }

    gsap.killTweensOf([frontEl, midEl, backEl]);
    const tl = gsap.timeline({
      onComplete: () => {
        setOrder([backId, frontId, midId]);
        isAnimatingRef.current = false;
        deckTimelineRef.current = null;
        reconcileDeckMode();
      },
    });
    deckTimelineRef.current = tl;
    swapInfo(frontId, backId);

    // Back card swoops directly to front
    tl.set(backEl, { zIndex: 5 }, 0);
    tl.to(
      backEl,
      {
        x: slots[0].x,
        y: slots[0].y,
        rotation: slots[0].rotate,
        scale: slots[0].scale,
        duration: 0.44,
        ease: "power2.out",
      },
      0
    );

    // Old front card moves to middle
    tl.to(
      frontEl,
      {
        x: slots[1].x,
        y: slots[1].y,
        rotation: slots[1].rotate,
        scale: slots[1].scale,
        zIndex: slots[1].zIndex,
        duration: 0.4,
        ease: "power2.out",
      },
      0.05
    );

    // Old middle card moves to back
    tl.to(
      midEl,
      {
        x: slots[2].x,
        y: slots[2].y,
        rotation: slots[2].rotate,
        scale: slots[2].scale,
        zIndex: slots[2].zIndex,
        duration: 0.4,
        ease: "power2.out",
      },
      0.05
    );
  };

  // Bring a specific card to front when clicked
  const bringToFront = (projectId) => {
    if (isAnimatingRef.current) return;
    setDeckMode(true);
    if (projectId === displayProjectId) return;
    const slotIdx = order.indexOf(projectId);
    if (slotIdx === 0) return; // already front
    if (slotIdx === 1) {
      goToNext();
    } else if (slotIdx === 2) {
      bringBackToFront();
    }
  };

  // Drag handlers for active front card
  const handlePointerDown = (projectId, e) => {
    if (isAnimatingRef.current) return;

    const slotIdx = order.indexOf(projectId);
    if (slotIdx !== 0) {
      bringToFront(projectId);
      return;
    }

    const cardEl = cardRefs.current[projectId];
    if (!cardEl) return;

    try {
      cardEl.setPointerCapture(e.pointerId);
    } catch {
      // Capture can fail if the pointer is already released.
    }

    dragRef.current = {
      isDragging: true,
      startX: e.clientX,
      startY: e.clientY,
      currentX: 0,
      currentY: 0,
      pointerId: e.pointerId,
    };
  };

  const handlePointerMove = (projectId, e) => {
    if (e.pointerType === "touch") startTouchInteraction();
    if (!dragRef.current.isDragging || isAnimatingRef.current) return;
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;
    dragRef.current.currentX = dx;
    dragRef.current.currentY = dy;

    if (dx > 0) {
      const cardEl = cardRefs.current[projectId];
      const slots = getSlots();
      const base = slots[0];
      gsap.set(cardEl, {
        x: base.x + dx,
        y: base.y + dx * 0.2,
        rotation: base.rotate + dx * 0.03,
      });
    }
  };

  const handlePointerUp = (projectId) => {
    if (!dragRef.current.isDragging) return;
    dragRef.current.isDragging = false;

    const cardEl = cardRefs.current[projectId];
    if (cardEl && dragRef.current.pointerId !== null) {
      try {
        cardEl.releasePointerCapture(dragRef.current.pointerId);
      } catch {
        // Capture can fail if the pointer is already released.
      }
    }

    const dx = dragRef.current.currentX;
    if (dx > 75) {
      goToNext();
    } else {
      // Snap back to resting position
      const slots = getSlots();
      const base = slots[0];
      gsap.to(cardEl, {
        x: base.x,
        y: base.y,
        rotation: base.rotate,
        scale: base.scale,
        duration: 0.25,
        ease: "power2.out",
      });
      reconcileDeckMode();
    }
  };

  const handleCardClick = (projectId) => {
    setDeckMode(true);
    const slotIdx = order.indexOf(projectId);
    if (slotIdx > 0) {
      bringToFront(projectId);
    }
  };

  return (
    <section className="projects-section" id="projects" aria-labelledby="projects-title" data-reveal-group data-nav-theme="dark" ref={sectionRef}>
      <div className="page-container projects-section__container">
        <div className="projects-layout">
          {/* LEFT SIDE: Heading, Card Deck, Controls */}
          <div className="projects-layout__left">
            <div className="projects-section__heading">
              <SectionHeading
                eyebrow="A selection of my work"
                id="projects-title"
                title="Featured Projects"
                light
              />
            </div>

            <div
              className="projects-deck-wrapper"
              ref={deckWrapperRef}
              onPointerDownCapture={handleDeckPointerDownCapture}
              onFocusCapture={handleDeckFocusCapture}
              onBlurCapture={handleDeckBlurCapture}
              onKeyDownCapture={handleDeckKeyDownCapture}
            >
              <div
                className="projects-deck-stage"
                ref={deckStageRef}
                role="group"
                aria-label="Interactive 3D project card deck. Drag the front card sideways or click an exposed card to navigate."
                onPointerEnter={(event) => handleDeckZonePointerEnter("stage", event)}
                onPointerLeave={(event) => handleDeckZonePointerLeave("stage", event)}
              >
                {projects.map((project) => {
                  const slotIndex = order.indexOf(project.id);
                  const isFront = slotIndex === 0;

                  return (
                    <DeckCard
                      key={project.id}
                      project={project}
                      slotIndex={slotIndex}
                      isFront={isFront}
                      cardRef={(el) => {
                        cardRefs.current[project.id] = el;
                      }}
                      onPointerDown={handlePointerDown}
                      onPointerMove={handlePointerMove}
                      onPointerUp={handlePointerUp}
                      onPointerCancel={handlePointerUp}
                      onClick={handleCardClick}
                    />
                  );
                })}
              </div>

              {/* Deck Navigation Controls */}
              <div className="deck-controls">
                <div
                  className="deck-dots"
                  ref={deckDotsRef}
                  role="group"
                  aria-label="Project card indicators"
                  onPointerEnter={(event) => handleDeckZonePointerEnter("dots", event)}
                  onPointerLeave={(event) => handleDeckZonePointerLeave("dots", event)}
                >
                  {projects.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      aria-current={displayProjectId === p.id ? "true" : undefined}
                      aria-label={`View ${p.name}`}
                      className={`deck-dot${displayProjectId === p.id ? " is-active" : ""}`}
                      onClick={() => bringToFront(p.id)}
                    />
                  ))}
                </div>

                <button
                  type="button"
                  className="deck-next-pill"
                  ref={nextProjectRef}
                  onClick={goToNext}
                  onPointerEnter={(event) => handleDeckZonePointerEnter("next", event)}
                  onPointerLeave={(event) => handleDeckZonePointerLeave("next", event)}
                  aria-label="Next project"
                >
                  Next Project <ArrowRight size={15} aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>

          {/* VERTICAL DECORATIVE DIVIDER */}
          <ProjectsDivider />

          {/* RIGHT SIDE: Information Panel */}
          <div className="projects-layout__right">
            <div className="project-info-stack" ref={infoStackRef}>
              {projects.map((p) => (
                <ProjectInfoPanel
                  key={p.id}
                  project={p}
                  isActive={p.id === displayProjectId}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
