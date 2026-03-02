# Projects Feature Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a projects system with a searchable listing page, per-project home pages, and lazy-loaded designer pages.

**Architecture:** File-system convention with colocated routing and content under `src/app/projects/`. Each project is a folder with a `manifest.ts` and a `pages/` directory. A central `registry.ts` imports all manifests. Dynamic routes `[slug]` and `[page]` handle project and page rendering. `next/dynamic` lazy-loads page components.

**Tech Stack:** Next.js 16 App Router, React 19, Tailwind CSS, Vibezz design system components (`@/components/vibezz`)

---

### Task 1: Project Manifest Type

Define the shared TypeScript types for project manifests.

**Files:**
- Create: `src/app/projects/types.ts`

**Step 1: Create the types file**

```ts
export interface ProjectPage {
  slug: string;
  name: string;
  description: string;
}

export interface ProjectManifest {
  slug: string;
  name: string;
  description: string;
  tags: string[];
  pages: ProjectPage[];
}
```

**Step 2: Commit**

```bash
git add src/app/projects/types.ts
git commit -m "feat(projects): add manifest types"
```

---

### Task 2: Example Project with Manifest and Pages

Create one example project so every subsequent task has real data to work with.

**Files:**
- Create: `src/app/projects/example-project/manifest.ts`
- Create: `src/app/projects/example-project/pages/dashboard.tsx`
- Create: `src/app/projects/example-project/pages/settings.tsx`

**Step 1: Create the manifest**

```ts
import type { ProjectManifest } from "../types";

export const manifest: ProjectManifest = {
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

**Step 2: Create the dashboard page**

```tsx
"use client";

import { Container, Header, Section } from "@/components/vibezz";

export default function Dashboard() {
  return (
    <Section size="1">
      <Container>
        <Header title="Dashboard" subbody="Main overview of your project" />
        <div className="mt-8 rounded-lg border border-[var(--stroke-default)] p-8 text-center text-[var(--text-secondary)]">
          Dashboard content goes here
        </div>
      </Container>
    </Section>
  );
}
```

**Step 3: Create the settings page**

```tsx
"use client";

import { Container, Header, Section } from "@/components/vibezz";

export default function Settings() {
  return (
    <Section size="1">
      <Container>
        <Header title="Settings" subbody="User preferences and configuration" />
        <div className="mt-8 rounded-lg border border-[var(--stroke-default)] p-8 text-center text-[var(--text-secondary)]">
          Settings content goes here
        </div>
      </Container>
    </Section>
  );
}
```

**Step 4: Commit**

```bash
git add src/app/projects/example-project/
git commit -m "feat(projects): add example project with manifest and pages"
```

---

### Task 3: Project Registry

Create the registry that imports all project manifests. This powers the listing page.

**Files:**
- Create: `src/app/projects/registry.ts`

**Step 1: Create the registry**

```ts
import type { ProjectManifest } from "./types";
import { manifest as exampleProject } from "./example-project/manifest";

export const projects: ProjectManifest[] = [exampleProject];
```

Note: When a designer adds a new project, they add one import line and one array entry here. This is intentionally manual — it's explicit and avoids magic.

**Step 2: Commit**

```bash
git add src/app/projects/registry.ts
git commit -m "feat(projects): add project registry"
```

---

### Task 4: Projects Listing Page (`/projects`)

The main entry point: a searchable card grid of all projects.

**Files:**
- Create: `src/app/projects/page.tsx`
- Create: `src/app/projects/loading.tsx`

**Step 1: Create the listing page**

```tsx
"use client";

import { useState } from "react";
import NextLink from "next/link";
import { Nav, Logo, Container, Section, Input, Badge, Header } from "@/components/vibezz";
import { projects } from "./registry";

