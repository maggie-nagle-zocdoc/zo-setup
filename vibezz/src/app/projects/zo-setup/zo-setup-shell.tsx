"use client";

import NextLink from "next/link";
import { Button, Logo } from "@/components/vibezz";
import type { ProjectSection, ProjectPage } from "../types";
import { cn } from "@/lib/utils";

const ZO_SETUP_SLUG = "zo-setup";

export interface ZoSetupShellProps {
  /** Ordered list of all page slugs (intro first, then sections in order) */
  orderedPageSlugs: string[];
  sections: ProjectSection[];
  /** All pages with names (for nav labels) */
  pages: ProjectPage[];
  /** Slug of the page currently being viewed */
  currentPageSlug: string;
  /** Human-readable name for current page (optional, for header) */
  currentPageName?: string;
  /** Human-readable description for current page (optional) */
  currentPageDescription?: string;
  children: React.ReactNode;
}

/** Base path for Zo setup flow (no trailing slash) */
const flowBasePath = `/projects/${ZO_SETUP_SLUG}`;

function getPageName(pages: ProjectPage[], slug: string): string {
  return pages.find((p) => p.slug === slug)?.name ?? slug.replace(/-/g, " ");
}

export function ZoSetupShell({
  orderedPageSlugs,
  sections,
  pages,
  currentPageSlug,
  currentPageName,
  currentPageDescription,
  children,
}: ZoSetupShellProps) {
  const currentIndex = orderedPageSlugs.indexOf(currentPageSlug);
  const totalSteps = orderedPageSlugs.length;
  const prevSlug = currentIndex > 0 ? orderedPageSlugs[currentIndex - 1] : null;
  const nextSlug = currentIndex >= 0 && currentIndex < totalSteps - 1 ? orderedPageSlugs[currentIndex + 1] : null;
  const isWelcomeStep = currentPageSlug === "intro";

  return (
    <div className="h-screen flex flex-col bg-[var(--background-default-white)]">
      {/* Top bar: Logo left, Save and exit right — match homepage nav height (80px) */}
      <header className="flex shrink-0 h-[80px] items-center justify-between border-b border-[var(--stroke-default)] bg-[var(--background-default-white)] px-6">
        <NextLink href="/" aria-label="Zocdoc home" className="shrink-0">
          <Logo size="small" />
        </NextLink>
        <NextLink
          href="/"
          className="text-[14px] leading-[20px] font-semibold text-[var(--text-link)] hover:text-[var(--color-charcoal-70)] transition-colors"
        >
          Save and exit
        </NextLink>
      </header>

      <div className="flex-1 flex min-h-0">
        {/* Section nav: skip to any section or page */}
        <aside
          className="shrink-0 w-56 border-r border-[var(--stroke-default)] bg-[var(--background-default-greige)] overflow-y-auto"
          aria-label="Setup sections"
        >
          <nav className="p-3 flex flex-col gap-4">
            {sections.map((section) => (
              <div key={section.slug}>
                <div className="text-[14px] leading-[20px] font-semibold text-[var(--text-default)] mb-1.5">
                  {section.name}
                </div>
                <ul className="flex flex-col gap-0.5">
                  {section.pageSlugs.map((pageSlug) => {
                    const href = `${flowBasePath}/${pageSlug}`;
                    const isActive = currentPageSlug === pageSlug;
                    return (
                      <li key={pageSlug}>
                        <NextLink
                          href={href}
                          className={cn(
                            "block rounded-md px-2 py-1.5 text-[14px] leading-[20px] transition-colors",
                            isActive
                              ? "font-semibold text-[var(--text-default)] bg-[var(--background-default-white)] border border-[var(--stroke-default)]"
                              : "text-[var(--text-secondary)] hover:text-[var(--text-default)] hover:bg-[var(--state-hover)]"
                          )}
                        >
                          {getPageName(pages, pageSlug)}
                        </NextLink>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </nav>
        </aside>

        {/* Main content area — max 800px (or 1080px on welcome) */}
        <main className="flex-1 flex flex-col min-w-0 overflow-auto">
          <div
            className={cn(
              "flex-1 flex flex-col w-full mx-auto px-6",
              isWelcomeStep ? "max-w-[1080px]" : "max-w-[800px]"
            )}
          >
            {children}
          </div>

          {/* Footer: Back (hidden on welcome) | Continue */}
          <footer className="shrink-0 flex items-center justify-between gap-4 border-t border-[var(--stroke-default)] bg-[var(--background-default-white)] px-6 py-4">
            <div>
              {!isWelcomeStep &&
                (prevSlug ? (
                  <NextLink href={`${flowBasePath}/${prevSlug}`}>
                    <Button variant="secondary" size="default">
                      Back
                    </Button>
                  </NextLink>
                ) : (
                  <NextLink href={flowBasePath}>
                    <Button variant="ghost" size="default">
                      Back to overview
                    </Button>
                  </NextLink>
                ))}
            </div>
            <div>
              {nextSlug ? (
                <NextLink href={`${flowBasePath}/${nextSlug}`}>
                  <Button variant="primary" size="default">
                    {isWelcomeStep ? "Get started" : "Continue"}
                  </Button>
                </NextLink>
              ) : (
                <NextLink href="/">
                  <Button variant="primary" size="default">
                    Finish
                  </Button>
                </NextLink>
              )}
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}
