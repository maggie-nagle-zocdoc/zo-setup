# Zo Setup

Guided setup flow for **Zo** — Zocdoc's AI phonebot. Providers use this flow to configure their Zo experience for the first time.

## Structure

- **Entry:** Zocdoc homepage wireframe ([`src/app/page.tsx`](src/app/page.tsx)) — providers see the homepage and Zo task in To do.
- **Intro:** Welcome and overview at `/projects/zo-setup/intro`.
- **Sections:** Three sections (Phone lines, Scheduling preferences, Voice configuration), each with multiple tasks.

All flow UI uses the **Vibezz** component library (design system in `src/components/vibezz/`) for styles and components.

## Running the app

From the repo root:

```bash
npm install
npm run dev
```

Open [http://localhost:3080](http://localhost:3080). You’ll see the homepage; click **Set up Zo** to start the guided flow.

## Project layout

```
zo-setup/
├── README.md
├── package.json
├── src/
│   ├── app/
│   │   ├── page.tsx              # Homepage wireframe
│   │   ├── layout.tsx
│   │   └── projects/
│   │       ├── zo-setup/         # Zo setup flow + shell
│   │       │   ├── manifest.ts
│   │       │   ├── zo-setup-shell.tsx
│   │       │   └── pages/
│   │       ├── registry.ts
│   │       └── ...
│   ├── components/vibezz/        # Design system
│   └── styles/                   # Tokens, etc.
├── public/
└── ...
```

## Editing the flow

- **Add/rename sections or pages:** Edit [`src/app/projects/zo-setup/manifest.ts`](src/app/projects/zo-setup/manifest.ts) and add or update the corresponding page under `src/app/projects/zo-setup/pages/`.
- **Change the homepage or Zo task:** Edit [`src/app/page.tsx`](src/app/page.tsx).
- **Use Vibezz components:** Import from `@/components/vibezz` and use design tokens from `src/styles/`.

## GitHub Pages

The app deploys to GitHub Pages via the workflow in `.github/workflows/deploy-pages.yml`. Build runs from root with `GITHUB_PAGES=true` (static export). Ensure **Settings → Pages → Source** is set to **GitHub Actions**.
