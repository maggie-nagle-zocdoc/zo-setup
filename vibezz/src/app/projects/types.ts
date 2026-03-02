export interface ProjectPage {
  slug: string;
  name: string;
  description: string;
  /** Optional section key for grouping (e.g. "intro", "section-1") */
  section?: string;
}

export interface ProjectSection {
  slug: string;
  name: string;
  pageSlugs: string[];
}

export interface ProjectManifest {
  slug: string;
  name: string;
  description: string;
  tags: string[];
  pages: ProjectPage[];
  /** Optional sections for multi-section flows (e.g. Zo setup) */
  sections?: ProjectSection[];
}
