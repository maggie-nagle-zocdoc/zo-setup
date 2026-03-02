import { redirect } from "next/navigation";

/** Redirect /projects to Zo setup overview (only project in this app). */
export default function ProjectsPage() {
  redirect("/projects/zo-setup");
}
