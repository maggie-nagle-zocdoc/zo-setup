"use client";

import { useState, useCallback, useContext, useEffect, useRef } from "react";
import {
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
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
} from "@/components/vibezz";
import { ZoSetupBackContext, ZoSetupNextContext, ZoSetupStateContext } from "../zo-setup-shell";
import type { ZoPhoneLine } from "../zo-setup-shell";
import { cn } from "@/lib/utils";
import { formatPhoneInput, formatPhoneDisplay, getPhoneDigits } from "@/lib/phone";

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

/** Additional transfer: one number for a type, applied to selected phone lines */
interface AdditionalTransfer {
  id: string;
  type: TransferType;
  number: string;
  lineIds: string[];
}

interface StoredTransferState {
  byLine: Record<string, { catchAll: string }>;
  additional: AdditionalTransfer[];
}

const DEFAULT_LINE: ZoPhoneLine = {
  id: "default",
  name: "Main line",
  locationIds: [],
};

export const TRANSFER_NUMBERS_STORAGE_KEY = "zo-setup-transfer-numbers";

function getStoredTransferState(): StoredTransferState | null {
  if (typeof window === "undefined") return null;
  try {
    const s = sessionStorage.getItem(TRANSFER_NUMBERS_STORAGE_KEY);
    if (!s) return null;
    const parsed = JSON.parse(s);
    if (!parsed) return null;
    // New format: { byLine, additional }
    if (parsed.byLine && typeof parsed.byLine === "object") {
      return {
        byLine: parsed.byLine,
        additional: Array.isArray(parsed.additional) ? parsed.additional : [],
      };
    }
    // Old format: Record<string, { catchAll, additional? }> — migrate to new
    const byLine: Record<string, { catchAll: string }> = {};
    const additional: AdditionalTransfer[] = [];
    for (const [lineId, row] of Object.entries(parsed as Record<string, { catchAll?: string; additional?: { id: string; type: string; number: string }[] }>)) {
      byLine[lineId] = { catchAll: row?.catchAll ?? "" };
      const adds = row?.additional ?? [];
      for (const a of adds) {
        additional.push({
          id: a.id ?? crypto.randomUUID(),
          type: a.type as TransferType,
          number: a.number ?? "",
          lineIds: [lineId],
        });
      }
    }
    return { byLine, additional };
  } catch {
    return null;
  }
}

function storeTransferState(data: StoredTransferState) {
  try {
    sessionStorage.setItem(TRANSFER_NUMBERS_STORAGE_KEY, JSON.stringify(data));
  } catch {
    // ignore
  }
}

type Phase = "catch-all" | "additional";

