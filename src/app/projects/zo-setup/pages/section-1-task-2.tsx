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
} from "@/components/vibezz";
import { ZoSetupBackContext, ZoSetupStateContext } from "../zo-setup-shell";

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

function getStoredPhoneLines(): { id: string; name: string; locationIds: string[] }[] {
  if (typeof window === "undefined") return [];
  try {
    const s = sessionStorage.getItem(PHONE_LINES_STORAGE_KEY);
    return s ? (JSON.parse(s) as { id: string; name: string; locationIds: string[] }[]) : [];
  } catch {
    return [];
  }
}

export default function PhoneLinesTask() {
  const { setPhoneLines } = useContext(ZoSetupStateContext);
  const [choice, setChoice] = useState<PhoneSystemChoice>("");
  const [phase, setPhase] = useState<Phase>("select");
  const [customLines, setCustomLines] = useState<{ id: string; name: string; locationIds: string[] }[]>([]);

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
            },
          ]);
        }
        if (v === "per-location") {
          setCustomLines(
            PLACEHOLDER_LOCATIONS.map((_, i) => ({
              id: crypto.randomUUID(),
              name: PLACEHOLDER_LOCATIONS[i],
              locationIds: [String(i)],
            }))
          );
        }
        if (v === "regional") {
          setCustomLines([{ id: crypto.randomUUID(), name: "", locationIds: [] }]);
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

  const addCustomLine = useCallback(() => {
    setCustomLines((prev) => [
      ...prev,
      { id: crypto.randomUUID(), name: "", locationIds: [] },
    ]);
  }, []);

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
                    ? "Zo phone lines"
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
                    {choice === "one" && "Creating Zo phone line"}
                    {choice === "per-location" && "Creating Zo phone lines"}
                    {choice === "regional" && "Let's set up your Zo phone lines"}
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
                          <div className="flex items-center justify-between gap-6">
                            <TextField
                              label="Phone line name"
                              value={line.name}
                              onChange={(e) => updateLineName(line.id, e.target.value)}
                              size="default"
                              required
                              className="flex-1 min-w-0"
                              placeholder="e.g. New York region"
                            />
                            {customLines.length > 1 && (
                              <IconButton
                                icon="delete"
                                size="small"
                                aria-label="Remove phone line"
                                onClick={() => removeCustomLine(line.id)}
                                className="shrink-0 mt-8"
                              />
                            )}
                          </div>
                          <div className="rounded-xl border border-[var(--stroke-default)] bg-[var(--background-default-greige)] p-6 flex flex-col gap-6">
                            {(choice === "one" || choice === "per-location") ? (
                              <>
                                <div className="flex items-center justify-between gap-4">
                                  <FieldLabel size="default" required>Locations</FieldLabel>
                                  <Button
                                    variant="secondary"
                                    size="small"
                                    onClick={() => toggleLocationSearch(line.id)}
                                  >
                                    {locationSearchExpandedByLineId[line.id] ? "Hide search" : "Add location"}
                                  </Button>
                                </div>
                                {locationSearchExpandedByLineId[line.id] && (
                                  <div className="relative">
                                    <Input
                                      placeholder="Search locations..."
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
                                      size="default"
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
                              </>
                            ) : (
                              <div className="relative">
                                <TextField
                                  label="Add locations to this phone line"
                                  placeholder="Search locations..."
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
                                  size="default"
                                  required
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
                                        onClick={() => removeLocationFromLine(line.id, idx)}
                                        className="shrink-0"
                                      />
                                    </li>
                                  );
                                })}
                              </ul>
                            ) : null}
                          </div>
                        </div>
                      );
                    })}
                    <Button variant="tertiary" size="small" onClick={addCustomLine} className="w-fit">
                      Add another phone line
                    </Button>
                </div>
              </div>
            )}

          </div>
        </Section>
      </Container>
    </div>
  );
}
