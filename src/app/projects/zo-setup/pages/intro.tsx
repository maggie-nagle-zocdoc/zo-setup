"use client";

import Image from "next/image";

const STEPS = [
  {
    icon: "/Zo-Smart-Routing.svg",
    title: "Set up your Zo phone lines",
    description:
      "Tell us how your phones work today and map locations and transfer numbers to each line",
  },
  {
    icon: "/Zo-Scheduling-Rules.svg",
    title: "Tell us your scheduling preferences",
    description:
      "Set up scheduling requirements and tell Zo what appointments to schedule vs. not schedule",
  },
  {
    icon: "/Zo-Multilingual-Support.svg",
    title: "Fine tune your in-call experience",
    description:
      "Pick the voice of Zo, setup messages, and give pronunciation guidance",
  },
] as const;

export default function ZoSetupIntro() {
  return (
    <div className="flex flex-1 min-h-0 w-full flex-col justify-center">
      <div className="flex flex-col gap-5">
        <h2 className="text-[24px] leading-[32px] font-semibold text-[var(--text-default)]">
          What to expect
        </h2>
        {STEPS.map((step, i) => (
          <div
            key={step.title}
            className="flex gap-4 items-center rounded-2xl bg-[var(--background-default-white)] px-6 py-4 shadow-[0px_2px_16px_0px_rgba(0,0,0,0.2)]"
          >
            <div className="size-[100px] shrink-0 flex items-center justify-center overflow-hidden rounded-lg">
              <Image
                src={step.icon}
                alt=""
                width={100}
                height={100}
                className="object-contain"
              />
            </div>
            <div className="min-w-0 flex-1 flex flex-col gap-1">
              <p className="text-[20px] leading-[28px] font-semibold text-[var(--text-default)]">
                {i + 1}. {step.title}
              </p>
              <p className="text-[16px] leading-[26px] font-medium text-[var(--text-default)]">
                {step.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