export default function ProjectsPage() {
  const [search, setSearch] = useState("");

  const filtered = projects.filter((p) => {
    const q = search.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.tags.some((t) => t.toLowerCase().includes(q))
    );
  });

  return (
    <div className="min-h-screen flex flex-col bg-[var(--background-default-white)]">
      <Nav
        sticky
        variant="default"
        left={<Logo size="small" />}
        center={
          <Input
            placeholder="Search projects..."
            size="small"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        }
      />

      <main className="flex-1">
        <Container>
          <Section size="2">
            <Header title="Projects" subbody={`${filtered.length} project${filtered.length !== 1 ? "s" : ""}`} />

            <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((project) => (
                <NextLink
                  key={project.slug}
                  href={`/projects/${project.slug}`}
                  className="group rounded-lg border border-[var(--stroke-default)] p-6 transition-colors hover:border-[var(--stroke-charcoal)]"
                >
                  <h2 className="text-[18px] leading-[28px] font-semibold text-[var(--text-default)] group-hover:text-[var(--text-link)]">
                    {project.name}
                  </h2>
                  <p className="mt-1 text-[14px] leading-[20px] text-[var(--text-secondary)]">
                    {project.description}
                  </p>
                  {project.tags.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {project.tags.map((tag) => (
                        <Badge key={tag} variant="info">{tag}</Badge>
                      ))}
                    </div>
                  )}
                  <p className="mt-3 text-[12px] leading-[16px] text-[var(--text-tertiary)]">
                    {project.pages.length} page{project.pages.length !== 1 ? "s" : ""}
                  </p>
                </NextLink>
              ))}
            </div>

            {filtered.length === 0 && (
              <div className="mt-8 text-center text-[var(--text-secondary)]">
                No projects match your search.
              </div>
            )}
          </Section>
        </Container>
      </main>
    </div>
  );
}
```

**Step 2: Create loading skeleton**

```tsx
import { Container, Section } from "@/components/vibezz";

export default function ProjectsLoading() {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--background-default-white)]">
      <div className="h-[80px] border-b border-[var(--stroke-default)]" />
      <main className="flex-1">
        <Container>
          <Section size="2">
            <div className="h-[44px] w-48 rounded bg-[var(--background-disabled)] animate-pulse" />
            <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="rounded-lg border border-[var(--stroke-default)] p-6">
                  <div className="h-5 w-32 rounded bg-[var(--background-disabled)] animate-pulse" />
                  <div className="mt-2 h-4 w-full rounded bg-[var(--background-disabled)] animate-pulse" />
                  <div className="mt-3 flex gap-1.5">
                    <div className="h-5 w-16 rounded bg-[var(--background-disabled)] animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          </Section>
        </Container>
      </main>
    </div>
  );
}
```

**Step 3: Verify it renders**

Run: `npm run dev`
Visit: `http://localhost:3000/projects`
Expected: See the Nav with search bar, "Projects" header, and one project card for "Example Project".

**Step 4: Commit**

```bash
git add src/app/projects/page.tsx src/app/projects/loading.tsx
git commit -m "feat(projects): add searchable projects listing page"
```

---

### Task 5: Project Home Page (`/projects/[slug]`)

Shows project overview and a list of its pages as cards.

**Files:**
- Create: `src/app/projects/[slug]/page.tsx`
- Create: `src/app/projects/[slug]/loading.tsx`

**Step 1: Create the project home page**

