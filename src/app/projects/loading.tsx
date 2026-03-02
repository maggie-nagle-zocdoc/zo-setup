import { Container, Section } from "@/components/vibezz";

export default function ProjectsLoading() {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--background-default-white)]">
      <div className="h-[80px] border-b border-[var(--stroke-default)]" />
      <main className="flex-1">
        <Container>
          <Section size="2">
            <div className="h-[44px] w-48 rounded bg-[var(--background-disabled)] animate-pulse" />
            <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="rounded-lg border border-[var(--stroke-default)] p-6">
                  <div className="h-5 w-32 rounded bg-[var(--background-disabled)] animate-pulse" />
                  <div className="mt-2 h-4 w-full rounded bg-[var(--background-disabled)] animate-pulse" />
                  <div className="mt-3 flex gap-1.5">
                    <div className="h-5 w-16 rounded bg-[var(--background-disabled)] animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          </Section>
        </Container>
      </main>
    </div>
  );
}
