import SectionHeading from "./SectionHeading.jsx";

export default function LeadershipSection() {
  return (
    <section className="content-section leadership-section" id="leadership" aria-labelledby="leadership-title" data-nav-theme="light">
      <img
        className="leadership-section__lily"
        src="/assets/decor/red-lily.webp"
        alt=""
        aria-hidden="true"
        loading="lazy"
        decoding="async"
      />
      <div className="page-container leadership-section__inner">
        <div data-scroll-flow>
          <SectionHeading id="leadership-title" title="Leadership" />
        </div>
        <article className="leadership-card" data-scroll-flow>
          <p className="leadership-card__role">
            Vice Chair, IEEE Student Branch – CECTL
          </p>
          <div className="leadership-card__meta">
            <span>College of Engineering Cherthala (CECTL)</span>
            <span aria-hidden="true">|</span>
            <span>2026 – 2027</span>
          </div>
          <p className="leadership-card__note">
            Driving impactful student initiatives and hands-on technical programs to strengthen
            the IEEE community at CECTL.
          </p>
        </article>
      </div>
    </section>
  );
}
