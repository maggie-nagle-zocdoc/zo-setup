import { notFound } from "next/navigation";
import NextLink from "next/link";
import { Nav, Logo, Container, Section, Header, Link, Badge } from "@/components/vibezz";
import { projects } from "../registry";
import { PagesTable } from "./pages-table";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function ProjectPage({ params }: Props) {
  const { slug } = await params;
  const project = projects.find((p) => p.slug === slug);

  if (!project) notFound();

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
        right={
          <Link href="/" size="small">
            Home
          </Link>
        }
      />

      <main className="flex-1">
        <Container>
          <Section size="2">
            {/* Breadcrumb */}
            <nav className="mb-4 flex items-center gap-1.5 text-[14px] leading-[20px] text-[var(--text-secondary)]">
              <NextLink href="/" className="hover:text-[var(--text-link)] transition-colors">
                Home
              </NextLink>
              <span>/</span>
              <span className="text-[var(--text-default)] font-semibold">{project.name}</span>
            </nav>

            <Header title={project.name} subbody={project.description} />

            {project.tags.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {project.tags.map((tag) => (
                  <Badge key={tag} variant="info">{tag}</Badge>
                ))}
              </div>
            )}

            <div className="mt-8">
              <PagesTable
                pages={project.pages}
                projectSlug={project.slug}
                sections={project.sections}
              />
            </div>
          </Section>
        </Container>
      </main>
    </div>
  );
}
