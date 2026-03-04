"use client";

import { useState, useCallback, useContext, useEffect } from "react";
import {
  Container,
  Section,
  Header,
  RadioGroup,
  RadioCard,
  Button,
  TextField,
  Input,
  IconButton,
  FieldLabel,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
  Flag,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/vibezz";
import { cn } from "@/lib/utils";
import { ZoSetupBackContext, ZoSetupStateContext, type WorkingHours } from "../zo-setup-shell";
import { PRACTICE_INFO_STORAGE_KEY } from "./section-1-task-1";

const DEFAULT_PRACTICE_NAME = "Soho Medical";

function getPracticeNamesList(): string[] {
  if (typeof window === "undefined") return [DEFAULT_PRACTICE_NAME];
  try {
    const s = sessionStorage.getItem(PRACTICE_INFO_STORAGE_KEY);
    if (!s) return [DEFAULT_PRACTICE_NAME];
    const parsed = JSON.parse(s) as { additionalNames?: { name: string }[] };
    const additional = (parsed.additionalNames ?? [])
      .map((a) => a.name?.trim())
      .filter(Boolean);
    return [DEFAULT_PRACTICE_NAME, ...additional];
  } catch {
    return [DEFAULT_PRACTICE_NAME];
  }
}

// Placeholder Zocdoc locations (NY & NJ)
const PLACEHOLDER_LOCATIONS = [
  "Manhattan – Midtown",
  "Manhattan – Upper East Side",
  "Manhattan – SoHo",
  "Brooklyn – Williamsburg",
  "Brooklyn – Park Slope",
  "Queens – Astoria",
  "Queens – Flushing",
  "Bronx – Riverdale",
  "Staten Island – St. George",
  "Long Island – Great Neck",
  "Westchester – White Plains",
  "Jersey City",
  "Newark",
  "Hoboken",
  "Edison",
  "Woodbridge",
  "Cherry Hill",
  "New Brunswick",
  "Fort Lee",
  "Paramus",
];

type PhoneSystemChoice = "one" | "per-location" | "regional" | "";
type Phase = "select" | "loading" | "result";

const CHOICES: { value: PhoneSystemChoice; label: string; icon: string }[] = [
  { value: "one", label: "I have one phone number that directs all of my calls", icon: "support_agent" },
  { value: "per-location", label: "I have unique phone numbers for every location", icon: "format_list_bulleted" },
  { value: "regional", label: "I have multiple regional phone numbers", icon: "auto_awesome_mosaic" },
];

const LOADING_DURATION_MS = 2200;
const PHONE_LINES_STORAGE_KEY = "zo-setup-phone-lines";
const PHONE_LINES_CHOICE_KEY = "zo-setup-phone-lines-choice";

const DEFAULT_SINGLE_LINE_NAME = "Main line";

/** Mon–Fri 9am–5pm, Sat–Sun closed. [0]=Mon ... [6]=Sun. */
const DEFAULT_WORKING_HOURS: WorkingHours = [
  { start: "09:00", end: "17:00" },
  { start: "09:00", end: "17:00" },
  { start: "09:00", end: "17:00" },
  { start: "09:00", end: "17:00" },
  { start: "09:00", end: "17:00" },
  null,
  null,
];

const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
/** Figma order: Su Mo Tu We Th Fr Sa → data indices [6, 0, 1, 2, 3, 4, 5] */
const DAY_FLYOUT_ORDER: [number, string][] = [[6, "Su"], [0, "Mo"], [1, "Tu"], [2, "We"], [3, "Th"], [4, "Fr"], [5, "Sa"]];

function formatTime24To12(hhmm: string): string {
  const [h, m] = hhmm.split(":").map(Number);
  if (h === 0) return `12:${String(m).padStart(2, "0")}am`;
  if (h === 12) return `12:${String(m).padStart(2, "0")}pm`;
  if (h < 12) return `${h}:${String(m).padStart(2, "0")}am`;
  return `${h - 12}:${String(m).padStart(2, "0")}pm`;
}

function formatWorkingHoursSummary(hours: WorkingHours): string {
  const allClosed = hours.every((d) => d === null);
  if (allClosed) return "Closed";

  const parts: string[] = [];
  let i = 0;
  while (i < 7) {
    const slot = hours[i];
    if (slot === null) {
      i++;
      continue;
    }
    const range = `${formatTime24To12(slot.start)}–${formatTime24To12(slot.end)}`;
    let j = i + 1;
    while (j < 7 && hours[j] && hours[j]!.start === slot.start && hours[j]!.end === slot.end) j++;
    const dayRange = j - i === 1 ? DAY_NAMES[i] : `${DAY_NAMES[i]}–${DAY_NAMES[j - 1]}`;
    parts.push(`${dayRange} ${range}`);
    i = j;
  }
  if (parts.length === 0) return "Closed";
  return parts.join(", ");
}

type PhoneLineRow = { id: string; name: string; locationIds: string[]; practiceName?: string; workingHours?: WorkingHours };

function getStoredPhoneLines(): PhoneLineRow[] {
  if (typeof window === "undefined") return [];
  try {
    const s = sessionStorage.getItem(PHONE_LINES_STORAGE_KEY);
    return s ? (JSON.parse(s) as PhoneLineRow[]) : [];
  } catch {
    return [];
  }
}

export default function PhoneLinesTask() {
  const { setPhoneLines } = useContext(ZoSetupStateContext);
  const [choice, setChoice] = useState<PhoneSystemChoice>("");
  const [phase, setPhase] = useState<Phase>("select");
  const [customLines, setCustomLines] = useState<PhoneLineRow[]>([]);

  useEffect(() => {
    const stored = getStoredPhoneLines();
    const storedChoice = typeof window !== "undefined" ? sessionStorage.getItem(PHONE_LINES_CHOICE_KEY) : null;
    const validChoice = storedChoice === "one" || storedChoice === "per-location" || storedChoice === "regional";
    if (stored.length > 0 && validChoice) {
      setPhase("result");
      setChoice(storedChoice as PhoneSystemChoice);
      setCustomLines(stored);
    }
  }, []);

  useEffect(() => {
    if (phase === "result" && customLines.length > 0) {
      setPhoneLines(customLines);
    }
  }, [phase, customLines, setPhoneLines]);

  const handleSelect = useCallback(
    (value: string) => {
      if (phase !== "select") return;
      const v = value as PhoneSystemChoice;
      setChoice(v);
      setPhase("loading");
      setTimeout(() => {
        setPhase("result");
        if (v === "one") {
          setCustomLines([
            {
              id: crypto.randomUUID(),
              name: DEFAULT_SINGLE_LINE_NAME,
              locationIds: PLACEHOLDER_LOCATIONS.map((_, i) => String(i)),
              workingHours: DEFAULT_WORKING_HOURS,
            },
          ]);
        }
        if (v === "per-location") {
          setCustomLines(
            PLACEHOLDER_LOCATIONS.map((_, i) => ({
              id: crypto.randomUUID(),
              name: PLACEHOLDER_LOCATIONS[i],
              locationIds: [String(i)],
              workingHours: DEFAULT_WORKING_HOURS,
            }))
          );
        }
        if (v === "regional") {
          setCustomLines([{ id: crypto.randomUUID(), name: "", locationIds: [], workingHours: DEFAULT_WORKING_HOURS }]);
        }
        try {
          sessionStorage.setItem(PHONE_LINES_CHOICE_KEY, v);
        } catch {
          // ignore
        }
      }, LOADING_DURATION_MS);
    },
    [phase]
  );

  const [addLineError, setAddLineError] = useState<string | null>(null);

  const addCustomLine = useCallback(() => {
    setCustomLines((prev) => [
      ...prev,
      { id: crypto.randomUUID(), name: "", locationIds: [], workingHours: DEFAULT_WORKING_HOURS },
    ]);
  }, []);

  const handleAddAnotherPhoneLine = useCallback(() => {
    const used = new Set(customLines.flatMap((l) => l.locationIds.map(Number)));
    if (used.size >= PLACEHOLDER_LOCATIONS.length) {
      setAddLineError("No available locations to assign to a new phone line. Remove a location from an existing line to add another.");
      return;
    }
    setAddLineError(null);
    addCustomLine();
  }, [customLines, addCustomLine]);

  const removeCustomLine = useCallback((id: string) => {
    setCustomLines((prev) => prev.filter((l) => l.id !== id));
  }, []);

  const addLocationToLine = useCallback((lineId: string, locationIndex: number) => {
    setCustomLines((prev) =>
      prev.map((line) => {
        if (line.id !== lineId) return line;
        const key = String(locationIndex);
        if (line.locationIds.includes(key)) return line;
        return { ...line, locationIds: [...line.locationIds, key].sort((a, b) => Number(a) - Number(b)) };
      })
    );
  }, []);

  const removeLocationFromLine = useCallback((lineId: string, locationIndex: number) => {
    setCustomLines((prev) =>
      prev.map((line) => {
        if (line.id !== lineId) return line;
        return { ...line, locationIds: line.locationIds.filter((id) => id !== String(locationIndex)) };
      })
    );
  }, []);

  const [locationSearchByLineId, setLocationSearchByLineId] = useState<Record<string, string>>({});
  const [locationSearchFocusedLineId, setLocationSearchFocusedLineId] = useState<string | null>(null);
  const [locationSearchExpandedByLineId, setLocationSearchExpandedByLineId] = useState<Record<string, boolean>>({});

  const toggleLocationSearch = useCallback((lineId: string) => {
    setLocationSearchExpandedByLineId((prev) => ({ ...prev, [lineId]: !prev[lineId] }));
  }, []);

  const updateLineName = useCallback((lineId: string, name: string) => {
    setCustomLines((prev) => prev.map((l) => (l.id === lineId ? { ...l, name } : l)));
  }, []);

  const updateLinePracticeName = useCallback((lineId: string, practiceName: string) => {
    setCustomLines((prev) => prev.map((l) => (l.id === lineId ? { ...l, practiceName } : l)));
  }, []);

  const updateLineWorkingHours = useCallback((lineId: string, workingHours: WorkingHours) => {
    setCustomLines((prev) => prev.map((l) => (l.id === lineId ? { ...l, workingHours } : l)));
  }, []);

  const [workingHoursDialogLineId, setWorkingHoursDialogLineId] = useState<string | null>(null);
  const [workingHoursDraft, setWorkingHoursDraft] = useState<WorkingHours | null>(null);
  const [workingHoursDialogError, setWorkingHoursDialogError] = useState<string | null>(null);

  const openWorkingHoursDialog = useCallback((line: PhoneLineRow) => {
    setWorkingHoursDialogLineId(line.id);
    setWorkingHoursDraft(structuredClone(line.workingHours ?? DEFAULT_WORKING_HOURS));
    setWorkingHoursDialogError(null);
  }, []);

  const closeWorkingHoursDialog = useCallback(() => {
    setWorkingHoursDialogLineId(null);
    setWorkingHoursDraft(null);
    setWorkingHoursDialogError(null);
  }, []);

  const saveWorkingHoursDialog = useCallback(() => {
    if (!workingHoursDialogLineId || !workingHoursDraft) return;
    const hasAtLeastOneDay = workingHoursDraft.some((d) => d !== null);
    if (!hasAtLeastOneDay) {
      setWorkingHoursDialogError("Select at least one day with working hours.");
      return;
    }
    setWorkingHoursDialogError(null);
    updateLineWorkingHours(workingHoursDialogLineId, workingHoursDraft);
    closeWorkingHoursDialog();
  }, [workingHoursDialogLineId, workingHoursDraft, updateLineWorkingHours, closeWorkingHoursDialog]);

  const setDraftDay = useCallback((dayIndex: number, value: { start: string; end: string } | null) => {
    setWorkingHoursDraft((prev) => {
      if (!prev) return prev;
      const next = [...prev] as WorkingHours;
      next[dayIndex] = value;
      return next;
    });
  }, []);

  const [practiceNamesList, setPracticeNamesList] = useState<string[]>(() => [DEFAULT_PRACTICE_NAME]);
  useEffect(() => {
    if (phase === "result") setPracticeNamesList(getPracticeNamesList());
  }, [phase]);

  const { setInTaskBackHandler } = useContext(ZoSetupBackContext);

  const goBackToPart1 = useCallback(() => {
    setPhase("select");
    setChoice("");
    setCustomLines([]);
    setLocationSearchByLineId({});
    setLocationSearchExpandedByLineId({});
  }, []);

  useEffect(() => {
    if (phase === "result") {
      setInTaskBackHandler(goBackToPart1);
      return () => setInTaskBackHandler(null);
    }
    setInTaskBackHandler(null);
  }, [phase, goBackToPart1, setInTaskBackHandler]);

  return (
    <div className="flex-1 flex flex-col">
      <Container className={phase === "loading" ? "flex-1 flex flex-col min-h-0" : undefined}>
        <Section size="2" className={phase === "loading" ? "flex-1 flex flex-col min-h-0" : undefined}>
          {phase !== "loading" && (
            <Header
              title={
                phase === "select"
                  ? "How does your practice receive calls?"
                  : phase === "result"
                    ? "Review your Zo phone lines"
                    : "Phone lines"
              }
              subbody={
                phase === "select"
                  ? "We'll set up Zo phone lines based on your practices phone system"
                  : phase === "result" && choice === "one"
                    ? "We've created one Zo phone line that includes all of your Zocdoc locations"
                    : phase === "result" && choice === "per-location"
                      ? "We've created a separate Zo phone line for each of your Zocdoc locations"
                      : phase === "result" && choice === "regional"
                        ? "Create your own phone lines and assign locations to each"
                        : "We'll set up Zo phone lines based on how your practice receives calls."
              }
            />
          )}

          <div className={phase === "loading" ? "flex-1 flex flex-col min-h-0 mt-8 max-w-xl" : "mt-8 flex flex-col gap-8 max-w-xl"}>
            {phase === "select" && (
              <>
                <RadioGroup
                  value={choice}
                  onValueChange={handleSelect}
                  className="flex flex-col gap-3 w-full"
                >
                  {CHOICES.map((c) => (
                    <RadioCard key={c.value} value={c.value} label={c.label} icon={c.icon} />
                  ))}
                </RadioGroup>
              </>
            )}

            {phase === "loading" && (
              <div className="flex-1 flex flex-col items-center justify-center min-h-0 gap-6 animate-in fade-in duration-200">
                <div className="flex flex-col items-center gap-3 text-center max-w-md">
                  <div className="h-10 w-10 rounded-full border-2 border-[var(--stroke-charcoal)] border-t-transparent animate-spin" />
                  <h2 className="text-[16px] leading-[20px] font-semibold md:text-[18px] md:leading-[24px] text-[var(--text-default)]">
                    Getting your locations from Zocdoc...
                  </h2>
                  <p className="text-[16px] leading-[26px] font-medium text-[var(--text-default)]">
                    {choice === "one" && "You'll have one phone line for all your locations"}
                    {choice === "per-location" && "You'll have one phone line per location"}
                    {choice === "regional" && "Assign locations to phone lines"}
                  </p>
                </div>
              </div>
            )}

            {phase === "result" && (
              <div className="flex flex-col gap-6 animate-in fade-in duration-300">
                <div className="flex flex-col gap-4">
                    {customLines.map((line) => {
                      const searchQuery = (locationSearchByLineId[line.id] ?? "").trim().toLowerCase();
                      const usedLocationIndices = new Set(
                        customLines.flatMap((l) => l.locationIds.map(Number))
                      );
                      const unaddedLocations = PLACEHOLDER_LOCATIONS.map((loc, idx) => ({ loc, idx })).filter(
                        ({ idx }) => !usedLocationIndices.has(idx)
                      );
                      const matchingLocations = searchQuery
                        ? unaddedLocations.filter(({ loc }) => loc.toLowerCase().includes(searchQuery))
                        : unaddedLocations;
                      const isSearchFocused = locationSearchFocusedLineId === line.id;
                      const showDropdown = isSearchFocused;
                      return (
                        <div
                          key={line.id}
                          className="rounded-xl border border-[var(--stroke-default)] bg-[var(--background-default-white)] p-6 flex flex-col gap-6"
                        >
                          <div className="flex items-end justify-between gap-3">
                            <TextField
                              label="Phone line name"
                              value={line.name}
                              onChange={(e) => updateLineName(line.id, e.target.value)}
                              size="small"
                              required
                              className="flex-1 min-w-0"
                              placeholder="e.g. New York region"
                              helperText="This name is internal and never used on patient calls"
                            />
                            {customLines.length > 1 && (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <IconButton
                                      icon="delete"
                                      size="default"
                                      aria-label="Remove phone line"
                                      onClick={() => {
                                        removeCustomLine(line.id);
                                        setAddLineError(null);
                                      }}
                                      className="shrink-0 mb-[26px]"
                                    />
                                  </TooltipTrigger>
                                  <TooltipContent>Remove phone line</TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            )}
                          </div>
                          <div className="pt-4 border-t border-[var(--stroke-default)] flex flex-col gap-2">
                            {(choice === "one" || choice === "per-location") ? (
                              <>
                                <div className="flex items-center justify-between gap-4">
                                  <FieldLabel size="small" required>Locations</FieldLabel>
                                  {unaddedLocations.length > 0 && (
                                    <Button
                                      variant="secondary"
                                      size="small"
                                      onClick={() => toggleLocationSearch(line.id)}
                                    >
                                      {locationSearchExpandedByLineId[line.id] ? "Done" : "Add location"}
                                    </Button>
                                  )}
                                </div>
                                {locationSearchExpandedByLineId[line.id] && unaddedLocations.length > 0 && (
                                  <div className="relative">
                                    <Input
                                      placeholder="Search to add locations"
                                      value={locationSearchByLineId[line.id] ?? ""}
                                      onChange={(e) =>
                                        setLocationSearchByLineId((prev) => ({
                                          ...prev,
                                          [line.id]: e.target.value,
                                        }))
                                      }
                                      onFocus={() => setLocationSearchFocusedLineId(line.id)}
                                      onBlur={() =>
                                        setTimeout(() => setLocationSearchFocusedLineId(null), 150)
                                      }
                                      size="small"
                                    />
                                    {showDropdown && (
                                      <ul
                                        className="absolute top-full left-0 right-0 z-10 mt-1 max-h-48 overflow-auto rounded-md border border-[var(--stroke-default)] bg-[var(--background-default-white)] py-1 shadow-lg"
                                        role="listbox"
                                      >
                                        {matchingLocations.length > 0 ? (
                                          matchingLocations.map(({ loc, idx }) => (
                                            <li key={idx}>
                                              <button
                                                type="button"
                                                role="option"
                                                className="w-full px-3 py-2 text-left text-[14px] leading-[20px] text-[var(--text-default)] hover:bg-[var(--state-hover)]"
                                                onClick={() => {
                                                  addLocationToLine(line.id, idx);
                                                  setLocationSearchByLineId((prev) => ({ ...prev, [line.id]: "" }));
                                                  setAddLineError(null);
                                                }}
                                              >
                                                {loc}
                                              </button>
                                            </li>
                                          ))
                                        ) : (
                                          <li className="px-3 py-2 text-[14px] leading-[20px] text-[var(--text-secondary)]">
                                            No available locations
                                          </li>
                                        )}
                                      </ul>
                                    )}
                                  </div>
                                )}
                              </>
                            ) : (
                              <div className="relative">
                                <FieldLabel size="small" required>Locations</FieldLabel>
                                <Input
                                  placeholder="Search to add locations"
                                  value={locationSearchByLineId[line.id] ?? ""}
                                  onChange={(e) =>
                                    setLocationSearchByLineId((prev) => ({
                                      ...prev,
                                      [line.id]: e.target.value,
                                    }))
                                  }
                                  onFocus={() => setLocationSearchFocusedLineId(line.id)}
                                  onBlur={() =>
                                    setTimeout(() => setLocationSearchFocusedLineId(null), 150)
                                  }
                                  size="small"
                                  className="mt-2"
                                />
                                {showDropdown && (
                                  <ul
                                    className="absolute top-full left-0 right-0 z-10 mt-1 max-h-48 overflow-auto rounded-md border border-[var(--stroke-default)] bg-[var(--background-default-white)] py-1 shadow-lg"
                                    role="listbox"
                                  >
                                    {matchingLocations.length > 0 ? (
                                      matchingLocations.map(({ loc, idx }) => (
                                        <li key={idx}>
                                          <button
                                            type="button"
                                            role="option"
                                            className="w-full px-3 py-2 text-left text-[14px] leading-[20px] text-[var(--text-default)] hover:bg-[var(--state-hover)]"
                                            onClick={() => {
                                              addLocationToLine(line.id, idx);
                                              setLocationSearchByLineId((prev) => ({ ...prev, [line.id]: "" }));
                                            }}
                                          >
                                            {loc}
                                          </button>
                                        </li>
                                      ))
                                    ) : (
                                      <li className="px-3 py-2 text-[14px] leading-[20px] text-[var(--text-secondary)]">
                                        No available locations
                                      </li>
                                    )}
                                  </ul>
                                )}
                              </div>
                            )}
                            {line.locationIds.length > 0 ? (
                              <ul className="flex flex-wrap gap-2">
                                {line.locationIds.map((id) => {
                                  const idx = Number(id);
                                  const loc = PLACEHOLDER_LOCATIONS[idx];
                                  return (
                                    <li
                                      key={id}
                                      className="inline-flex items-center gap-1.5 rounded-md bg-[var(--background-default-white)] border border-[var(--stroke-default)] px-2 py-1 text-[14px] leading-[20px] text-[var(--text-default)]"
                                    >
                                      {loc}
                                      <IconButton
                                        icon="close"
                                        size="small"
                                        aria-label={`Remove ${loc}`}
                                        onClick={() => {
                                        removeLocationFromLine(line.id, idx);
                                        setAddLineError(null);
                                      }}
                                        className="shrink-0"
                                      />
                                    </li>
                                  );
                                })}
                              </ul>
                            ) : null}
                          </div>
                          <div className="pt-4 border-t border-[var(--stroke-default)] flex flex-col gap-2">
                            <div className="flex items-center justify-between gap-4">
                              <FieldLabel size="small" required>Phone line hours</FieldLabel>
                              <Button
                                variant="secondary"
                                size="small"
                                onClick={() => openWorkingHoursDialog(line)}
                                className="shrink-0"
                              >
                                Edit
                              </Button>
                            </div>
                            <p className="text-[14px] leading-[20px] text-[var(--text-default)]">
                              {formatWorkingHoursSummary(line.workingHours ?? DEFAULT_WORKING_HOURS)}
                            </p>
                          </div>
                          {practiceNamesList.length > 1 && (
                            <div className="pt-4 border-t border-[var(--stroke-default)] flex flex-col gap-2">
                              <FieldLabel size="small" required>Practice name</FieldLabel>
                              <Select
                                size="small"
                                value={line.practiceName ?? practiceNamesList[0]}
                                onValueChange={(value) => updateLinePracticeName(line.id, value)}
                                required
                              >
                                <SelectTrigger size="small">
                                  <SelectValue placeholder="Select practice name" />
                                </SelectTrigger>
                                <SelectContent>
                                  {practiceNamesList.map((name) => (
                                    <SelectItem key={name} value={name}>
                                      {name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          )}
                        </div>
                      );
                    })}
                    <div className="flex flex-col gap-2">
                      <Button variant="secondary" size="small" onClick={handleAddAnotherPhoneLine} className="w-fit">
                        Add another phone line
                      </Button>
                      {addLineError && (
                        <p className="text-[14px] leading-[20px] font-medium text-[var(--text-error)]" role="alert">
                          {addLineError}
                        </p>
                      )}
                    </div>

                    <Drawer open={workingHoursDialogLineId !== null} onOpenChange={(open) => !open && closeWorkingHoursDialog()}>
                      <DrawerContent showCloseButton>
                        <DrawerHeader>
                          <DrawerTitle>Phone line hours</DrawerTitle>
                          <DrawerDescription>
                            Hours that your staff can accept transferred calls for this phone line.
                          </DrawerDescription>
                        </DrawerHeader>
                        <DrawerBody className="flex flex-col gap-6">
                          <Flag color="blue" showIcon={false}>
                            Zo will always answer the phone. These hours let us know when your staff can also accept transferred calls.
                          </Flag>
                          <div className="flex flex-col gap-2">
                            <FieldLabel size="small" required>Phone line hours</FieldLabel>
                            <p className="text-[14px] leading-[20px] text-[var(--text-secondary)]">
                              Select the hours that your staff can accept transferred calls
                            </p>
                            {workingHoursDraft && (
                              <>
                                <div className="flex items-center gap-2 flex-wrap" role="group" aria-label="Select days">
                                  {DAY_FLYOUT_ORDER.map(([dataIndex, label]) => {
                                    const selected = workingHoursDraft[dataIndex] !== null;
                                    return (
                                      <button
                                        key={dataIndex}
                                        type="button"
                                        onClick={() => setDraftDay(dataIndex, selected ? null : { start: "08:00", end: "18:00" })}
                                        className={cn(
                                          "h-9 min-w-[2.25rem] rounded-full px-2.5 text-[14px] leading-[20px] font-medium transition-colors",
                                          selected
                                            ? "bg-[var(--stroke-charcoal)] text-[var(--color-white)]"
                                            : "bg-[var(--background-default-white)] border border-[var(--stroke-ui)] text-[var(--text-secondary)] hover:border-[var(--stroke-charcoal)] hover:text-[var(--text-default)]"
                                        )}
                                        aria-pressed={selected}
                                        aria-label={`${DAY_NAMES[dataIndex]} ${selected ? "selected" : "closed"}`}
                                      >
                                        {label}
                                      </button>
                                    );
                                  })}
                                </div>
                                <div className="flex flex-col gap-3 pt-2">
                                  {workingHoursDraft.map((slot, i) =>
                                    slot !== null ? (
                                      <div key={i} className="flex items-center gap-3 flex-wrap">
                                        <span className="w-24 text-[14px] leading-[20px] text-[var(--text-default)] shrink-0">{DAY_NAMES[i]}</span>
                                        <input
                                          type="time"
                                          value={slot.start}
                                          onChange={(e) => setDraftDay(i, { ...slot, start: e.target.value })}
                                          className="h-8 px-2 rounded border border-[var(--stroke-ui)] bg-[var(--background-default-white)] text-[14px] leading-[20px]"
                                          aria-label={`${DAY_NAMES[i]} start`}
                                        />
                                        <span className="text-[14px] text-[var(--text-secondary)]">to</span>
                                        <input
                                          type="time"
                                          value={slot.end}
                                          onChange={(e) => setDraftDay(i, { ...slot, end: e.target.value })}
                                          className="h-8 px-2 rounded border border-[var(--stroke-ui)] bg-[var(--background-default-white)] text-[14px] leading-[20px]"
                                          aria-label={`${DAY_NAMES[i]} end`}
                                        />
                                      </div>
                                    ) : null
                                  )}
                                </div>
                              </>
                            )}
                            {workingHoursDialogError && (
                              <p className="text-[14px] leading-[20px] font-medium text-[var(--text-error)]" role="alert">
                                {workingHoursDialogError}
                              </p>
                            )}
                          </div>
                        </DrawerBody>
                        <DrawerFooter>
                          <Button variant="primary" size="small" onClick={saveWorkingHoursDialog}>
                            Save
                          </Button>
                        </DrawerFooter>
                      </DrawerContent>
                    </Drawer>
                </div>
              </div>
            )}

          </div>
        </Section>
      </Container>
    </div>
  );
}
