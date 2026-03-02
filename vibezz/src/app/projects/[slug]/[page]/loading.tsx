import { Container, Section } from "@/components/vibezz";

export default function PageLoading() {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--background-default-white)]">
      <div className="h-[80px] border-b border-[var(--stroke-default)]" />
      <main className="flex-1">
        <Container>
          <div className="pt-6">
            <div className="h-4 w-48 rounded bg-[var(--background-disabled)] animate-pulse" />
          </div>
          <Section size="1">
            <div className="h-[44px] w-64 rounded bg-[var(--background-disabled)] animate-pulse" />
            <div className="mt-4 h-64 rounded bg-[var(--background-disabled)] animate-pulse" />
          </Section>
        </Container>
      </main>
    </div>
  );
}
