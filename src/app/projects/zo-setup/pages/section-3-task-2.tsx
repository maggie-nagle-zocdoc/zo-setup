"use client";

import { useState, useEffect, useRef, useContext } from "react";
import {
  Section,
  Header,
  Flag,
  Checkbox,
  Button,
  FieldLabel,
  linkVariants,
  TextField,
  RadioGroup,
  RadioField,
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  DrawerFooter,
  DrawerTitle,
} from "@/components/vibezz";
import { ZoSetupStateContext } from "../zo-setup-shell";
import type { ZoPhoneLine } from "../zo-setup-shell";
import { cn } from "@/lib/utils";

export const PRE_CALL_STORAGE_KEY = "zo-setup-pre-call";

export type PreCallMessageId =
  | "recordingDisclaimer"
  | "emergencyDisclaimer"
  | "aiDisclaimer"
  | "spanishInstruction";

export interface PreCallMessageConfig {
  enabled: boolean;
  /** Empty = apply to all phone lines */
  phoneLineIds: string[];
}

export interface PreCallState {
  recordingDisclaimer: PreCallMessageConfig;
  emergencyDisclaimer: PreCallMessageConfig;
  aiDisclaimer: PreCallMessageConfig;
  spanishInstruction: PreCallMessageConfig;
}

const MESSAGE_CONFIG: Record<
  PreCallMessageId,
  { label: string; text: string; defaultEnabled: boolean }
> = {
  recordingDisclaimer: {
    label: "Recording disclaimer",
    text: "This call may be recorded for monitoring purposes",
    defaultEnabled: true,
  },
  emergencyDisclaimer: {
    label: "Emergency disclaimer",
    text: "If this is an emergency, please hang up and dial 911",
    defaultEnabled: true,
  },
  aiDisclaimer: {
    label: "AI disclaimer",
    text: "You may be speaking to an AI assistant",
    defaultEnabled: false,
  },
  spanishInstruction: {
    label: "Spanish instruction",
    text: "Para Español, presione dos",
    defaultEnabled: false,
  },
};

function buildDefaultState(_lines: ZoPhoneLine[]): PreCallState {
  return {
    recordingDisclaimer: { enabled: true, phoneLineIds: [] },
    emergencyDisclaimer: { enabled: true, phoneLineIds: [] },
    aiDisclaimer: { enabled: false, phoneLineIds: [] },
    spanishInstruction: { enabled: false, phoneLineIds: [] },
  };
}

function getStoredPreCall(lines: ZoPhoneLine[]): PreCallState | null {
  if (typeof window === "undefined") return null;
  try {
    const s = sessionStorage.getItem(PRE_CALL_STORAGE_KEY);
    if (!s) return null;
    const parsed = JSON.parse(s) as Record<string, unknown>;
    const defaultState = buildDefaultState(lines);
    const state: PreCallState = { ...defaultState };
    (Object.keys(defaultState) as PreCallMessageId[]).forEach((key) => {
      const item = parsed[key];
      if (item && typeof item === "object" && "enabled" in item && "phoneLineIds" in item) {
        const arr = (item as { phoneLineIds: unknown }).phoneLineIds;
        state[key] = {
          enabled: (item as { enabled: boolean }).enabled,
          phoneLineIds: Array.isArray(arr) ? arr.filter((id): id is string => typeof id === "string") : [],
        };
      }
    });
    return state;
  } catch {
    return null;
  }
}

function storePreCall(data: PreCallState) {
  try {
    sessionStorage.setItem(PRE_CALL_STORAGE_KEY, JSON.stringify(data));
  } catch {
    // ignore
  }
}

