"use client";

import { useState, useEffect, useContext } from "react";
import NextLink from "next/link";
import { Section, Header, Icon, Button } from "@/components/vibezz";
import { ZoSetupStateContext } from "../zo-setup-shell";
import { PRACTICE_INFO_STORAGE_KEY } from "./section-1-task-1";
import { TRANSFER_NUMBERS_STORAGE_KEY } from "./section-1-task-3";
import { VOICE_STORAGE_KEY } from "./section-3-task-1";
import { PRE_CALL_STORAGE_KEY } from "./section-3-task-2";
import { cn } from "@/lib/utils";

const FLOW_BASE = "/projects/zo-setup";

const ORDERED_STEPS: { slug: string; name: string; optional?: boolean }[] = [
  { slug: "section-1-task-1", name: "Practice information" },
  { slug: "section-1-task-2", name: "Phone lines" },
  { slug: "section-1-task-3", name: "Transfer numbers" },
  { slug: "section-2-task-2", name: "Scheduling options" },
  { slug: "section-2-task-1", name: "Exclusions", optional: true },
  { slug: "section-3-task-1", name: "Voice of Zo" },
  { slug: "section-3-task-2", name: "Pre-call messages" },
  { slug: "section-3-task-3", name: "Pronunciation", optional: true },
  { slug: "section-3-task-4", name: "FAQs", optional: true },
];

const INTRO_COMPLETE_STORAGE_KEY = "zo-setup-intro-complete";
const PHONE_LINES_STORAGE_KEY = "zo-setup-phone-lines";
const PRONUNCIATION_VISITED_STORAGE_KEY = "zo-setup-pronunciation-visited";
const FAQS_VISITED_STORAGE_KEY = "zo-setup-faqs-visited";
const EXCLUSIONS_VISITED_STORAGE_KEY = "zo-setup-exclusions-visited";
const SCHEDULING_OPTIONS_VISITED_STORAGE_KEY = "zo-setup-scheduling-options-visited";

function getCompletedSlugs(phoneLines: { id: string }[]): Set<string> {
  const next = new Set<string>();
  if (typeof window === "undefined") return next;
  try {
    const practiceInfo = sessionStorage.getItem(PRACTICE_INFO_STORAGE_KEY);
    if (practiceInfo) {
      const parsed = JSON.parse(practiceInfo) as { choice?: string };
      if (parsed.choice && parsed.choice.length > 0) next.add("section-1-task-1");
    }
    if (sessionStorage.getItem(INTRO_COMPLETE_STORAGE_KEY) === "true") next.add("intro");
    if (phoneLines.length > 0) next.add("section-1-task-2");
    const transferData = sessionStorage.getItem(TRANSFER_NUMBERS_STORAGE_KEY);
    if (transferData && phoneLines.length > 0) {
      const parsed = JSON.parse(transferData) as { byLine?: Record<string, { catchAll?: string }> };
      const byLine = parsed?.byLine ?? {};
      const catchAllDigits = (s: string) => (s ?? "").replace(/\D/g, "");
      const allHaveCatchAll = phoneLines.every(
        (line) => catchAllDigits(byLine[line.id]?.catchAll ?? "").length >= 10
      );
      if (allHaveCatchAll) next.add("section-1-task-3");
    }
    if (sessionStorage.getItem(EXCLUSIONS_VISITED_STORAGE_KEY) === "true") next.add("section-2-task-1");
    if (sessionStorage.getItem(SCHEDULING_OPTIONS_VISITED_STORAGE_KEY) === "true") next.add("section-2-task-2");
    if (sessionStorage.getItem(VOICE_STORAGE_KEY)) next.add("section-3-task-1");
    if (sessionStorage.getItem(PRE_CALL_STORAGE_KEY)) next.add("section-3-task-2");
    if (sessionStorage.getItem(PRONUNCIATION_VISITED_STORAGE_KEY) === "true") next.add("section-3-task-3");
    if (sessionStorage.getItem(FAQS_VISITED_STORAGE_KEY) === "true") next.add("section-3-task-4");
  } catch {
    // ignore
  }
  return next;
}

export default function ReviewAndSubmitPage() {
  const { phoneLines } = useContext(ZoSetupStateContext);
  const [completedSlugs, setCompletedSlugs] = useState<Set<string>>(() => new Set());

  useEffect(() => {
    setCompletedSlugs(getCompletedSlugs(phoneLines));
  }, [phoneLines]);

  return (
    <div className="flex-1 flex flex-col">
      <Section size="2">
        <Header
          title="Review and submit"
          subbody="Confirm your setup before submission. Complete any unfinished tasks below."
        />

        <div className="mt-8 flex flex-col gap-6">
          <div className="rounded-2xl border border-[var(--stroke-default)] bg-[var(--background-default-white)] p-6 flex flex-col gap-4">
            <h2 className="text-[16px] leading-[20px] font-semibold text-[var(--text-default)] md:text-[18px] md:leading-[24px]">
              Setup checklist
            </h2>
            <ul className="flex flex-col gap-2">
              {ORDERED_STEPS.map((step) => {
                const isComplete = completedSlugs.has(step.slug);
                return (
                  <li key={step.slug}>
                    <div
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 text-left",
                        isComplete
                          ? "text-[var(--text-secondary)]"
                          : "bg-[var(--state-hover)] text-[var(--text-default)] border border-[var(--stroke-default)]"
                      )}
                    >
                      {isComplete ? (
                        <Icon name="check_circle" size="24" filled className="shrink-0 text-[var(--icon-success)]" />
                      ) : (
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 border-[var(--stroke-charcoal)] text-[12px] font-semibold text-[var(--text-default)]">
                          !
                        </span>
                      )}
                      <span className="text-[16px] leading-[26px] font-semibold min-w-0 flex-1">
                        {step.name}
                        {step.optional && (
                          <span className="text-[var(--text-whisper)] font-normal"> (Optional)</span>
                        )}
                      </span>
                      <div className="shrink-0">
                        <NextLink href={`${FLOW_BASE}/${step.slug}`}>
                          {isComplete ? (
                            <Button variant="tertiary" size="small" className="min-w-[92px]">
                              Review
                            </Button>
                          ) : (
                            <Button variant="secondary" size="small" className="min-w-[92px]">
                              Complete
                            </Button>
                          )}
                        </NextLink>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </Section>
    </div>
  );
}
