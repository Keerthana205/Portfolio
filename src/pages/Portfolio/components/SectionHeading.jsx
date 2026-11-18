

export default function SectionHeading({ id, eyebrow, title, description, light = false, suffix = null }) {
  return (
    <div className={`section-heading${light ? " section-heading--light" : ""}`}>
      {eyebrow && <p className="section-heading__eyebrow">{eyebrow}</p>}
      <div className="section-heading__title-row">
        <h2 id={id}>{title}</h2>
        {suffix}
      </div>
      {description && <p className="section-heading__description">{description}</p>}
    </div>
  );
}
