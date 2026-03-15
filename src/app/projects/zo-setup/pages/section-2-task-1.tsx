"use client";

import { useState, useCallback, useEffect, useRef, useContext } from "react";
import {
  Section,
  Header,
  Button,
  Icon,
  IconButton,
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
  Checkbox,
  FieldLabel,
  RadioGroup,
  RadioField,
} from "@/components/vibezz";
import { ZoSetupStateContext, ZoSetupContinueValidationContext } from "../zo-setup-shell";
import type { ZoPhoneLine } from "../zo-setup-shell";
import { PLACEHOLDER_LOCATION_NAMES } from "../data";
import { cn } from "@/lib/utils";

export const SCHEDULING_EXCLUSIONS_STORAGE_KEY = "zo-setup-scheduling-exclusions";

export type ExclusionType = "provider" | "visit_reason" | "location";

export interface SchedulingExclusion {
  id: string;
  type: ExclusionType;
  name: string;
  subName?: string;
  excludedFromLineIds?: string[];
}

function getStoredExclusions(): SchedulingExclusion[] {
  if (typeof window === "undefined") return [];
  try {
    const s = sessionStorage.getItem(SCHEDULING_EXCLUSIONS_STORAGE_KEY);
    return s ? (JSON.parse(s) as SchedulingExclusion[]) : [];
  } catch {
    return [];
  }
}

function storeExclusions(data: SchedulingExclusion[]) {
  try {
    sessionStorage.setItem(SCHEDULING_EXCLUSIONS_STORAGE_KEY, JSON.stringify(data));
  } catch {
    // ignore
  }
}

// Mock options (would come from API in production). Counts used for "X from Zocdoc" summary.
const MOCK_PROVIDERS = [
  { id: "p1", name: "Catalina Alvarez", subName: "Audiology" },
  { id: "p2", name: "Evelyn Hamilton", subName: "General Surgery" },
  { id: "p3", name: "Janet Lay-Claypon", subName: "Primary care" },
  { id: "p4", name: "Marcus Chen", subName: "Dermatology" },
  { id: "p5", name: "Sarah Okonkwo", subName: "Cardiology" },
  { id: "p6", name: "David Park", subName: "Orthopedics" },
  { id: "p7", name: "Rachel Torres", subName: "Pediatrics" },
  { id: "p8", name: "James Wilson", subName: "OB-GYN" },
  { id: "p9", name: "Priya Sharma", subName: "Endocrinology" },
  { id: "p10", name: "Michael Foster", subName: "Psychiatry" },
];

