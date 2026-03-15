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
      name: "Scheduling",
      pageSlugs: ["section-2-task-2", "section-2-task-1"],
    },
    {
      slug: "section-3",
      name: "In-call experience",
      pageSlugs: ["section-3-task-1", "section-3-task-2", "section-3-task-3", "section-3-task-4"],
    },
    {
      slug: "review",
      name: "Review",
      pageSlugs: ["section-3-task-5"],
    },
  ],
  pages: [
    { slug: "intro", name: "Welcome to Zo", description: "Introduction and overview", section: "intro" },
    { slug: "section-1-task-1", name: "Practice information", description: "Listen to how Zo pronounces your practice's name", section: "section-1" },
    { slug: "section-1-task-2", name: "Phone lines", description: "Set up your practice phone system", section: "section-1" },
    { slug: "section-1-task-3", name: "Transfer numbers", description: "Set where Zo transfers calls when needed. Each phone line is required to have a catch all transfer phone number.", section: "section-1" },
    { slug: "section-2-task-2", name: "Scheduling options", description: "Required information, when to transfer to staff, and SMS confirmations.", section: "section-2" },
    { slug: "section-2-task-1", name: "Exclusions", description: "By default Zo will be able to schedule any provider, visit reason, and location at your practice that are listed on Zocdoc", section: "section-2" },
    { slug: "section-3-task-1", name: "Voice of Zo", description: "Choose Zo's voice (male or female)", section: "section-3" },
    { slug: "section-3-task-2", name: "Pre-call messages", description: "Configure messages played before calls", section: "section-3" },
    { slug: "section-3-task-3", name: "Pronunciation", description: "Configure pronunciation (optional)", section: "section-3" },
    { slug: "section-3-task-4", name: "FAQs", description: "Frequently asked questions", section: "section-3" },
    { slug: "section-3-task-5", name: "Review and submit", description: "Confirm your setup before submission", section: "review" },
    { slug: "complete", name: "You're all set", description: "Configuration submitted — what happens next", section: "complete" },
  ],
};

