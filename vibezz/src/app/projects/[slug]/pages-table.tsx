"use client";

import { useRouter } from "next/navigation";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/vibezz";
import type { ProjectPage, ProjectSection } from "../types";

interface PagesTableProps {
  pages: ProjectPage[];
  projectSlug: string;
  /** When provided, pages are grouped by section (e.g. Zo setup flow) */
  sections?: ProjectSection[];
}

export function PagesTable({ pages, projectSlug, sections }: PagesTableProps) {
  const router = useRouter();

  const pageMap = new Map(pages.map((p) => [p.slug, p]));

  const rows = sections
    ? sections.flatMap((sec) =>
        sec.pageSlugs
          .map((slug) => pageMap.get(slug))
          .filter(Boolean)
          .map((page) => ({ page: page!, sectionName: sec.name }))
      )
    : pages.map((page) => ({ page, sectionName: null }));

  return (
    <Table>
      <TableHeader>
        <TableRow className="border-t-0">
          {sections ? <TableHead>Section</TableHead> : null}
          <TableHead>Name</TableHead>
          <TableHead>Description</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.length > 0 ? (
          rows.map(({ page, sectionName }) => (
            <TableRow
              key={page.slug}
              className="cursor-pointer"
              onClick={() => router.push(`/projects/${projectSlug}/${page.slug}`)}
            >
              {sections ? (
                <TableCell>
                  <span className="text-[12px] leading-[16px] text-[var(--text-secondary)]">
                    {sectionName}
                  </span>
                </TableCell>
              ) : null}
              <TableCell>
                <span className="font-semibold">{page.name}</span>
              </TableCell>
              <TableCell>{page.description}</TableCell>
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={sections ? 3 : 2} className="h-24 text-center text-[var(--text-whisper)]">
              No pages.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
