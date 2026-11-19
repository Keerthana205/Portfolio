<p align="center">
  <img src="public/assets/brand/keerthana-logo.webp" width="150" alt="Keerthana Devan's gold and ivory K monogram" />
</p>

<h1 align="center">Keerthana Devan</h1>

<p align="center">Final-year CSE student from Cherthala, Kerala, sharing software development projects.</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19-24020b?style=for-the-badge&logo=react&logoColor=e4be71" alt="React 19" />
  <img src="https://img.shields.io/badge/Vite-6-24020b?style=for-the-badge&logo=vite&logoColor=e4be71" alt="Vite 6" />
  <img src="https://img.shields.io/badge/GSAP-ScrollTrigger-24020b?style=for-the-badge&logo=greensock&logoColor=e4be71" alt="GSAP and ScrollTrigger" />
  <a href="https://linkedin.com/in/keerthana-devan-ba523a293"><img src="https://img.shields.io/badge/LinkedIn-Profile-24020b?style=for-the-badge&logo=linkedin&logoColor=e4be71" alt="LinkedIn profile" /></a>
  <a href="https://github.com/Keerthana205"><img src="https://img.shields.io/badge/GitHub-Profile-24020b?style=for-the-badge&logo=github&logoColor=e4be71" alt="GitHub profile" /></a>
</p>

---

## About this site

This portfolio opens with an animated K-logo introduction, then scrolls through Keerthana's projects, skills, education, leadership experience, and contact form. It is built with React 19, Vite 6, GSAP, React Router 7, Lucide React, and plain CSS.

**Live portfolio:** _Link to be added after deployment._

---

## Projects

| Project | Repository | Live site | About | Stack |
| --- | --- | --- | --- | --- |
| **UniX** | [GitHub](https://github.com/Keerthana205/UniX) | [Visit](https://keerthana205.github.io/UniX) | Campus community for skill sharing, tutoring, trading, and lost & found. | Firebase · JavaScript · CSS · HTML5 |
| **SkySense** | [GitHub](https://github.com/Keerthana205/SkySense) | [Visit](https://keerthana205.github.io/SkySense/) | Weather dashboard with real-time updates, forecasts, location search, and outdoor insights. | HTML5 · CSS · JavaScript · FastAPI |
| **SignBridge** · Under Development | [GitHub](https://github.com/Akashvg2005/signbridge) | Not listed | AI interview platform for sign-language recognition and speech-to-caption support for Deaf and Hard-of-Hearing people. | Python · React · MediaPipe · OpenCV · HTML5 |

---

## Features

- Animated K-logo introduction with a Skip Intro control
- Scrolling portfolio page with projects, skills, education, leadership, and contact sections
- Featured project card deck with navigation controls and project information panels
- Scroll reveals, a reading progress rail, and a floating section menu
- Contact form with validation, a honeypot, Formspree submission, and success or error feedback
- Responsive layout, favicon set, and web app manifest

---

## Tech stack

- **UI:** React 19, plain CSS, Lucide React
- **Build:** Vite 6
- **Motion:** GSAP and ScrollTrigger
- **Routing:** React Router 7
- **Code checks:** ESLint 9

---

## Run locally

Requirements: Node.js 18 or newer and npm.

```sh
npm install
npm run dev
```

Other project commands:

```sh
npm run build
npm run preview
npm run lint
```

## Environment setup

Copy `.env.example` to `.env` and set the endpoint for the Formspree form that should receive messages:

```dotenv
VITE_FORMSPREE_ENDPOINT=
```

Set the same variable in the hosting provider's environment settings. `.env` is ignored by Git; do not commit private environment files.

---

## Project structure

```text
.
├── src/
│   ├── app/                   # Routing and application startup
│   ├── data/                  # Portfolio content and project details
│   ├── hooks/                 # Scroll and layout hooks
│   ├── pages/
│   │   ├── Intro/             # Animated introduction
│   │   └── Portfolio/
│   │       └── components/    # Portfolio sections
│   └── styles/                # Global styles
├── public/                    # Site assets and runtime files
├── source-assets/             # Original image inputs, not published by Vite
└── scripts/                   # Asset generation and optimization
```

---

## Deployment

Run `npm run build` and deploy the generated `dist/` directory. Configure `VITE_FORMSPREE_ENDPOINT` in the hosting provider's environment settings. The `public/_redirects` file configures the Netlify SPA rewrite, and `vercel.json` configures the Vercel rewrite so `/portfolio` and `/intro` work on refresh.

---

<p align="center">
  <a href="mailto:keerthanadevan15@gmail.com">keerthanadevan15@gmail.com</a>
</p>
