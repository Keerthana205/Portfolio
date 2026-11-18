# Keerthana Devan Portfolio

## Run locally

```sh
npm install
npm run dev
```

## Environment

Copy `.env.example` to `.env` and set the Formspree endpoint:

```dotenv
VITE_FORMSPREE_ENDPOINT=https://formspree.io/f/YOUR_FORM_ID
```

The endpoint is the public form URL from the Formspree form configured to deliver messages to the site owner's email. Set the same variable in the hosting provider's environment settings. `.env` is ignored by Git.

## Project layout

- `src/app/` — application routing and startup.
- `src/data/` — portfolio and project content.
- `src/hooks/` — shared React hooks, including scroll flow.
- `src/pages/Intro/` — intro experience.
- `src/pages/Portfolio/` — portfolio page, its focused components, and the single portfolio stylesheet.
- `public/` — files served directly by the site, including runtime images and favicon assets.
- `source-assets/` — original image inputs retained for generated artwork; these are not published by Vite.
- `scripts/` — one-off image generation scripts and their notes in `scripts/README.md`.
Production build: `npm run build`. Lint source files with `npm run lint`.
