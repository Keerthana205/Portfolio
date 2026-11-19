<table width="100%">
  <tr>
    <td align="center" bgcolor="#24020b">
      <br />
      <img src="public/assets/brand/keerthana-logo.webp" width="150" alt="Gold and ivory K logo with a gold swoosh and sparkles" />
      <h1><font color="#e4be71">Keerthana Devan</font></h1>
      <p><font color="#fff8eb">Final-year CSE student from Cherthala, Kerala</font></p>
      <p><font color="#e4be71">✦ ━━━━━━━━━━━━━━━━━━ ✦</font></p>
      <br />
    </td>
  </tr>
</table>

<p align="center">
  <img src="https://img.shields.io/badge/React-19-24020b?style=for-the-badge&logo=react&logoColor=e4be71" alt="React 19" />
  <img src="https://img.shields.io/badge/Vite-6-24020b?style=for-the-badge&logo=vite&logoColor=e4be71" alt="Vite 6" />
  <img src="https://img.shields.io/badge/GSAP-ScrollTrigger-24020b?style=for-the-badge&logo=greensock&logoColor=e4be71" alt="GSAP and ScrollTrigger" />
  <a href="https://linkedin.com/in/keerthana-devan-ba523a293"><img src="https://img.shields.io/badge/LinkedIn-Profile-24020b?style=for-the-badge&logo=linkedin&logoColor=e4be71" alt="LinkedIn profile" /></a>
  <a href="https://github.com/Keerthana205"><img src="https://img.shields.io/badge/GitHub-Profile-24020b?style=for-the-badge&logo=github&logoColor=e4be71" alt="GitHub profile" /></a>
</p>

<p align="center">
  <img src="docs/readme-divider.svg" width="100%" alt="" />
</p>

<h2 align="center">✦ About this site</h2>

<p align="center">A personal portfolio for Keerthana Devan, a final-year CSE student from Cherthala, Kerala. It opens with an animated K-logo introduction, then scrolls through projects, skills, education, leadership, and a contact form.</p>

<p align="center"><strong>LIVE PORTFOLIO</strong><br /><em>Link to be added after deployment.</em></p>

<p align="center">
  <img src="docs/readme-divider.svg" width="100%" alt="" />
</p>

<h2 align="center">✦ Selected projects</h2>

| Project | Repository | Live site | About | Stack |
| --- | --- | --- | --- | --- |
| **UniX** | [GitHub](https://github.com/Keerthana205/UniX) | [Visit](https://keerthana205.github.io/UniX) | Campus community for skill sharing, tutoring, trading, and lost & found. | Firebase · JavaScript · CSS · HTML5 |
| **SkySense** | [GitHub](https://github.com/Keerthana205/SkySense) | [Visit](https://keerthana205.github.io/SkySense/) | Weather dashboard with real-time updates, forecasts, location search, and outdoor insights. | HTML5 · CSS · JavaScript · FastAPI |
| **SignBridge** · Under Development | [GitHub](https://github.com/Akashvg2005/signbridge) | Not listed | AI interview platform for sign-language recognition and speech-to-caption support for Deaf and Hard-of-Hearing people. | Python · React · MediaPipe · OpenCV · HTML5 |

<p align="center">
  <img src="docs/readme-divider.svg" width="100%" alt="" />
</p>

<h2 align="center">✦ What you'll find</h2>

- ✧ An animated K-logo introduction with a Skip Intro control
- ✧ A scrolling portfolio with project cards, skills, education, leadership, and contact sections
- ✧ GSAP scroll reveals, a reading progress rail, and a floating section menu
- ✧ A contact form with validation, a honeypot, Formspree submission, and success or error feedback
- ✧ A responsive layout, favicon set, and web app manifest

<p align="center">
  <img src="docs/readme-divider.svg" width="100%" alt="" />
</p>

<h2 align="center">✦ Made with</h2>

<p align="center">React 19&nbsp; · &nbsp;Vite 6&nbsp; · &nbsp;GSAP + ScrollTrigger&nbsp; · &nbsp;React Router 7&nbsp; · &nbsp;Lucide React&nbsp; · &nbsp;Plain CSS&nbsp; · &nbsp;ESLint 9</p>

<p align="center">
  <img src="docs/readme-divider.svg" width="100%" alt="" />
</p>

<h2 align="center">✦ Run locally</h2>

Requirements: Node.js 18 or newer and npm.

```sh
npm install
npm run dev
```

<p align="center">Build, preview, and lint commands</p>

```sh
npm run build
npm run preview
npm run lint
```

<p align="center">
  <img src="docs/readme-divider.svg" width="100%" alt="" />
</p>

<h2 align="center">✦ Contact form setup</h2>

Copy `.env.example` to `.env` and set the endpoint for the Formspree form that should receive messages:

```dotenv
VITE_FORMSPREE_ENDPOINT=
```

Set the same variable in the hosting provider's environment settings. `.env` is ignored by Git.

<p align="center">
  <img src="docs/readme-divider.svg" width="100%" alt="" />
</p>

<h2 align="center">✦ Project structure</h2>

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

<p align="center">
  <img src="docs/readme-divider.svg" width="100%" alt="" />
</p>

<h2 align="center">✦ Deployment</h2>

Run `npm run build` and deploy the generated `dist/` directory. Configure `VITE_FORMSPREE_ENDPOINT` in the hosting provider's environment settings. The `public/_redirects` file configures the Netlify SPA rewrite, and `vercel.json` configures the Vercel rewrite so `/portfolio` and `/intro` work on refresh.

<p align="center">
  <img src="docs/readme-divider.svg" width="100%" alt="" />
</p>

<p align="center">
  <strong>Thank you for visiting</strong><br />
  <a href="mailto:keerthanadevan15@gmail.com">keerthanadevan15@gmail.com</a>
</p>
