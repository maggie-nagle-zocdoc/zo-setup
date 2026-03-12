"use client";

import { useState, useEffect, useRef, useContext, useCallback } from "react";
import {
  Section,
  Header,
  RadioGroup,
  RadioCard,
  IconButton,
  FieldLabel,
} from "@/components/vibezz";
import { ZoSetupContinueValidationContext } from "../zo-setup-shell";

export const VOICE_STORAGE_KEY = "zo-setup-voice";

type VoiceOption = "female" | "male";

interface StoredVoice {
  voice: VoiceOption;
}

function getStoredVoice(): StoredVoice | null {
  if (typeof window === "undefined") return null;
  try {
    const s = sessionStorage.getItem(VOICE_STORAGE_KEY);
    if (!s) return null;
    const parsed = JSON.parse(s) as StoredVoice;
    if (parsed.voice === "female" || parsed.voice === "male") {
      return { voice: parsed.voice };
    }
    return null;
  } catch {
    return null;
  }
}

function storeVoice(data: StoredVoice) {
  try {
    sessionStorage.setItem(VOICE_STORAGE_KEY, JSON.stringify(data));
  } catch {
    // ignore
  }
}

const DURATION_MS = 5000;

function formatTime(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  return `0:${seconds.toString().padStart(2, "0")}`;
}

export default function VoiceOfZoTask() {
  const { setContinueValidationHandler } = useContext(ZoSetupContinueValidationContext);
  const [voice, setVoice] = useState<VoiceOption>("female");
  const [isPlaying, setIsPlaying] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [continueError, setContinueError] = useState<string | null>(null);
  const hasRestoredRef = useRef(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const stored = getStoredVoice();
    if (stored) setVoice(stored.voice);
  }, []);

  useEffect(() => {
    const id = setTimeout(() => {
      hasRestoredRef.current = true;
    }, 0);
    return () => clearTimeout(id);
  }, []);

  useEffect(() => {
    if (!hasRestoredRef.current) return;
    storeVoice({ voice });
  }, [voice]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const handlePlay = useCallback(() => {
    if (isPlaying) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = null;
      setIsPlaying(false);
      setElapsedMs(0);
      return;
    }
    setIsPlaying(true);
    setElapsedMs(0);
    intervalRef.current = setInterval(() => {
      setElapsedMs((prev) => {
        const next = prev + 100;
        if (next >= DURATION_MS) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          intervalRef.current = null;
          setIsPlaying(false);
          return DURATION_MS;
        }
        return next;
      });
    }, 100);
  }, [isPlaying]);

  const validateContinue = useCallback(() => {
    if (!voice) {
      setContinueError("Select a voice to continue.");
      return false;
    }
    setContinueError(null);
    return true;
  }, [voice]);

  useEffect(() => {
    setContinueValidationHandler(validateContinue);
    return () => setContinueValidationHandler(null);
  }, [validateContinue, setContinueValidationHandler]);

  return (
    <div className="flex-1 flex flex-col">
      <Section size="2">
        <Header title="Voice of Zo" subbody="Choose how Zo sounds when speaking to callers." />

        <div className="mt-8 flex flex-col gap-8">
          <div className="flex flex-col gap-4">
            <FieldLabel size="default" required>
              Select a voice
            </FieldLabel>
            <RadioGroup
              value={voice}
              onValueChange={(value) => {
                setVoice(value as VoiceOption);
                setContinueError(null);
              }}
              className="w-full"
              rootClassName="w-full grid grid-cols-1 sm:grid-cols-2 gap-4"
            >
              <RadioCard value="female" label="Female (Default)" layout="wide" className="w-full min-w-0" />
              <RadioCard value="male" label="Male" layout="wide" className="w-full min-w-0" />
            </RadioGroup>
          </div>

          <div className="rounded-2xl border border-[var(--stroke-default)] bg-[var(--background-default-white)] p-8 flex flex-col gap-0">
            <div className="flex flex-col gap-2">
              <FieldLabel size="default" required>
                Preview voice
              </FieldLabel>
              <div className="rounded-full border border-[var(--stroke-default)] bg-[var(--background-default-greige)] px-6 py-4 flex items-center gap-4">
                <IconButton
                  icon={isPlaying ? "stop" : "play_arrow"}
                  size="small"
                  aria-label={isPlaying ? "Stop" : "Listen to voice preview"}
                  onClick={handlePlay}
                  className="shrink-0 !rounded-full bg-[var(--color-charcoal-90)] text-[var(--color-white)] hover:bg-[var(--color-charcoal-70)] active:bg-[var(--color-charcoal-70)] focus-visible:ring-[var(--stroke-keyboard)]"
                />
                <span className="text-[14px] leading-[20px] text-[var(--text-whisper)]">
                  {formatTime(elapsedMs)}/{formatTime(DURATION_MS)}
                </span>
                <div className="flex-1 h-1 rounded-full bg-[var(--stroke-default)] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[var(--stroke-charcoal)] transition-all duration-100"
                    style={{ width: `${(elapsedMs / DURATION_MS) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {continueError && (
            <p className="text-[14px] leading-[20px] font-medium text-[var(--text-error)]" role="alert">
              {continueError}
            </p>
          )}
        </div>
      </Section>
    </div>
  );
}
