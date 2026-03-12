"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import NextLink from "next/link";
import {
  Section,
  Header,
  Button,
  TextField,
  IconButton,
  FieldLabel,
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
  Flag,
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
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [draftNumbers, setDraftNumbers] = useState<string[]>([]);
  const hasRestoredRef = useRef(false);

  useEffect(() => {
    setTestNumbers(getStoredTestCallNumbers());
    hasRestoredRef.current = true;
  }, []);

  useEffect(() => {
    if (!hasRestoredRef.current) return;
    storeTestCallNumbers(testNumbers);
  }, [testNumbers]);

  const openDrawer = useCallback(() => {
    setDraftNumbers(testNumbers.length > 0 ? [...testNumbers] : [""]);
    setDrawerOpen(true);
  }, [testNumbers]);

  const closeDrawer = useCallback(() => {
    setDrawerOpen(false);
  }, []);

  const saveDrawer = useCallback(() => {
    const valid = draftNumbers
      .map((v) => formatPhoneInput(v))
      .filter((formatted) => getPhoneDigits(formatted).length >= 10);
    const deduped = Array.from(new Set(valid));
    setTestNumbers(deduped);
    closeDrawer();
  }, [draftNumbers, closeDrawer]);

  const updateDraftAt = useCallback((index: number, value: string) => {
    setDraftNumbers((prev) =>
      prev.map((v, i) => (i === index ? formatPhoneInput(value) : v))
    );
  }, []);

  const removeDraftAt = useCallback((index: number) => {
    setDraftNumbers((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const addDraftRow = useCallback(() => {
    setDraftNumbers((prev) => [...prev, ""]);
  }, []);

  return (
    <div className="flex-1 flex flex-col">
      <Section size="2">
        {/* Hero: validation wait + team outreach */}
        <div className="rounded-2xl border border-[var(--stroke-default)] bg-[var(--background-default-white)] p-8 flex flex-col gap-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
            <Header
              title="Your Zo experience is in the works!"
              subbody="This typically takes 1–3 business days. Zocdoc will validate your configurations and reach out if we need more information"
            />
            <NextLink href="/projects/zo-setup/section-3-task-5" className="shrink-0">
              <Button variant="secondary" size="default">
                Edit setup
              </Button>
            </NextLink>
          </div>
        </div>

        {/* What happens next */}
        <div className="mt-6 rounded-2xl border border-[var(--stroke-default)] bg-[var(--background-default-white)] p-8 flex flex-col gap-4">
          <h2 className="text-[18px] leading-[24px] font-semibold text-[var(--text-default)] md:text-[20px] md:leading-[28px]">
            What happens next
          </h2>
          <ol className="list-decimal list-inside flex flex-col gap-3 text-[16px] leading-[26px] text-[var(--text-default)]">
            <li>Zocdoc will create Zo phone numbers for each of your phone lines</li>
            <li>Test the Zo call experience</li>
            <li>Route patient calls to the new Zo phone number to enable the new experience</li>
            <li>Monitor your Zo dashboard to view call performance and outcomes</li>
          </ol>
        </div>

        {/* Test call numbers */}
        <div className="mt-6 rounded-2xl border border-[var(--stroke-default)] bg-[var(--background-default-white)] p-8 flex flex-col gap-4">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
            <div>
              <h2 className="text-[18px] leading-[24px] font-semibold text-[var(--text-default)] md:text-[20px] md:leading-[28px]">
                Add test call numbers
              </h2>
              <p className="text-[14px] leading-[20px] text-[var(--text-whisper)] mt-1">
                Phone numbers that can be used to test call Zo without scheduling real appointments.
              </p>
            </div>
            <Button variant="secondary" size="default" onClick={openDrawer} className="shrink-0">
              Edit
            </Button>
          </div>
          {testNumbers.length > 0 ? (
            <ul className="flex flex-col gap-2">
              {testNumbers.map((num, index) => (
                <li
                  key={`${num}-${index}`}
                  className="text-[16px] leading-[26px] text-[var(--text-default)]"
                >
                  {num}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-[14px] leading-[20px] text-[var(--text-whisper)]">
              No numbers added yet.
            </p>
          )}
        </div>
      </Section>

      <Drawer open={drawerOpen} onOpenChange={(open) => !open && closeDrawer()}>
        <DrawerContent showCloseButton>
          <DrawerHeader>
            <DrawerTitle>Test call numbers</DrawerTitle>
            <DrawerDescription>
              Enter phone numbers your team will use to test Zo. Calling from any of these numbers will avoid scheduling real appointments.
            </DrawerDescription>
          </DrawerHeader>
          <DrawerBody className="flex flex-col gap-6">
            <Flag color="greige" showIcon>
              Test call numbers apply to all your Zo phone lines.
            </Flag>
            <div className="flex flex-col gap-2">
              <FieldLabel size="small" className="font-medium">
                Phone number(s)
              </FieldLabel>
              <ul className="flex flex-col gap-3">
                {draftNumbers.map((value, index) => (
                  <li key={index} className="flex gap-2 items-center">
                    <TextField
                      type="tel"
                      placeholder="(555) 123-4567"
                      value={value}
                      onChange={(e) => updateDraftAt(index, e.target.value)}
                      size="default"
                      inputMode="numeric"
                      autoComplete="tel"
                      className="flex-1 min-w-0"
                    />
                    <IconButton
                      icon="delete"
                      size="small"
                      aria-label={`Remove number ${index + 1}`}
                      onClick={() => removeDraftAt(index)}
                    />
                  </li>
                ))}
              </ul>
              <Button variant="tertiary" size="default" onClick={addDraftRow} className="w-fit">
                Add phone number
              </Button>
            </div>
          </DrawerBody>
          <DrawerFooter>
            <Button variant="primary" size="default" onClick={saveDrawer}>
              Save
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
