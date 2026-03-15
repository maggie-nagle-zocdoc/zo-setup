"use client";

import { useState, useCallback, useEffect, useRef, useContext } from "react";
import {
  Section,
  Header,
  Button,
  Icon,
  IconButton,
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
  FieldLabel,
  TextField,
  TextareaField,
  Checkbox,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  SelectField,
  Popover,
  PopoverTrigger,
  PopoverContent,
  RadioGroup,
  RadioField,
  RadioCard,
} from "@/components/vibezz";
import { ZoSetupStateContext, ZoSetupContinueValidationContext } from "../zo-setup-shell";
import type { ZoPhoneLine } from "../zo-setup-shell";
import { PLACEHOLDER_LOCATION_NAMES } from "../data";
import { cn } from "@/lib/utils";

const FAQS_VISITED_STORAGE_KEY = "zo-setup-faqs-visited";
export const FAQ_ENTRIES_STORAGE_KEY = "zo-setup-faq-entries";

export type FaqApplyTo = "phone_lines" | "locations";

export interface FaqEntry {
  id: string;
  categoryId: string;
  question: string;
  answer: string;
  generatedResponse: string;
  applyTo: FaqApplyTo;
  phoneLineIds: string[];
  locationIds: string[];
}

const FAQ_CATEGORIES: { id: string; label: string; description: string; icon: string }[] = [
  { id: "office_info", label: "Office information", description: "Fax, directions, hours, parking, etc.", icon: "business" },
  { id: "patient_resources", label: "Patient resources", description: "Patient portal, test results, appointment questions, etc.", icon: "medical_services" },
  { id: "policies", label: "Policies", description: "Late arrival, self pay, payment, pets, etc.", icon: "policy" },
];

const PREDEFINED_QUESTIONS: Record<string, { id: string; text: string }[]> = {
  office_info: [
    { id: "hours", text: "What are your office hours?" },
    { id: "directions", text: "How do I get to the office?" },
    { id: "parking", text: "Is there parking available?" },
    { id: "fax", text: "What is your fax number?" },
  ],
  patient_resources: [
    { id: "portal", text: "How do I access the patient portal?" },
    { id: "test_results", text: "How do I get my test results?" },
    { id: "appointments", text: "How do I book or change an appointment?" },
    { id: "telehealth", text: "Do you offer telehealth visits?" },
  ],
  policies: [
    { id: "late_arrival", text: "What is your late arrival policy?" },
    { id: "self_pay", text: "Do you accept self-pay patients?" },
    { id: "payment", text: "What payment methods do you accept?" },
    { id: "pets", text: "Are pets allowed in the office?" },
  ],
};

const CUSTOM_QUESTION_ID = "custom";

function getStoredFaqEntries(): FaqEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const s = sessionStorage.getItem(FAQ_ENTRIES_STORAGE_KEY);
    return s ? (JSON.parse(s) as FaqEntry[]) : [];
  } catch {
    return [];
  }
}

function storeFaqEntries(data: FaqEntry[]) {
  try {
    sessionStorage.setItem(FAQ_ENTRIES_STORAGE_KEY, JSON.stringify(data));
  } catch {
    // ignore
  }
}

const MOCK_LOCATIONS = PLACEHOLDER_LOCATION_NAMES.map((name, i) => ({
  id: `loc${i + 1}`,
  name,
}));

/** Mock: generate a patient-friendly response from the provider's answer. */
function mockGenerateResponse(answer: string): Promise<string> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const trimmed = answer.trim();
      if (!trimmed) {
        resolve("We’ll have Zo share the details you provided with callers.");
        return;
      }
      resolve(`Zo will tell callers: "${trimmed.length > 120 ? trimmed.slice(0, 120) + "…" : trimmed}"`);
    }, 2000);
  });
}

