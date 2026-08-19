import { projects } from "@/data/portfolioData";
import { notFound } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import { Code, FileText } from "lucide-react";
import DeckViewer from "@/components/DeckViewer";
import { SHOW_PROJECT_PAGES } from "@/lib/flags";

// Puts the shader-string/compile logic in its own chunk instead of this
// route's main bundle. No `ssr: false` here (unlike PrismScene's own
// dynamic import of PrismCanvas) — this page is a Server Component, and
// Next disallows that option outside a Client Component; ProjectPrismRay's
// own "use client" + idle-deferred mount already keep it from doing
// anything until the browser is idle regardless of how it's imported.
const ProjectPrismRay = dynamic(() => import("@/components/ProjectPrismRay"));

export function generateStaticParams() {
  if (!SHOW_PROJECT_PAGES) return [];
  return projects.map((p) => ({ slug: p.slug }));
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  if (!SHOW_PROJECT_PAGES) return notFound();

  const resolvedParams = await params;
  const project = projects.find((p) => p.slug === resolvedParams.slug);
  if (!project) return notFound();

  const i = projects.findIndex((p) => p.slug === resolvedParams.slug);
  const prev = projects[i - 1];
  const next = projects[i + 1];

  return (
    <article className="project-page wrap" style={{ "--project-accent": project.color } as React.CSSProperties}>
      <div className="pp-hero">
        <ProjectPrismRay color={project.color} />
        <Link href="/#projects" className="back-link">← Back to work</Link>
      </div>

      {/* Title moved out of .pp-hero — it used to sit at the bottom of the
          ray banner, overlapping the triangle and beam directly. On the
          homepage the wordmark sits above the prism, never over it; this
          matches that by giving the ray a clean run as its own background
          and putting the title in normal flow below it, the same
          relationship "Selected Work" has to the homepage's hero scene. */}
      <div className="pp-head">
        <span className="pnum">{project.num}</span>
        <h1>{project.title}</h1>
        <span className="ptag" style={{ borderColor: project.color, color: project.color }}>
          {project.tag}
        </span>
      </div>

      {project.links && (
        <div className="pp-links">
          {project.links.github && (
            <a href={project.links.github} target="_blank" rel="noopener noreferrer" className="link-btn">
              <Code size={13} /> CODE
            </a>
          )}
          {project.links.demo && (
            <a href="#presentation" className="link-btn">
              <FileText size={13} /> PPT
            </a>
          )}
        </div>
      )}

      <p className="ppipe">{project.pipeline}</p>

      <section className="pp-section">
        <h2 className="eyebrow">OVERVIEW</h2>
        <p className="pp-desc">{project.description}</p>
      </section>

      <section className="pp-section">
        <h2 className="eyebrow">WHAT I BUILT</h2>
        <ul className="pp-highlights">
          {project.highlights.map((h) => <li key={h}>{h}</li>)}
        </ul>
      </section>

      <section className="pp-section">
        <h2 className="eyebrow">STACK</h2>
        <div className="stack">
          {project.stack.map((s) => (
            <span key={s} className="stack-chip">{s}</span>
          ))}
        </div>
      </section>

      {project.links?.demo && (
        <section className="pp-section" id="presentation">
          <h2 className="eyebrow">PRESENTATION</h2>
          <DeckViewer src={project.links.demo} title={project.short} />
        </section>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-8 sm:gap-0 mt-14 pt-5 border-t border-[var(--line-dark)]">
        {prev ? (
          <Link href={`/projects/${prev.slug}`} className="group flex items-center gap-3 w-full sm:max-w-[45%]">
            <span className="w-1 h-8" style={{ background: prev.color }} />
            <div className="min-w-0">
              <div className="text-[9px] font-mono text-[var(--muted-dark)] uppercase">PREV</div>
              <div className="text-sm group-hover:text-[var(--project-accent)] transition-colors text-[var(--ink-hi)] truncate">{prev.title}</div>
            </div>
          </Link>
        ) : <div className="hidden sm:block" />}
        {next ? (
          <Link href={`/projects/${next.slug}`} className="group flex items-center gap-3 text-left sm:text-right w-full sm:max-w-[45%] justify-start sm:justify-end">
            <div className="hidden sm:block min-w-0">
              <div className="text-[9px] font-mono text-[var(--muted-dark)] uppercase">NEXT</div>
              <div className="text-sm group-hover:text-[var(--project-accent)] transition-colors text-[var(--ink-hi)] truncate">{next.title}</div>
            </div>
            <span className="w-1 h-8 shrink-0 hidden sm:block" style={{ background: next.color }} />

            {/* Mobile Next Layout */}
            <span className="w-1 h-8 shrink-0 sm:hidden" style={{ background: next.color }} />
            <div className="sm:hidden min-w-0">
              <div className="text-[9px] font-mono text-[var(--muted-dark)] uppercase">NEXT</div>
              <div className="text-sm group-hover:text-[var(--project-accent)] transition-colors text-[var(--ink-hi)] truncate">{next.title}</div>
            </div>
          </Link>
        ) : <div className="hidden sm:block" />}
      </div>
    </article>
  );
}
