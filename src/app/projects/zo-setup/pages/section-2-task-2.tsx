"use client";

import { useState, useEffect, useRef } from "react";
import {
  Section,
  Header,
  Checkbox,
  SwitchField,
} from "@/components/vibezz";

export const SCHEDULING_OPTIONS_STORAGE_KEY = "zo-setup-scheduling-options";

export interface SchedulingOptionsState {
  requiredInsuranceCarrier: boolean;
  requiredPlan: boolean;
  requiredMemberId: boolean;
  transferSelfPay: boolean;
  transferSwitchProvider: boolean;
  smsConfirmations: boolean;
}

const DEFAULT_OPTIONS: SchedulingOptionsState = {
  requiredInsuranceCarrier: false,
  requiredPlan: false,
  requiredMemberId: false,
  transferSelfPay: false,
  transferSwitchProvider: false,
  smsConfirmations: true,
};

function getStoredOptions(): SchedulingOptionsState | null {
  if (typeof window === "undefined") return null;
  try {
    const s = sessionStorage.getItem(SCHEDULING_OPTIONS_STORAGE_KEY);
    if (!s) return null;
    const parsed = JSON.parse(s) as Partial<SchedulingOptionsState>;
    return { ...DEFAULT_OPTIONS, ...parsed };
  } catch {
    return null;
  }
}

function storeOptions(data: SchedulingOptionsState) {
  try {
    sessionStorage.setItem(SCHEDULING_OPTIONS_STORAGE_KEY, JSON.stringify(data));
  } catch {
    // ignore
  }
}

export default function SchedulingOptionsTask() {
  // Use stable default for initial render so server and client match (avoids hydration mismatch from sessionStorage)
  const [options, setOptions] = useState<SchedulingOptionsState>(DEFAULT_OPTIONS);
  const hasRestoredRef = useRef(false);

  useEffect(() => {
    const stored = getStoredOptions();
    if (stored) setOptions(stored);
    hasRestoredRef.current = true;
  }, []);

  useEffect(() => {
    if (!hasRestoredRef.current) return;
    storeOptions(options);
  }, [options]);

  return (
    <div className="flex-1 flex flex-col">
      <Section size="2">
        <Header
          title="Scheduling options"
          subbody="What information should Zo collect? When should Zo transfer to staff? How should Zo confirm with patients?"
        />

        <div className="mt-8 flex flex-col gap-8">
          <section className="flex flex-col gap-4">
            <h2 className="text-[18px] leading-[24px] font-semibold text-[var(--text-default)]">
              What information should Zo collect from patients before scheduling?
            </h2>
            <p className="text-[14px] leading-[20px] text-[var(--text-secondary)]">
              Zo will ask for any options you select below before completing a scheduling action.
            </p>
            <div className="flex flex-col gap-3">
              <Checkbox
                size="small"
                label="Insurance carrier"
                checked={options.requiredInsuranceCarrier}
                onCheckedChange={(checked) =>
                  setOptions((prev) => ({ ...prev, requiredInsuranceCarrier: checked === true }))
                }
              />
              <Checkbox
                size="small"
                label="Plan"
                checked={options.requiredPlan}
                onCheckedChange={(checked) =>
                  setOptions((prev) => ({ ...prev, requiredPlan: checked === true }))
                }
              />
              <Checkbox
                size="small"
                label="Member ID"
                checked={options.requiredMemberId}
                onCheckedChange={(checked) =>
                  setOptions((prev) => ({ ...prev, requiredMemberId: checked === true }))
                }
              />
            </div>
          </section>

          <section className="flex flex-col gap-4">
            <h2 className="text-[18px] leading-[24px] font-semibold text-[var(--text-default)]">
              When should Zo transfer scheduling calls to staff?
            </h2>
            <p className="text-[14px] leading-[20px] text-[var(--text-secondary)]">
              When enabled, Zo will transfer these calls to your staff instead of scheduling.
            </p>
            <div className="flex flex-col gap-4">
              <SwitchField
                size="small"
                label="Transfer self-pay patients"
                description="Calls from patients without insurance will be transferred to staff."
                checked={options.transferSelfPay}
                onCheckedChange={(checked) =>
                  setOptions((prev) => ({ ...prev, transferSelfPay: checked === true }))
                }
              />
              <SwitchField
                size="small"
                label="Transfer existing patients requesting to switch providers"
                description="Calls from existing patients who want to change providers will be transferred to staff."
                checked={options.transferSwitchProvider}
                onCheckedChange={(checked) =>
                  setOptions((prev) => ({ ...prev, transferSwitchProvider: checked === true }))
                }
              />
            </div>
          </section>

          <section className="flex flex-col gap-4">
            <h2 className="text-[18px] leading-[24px] font-semibold text-[var(--text-default)]">
              Should Zo send SMS confirmations to patients?
            </h2>
            <SwitchField
              size="small"
              label="Send SMS confirmations"
              description="Zo can send SMS on behalf of your practice to confirm scheduling actions (e.g. new appointments, reschedules)."
              checked={options.smsConfirmations}
              onCheckedChange={(checked) =>
                setOptions((prev) => ({ ...prev, smsConfirmations: checked === true }))
              }
            />
          </section>
        </div>
      </Section>
    </div>
  );
}
