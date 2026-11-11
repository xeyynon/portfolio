import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { projects } from "@/data/portfolioData";
import ProjectPage from "@/components/organisms/ProjectPage/ProjectPage";
import { DESIGNED, isDesigned } from "@/components/worlds/designed";
import { WORLDS } from "@/components/worlds/registry";

// The designed project pages, built beside the current ones under /lab. Only
// projects that have a world get a page here; the rest keep the shared
// template at /projects/[slug] until theirs is designed.
export const dynamicParams = false;

export function generateStaticParams() {
  return DESIGNED.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const project = projects.find((p) => p.slug === slug);
  return {
    title: project ? `Lab · ${project.title}` : "Lab",
    robots: { index: false, follow: false },
  };
}

export default async function DesignedProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const index = projects.findIndex((p) => p.slug === slug);
  if (index < 0 || !isDesigned(slug)) return notFound();

  return (
    <ProjectPage
      project={projects[index]}
      world={WORLDS[slug]}
      backHref="/lab/home#projects"
      prev={projects[index - 1]}
      next={projects[index + 1]}
    />
  );
}
