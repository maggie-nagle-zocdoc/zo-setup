import type { ProjectManifest } from "../types";

export const manifest: ProjectManifest = {
  slug: "zo-setup",
  name: "Zo Setup",
  description: "Guided setup flow for Zo — Zocdoc's AI phonebot. Configure your provider experience.",
  tags: ["zo", "phonebot", "onboarding", "setup"],
  sections: [
    {
      slug: "intro",
      name: "Introduction",
      pageSlugs: ["intro"],
    },
    {
      slug: "section-1",
      name: "Phone lines",
      pageSlugs: ["section-1-task-1", "section-1-task-2", "section-1-task-3"],
    },
    {
      slug: "section-2",
      name: "Scheduling preferences",
      pageSlugs: ["section-2-task-1", "section-2-task-2", "section-2-task-3"],
    },
    {
      slug: "section-3",
      name: "Voice configuration",
      pageSlugs: ["section-3-task-1", "section-3-task-2", "section-3-task-3"],
    },
  ],
  pages: [
    { slug: "intro", name: "Welcome to Zo", description: "Introduction and overview", section: "intro" },
    { slug: "section-1-task-1", name: "Task 1", description: "Phone lines", section: "section-1" },
    { slug: "section-1-task-2", name: "Task 2", description: "Phone lines", section: "section-1" },
    { slug: "section-1-task-3", name: "Task 3", description: "Phone lines", section: "section-1" },
    { slug: "section-2-task-1", name: "Task 1", description: "Scheduling preferences", section: "section-2" },
    { slug: "section-2-task-2", name: "Task 2", description: "Scheduling preferences", section: "section-2" },
    { slug: "section-2-task-3", name: "Task 3", description: "Scheduling preferences", section: "section-2" },
    { slug: "section-3-task-1", name: "Task 1", description: "Voice configuration", section: "section-3" },
    { slug: "section-3-task-2", name: "Task 2", description: "Voice configuration", section: "section-3" },
    { slug: "section-3-task-3", name: "Task 3", description: "Voice configuration", section: "section-3" },
  ],
};
