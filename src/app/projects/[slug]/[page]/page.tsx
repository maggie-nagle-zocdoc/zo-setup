import { notFound } from "next/navigation";
import dynamic from "next/dynamic";
import { Suspense } from "react";
import NextLink from "next/link";
import { IconButton, Logo, Button } from "@/components/vibezz";
import { ZoSetupShell } from "../../zo-setup/zo-setup-shell";
import { projects } from "../../registry";

export function generateStaticParams() {
  return projects.flatMap((project) =>
    project.pages.map((page) => ({ slug: project.slug, page: page.slug }))
  );
}

interface Props {
  params: Promise<{ slug: string; page: string }>;
}

function getOrderedPageSlugs(project: { sections?: { pageSlugs: string[] }[]; pages: { slug: string }[] }) {
  if (project.sections?.length) {
    return project.sections.flatMap((s) => s.pageSlugs);
  }
  return project.pages.map((p) => p.slug);
}

export default async function DynamicPage({ params }: Props) {
  const { slug, page } = await params;
  const project = projects.find((p) => p.slug === slug);

  if (!project) notFound();

  const pageInfo = project.pages.find((p) => p.slug === page);
  if (!pageInfo) notFound();

  const PageComponent = dynamic(
    () => import(`../../${slug}/pages/${page}`),
    {
      loading: () => (
        <div className="flex-1 flex items-center justify-center">
          <div className="h-64 w-full max-w-2xl rounded bg-[var(--background-disabled)] animate-pulse" />
        </div>
      ),
    }
  );

  const isZoSetup = slug === "zo-setup" && project.sections?.length;
  const isZoSetupComplete = slug === "zo-setup" && page === "complete";

  if (isZoSetupComplete) {
    return (
      <div className="h-screen flex flex-col bg-[var(--background-default-white)]">
        <header className="flex shrink-0 h-[80px] items-center justify-between border-b border-[var(--stroke-default)] bg-[var(--background-default-white)] px-6">
          <NextLink href="/" aria-label="Zocdoc home" className="shrink-0">
            <Logo size="small" />
          </NextLink>
          <NextLink href="/">
            <Button variant="ghost" size="small">
              Save and exit
            </Button>
          </NextLink>
        </header>
        <main className="flex-1 min-h-0 overflow-auto">
          <div className="flex flex-col w-full mx-auto px-6 max-w-[800px] min-h-full py-12">
            <Suspense
              fallback={
                <div className="flex-1 flex items-center justify-center">
                  <div className="h-64 w-full max-w-2xl rounded bg-[var(--background-disabled)] animate-pulse" />
                </div>
              }
            >
              <PageComponent />
            </Suspense>
          </div>
        </main>
      </div>
    );
  }

  if (isZoSetup) {
    const orderedPageSlugs = getOrderedPageSlugs(project);
    return (
      <ZoSetupShell
        orderedPageSlugs={orderedPageSlugs}
        sections={project.sections!}
        pages={project.pages}
        currentPageSlug={page}
        currentPageName={pageInfo.name}
        currentPageDescription={pageInfo.description}
      >
        <Suspense
          fallback={
            <div className="flex-1 flex items-center justify-center">
              <div className="h-64 w-full max-w-2xl rounded bg-[var(--background-disabled)] animate-pulse" />
            </div>
          }
        >
          <PageComponent />
        </Suspense>
      </ZoSetupShell>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-[var(--background-default-white)]">
      <header className="flex items-center gap-3 px-4 py-2 border-b border-[var(--stroke-default)]">
        <NextLink href={`/projects/${slug}`}>
          <IconButton icon="arrow_back" size="small" aria-label={`Back to ${project.name}`} />
        </NextLink>
        <div className="flex items-baseline gap-2">
          <span className="text-[14px] leading-[20px] font-semibold text-[var(--text-default)]">
            {pageInfo.name}
          </span>
          <span className="text-[12px] leading-[16px] text-[var(--text-secondary)]">
            {pageInfo.description}
          </span>
        </div>
      </header>

      <Suspense>
        <PageComponent />
      </Suspense>
    </div>
  );
}
