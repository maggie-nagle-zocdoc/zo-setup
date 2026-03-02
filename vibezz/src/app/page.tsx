import NextLink from "next/link";
import { Nav, Logo, Container, Section, Button, Icon } from "@/components/vibezz";

/**
 * Zocdoc homepage wireframe — entry point for the Zo setup flow.
 * Providers land here and can start "Set up Zo" to begin the guided setup.
 */
export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--background-default-white)]">
      <Nav
        sticky
        variant="default"
        left={
          <NextLink href="/" aria-label="Zocdoc home">
            <Logo size="small" />
          </NextLink>
        }
      />

      <main className="flex-1">
        <Container>
          <Section size="2">
            <h1 className="text-[24px] leading-[32px] font-semibold text-[var(--text-default)]">
              Good afternoon
            </h1>

            <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
              {/* Left: main content — insights + To do (with Zo task) */}
              <div className="flex flex-col gap-4 lg:col-span-2">
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  <div className="h-24 rounded-lg border border-[var(--stroke-default)] bg-[var(--background-disabled)]" aria-hidden />
                  <div className="h-24 rounded-lg border border-[var(--stroke-default)] bg-[var(--background-disabled)]" aria-hidden />
                  <div className="h-24 rounded-lg border border-[var(--stroke-default)] bg-[var(--background-disabled)]" aria-hidden />
                </div>
                <div className="flex flex-col gap-3">
                  <h3 className="text-[18px] leading-[24px] font-semibold text-[var(--text-default)]">
                    To do
                  </h3>
                  <div className="min-h-[112px] rounded-xl border-2 border-[var(--stroke-default)] bg-[var(--background-disabled)]" aria-hidden />
                  {/* Zo task — real content in To do section */}
                  <div className="min-h-[112px] p-4 rounded-xl border-2 border-[var(--stroke-charcoal)] bg-[var(--background-default-greige)] flex flex-col justify-center">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--background-default-white)] border border-[var(--stroke-default)]">
                          <Icon name="smart_toy" size="24" className="text-[var(--icon-default)]" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-[16px] leading-[24px] font-semibold text-[var(--text-default)]">
                            Finish setting up Zo
                          </h3>
                          <p className="text-[14px] leading-[20px] text-[var(--text-secondary)]">
                            You have set up tasks to complete before Zo can begin answering your phone
                          </p>
                        </div>
                      </div>
                      <NextLink href="/projects/zo-setup/intro" className="shrink-0">
                        <Button variant="secondary" size="default">
                          Set up Zo
                        </Button>
                      </NextLink>
                    </div>
                  </div>
                  <div className="min-h-[112px] rounded-xl border-2 border-[var(--stroke-default)] bg-[var(--background-disabled)]" aria-hidden />
                  <div className="min-h-[112px] rounded-xl border-2 border-[var(--stroke-default)] bg-[var(--background-disabled)]" aria-hidden />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="h-20 rounded-lg border border-[var(--stroke-default)] bg-[var(--background-disabled)]" aria-hidden />
                  <div className="h-20 rounded-lg border border-[var(--stroke-default)] bg-[var(--background-disabled)]" aria-hidden />
                </div>
              </div>

              {/* Right: wireframe boxes only */}
              <div className="flex flex-col gap-4 lg:col-span-1">
                <div className="h-32 rounded-lg border border-[var(--stroke-default)] bg-[var(--background-disabled)]" aria-hidden />
                <div className="h-24 rounded-lg border border-[var(--stroke-default)] bg-[var(--background-disabled)]" aria-hidden />
                <div className="h-24 rounded-lg border border-[var(--stroke-default)] bg-[var(--background-disabled)]" aria-hidden />
                <div className="h-40 rounded-lg border border-[var(--stroke-default)] bg-[var(--background-disabled)]" aria-hidden />
              </div>
            </div>
          </Section>
        </Container>
      </main>
    </div>
  );
}
