"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";
import NextLink from "next/link";
import { useRouter } from "next/navigation";
import { Button, Logo, Icon } from "@/components/vibezz";
import type { ProjectSection, ProjectPage } from "../types";
import { cn } from "@/lib/utils";

const ZO_SETUP_SLUG = "zo-setup";
const PHONE_LINES_STORAGE_KEY = "zo-setup-phone-lines";
const PHONE_LINES_CHOICE_KEY = "zo-setup-phone-lines-choice";
const PRACTICE_INFO_STORAGE_KEY = "zo-setup-practice-info";
const TRANSFER_NUMBERS_STORAGE_KEY = "zo-setup-transfer-numbers";

/** SessionStorage keys used by the Zo setup flow (for reset) */
const ZO_SETUP_STORAGE_KEYS = [
  PHONE_LINES_STORAGE_KEY,
  PHONE_LINES_CHOICE_KEY,
  PRACTICE_INFO_STORAGE_KEY,
  TRANSFER_NUMBERS_STORAGE_KEY,
];

/** One day's hours: start/end as "HH:mm" (24h), or null for closed. Index 0 = Monday, 6 = Sunday. */
export type DayHours = { start: string; end: string } | null;

/** Working hours for each day of the week. [0]=Monday ... [6]=Sunday. */
export type WorkingHours = [DayHours, DayHours, DayHours, DayHours, DayHours, DayHours, DayHours];

export interface ZoPhoneLine {
  id: string;
  name: string;
  locationIds: string[];
  /** Practice name (when practice has multiple names) - for display in phone line card */
  practiceName?: string;
  /** When staff can accept transferred calls from Zo. Defaults to Mon–Fri 9am–5pm if unset. */
  workingHours?: WorkingHours;
}

function getStoredPhoneLines(): ZoPhoneLine[] {
  if (typeof window === "undefined") return [];
  try {
    const s = sessionStorage.getItem(PHONE_LINES_STORAGE_KEY);
    return s ? (JSON.parse(s) as ZoPhoneLine[]) : [];
  } catch {
    return [];
  }
}

function storePhoneLines(lines: ZoPhoneLine[]) {
  try {
    sessionStorage.setItem(PHONE_LINES_STORAGE_KEY, JSON.stringify(lines));
  } catch {
    // ignore
  }
}

/** Optional in-task back handler (e.g. back to part 1 before leaving the task) */
export const ZoSetupBackContext = React.createContext<{
  setInTaskBackHandler: (handler: (() => void) | null) => void;
}>({ setInTaskBackHandler: () => {} });

/** Optional in-task next handler (e.g. advance to step 2 within the same task; overrides normal Continue navigation) */
export const ZoSetupNextContext = React.createContext<{
  setInTaskNextHandler: (handler: (() => void) | null) => void;
}>({ setInTaskNextHandler: () => {} });

