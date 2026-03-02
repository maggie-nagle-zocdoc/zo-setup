# Projects Feature Design

## Overview

Add a projects system that lets designers create and organize multi-page projects. Projects are discoverable via a searchable listing page, and each project has a home page showing its pages. All content is lazy-loaded.

## Decisions

- **Data storage:** File-system convention — folder structure IS the data
- **Discovery:** Manifest files per project with name, description, tags, pages
- **Project home:** Overview section + page list (single-column layout)
- **Page navigation:** Breadcrumb only (Projects > Project Name > Page Name)
- **Architecture:** Next.js dynamic routes + `next/dynamic` for lazy loading
- **Structure:** Colocated — routing and content in one directory tree

## File Structure

```
src/app/projects/
├── page.tsx                              ← Projects listing (search + card grid)
├── loading.tsx                           ← Skeleton for listing
├── registry.ts                           ← Imports all project manifests
└── [slug]/
    ├── page.tsx                          ← Project home (overview + page cards)
    ├── loading.tsx                       ← Skeleton for project home
    ├── manifest.ts                       ← { name, description, tags, pages }
    ├── pages/
    │   ├── dashboard.tsx                 ← Designer's page component
    │   └── settings.tsx                  ← Another page
    └── [page]/
        ├── page.tsx                      ← Lazy-loads from ../pages/{page}.tsx
        └── loading.tsx                   ← Skeleton while page loads
```

## Manifest Shape

```ts
// src/app/projects/[slug]/manifest.ts
export const manifest = {
  slug: "example-project",
  name: "Example Project",
  description: "A demo project showing the design system in action",
  tags: ["dashboard", "forms"],
  pages: [
    { slug: "dashboard", name: "Dashboard", description: "Main overview" },
    { slug: "settings", name: "Settings", description: "User preferences" },
  ],
};
```

## Routing

| URL | What it renders |
|-----|----------------|
| `/projects` | Searchable card grid of all projects |
| `/projects/[slug]` | Project overview + page list |
| `/projects/[slug]/[page]` | Lazy-loaded page component |

## Lazy Loading

- `/projects/[slug]/[page]/page.tsx` uses `next/dynamic` to import `../../pages/{page}.tsx`
- Each route segment has a `loading.tsx` with a skeleton fallback
- React `Suspense` wraps dynamic components

## Nav

Add a "Projects" link to the Nav in the projects layout. Uses the existing Nav component's `left`/`center`/`right` zones.

## UI Components

All from `@/components/vibezz` — no custom components:
- **Nav** — top navigation
- **Container** / **Section** — layout
- **Input** — search bar on listing page
- **Badge** — tags on project cards

## Breadcrumbs

Styled anchor links: `Projects → Project Name → Page Name`. No custom component needed.
