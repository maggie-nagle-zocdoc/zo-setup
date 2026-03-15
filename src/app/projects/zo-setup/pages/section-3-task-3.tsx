"use client";

import { useState, useCallback, useEffect, useRef, useContext } from "react";
import {
  Section,
  Header,
  Button,
  IconButton,
  Icon,
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
  FieldLabel,
  TextField,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/vibezz";
import { ZoSetupContinueValidationContext } from "../zo-setup-shell";
import { PLACEHOLDER_LOCATION_NAMES } from "../data";

const PRONUNCIATION_VISITED_STORAGE_KEY = "zo-setup-pronunciation-visited";

export const PROVIDER_PRONUNCIATIONS_STORAGE_KEY = "zo-setup-provider-pronunciations";
export const LOCATION_NAMES_STORAGE_KEY = "zo-setup-location-names";

export interface ProviderPronunciation {
  id: string;
  providerId: string;
  providerName: string;
  pronunciationFirst: string;
  pronunciationLast: string;
  nicknames: string[];
}

export interface LocationNameEntry {
  id: string;
  locationId: string;
  locationName: string;
  neighborhoodNames: string[];
}

function getStoredProviderPronunciations(): ProviderPronunciation[] {
  if (typeof window === "undefined") return [];
  try {
    const s = sessionStorage.getItem(PROVIDER_PRONUNCIATIONS_STORAGE_KEY);
    return s ? (JSON.parse(s) as ProviderPronunciation[]) : [];
  } catch {
    return [];
  }
}

function storeProviderPronunciations(data: ProviderPronunciation[]) {
  try {
    sessionStorage.setItem(PROVIDER_PRONUNCIATIONS_STORAGE_KEY, JSON.stringify(data));
  } catch {
    // ignore
  }
}

function getStoredLocationNames(): LocationNameEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const s = sessionStorage.getItem(LOCATION_NAMES_STORAGE_KEY);
    return s ? (JSON.parse(s) as LocationNameEntry[]) : [];
  } catch {
    return [];
  }
}

function storeLocationNames(data: LocationNameEntry[]) {
  try {
    sessionStorage.setItem(LOCATION_NAMES_STORAGE_KEY, JSON.stringify(data));
  } catch {
    // ignore
  }
}

const MOCK_PROVIDERS = [
  { id: "pp1", name: "Dr. Evelyn Hamilton", subName: "General Surgery" },
  { id: "pp2", name: "Dr. Thalia Hansen", subName: "Primary care" },
  { id: "pp3", name: "Dr. Daniel Lee Okami", subName: "Dermatology" },
  { id: "pp4", name: "Dr. Catalina Alvarez", subName: "Audiology" },
  { id: "pp5", name: "Dr. Marcus Chen", subName: "Cardiology" },
];

const MOCK_LOCATIONS = PLACEHOLDER_LOCATION_NAMES.map((name, i) => ({
  id: `loc${i + 1}`,
  name,
}));

type DrawerType = "provider" | "location" | null;

