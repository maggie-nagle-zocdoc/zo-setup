"use client";

import { useState, useEffect, useRef } from "react";
import {
  Section,
  Header,
  Button,
  TextField,
  IconButton,
  RadioGroup,
  RadioCard,
} from "@/components/vibezz";

const EXAMPLE_PRACTICE_NAME = "Soho Medical";

export const PRACTICE_INFO_STORAGE_KEY = "zo-setup-practice-info";

interface StoredPracticeInfo {
  choice: string;
  phonetic: string;
  showAdditional: boolean;
  additionalNames: { id: string; name: string; phonetic: string; showPhonetic: boolean }[];
}

function getStoredPracticeInfo(): StoredPracticeInfo | null {
  if (typeof window === "undefined") return null;
  try {
    const s = sessionStorage.getItem(PRACTICE_INFO_STORAGE_KEY);
    return s ? (JSON.parse(s) as StoredPracticeInfo) : null;
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
  const [choice, setChoice] = useState<string>("");
  const [phonetic, setPhonetic] = useState("");
  const [showAdditional, setShowAdditional] = useState(false);
  const [additionalNames, setAdditionalNames] = useState<{ id: string; name: string; phonetic: string; showPhonetic: boolean }[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playingAdditionalIndex, setPlayingAdditionalIndex] = useState<number | null>(null);

  const hasRestoredRef = useRef(false);

  useEffect(() => {
    const stored = getStoredPracticeInfo();
    if (stored) {
      setChoice(stored.choice);
      setPhonetic(stored.phonetic);
      setShowAdditional(stored.showAdditional);
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
    const data: StoredPracticeInfo = { choice, phonetic, showAdditional, additionalNames };
    storePracticeInfo(data);
  }, [choice, phonetic, showAdditional, additionalNames]);

  const handlePlay = () => {
    setIsPlaying(true);
    setTimeout(() => setIsPlaying(false), 1500);
  };

  const handlePlayAdditional = (index: number) => {
    setPlayingAdditionalIndex(index);
    setTimeout(() => setPlayingAdditionalIndex(null), 1500);
  };

  const addPracticeSlot = () => {
    setAdditionalNames((prev) => [...prev, { id: crypto.randomUUID(), name: "", phonetic: "", showPhonetic: false }]);
  };

  const setShowPhonetic = (index: number, show: boolean) => {
    setAdditionalNames((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], showPhonetic: show };
      return next;
    });
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

  return (
    <div className="flex-1 flex flex-col">
      <Section size="2">
          <Header
            title="Let's get the basics right"
            subbody="Listen to how Zo pronounces your practice's name and let us know how it sounds."
          />

          <div className="mt-8 flex flex-col gap-8">
            {/* Practice name + play (preview container) */}
            <div className="flex flex-col gap-2">
              <span className="text-[16px] leading-[26px] font-semibold text-[var(--text-default)]">
                Preview pronunciation
              </span>
              <div className="rounded-xl border border-[var(--stroke-default)] bg-[var(--background-default-greige)] p-5 flex items-center gap-4">
              <IconButton
                icon={isPlaying ? "stop" : "play_arrow"}
                size="small"
                aria-label={isPlaying ? "Stop" : "Listen to pronunciation"}
                onClick={handlePlay}
                className="shrink-0 !rounded-full bg-[var(--color-charcoal-90)] text-[var(--color-white)] hover:bg-[var(--color-charcoal-70)] active:bg-[var(--color-charcoal-70)] focus-visible:ring-[var(--stroke-keyboard)]"
              />
              <p className="text-[18px] leading-[28px] font-semibold text-[var(--text-default)]">
                &ldquo;{EXAMPLE_PRACTICE_NAME}&rdquo;
              </p>
            </div>
            </div>

            {/* Choice tiles: does it sound right? */}
            <RadioGroup
              value={choice}
              onValueChange={setChoice}
              label="How does that sound?"
              className="flex flex-col gap-3 w-full"
            >
              <RadioCard value="sounds-good" label="Sounds good" />
              <RadioCard value="add-phonetic" label="I need to update the pronunciation" />
            </RadioGroup>

            {/* Phonetic field when that option is chosen */}
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

            {/* Optional: add more practice names */}
            <div className="border-t border-[var(--stroke-default)] pt-6">
              <h2 className="text-[18px] leading-[24px] font-semibold text-[var(--text-default)] md:text-[20px] md:leading-[28px]">
                Add another practice name
                <span className="ml-1 text-[16px] leading-[26px] font-medium text-[var(--text-whisper)]">(Optional)</span>
              </h2>
              <p className="mt-2 text-[14px] leading-[20px] text-[var(--text-secondary)]">
                Only for practices that operate under multiple names. Do not include location names.
              </p>
              {!showAdditional && (
                <Button
                  variant="secondary"
                  size="small"
                  onClick={() => {
                    setShowAdditional(true);
                    addPracticeSlot();
                  }}
                  className="mt-3 w-fit"
                >
                  Add practice name
                </Button>
              )}
              {showAdditional && (
                <div className="mt-4 flex flex-col gap-6 animate-in fade-in duration-200">
                  {additionalNames.map((item, index) => (
                    <div
                      key={item.id}
                      className="rounded-xl border border-[var(--stroke-default)] bg-[var(--background-default-white)] p-6 flex items-start gap-3 w-full"
                    >
                      <IconButton
                        icon={playingAdditionalIndex === index ? "stop" : "play_arrow"}
                        size="small"
                        aria-label={playingAdditionalIndex === index ? "Stop" : "Listen to pronunciation"}
                        onClick={() => handlePlayAdditional(index)}
                        className="shrink-0 !rounded-full bg-[var(--color-charcoal-90)] text-[var(--color-white)] hover:bg-[var(--color-charcoal-70)] active:bg-[var(--color-charcoal-70)] focus-visible:ring-[var(--stroke-keyboard)]"
                      />
                      <div className="flex-1 min-w-0 flex flex-col gap-3">
                        <TextField
                          label="Practice name"
                          value={item.name}
                          onChange={(e) => updateAdditionalName(index, "name", e.target.value)}
                          size="small"
                          required
                        />
                        {item.showPhonetic ? (
                          <div className="animate-in fade-in duration-200">
                            <TextField
                              label="Phonetic spelling"
                              value={item.phonetic}
                              onChange={(e) => updateAdditionalName(index, "phonetic", e.target.value)}
                              size="small"
                            />
                          </div>
                        ) : (
                          <Button
                            variant="tertiary"
                            size="small"
                            onClick={() => setShowPhonetic(index, true)}
                            className="w-fit"
                          >
                            Add pronunciation
                          </Button>
                        )}
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
                  <Button variant="secondary" size="small" onClick={addPracticeSlot} className="w-fit">
                    Add practice name
                  </Button>
                </div>
              )}
            </div>
          </div>
      </Section>
    </div>
  );
}
