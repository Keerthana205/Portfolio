import { useLayoutEffect, useRef } from "react";
import { ArrowUpRight, Download } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

function splitIntoChars(el) {
  const existing = el.querySelectorAll("[data-char]");
  if (existing.length) return Array.from(existing);
  el.setAttribute("aria-label", el.textContent.replace(/\s+/g, " ").trim());
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  nodes.forEach((node) => {
    const frag = document.createDocumentFragment();
    node.nodeValue.split(/(\s+)/).forEach((part) => {
      if (!part) return;
      if (/^\s+$/.test(part)) {
        frag.appendChild(document.createTextNode(part));
        return;
      }
      const word = document.createElement("span");
      word.className = "hero-type-word";
      word.setAttribute("aria-hidden", "true");
      Array.from(part).forEach((ch) => {
        const c = document.createElement("span");
        c.setAttribute("data-char", "");
        c.textContent = ch;
        word.appendChild(c);
      });
      frag.appendChild(word);
    });
    node.replaceWith(frag);
  });
  return Array.from(el.querySelectorAll("[data-char]"));
}

export default function HeroSection() {
  const copyRef = useRef(null);

  useLayoutEffect(() => {
    const root = copyRef.current;
    if (!root) return undefined;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return undefined;

    const HERO_TYPE_DELAY = 0.4;
    const typed = [
      { sel: ".hero-copy__eyebrow", dur: 0.45 },
      { sel: "#hero-title", dur: 0.9 },
    ];
    const role = root.querySelector(".hero-copy__role");
    const intro = root.querySelector(".hero-copy__intro");
    const actions = root.querySelector(".hero-copy__actions");
    const ctx = gsap.context(() => {
      const chars = [];
      let cursor = 0;
      typed.forEach(({ sel }) => {
        const el = root.querySelector(sel);
        if (!el) return;
        const elementChars = splitIntoChars(el);
        if (!elementChars.length) return;
        chars.push(...elementChars);
      });
      const rest = [role, intro].filter(Boolean);
      const tl = gsap.timeline({ paused: true, delay: HERO_TYPE_DELAY });

      typed.forEach(({ sel, dur }) => {
        const el = root.querySelector(sel);
        if (!el) return;
        const elementChars = el.querySelectorAll("[data-char]");
        if (!elementChars.length) return;
        tl.to(
          elementChars,
          {
            opacity: 1,
            duration: 0.01,
            ease: "none",
            stagger: { each: dur / elementChars.length },
          },
          cursor,
        );
        cursor += dur + 0.12;
      });
      if (rest.length) {
        tl.to(
          rest,
          {
            opacity: 1,
            y: 0,
            duration: 0.7,
            stagger: 0.12,
            ease: "power3.out",
            clearProps: "transform,opacity",
          },
          Math.max(0, cursor - 0.2),
        );
      }
      if (actions) {
        tl.to(
          actions,
          {
            opacity: 1,
            y: 0,
            duration: 0.7,
            ease: "power3.out",
            clearProps: "transform,opacity",
          },
          cursor + 0.2,
        );
      }

      const playEntrance = () => {
        gsap.set(chars, { opacity: 0 });
        if (rest.length) gsap.set(rest, { opacity: 0, y: 18 });
        if (actions) gsap.set(actions, { opacity: 0, y: 18 });
        tl.restart();
      };
      ScrollTrigger.create({
        trigger: root.closest(".hero-pin") || root,
        start: "top top",
        end: "bottom top",
        onEnterBack: playEntrance,
      });
      playEntrance();
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <div className="hero-pin" id="home">
      <section className="hero-section hero-stage" aria-labelledby="hero-title" data-reveal-group data-nav-theme="dark">
        <div className="hero-section__backdrop" aria-hidden="true">
          <div className="hero-section__bg" />
          <div className="hero-section__glow" />
        </div>
        <div className="page-container hero-section__inner hero-inner">
          <div className="hero-copy" ref={copyRef}>
            <p className="hero-copy__eyebrow">Hey, I’m</p>
            <h1 id="hero-title">
              Keerthana Devan
            </h1>
            <p className="hero-copy__role">
              4th Year CSE Student <span aria-hidden="true">|</span> Aspiring Software Engineer
            </p>
            <p className="hero-copy__intro">
              A curious builder who loves turning ideas into meaningful, user-focused solutions.
            </p>
            <div className="hero-copy__actions">
              <a className="button button--ivory" href="#projects">
                View Projects <ArrowUpRight size={18} aria-hidden="true" />
              </a>
              <a
                className="button button--outline"
                href="/assets/Keerthana_Devan_Resume.pdf"
                download="Keerthana_Devan_Resume.pdf"
              >
                <Download size={21} strokeWidth={2.2} aria-hidden="true" />
                Download Resume
              </a>
            </div>
          </div>
          <div className="hero-portrait">
            <img
              src="/assets/characters/portfolio-home.webp"
              alt="Keerthana smiling with her hand resting against her cheek"
              fetchPriority="high"
              data-reveal
            />
          </div>
        </div>
      </section>
    </div>
  );
}
