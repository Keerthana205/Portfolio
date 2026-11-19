import { useLayoutEffect, useRef } from "react";
import { ArrowUpRight, Download } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

function splitIntoChars(el) {
  const target = el.querySelector("[data-hero-animated]") || el;
  const existing = target.querySelectorAll("[data-char]");
  if (existing.length) return Array.from(existing);
  const walker = document.createTreeWalker(target, NodeFilter.SHOW_TEXT);
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
  return Array.from(target.querySelectorAll("[data-char]"));
}

export default function HeroSection() {
  const copyRef = useRef(null);

  useLayoutEffect(() => {
    const root = copyRef.current;
    if (!root) return undefined;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return undefined;

    const HERO_TYPE_DELAY = 0.4;
    const typed = [
      { sel: ".hero-copy__eyebrow", dur: 0.4 },
      { sel: "#hero-title", dur: 0.8 },
    ];
    const intro = root.querySelector(".hero-copy__intro");
    const actions = root.querySelector(".hero-copy__actions");
    let title = null;
    let onTitleShimmerEnd = null;
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
      const rest = intro ? [intro] : [];
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

      title = root.querySelector("#hero-title");
      onTitleShimmerEnd = (event) => {
        if (event.animationName === "heroShimmer") title?.classList.remove("is-shimmering");
      };
      if (title) {
        title.addEventListener("animationend", onTitleShimmerEnd);
        tl.call(() => {
          title.classList.remove("is-shimmering");
          void title.offsetWidth;
          title.classList.add("is-shimmering");
        }, null, cursor + 0.1);
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
    return () => {
      if (title && onTitleShimmerEnd) title.removeEventListener("animationend", onTitleShimmerEnd);
      ctx.revert();
    };
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
            <p className="hero-copy__eyebrow">
              <span className="visually-hidden">Hey, I&#8217;m</span>
              <span data-hero-animated aria-hidden="true">Hey, I&#8217;m</span>
            </p>
            <h1 id="hero-title">
              <span className="visually-hidden">Keerthana Devan</span>
              <span data-hero-animated aria-hidden="true">Keerthana Devan</span>
            </h1>
            <p className="hero-copy__intro">
              Final-year Computer Science and Engineering student interested in software development, with a curiosity for exploring new tools and building projects that combine functionality with thoughtful design.
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
              width="768"
              height="768"
              fetchPriority="high"
              data-reveal
            />
          </div>
        </div>
      </section>
    </div>
  );
}
