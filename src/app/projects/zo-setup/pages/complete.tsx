"use client";

import { useState, useEffect, useRef } from "react";
import NextLink from "next/link";
import {
  Section,
  Header,
  Button,
  TextField,
  IconButton,
  FieldLabel,
} from "@/components/vibezz";
import { formatPhoneInput, getPhoneDigits } from "@/lib/phone";

export const TEST_CALL_NUMBERS_STORAGE_KEY = "zo-setup-test-call-numbers";

function getStoredTestCallNumbers(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const s = sessionStorage.getItem(TEST_CALL_NUMBERS_STORAGE_KEY);
    if (!s) return [];
    const parsed = JSON.parse(s);
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === "string") : [];
  } catch {
    return [];
  }
}

function storeTestCallNumbers(numbers: string[]) {
  try {
    sessionStorage.setItem(TEST_CALL_NUMBERS_STORAGE_KEY, JSON.stringify(numbers));
  } catch {
    // ignore
  }
}

export default function CompletePage() {
  const [testNumbers, setTestNumbers] = useState<string[]>([]);
  const [newNumber, setNewNumber] = useState("");
  const [addError, setAddError] = useState<string | null>(null);
  const hasRestoredRef = useRef(false);

  useEffect(() => {
    setTestNumbers(getStoredTestCallNumbers());
    hasRestoredRef.current = true;
  }, []);

  useEffect(() => {
    if (!hasRestoredRef.current) return;
    storeTestCallNumbers(testNumbers);
  }, [testNumbers]);

  const handleAddNumber = () => {
    setAddError(null);
    const digits = getPhoneDigits(newNumber);
    if (digits.length < 10) {
      setAddError("Enter a valid 10-digit phone number.");
      return;
    }
    const formatted = formatPhoneInput(newNumber);
    if (testNumbers.includes(formatted)) {
      setAddError("This number is already in your list.");
      return;
    }
    setTestNumbers((prev) => [...prev, formatted]);
    setNewNumber("");
  };

  const removeNumber = (index: number) => {
    setTestNumbers((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="flex-1 flex flex-col">
      <Section size="2">
        {/* Hero: validation wait + team outreach */}
        <div className="rounded-2xl border border-[var(--stroke-default)] bg-[var(--background-default-white)] p-8 flex flex-col gap-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
            <Header
              title="Your configuration is submitted"
              subbody="The Zocdoc team will validate your configurations. This typically takes 2–5 business days. Our team will reach out if we have any questions."
            />
            <NextLink href="/projects/zo-setup/section-3-task-5" className="shrink-0">
              <Button variant="secondary" size="default">
                Edit setup
              </Button>
            </NextLink>
          </div>
        </div>

        {/* What happens next */}
        <div className="mt-10 flex flex-col gap-4">
          <h2 className="text-[18px] leading-[24px] font-semibold text-[var(--text-default)]">
            What happens next
          </h2>
          <ul className="list-disc list-inside flex flex-col gap-2 text-[16px] leading-[26px] text-[var(--text-default)]">
            <li>We&apos;ll set up Zo phone numbers for each of your phone lines.</li>
            <li>You&apos;ll be able to test the call experience.</li>
            <li>You&apos;ll then route patient calls to the new Zo phone number so patients can get the new experience.</li>
            <li>You&apos;ll receive a dashboard from us to monitor your call outcomes.</li>
          </ul>
        </div>

        {/* Test call numbers */}
        <div className="mt-10 flex flex-col gap-4">
          <h2 className="text-[18px] leading-[24px] font-semibold text-[var(--text-default)]">
            Test call numbers
          </h2>
          <p className="text-[14px] leading-[20px] text-[var(--text-whisper)]">
            Add phone numbers you can use to test the call experience without scheduling appointments.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:gap-4">
            <div className="flex-1 min-w-0 max-w-xs flex flex-col gap-2">
              <FieldLabel size="small" className="font-medium">
                Phone number
              </FieldLabel>
              <TextField
                type="tel"
                placeholder="(555) 123-4567"
                value={newNumber}
                onChange={(e) => {
                  setNewNumber(formatPhoneInput(e.target.value));
                  setAddError(null);
                }}
                size="default"
                inputMode="numeric"
                autoComplete="tel"
                state={addError ? "error" : "default"}
                errorMessage={addError ?? undefined}
              />
            </div>
            <Button variant="secondary" size="default" onClick={handleAddNumber}>
              Add number
            </Button>
          </div>
          {testNumbers.length > 0 && (
            <ul className="flex flex-col gap-2 mt-2">
              {testNumbers.map((num, index) => (
                <li
                  key={`${num}-${index}`}
                  className="flex items-center justify-between gap-2 py-2 px-3 rounded-lg border border-[var(--stroke-default)] bg-[var(--background-default-white)]"
                >
                  <span className="text-[14px] leading-[20px] text-[var(--text-default)]">{num}</span>
                  <IconButton
                    icon="delete"
                    size="small"
                    aria-label={`Remove ${num}`}
                    onClick={() => removeNumber(index)}
                  />
                </li>
              ))}
            </ul>
          )}
        </div>
      </Section>
    </div>
  );
}
