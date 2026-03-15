"use client";

import { useState, useCallback, useContext, useEffect, useLayoutEffect, useRef, useMemo } from "react";
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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  RadioGroup,
  RadioField,
  Icon,
  Checkbox,
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/vibezz";
import { ZoSetupBackContext, ZoSetupNextContext, ZoSetupStateContext } from "../zo-setup-shell";
import type { ZoPhoneLine } from "../zo-setup-shell";
import { PLACEHOLDER_LOCATION_NAMES } from "../data";
import { cn } from "@/lib/utils";
import { formatPhoneInput, formatPhoneDisplay, getPhoneDigits } from "@/lib/phone";

const MOCK_LOCATIONS = PLACEHOLDER_LOCATION_NAMES.map((name, i) => ({
  id: `loc-${i + 1}`,
  name,
}));

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

/** Additional transfer: one number for one or more types, applied to selected phone lines or locations */
interface AdditionalTransfer {
  id: string;
  types: TransferType[];
  number: string;
  lineIds: string[];
  applyTo?: "phone_lines" | "locations";
  locationIds?: string[];
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
    types: [type],
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
      const raw = Array.isArray(parsed.additional) ? parsed.additional : [];
      const additional: AdditionalTransfer[] = raw.map(
        (a: AdditionalTransfer & { type?: TransferType }) => ({
          id: a.id,
          types: Array.isArray(a.types) ? a.types : a.type != null ? [a.type] : [],
          number: a.number ?? "",
          lineIds: a.lineIds ?? [],
          applyTo: a.applyTo,
          locationIds: a.locationIds,
        })
      );
      return { byLine: parsed.byLine, additional };
    }
    // Old format: Record<string, { catchAll, additional? }> — migrate to new
    const byLine: Record<string, { catchAll: string }> = {};
    const additional: AdditionalTransfer[] = [];
    for (const [lineId, row] of Object.entries(parsed as Record<string, { catchAll?: string; additional?: { id: string; type: string; number: string }[] }>)) {
      byLine[lineId] = { catchAll: row?.catchAll ?? "" };
      const adds = row?.additional ?? [];
      for (const a of adds) {
        const t = a.type as TransferType | undefined;
        additional.push({
          id: a.id ?? crypto.randomUUID(),
          types: t != null ? [t] : [],
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
  const [hasMounted, setHasMounted] = useState(false);
  // Use stable default until after mount so server and initial client render match (avoids hydration mismatch from sessionStorage-restored phone lines)
  const lines = hasMounted && phoneLines.length > 0 ? phoneLines : [DEFAULT_LINE];

  useEffect(() => {
    setHasMounted(true);
  }, []);

  const hasRestoredRef = useRef(false);
  const catchAllErrorRef = useRef<HTMLParagraphElement>(null);
  const [phase, setPhase] = useState<Phase>("catch-all");
  const [catchAllContinueError, setCatchAllContinueError] = useState<string | null>(null);

  useLayoutEffect(() => {
    if (catchAllContinueError && catchAllErrorRef.current) {
      catchAllErrorRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [catchAllContinueError]);

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

  // Add/edit additional transfer: drawer state
  const [addDrawerOpen, setAddDrawerOpen] = useState(false);
  const [editDrawerEntryId, setEditDrawerEntryId] = useState<string | null>(null);
  const [addDrawerTypes, setAddDrawerTypes] = useState<TransferType[]>([]);
  const [addDrawerNumber, setAddDrawerNumber] = useState("");
  const [addDrawerApplyTo, setAddDrawerApplyTo] = useState<"phone_lines" | "locations">("phone_lines");
  const [addDrawerPhoneLinesSelection, setAddDrawerPhoneLinesSelection] = useState<{
    mode: "all" | "none" | "specific";
    ids: string[];
  }>({ mode: "all", ids: [] });
  const [addDrawerLocationsSelection, setAddDrawerLocationsSelection] = useState<{
    mode: "all" | "none" | "specific";
    ids: string[];
  }>({ mode: "all", ids: [] });
  const [addDrawerErrors, setAddDrawerErrors] = useState<{
    type?: string;
    number?: string;
    applyTo?: string;
  }>({});

  const openAddDrawer = useCallback(() => {
    setEditDrawerEntryId(null);
    setAddDrawerOpen(true);
    setAddDrawerTypes([]);
    setAddDrawerNumber("");
    setAddDrawerApplyTo("phone_lines");
    setAddDrawerPhoneLinesSelection({ mode: "all", ids: [] });
    setAddDrawerLocationsSelection({ mode: "all", ids: [] });
    setAddDrawerErrors({});
  }, []);

  const openEditDrawer = useCallback((entry: AdditionalTransfer) => {
    setEditDrawerEntryId(entry.id);
    setAddDrawerOpen(true);
    setAddDrawerTypes(entry.types ?? []);
    setAddDrawerNumber(entry.number ?? "");
    setAddDrawerApplyTo(entry.applyTo ?? "phone_lines");
    const lineIds = entry.lineIds ?? [];
    setAddDrawerPhoneLinesSelection(
      lineIds.length === 0
        ? { mode: "none", ids: [] }
        : lineIds.length === lines.length
          ? { mode: "all", ids: [] }
          : { mode: "specific", ids: lineIds }
    );
    const locIds = entry.locationIds ?? [];
    setAddDrawerLocationsSelection(
      locIds.length === 0
        ? { mode: "none", ids: [] }
        : locIds.length === MOCK_LOCATIONS.length
          ? { mode: "all", ids: [] }
          : { mode: "specific", ids: locIds }
    );
    setAddDrawerErrors({});
  }, [lines.length]);

  const closeAddDrawer = useCallback(() => {
    setAddDrawerOpen(false);
    setEditDrawerEntryId(null);
    setAddDrawerTypes([]);
    setAddDrawerNumber("");
    setAddDrawerApplyTo("phone_lines");
    setAddDrawerPhoneLinesSelection({ mode: "all", ids: [] });
    setAddDrawerLocationsSelection({ mode: "all", ids: [] });
    setAddDrawerErrors({});
  }, []);

  const handleTransferTypeToggle = useCallback((type: TransferType, checked: boolean) => {
    setAddDrawerTypes((prev) =>
      checked ? [...prev, type] : prev.filter((t) => t !== type)
    );
  }, []);

  const addDrawerEffectivePhoneLineIds =
    addDrawerApplyTo !== "phone_lines"
      ? []
      : addDrawerPhoneLinesSelection.mode === "all"
        ? lines.map((l) => l.id)
        : addDrawerPhoneLinesSelection.mode === "specific"
          ? addDrawerPhoneLinesSelection.ids
          : [];
  const addDrawerEffectiveLocationIds =
    addDrawerApplyTo !== "locations"
      ? []
      : addDrawerLocationsSelection.mode === "all"
        ? MOCK_LOCATIONS.map((loc) => loc.id)
        : addDrawerLocationsSelection.mode === "specific"
          ? addDrawerLocationsSelection.ids
          : [];

  const handleTransferSelectAllPhoneLines = useCallback(() => {
    setAddDrawerPhoneLinesSelection((prev) =>
      prev.mode === "all" ? { mode: "none", ids: [] } : { mode: "all", ids: [] }
    );
  }, []);
  const handleTransferPhoneLineToggle = useCallback((lineId: string, checked: boolean) => {
    setAddDrawerPhoneLinesSelection((prev) => {
      const nextIds = checked
        ? [...(prev.mode === "all" ? [] : prev.ids), lineId]
        : (prev.mode === "all" ? lines.map((l) => l.id) : prev.ids).filter((id) => id !== lineId);
      const allIds = lines.map((l) => l.id);
      const isAll = nextIds.length === allIds.length;
      const isNone = nextIds.length === 0;
      return {
        mode: isAll ? "all" : isNone ? "none" : "specific",
        ids: isAll ? [] : isNone ? [] : nextIds,
      };
    });
  }, [lines]);
  const handleTransferSelectAllLocations = useCallback(() => {
    setAddDrawerLocationsSelection((prev) =>
      prev.mode === "all" ? { mode: "none", ids: [] } : { mode: "all", ids: [] }
    );
  }, []);
  const handleTransferLocationToggle = useCallback((locId: string, checked: boolean) => {
    setAddDrawerLocationsSelection((prev) => {
      const nextIds = checked
        ? [...(prev.mode === "all" ? [] : prev.ids), locId]
        : (prev.mode === "all" ? MOCK_LOCATIONS.map((l) => l.id) : prev.ids).filter((id) => id !== locId);
      const allIds = MOCK_LOCATIONS.map((l) => l.id);
      const isAll = nextIds.length === allIds.length;
      const isNone = nextIds.length === 0;
      return {
        mode: isAll ? "all" : isNone ? "none" : "specific",
        ids: isAll ? [] : isNone ? [] : nextIds,
      };
    });
  }, []);

  const saveAddDrawer = useCallback(() => {
    const errors: { type?: string; number?: string; applyTo?: string } = {};
    if (addDrawerTypes.length === 0) errors.type = "Select at least one transfer type.";
    const digits = getPhoneDigits(addDrawerNumber);
    if (digits.length === 0) errors.number = "Phone number is required.";
    else if (digits.length < 10) errors.number = "Enter a valid phone number.";
    if (addDrawerApplyTo === "phone_lines" && addDrawerEffectivePhoneLineIds.length === 0) {
      errors.applyTo = "Select at least one phone line.";
    }
    if (addDrawerApplyTo === "locations" && addDrawerLocationsSelection.mode === "none") {
      errors.applyTo = "Select at least one location.";
    }

    if (Object.keys(errors).length > 0) {
      setAddDrawerErrors(errors);
      return;
    }

    const payload = {
      types: [...addDrawerTypes],
      number: addDrawerNumber.trim(),
      lineIds: addDrawerApplyTo === "phone_lines" ? addDrawerEffectivePhoneLineIds : [],
      applyTo: addDrawerApplyTo,
      locationIds: addDrawerApplyTo === "locations" ? addDrawerEffectiveLocationIds : [],
    };

    if (editDrawerEntryId) {
      setAdditionalTransfers((prev) =>
        prev.map((a) => (a.id === editDrawerEntryId ? { ...a, ...payload } : a))
      );
    } else {
      setAdditionalTransfers((prev) => [
        ...prev,
        { id: crypto.randomUUID(), ...payload },
      ]);
    }
    closeAddDrawer();
  }, [
    editDrawerEntryId,
    addDrawerTypes,
    addDrawerNumber,
    addDrawerApplyTo,
    addDrawerEffectivePhoneLineIds,
    addDrawerLocationsSelection.mode,
    addDrawerEffectiveLocationIds,
    closeAddDrawer,
  ]);

  const updateAdditionalNumber = useCallback((id: string, number: string) => {
    setAdditionalTransfers((prev) => prev.map((a) => (a.id === id ? { ...a, number: formatPhoneInput(number) } : a)));
  }, []);

  const updateAdditionalLineIds = useCallback((id: string, lineIds: string[]) => {
    setAdditionalTransfers((prev) =>
      prev.map((a) => (a.id === id ? { ...a, lineIds } : a))
    );
  }, []);

  const updateAdditionalLocationIds = useCallback((id: string, locationIds: string[]) => {
    setAdditionalTransfers((prev) =>
      prev.map((a) => (a.id === id ? { ...a, locationIds } : a))
    );
  }, []);

  const removeAdditional = useCallback((id: string) => {
    setAdditionalTransfers((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const getLineName = (lineId: string) => lines.find((l) => l.id === lineId)?.name ?? "Phone line";
  const getLocationName = (locId: string) => MOCK_LOCATIONS.find((l) => l.id === locId)?.name ?? "Location";
  const getApplyToLabel = useCallback(
    (entry: AdditionalTransfer) => {
      if (entry.applyTo === "locations") {
        const locIds = entry.locationIds ?? [];
        return locIds.length === 0
          ? "No locations"
          : locIds.length === MOCK_LOCATIONS.length
            ? "All locations"
            : locIds.map(getLocationName).join(", ");
      }
      const lineIds = entry.lineIds ?? [];
      return lineIds.length === 0
        ? "No phone lines"
        : lineIds.length === lines.length
          ? "All phone lines"
          : lineIds.map(getLineName).join(", ");
    },
    [getLineName, getLocationName, lines.length]
  );

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
    const typeLabel = (e: AdditionalTransfer) => e.types.join(", ");
    return [...additionalTransfers].sort((a, b) => {
      if (additionalSort.key === "type") {
        return typeLabel(a).localeCompare(typeLabel(b)) * factor;
      }
      return getApplyToLabel(a).localeCompare(getApplyToLabel(b)) * factor;
    });
  }, [additionalTransfers, additionalSort, getApplyToLabel]);

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
                  <p
                    ref={catchAllErrorRef}
                    className="text-[14px] leading-[20px] font-medium text-[var(--text-error)]"
                    role="alert"
                  >
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
                            aria-label="Sort by applies to"
                          >
                            Applies to
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
                              {entry.types.join(", ")}
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
                                aria-label={`${entry.types.join(", ")} transfer number`}
                              />
                            </td>
                            <td className="px-4 py-3 min-w-[220px]">
                              {entry.applyTo === "locations" ? (
                                <Popover>
                                  <PopoverTrigger asChild>
                                    <button
                                      type="button"
                                      className={cn(
                                        "flex w-full min-w-[140px] items-center justify-between gap-2",
                                        "h-9 pl-3 pr-2 rounded border border-[var(--stroke-ui)]",
                                        "bg-[var(--color-white)] font-medium text-[14px] leading-[20px] text-[var(--text-default)]",
                                        "hover:bg-[var(--state-hover)] focus:outline-none focus:ring-2 focus:ring-[var(--stroke-keyboard)]",
                                        "text-left"
                                      )}
                                    >
                                      <span className="truncate min-w-0">
                                        {(entry.locationIds?.length ?? 0) === 0
                                          ? "Select locations"
                                          : (entry.locationIds?.length ?? 0) === MOCK_LOCATIONS.length
                                            ? "All locations"
                                            : (entry.locationIds?.length ?? 0) === 1
                                              ? MOCK_LOCATIONS.find((l) => l.id === entry.locationIds?.[0])?.name ?? "1 selected"
                                              : `${entry.locationIds?.length ?? 0} locations selected`}
                                      </span>
                                      <Icon name="expand_more" size="20" className="text-[var(--icon-default)] opacity-70 shrink-0" />
                                    </button>
                                  </PopoverTrigger>
                                  <PopoverContent
                                    align="start"
                                    className="w-[var(--radix-popover-trigger-width)] max-h-[240px] flex flex-col overflow-hidden p-0"
                                  >
                                    <div
                                      className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-contain p-1"
                                      onWheel={(e) => {
                                        const el = e.currentTarget;
                                        const { scrollTop, scrollHeight, clientHeight } = el;
                                        const canScrollUp = scrollTop > 0;
                                        const canScrollDown = scrollTop + clientHeight < scrollHeight;
                                        const scrollingUp = e.deltaY < 0;
                                        const scrollingDown = e.deltaY > 0;
                                        if ((scrollingUp && canScrollUp) || (scrollingDown && canScrollDown)) {
                                          e.preventDefault();
                                          e.stopPropagation();
                                          el.scrollTop += e.deltaY;
                                        }
                                      }}
                                    >
                                      <div
                                        className="flex items-center gap-3 rounded-[4px] py-2 px-3 hover:bg-[var(--state-hover)] cursor-pointer border-b border-[var(--stroke-default)]"
                                        onClick={() => {
                                          const locIds = entry.locationIds ?? [];
                                          const isAll = locIds.length === MOCK_LOCATIONS.length;
                                          updateAdditionalLocationIds(entry.id, isAll ? [] : MOCK_LOCATIONS.map((l) => l.id));
                                        }}
                                        onKeyDown={(e) => {
                                          if (e.key === "Enter" || e.key === " ") {
                                            e.preventDefault();
                                            const locIds = entry.locationIds ?? [];
                                            const isAll = locIds.length === MOCK_LOCATIONS.length;
                                            updateAdditionalLocationIds(entry.id, isAll ? [] : MOCK_LOCATIONS.map((l) => l.id));
                                          }
                                        }}
                                        role="option"
                                        tabIndex={0}
                                      >
                                        <Checkbox
                                          checked={(entry.locationIds?.length ?? 0) === MOCK_LOCATIONS.length}
                                          onCheckedChange={() => {
                                            const locIds = entry.locationIds ?? [];
                                            const isAll = locIds.length === MOCK_LOCATIONS.length;
                                            updateAdditionalLocationIds(entry.id, isAll ? [] : MOCK_LOCATIONS.map((l) => l.id));
                                          }}
                                          aria-label="Select all locations"
                                        />
                                        <span className="text-[14px] leading-[20px] font-medium text-[var(--text-default)]">Select all</span>
                                      </div>
                                      {MOCK_LOCATIONS.map((loc) => {
                                        const checked = (entry.locationIds ?? []).includes(loc.id);
                                        return (
                                          <div
                                            key={loc.id}
                                            className="flex items-center gap-3 rounded-[4px] py-2 px-3 hover:bg-[var(--state-hover)] cursor-pointer"
                                            onClick={() => {
                                              const next = checked
                                                ? (entry.locationIds ?? []).filter((id) => id !== loc.id)
                                                : [...(entry.locationIds ?? []), loc.id];
                                              updateAdditionalLocationIds(entry.id, next);
                                            }}
                                            onKeyDown={(e) => {
                                              if (e.key === "Enter" || e.key === " ") {
                                                e.preventDefault();
                                                const next = checked
                                                  ? (entry.locationIds ?? []).filter((id) => id !== loc.id)
                                                  : [...(entry.locationIds ?? []), loc.id];
                                                updateAdditionalLocationIds(entry.id, next);
                                              }
                                            }}
                                            role="option"
                                            tabIndex={0}
                                          >
                                            <Checkbox
                                              checked={checked}
                                              onCheckedChange={(c) => {
                                                const next = c
                                                  ? [...(entry.locationIds ?? []), loc.id]
                                                  : (entry.locationIds ?? []).filter((id) => id !== loc.id);
                                                updateAdditionalLocationIds(entry.id, next);
                                              }}
                                              aria-label={loc.name}
                                            />
                                            <span className="text-[14px] leading-[20px] text-[var(--text-default)]">{loc.name}</span>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </PopoverContent>
                                </Popover>
                              ) : (
                                <Popover>
                                  <PopoverTrigger asChild>
                                    <button
                                      type="button"
                                      className={cn(
                                        "flex w-full min-w-[140px] items-center justify-between gap-2",
                                        "h-9 pl-3 pr-2 rounded border border-[var(--stroke-ui)]",
                                        "bg-[var(--color-white)] font-medium text-[14px] leading-[20px] text-[var(--text-default)]",
                                        "hover:bg-[var(--state-hover)] focus:outline-none focus:ring-2 focus:ring-[var(--stroke-keyboard)]",
                                        "text-left"
                                      )}
                                    >
                                      <span className="truncate min-w-0">
                                        {(entry.lineIds?.length ?? 0) === 0
                                          ? "Select phone lines"
                                          : (entry.lineIds?.length ?? 0) === lines.length
                                            ? "All phone lines"
                                            : (entry.lineIds?.length ?? 0) === 1
                                              ? lines.find((l) => l.id === entry.lineIds?.[0])?.name ?? "1 selected"
                                              : `${entry.lineIds?.length ?? 0} phone lines selected`}
                                      </span>
                                      <Icon name="expand_more" size="20" className="text-[var(--icon-default)] opacity-70 shrink-0" />
                                    </button>
                                  </PopoverTrigger>
                                  <PopoverContent
                                    align="start"
                                    className="w-[var(--radix-popover-trigger-width)] max-h-[240px] flex flex-col overflow-hidden p-0"
                                  >
                                    <div
                                      className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-contain p-1"
                                      onWheel={(e) => {
                                        const el = e.currentTarget;
                                        const { scrollTop, scrollHeight, clientHeight } = el;
                                        const canScrollUp = scrollTop > 0;
                                        const canScrollDown = scrollTop + clientHeight < scrollHeight;
                                        const scrollingUp = e.deltaY < 0;
                                        const scrollingDown = e.deltaY > 0;
                                        if ((scrollingUp && canScrollUp) || (scrollingDown && canScrollDown)) {
                                          e.preventDefault();
                                          e.stopPropagation();
                                          el.scrollTop += e.deltaY;
                                        }
                                      }}
                                    >
                                      <div
                                        className="flex items-center gap-3 rounded-[4px] py-2 px-3 hover:bg-[var(--state-hover)] cursor-pointer border-b border-[var(--stroke-default)]"
                                        onClick={() => {
                                          const lineIds = entry.lineIds ?? [];
                                          const isAll = lineIds.length === lines.length;
                                          updateAdditionalLineIds(entry.id, isAll ? [] : lines.map((l) => l.id));
                                        }}
                                        onKeyDown={(e) => {
                                          if (e.key === "Enter" || e.key === " ") {
                                            e.preventDefault();
                                            const lineIds = entry.lineIds ?? [];
                                            const isAll = lineIds.length === lines.length;
                                            updateAdditionalLineIds(entry.id, isAll ? [] : lines.map((l) => l.id));
                                          }
                                        }}
                                        role="option"
                                        tabIndex={0}
                                      >
                                        <Checkbox
                                          checked={(entry.lineIds?.length ?? 0) === lines.length}
                                          onCheckedChange={() => {
                                            const lineIds = entry.lineIds ?? [];
                                            const isAll = lineIds.length === lines.length;
                                            updateAdditionalLineIds(entry.id, isAll ? [] : lines.map((l) => l.id));
                                          }}
                                          aria-label="Select all phone lines"
                                        />
                                        <span className="text-[14px] leading-[20px] font-medium text-[var(--text-default)]">Select all</span>
                                      </div>
                                      {lines.map((line) => {
                                        const checked = (entry.lineIds ?? []).includes(line.id);
                                        return (
                                          <div
                                            key={line.id}
                                            className="flex items-center gap-3 rounded-[4px] py-2 px-3 hover:bg-[var(--state-hover)] cursor-pointer"
                                            onClick={() => {
                                              const next = checked
                                                ? (entry.lineIds ?? []).filter((id) => id !== line.id)
                                                : [...(entry.lineIds ?? []), line.id];
                                              updateAdditionalLineIds(entry.id, next);
                                            }}
                                            onKeyDown={(e) => {
                                              if (e.key === "Enter" || e.key === " ") {
                                                e.preventDefault();
                                                const next = checked
                                                  ? (entry.lineIds ?? []).filter((id) => id !== line.id)
                                                  : [...(entry.lineIds ?? []), line.id];
                                                updateAdditionalLineIds(entry.id, next);
                                              }
                                            }}
                                            role="option"
                                            tabIndex={0}
                                          >
                                            <Checkbox
                                              checked={checked}
                                              onCheckedChange={(c) => {
                                                const next = c
                                                  ? [...(entry.lineIds ?? []), line.id]
                                                  : (entry.lineIds ?? []).filter((id) => id !== line.id);
                                                updateAdditionalLineIds(entry.id, next);
                                              }}
                                              aria-label={line.name || "Phone line"}
                                            />
                                            <span className="text-[14px] leading-[20px] text-[var(--text-default)]">
                                              {line.name || "Phone line"}
                                            </span>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </PopoverContent>
                                </Popover>
                              )}
                            </td>
                            <td className="px-4 py-3 w-[96px]">
                              <TooltipProvider delayDuration={150}>
                                <div className="flex items-center justify-end gap-1">
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <span>
                                        <IconButton
                                          icon="edit"
                                          size="small"
                                          aria-label={`Edit ${entry.types.join(", ")} transfer`}
                                          onClick={() => openEditDrawer(entry)}
                                          className="shrink-0"
                                        />
                                      </span>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      Edit
                                    </TooltipContent>
                                  </Tooltip>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <span>
                                        <IconButton
                                          icon="delete"
                                          size="small"
                                          aria-label={`Remove ${entry.types.join(", ")} transfer row`}
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
                <DrawerTitle>{editDrawerEntryId ? "Edit transfer number" : "Add transfer number"}</DrawerTitle>
                <DrawerDescription>
                  Zo will transfer calls to this number based on your selections.
                </DrawerDescription>
              </DrawerHeader>
              <DrawerBody className="flex flex-col gap-6">
                <div className="flex flex-col gap-2">
                  <FieldLabel required>Transfer type</FieldLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <button
                        type="button"
                        className={cn(
                          "flex w-full items-center justify-between gap-2",
                          "h-[var(--button-height-default)] pl-4 pr-3",
                          "rounded-[var(--radius-input)] border border-[var(--stroke-ui)]",
                          "bg-[var(--color-white)] font-semibold text-[var(--text-default)]",
                          "hover:bg-[var(--state-hover)] focus:outline-none focus:ring-2 focus:ring-[var(--stroke-keyboard)]",
                          "text-left text-[16px] leading-[26px]",
                          addDrawerTypes.length === 0 && "text-[var(--text-placeholder)]"
                        )}
                        onClick={() => setAddDrawerErrors((prev) => ({ ...prev, type: undefined }))}
                      >
                        <span className="truncate min-w-0">
                          {addDrawerTypes.length === 0
                            ? "Select transfer types"
                            : addDrawerTypes.length === 1
                              ? addDrawerTypes[0]
                              : `${addDrawerTypes.length} types selected`}
                        </span>
                        <Icon name="expand_more" size="24" className="text-[var(--icon-default)] opacity-70 shrink-0" />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent
                      align="start"
                      className="w-[var(--radix-popover-trigger-width)] max-h-[280px] flex flex-col overflow-hidden p-0"
                    >
                      <div
                        className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-contain p-1"
                        onWheel={(e) => {
                          const el = e.currentTarget;
                          const { scrollTop, scrollHeight, clientHeight } = el;
                          const canScrollUp = scrollTop > 0;
                          const canScrollDown = scrollTop + clientHeight < scrollHeight;
                          const scrollingUp = e.deltaY < 0;
                          const scrollingDown = e.deltaY > 0;
                          if ((scrollingUp && canScrollUp) || (scrollingDown && canScrollDown)) {
                            e.preventDefault();
                            e.stopPropagation();
                            el.scrollTop += e.deltaY;
                          }
                        }}
                      >
                        {TRANSFER_TYPES.map((type) => {
                          const checked = addDrawerTypes.includes(type);
                          return (
                            <div
                              key={type}
                              className="flex items-center gap-3 rounded-[4px] py-2 px-3 hover:bg-[var(--state-hover)] cursor-pointer"
                              onClick={() => handleTransferTypeToggle(type, !checked)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === " ") {
                                  e.preventDefault();
                                  handleTransferTypeToggle(type, !checked);
                                }
                              }}
                              role="option"
                              aria-selected={checked}
                              tabIndex={0}
                            >
                              <Checkbox
                                checked={checked}
                                onCheckedChange={(c) => handleTransferTypeToggle(type, c === true)}
                                aria-label={type}
                              />
                              <span className="text-[16px] leading-[26px] text-[var(--text-default)]">
                                {type}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </PopoverContent>
                  </Popover>
                  {addDrawerErrors.type && (
                    <p className="text-[14px] leading-[20px] text-[var(--text-error)]" role="alert">
                      {addDrawerErrors.type}
                    </p>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <FieldLabel required>Phone number</FieldLabel>
                  <TextField
                    type="tel"
                    placeholder="Phone number"
                    value={addDrawerNumber}
                    onChange={(e) => {
                      setAddDrawerNumber(formatPhoneInput(e.target.value));
                      setAddDrawerErrors((prev) => ({ ...prev, number: undefined }));
                    }}
                    inputMode="numeric"
                    autoComplete="tel"
                    state={addDrawerErrors.number ? "error" : "default"}
                    errorMessage={addDrawerErrors.number}
                  />
                </div>
                <div className="flex flex-col gap-4">
                  <FieldLabel required>
                    Where should this transfer number apply?
                  </FieldLabel>
                  <RadioGroup
                    value={addDrawerApplyTo}
                    onValueChange={(v) => {
                      setAddDrawerApplyTo(v as "phone_lines" | "locations");
                      setAddDrawerErrors((prev) => ({ ...prev, applyTo: undefined }));
                    }}
                    className="flex flex-col gap-3"
                  >
                    <RadioField value="phone_lines" label="Select Zo phone lines" />
                    <RadioField value="locations" label="Select locations" />
                  </RadioGroup>

                  {addDrawerApplyTo === "phone_lines" && (
                    <div className="flex flex-col gap-2">
                      <Popover>
                        <PopoverTrigger asChild>
                          <button
                            type="button"
                            className={cn(
                              "flex w-full items-center justify-between gap-2",
                              "h-[var(--button-height-default)] pl-4 pr-3",
                              "rounded-[var(--radius-input)] border border-[var(--stroke-ui)]",
                              "bg-[var(--color-white)] font-semibold text-[var(--text-default)]",
                              "hover:bg-[var(--state-hover)] focus:outline-none focus:ring-2 focus:ring-[var(--stroke-keyboard)]",
                              "text-left text-[16px] leading-[26px]",
                              addDrawerPhoneLinesSelection.mode === "none" && "text-[var(--text-placeholder)]"
                            )}
                          >
                            <span className="truncate min-w-0">
                              {addDrawerPhoneLinesSelection.mode === "none"
                                ? "Select phone lines"
                                : addDrawerPhoneLinesSelection.mode === "all"
                                  ? "All phone lines"
                                  : addDrawerPhoneLinesSelection.ids.length === 1
                                    ? lines.find((l) => l.id === addDrawerPhoneLinesSelection.ids[0])?.name ?? "1 selected"
                                    : `${addDrawerPhoneLinesSelection.ids.length} phone lines selected`}
                            </span>
                            <Icon name="expand_more" size="24" className="text-[var(--icon-default)] opacity-70 shrink-0" />
                          </button>
                        </PopoverTrigger>
                        <PopoverContent
                          align="start"
                          className="w-[var(--radix-popover-trigger-width)] max-h-[280px] flex flex-col overflow-hidden p-0"
                        >
                          <div
                            className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-contain p-1"
                            onWheel={(e) => {
                              const el = e.currentTarget;
                              const { scrollTop, scrollHeight, clientHeight } = el;
                              const canScrollUp = scrollTop > 0;
                              const canScrollDown = scrollTop + clientHeight < scrollHeight;
                              const scrollingUp = e.deltaY < 0;
                              const scrollingDown = e.deltaY > 0;
                              if ((scrollingUp && canScrollUp) || (scrollingDown && canScrollDown)) {
                                e.preventDefault();
                                e.stopPropagation();
                                el.scrollTop += e.deltaY;
                              }
                            }}
                          >
                            <div
                              className="flex items-center gap-3 rounded-[4px] py-2 px-3 hover:bg-[var(--state-hover)] cursor-pointer border-b border-[var(--stroke-default)]"
                              onClick={handleTransferSelectAllPhoneLines}
                              onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === " ") {
                                  e.preventDefault();
                                  handleTransferSelectAllPhoneLines();
                                }
                              }}
                              role="option"
                              aria-selected={addDrawerPhoneLinesSelection.mode === "all"}
                              tabIndex={0}
                            >
                              <Checkbox
                                checked={addDrawerPhoneLinesSelection.mode === "all"}
                                onCheckedChange={handleTransferSelectAllPhoneLines}
                                aria-label="Select all phone lines"
                              />
                              <span className="text-[16px] leading-[26px] font-medium text-[var(--text-default)]">
                                Select all
                              </span>
                            </div>
                            {lines.map((line) => {
                              const checked =
                                addDrawerPhoneLinesSelection.mode === "all" ||
                                addDrawerPhoneLinesSelection.ids.includes(line.id);
                              return (
                                <div
                                  key={line.id}
                                  className="flex items-center gap-3 rounded-[4px] py-2 px-3 hover:bg-[var(--state-hover)] cursor-pointer"
                                  onClick={() => handleTransferPhoneLineToggle(line.id, !checked)}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter" || e.key === " ") {
                                      e.preventDefault();
                                      handleTransferPhoneLineToggle(line.id, !checked);
                                    }
                                  }}
                                  role="option"
                                  aria-selected={checked}
                                  tabIndex={0}
                                >
                                  <Checkbox
                                    checked={checked}
                                    onCheckedChange={(c) => handleTransferPhoneLineToggle(line.id, c === true)}
                                    aria-label={line.name || "Phone line"}
                                  />
                                  <span className="text-[16px] leading-[26px] text-[var(--text-default)]">
                                    {line.name || "Phone line"}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </PopoverContent>
                      </Popover>
                    </div>
                  )}

                  {addDrawerApplyTo === "locations" && (
                    <div className="flex flex-col gap-2">
                      <Popover>
                        <PopoverTrigger asChild>
                          <button
                            type="button"
                            className={cn(
                              "flex w-full items-center justify-between gap-2",
                              "h-[var(--button-height-default)] pl-4 pr-3",
                              "rounded-[var(--radius-input)] border border-[var(--stroke-ui)]",
                              "bg-[var(--color-white)] font-semibold text-[var(--text-default)]",
                              "hover:bg-[var(--state-hover)] focus:outline-none focus:ring-2 focus:ring-[var(--stroke-keyboard)]",
                              "text-left text-[16px] leading-[26px]",
                              addDrawerLocationsSelection.mode === "none" && "text-[var(--text-placeholder)]"
                            )}
                          >
                            <span className="truncate min-w-0">
                              {addDrawerLocationsSelection.mode === "none"
                                ? "Select locations"
                                : addDrawerLocationsSelection.mode === "all"
                                  ? "All locations"
                                  : addDrawerLocationsSelection.ids.length === 1
                                    ? MOCK_LOCATIONS.find((l) => l.id === addDrawerLocationsSelection.ids[0])?.name ?? "1 selected"
                                    : `${addDrawerLocationsSelection.ids.length} locations selected`}
                            </span>
                            <Icon name="expand_more" size="24" className="text-[var(--icon-default)] opacity-70 shrink-0" />
                          </button>
                        </PopoverTrigger>
                        <PopoverContent
                          align="start"
                          className="w-[var(--radix-popover-trigger-width)] max-h-[280px] flex flex-col overflow-hidden p-0"
                        >
                          <div
                            className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-contain p-1"
                            onWheel={(e) => {
                              const el = e.currentTarget;
                              const { scrollTop, scrollHeight, clientHeight } = el;
                              const canScrollUp = scrollTop > 0;
                              const canScrollDown = scrollTop + clientHeight < scrollHeight;
                              const scrollingUp = e.deltaY < 0;
                              const scrollingDown = e.deltaY > 0;
                              if ((scrollingUp && canScrollUp) || (scrollingDown && canScrollDown)) {
                                e.preventDefault();
                                e.stopPropagation();
                                el.scrollTop += e.deltaY;
                              }
                            }}
                          >
                            <div
                              className="flex items-center gap-3 rounded-[4px] py-2 px-3 hover:bg-[var(--state-hover)] cursor-pointer border-b border-[var(--stroke-default)]"
                              onClick={handleTransferSelectAllLocations}
                              onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === " ") {
                                  e.preventDefault();
                                  handleTransferSelectAllLocations();
                                }
                              }}
                              role="option"
                              aria-selected={addDrawerLocationsSelection.mode === "all"}
                              tabIndex={0}
                            >
                              <Checkbox
                                checked={addDrawerLocationsSelection.mode === "all"}
                                onCheckedChange={handleTransferSelectAllLocations}
                                aria-label="Select all locations"
                              />
                              <span className="text-[16px] leading-[26px] font-medium text-[var(--text-default)]">
                                Select all
                              </span>
                            </div>
                            {MOCK_LOCATIONS.map((loc) => {
                              const checked =
                                addDrawerLocationsSelection.mode === "all" ||
                                addDrawerLocationsSelection.ids.includes(loc.id);
                              return (
                                <div
                                  key={loc.id}
                                  className="flex items-center gap-3 rounded-[4px] py-2 px-3 hover:bg-[var(--state-hover)] cursor-pointer"
                                  onClick={() => handleTransferLocationToggle(loc.id, !checked)}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter" || e.key === " ") {
                                      e.preventDefault();
                                      handleTransferLocationToggle(loc.id, !checked);
                                    }
                                  }}
                                  role="option"
                                  aria-selected={checked}
                                  tabIndex={0}
                                >
                                  <Checkbox
                                    checked={checked}
                                    onCheckedChange={(c) => handleTransferLocationToggle(loc.id, c === true)}
                                    aria-label={loc.name}
                                  />
                                  <span className="text-[16px] leading-[26px] text-[var(--text-default)]">
                                    {loc.name}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </PopoverContent>
                      </Popover>
                    </div>
                  )}

                  {addDrawerErrors.applyTo && (
                    <p className="text-[14px] leading-[20px] text-[var(--text-error)]" role="alert">
                      {addDrawerErrors.applyTo}
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