function getApplyToSummary(entry: FaqEntry, lines: ZoPhoneLine[]): string {
  const phonePart =
    !entry.phoneLineIds.length || entry.phoneLineIds.length === lines.length
      ? "All phone lines"
      : entry.phoneLineIds.length === 1
        ? lines.find((l) => l.id === entry.phoneLineIds[0])?.name ?? "1 phone line"
        : `${entry.phoneLineIds.length} phone lines`;
  const locationPart =
    !entry.locationIds.length
      ? "No locations"
      : entry.locationIds.length === MOCK_LOCATIONS.length
        ? "All locations"
        : entry.locationIds.length === 1
          ? MOCK_LOCATIONS.find((l) => l.id === entry.locationIds[0])?.name ?? "1 location"
          : `${entry.locationIds.length} locations`;
  return `${phonePart}; ${locationPart}`;
}

function getApplyToParts(entry: FaqEntry, lines: ZoPhoneLine[]): { phone: string; location: string } {
  const phone =
    !entry.phoneLineIds.length || entry.phoneLineIds.length === lines.length
      ? "All phone lines"
      : entry.phoneLineIds.length === 1
        ? lines.find((l) => l.id === entry.phoneLineIds[0])?.name ?? "1 phone line"
        : lines
            .filter((l) => entry.phoneLineIds.includes(l.id))
            .map((l) => l.name)
            .join(", ") || `${entry.phoneLineIds.length} phone lines`;
  const location =
    !entry.locationIds.length
      ? "No locations"
      : entry.locationIds.length === MOCK_LOCATIONS.length
        ? "All locations"
        : entry.locationIds.length === 1
          ? MOCK_LOCATIONS.find((l) => l.id === entry.locationIds[0])?.name ?? "1 location"
          : MOCK_LOCATIONS.filter((l) => entry.locationIds.includes(l.id))
              .map((l) => l.name)
              .join(", ") || `${entry.locationIds.length} locations`;
  return { phone, location };
}

