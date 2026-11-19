import { Code2, Database, Github, Globe2, Wrench } from "lucide-react";
import { skillGroups } from "../../../data/portfolioContent.js";
import { assetUrl } from "../../../assetUrl.js";
import SectionHeading from "./SectionHeading.jsx";

export default function SkillsSection() {
  const icons = [Code2, Globe2, Database, Wrench];
  const logoSources = {
    Java: assetUrl("assets/skills/java.png"),
    Python: assetUrl("assets/skills/python.png"),
    HTML: assetUrl("assets/skills/html5.png"),
    CSS: assetUrl("assets/skills/css3.png"),
    JavaScript: assetUrl("assets/skills/javascript.png"),
    MySQL: assetUrl("assets/skills/mysql.svg"),
    SQL: assetUrl("assets/skills/sql.svg"),
    Firebase: assetUrl("assets/skills/firebase.png"),
    Git: assetUrl("assets/skills/git.png"),
  };

  return (
    <section className="content-section skills-section" id="skills" aria-labelledby="skills-title" data-nav-theme="light">
      <div className="page-container">
        <div className="skills-section__intro" data-scroll-flow>
          <SectionHeading id="skills-title" title="Technical Skills" />
          <p className="body-copy">
            A blend of programming, development and problem-solving skills I use to build
            real-world solutions.
          </p>
        </div>
        <div className="skill-groups">
          {skillGroups.map((group, index) => {
            const Icon = icons[index] || Code2;
            return (
              <section className="skill-group" key={group.title} aria-label={group.title} data-scroll-flow>
                <h3>
                  <Icon size={25} aria-hidden="true" />
                  {group.title}
                </h3>
                <ul>
                  {group.skills.map((skill) => (
                    <li
                      className={`skill-badge skill-badge--${skill.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
                      key={skill}
                    >
                      {skill === "C" && (
                        <svg viewBox="0 0 32 32" aria-hidden="true">
                          <circle cx="16" cy="16" r="15" fill="#659ad2" />
                          <text x="16" y="23" textAnchor="middle">C</text>
                        </svg>
                      )}
                      {skill === "GitHub" && <Github size={19} aria-hidden="true" />}
                      {logoSources[skill] && (
                        <img
                          src={logoSources[skill]}
                          alt=""
                          width="256"
                          height="256"
                          aria-hidden="true"
                        />
                      )}
                      <span>{skill}</span>
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      </div>
    </section>
  );
}