const MOCK_VISIT_REASONS = [
  { id: "vr1", name: "Botox injection", subName: "New patients" },
  { id: "vr2", name: "Surgery consultation", subName: "New patients, existing patients" },
  { id: "vr3", name: "Cancer screening", subName: "New patients, existing patients" },
  { id: "vr4", name: "Annual physical", subName: "New patients, existing patients" },
  { id: "vr5", name: "Follow-up visit", subName: "Existing patients" },
  { id: "vr6", name: "Skin check", subName: "New patients, existing patients" },
  { id: "vr7", name: "Mental health intake", subName: "New patients" },
  { id: "vr8", name: "Vaccination", subName: "New patients, existing patients" },
  { id: "vr9", name: "Prenatal visit", subName: "Existing patients" },
  { id: "vr10", name: "Injury evaluation", subName: "New patients, existing patients" },
  { id: "vr11", name: "Blood pressure check", subName: "New patients, existing patients" },
  { id: "vr12", name: "Diabetes management", subName: "Existing patients" },
  { id: "vr13", name: "Allergy consultation", subName: "New patients, existing patients" },
  { id: "vr14", name: "Physical therapy evaluation", subName: "New patients" },
  { id: "vr15", name: "X-ray or imaging review", subName: "Existing patients" },
  { id: "vr16", name: "Medication refill", subName: "Existing patients" },
  { id: "vr17", name: "Wellness visit", subName: "New patients, existing patients" },
  { id: "vr18", name: "Sports physical", subName: "New patients, existing patients" },
  { id: "vr19", name: "Ear infection", subName: "New patients, existing patients" },
  { id: "vr20", name: "Strep throat", subName: "New patients, existing patients" },
  { id: "vr21", name: "Migraine management", subName: "Existing patients" },
  { id: "vr22", name: "Thyroid check", subName: "New patients, existing patients" },
  { id: "vr23", name: "Colonoscopy referral", subName: "New patients, existing patients" },
  { id: "vr24", name: "Mammogram follow-up", subName: "Existing patients" },
  { id: "vr25", name: "Pediatric check-up", subName: "New patients, existing patients" },
  { id: "vr26", name: "Depression screening", subName: "New patients, existing patients" },
  { id: "vr27", name: "Asthma management", subName: "Existing patients" },
  { id: "vr28", name: "Joint pain evaluation", subName: "New patients, existing patients" },
  { id: "vr29", name: "Sleep study consultation", subName: "New patients" },
  { id: "vr30", name: "Weight management", subName: "New patients, existing patients" },
  { id: "vr31", name: "EKG or cardiac workup", subName: "New patients, existing patients" },
  { id: "vr32", name: "Pap smear", subName: "New patients, existing patients" },
  { id: "vr33", name: "Flu shot", subName: "New patients, existing patients" },
  { id: "vr34", name: "Travel health consultation", subName: "New patients" },
  { id: "vr35", name: "Wound care", subName: "Existing patients" },
  { id: "vr36", name: "Pre-op clearance", subName: "New patients, existing patients" },
  { id: "vr37", name: "Post-op follow-up", subName: "Existing patients" },
  { id: "vr38", name: "Lab results review", subName: "Existing patients" },
  { id: "vr39", name: "Rash or skin condition", subName: "New patients, existing patients" },
  { id: "vr40", name: "Back pain evaluation", subName: "New patients, existing patients" },
  { id: "vr41", name: "Anxiety consultation", subName: "New patients, existing patients" },
  { id: "vr42", name: "Hearing test", subName: "New patients, existing patients" },
  { id: "vr43", name: "Vision exam", subName: "New patients, existing patients" },
  { id: "vr44", name: "Nutrition counseling", subName: "New patients, existing patients" },
  { id: "vr45", name: "Smoking cessation", subName: "New patients, existing patients" },
  { id: "vr46", name: "UTI evaluation", subName: "New patients, existing patients" },
  { id: "vr47", name: "Sinus infection", subName: "New patients, existing patients" },
  { id: "vr48", name: "Immunization records", subName: "New patients, existing patients" },
  { id: "vr49", name: "Chronic pain management", subName: "Existing patients" },
  { id: "vr50", name: "Geriatric assessment", subName: "New patients, existing patients" },
  { id: "vr51", name: "Second opinion", subName: "New patients" },
  { id: "vr52", name: "Prescription renewal", subName: "Existing patients" },
  { id: "vr53", name: "Minor procedure", subName: "New patients, existing patients" },
  { id: "vr54", name: "Telehealth follow-up", subName: "Existing patients" },
  { id: "vr55", name: "New patient intake", subName: "New patients" },
];

const MOCK_LOCATIONS = PLACEHOLDER_LOCATION_NAMES.map((name, i) => ({
  id: `l${i + 1}`,
  name,
  subName: "In-person",
}));

const TYPE_LABELS: Record<ExclusionType, string> = {
  provider: "Excluded providers",
  visit_reason: "Excluded visit reasons",
  location: "Excluded locations",
};

const TYPE_LABELS_SINGULAR: Record<ExclusionType, string> = {
  provider: "providers",
  visit_reason: "visit reasons",
  location: "locations",
};

const TYPE_ICONS: Record<ExclusionType, string> = {
  provider: "person",
  visit_reason: "medical_services",
  location: "location_on",
};