/** Shared state for the Zo setup flow (e.g. phone lines from task 2 for use in task 3) */
export const ZoSetupStateContext = React.createContext<{
  phoneLines: ZoPhoneLine[];
  setPhoneLines: (lines: ZoPhoneLine[]) => void;
}>({ phoneLines: [], setPhoneLines: () => {} });

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
  const router = useRouter();
  const currentIndex = orderedPageSlugs.indexOf(currentPageSlug);
  const totalSteps = orderedPageSlugs.length;
  const prevSlug = currentIndex > 0 ? orderedPageSlugs[currentIndex - 1] : null;

  const inTaskBackHandlerRef = useRef<(() => void) | null>(null);
  const [hasInTaskBack, setHasInTaskBack] = useState(false);
  const inTaskNextHandlerRef = useRef<(() => void) | null>(null);
  const [hasInTaskNext, setHasInTaskNext] = useState(false);
  const [phoneLines, setPhoneLinesState] = useState<ZoPhoneLine[]>(() => []);

  const isPageDisabled = useCallback((slug: string) => {
    if (slug === "section-1-task-3") return phoneLines.length === 0;
    return false;
  }, [phoneLines.length]);

  const nextSlug = React.useMemo(() => {
    for (let i = currentIndex + 1; i < totalSteps; i++) {
      const slug = orderedPageSlugs[i];
      if (!isPageDisabled(slug)) return slug;
    }
    return null;
  }, [currentIndex, totalSteps, orderedPageSlugs, isPageDisabled]);

  const isWelcomeStep = currentPageSlug === "intro";

  const handleReset = useCallback(() => {
    try {
      ZO_SETUP_STORAGE_KEYS.forEach((key) => sessionStorage.removeItem(key));
    } catch {
      // ignore
    }
    setPhoneLinesState([]);
    router.push(`${flowBasePath}/intro`);
  }, [router]);

  const setPhoneLines = useCallback((lines: ZoPhoneLine[]) => {
    setPhoneLinesState(lines);
    storePhoneLines(lines);
  }, []);

  useEffect(() => {
    inTaskBackHandlerRef.current = null;
    setHasInTaskBack(false);
    inTaskNextHandlerRef.current = null;
    setHasInTaskNext(false);
  }, [currentPageSlug]);

  // Hydrate phone lines from sessionStorage after mount (e.g. when shell remounts after navigation)
  useEffect(() => {
    const stored = getStoredPhoneLines();
    if (stored.length > 0) {
      setPhoneLinesState(stored);
    }
  }, []);

  const [completedPages, setCompletedPages] = useState<Set<string>>(() => new Set());

  useEffect(() => {
    const next = new Set<string>();
    try {
      const practiceInfo = sessionStorage.getItem(PRACTICE_INFO_STORAGE_KEY);
      if (practiceInfo) {
        const parsed = JSON.parse(practiceInfo) as { choice?: string };
        if (parsed.choice && parsed.choice.length > 0) {
          next.add("section-1-task-1");
        }
      }
      if (phoneLines.length > 0) {
        next.add("section-1-task-2");
      }
      const transferData = sessionStorage.getItem(TRANSFER_NUMBERS_STORAGE_KEY);
      if (transferData && phoneLines.length > 0) {
        const parsed = JSON.parse(transferData) as
          | { byLine?: Record<string, { catchAll?: string }> }
          | Record<string, { catchAll?: string }>;
        const byLine = (
          parsed && "byLine" in parsed && parsed.byLine
            ? parsed.byLine
            : parsed && typeof parsed === "object"
              ? (parsed as Record<string, { catchAll?: string }>)
              : {}
        ) as Record<string, { catchAll?: string }>;
        const catchAllDigits = (s: string) => (s ?? "").replace(/\D/g, "");
        const allHaveCatchAll = phoneLines.every((line) => catchAllDigits(byLine[line.id]?.catchAll ?? "").length >= 10);
        if (allHaveCatchAll) {
          next.add("section-1-task-3");
        }
      }
    } catch {
      // ignore
    }
    setCompletedPages(next);
  }, [phoneLines, currentPageSlug]);

  const setInTaskBackHandlerStable = useCallback((handler: (() => void) | null) => {
    inTaskBackHandlerRef.current = handler;
    setHasInTaskBack(!!handler);
  }, []);

  const setInTaskNextHandlerStable = useCallback((handler: (() => void) | null) => {
    inTaskNextHandlerRef.current = handler;
    setHasInTaskNext(!!handler);
  }, []);

  const handleInTaskBack = useCallback(() => {
    inTaskBackHandlerRef.current?.();
  }, []);

  const handleInTaskNext = useCallback(() => {
    inTaskNextHandlerRef.current?.();
  }, []);

  const backContextValue = React.useMemo(
    () => ({ setInTaskBackHandler: setInTaskBackHandlerStable }),
    [setInTaskBackHandlerStable]
  );

  const nextContextValue = React.useMemo(
    () => ({ setInTaskNextHandler: setInTaskNextHandlerStable }),
    [setInTaskNextHandlerStable]
  );

  const stateContextValue = React.useMemo(
    () => ({ phoneLines, setPhoneLines }),
    [phoneLines, setPhoneLines]
  );

  return (
    <ZoSetupStateContext.Provider value={stateContextValue}>
    <ZoSetupBackContext.Provider value={backContextValue}>
    <ZoSetupNextContext.Provider value={nextContextValue}>
    {/* suppressHydrationWarning: Cursor preview/instrumentation injects data-cursor-element-id on the client, causing server/client attribute mismatch */}
    <div className="h-screen flex flex-col bg-[var(--background-default-white)]" suppressHydrationWarning>
      {/* Top bar: Logo left, Save and exit right — match homepage nav height (80px) */}
      <header className="flex shrink-0 h-[80px] items-center justify-between border-b border-[var(--stroke-default)] bg-[var(--background-default-white)] px-6">
        <NextLink href="/" aria-label="Zocdoc home" className="shrink-0">
          <Logo size="small" />
        </NextLink>
        <div className="flex items-center gap-6">
          <button
            type="button"
            onClick={handleReset}
            className="text-[14px] leading-[20px] font-medium text-[var(--text-whisper)] hover:text-[var(--text-secondary)] transition-colors"
            aria-label="Reset setup (testing)"
          >
            Reset
          </button>
          <NextLink href="/">
            <Button variant="ghost" size="small">
              Save and exit
            </Button>
          </NextLink>
        </div>
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
                    const isCompleted = completedPages.has(pageSlug);
                    const isTransferNumbers = pageSlug === "section-1-task-3";
                    const isDisabled = isTransferNumbers && phoneLines.length === 0;
                    const linkContent = (
                      <>
                        <span className="flex-1 min-w-0 truncate">{getPageName(pages, pageSlug)}</span>
                        {isCompleted && (
                          <Icon name="check" size="small" className="shrink-0 text-[var(--icon-positive)]" />
                        )}
                      </>
                    );
                    return (
                      <li key={pageSlug}>
                        {isDisabled ? (
                          <span
                            className={cn(
                              "flex items-center gap-2 rounded-md px-2 py-1.5 text-[14px] leading-[20px] cursor-not-allowed opacity-60",
                              "text-[var(--text-whisper)]"
                            )}
                            aria-disabled="true"
                            title="Complete Phone lines first"
                          >
                            {linkContent}
                          </span>
                        ) : (
                          <NextLink
                            href={href}
                            className={cn(
                              "flex items-center gap-2 rounded-md px-2 py-1.5 text-[14px] leading-[20px] transition-colors",
                              isActive
                                ? "font-semibold text-[var(--text-default)] bg-[var(--background-default-white)] border border-[var(--stroke-default)]"
                                : "text-[var(--text-secondary)] hover:text-[var(--text-default)] hover:bg-[var(--state-hover)]"
                            )}
                          >
                            {linkContent}
                          </NextLink>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </nav>
        </aside>

        {/* Main: scroll wrapper is full width (scrollbar at viewport edge), footer sticky below */}
        <main className="flex-1 flex flex-col min-w-0 min-h-0">
          <div className="flex-1 min-h-0 overflow-auto">
            <div
              className={cn(
                "flex flex-col w-full mx-auto px-6",
                isWelcomeStep ? "max-w-[1080px] min-h-full" : "max-w-[648px] min-h-full"
              )}
            >
              {children}
            </div>
          </div>

          <footer className="shrink-0 flex items-center justify-between gap-4 border-t border-[var(--stroke-default)] bg-[var(--background-default-white)] px-6 py-4 w-full">
            <div>
              {!isWelcomeStep &&
                (hasInTaskBack ? (
                  <Button variant="tertiary" size="default" onClick={handleInTaskBack}>
                    Back
                  </Button>
                ) : prevSlug ? (
                  <NextLink href={`${flowBasePath}/${prevSlug}`}>
                    <Button variant="tertiary" size="default">
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
            <div className="flex items-center gap-4">
              {nextSlug && !isWelcomeStep && (
                <NextLink href={`${flowBasePath}/${nextSlug}`}>
                  <Button variant="ghost" size="default">
                    Skip for now
                  </Button>
                </NextLink>
              )}
              {nextSlug ? (
                hasInTaskNext ? (
                  <Button variant="primary" size="default" onClick={handleInTaskNext}>
                    Continue
                  </Button>
                ) : (
                  <NextLink href={`${flowBasePath}/${nextSlug}`}>
                    <Button variant="primary" size="default">
                      {isWelcomeStep ? "Get started" : "Continue"}
                    </Button>
                  </NextLink>
                )
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
    </ZoSetupNextContext.Provider>
    </ZoSetupBackContext.Provider>
    </ZoSetupStateContext.Provider>
  );
}