export default function PreCallMessagesTask() {
  const { phoneLines } = useContext(ZoSetupStateContext);
  const [state, setState] = useState<PreCallState>(() => buildDefaultState([]));
  const hasRestoredRef = useRef(false);

  const lines = phoneLines.length > 0 ? phoneLines : [];

  useEffect(() => {
    if (lines.length === 0) return;
    const stored = getStoredPreCall(lines);
    if (stored) setState(stored);
    else setState(buildDefaultState(lines));
  }, [lines.length]);

  useEffect(() => {
    const id = setTimeout(() => {
      hasRestoredRef.current = true;
    }, 0);
    return () => clearTimeout(id);
  }, []);

  useEffect(() => {
    if (!hasRestoredRef.current || lines.length === 0) return;
    storePreCall(state);
  }, [state, lines.length]);

  const setMessageEnabled = (id: PreCallMessageId, enabled: boolean) => {
    setState((prev) => ({
      ...prev,
      [id]: { ...prev[id], enabled },
    }));
  };

  const setMessageLineIds = (id: PreCallMessageId, phoneLineIds: string[]) => {
    setState((prev) => ({
      ...prev,
      [id]: { ...prev[id], phoneLineIds },
    }));
  };

  const [drawerMessageId, setDrawerMessageId] = useState<PreCallMessageId | null>(null);
  const openDrawer = (id: PreCallMessageId) => setDrawerMessageId(id);
  const closeDrawer = () => setDrawerMessageId(null);

  const drawerConfig = drawerMessageId ? state[drawerMessageId] : null;
  /** In-drawer: "all" = apply to all lines (store []), "select" = use phoneLineIds */
  const drawerApplyTo: "all" | "select" =
    drawerConfig && lines.length > 0
      ? drawerConfig.phoneLineIds.length === 0
        ? "all"
        : "select"
      : "all";
  const drawerLineIds =
    drawerMessageId && drawerConfig
      ? drawerConfig.phoneLineIds.length === 0
        ? lines.map((l) => l.id)
        : drawerConfig.phoneLineIds
      : [];

  const setDrawerApplyTo = (value: "all" | "select") => {
    if (!drawerMessageId) return;
    setMessageLineIds(
      drawerMessageId,
      value === "all" ? [] : lines.length > 0 ? lines.map((l) => l.id) : []
    );
  };

  const saveDrawerLines = () => {
    if (!drawerMessageId) return;
    const applyAll = drawerLineIds.length === lines.length;
    setMessageLineIds(drawerMessageId, applyAll ? [] : drawerLineIds);
    closeDrawer();
  };

  const toggleDrawerLine = (lineId: string) => {
    if (!drawerMessageId) return;
    setState((prev) => {
      const current = prev[drawerMessageId].phoneLineIds;
      const wasAll = current.length === 0;
      const effective = wasAll ? lines.map((l) => l.id) : current;
      const next = effective.includes(lineId)
        ? effective.filter((id) => id !== lineId)
        : [...effective, lineId];
      return {
        ...prev,
        [drawerMessageId]: {
          ...prev[drawerMessageId],
          phoneLineIds: next.length === lines.length ? [] : next,
        },
      };
    });
  };

  return (
    <div className="flex-1 flex flex-col">
      <Section size="2">
        <Header
          title="Pre-call messages"
          subbody="These messages play before the call connects. You can enable or disable each one and select which phone lines they apply to."
        />

        <div className="mt-8 flex flex-col gap-8">
          <Flag color="blue" showIcon>
            Disclaimer information may be required in certain states. Check on your practice&apos;s requirements before turning disclaimers off.
          </Flag>
          <div className="flex flex-col gap-4">
            {(Object.keys(MESSAGE_CONFIG) as PreCallMessageId[]).map((id) => {
              const config = MESSAGE_CONFIG[id];
              const msgState = state[id];
              return (
                <div
                  key={id}
                  className={cn(
                    "rounded-2xl border p-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6 transition-all duration-150",
                    msgState.enabled
                      ? "border-[var(--stroke-charcoal)] bg-[var(--state-selected-light)]"
                      : "border-[var(--stroke-default)] bg-[var(--background-default-white)]"
                  )}
                >
                  <div className="flex-1 min-w-0 flex flex-col gap-1">
                    <div className="flex items-center gap-3">
                      <Checkbox
                        size="small"
                        id={`precall-${id}`}
                        checked={msgState.enabled}
                        onCheckedChange={(checked) =>
                          setMessageEnabled(id, checked === true)
                        }
                      />
                      <label
                        htmlFor={`precall-${id}`}
                        className="text-[16px] leading-[26px] font-semibold text-[var(--text-default)] cursor-pointer"
                      >
                        {config.label}
                      </label>
                    </div>
                    <p className="text-[14px] leading-[20px] text-[var(--text-whisper)] pl-7">
                      &ldquo;{config.text}&rdquo;
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => openDrawer(id)}
                    className={cn(
                      linkVariants({ size: "small" }),
                      "p-0 border-0 bg-transparent"
                    )}
                  >
                    Edit
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        <Drawer open={drawerMessageId !== null} onOpenChange={(open) => !open && closeDrawer()}>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>
                {drawerMessageId
                  ? `Edit ${MESSAGE_CONFIG[drawerMessageId].label.toLowerCase()}`
                  : ""}
              </DrawerTitle>
            </DrawerHeader>
            <DrawerBody className="flex flex-col gap-6">
              {drawerMessageId && (
                <>
                  <div className="flex flex-col gap-2">
                    <FieldLabel size="default" required>
                      Message preview
                    </FieldLabel>
                    <TextField
                      value={MESSAGE_CONFIG[drawerMessageId].text}
                      readOnly
                      size="default"
                      className="bg-[var(--background-default-greige)]"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <FieldLabel size="default" required>
                      Select Zo phone lines
                    </FieldLabel>
                    <p className="text-[14px] leading-[20px] text-[var(--text-whisper)]">
                      Where should this message apply?
                    </p>
                    <RadioGroup
                      value={drawerApplyTo}
                      onValueChange={(v) => setDrawerApplyTo(v as "all" | "select")}
                      className="flex flex-col gap-2"
                    >
                      <RadioField
                        value="all"
                        label="All phone lines (recommended)"
                        description={undefined}
                      />
                      <RadioField
                        value="select"
                        label="Select phone lines"
                        description={undefined}
                      />
                    </RadioGroup>
                    {drawerApplyTo === "select" && lines.length > 0 && (
                      <div className="border-t border-[var(--stroke-default)] pt-4 mt-2 flex flex-col gap-2">
                        {lines.map((line) => {
                          const isChecked =
                            drawerLineIds.length === 0 || drawerLineIds.includes(line.id);
                          return (
                            <div key={line.id} className="flex items-center gap-3">
                              <Checkbox
                                size="small"
                                id={`drawer-line-${line.id}`}
                                checked={isChecked}
                                onCheckedChange={() => toggleDrawerLine(line.id)}
                              />
                              <label
                                htmlFor={`drawer-line-${line.id}`}
                                className="text-[14px] leading-[20px] text-[var(--text-default)] cursor-pointer"
                              >
                                {line.name || "Phone line"}
                              </label>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </>
              )}
            </DrawerBody>
            <DrawerFooter>
              <Button variant="ghost" size="small">
                Preview voice
              </Button>
              <Button variant="primary" size="small" onClick={saveDrawerLines}>
                Save
              </Button>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      </Section>
    </div>
  );
}
