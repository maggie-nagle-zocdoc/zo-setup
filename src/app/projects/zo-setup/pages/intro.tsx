"use client";

const SECTIONS = [
  "Set up your phone lines",
  "Configure your scheduling preferences",
  "Fine tune your practice's voice",
];

export default function ZoSetupIntro() {
  return (
    <div className="flex flex-1 min-h-0 w-full flex-col justify-center">
      <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-[72px]">
        {/* Left: image placeholder — fills column */}
        <div className="flex min-h-0 w-full items-center">
          <div
            className="aspect-[4/3] w-full bg-[var(--background-disabled)] rounded-lg"
            aria-hidden
          />
        </div>
        {/* Right: What to expect — fills column */}
        <div className="flex min-h-0 w-full flex-col justify-center px-4 py-6 sm:px-0 sm:pl-8 sm:py-8">
          <h2 className="text-[20px] leading-[26px] font-semibold text-[var(--text-default)] md:text-[24px] md:leading-[32px]">
            What to expect
          </h2>
          <ol className="mt-4 list-decimal list-inside space-y-2 text-[16px] leading-[26px] text-[var(--text-default)]">
            {SECTIONS.map((label, i) => (
              <li key={i}>{label}</li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}
