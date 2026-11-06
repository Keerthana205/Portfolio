# Keerthana Devan — Personal Developer Portfolio

> A cinematic, editorial, celestial developer portfolio website.

[![PRD Version](https://img.shields.io/badge/PRD-v1.0-800020.svg)](#)
[![Stack](https://img.shields.io/badge/Stack-HTML5%20%7C%20CSS3%20%7C%20ES6%2B-C99A68.svg)](#)
[![License](https://img.shields.io/badge/License-MIT-260308.svg)](#)

---

## ✦ Project Overview

This repository houses the personal portfolio of **Keerthana Devan**, a 4th-year B.Tech Computer Science & Engineering student. The website departs from conventional portfolio templates by delivering a cinematic, editorial, and celestial visual experience anchored in deep burgundy (`#260308`), wine red (`#430B13`), warm cream (`#F6DFC1`), and muted gold (`#C99A68`).

### Architecture & Key Decisions (Confirmed via PRD Section 13)
- **Frontend Stack**: Vanilla HTML5, CSS3, and JavaScript ES6+ (Zero build dependencies, lightning fast, static-first).
- **Project Detail Navigation**: Dedicated URL / hash routes (`#/project/unix`).
- **Intro Sequence Frequency**: Once per browsing session (`sessionStorage` flag).
- **Target Hosting**: GitHub Pages / Static hosting.
- **Mobile Approach**: Responsive fluid adaptation of desktop visual identity with touch-friendly controls.

---

## ✦ Project Structure

```
keerthana-portfolio/
├── index.html                  # Semantic single-page application entry point
├── assets/                     # Media & vector assets
│   ├── images/                 # Approved character illustrations & background art
│   ├── projects/               # Project screenshots & mockups
│   ├── certificates/           # Original verifiable certificate scans
│   ├── icons/                  # Interface icons
│   └── fonts/                  # Web font files
├── css/
│   ├── variables.css           # Global color palette, type scales, spacing tokens
│   ├── global.css              # Reset, typography, utility classes, buttons & footer
│   ├── navigation.css          # Fixed header, wordmark, nav links, mobile drawer
│   ├── intro.css               # Opening title sequence styles (Phase 01)
│   ├── home.css                # Hero section & character layout (Phase 01)
│   ├── about.css               # Two-column biographical & interest layout (Phase 02)
│   ├── projects.css            # 3D layered carousel & detail view (Phase 03)
│   ├── skills.css              # Interactive toolkit & floating rock layout (Phase 04)
│   ├── certifications.css      # Proof-of-learning cards & preview modal (Phase 04)
│   ├── contact.css             # Form styling & validation states (Phase 05)
│   ├── animations.css          # Celestial float, twinkle, and motion keyframes
│   └── responsive.css          # Comprehensive viewport & breakpoint overrides
├── js/
│   ├── main.js                 # App initialization, copyright, back-to-top
│   ├── intro.js                # Opening sequence controller
│   ├── navigation.js           # Scroll observer, active link highlighter, mobile drawer
│   ├── projects.js             # Project carousel & detail view router
│   ├── skills.js               # Skill category switcher
│   ├── certifications.js       # Certificate filtering & modal preview
│   └── contact.js              # Form validation & submission handler
├── data/
│   ├── projects.js             # Verified project case study data
│   ├── skills.js               # Structured technical capability taxonomies
│   └── certifications.js       # Real certificate metadata and assets
├── resume/
│   └── resume.pdf              # Verified downloadable PDF resume
└── README.md                   # Project documentation & implementation log
```

---

## ✦ Design System Tokens

| Token | Reference Value | Intended Use |
| :--- | :--- | :--- |
| **Deep Burgundy** | `#260308` | Primary canvas & body background |
| **Wine Red** | `#430B13` | Secondary elevated surfaces & cards |
| **Warm Cream** | `#F6DFC1` | Primary typography & highlighted controls |
| **Muted Gold** | `#C99A68` | Four-point stars, borders & decorative accents |
| **Dark Shadow** | `#170306` | High-contrast depths & modal backdrops |
| **Warm Glow** | `#9B422A` | Ambient atmospheric lighting & focus glows |

---

## ✦ Roadmap & Phase Gates

- [x] **Phase 00 — Project Foundation**: Repository init, design tokens (`variables.css`), typography, layout conventions, shared navigation, reusable button styles, asset library setup.
- [ ] **Phase 01 — Intro & Home**: Title sequence animation, hero layout, original character illustration, scroll indicator.
- [ ] **Phase 02 — About**: Two-column layout, arched frame illustration, biographical profile, Build/Design/Learn/Explore interest elements.
- [ ] **Phase 03 — Projects**: Layered front/behind manual carousel, detail view routes, verified implementation details.
- [ ] **Phase 04 — Skills & Certifications**: Interactive two-state toggle, floating celestial rock, original certificate preview cards.
- [ ] **Phase 05 — Contact & Footer**: Validated contact form, submission handling, verified social channels, minimal footer.
- [ ] **Phase 06 — Integration & Refinement**: Accessibility audit, cross-browser verification, responsive fine-tuning, performance optimization.
- [ ] **Phase 07 — Deployment**: GitHub Pages deployment, live URL validation, mobile device check.

---

## ✦ Development & Testing

To preview locally:
```bash
# Using Python built-in server
python -m http.server 8000

# Open in browser:
# http://localhost:8000
```