```tsx
import { notFound } from "next/navigation";
import NextLink from "next/link";
import { Nav, Logo, Container, Section, Header, Link, Badge } from "@/components/vibezz";
import { projects } from "../registry";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function ProjectPage({ params }: Props) {
  const { slug } = await params;
  const project = projects.find((p) => p.slug === slug);

  if (!project) notFound();

  return (
    <div className="min-h-screen flex flex-col bg-[var(--background-default-white)]">
      <Nav
        sticky
        variant="default"
        left={<Logo size="small" />}
        right={
          <Link href="/projects" size="small">
            Projects
          </Link>
        }
      />

      <main className="flex-1">
        <Container>
          <Section size="2">
            {/* Breadcrumb */}
            <nav className="mb-4 flex items-center gap-1.5 text-[14px] leading-[20px] text-[var(--text-secondary)]">
              <NextLink href="/projects" className="hover:text-[var(--text-link)] transition-colors">
                Projects
              </NextLink>
              <span>/</span>
              <span className="text-[var(--text-default)] font-semibold">{project.name}</span>
            </nav>

            <Header title={project.name} subbody={project.description} />

            {project.tags.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {project.tags.map((tag) => (
                  <Badge key={tag} variant="info">{tag}</Badge>
                ))}
              </div>
            )}

            {/* Pages list */}
            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {project.pages.map((page) => (
                <NextLink
                  key={page.slug}
                  href={`/projects/${project.slug}/${page.slug}`}
                  className="group rounded-lg border border-[var(--stroke-default)] p-5 transition-colors hover:border-[var(--stroke-charcoal)]"
                >
                  <h3 className="text-[16px] leading-[26px] font-semibold text-[var(--text-default)] group-hover:text-[var(--text-link)]">
                    {page.name}
                  </h3>
                  <p className="mt-1 text-[14px] leading-[20px] text-[var(--text-secondary)]">
                    {page.description}
                  </p>
                </NextLink>
              ))}
            </div>
          </Section>
        </Container>
      </main>
    </div>
  );
}
```

**Step 2: Create loading skeleton**

```tsx
import { Container, Section } from "@/components/vibezz";

export default function ProjectLoading() {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--background-default-white)]">
      <div className="h-[80px] border-b border-[var(--stroke-default)]" />
      <main className="flex-1">
        <Container>
          <Section size="2">
            <div className="mb-4 h-4 w-32 rounded bg-[var(--background-disabled)] animate-pulse" />
            <div className="h-[44px] w-64 rounded bg-[var(--background-disabled)] animate-pulse" />
            <div className="mt-2 h-4 w-48 rounded bg-[var(--background-disabled)] animate-pulse" />
            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="rounded-lg border border-[var(--stroke-default)] p-5">
                  <div className="h-5 w-24 rounded bg-[var(--background-disabled)] animate-pulse" />
                  <div className="mt-2 h-4 w-full rounded bg-[var(--background-disabled)] animate-pulse" />
                </div>
              ))}
            </div>
          </Section>
        </Container>
      </main>
    </div>
  );
}
```

**Step 3: Verify it renders**

Run: `npm run dev`
Visit: `http://localhost:3000/projects/example-project`
Expected: Breadcrumb "Projects / Example Project", header with title/description/tags, two page cards (Dashboard, Settings).

**Step 4: Commit**

```bash
git add "src/app/projects/[slug]/page.tsx" "src/app/projects/[slug]/loading.tsx"
git commit -m "feat(projects): add project home page with page listing"
```

---

### Task 6: Dynamic Page Route (`/projects/[slug]/[page]`)

Lazy-loads the actual designer page component using `next/dynamic`.

**Files:**
- Create: `src/app/projects/[slug]/[page]/page.tsx`
- Create: `src/app/projects/[slug]/[page]/loading.tsx`

**Step 1: Create the dynamic page route**

