import { useLayoutEffect, useRef } from "react";

export default function SectionHeading({ id, eyebrow, title, description, light = false, suffix = null }) {
  const headingRef = useRef(null);

  useLayoutEffect(() => {
    const heading = headingRef.current;
    if (!heading || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return undefined;

    heading.classList.add("is-draw-ready");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.6) {
            heading.classList.add("is-drawn");
          } else if (!entry.isIntersecting) {
            heading.classList.remove("is-drawn");
          }
        });
      },
      { threshold: [0, 0.6], rootMargin: "0px 0px -8% 0px" },
    );
    observer.observe(heading);

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={headingRef} className={`section-heading${light ? " section-heading--light" : ""}`}>
      {eyebrow && <p className="section-heading__eyebrow">{eyebrow}</p>}
      <div className="section-heading__title-row">
        <h2 id={id}>{title}</h2>
        {suffix}
      </div>
      {description && <p className="section-heading__description">{description}</p>}
    </div>
  );
}