export default function PronunciationTask() {
  const [providerPronunciations, setProviderPronunciations] = useState<ProviderPronunciation[]>([]);
  const [locationNames, setLocationNames] = useState<LocationNameEntry[]>([]);
  const hasRestoredRef = useRef(false);

  useEffect(() => {
    setProviderPronunciations(getStoredProviderPronunciations());
    setLocationNames(getStoredLocationNames());
  }, []);

  useEffect(() => {
    const id = setTimeout(() => {
      hasRestoredRef.current = true;
    }, 0);
    return () => clearTimeout(id);
  }, []);

  useEffect(() => {
    if (!hasRestoredRef.current) return;
    storeProviderPronunciations(providerPronunciations);
  }, [providerPronunciations]);

  useEffect(() => {
    if (!hasRestoredRef.current) return;
    storeLocationNames(locationNames);
  }, [locationNames]);

  const { setContinueValidationHandler } = useContext(ZoSetupContinueValidationContext);
  useEffect(() => {
    const onContinue = () => {
      try {
        sessionStorage.setItem(PRONUNCIATION_VISITED_STORAGE_KEY, "true");
      } catch {
        // ignore
      }
      return true;
    };
    setContinueValidationHandler(onContinue);
    return () => setContinueValidationHandler(null);
  }, [setContinueValidationHandler]);

  const [drawerType, setDrawerType] = useState<DrawerType>(null);

  // Provider drawer state
  const [providerSelectId, setProviderSelectId] = useState<string>("");
  const [pronunciationFirst, setPronunciationFirst] = useState("");
  const [pronunciationLast, setPronunciationLast] = useState("");
  const [nicknames, setNicknames] = useState<string[]>([]);

  // Location drawer state
  const [locationSelectId, setLocationSelectId] = useState<string>("");
  const [neighborhoodNames, setNeighborhoodNames] = useState<string[]>([]);

  const openProviderDrawer = useCallback(() => {
    setDrawerType("provider");
    setProviderSelectId("");
    setPronunciationFirst("");
    setPronunciationLast("");
    setNicknames([""]);
  }, []);

  const openLocationDrawer = useCallback(() => {
    setDrawerType("location");
    setLocationSelectId("");
    setNeighborhoodNames([""]);
  }, []);

  const closeDrawer = useCallback(() => {
    setDrawerType(null);
  }, []);

  const addNicknameField = useCallback(() => {
    setNicknames((prev) => [...prev, ""]);
  }, []);

  const updateNicknameAt = useCallback((index: number, value: string) => {
    setNicknames((prev) => prev.map((v, i) => (i === index ? value : v)));
  }, []);

  const removeNicknameAt = useCallback((index: number) => {
    setNicknames((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const addNeighborhoodField = useCallback(() => {
    setNeighborhoodNames((prev) => [...prev, ""]);
  }, []);

  const updateNeighborhoodAt = useCallback((index: number, value: string) => {
    setNeighborhoodNames((prev) => prev.map((v, i) => (i === index ? value : v)));
  }, []);

  const removeNeighborhoodAt = useCallback((index: number) => {
    setNeighborhoodNames((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const saveProvider = useCallback(() => {
    if (!providerSelectId) return;
    const provider = MOCK_PROVIDERS.find((p) => p.id === providerSelectId);
    if (!provider) return;
    if (providerPronunciations.some((p) => p.providerId === providerSelectId)) return;
    const entry: ProviderPronunciation = {
      id: `prov-${crypto.randomUUID()}`,
      providerId: providerSelectId,
      providerName: provider.name,
      pronunciationFirst: pronunciationFirst.trim(),
      pronunciationLast: pronunciationLast.trim(),
      nicknames: nicknames.map((s) => s.trim()).filter(Boolean),
    };
    setProviderPronunciations((prev) => [...prev, entry]);
    closeDrawer();
  }, [
    providerSelectId,
    pronunciationFirst,
    pronunciationLast,
    nicknames,
    providerPronunciations,
    closeDrawer,
  ]);

  const saveLocation = useCallback(() => {
    if (!locationSelectId) return;
    const location = MOCK_LOCATIONS.find((l) => l.id === locationSelectId);
    if (!location) return;
    if (locationNames.some((l) => l.locationId === locationSelectId)) return;
    const entry: LocationNameEntry = {
      id: `loc-${crypto.randomUUID()}`,
      locationId: locationSelectId,
      locationName: location.name,
      neighborhoodNames: neighborhoodNames.map((s) => s.trim()).filter(Boolean),
    };
    setLocationNames((prev) => [...prev, entry]);
    closeDrawer();
  }, [locationSelectId, neighborhoodNames, locationNames, closeDrawer]);

  const removeProvider = useCallback((id: string) => {
    setProviderPronunciations((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const removeLocation = useCallback((id: string) => {
    setLocationNames((prev) => prev.filter((l) => l.id !== id));
  }, []);

  const providerOptions = MOCK_PROVIDERS.filter(
    (p) => !providerPronunciations.some((e) => e.providerId === p.id)
  );
  const locationOptions = MOCK_LOCATIONS.filter(
    (l) => !locationNames.some((e) => e.locationId === l.id)
  );

  return (
    <div className="flex-1 flex flex-col">
      <Section size="2">
        <Header
          title="Pronunciation"
          subbody="Adding pronunciation and nicknames will help Zo identify providers and locations properly on calls. This can be added any time."
        />

        <div className="mt-8 flex flex-col gap-6">
          {/* Provider pronunciation section */}
          <div className="rounded-xl border border-[var(--stroke-default)] bg-[var(--background-default-white)] p-6 flex flex-col gap-4">
            <div className="flex gap-2 items-start">
              <Icon name="person" size="24" className="text-[var(--icon-default)] shrink-0 mt-0.5" />
              <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                <div className="flex items-center gap-1 flex-wrap">
                  <h2 className="text-[16px] leading-[20px] font-semibold text-[var(--text-default)] md:text-[18px] md:leading-[24px]">
                    Provider pronunciation
                  </h2>
                  <span className="text-[var(--text-whisper)] font-medium text-[16px] leading-[26px] md:text-[18px] md:leading-[24px]">
                    (Optional)
                  </span>
                </div>
                <p className="text-[14px] leading-[20px] text-[var(--text-whisper)]">
                  Add phonetic spelling and nicknames for providers as needed
                </p>
              </div>
            </div>
            <div className="border-t border-[var(--stroke-default)] pt-4 flex flex-col gap-4">
              {providerPronunciations.length > 0 ? (
                <>
                  <div className="flex items-center gap-4 pb-2 border-b border-[var(--stroke-default)]">
                    <div className="min-w-0 flex-1 grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <span className="text-[12px] leading-[16px] font-medium text-[var(--text-whisper)]">
                        Provider
                      </span>
                      <span className="text-[12px] leading-[16px] font-medium text-[var(--text-whisper)]">
                        Pronunciation
                      </span>
                      <span className="text-[12px] leading-[16px] font-medium text-[var(--text-whisper)]">
                        Nicknames
                      </span>
                    </div>
                    <div className="w-8 shrink-0" aria-hidden />
                  </div>
                  <ul className="flex flex-col gap-2">
                  {providerPronunciations.map((p) => (
                    <li
                      key={p.id}
                      className="flex items-center gap-4 py-2 border-b border-[var(--stroke-default)] last:border-b-0"
                    >
                      <div className="min-w-0 flex-1 grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <span className="text-[14px] leading-[20px] font-medium text-[var(--text-default)]">
                          {p.providerName}
                        </span>
                        <span className="text-[14px] leading-[20px] text-[var(--text-secondary)]">
                          {p.pronunciationFirst || p.pronunciationLast
                            ? [p.pronunciationFirst, p.pronunciationLast].filter(Boolean).join(" ")
                            : "N/A"}
                        </span>
                        <span className="text-[14px] leading-[20px] text-[var(--text-secondary)]">
                          {p.nicknames.length > 0 ? p.nicknames.join(", ") : "N/A"}
                        </span>
                      </div>
                      <IconButton
                        icon="delete"
                        size="small"
                        aria-label={`Remove ${p.providerName}`}
                        onClick={() => removeProvider(p.id)}
                        className="shrink-0"
                      />
                    </li>
                  ))}
                </ul>
                </>
              ) : (
                <p className="text-[14px] leading-[20px] text-[var(--text-whisper)]">
                  No provider pronunciations added
                </p>
              )}
              <Button
                variant="secondary"
                size="small"
                onClick={openProviderDrawer}
                className="w-fit"
                disabled={providerOptions.length === 0}
              >
                Add provider pronunciation
              </Button>
            </div>
          </div>

          {/* Location names section */}
          <div className="rounded-xl border border-[var(--stroke-default)] bg-[var(--background-default-white)] p-6 flex flex-col gap-4">
            <div className="flex gap-2 items-start">
              <Icon name="location_on" size="24" className="text-[var(--icon-default)] shrink-0 mt-0.5" />
              <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                <div className="flex items-center gap-1 flex-wrap">
                  <h2 className="text-[16px] leading-[20px] font-semibold text-[var(--text-default)] md:text-[18px] md:leading-[24px]">
                    Location names
                  </h2>
                  <span className="text-[var(--text-whisper)] font-medium text-[16px] leading-[26px] md:text-[18px] md:leading-[24px]">
                    (Optional)
                  </span>
                </div>
                <p className="text-[14px] leading-[20px] text-[var(--text-whisper)]">
                  Add neighborhood names or nicknames for locations
                </p>
              </div>
            </div>
            <div className="border-t border-[var(--stroke-default)] pt-4 flex flex-col gap-4">
              {locationNames.length > 0 ? (
                <>
                  <div className="flex items-center gap-4 pb-2 border-b border-[var(--stroke-default)]">
                    <div className="min-w-0 flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <span className="text-[12px] leading-[16px] font-medium text-[var(--text-whisper)]">
                        Location
                      </span>
                      <span className="text-[12px] leading-[16px] font-medium text-[var(--text-whisper)]">
                        Neighborhood name
                      </span>
                    </div>
                    <div className="w-8 shrink-0" aria-hidden />
                  </div>
                  <ul className="flex flex-col gap-2">
                  {locationNames.map((l) => (
                    <li
                      key={l.id}
                      className="flex items-center gap-4 py-2 border-b border-[var(--stroke-default)] last:border-b-0"
                    >
                      <div className="min-w-0 flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <span className="text-[14px] leading-[20px] font-medium text-[var(--text-default)]">
                          {l.locationName}
                        </span>
                        <span className="text-[14px] leading-[20px] text-[var(--text-secondary)]">
                          {l.neighborhoodNames.length > 0
                            ? l.neighborhoodNames.join(", ")
                            : "N/A"}
                        </span>
                      </div>
                      <IconButton
                        icon="delete"
                        size="small"
                        aria-label={`Remove ${l.locationName}`}
                        onClick={() => removeLocation(l.id)}
                        className="shrink-0"
                      />
                    </li>
                  ))}
                </ul>
                </>
              ) : (
                <p className="text-[14px] leading-[20px] text-[var(--text-whisper)]">
                  No location names added
                </p>
              )}
              <Button
                variant="secondary"
                size="small"
                onClick={openLocationDrawer}
                className="w-fit"
                disabled={locationOptions.length === 0}
              >
                Add location name
              </Button>
            </div>
          </div>
        </div>

        {/* Provider drawer */}
        <Drawer open={drawerType === "provider"} onOpenChange={(open) => !open && closeDrawer()}>
          <DrawerContent showCloseButton>
            <DrawerHeader>
              <DrawerTitle>Add provider pronunciation</DrawerTitle>
              <DrawerDescription>
                Add phonetic spelling and nicknames so Zo can recognize providers on calls.
              </DrawerDescription>
            </DrawerHeader>
            <DrawerBody className="flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <FieldLabel size="default" required>
                  Select a provider
                </FieldLabel>
                <Select value={providerSelectId} onValueChange={setProviderSelectId}>
                  <SelectTrigger size="default" className="w-full">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {providerOptions.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-2">
                <FieldLabel size="default">
                  Pronunciation
                </FieldLabel>
                <p className="text-[14px] leading-[20px] text-[var(--text-whisper)]">
                  Write the phonetic spelling of the provider&apos;s name and preview Zo&apos;s
                  pronunciation below.
                </p>
                <div className="flex gap-3">
                  <TextField
                    placeholder="First name"
                    value={pronunciationFirst}
                    onChange={(e) => setPronunciationFirst(e.target.value)}
                    size="default"
                    className="flex-1"
                  />
                  <TextField
                    placeholder="Last name"
                    value={pronunciationLast}
                    onChange={(e) => setPronunciationLast(e.target.value)}
                    size="default"
                    className="flex-1"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <FieldLabel size="default">
                  Nicknames
                </FieldLabel>
                <p className="text-[14px] leading-[20px] text-[var(--text-whisper)]">
                  List any nicknames patients might use when calling to help Zo identify the
                  provider on calls.
                </p>
                <ul className="flex flex-col gap-3">
                  {nicknames.map((value, i) => (
                    <li key={i} className="flex gap-2 items-center">
                      <TextField
                        placeholder="Nickname"
                        value={value}
                        onChange={(e) => updateNicknameAt(i, e.target.value)}
                        size="default"
                        className="flex-1 min-w-0"
                      />
                      <IconButton
                        icon="delete"
                        size="small"
                        aria-label={`Remove nickname ${i + 1}`}
                        onClick={() => removeNicknameAt(i)}
                        className="shrink-0"
                      />
                    </li>
                  ))}
                </ul>
                <Button variant="secondary" size="small" onClick={addNicknameField} className="w-fit">
                  Add another
                </Button>
              </div>
            </DrawerBody>
            <DrawerFooter>
              <Button variant="primary" size="default" onClick={saveProvider} disabled={!providerSelectId}>
                Save
              </Button>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>

        {/* Location drawer */}
        <Drawer open={drawerType === "location"} onOpenChange={(open) => !open && closeDrawer()}>
          <DrawerContent showCloseButton>
            <DrawerHeader>
              <DrawerTitle>Add location name</DrawerTitle>
              <DrawerDescription>
                Add custom or neighborhood names so Zo can identify locations on calls.
              </DrawerDescription>
            </DrawerHeader>
            <DrawerBody className="flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <FieldLabel size="default" required>
                  Select a location
                </FieldLabel>
                <Select value={locationSelectId} onValueChange={setLocationSelectId}>
                  <SelectTrigger size="default" className="w-full">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {locationOptions.map((l) => (
                      <SelectItem key={l.id} value={l.id}>
                        {l.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-2">
                <FieldLabel size="default">
                  Neighborhood name
                </FieldLabel>
                <p className="text-[14px] leading-[20px] text-[var(--text-whisper)]">
                  Add neighborhood names that patients may use on calls. This helps Zo identify
                  which location patients are referring to.
                </p>
                <ul className="flex flex-col gap-3">
                  {neighborhoodNames.map((value, i) => (
                    <li key={i} className="flex gap-2 items-center">
                      <TextField
                        placeholder="Neighborhood"
                        value={value}
                        onChange={(e) => updateNeighborhoodAt(i, e.target.value)}
                        size="default"
                        className="flex-1 min-w-0"
                      />
                      <IconButton
                        icon="delete"
                        size="small"
                        aria-label={`Remove neighborhood ${i + 1}`}
                        onClick={() => removeNeighborhoodAt(i)}
                        className="shrink-0"
                      />
                    </li>
                  ))}
                </ul>
                <Button variant="secondary" size="small" onClick={addNeighborhoodField} className="w-fit">
                  Add another
                </Button>
              </div>
            </DrawerBody>
            <DrawerFooter>
              <Button variant="primary" size="default" onClick={saveLocation} disabled={!locationSelectId}>
                Save
              </Button>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      </Section>
    </div>
  );
}
