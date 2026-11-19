import { assetUrl } from "../assetUrl.js";

export const education = [
  {
    period: "Expected 2027",
    qualification: "B.Tech in Computer Science and Engineering",
    institution: "College of Engineering Cherthala (CECTL)",
  },
  {
    period: "2023",
    qualification: "Class 12 (Higher Secondary)",
    institution: "NSS HSS Panavally",
  },
  {
    period: "2021",
    qualification: "Class 10 (SSLC)",
    institution: "NSS HS Panavally",
  },
];

export const projects = [
  {
    id: "unix",
    name: "UniX",
    tagline: "Campus Ecosystem",
    image: assetUrl("assets/projects/unix-card.webp"),
    imageAlt: "UniX campus community platform design",
    description:
      "A campus community platform for skill sharing, tutoring, trading, and lost & found — all in one place, exclusively for your university.",
    tags: ["Campus", "Community"],
    repoUrl: "https://github.com/Keerthana205/UniX",
    liveUrl: "https://keerthana205.github.io/UniX",
    techStack: [
      { name: "Firebase", icon: assetUrl("assets/skills/firebase.png") },
      { name: "JavaScript", icon: assetUrl("assets/skills/javascript.png") },
      { name: "CSS3", icon: assetUrl("assets/skills/css3.png") },
      { name: "HTML5", icon: assetUrl("assets/skills/html5.png") },
    ],
  },
  {
    id: "signbridge",
    name: "SignBridge",
    tagline: "AI Interview Platform",
    image: assetUrl("assets/projects/signbridge.webp"),
    imageAlt: "SignBridge project design showing its sign-language interview interface",
    description:
      "An AI-powered interview platform for Deaf and Hard-of-Hearing individuals, enabling real-time sign language recognition and speech-to-caption conversion for accessible communication.",
    tags: ["AI/ML", "MediaPipe", "Python"],
    status: "Under Development",
    repoUrl: "https://github.com/Akashvg2005/signbridge",
    techStack: [
      { name: "Python", icon: assetUrl("assets/skills/python.png") },
      { name: "React", icon: assetUrl("assets/skills/react.svg") },
      { name: "MediaPipe", type: "cpu" },
      { name: "OpenCV", type: "eye" },
      { name: "HTML5", icon: assetUrl("assets/skills/html5.png") },
    ],
  },
  {
    id: "skysense",
    name: "SkySense",
    tagline: "Weather Dashboard",
    image: assetUrl("assets/projects/skysense-card.webp"),
    imageAlt: "SkySense weather dashboard design",
    description:
      "A responsive weather dashboard featuring real-time updates, forecasts, smart location search, and personalized outdoor insights.",
    tags: ["Weather", "Planning"],
    repoUrl: "https://github.com/Keerthana205/SkySense",
    liveUrl: "https://keerthana205.github.io/SkySense/",
    techStack: [
      { name: "HTML", icon: assetUrl("assets/skills/html5.png") },
      { name: "CSS", icon: assetUrl("assets/skills/css3.png") },
      { name: "JavaScript", icon: assetUrl("assets/skills/javascript.png") },
      { name: "FastAPI", icon: assetUrl("assets/skills/fastapi.svg") },
    ],
  },
];

export const skillGroups = [
  {
    title: "Programming",
    skills: ["C", "Java", "Python"],
  },
  {
    title: "Web Development",
    skills: ["HTML", "CSS", "JavaScript"],
  },
  {
    title: "Databases",
    skills: ["MySQL", "SQL", "Firebase"],
  },
  {
    title: "Tools & Platforms",
    skills: ["Git", "GitHub"],
  },
];

export const socialLinks = [
  {
    label: "LinkedIn",
    href: "https://linkedin.com/in/keerthana-devan-ba523a293",
  },
  {
    label: "GitHub",
    href: "https://github.com/Keerthana205",
  },
];
