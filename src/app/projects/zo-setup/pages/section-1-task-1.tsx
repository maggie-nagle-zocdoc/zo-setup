"use client";

import { useState, useEffect, useRef, useContext, useCallback } from "react";
import {
  Section,
  Header,
  Button,
  TextField,
  IconButton,
  RadioGroup,
  RadioCard,
  FieldLabel,
} from "@/components/vibezz";
import { ZoSetupContinueValidationContext } from "../zo-setup-shell";

const DEFAULT_PRACTICE_NAME = "Soho Medical";

const PRONUNCIATION_DURATION_MS = 2000;

function formatTime(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  return `0:${seconds.toString().padStart(2, "0")}`;
}

export const PRACTICE_INFO_STORAGE_KEY = "zo-setup-practice-info";

interface StoredPracticeInfo {
  practiceName: string;
  choice: string;
  phonetic: string;
  additionalNames: { id: string; name: string; phonetic: string }[];
}

function getStoredPracticeInfo(): StoredPracticeInfo | null {
  if (typeof window === "undefined") return null;
  try {
    const s = sessionStorage.getItem(PRACTICE_INFO_STORAGE_KEY);
    if (!s) return null;
    const parsed = JSON.parse(s) as Record<string, unknown>;
    // New format
    if (typeof parsed.practiceName === "string") {
      return {
        practiceName: parsed.practiceName,
        choice: (parsed.choice as string) ?? "",
        phonetic: (parsed.phonetic as string) ?? "",
        additionalNames: Array.isArray(parsed.additionalNames) ? (parsed.additionalNames as { id: string; name: string; phonetic: string }[]) : [],
      };
    }
    // Migrate old format (choice, phonetic, showAdditional, additionalNames with showPhonetic)
    const old = parsed as { choice?: string; phonetic?: string; additionalNames?: { id: string; name: string; phonetic: string }[] };
    return {
      practiceName: DEFAULT_PRACTICE_NAME,
      choice: old.choice ?? "",
      phonetic: old.phonetic ?? "",
      additionalNames: Array.isArray(old.additionalNames) ? old.additionalNames.map((a) => ({ id: a.id, name: a.name, phonetic: a.phonetic ?? "" })) : [],
    };
  } catch {
    return null;
  }
}

function storePracticeInfo(data: StoredPracticeInfo) {
  try {
    sessionStorage.setItem(PRACTICE_INFO_STORAGE_KEY, JSON.stringify(data));
  } catch {
    // ignore
  }
}

