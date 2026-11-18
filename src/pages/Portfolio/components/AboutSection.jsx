import SectionHeading from "./SectionHeading.jsx";

export default function AboutSection() {
  return (
    <section
      className="content-section about-section"
      id="about"
      aria-labelledby="about-title"
      data-nav-theme="light"
    >
      <svg
        className="about-section__wave"
        viewBox="0 0 1440 120"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path d="M0 38C171-23 255 3 414 33c158 30 277 39 424 13 187-34 288-45 602 14v60H0Z" />
      </svg>
      <div className="page-container about-section__inner">
        <div className="about-section__copy">
          <div data-scroll-flow>
            <SectionHeading id="about-title" title="My Journey" />
          </div>
          <p className="body-copy" data-scroll-flow>
            I’m in my final year of B.Tech in Computer Science and Engineering at the College of
            Engineering Cherthala. Throughout my degree, I’ve built a strong foundation in
            programming and software development through projects involving frontend development,
            application logic, and data handling. I aspire to become a Software Engineer.
          </p>
        </div>
        <div className="about-section__media">
          <div className="about-section__polaroid-wrap" data-scroll-flow>
            <figure className="about-section__polaroid">
              <img
                className="about-section__plant"
                src="/assets/decor/black-plant-thin.png"
                alt=""
                aria-hidden="true"
              />
              <img
        src="/assets/characters/portfolio-about-polaroid.webp"
                alt="Polaroid-style portrait of Keerthana smiling and making a peace sign"
                loading="lazy"
                decoding="async"
              />
            </figure>
          </div>
        </div>
      </div>
    </section>
  );
}