export default function FAQsTask() {
  const { phoneLines } = useContext(ZoSetupStateContext);
  const { setContinueValidationHandler } = useContext(ZoSetupContinueValidationContext);
  const lines = phoneLines.length > 0 ? phoneLines : [];
  const [entries, setEntries] = useState<FaqEntry[]>([]);
  const hasRestoredRef = useRef(false);

  useEffect(() => {
    setEntries(getStoredFaqEntries());
  }, []);

  useEffect(() => {
    const id = setTimeout(() => {
      hasRestoredRef.current = true;
    }, 0);
    return () => clearTimeout(id);
  }, []);

  useEffect(() => {
    if (!hasRestoredRef.current) return;
    storeFaqEntries(entries);
  }, [entries]);

  useEffect(() => {
    const onContinue = () => {
      try {
        sessionStorage.setItem(FAQS_VISITED_STORAGE_KEY, "true");
      } catch {
        // ignore
      }
      return true;
    };
    setContinueValidationHandler(onContinue);
    return () => setContinueValidationHandler(null);
  }, [setContinueValidationHandler]);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerStep, setDrawerStep] = useState<1 | 2>(1);
  const [drawerCategoryId, setDrawerCategoryId] = useState<string>("");
  const [drawerQuestionId, setDrawerQuestionId] = useState<string>("");
  const [drawerCustomQuestion, setDrawerCustomQuestion] = useState("");
  const [drawerAnswer, setDrawerAnswer] = useState("");
  const [drawerApplyTo, setDrawerApplyTo] = useState<"phone_lines" | "locations">("phone_lines");
  const [drawerPhoneLinesSelection, setDrawerPhoneLinesSelection] = useState<
    { mode: "all" | "none" | "specific"; ids: string[] }
  >({ mode: "all", ids: [] });
  const [drawerLocationsSelection, setDrawerLocationsSelection] = useState<
    { mode: "all" | "none" | "specific"; ids: string[] }
  >({ mode: "all", ids: [] });
  const [drawerGenerating, setDrawerGenerating] = useState(false);

  const openDrawer = useCallback(() => {
    setDrawerOpen(true);
    setDrawerStep(1);
    setDrawerCategoryId("");
    setDrawerQuestionId("");
    setDrawerCustomQuestion("");
    setDrawerAnswer("");
    setDrawerApplyTo("phone_lines");
    setDrawerPhoneLinesSelection({ mode: "all", ids: [] });
    setDrawerLocationsSelection({ mode: "all", ids: [] });
    setDrawerGenerating(false);
  }, []);

  const closeDrawer = useCallback(() => {
    setDrawerOpen(false);
    setDrawerStep(1);
  }, []);

  const category = FAQ_CATEGORIES.find((c) => c.id === drawerCategoryId);
  const questions = drawerCategoryId ? PREDEFINED_QUESTIONS[drawerCategoryId] ?? [] : [];
  const selectedQuestionText =
    drawerQuestionId === CUSTOM_QUESTION_ID
      ? drawerCustomQuestion.trim()
      : questions.find((q) => q.id === drawerQuestionId)?.text ?? "";

  const effectivePhoneLineIds =
    drawerApplyTo === "locations"
      ? lines.map((l) => l.id)
      : drawerPhoneLinesSelection.mode === "all"
        ? lines.map((l) => l.id)
        : drawerPhoneLinesSelection.mode === "none"
          ? []
          : drawerPhoneLinesSelection.ids;
  const effectiveLocationIds =
    drawerApplyTo === "phone_lines"
      ? MOCK_LOCATIONS.map((l) => l.id)
      : drawerLocationsSelection.mode === "all"
        ? MOCK_LOCATIONS.map((l) => l.id)
        : drawerLocationsSelection.mode === "none"
          ? []
          : drawerLocationsSelection.ids;

  const toggleDrawerLine = useCallback(
    (lineId: string) => {
      setDrawerPhoneLinesSelection((prev) => {
        const effective =
          prev.mode === "all"
            ? lines.map((l) => l.id)
            : prev.mode === "none"
              ? []
              : prev.ids;
        const next = effective.includes(lineId)
          ? effective.filter((id) => id !== lineId)
          : [...effective, lineId];
        const nextMode: "all" | "none" | "specific" =
          next.length === 0 ? "none" : next.length === lines.length ? "all" : "specific";
        return {
          mode: nextMode,
          ids: nextMode === "specific" ? next : [],
        };
      });
    },
    [lines]
  );

  const handleSelectAllRowClick = useCallback(() => {
    setDrawerPhoneLinesSelection((prev) => ({
      mode: prev.mode === "all" ? "none" : "all",
      ids: [],
    }));
  }, []);

  const toggleDrawerLocation = useCallback((locId: string) => {
    setDrawerLocationsSelection((prev) => {
      const effective =
        prev.mode === "all"
          ? MOCK_LOCATIONS.map((l) => l.id)
          : prev.mode === "none"
            ? []
            : prev.ids;
      const next = effective.includes(locId)
        ? effective.filter((id) => id !== locId)
        : [...effective, locId];
      const nextMode: "all" | "none" | "specific" =
        next.length === 0 ? "none" : next.length === MOCK_LOCATIONS.length ? "all" : "specific";
      return {
        mode: nextMode,
        ids: nextMode === "specific" ? next : [],
      };
    });
  }, []);

  const handleSelectAllLocationsClick = useCallback(() => {
    setDrawerLocationsSelection((prev) => ({
      mode: prev.mode === "all" ? "none" : "all",
      ids: [],
    }));
  }, []);

  const handleSaveFaq = useCallback(async () => {
    setDrawerGenerating(true);
    try {
      const response = await mockGenerateResponse(drawerAnswer);
      const newEntry: FaqEntry = {
        id: crypto.randomUUID(),
        categoryId: drawerCategoryId,
        question: selectedQuestionText || "Custom question",
        answer: drawerAnswer,
        generatedResponse: response,
        applyTo: "phone_lines",
        phoneLineIds: effectivePhoneLineIds,
        locationIds: effectiveLocationIds,
      };
      setEntries((prev) => [...prev, newEntry]);
      closeDrawer();
    } finally {
      setDrawerGenerating(false);
    }
  }, [
    drawerAnswer,
    drawerCategoryId,
    selectedQuestionText,
    effectivePhoneLineIds,
    effectiveLocationIds,
    closeDrawer,
  ]);

  const removeEntry = useCallback((id: string) => {
    setEntries((prev) => prev.filter((e) => e.id !== id));
  }, []);

  const canProceedFromStep1 = !!drawerCategoryId;
  const canGenerate =
    (drawerQuestionId === CUSTOM_QUESTION_ID ? !!drawerCustomQuestion.trim() : !!drawerQuestionId) &&
    !!drawerAnswer.trim();

  return (
    <div className="flex-1 flex flex-col">
      <Section size="2" className="flex flex-col items-center">
        <div className="w-full max-w-[800px]">
          <Header
            title="Frequently asked questions"
            subbody="You can add FAQs anytime. This information will help Zo assist patients on calls."
          />

          <div className="mt-8 flex flex-col gap-6">
          {entries.length === 0 ? (
            <div
              className={cn(
                "rounded-2xl border border-[var(--stroke-default)]",
                "bg-[var(--background-default-white)] p-8 flex flex-col gap-4 items-center justify-center text-center"
              )}
            >
              <div className="flex flex-col gap-1">
                <p className="text-[18px] leading-[24px] font-semibold text-[var(--text-default)] md:text-[20px] md:leading-[28px]">
                  Add patient FAQs <span className="ml-1 text-[16px] leading-[26px] font-medium text-[var(--text-whisper)]">(Optional)</span>
                </p>
                <p className="text-[14px] leading-[20px] text-[var(--text-whisper)] max-w-md">
                  Give Zo the information needed to answer common questions during calls
                </p>
              </div>
              <Button variant="secondary" size="default" onClick={openDrawer}>
                Add FAQ
              </Button>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-[16px] leading-[20px] font-semibold text-[var(--text-default)] md:text-[18px] md:leading-[24px]">
                  Your FAQs
                </h2>
                <Button variant="secondary" size="small" onClick={openDrawer}>
                  Add FAQ
                </Button>
              </div>
              <ul className="flex flex-col gap-3 list-none p-0 m-0">
                {entries.map((entry) => {
                  const category = FAQ_CATEGORIES.find((c) => c.id === entry.categoryId);
                  const iconName = category?.icon ?? "help";
                  const applyParts = getApplyToParts(entry, lines);
                  const answerPreview =
                    entry.generatedResponse?.slice(0, 120) ?? entry.answer?.slice(0, 120) ?? "";
                  const answerDisplay = answerPreview.length >= 120 ? `${answerPreview}…` : answerPreview;
                  return (
                    <li
                      key={entry.id}
                      className="rounded-xl border border-[var(--stroke-default)] bg-[var(--background-default-white)] p-4 flex flex-row items-center gap-4"
                    >
                      <div className="shrink-0 flex items-center justify-center w-10 h-10 rounded-lg bg-[var(--background-default-greige)] text-[var(--icon-default)]">
                        <Icon name={iconName} size="24" filled={false} />
                      </div>
                      <div className="min-w-0 flex-1 flex flex-col gap-1">
                        <span className="text-[16px] leading-[26px] font-semibold text-[var(--text-default)]">
                          {entry.question}
                        </span>
                        {answerDisplay && (
                          <p className="text-[14px] leading-[20px] text-[var(--text-whisper)] line-clamp-2">
                            {answerDisplay}
                          </p>
                        )}
                      </div>
                      <div className="shrink-0 flex flex-col gap-0.5 text-right text-[14px] leading-[20px] text-[var(--text-whisper)]">
                        <span>{applyParts.phone}</span>
                        <span>{applyParts.location}</span>
                      </div>
                      <div className="shrink-0">
                        <IconButton
                          icon="delete"
                          size="small"
                          aria-label="Remove FAQ"
                          onClick={() => removeEntry(entry.id)}
                          className="shrink-0"
                        />
                      </div>
                    </li>
                  );
                })}
              </ul>
            </>
          )}
          </div>
        </div>
      </Section>

        <Drawer open={drawerOpen} onOpenChange={(open) => !open && closeDrawer()}>
          <DrawerContent showCloseButton>
            <DrawerHeader className="flex flex-row items-center gap-2">
              {drawerStep === 2 && !drawerGenerating && (
                <IconButton
                  icon="arrow_back"
                  size="small"
                  aria-label="Back"
                  onClick={() => setDrawerStep(1)}
                  className="shrink-0 -ml-1"
                />
              )}
              <div className="flex-1 min-w-0">
                {drawerStep === 1 && (
                  <>
                    <DrawerTitle>Choose a category</DrawerTitle>
                  </>
                )}
                {drawerStep === 2 && (
                  <>
                    <DrawerTitle>Select an FAQ</DrawerTitle>
                  </>
                )}
              </div>
            </DrawerHeader>
            <DrawerBody className="flex flex-col gap-6">
              {drawerStep === 1 && (
                <RadioGroup
                  value={drawerCategoryId}
                  onValueChange={setDrawerCategoryId}
                  className="flex flex-col gap-3"
                >
                  {FAQ_CATEGORIES.map((c) => (
                    <RadioCard
                      key={c.id}
                      value={c.id}
                      label={c.label}
                      description={c.description}
                      icon={c.icon}
                      layout="wide"
                    />
                  ))}
                </RadioGroup>
              )}

              {drawerStep === 2 && category && (
                <div className="flex flex-col gap-6">
                  <SelectField
                    label="Question"
                    placeholder="Select"
                    value={drawerQuestionId}
                    onValueChange={(value) => {
                      setDrawerQuestionId(value);
                      if (value !== CUSTOM_QUESTION_ID) setDrawerCustomQuestion("");
                    }}
                  >
                    {questions.map((q) => (
                      <SelectItem key={q.id} value={q.id}>
                        {q.text}
                      </SelectItem>
                    ))}
                    <SelectItem value={CUSTOM_QUESTION_ID}>
                      Custom question
                    </SelectItem>
                  </SelectField>
                  {drawerQuestionId === CUSTOM_QUESTION_ID && (
                    <TextField
                      value={drawerCustomQuestion}
                      onChange={(e) => setDrawerCustomQuestion(e.target.value)}
                      placeholder="Enter your question"
                      size="default"
                      className="w-full"
                    />
                  )}

                  <TextareaField
                    label="Your answer"
                    required
                    helperText="Zo will interpret the information you provide and respond to patients naturally in conversation"
                    value={drawerAnswer}
                    onChange={(e) => setDrawerAnswer(e.target.value)}
                    rows={4}
                  />

                  <div className="flex flex-col gap-4">
                    <FieldLabel className="text-[16px] leading-[26px] font-semibold" required>
                      Where should this FAQ apply?
                    </FieldLabel>
                    <RadioGroup
                      value={drawerApplyTo}
                      onValueChange={(v) => setDrawerApplyTo(v as "phone_lines" | "locations")}
                      className="flex flex-col gap-3"
                    >
                      <RadioField value="phone_lines" label="Select Zo phone lines" />
                      <RadioField value="locations" label="Select locations" />
                    </RadioGroup>

                    {drawerApplyTo === "phone_lines" && (
                      <div className="flex flex-col gap-2">
                        <Popover>
                          <PopoverTrigger asChild>
                            <button
                              type="button"
                              className={cn(
                                "flex w-full items-center justify-between gap-2",
                                "h-[var(--button-height-default)] pl-4 pr-3",
                                "rounded-[var(--radius-input)] border border-[var(--stroke-ui)]",
                                "bg-[var(--color-white)] font-semibold text-[var(--text-default)]",
                                "hover:bg-[var(--state-hover)] focus:outline-none focus:ring-2 focus:ring-[var(--stroke-keyboard)]",
                                "text-left text-[16px] leading-[26px]",
                                drawerPhoneLinesSelection.mode === "none" && "text-[var(--text-placeholder)]"
                              )}
                            >
                              <span className="truncate min-w-0">
                                {drawerPhoneLinesSelection.mode === "none"
                                  ? "Select phone lines"
                                  : drawerPhoneLinesSelection.mode === "all"
                                    ? "All phone lines"
                                    : drawerPhoneLinesSelection.ids.length === 1
                                      ? lines.find((l) => l.id === drawerPhoneLinesSelection.ids[0])?.name ?? "1 selected"
                                      : `${drawerPhoneLinesSelection.ids.length} phone lines selected`}
                              </span>
                              <Icon name="expand_more" size="24" className="text-[var(--icon-default)] opacity-70 shrink-0" />
                            </button>
                          </PopoverTrigger>
                          <PopoverContent
                            align="start"
                            className="w-[var(--radix-popover-trigger-width)] max-h-[280px] flex flex-col overflow-hidden p-0"
                          >
                            <div
                              className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-contain p-1"
                              onWheel={(e) => {
                                const el = e.currentTarget;
                                const { scrollTop, scrollHeight, clientHeight } = el;
                                const canScrollUp = scrollTop > 0;
                                const canScrollDown = scrollTop + clientHeight < scrollHeight;
                                const scrollingUp = e.deltaY < 0;
                                const scrollingDown = e.deltaY > 0;
                                if ((scrollingUp && canScrollUp) || (scrollingDown && canScrollDown)) {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  el.scrollTop += e.deltaY;
                                }
                              }}
                            >
                              <div
                                className="flex items-center gap-3 rounded-[4px] py-2 px-3 hover:bg-[var(--state-hover)] cursor-pointer border-b border-[var(--stroke-default)]"
                                onClick={handleSelectAllRowClick}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter" || e.key === " ") {
                                    e.preventDefault();
                                    handleSelectAllRowClick();
                                  }
                                }}
                                role="option"
                                aria-selected={drawerPhoneLinesSelection.mode === "all"}
                                tabIndex={0}
                              >
                                <Checkbox
                                  size="small"
                                  checked={drawerPhoneLinesSelection.mode === "all"}
                                  onCheckedChange={handleSelectAllRowClick}
                                  onClick={(e) => e.stopPropagation()}
                                />
                                <span className="text-[16px] leading-[26px] font-semibold text-[var(--text-default)]">
                                  Select all
                                </span>
                              </div>
                              {lines.map((line) => {
                                const isChecked =
                                  drawerPhoneLinesSelection.mode === "all" ||
                                  drawerPhoneLinesSelection.ids.includes(line.id);
                                return (
                                  <div
                                    key={line.id}
                                    className="flex items-center gap-3 rounded-[4px] py-2 px-3 hover:bg-[var(--state-hover)] cursor-pointer"
                                    onClick={() => toggleDrawerLine(line.id)}
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter" || e.key === " ") {
                                        e.preventDefault();
                                        toggleDrawerLine(line.id);
                                      }
                                    }}
                                    role="option"
                                    aria-selected={isChecked}
                                    tabIndex={0}
                                  >
                                    <Checkbox
                                      size="small"
                                      checked={isChecked}
                                      onCheckedChange={() => toggleDrawerLine(line.id)}
                                      onClick={(e) => e.stopPropagation()}
                                    />
                                    <span className="text-[16px] leading-[26px] font-semibold text-[var(--text-default)]">
                                      {line.name || "Phone line"}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          </PopoverContent>
                        </Popover>
                      </div>
                    )}

                    {drawerApplyTo === "locations" && (
                      <div className="flex flex-col gap-2">
                        <Popover>
                          <PopoverTrigger asChild>
                            <button
                              type="button"
                              className={cn(
                                "flex w-full items-center justify-between gap-2",
                                "h-[var(--button-height-default)] pl-4 pr-3",
                                "rounded-[var(--radius-input)] border border-[var(--stroke-ui)]",
                                "bg-[var(--color-white)] font-semibold text-[var(--text-default)]",
                                "hover:bg-[var(--state-hover)] focus:outline-none focus:ring-2 focus:ring-[var(--stroke-keyboard)]",
                                "text-left text-[16px] leading-[26px]",
                                drawerLocationsSelection.mode === "none" && "text-[var(--text-placeholder)]"
                              )}
                            >
                              <span className="truncate min-w-0">
                                {drawerLocationsSelection.mode === "none"
                                  ? "Select locations"
                                  : drawerLocationsSelection.mode === "all"
                                    ? "All locations"
                                    : drawerLocationsSelection.ids.length === 1
                                      ? MOCK_LOCATIONS.find((l) => l.id === drawerLocationsSelection.ids[0])?.name ?? "1 selected"
                                      : `${drawerLocationsSelection.ids.length} locations selected`}
                              </span>
                              <Icon name="expand_more" size="24" className="text-[var(--icon-default)] opacity-70 shrink-0" />
                            </button>
                          </PopoverTrigger>
                          <PopoverContent
                            align="start"
                            className="w-[var(--radix-popover-trigger-width)] max-h-[280px] flex flex-col overflow-hidden p-0"
                          >
                            <div
                              className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-contain p-1"
                              onWheel={(e) => {
                                const el = e.currentTarget;
                                const { scrollTop, scrollHeight, clientHeight } = el;
                                const canScrollUp = scrollTop > 0;
                                const canScrollDown = scrollTop + clientHeight < scrollHeight;
                                const scrollingUp = e.deltaY < 0;
                                const scrollingDown = e.deltaY > 0;
                                if ((scrollingUp && canScrollUp) || (scrollingDown && canScrollDown)) {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  el.scrollTop += e.deltaY;
                                }
                              }}
                            >
                              <div
                                className="flex items-center gap-3 rounded-[4px] py-2 px-3 hover:bg-[var(--state-hover)] cursor-pointer border-b border-[var(--stroke-default)]"
                                onClick={handleSelectAllLocationsClick}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter" || e.key === " ") {
                                    e.preventDefault();
                                    handleSelectAllLocationsClick();
                                  }
                                }}
                                role="option"
                                aria-selected={drawerLocationsSelection.mode === "all"}
                                tabIndex={0}
                              >
                                <Checkbox
                                  size="small"
                                  checked={drawerLocationsSelection.mode === "all"}
                                  onCheckedChange={handleSelectAllLocationsClick}
                                  onClick={(e) => e.stopPropagation()}
                                />
                                <span className="text-[16px] leading-[26px] font-semibold text-[var(--text-default)]">
                                  Select all
                                </span>
                              </div>
                              {MOCK_LOCATIONS.map((loc) => {
                                const isChecked =
                                  drawerLocationsSelection.mode === "all" ||
                                  drawerLocationsSelection.ids.includes(loc.id);
                                return (
                                  <div
                                    key={loc.id}
                                    className="flex items-center gap-3 rounded-[4px] py-2 px-3 hover:bg-[var(--state-hover)] cursor-pointer"
                                    onClick={() => toggleDrawerLocation(loc.id)}
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter" || e.key === " ") {
                                        e.preventDefault();
                                        toggleDrawerLocation(loc.id);
                                      }
                                    }}
                                    role="option"
                                    aria-selected={isChecked}
                                    tabIndex={0}
                                  >
                                    <Checkbox
                                      size="small"
                                      checked={isChecked}
                                      onCheckedChange={() => toggleDrawerLocation(loc.id)}
                                      onClick={(e) => e.stopPropagation()}
                                    />
                                    <span className="text-[16px] leading-[26px] font-semibold text-[var(--text-default)]">
                                      {loc.name}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          </PopoverContent>
                        </Popover>
                      </div>
                    )}
                  </div>
                </div>
              )}

            </DrawerBody>
            <DrawerFooter>
              {drawerStep === 1 && (
                <Button
                  variant="primary"
                  size="default"
                  onClick={() => setDrawerStep(2)}
                  disabled={!canProceedFromStep1}
                >
                  Continue
                </Button>
              )}
              {drawerStep === 2 && (
                <Button
                  variant="primary"
                  size="default"
                  onClick={handleSaveFaq}
                  disabled={
                    !canGenerate ||
                    drawerGenerating ||
                    (drawerApplyTo === "phone_lines" && effectivePhoneLineIds.length === 0) ||
                    (drawerApplyTo === "locations" && drawerLocationsSelection.mode === "none")
                  }
                >
                  {drawerGenerating ? "Saving…" : "Save FAQ"}
                </Button>
              )}
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
    </div>
  );
}