export default function PracticeInformation() {
  const { setContinueValidationHandler } = useContext(ZoSetupContinueValidationContext);
  const [practiceName, setPracticeName] = useState(DEFAULT_PRACTICE_NAME);
  const [choice, setChoice] = useState("");
  const [phonetic, setPhonetic] = useState("");
  const [additionalNames, setAdditionalNames] = useState<{ id: string; name: string; phonetic: string }[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [playingAdditionalIndex, setPlayingAdditionalIndex] = useState<number | null>(null);
  const [additionalElapsedMs, setAdditionalElapsedMs] = useState(0);
  const [continueError, setContinueError] = useState<string | null>(null);

  const hasRestoredRef = useRef(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const stored = getStoredPracticeInfo();
    if (stored) {
      setPracticeName(stored.practiceName);
      setChoice(stored.choice);
      setPhonetic(stored.phonetic);
      setAdditionalNames(stored.additionalNames);
    }
  }, []);

  useEffect(() => {
    const id = setTimeout(() => {
      hasRestoredRef.current = true;
    }, 0);
    return () => clearTimeout(id);
  }, []);

  useEffect(() => {
    if (!hasRestoredRef.current) return;
    storePracticeInfo({ practiceName, choice, phonetic, additionalNames });
  }, [practiceName, choice, phonetic, additionalNames]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const handlePlay = () => {
    if (isPlaying) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = null;
      setIsPlaying(false);
      setElapsedMs(0);
      return;
    }
    if (intervalRef.current) clearInterval(intervalRef.current);
    setPlayingAdditionalIndex(null);
    setAdditionalElapsedMs(0);
    setIsPlaying(true);
    setElapsedMs(0);
    intervalRef.current = setInterval(() => {
      setElapsedMs((prev) => {
        const next = prev + 100;
        if (next >= PRONUNCIATION_DURATION_MS) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          intervalRef.current = null;
          setIsPlaying(false);
          return PRONUNCIATION_DURATION_MS;
        }
        return next;
      });
    }, 100);
  };

  const handlePlayAdditional = (index: number) => {
    if (playingAdditionalIndex === index) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = null;
      setPlayingAdditionalIndex(null);
      setAdditionalElapsedMs(0);
      return;
    }
    if (intervalRef.current) clearInterval(intervalRef.current);
    setIsPlaying(false);
    setElapsedMs(0);
    setPlayingAdditionalIndex(index);
    setAdditionalElapsedMs(0);
    intervalRef.current = setInterval(() => {
      setAdditionalElapsedMs((prev) => {
        const next = prev + 100;
        if (next >= PRONUNCIATION_DURATION_MS) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          intervalRef.current = null;
          setPlayingAdditionalIndex(null);
          return PRONUNCIATION_DURATION_MS;
        }
        return next;
      });
    }, 100);
  };

  const addPracticeSlot = () => {
    setAdditionalNames((prev) => [...prev, { id: crypto.randomUUID(), name: "", phonetic: "" }]);
  };

  const removeAdditionalName = (index: number) => {
    setAdditionalNames((prev) => prev.filter((_, i) => i !== index));
  };

  const updateAdditionalName = (index: number, field: "name" | "phonetic", value: string) => {
    setAdditionalNames((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const validateContinue = useCallback(() => {
    if (choice) return true;
    setContinueError("Make a selection to continue");
    return false;
  }, [choice]);

  useEffect(() => {
    setContinueValidationHandler(validateContinue);
    return () => setContinueValidationHandler(null);
  }, [validateContinue, setContinueValidationHandler]);

  return (
    <div className="flex-1 flex flex-col">
      <Section size="2">
        <Header title="Let's get the basics right" />

        <div className="mt-8 flex flex-col gap-8">
          {/* Practice name */}
          <div className="flex flex-col gap-6">
            <h2 className="text-[16px] leading-[20px] font-semibold text-[var(--text-default)] md:text-[18px] md:leading-[24px]">
              Practice name
            </h2>
            <div className="rounded-2xl border border-[var(--stroke-default)] bg-[var(--background-default-white)] p-8 flex flex-col gap-0">
              <p className="text-[16px] leading-[26px] font-semibold text-[var(--text-default)]">
                {practiceName}
              </p>
              <div className="flex flex-col gap-2">
                <FieldLabel size="small" required className="font-medium">
                  Preview pronunciation
                </FieldLabel>
                <div className="rounded-full border border-[var(--stroke-default)] bg-[var(--background-default-greige)] px-6 py-4 flex items-center gap-4">
                  <IconButton
                    icon={isPlaying ? "stop" : "play_arrow"}
                    size="small"
                    aria-label={isPlaying ? "Stop" : "Listen to pronunciation"}
                    onClick={handlePlay}
                    className="shrink-0 !rounded-full bg-[var(--color-charcoal-90)] text-[var(--color-white)] hover:bg-[var(--color-charcoal-70)] active:bg-[var(--color-charcoal-70)] focus-visible:ring-[var(--stroke-keyboard)]"
                  />
                  <span className="text-[14px] leading-[20px] text-[var(--text-whisper)]">
                    {formatTime(elapsedMs)}/{formatTime(PRONUNCIATION_DURATION_MS)}
                  </span>
                  <div className="flex-1 h-1 rounded-full bg-[var(--stroke-default)] overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[var(--stroke-charcoal)] transition-all duration-100"
                      style={{ width: `${(elapsedMs / PRONUNCIATION_DURATION_MS) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <FieldLabel size="default" required>
                Is the pronunciation correct?
              </FieldLabel>
              <RadioGroup
                value={choice}
                onValueChange={(value) => {
                  setChoice(value);
                  setContinueError(null);
                }}
                className="flex flex-col gap-2 w-full"
              >
                <RadioCard value="sounds-good" label="Yes, this sounds good" />
                <RadioCard value="add-phonetic" label="No, I need to add pronunciation" />
              </RadioGroup>
            </div>
            {choice === "add-phonetic" && (
              <div className="animate-in fade-in duration-200">
                <TextField
                  label="Phonetic spelling"
                  placeholder="e.g. SO-ho MED-i-cal"
                  helperText="Spell out how the name should sound so Zo pronounces it correctly for callers."
                  value={phonetic}
                  onChange={(e) => setPhonetic(e.target.value)}
                  size="default"
                  className="max-w-md"
                />
              </div>
            )}
            {continueError && (
              <p className="text-[14px] leading-[20px] font-medium text-[var(--text-error)]" role="alert">
                {continueError}
              </p>
            )}
          </div>

          {/* Divider */}
          <div className="border-t border-[var(--stroke-default)]" />

          {/* Additional practice names */}
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-1">
              <h2 className="text-[16px] leading-[20px] font-semibold text-[var(--text-default)] md:text-[18px] md:leading-[24px]">
                Additional practice names
              </h2>
              <p className="text-[14px] leading-[20px] text-[var(--text-secondary)]">
                This option is for practices that operate under multiple names. Do not include location names.
              </p>
            </div>

            {additionalNames.length > 0 && (
              <div className="flex flex-col gap-4">
                {additionalNames.map((item, index) => (
                  <div
                    key={item.id}
                    className="rounded-2xl border border-[var(--stroke-default)] bg-[var(--background-default-white)] p-8 flex flex-col gap-6 sm:flex-row sm:items-start sm:gap-4"
                  >
                    <div className="flex-1 min-w-0 flex flex-col gap-4">
                      <TextField
                        label="Practice name"
                        value={item.name}
                        onChange={(e) => updateAdditionalName(index, "name", e.target.value)}
                        size="small"
                        placeholder="Practice name"
                        required
                      />
                      <TextField
                        label="Phonetic spelling"
                        value={item.phonetic}
                        onChange={(e) => updateAdditionalName(index, "phonetic", e.target.value)}
                        size="small"
                        placeholder="e.g. SO-ho MED-i-cal"
                      />
                      <div className="flex flex-col gap-2">
                        <FieldLabel size="small" required className="font-medium">
                          Preview pronunciation
                        </FieldLabel>
                        <div className="rounded-full border border-[var(--stroke-default)] bg-[var(--background-default-greige)] px-4 py-3 flex items-center gap-3">
                          <IconButton
                            icon={playingAdditionalIndex === index ? "stop" : "play_arrow"}
                            size="small"
                            aria-label={playingAdditionalIndex === index ? "Stop" : "Listen to pronunciation"}
                            onClick={() => handlePlayAdditional(index)}
                            className="shrink-0 !rounded-full bg-[var(--color-charcoal-90)] text-[var(--color-white)] hover:bg-[var(--color-charcoal-70)] active:bg-[var(--color-charcoal-70)] focus-visible:ring-[var(--stroke-keyboard)]"
                          />
                          <span className="text-[14px] leading-[20px] text-[var(--text-whisper)]">
                            {playingAdditionalIndex === index
                              ? `${formatTime(additionalElapsedMs)}/${formatTime(PRONUNCIATION_DURATION_MS)}`
                              : `0:00/${formatTime(PRONUNCIATION_DURATION_MS)}`}
                          </span>
                          <div className="flex-1 h-1 rounded-full bg-[var(--stroke-default)] overflow-hidden">
                            <div
                              className="h-full rounded-full bg-[var(--stroke-charcoal)] transition-all duration-100"
                              style={{
                                width:
                                  playingAdditionalIndex === index
                                    ? `${(additionalElapsedMs / PRONUNCIATION_DURATION_MS) * 100}%`
                                    : "0%",
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                    <IconButton
                      icon="delete"
                      size="small"
                      aria-label="Remove practice name"
                      onClick={() => removeAdditionalName(index)}
                      className="shrink-0 mt-8"
                    />
                  </div>
                ))}
              </div>
            )}

            <Button variant="secondary" size="small" onClick={addPracticeSlot} className="w-fit">
              Add another name
            </Button>
          </div>
        </div>
      </Section>
    </div>
  );
}
