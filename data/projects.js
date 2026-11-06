/**
 * Keerthana Devan — Personal Portfolio
 * Projects Data Source
 * Reference: PRD v1.0 Section 4.4 & 5.4
 */

const projectsData = [
  {
    id: "unix",
    name: "UniX",
    category: "Full Stack & Web Application",
    shortDescription: "Unified digital campus ecosystem designed to streamline student, faculty, and academic administration services.",
    image: "assets/projects/unix-preview.png",
    technologies: ["JavaScript", "HTML5", "CSS3", "Node.js", "Express", "MongoDB"],
    githubUrl: "https://github.com/keerthana205/UniX",
    demoUrl: "",
    problem: "Academic campuses frequently depend on fragmented portals for attendance, grades, scheduling, and notice circulars, creating friction and missed communications for students and faculty.",
    solution: "UniX centralizes student utilities into a single, cohesive, role-based dashboard offering real-time announcements, course resource access, and responsive timetable management.",
    features: [
      "Role-based authentication for students and faculty",
      "Unified dashboard for announcements and event alerts",
      "Course materials repository and submission tracking",
      "Responsive schedule and timetable visualizer"
    ]
  },
  {
    id: "skysense",
    name: "SkySense",
    category: "Front-End & API Integration",
    shortDescription: "Personal weather dashboard delivering precise meteorological forecasts with intuitive visual feedback.",
    image: "assets/projects/skysense-preview.png",
    technologies: ["JavaScript", "HTML5", "CSS3", "Weather API", "Fetch API"],
    githubUrl: "https://github.com/keerthana205/SkySense",
    demoUrl: "",
    problem: "Conventional weather applications often overwhelm users with cluttered ad banners and confusing metric layouts, making quick daily checks slow and frustrating.",
    solution: "SkySense delivers a clean, responsive interface highlighting core atmospheric parameters—temperature, wind velocity, humidity, and condition indicators—using live API data.",
    features: [
      "Real-time location weather retrieval via Geolocation or search",
      "Dynamic weather condition visual styling and atmospheric metrics",
      "Multi-day forecast projections with temperature trends",
      "Lightweight, zero-bloat client-side API caching"
    ]
  },
  {
    id: "signbridge",
    name: "SignBridge",
    category: "AI & Accessible Technology",
    shortDescription: "AI-powered interview platform designed to empower deaf and hard-of-hearing individuals during technical interviews.",
    image: "assets/projects/signbridge-preview.png",
    technologies: ["Python", "Computer Vision", "Machine Learning", "Flask", "JavaScript"],
    githubUrl: "https://github.com/keerthana205/SignBridge",
    demoUrl: "",
    problem: "Deaf and hard-of-hearing candidates face substantial communication hurdles in standard spoken technical interviews where interpreters may not be readily available.",
    solution: "SignBridge bridges the gap by translating sign gestures and captions in real time, fostering fair and accessible technical evaluation environments.",
    features: [
      "Gesture recognition model for key interview sign signals",
      "Bi-directional text and speech-to-sign transcription",
      "Dedicated candidate and interviewer real-time interface",
      "Accessible high-contrast UI meeting WCAG guidelines"
    ]
  }
];

if (typeof module !== 'undefined' && module.exports) {
  module.exports = projectsData;
}

