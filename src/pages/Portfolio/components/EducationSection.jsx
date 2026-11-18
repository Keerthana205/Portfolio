import { BookOpen, GraduationCap } from "lucide-react";
import { education } from "../../../data/portfolioContent.js";
import SectionHeading from "./SectionHeading.jsx";

export default function EducationSection() {
  const icons = [GraduationCap, BookOpen, BookOpen];

  return (
    <section className="content-section education-section" id="education" aria-labelledby="education-title" data-nav-theme="light">
      <div className="page-container">
        <div data-scroll-flow>
          <SectionHeading id="education-title" title="My Education" />
        </div>
        <ol className="education-list">
          {education.map((item, index) => {
            const Icon = icons[index];
            return (
              <li className="education-item" key={item.qualification} data-scroll-flow>
                <span className="education-item__icon" aria-hidden="true">
                  <Icon size={20} strokeWidth={1.7} />
                </span>
                <div className="education-item__details">
                  <h3>{item.qualification}</h3>
                  <p>{item.institution}</p>
                </div>
                <span className="education-item__period">{item.period}</span>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
