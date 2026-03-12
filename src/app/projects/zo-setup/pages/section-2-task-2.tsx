"use client";

import { useState, useEffect, useRef } from "react";
import {
  Section,
  Header,
  Checkbox,
  SwitchField,
  RadioGroup,
  RadioField,
} from "@/components/vibezz";

export const SCHEDULING_OPTIONS_STORAGE_KEY = "zo-setup-scheduling-options";

export interface SchedulingOptionsState {
  requiredInsuranceCarrier: boolean;
  requiredPlan: boolean;
  requiredMemberId: boolean;
  requiredAddress: boolean;
  requiredEmail: boolean;
  transferSelfPay: boolean;
  transferSwitchProvider: boolean;
  smsConfirmations: boolean;
}

const DEFAULT_OPTIONS: SchedulingOptionsState = {
  requiredInsuranceCarrier: false,
  requiredPlan: false,
  requiredMemberId: false,
  requiredAddress: false,
  requiredEmail: false,
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
        <Header title="Scheduling options" />

        <div className="mt-8 flex flex-col gap-8">
          <section className="flex flex-col gap-1">
            <div className="flex flex-col gap-1">
              <h2 className="text-[18px] leading-[24px] font-semibold text-[var(--text-default)]">
                Patient information requirements
              </h2>
              <p className="text-[14px] leading-[20px] text-[var(--text-whisper)]">
                Control what information Zo asks patients for before scheduling an appointment
              </p>
            </div>
            <div className="flex flex-col gap-3 mt-4">
              <Checkbox size="small" label="First and last name" checked disabled />
              <Checkbox size="small" label="Phone number" checked disabled />
              <Checkbox size="small" label="Date of birth" checked disabled />
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
                label="Insurance plan"
                checked={options.requiredPlan}
                onCheckedChange={(checked) =>
                  setOptions((prev) => ({ ...prev, requiredPlan: checked === true }))
                }
              />
              <Checkbox
                size="small"
                label="Insurance member ID"
                checked={options.requiredMemberId}
                onCheckedChange={(checked) =>
                  setOptions((prev) => ({ ...prev, requiredMemberId: checked === true }))
                }
              />
              <Checkbox
                size="small"
                label="Address"
                checked={options.requiredAddress}
                onCheckedChange={(checked) =>
                  setOptions((prev) => ({ ...prev, requiredAddress: checked === true }))
                }
              />
              <Checkbox
                size="small"
                label="Email address"
                checked={options.requiredEmail}
                onCheckedChange={(checked) =>
                  setOptions((prev) => ({ ...prev, requiredEmail: checked === true }))
                }
              />
            </div>
          </section>

          <section className="flex flex-col gap-4 border-t border-[var(--stroke-default)] pt-8">
            <h2 className="text-[18px] leading-[24px] font-semibold text-[var(--text-default)]">
              Transfer options
            </h2>
            <div className="flex flex-col gap-4">
              <SwitchField
                label="Transfer self-pay patients"
                description="Calls from patients without insurance will be transferred to staff."
                checked={options.transferSelfPay}
                onCheckedChange={(checked) =>
                  setOptions((prev) => ({ ...prev, transferSelfPay: checked === true }))
                }
              />
              <SwitchField
                label="Transfer existing patients requesting to switch providers"
                description="Calls from existing patients who want to change providers will be transferred to staff."
                checked={options.transferSwitchProvider}
                onCheckedChange={(checked) =>
                  setOptions((prev) => ({ ...prev, transferSwitchProvider: checked === true }))
                }
              />
            </div>
          </section>

          <section className="flex flex-col gap-4 border-t border-[var(--stroke-default)] pt-8">
            <h2 className="text-[18px] leading-[24px] font-semibold text-[var(--text-default)]">
              Patient SMS options
            </h2>
            <RadioGroup
              label="When prompted, should Zo send SMS messages to patients?"
              value={options.smsConfirmations ? "yes" : "no"}
              onValueChange={(value) =>
                setOptions((prev) => ({ ...prev, smsConfirmations: value === "yes" }))
              }
              className="flex flex-col gap-2"
            >
              <RadioField
                value="yes"
                label="Yes"
                description="Send SMS to patients to confirm scheduling actions (e.g. new appointments, reschedules, cancellations)"
              />
              <RadioField
                value="no"
                label="No"
                description="I have an automated SMS system that already does this"
              />
            </RadioGroup>
          </section>
        </div>
      </Section>
    </div>
  );
}