export default function TransferNumbersTask() {
  const { phoneLines } = useContext(ZoSetupStateContext);
  const { setInTaskBackHandler } = useContext(ZoSetupBackContext);
  const { setInTaskNextHandler } = useContext(ZoSetupNextContext);
  const lines = phoneLines.length > 0 ? phoneLines : [DEFAULT_LINE];

  const hasRestoredRef = useRef(false);
  const [phase, setPhase] = useState<Phase>("catch-all");

  const [catchAllByLineId, setCatchAllByLineId] = useState<Record<string, string>>(() => {
    const stored = getStoredTransferState();
    const out: Record<string, string> = {};
    lines.forEach((line) => {
      out[line.id] = stored?.byLine?.[line.id]?.catchAll ?? "";
    });
    return out;
  });

  const [additionalTransfers, setAdditionalTransfers] = useState<AdditionalTransfer[]>(() => {
    const stored = getStoredTransferState();
    return stored?.additional ?? [];
  });

  const lineIdsKey = lines.map((l) => l.id).join(",");
  useEffect(() => {
    const stored = getStoredTransferState();
    if (stored) {
      setCatchAllByLineId((prev) => {
        const next = { ...prev };
        lines.forEach((line) => {
          if (stored.byLine[line.id]) next[line.id] = stored.byLine[line.id].catchAll;
        });
        return next;
      });
      setAdditionalTransfers(stored.additional);
    }
  }, [lineIdsKey]);

  useEffect(() => {
    const id = setTimeout(() => {
      hasRestoredRef.current = true;
    }, 0);
    return () => clearTimeout(id);
  }, []);

  useEffect(() => {
    setCatchAllByLineId((prev) => {
      const next = { ...prev };
      let changed = false;
      lines.forEach((line) => {
        if (!(line.id in next)) {
          next[line.id] = "";
          changed = true;
        }
      });
      return changed ? next : prev;
    });
  }, [lines]);

  useEffect(() => {
    if (!hasRestoredRef.current) return;
    storeTransferState({
      byLine: Object.fromEntries(lines.map((l) => [l.id, { catchAll: catchAllByLineId[l.id] ?? "" }])),
      additional: additionalTransfers,
    });
  }, [catchAllByLineId, additionalTransfers, lines]);

  const setCatchAll = useCallback((lineId: string, rawValue: string) => {
    setCatchAllByLineId((prev) => ({ ...prev, [lineId]: formatPhoneInput(rawValue) }));
  }, []);

  const goToAdditional = useCallback(() => {
    setPhase("additional");
  }, []);

  const goBackToCatchAll = useCallback(() => {
    setPhase("catch-all");
  }, []);

  const allCatchAllFilled = lines.every(
    (line) => getPhoneDigits(catchAllByLineId[line.id] ?? "").length >= 10
  );

  useEffect(() => {
    if (phase === "additional") {
      setInTaskBackHandler(goBackToCatchAll);
      return () => setInTaskBackHandler(null);
    }
    setInTaskBackHandler(null);
  }, [phase, goBackToCatchAll, setInTaskBackHandler]);

  useEffect(() => {
    if (phase === "catch-all" && allCatchAllFilled) {
      setInTaskNextHandler(goToAdditional);
      return () => setInTaskNextHandler(null);
    }
    setInTaskNextHandler(null);
  }, [phase, allCatchAllFilled, goToAdditional, setInTaskNextHandler]);

  // Add additional transfer: drawer state
  const [addDrawerType, setAddDrawerType] = useState<TransferType | null>(null);
  const [addDrawerNumber, setAddDrawerNumber] = useState("");
  const [addDrawerApplyToAll, setAddDrawerApplyToAll] = useState(true);
  const [addDrawerSelectedLineIds, setAddDrawerSelectedLineIds] = useState<Set<string>>(new Set());

  const openAddDrawer = useCallback((type: TransferType) => {
    setAddDrawerType(type);
    setAddDrawerNumber("");
    setAddDrawerApplyToAll(true);
    setAddDrawerSelectedLineIds(new Set(lines.map((l) => l.id)));
  }, [lines]);

  const closeAddDrawer = useCallback(() => {
    setAddDrawerType(null);
    setAddDrawerNumber("");
  }, []);

  const toggleAddDrawerLine = useCallback((lineId: string) => {
    setAddDrawerSelectedLineIds((prev) => {
      const next = new Set(prev);
      if (next.has(lineId)) next.delete(lineId);
      else next.add(lineId);
      return next;
    });
  }, []);

  const saveAddDrawer = useCallback(() => {
    if (!addDrawerType || !addDrawerNumber.trim()) return;
    const lineIds = addDrawerApplyToAll ? lines.map((l) => l.id) : Array.from(addDrawerSelectedLineIds);
    if (lineIds.length === 0) return;
    setAdditionalTransfers((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        type: addDrawerType,
        number: addDrawerNumber.trim(),
        lineIds,
      },
    ]);
    closeAddDrawer();
  }, [addDrawerType, addDrawerNumber, addDrawerApplyToAll, addDrawerSelectedLineIds, lines, closeAddDrawer]);

  const removeAdditional = useCallback((id: string) => {
    setAdditionalTransfers((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const transfersByType = TRANSFER_TYPES.map((type) => ({
    type,
    entries: additionalTransfers.filter((a) => a.type === type),
  }));

  const getLineName = (lineId: string) => lines.find((l) => l.id === lineId)?.name ?? "Phone line";

  return (
    <div className="flex-1 flex flex-col">
      <Section size="2">
          {phase === "catch-all" && (
            <>
              <p className="text-[12px] leading-[16px] font-medium tracking-[0.12px] text-[var(--text-whisper)] mb-1">
                Step 1 of 2
              </p>
              <Header
                title="Transfer numbers"
                subbody="Each phone line must have a catch-all number. You can add transfer numbers by type in the next step."
              />
            </>
          )}
          {phase === "additional" && (
            <>
              <p className="text-[12px] leading-[16px] font-medium tracking-[0.12px] text-[var(--text-whisper)] mb-1">
                Step 2 of 2
              </p>
              <Header
                title="Additional transfer numbers"
                subbody="Add numbers by type to route specific requests (e.g. billing, prescriptions). Apply a number to all phone lines or select which lines."
              />
            </>
          )}

          <div className="mt-8 flex flex-col gap-8">
            {phase === "catch-all" && (
              <>
                <div className="rounded-xl border border-[var(--stroke-default)] bg-[var(--background-default-white)] overflow-hidden">
                  <table className="w-full border-collapse" role="table">
                    <thead>
                      <tr className="border-b border-[var(--stroke-default)] bg-[var(--background-default-greige)]">
                        <th className="text-left text-[14px] leading-[20px] font-semibold text-[var(--text-default)] px-4 py-3">
                          Phone line
                        </th>
                        <th className="text-left text-[14px] leading-[20px] font-semibold text-[var(--text-default)] px-4 py-3">
                          Catch-all number
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {lines.map((line) => (
                        <tr
                          key={line.id}
                          className="border-b border-[var(--stroke-default)] last:border-b-0"
                        >
                          <td className="px-4 py-3 text-[14px] leading-[20px] text-[var(--text-default)]">
                            {line.name || "Phone line"}
                          </td>
                          <td className="px-4 py-3">
                            <input
                              type="tel"
                              placeholder="e.g. (555) 123-4567"
                              value={catchAllByLineId[line.id] ?? ""}
                              onChange={(e) => setCatchAll(line.id, e.target.value)}
                              inputMode="numeric"
                              autoComplete="tel"
                              className="w-full min-w-[200px] h-9 px-3 rounded border border-[var(--stroke-ui)] bg-[var(--background-default-white)] text-[14px] leading-[20px] text-[var(--text-default)] placeholder:text-[var(--text-whisper)] focus:outline-none focus:border-[var(--stroke-charcoal)]"
                              aria-label={`Catch-all for ${line.name || "phone line"}`}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <p className="px-4 py-2 text-[14px] leading-[20px] text-[var(--text-whisper)] border-t border-[var(--stroke-default)]">
                    Phone number must be different than the number patients call.
                  </p>
                </div>
              </>
            )}

            {phase === "additional" && (
              <div className="flex flex-col gap-8 animate-in fade-in duration-300">
                {transfersByType.map(({ type, entries }) => (
                  <div
                    key={type}
                    className="rounded-xl border border-[var(--stroke-default)] bg-[var(--background-default-white)] p-6 flex flex-col gap-4"
                  >
                    <h2 className="text-[16px] leading-[22px] font-semibold text-[var(--text-default)]">
                      {type}
                    </h2>
                    {entries.length > 0 && (
                      <ul className="flex flex-col gap-3">
                        {entries.map((entry) => (
                          <li
                            key={entry.id}
                            className="flex flex-wrap items-center gap-3 rounded-lg border border-[var(--stroke-default)] bg-[var(--background-default-greige)] px-4 py-3"
                          >
                            <span className="text-[14px] leading-[20px] font-medium text-[var(--text-default)]">
                              {formatPhoneDisplay(entry.number)}
                            </span>
                            <span className="text-[14px] leading-[20px] text-[var(--text-secondary)]">
                              {entry.lineIds.length === lines.length
                                ? "All phone lines"
                                : entry.lineIds.map(getLineName).join(", ")}
                            </span>
                            <IconButton
                              icon="close"
                              size="small"
                              aria-label={`Remove ${entry.number}`}
                              onClick={() => removeAdditional(entry.id)}
                              className="shrink-0 ml-auto"
                            />
                          </li>
                        ))}
                      </ul>
                    )}
                    <Button
                      variant="secondary"
                      size="small"
                      onClick={() => openAddDrawer(type)}
                      className="w-fit"
                    >
                      Add number
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Drawer open={addDrawerType !== null} onOpenChange={(open) => !open && closeAddDrawer()}>
            <DrawerContent showCloseButton>
              <DrawerHeader>
                <DrawerTitle>Add transfer number – {addDrawerType ?? ""}</DrawerTitle>
                <DrawerDescription>
                  Enter the phone number and choose to apply it to all phone lines or select specific lines.
                </DrawerDescription>
              </DrawerHeader>
              <DrawerBody className="flex flex-col gap-6">
                <div className="flex flex-col gap-2">
                  <FieldLabel size="small">Phone number</FieldLabel>
                  <TextField
                    type="tel"
                    placeholder="e.g. (555) 123-4567"
                    value={addDrawerNumber}
                    onChange={(e) => setAddDrawerNumber(formatPhoneInput(e.target.value))}
                    size="small"
                    inputMode="numeric"
                    autoComplete="tel"
                  />
                </div>
                <div className="flex flex-col gap-3">
                  <FieldLabel size="small">Apply to</FieldLabel>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="applyTo"
                      checked={addDrawerApplyToAll}
                      onChange={() => {
                        setAddDrawerApplyToAll(true);
                        setAddDrawerSelectedLineIds(new Set(lines.map((l) => l.id)));
                      }}
                      className="rounded-full border-[var(--stroke-ui)]"
                    />
                    <span className="text-[14px] leading-[20px] text-[var(--text-default)]">
                      All phone lines
                    </span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="applyTo"
                      checked={!addDrawerApplyToAll}
                      onChange={() => setAddDrawerApplyToAll(false)}
                      className="rounded-full border-[var(--stroke-ui)]"
                    />
                    <span className="text-[14px] leading-[20px] text-[var(--text-default)]">
                      Select phone lines
                    </span>
                  </label>
                  {!addDrawerApplyToAll && (
                    <div className="flex flex-col gap-2 pl-6 pt-1">
                      {lines.map((line) => (
                        <label
                          key={line.id}
                          className={cn(
                            "flex items-center gap-2 cursor-pointer rounded-md px-2 py-1.5",
                            addDrawerSelectedLineIds.has(line.id)
                              ? "bg-[var(--state-hover)]"
                              : ""
                          )}
                        >
                          <input
                            type="checkbox"
                            checked={addDrawerSelectedLineIds.has(line.id)}
                            onChange={() => toggleAddDrawerLine(line.id)}
                            className="rounded border-[var(--stroke-ui)]"
                          />
                          <span className="text-[14px] leading-[20px] text-[var(--text-default)]">
                            {line.name || "Phone line"}
                          </span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              </DrawerBody>
              <DrawerFooter>
                <Button
                  variant="primary"
                  size="small"
                  onClick={saveAddDrawer}
                  disabled={getPhoneDigits(addDrawerNumber).length < 10 || (!addDrawerApplyToAll && addDrawerSelectedLineIds.size === 0)}
                >
                  Save
                </Button>
              </DrawerFooter>
            </DrawerContent>
          </Drawer>
      </Section>
    </div>
  );
}