```tsx
import { notFound } from "next/navigation";
import dynamic from "next/dynamic";
import { Suspense } from "react";
import NextLink from "next/link";
import { Nav, Logo, Container, Section, Link } from "@/components/vibezz";
import { projects } from "../../registry";

interface Props {
  params: Promise<{ slug: string; page: string }>;
}

export default async function DynamicPage({ params }: Props) {
  const { slug, page } = await params;
  const project = projects.find((p) => p.slug === slug);

  if (!project) notFound();

  const pageInfo = project.pages.find((p) => p.slug === page);
  if (!pageInfo) notFound();

  const PageComponent = dynamic(
    () => import(`../../${slug}/pages/${page}`),
    {
      loading: () => (
        <Container>
          <Section size="1">
            <div className="h-[44px] w-64 rounded bg-[var(--background-disabled)] animate-pulse" />
            <div className="mt-4 h-64 rounded bg-[var(--background-disabled)] animate-pulse" />
          </Section>
        </Container>
      ),
    }
  );

  return (
    <div className="min-h-screen flex flex-col bg-[var(--background-default-white)]">
      <Nav
        sticky
        variant="default"
        left={<Logo size="small" />}
        right={
          <Link href="/projects" size="small">
            Projects
          </Link>
        }
      />

      <main className="flex-1">
        {/* Breadcrumb */}
        <Container>
          <div className="pt-6">
            <nav className="flex items-center gap-1.5 text-[14px] leading-[20px] text-[var(--text-secondary)]">
              <NextLink href="/projects" className="hover:text-[var(--text-link)] transition-colors">
                Projects
              </NextLink>
              <span>/</span>
              <NextLink href={`/projects/${slug}`} className="hover:text-[var(--text-link)] transition-colors">
                {project.name}
              </NextLink>
              <span>/</span>
              <span className="text-[var(--text-default)] font-semibold">{pageInfo.name}</span>
            </nav>
          </div>
        </Container>

        <Suspense>
          <PageComponent />
        </Suspense>
      </main>
    </div>
  );
}
```

**Step 2: Create loading skeleton**

```tsx
import { Container, Section } from "@/components/vibezz";

export default function PageLoading() {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--background-default-white)]">
      <div className="h-[80px] border-b border-[var(--stroke-default)]" />
      <main className="flex-1">
        <Container>
          <div className="pt-6">
            <div className="h-4 w-48 rounded bg-[var(--background-disabled)] animate-pulse" />
          </div>
          <Section size="1">
            <div className="h-[44px] w-64 rounded bg-[var(--background-disabled)] animate-pulse" />
            <div className="mt-4 h-64 rounded bg-[var(--background-disabled)] animate-pulse" />
          </Section>
        </Container>
      </main>
    </div>
  );
}
```

**Step 3: Verify it renders**

Run: `npm run dev`
Visit: `http://localhost:3000/projects/example-project/dashboard`
Expected: Breadcrumb "Projects / Example Project / Dashboard", then the lazy-loaded dashboard content.

**Step 4: Commit**

```bash
git add "src/app/projects/[slug]/[page]/page.tsx" "src/app/projects/[slug]/[page]/loading.tsx"
git commit -m "feat(projects): add lazy-loaded dynamic page route"
```

---

### Task 7: Update Home Page Redirect

Update the root redirect to point to `/projects` instead of `/components`.

**Files:**
- Modify: `src/app/page.tsx`
- Modify: `next.config.ts`

**Step 1: Update the home page redirect**

In `src/app/page.tsx`, change `/components` to `/projects` in both the meta refresh and the JS redirect.

**Step 2: Update the server-side redirect**

In `next.config.ts`, change the redirect destination from `/components` to `/projects`.

**Step 3: Verify**

Run: `npm run dev`
Visit: `http://localhost:3000`
Expected: Redirects to `/projects`.

**Step 4: Commit**

```bash
git add src/app/page.tsx next.config.ts
git commit -m "feat(projects): redirect home page to /projects"
```

---

### Task 8: Build Verification

Confirm the full app builds without errors.

**Step 1: Run the build**

Run: `npm run build`
Expected: Build succeeds with no errors.

**Step 2: Run lint**

Run: `npm run lint`
Expected: No lint errors.

**Step 3: Manual smoke test**

Run: `npm run dev`
- `/` → redirects to `/projects`
- `/projects` → shows listing with search, example project card
- Type in search → filters projects
- Click example project → `/projects/example-project` with overview + page cards
- Click Dashboard → `/projects/example-project/dashboard` with breadcrumb and lazy-loaded content
- Click Settings → `/projects/example-project/settings` with breadcrumb and lazy-loaded content
- Back button works correctly at each level