const MOCK_COUNTS: Record<ExclusionType, number> = {
  provider: MOCK_PROVIDERS.length,
  visit_reason: MOCK_VISIT_REASONS.length,
  location: MOCK_LOCATIONS.length,
};

function getMockItemsForType(type: ExclusionType) {
  if (type === "provider") return MOCK_PROVIDERS;
  if (type === "visit_reason") return MOCK_VISIT_REASONS;
  return MOCK_LOCATIONS;
}

function getExclusionApplyToLabel(
  exclusion: SchedulingExclusion,
  lines: ZoPhoneLine[]
): string {
  const ids = exclusion.excludedFromLineIds;
  if (!ids || ids.length === 0 || ids.length === lines.length) return "All phone lines";
  if (ids.length === 1) {
    const name = lines.find((l) => l.id === ids[0])?.name ?? "Phone line";
    return name;
  }
  return ids.map((id) => lines.find((l) => l.id === id)?.name ?? "Phone line").join(", ");
}

const EXCLUSIONS_VISITED_STORAGE_KEY = "zo-setup-exclusions-visited";

export default function SchedulingExclusionsTask() {
  const { phoneLines } = useContext(ZoSetupStateContext);
  const { setContinueValidationHandler } = useContext(ZoSetupContinueValidationContext);
  const lines = phoneLines.length > 0 ? phoneLines : [];

  const [exclusions, setExclusions] = useState<SchedulingExclusion[]>([]);
  const hasRestoredRef = useRef(false);

  useEffect(() => {
    const stored = getStoredExclusions();
    if (stored.length > 0) setExclusions(stored);
  }, []);

  useEffect(() => {
    const id = setTimeout(() => {
      hasRestoredRef.current = true;
    }, 0);
    return () => clearTimeout(id);
  }, []);

  useEffect(() => {
    if (!hasRestoredRef.current) return;
    storeExclusions(exclusions);
  }, [exclusions]);

  useEffect(() => {
    const onContinue = () => {
      try {
        sessionStorage.setItem(EXCLUSIONS_VISITED_STORAGE_KEY, "true");
      } catch {
        // ignore
      }
      return true;
    };
    setContinueValidationHandler(onContinue);
    return () => setContinueValidationHandler(null);
  }, [setContinueValidationHandler]);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [flyoutType, setFlyoutType] = useState<ExclusionType | null>(null);
  const [drawerStep, setDrawerStep] = useState<1 | 2>(1);
  const [selectedItemIds, setSelectedItemIds] = useState<Set<string>>(new Set());
  const [drawerApplyTo, setDrawerApplyTo] = useState<"all" | "select">("all");
  const [drawerLineIds, setDrawerLineIds] = useState<string[]>([]);

  const openDrawerForType = useCallback((type: ExclusionType) => {
    setFlyoutType(type);
    setDrawerOpen(true);
    setDrawerStep(1);
    setSelectedItemIds(new Set());
    setDrawerApplyTo("all");
    setDrawerLineIds([]);
  }, []);

  const closeDrawer = useCallback(() => {
    setDrawerOpen(false);
    setFlyoutType(null);
    setDrawerStep(1);
    setSelectedItemIds(new Set());
    setDrawerApplyTo("all");
    setDrawerLineIds([]);
  }, []);

  const goToStep2 = useCallback(() => {
    setDrawerStep(2);
    setDrawerApplyTo("all");
    setDrawerLineIds([]);
  }, []);

  const goBackToStep1 = useCallback(() => {
    setDrawerStep(1);
  }, []);

  const handleSaveExclusions = useCallback(() => {
    if (!flyoutType) return;
    const items = getMockItemsForType(flyoutType);
    const toAdd = items.filter((item) => selectedItemIds.has(item.id));
    if (toAdd.length === 0) return;
    const lineIds =
      drawerApplyTo === "all" || drawerEffectiveLineIds.length === lines.length
        ? []
        : drawerEffectiveLineIds;
    const newExclusions: SchedulingExclusion[] = toAdd.map((item) => ({
      id: `${flyoutType}-${item.id}-${crypto.randomUUID()}`,
      type: flyoutType,
      name: item.name,
      subName: item.subName,
      excludedFromLineIds: lineIds,
    }));
    setExclusions((prev) => [...prev, ...newExclusions]);
    closeDrawer();
  }, [flyoutType, selectedItemIds, drawerApplyTo, drawerLineIds, lines.length, closeDrawer]);

  const toggleDrawerLine = useCallback(
    (lineId: string) => {
      setDrawerLineIds((prev) => {
        const effective = prev.length === 0 ? lines.map((l) => l.id) : prev;
        const next = effective.includes(lineId)
          ? effective.filter((id) => id !== lineId)
          : [...effective, lineId];
        return next.length === lines.length ? [] : next;
      });
    },
    [lines]
  );

  const drawerEffectiveLineIds = drawerLineIds.length === 0 ? lines.map((l) => l.id) : drawerLineIds;

  const removeExclusion = useCallback((id: string) => {
    setExclusions((prev) => prev.filter((e) => e.id !== id));
  }, []);

  const exclusionsByType = (type: ExclusionType) => exclusions.filter((e) => e.type === type);

  return (
    <div className="flex-1 flex flex-col">
      <Section size="2">
        <Header
          title="Manage Zo exclusions"
          subbody="If no exclusions are added Zo will schedule any provider, visit reason, and location at your practice that are available on Zocdoc"
        />

        <div
          className="mt-6 flex gap-3 items-center rounded-2xl border border-[var(--stroke-default)] bg-[var(--background-brand-yellow-dark)] p-6"
          role="region"
          aria-label="What is an exclusion?"
        >
          <div className="flex h-[60px] w-[60px] shrink-0 items-center justify-center rounded-full bg-[var(--color-yellow-10)]">
            <Icon name="lightbulb" size="40" filled={false} className="text-[var(--icon-default)]" />
          </div>
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <p className="text-[16px] font-semibold leading-[26px] text-[var(--text-default)]">
              What is an exclusion?
            </p>
            <p className="text-[14px] font-medium leading-[20px] text-[var(--text-default)]">
              You can exclude anything you don&apos;t want Zo to schedule over the phone. Anything that is excluded will
              be transferred to your staff.
            </p>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-6">
          {(["provider", "visit_reason", "location"] as const).map((type) => {
            const count = MOCK_COUNTS[type];
            const excluded = exclusionsByType(type);
            return (
              <div
                key={type}
                className="rounded-xl border border-[var(--stroke-default)] bg-[var(--background-default-white)] p-6 flex flex-col gap-4"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <Icon name={TYPE_ICONS[type]} size="24" className="text-[var(--icon-default)] shrink-0" />
                    <h2 className="text-[16px] leading-[20px] font-semibold text-[var(--text-default)] md:text-[18px] md:leading-[24px]">
                      {TYPE_LABELS[type]}
                    </h2>
                  </div>
                  <span className="text-[14px] leading-[20px] text-[var(--text-secondary)] shrink-0">
                    {count} {TYPE_LABELS_SINGULAR[type]} on Zocdoc
                  </span>
                </div>
                <div className="border-t border-[var(--stroke-default)] pt-4 flex flex-col gap-4">
                  {excluded.length > 0 ? (
                    <ul className="flex flex-col gap-2">
                      {excluded.map((e) => (
                        <li
                          key={e.id}
                          className="flex items-center gap-4 py-2 border-b border-[var(--stroke-default)] last:border-b-0"
                        >
                          <div className="min-w-0 flex-1 flex flex-col gap-0.5">
                            <span className="text-[14px] leading-[20px] font-medium text-[var(--text-default)]">
                              {e.name}
                            </span>
                            {e.subName && (
                              <span className="text-[12px] leading-[16px] text-[var(--text-whisper)]">
                                {e.subName}
                              </span>
                            )}
                          </div>
                          {lines.length > 0 && (
                            <span className="text-[14px] leading-[20px] font-medium text-[var(--text-default)] min-w-0 flex-1">
                              {getExclusionApplyToLabel(e, lines)}
                            </span>
                          )}
                          <IconButton
                            icon="delete"
                            size="small"
                            aria-label="Remove exclusion"
                            onClick={() => removeExclusion(e.id)}
                            className="shrink-0"
                          />
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-[14px] leading-[20px] text-[var(--text-whisper)]">
                      No {TYPE_LABELS_SINGULAR[type]} excluded
                    </p>
                  )}
                  <Button
                    variant="secondary"
                    size="small"
                    onClick={() => openDrawerForType(type)}
                    className="w-fit"
                  >
                    Exclude {TYPE_LABELS_SINGULAR[type]}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        <Drawer open={drawerOpen} onOpenChange={(open) => !open && closeDrawer()}>
          <DrawerContent showCloseButton>
            {flyoutType && (
              <>
                <DrawerHeader className="flex flex-row items-center gap-2">
                  {drawerStep === 2 && (
                    <IconButton
                      icon="arrow_back"
                      size="small"
                      aria-label="Back"
                      onClick={goBackToStep1}
                      className="shrink-0 -ml-1"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    {drawerStep === 1 ? (
                      <>
                        <DrawerTitle>
                          Select {TYPE_LABELS_SINGULAR[flyoutType]} to exclude
                        </DrawerTitle>
                        <DrawerDescription>
                          Zo will not schedule these through the phone. Requests will be transferred to your staff.
                        </DrawerDescription>
                      </>
                    ) : (
                      <DrawerTitle>Where should the exclusion apply?</DrawerTitle>
                    )}
                  </div>
                </DrawerHeader>
                <DrawerBody className="flex flex-col gap-4">
                  {drawerStep === 1 ? (
                    <div className="flex flex-col gap-2">
                      {getMockItemsForType(flyoutType)
                        .filter(
                          (item) =>
                            !exclusions.some((e) => e.type === flyoutType && e.name === item.name)
                        )
                        .map((item) => (
                          <Checkbox
                            key={item.id}
                            size="small"
                            label={item.name}
                            description={item.subName}
                            checked={selectedItemIds.has(item.id)}
                            onCheckedChange={(checked) => {
                              setSelectedItemIds((prev) => {
                                const next = new Set(prev);
                                if (checked) next.add(item.id);
                                else next.delete(item.id);
                                return next;
                              });
                            }}
                          />
                        ))}
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2">
                      <FieldLabel size="default" required>
                        Select Zo phone lines
                      </FieldLabel>
                      <p className="text-[14px] leading-[20px] text-[var(--text-whisper)]">
                        Which phone lines should the exclusion apply to?
                      </p>
                      <RadioGroup
                        value={drawerApplyTo}
                        onValueChange={(v) => {
                          setDrawerApplyTo(v as "all" | "select");
                          if (v === "all") setDrawerLineIds([]);
                          else if (lines.length > 0) setDrawerLineIds(lines.map((l) => l.id));
                        }}
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
                            const isChecked = drawerEffectiveLineIds.includes(line.id);
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
                  )}
                </DrawerBody>
                <DrawerFooter>
                  {drawerStep === 1 ? (
                    <Button
                      variant="primary"
                      size="small"
                      onClick={goToStep2}
                      disabled={selectedItemIds.size === 0}
                    >
                      Next
                    </Button>
                  ) : (
                    <Button
                      variant="primary"
                      size="small"
                      onClick={handleSaveExclusions}
                    >
                      Save exclusion
                    </Button>
                  )}
                </DrawerFooter>
              </>
            )}
          </DrawerContent>
        </Drawer>
      </Section>
    </div>
  );
}
