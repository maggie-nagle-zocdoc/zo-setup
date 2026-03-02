import { Container, Section } from "@/components/vibezz";

export default function ProjectLoading() {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--background-default-white)]">
      <div className="h-[80px] border-b border-[var(--stroke-default)]" />
      <main className="flex-1">
        <Container>
          <Section size="2">
            <div className="mb-4 h-4 w-32 rounded bg-[var(--background-disabled)] animate-pulse" />
            <div className="h-[44px] w-64 rounded bg-[var(--background-disabled)] animate-pulse" />
            <div className="mt-2 h-4 w-48 rounded bg-[var(--background-disabled)] animate-pulse" />
            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="rounded-lg border border-[var(--stroke-default)] p-5">
                  <div className="h-5 w-24 rounded bg-[var(--background-disabled)] animate-pulse" />
                  <div className="mt-2 h-4 w-full rounded bg-[var(--background-disabled)] animate-pulse" />
                </div>
              ))}
            </div>
          </Section>
        </Container>
      </main>
    </div>
  );
}
