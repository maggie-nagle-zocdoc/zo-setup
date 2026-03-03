"use client";

import { useState, useCallback, useContext, useEffect, useRef } from "react";
import {
  Container,
  Section,
  Header,
  Button,
  TextField,
  IconButton,
  FieldLabel,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/vibezz";
import { ZoSetupStateContext } from "../zo-setup-shell";
import type { ZoPhoneLine } from "../zo-setup-shell";

const TRANSFER_TYPES = [
  "Appointment",
  "Billing",
  "Prescription",
  "Lab Results",
  "Medical Records",
  "Medical Question",
  "Pre-Visit Procedure Question",
  "Post-Visit Care",
  "Pricing",
  "External Lab Results",
  "Patient Referral",
  "Provider Referral",
] as const;

type TransferType = (typeof TRANSFER_TYPES)[number];

interface AdditionalTransfer {
  id: string;
  type: TransferType;
  number: string;
}

interface LineTransferState {
  catchAll: string;
  additional: AdditionalTransfer[];
}

const DEFAULT_LINE: ZoPhoneLine = {
  id: "default",
  name: "Main line",
  locationIds: [],
};

function getDefaultTransferState(): LineTransferState {
  return { catchAll: "", additional: [] };
}

export const TRANSFER_NUMBERS_STORAGE_KEY = "zo-setup-transfer-numbers";

function getStoredTransferState(): Record<string, LineTransferState> | null {
  if (typeof window === "undefined") return null;
  try {
    const s = sessionStorage.getItem(TRANSFER_NUMBERS_STORAGE_KEY);
    return s ? (JSON.parse(s) as Record<string, LineTransferState>) : null;
  } catch {
    return null;
  }
}

function storeTransferState(data: Record<string, LineTransferState>) {
  try {
    sessionStorage.setItem(TRANSFER_NUMBERS_STORAGE_KEY, JSON.stringify(data));
  } catch {
    // ignore
  }
}

export default function TransferNumbersTask() {
  const { phoneLines } = useContext(ZoSetupStateContext);
  const lines = phoneLines.length > 0 ? phoneLines : [DEFAULT_LINE];

  const hasRestoredRef = useRef(false);

  const [transferByLineId, setTransferByLineId] = useState<Record<string, LineTransferState>>(() => {
    const initial: Record<string, LineTransferState> = {};
    const stored = getStoredTransferState();
    lines.forEach((line) => {
      initial[line.id] = stored?.[line.id] ?? getDefaultTransferState();
    });
    return initial;
  });

  const lineIdsKey = lines.map((l) => l.id).join(",");
  useEffect(() => {
    const stored = getStoredTransferState();
    if (stored) {
      setTransferByLineId((prev) => {
        const next = { ...prev };
        lines.forEach((line) => {
          if (stored[line.id]) next[line.id] = stored[line.id];
        });
        return next;
      });
    }
  }, [lineIdsKey]);

  useEffect(() => {
    const id = setTimeout(() => {
      hasRestoredRef.current = true;
    }, 0);
    return () => clearTimeout(id);
  }, []);

  useEffect(() => {
    setTransferByLineId((prev) => {
      const next = { ...prev };
      let changed = false;
      lines.forEach((line) => {
        if (!(line.id in next)) {
          next[line.id] = getDefaultTransferState();
          changed = true;
        }
      });
      return changed ? next : prev;
    });
  }, [lines]);

  useEffect(() => {
    if (!hasRestoredRef.current) return;
    storeTransferState(transferByLineId);
  }, [transferByLineId]);

  const setCatchAll = useCallback((lineId: string, value: string) => {
    setTransferByLineId((prev) => ({
      ...prev,
      [lineId]: { ...prev[lineId], catchAll: value },
    }));
  }, []);

  const addAdditional = useCallback((lineId: string) => {
    setTransferByLineId((prev) => {
      const line = prev[lineId] ?? getDefaultTransferState();
      const usedTypes = new Set(line.additional.map((a) => a.type));
      const firstUnused = TRANSFER_TYPES.find((t) => !usedTypes.has(t)) ?? TRANSFER_TYPES[0];
      return {
        ...prev,
        [lineId]: {
          ...line,
          additional: [
            ...line.additional,
            { id: crypto.randomUUID(), type: firstUnused, number: "" },
          ],
        },
      };
    });
  }, []);

  const updateAdditional = useCallback(
    (lineId: string, transferId: string, field: "type" | "number", value: string) => {
      setTransferByLineId((prev) => {
        const line = prev[lineId];
        if (!line) return prev;
        return {
          ...prev,
          [lineId]: {
            ...line,
            additional: line.additional.map((a) =>
              a.id === transferId ? { ...a, [field]: value } : a
            ),
          },
        };
      });
    },
    []
  );

  const removeAdditional = useCallback((lineId: string, transferId: string) => {
    setTransferByLineId((prev) => {
      const line = prev[lineId];
      if (!line) return prev;
      return {
        ...prev,
        [lineId]: {
          ...line,
          additional: line.additional.filter((a) => a.id !== transferId),
        },
      };
    });
  }, []);

  return (
    <div className="flex-1 flex flex-col">
      <Container>
        <Section size="2">
          <Header
            title="Transfer numbers"
            subbody="Set where Zo transfers calls when needed. Each phone line is required to have a catch all transfer phone number."
          />
          <div className="mt-8 flex flex-col gap-8 max-w-xl">
            {lines.map((line) => {
              const state = transferByLineId[line.id] ?? getDefaultTransferState();
              const usedTypes = new Set(state.additional.map((a) => a.type));
              const availableTypes = TRANSFER_TYPES.filter((t) => !usedTypes.has(t));

              return (
                <div
                  key={line.id}
                  className="rounded-xl border border-[var(--stroke-default)] bg-[var(--background-default-white)] p-6 flex flex-col gap-6"
                >
                  <h2 className="text-[18px] leading-[24px] font-semibold text-[var(--text-default)]">
                    {line.name || "Phone line"}
                  </h2>

                  <TextField
                    label="Catch all"
                    placeholder="e.g. (555) 123-4567"
                    helperText="Phone number must be different than the number patients call"
                    value={state.catchAll}
                    onChange={(e) => setCatchAll(line.id, e.target.value)}
                    size="default"
                    required
                  />

                  <div className="flex flex-col gap-0.5">
                    <FieldLabel size="default" required={false}>
                      Additional transfer numbers
                    </FieldLabel>
                    <p className="text-[14px] leading-[20px] font-medium text-[var(--text-whisper)]">
                      Zo can route specific requests (e.g. billing, prescriptions) to the right place
                    </p>

                    <div className="mt-3 flex flex-col gap-4">
                    {state.additional.length > 0 && (
                      <ul className="flex flex-col gap-4">
                        {state.additional.map((add) => (
                          <li
                            key={add.id}
                            className="flex flex-wrap items-end gap-4 rounded-lg border border-[var(--stroke-default)] bg-[var(--background-default-greige)] p-4"
                          >
                            <div className="flex-1 min-w-[200px]">
                              <Select
                                value={add.type}
                                onValueChange={(v) =>
                                  updateAdditional(line.id, add.id, "type", v as TransferType)
                                }
                              >
                                <SelectTrigger size="small">
                                  <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent>
                                  {TRANSFER_TYPES.map((t) => (
                                    <SelectItem key={t} value={t}>
                                      {t}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="flex-1 min-w-[200px]">
                              <TextField
                                placeholder="Phone number"
                                value={add.number}
                                onChange={(e) =>
                                  updateAdditional(line.id, add.id, "number", e.target.value)
                                }
                                size="small"
                              />
                            </div>
                            <IconButton
                              icon="close"
                              size="small"
                              aria-label="Remove transfer number"
                              onClick={() => removeAdditional(line.id, add.id)}
                              className="shrink-0"
                            />
                          </li>
                        ))}
                      </ul>
                    )}

                    <Button
                      variant="secondary"
                      size="small"
                      onClick={() => addAdditional(line.id)}
                      disabled={availableTypes.length === 0}
                      className="w-fit"
                    >
                      Add transfer number
                    </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Section>
      </Container>
    </div>
  );
}
