"use client";

import { useState, useCallback, useContext, useEffect, useRef, useMemo } from "react";
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
  Flag,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
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

function buildDefaultAdditionalTransfers(defaultLineIds: string[]): AdditionalTransfer[] {
  return TRANSFER_TYPES.map((type) => ({
    id: crypto.randomUUID(),
    type,
    number: "",
    lineIds: defaultLineIds,
  }));
}

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
type AdditionalSortKey = "type" | "phoneLines";
type SortDirection = "asc" | "desc";

export default function TransferNumbersTask() {
  const { phoneLines } = useContext(ZoSetupStateContext);
  const { setInTaskBackHandler } = useContext(ZoSetupBackContext);
  const { setInTaskNextHandler } = useContext(ZoSetupNextContext);
  const lines = phoneLines.length > 0 ? phoneLines : [DEFAULT_LINE];

  const hasRestoredRef = useRef(false);
  const [phase, setPhase] = useState<Phase>("catch-all");
  const [catchAllContinueError, setCatchAllContinueError] = useState<string | null>(null);

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
    if (stored?.additional && stored.additional.length > 0) return stored.additional;
    return buildDefaultAdditionalTransfers(lines.map((l) => l.id));
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
      setAdditionalTransfers(
        stored.additional.length > 0
          ? stored.additional
          : buildDefaultAdditionalTransfers(lines.map((l) => l.id))
      );
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
    const validLineIds = new Set(lines.map((l) => l.id));
    const fallbackLineIds = lines.map((l) => l.id);
    setAdditionalTransfers((prev) => {
      let changed = false;
      const next = prev.map((entry) => {
        const filtered = entry.lineIds.filter((id) => validLineIds.has(id));
        if (filtered.length === entry.lineIds.length && filtered.length > 0) return entry;
        changed = true;
        return { ...entry, lineIds: filtered.length > 0 ? filtered : fallbackLineIds };
      });
      return changed ? next : prev;
    });
  }, [lineIdsKey, lines]);

  useEffect(() => {
    if (!hasRestoredRef.current) return;
    storeTransferState({
      byLine: Object.fromEntries(lines.map((l) => [l.id, { catchAll: catchAllByLineId[l.id] ?? "" }])),
      additional: additionalTransfers,
    });
  }, [catchAllByLineId, additionalTransfers, lines]);

  const setCatchAll = useCallback((lineId: string, rawValue: string) => {
    setCatchAllContinueError(null);
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
    if (phase === "catch-all") {
      setInTaskNextHandler(() => {
        if (!allCatchAllFilled) {
          setCatchAllContinueError("Add a valid catch-all number for each phone line to continue.");
          return;
        }
        setCatchAllContinueError(null);
        goToAdditional();
      });
      return () => setInTaskNextHandler(null);
    }
    setInTaskNextHandler(null);
  }, [phase, allCatchAllFilled, goToAdditional, setInTaskNextHandler]);

  // Add additional transfer: drawer state
  const [addDrawerOpen, setAddDrawerOpen] = useState(false);
  const [addDrawerType, setAddDrawerType] = useState<TransferType | "">("");
  const [addDrawerNumber, setAddDrawerNumber] = useState("");
  const [addDrawerPhoneLines, setAddDrawerPhoneLines] = useState<string>("__all__");
  const [addDrawerErrors, setAddDrawerErrors] = useState<{
    type?: string;
    number?: string;
    phoneLines?: string;
  }>({});

  const openAddDrawer = useCallback(() => {
    setAddDrawerOpen(true);
    setAddDrawerType("");
    setAddDrawerNumber("");
    setAddDrawerPhoneLines("__all__");
    setAddDrawerErrors({});
  }, []);

  const closeAddDrawer = useCallback(() => {
    setAddDrawerOpen(false);
    setAddDrawerType("");
    setAddDrawerNumber("");
    setAddDrawerPhoneLines("__all__");
    setAddDrawerErrors({});
  }, []);

  const saveAddDrawer = useCallback(() => {
    const errors: { type?: string; number?: string; phoneLines?: string } = {};
    if (!addDrawerType) errors.type = "Transfer type is required.";
    const digits = getPhoneDigits(addDrawerNumber);
    if (digits.length === 0) errors.number = "Phone number is required.";
    else if (digits.length < 10) errors.number = "Enter a valid phone number.";
    if (!addDrawerPhoneLines) errors.phoneLines = "Phone lines is required.";

    if (Object.keys(errors).length > 0) {
      setAddDrawerErrors(errors);
      return;
    }

    const selectedType = addDrawerType as TransferType;
    const lineIds = addDrawerPhoneLines === "__all__" ? lines.map((l) => l.id) : [addDrawerPhoneLines];
    setAdditionalTransfers((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        type: selectedType,
        number: addDrawerNumber.trim(),
        lineIds,
      },
    ]);
    closeAddDrawer();
  }, [addDrawerType, addDrawerNumber, addDrawerPhoneLines, lines, closeAddDrawer]);

  const addAnotherForType = useCallback((type: TransferType) => {
    setAdditionalTransfers((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        type,
        number: "",
        lineIds: lines.map((l) => l.id),
      },
    ]);
  }, [lines]);

  const updateAdditionalNumber = useCallback((id: string, number: string) => {
    setAdditionalTransfers((prev) => prev.map((a) => (a.id === id ? { ...a, number: formatPhoneInput(number) } : a)));
  }, []);

  const updateAdditionalLine = useCallback((id: string, value: string) => {
    setAdditionalTransfers((prev) =>
      prev.map((a) =>
        a.id === id
          ? {
              ...a,
              lineIds: value === "__all__" ? lines.map((l) => l.id) : [value],
            }
          : a
      )
    );
  }, [lines]);

  const removeAdditional = useCallback((id: string) => {
    setAdditionalTransfers((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const getLineName = (lineId: string) => lines.find((l) => l.id === lineId)?.name ?? "Phone line";
  const getPhoneLinesLabel = useCallback((entry: AdditionalTransfer) => (
    entry.lineIds.length === lines.length
      ? "All phone lines"
      : entry.lineIds.map(getLineName).join(", ")
  ), [getLineName, lines.length]);

  const [additionalSort, setAdditionalSort] = useState<{ key: AdditionalSortKey; direction: SortDirection }>({
    key: "type",
    direction: "asc",
  });

  const toggleAdditionalSort = useCallback((key: AdditionalSortKey) => {
    setAdditionalSort((prev) => (
      prev.key === key
        ? { key, direction: prev.direction === "asc" ? "desc" : "asc" }
        : { key, direction: "asc" }
    ));
  }, []);

  const sortedAdditionalTransfers = useMemo(() => {
    const factor = additionalSort.direction === "asc" ? 1 : -1;
    return [...additionalTransfers].sort((a, b) => {
      if (additionalSort.key === "type") {
        return a.type.localeCompare(b.type) * factor;
      }
      return getPhoneLinesLabel(a).localeCompare(getPhoneLinesLabel(b)) * factor;
    });
  }, [additionalTransfers, additionalSort, getPhoneLinesLabel]);

  return (
    <div className="flex-1 flex flex-col">
      <Section size="2">
          {phase === "catch-all" && (
            <>
              <p className="text-[12px] leading-[16px] font-medium tracking-[0.12px] text-[var(--text-whisper)] mb-1">
                Step 1 of 2
              </p>
              <Header
                title="Set a catch-all transfer number"
                subbody="Each Zo phone line must have a catch-all transfer number. When needed, this is where Zo will transfer calls if no other transfer logic applies."
              />
            </>
          )}
          {phase === "additional" && (
            <>
              <p className="text-[12px] leading-[16px] font-medium tracking-[0.12px] text-[var(--text-whisper)] mb-1">
                Step 2 of 2
              </p>
              <Header
                title="Manage where Zo transfers calls"
                subbody="Set transfer logic for specific call reasons. Zo will transfer patient calls to the right place."
              />
            </>
          )}

          <div className="mt-8 flex flex-col gap-8">
            {phase === "catch-all" && (
              <>
                <Flag color="blue" showIcon={false}>
                  Catch-all numbers must be different than the number patients call to ensure they don't get stuck in a loop
                </Flag>
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
                              placeholder="Phone number"
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
                </div>
                {catchAllContinueError && (
                  <p className="text-[14px] leading-[20px] font-medium text-[var(--text-error)]" role="alert">
                    {catchAllContinueError}
                  </p>
                )}
              </>
            )}

            {phase === "additional" && (
              <div className="flex flex-col gap-8 animate-in fade-in duration-300">
                <div className="flex items-center justify-between gap-4">
                  <h2 className="text-[18px] leading-[24px] font-semibold md:text-[20px] md:leading-[28px] text-[var(--text-default)]">
                    Transfer numbers
                  </h2>
                  <Button
                    variant="secondary"
                    size="small"
                    onClick={openAddDrawer}
                    className="w-fit"
                  >
                    Add transfer number
                  </Button>
                </div>
                <div className="rounded-xl border border-[var(--stroke-default)] bg-[var(--background-default-white)] overflow-hidden">
                  <table className="w-full border-collapse" role="table">
                    <thead>
                      <tr className="border-b border-[var(--stroke-default)] bg-[var(--background-default-greige)]">
                        <th className="text-left text-[14px] leading-[20px] font-semibold text-[var(--text-default)] px-4 py-3">
                          <button
                            type="button"
                            onClick={() => toggleAdditionalSort("type")}
                            className="inline-flex items-center gap-1 hover:underline"
                            aria-label="Sort by transfer type"
                          >
                            Transfer type
                            <span className="text-[12px] leading-[16px] text-[var(--text-whisper)]">
                              {additionalSort.key === "type" ? (additionalSort.direction === "asc" ? "▲" : "▼") : "↕"}
                            </span>
                          </button>
                        </th>
                        <th className="text-left text-[14px] leading-[20px] font-semibold text-[var(--text-default)] px-4 py-3">
                          Phone number
                        </th>
                        <th className="text-left text-[14px] leading-[20px] font-semibold text-[var(--text-default)] px-4 py-3">
                          <button
                            type="button"
                            onClick={() => toggleAdditionalSort("phoneLines")}
                            className="inline-flex items-center gap-1 hover:underline"
                            aria-label="Sort by phone lines"
                          >
                            Phone lines
                            <span className="text-[12px] leading-[16px] text-[var(--text-whisper)]">
                              {additionalSort.key === "phoneLines" ? (additionalSort.direction === "asc" ? "▲" : "▼") : "↕"}
                            </span>
                          </button>
                        </th>
                        <th className="text-left text-[14px] leading-[20px] font-semibold text-[var(--text-default)] px-4 py-3 w-[96px]">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {additionalTransfers.length > 0 ? (
                        sortedAdditionalTransfers.map((entry) => (
                          <tr key={entry.id} className="border-b border-[var(--stroke-default)] last:border-b-0">
                            <td className="px-4 py-3 text-[14px] leading-[20px] text-[var(--text-default)]">
                              {entry.type}
                            </td>
                            <td className="px-4 py-3 min-w-[220px]">
                              <TextField
                                type="tel"
                                placeholder="Phone number"
                                value={entry.number}
                                onChange={(e) => updateAdditionalNumber(entry.id, e.target.value)}
                                size="small"
                                inputMode="numeric"
                                autoComplete="tel"
                                aria-label={`${entry.type} transfer number`}
                              />
                            </td>
                            <td className="px-4 py-3 min-w-[220px]">
                              <Select
                                size="small"
                                value={entry.lineIds.length === lines.length ? "__all__" : (entry.lineIds[0] ?? "")}
                                onValueChange={(value) => updateAdditionalLine(entry.id, value)}
                              >
                                <SelectTrigger size="small">
                                  <SelectValue placeholder="Select phone line" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="__all__">All phone lines</SelectItem>
                                  {lines.map((line) => (
                                    <SelectItem key={line.id} value={line.id}>
                                      {line.name || "Phone line"}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </td>
                            <td className="px-4 py-3 w-[96px]">
                              <TooltipProvider delayDuration={150}>
                                <div className="flex items-center justify-end gap-1">
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <span>
                                        <IconButton
                                          icon="add_circle"
                                          size="small"
                                          aria-label={`Add another ${entry.type} row`}
                                          onClick={() => addAnotherForType(entry.type)}
                                          className="shrink-0"
                                        />
                                      </span>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      Add another
                                    </TooltipContent>
                                  </Tooltip>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <span>
                                        <IconButton
                                          icon="delete"
                                          size="small"
                                          aria-label={`Remove ${entry.type} transfer row`}
                                          onClick={() => removeAdditional(entry.id)}
                                          className="shrink-0"
                                        />
                                      </span>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      Remove
                                    </TooltipContent>
                                  </Tooltip>
                                </div>
                              </TooltipProvider>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan={4}
                            className="px-4 py-6 text-[14px] leading-[20px] text-[var(--text-whisper)]"
                          >
                            No additional transfer numbers added yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          <Drawer open={addDrawerOpen} onOpenChange={(open) => !open && closeAddDrawer()}>
            <DrawerContent showCloseButton>
              <DrawerHeader>
                <DrawerTitle>Add transfer number</DrawerTitle>
                <DrawerDescription>
                  Zo will transfer calls to this number based on your selections.
                </DrawerDescription>
              </DrawerHeader>
              <DrawerBody className="flex flex-col gap-6">
                <div className="flex flex-col gap-2">
                  <FieldLabel size="small" required>Transfer type</FieldLabel>
                  <Select
                    size="small"
                    value={addDrawerType}
                    onValueChange={(value) => {
                      setAddDrawerType(value as TransferType);
                      setAddDrawerErrors((prev) => ({ ...prev, type: undefined }));
                    }}
                  >
                    <SelectTrigger size="small">
                      <SelectValue placeholder="Select transfer type" />
                    </SelectTrigger>
                    <SelectContent>
                      {TRANSFER_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {addDrawerErrors.type && (
                    <p className="text-[14px] leading-[20px] text-[var(--text-error)]" role="alert">
                      {addDrawerErrors.type}
                    </p>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <FieldLabel size="small" required>Phone number</FieldLabel>
                  <TextField
                    type="tel"
                    placeholder="Phone number"
                    value={addDrawerNumber}
                    onChange={(e) => {
                      setAddDrawerNumber(formatPhoneInput(e.target.value));
                      setAddDrawerErrors((prev) => ({ ...prev, number: undefined }));
                    }}
                    size="small"
                    inputMode="numeric"
                    autoComplete="tel"
                    state={addDrawerErrors.number ? "error" : "default"}
                    errorMessage={addDrawerErrors.number}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <FieldLabel size="small" required>Phone lines</FieldLabel>
                  <Select
                    size="small"
                    value={addDrawerPhoneLines}
                    onValueChange={(value) => {
                      setAddDrawerPhoneLines(value);
                      setAddDrawerErrors((prev) => ({ ...prev, phoneLines: undefined }));
                    }}
                  >
                    <SelectTrigger size="small">
                      <SelectValue placeholder="Select phone lines" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__all__">All phone lines</SelectItem>
                      {lines.map((line) => (
                        <SelectItem key={line.id} value={line.id}>
                          {line.name || "Phone line"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {addDrawerErrors.phoneLines && (
                    <p className="text-[14px] leading-[20px] text-[var(--text-error)]" role="alert">
                      {addDrawerErrors.phoneLines}
                    </p>
                  )}
                </div>
              </DrawerBody>
              <DrawerFooter>
                <Button
                  variant="primary"
                  size="small"
                  onClick={saveAddDrawer}
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
