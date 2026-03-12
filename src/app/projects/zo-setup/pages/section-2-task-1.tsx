"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import {
  Section,
  Header,
  Button,
  Icon,
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
  Checkbox,
} from "@/components/vibezz";
import { PLACEHOLDER_LOCATION_NAMES } from "../data";

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

export default function SchedulingExclusionsTask() {
  // Use stable empty initial state so server and client match (avoids hydration mismatch from sessionStorage)
  const [exclusions, setExclusions] = useState<SchedulingExclusion[]>([]);
  const hasRestoredRef = useRef(false);

  useEffect(() => {
    const stored = getStoredExclusions();
    if (stored.length > 0) setExclusions(stored);
    hasRestoredRef.current = true;
  }, []);

  useEffect(() => {
    if (!hasRestoredRef.current) return;
    storeExclusions(exclusions);
  }, [exclusions]);

  // Flyout: opened with type pre-selected (no step 1)
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [flyoutType, setFlyoutType] = useState<ExclusionType | null>(null);
  const [selectedItemIds, setSelectedItemIds] = useState<Set<string>>(new Set());

  const openDrawerForType = useCallback((type: ExclusionType) => {
    setFlyoutType(type);
    setDrawerOpen(true);
    setSelectedItemIds(new Set());
  }, []);

  const closeDrawer = useCallback(() => {
    setDrawerOpen(false);
    setFlyoutType(null);
    setSelectedItemIds(new Set());
  }, []);

  const handleAddExclusions = useCallback(() => {
    if (!flyoutType) return;
    const items = getMockItemsForType(flyoutType);
    const toAdd = items.filter((item) => selectedItemIds.has(item.id));
    if (toAdd.length === 0) return;
    const newExclusions: SchedulingExclusion[] = toAdd.map((item) => ({
      id: `${flyoutType}-${item.id}-${crypto.randomUUID()}`,
      type: flyoutType,
      name: item.name,
      subName: item.subName,
    }));
    setExclusions((prev) => [...prev, ...newExclusions]);
    closeDrawer();
  }, [flyoutType, selectedItemIds, closeDrawer]);

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
                          className="flex items-center justify-between gap-2 py-2 border-b border-[var(--stroke-default)] last:border-b-0"
                        >
                          <div className="min-w-0">
                            <span className="text-[14px] leading-[20px] font-medium text-[var(--text-default)]">
                              {e.name}
                            </span>
                            {e.subName && (
                              <span className="text-[14px] leading-[20px] text-[var(--text-secondary)]">
                                {" "}
                                — {e.subName}
                              </span>
                            )}
                          </div>
                          <Button
                            variant="tertiary"
                            size="small"
                            onClick={() => removeExclusion(e.id)}
                            className="shrink-0"
                          >
                            Remove
                          </Button>
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
                <DrawerHeader>
                  <DrawerTitle>
                    Select {TYPE_LABELS_SINGULAR[flyoutType]} to exclude
                  </DrawerTitle>
                  <DrawerDescription>
                    Zo will not schedule these through the phone. Requests will be transferred to your staff.
                  </DrawerDescription>
                </DrawerHeader>
                <DrawerBody className="flex flex-col gap-4">
                  <div className="flex flex-col gap-2">
                    {getMockItemsForType(flyoutType).map((item) => (
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
                </DrawerBody>
                <DrawerFooter>
                  <Button
                    variant="primary"
                    size="small"
                    onClick={handleAddExclusions}
                    disabled={selectedItemIds.size === 0}
                  >
                    Add
                  </Button>
                </DrawerFooter>
              </>
            )}
          </DrawerContent>
        </Drawer>
      </Section>
    </div>
  );
}
