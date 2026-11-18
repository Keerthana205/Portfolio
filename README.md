# Keerthana Devan | Portfolio

A personal portfolio featuring an animated introduction and a scrolling portfolio page.

<!-- TODO: add live demo link and screenshot after deployment -->

![React 19](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![Vite 6](https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white)
![GSAP](https://img.shields.io/badge/GSAP-88CE02?logo=greensock&logoColor=white)
![React Router 7](https://img.shields.io/badge/React_Router-7-CA4245?logo=reactrouter&logoColor=white)
![Lucide React](https://img.shields.io/badge/Lucide_React-icons-F56565?logo=lucide&logoColor=white)

## About

This is the personal portfolio of Keerthana Devan. It opens with an animated K-logo intro and continues into a scrolling portfolio page presenting projects, skills, and contact information.

## Features

- Animated intro with a Skip Intro button
- Hero with pinned scrolling and a typed-letter text entrance
- Scroll-progress rail and eased page scrolling
- GSAP scroll-reveal animations
- Featured Projects deck for UniX, SignBridge, and SkySense with project info panels
- Draggable floating section menu that adapts to dark and light sections
- Contact form with Formspree submission, validation, honeypot spam protection, and toast feedback
- Responsive layout, favicon set, and web manifest

## Tech Stack

- React 19
- Vite 6
- GSAP and ScrollTrigger
- React Router 7 (`react-router-dom`)
- Lucide React (`lucide-react`)
- Plain CSS
- ESLint 9

## Getting Started

Requirements: Node.js 18 or newer and npm.

```sh
npm install
npm run dev
npm run build
npm run preview
npm run lint
```

## Environment Variables

Copy `.env.example` to `.env` and set the Formspree endpoint:

```dotenv
VITE_FORMSPREE_ENDPOINT=https://formspree.io/f/YOUR_FORM_ID
```

The endpoint is the public form URL from the Formspree form configured to deliver messages to the site owner's email. Set the same variable in the hosting provider's environment settings. `.env` is ignored by Git.

## Project Structure

```text
.
|-- src/
|   |-- app/                 # Application routing and startup
|   |-- data/                # Portfolio and project content
|   |-- hooks/               # Shared React hooks, including scroll flow
|   `-- pages/
|       |-- Intro/           # Intro experience
|       `-- Portfolio/       # Portfolio page, focused components, and stylesheet
|-- public/                  # Runtime files served directly by the site
|-- source-assets/           # Original image inputs; not published by Vite
`-- scripts/                 # Image generation scripts and scripts/README.md
```

## Deployment

Build with `npm run build` and serve the generated `dist/` directory. Set `VITE_FORMSPREE_ENDPOINT` in the hosting provider's environment settings, and configure an SPA rewrite to `index.html` for the `/portfolio` and `/intro` routes (for example, with Vercel or Netlify).

## Author

Keerthana Devan
