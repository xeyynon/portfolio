import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { projects } from "@/data/portfolioData";
import ProjectPage from "@/components/organisms/ProjectPage/ProjectPage";
import { DESIGNED, isDesigned } from "@/components/worlds/designed";
import { WORLDS } from "@/components/worlds/registry";

// Every project with a designed page (a world). Any other address, including
// a listed project whose page is closed (PAGELESS_PROJECTS), answers "not found".
export const dynamicParams = false;

export function generateStaticParams() {
  return DESIGNED.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = projects.find((p) => p.slug === slug);
  return project ? { title: project.title, description: project.subtitle } : {};
}

export default async function DesignedProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  // Previous and next step only through pages that are open.
  const open = projects.filter((p) => isDesigned(p.slug));
  const index = open.findIndex((p) => p.slug === slug);
  if (index < 0 || !isDesigned(slug)) return notFound();

  return (
    <main id="main">
      <ProjectPage
        project={open[index]}
        world={WORLDS[slug]}
        backHref="/#projects"
        prev={open[index - 1]}
        next={open[index + 1]}
      />
    </main>
  );
}
