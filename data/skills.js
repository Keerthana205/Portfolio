/**
 * Keerthana Devan — Personal Portfolio
 * Skills Data Source
 * Reference: PRD v1.0 Section 4.5 & 5.4
 */

const skillsData = {
  categories: [
    {
      id: "programming",
      name: "Programming",
      description: "Core programming languages utilized for problem solving, algorithm implementation, and software development.",
      skills: [
        { name: "C", level: "Proficient", icon: "c" },
        { name: "C++", level: "Proficient", icon: "cpp" },
        { name: "Java", level: "Proficient", icon: "java" },
        { name: "Python", level: "Proficient", icon: "python" }
      ]
    },
    {
      id: "web-development",
      name: "Web Development",
      description: "Modern web standards and styling methodologies for crafting responsive, interactive client applications.",
      skills: [
        { name: "HTML5", level: "Advanced", icon: "html5" },
        { name: "CSS3", level: "Advanced", icon: "css3" },
        { name: "JavaScript", level: "Proficient", icon: "javascript" }
      ]
    },
    {
      id: "database-tools",
      name: "Database & Tools",
      description: "Data persistence systems, query languages, version control, and team collaboration tooling.",
      skills: [
        { name: "MySQL", level: "Proficient", icon: "mysql" },
        { name: "MongoDB", level: "Working Knowledge", icon: "mongodb" },
        { name: "Git", level: "Proficient", icon: "git" },
        { name: "GitHub", level: "Proficient", icon: "github" }
      ]
    },
    {
      id: "core-concepts",
      name: "Core Concepts",
      description: "Fundamental computer science principles and software engineering foundations.",
      skills: [
        { name: "Data Structures", level: "Core", icon: "dsa" },
        { name: "OOP", level: "Core", icon: "oop" },
        { name: "DBMS", level: "Core", icon: "dbms" }
      ]
    },
    {
      id: "currently-learning",
      name: "Currently Learning",
      description: "Emerging domains and technologies actively being studied and applied in exploratory projects.",
      skills: [
        { name: "Machine Learning & AI", level: "Active Study", icon: "ai" },
        { name: "Cloud Architectures", level: "Active Study", icon: "cloud" },
        { name: "Advanced Front-End", level: "Active Study", icon: "react" }
      ]
    }
  ]
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = skillsData;
}
