# Zo Setup

Guided setup flow for **Zo** — Zocdoc's AI phonebot. Providers use this flow to configure their Zo experience for the first time.

## Structure

- **Entry:** Zocdoc homepage wireframe ([`vibezz/src/app/page.tsx`](vibezz/src/app/page.tsx)) — providers see the homepage and a "Set up Zo" CTA.
- **Intro:** Welcome and overview at `/projects/zo-setup/intro`.
- **Sections:** Three sections, each with multiple pages/tasks:
  - **Section 1** — welcome + 2 tasks
  - **Section 2** — welcome + 2 tasks
  - **Section 3** — welcome + 2 tasks

All flow UI uses the **Vibezz** component library (design system in `vibezz/`) for styles and components.

## Running the app

From the **vibezz** directory:

```bash
cd vibezz
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). You’ll see the Zocdoc homepage wireframe; click **Set up Zo** to start the guided flow.

## Project layout

```
zo-setup/
├── README.md                 # This file
├── vibezz/                   # Vibezz app + Zo setup flow
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx                    # Zocdoc homepage wireframe (entry)
│   │   │   └── projects/
│   │   │       ├── registry.ts             # Registers Zo setup + other projects
│   │   │       ├── zo-setup/
│   │   │       │   ├── manifest.ts         # Sections + pages for Zo setup
│   │   │       │   └── pages/
│   │   │       │       ├── intro.tsx       # Intro page
│   │   │       │       ├── section-1-welcome.tsx
│   │   │       │       ├── section-1-task-2.tsx
│   │   │       │       ├── section-1-task-3.tsx
│   │   │       │       ├── section-2-*.tsx
│   │   │       │       └── section-3-*.tsx
│   │   │       └── ...
│   │   ├── components/vibezz/  # Design system components
│   │   └── styles/            # Tokens, etc.
│   └── package.json
└── ...
```

## Editing the flow

- **Add/rename sections or pages:** Edit [`vibezz/src/app/projects/zo-setup/manifest.ts`](vibezz/src/app/projects/zo-setup/manifest.ts) and add or update the corresponding page under `vibezz/src/app/projects/zo-setup/pages/`.
- **Change the wireframe or entry:** Edit [`vibezz/src/app/page.tsx`](vibezz/src/app/page.tsx).
- **Use Vibezz components:** Import from `@/components/vibezz` and follow the [Vibezz README](vibezz/README.md) and design tokens.
