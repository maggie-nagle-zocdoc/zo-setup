import type { ProjectManifest } from "../types";

export const manifest: ProjectManifest = {
  slug: "example-project",
  name: "Example Project",
  description: "A demo project showing the design system in action",
  tags: ["dashboard", "forms"],
  pages: [
    { slug: "dashboard", name: "Dashboard", description: "Main overview" },
    { slug: "settings", name: "Settings", description: "User preferences" },
  ],
};
