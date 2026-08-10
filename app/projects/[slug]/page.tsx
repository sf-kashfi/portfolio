import { ArrowLeft, ArrowUpRight, Check, ExternalLink, LockKeyhole } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProjectGallery } from "@/components/project-gallery";
import { cn } from "@/lib/cn";
import { projects } from "@/lib/portfolio-data";

export function generateStaticParams() {
  return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const project = projects.find((item) => item.slug === slug);
  return project
    ? { title: project.title, description: project.summary }
    : {};
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = projects.find((item) => item.slug === slug);
  if (!project) notFound();

  return (
    <main className="case-page section-shell">
      <nav className={cn("case-nav", "flex flex-wrap items-center justify-between gap-4")}>
        <Link href="/#work" className="min-h-11"><ArrowLeft size={16} /> Back to portfolio</Link>
        <span className="max-sm:w-full">Fatemeh Kashfi · Selected work</span>
      </nav>

      <header className={cn("case-hero", "grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 items-start")}>
        <div className="min-w-0">
          <span className="project-eyebrow">{project.eyebrow}</span>
          <h1>{project.title}</h1>
          <p>{project.summary}</p>
        </div>
        {project.confidential ? (
          <div className={cn("case-access", "md:justify-self-end")}>
            <LockKeyhole size={18} /> Protected client work
          </div>
        ) : project.link ? (
          <a
            className={cn("button button-primary", "w-full min-h-11 sm:w-auto md:justify-self-end")}
            href={project.link}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Visit ${project.title} product (opens in a new tab)`}
          >
            Visit Product <ExternalLink size={16} />
          </a>
        ) : null}
      </header>

      {project.images ? (
        <>
          <section className="case-stack case-stack-intro">
            <span>Core stack</span>
            <div className="tech-cloud">{project.tech.map((item) => <span key={item}>{item}</span>)}</div>
          </section>
          <ProjectGallery project={project} />
        </>
      ) : (
        <section
          className={cn(`case-gallery accent-${project.accent}`, "grid grid-cols-1 md:grid-cols-2 gap-3")}
          aria-label="Project interface gallery"
        >
          {[0, 1, 2].map((item) => (
            <div
              className={cn("gallery-frame", "min-w-0", item === 0 && "md:col-span-2")}
              key={item}
            >
              <div className="preview-topbar"><span /><span /><span /><small>view-{item + 1}.tsx</small></div>
              <div className="gallery-ui">
                <i /><i /><i /><i /><i /><i />
              </div>
            </div>
          ))}
        </section>
      )}

      <section className={cn("case-narrative", "grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-x-10 md:gap-y-12")}>
        <div className="min-w-0">
          <span>{project.businessOverview ? "Business overview" : "Challenge"}</span>
          <h2>{project.businessOverview ? "Connecting the complete product journey." : "Making operational complexity feel manageable."}</h2>
        </div>
        <p className="min-w-0 md:self-center">{project.businessOverview ?? project.challenge}</p>
        <div className="min-w-0">
          <span>{project.technicalOverview ? "Technical overview" : "Engineering approach"}</span>
          <h2>{project.technicalOverview ? "Stateful workflows, clear product boundaries." : "Architecture that protects both speed and clarity."}</h2>
        </div>
        <p className="min-w-0 md:self-center">{project.technicalOverview ?? project.solution}</p>
      </section>

      {project.engineeringChallenges && (
        <section className="case-engineering" aria-labelledby="engineering-challenges-title">
          <div className={cn("case-engineering-heading", "grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8")}>
            <div className="min-w-0">
              <span className="project-eyebrow">Engineering challenges</span>
              <h2 id="engineering-challenges-title">{project.engineeringHeading ?? "Complexity handled below the interface."}</h2>
            </div>
            <p className="min-w-0 md:self-end">
              {project.engineeringIntro ?? "Security, transaction state, and performance constraints stay explicit while customers see a guided, coherent journey."}
            </p>
          </div>
          <div className={cn("case-engineering-grid", "grid grid-cols-1 md:grid-cols-2 gap-4")}>
            {project.engineeringChallenges.map((challenge, index) => (
              <article key={challenge} className="min-w-0">
                <span>{String(index + 1).padStart(2, "0")}</span>
                <p>{challenge}</p>
              </article>
            ))}
          </div>
        </section>
      )}

      <section className={cn("case-outcomes", "grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10")}>
        <div className="min-w-0">
          <span>Outcomes</span>
          <h2>Measured impact and dependable delivery.</h2>
        </div>
        <ul className="min-w-0">
          {project.achievements.map((achievement) => (
            <li key={achievement}><Check size={17} />{achievement}</li>
          ))}
        </ul>
      </section>

      {project.stackGroups && (
        <section className="case-technology" aria-labelledby="technology-title">
          <div className={cn("grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 mb-[clamp(44px,7vw,80px)]")}>
            <span className="project-eyebrow md:col-span-2">Technology system</span>
            <h2 id="technology-title" className="min-w-0 md:col-span-2">
              {project.technologyHeading ?? "Purpose-built for regulated, data-heavy RTL workflows."}
            </h2>
          </div>
          <div className={cn("case-technology-groups", "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4")}>
            {project.stackGroups.map((group) => (
              <section key={group.label} className="min-w-0">
                <h3>{group.label}</h3>
                <div className="tech-row">{group.items.map((item) => <span key={item}>{item}</span>)}</div>
              </section>
            ))}
          </div>
        </section>
      )}

      {project.images && project.link && (
        <section className={cn("oms-final-cta", "grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_auto] gap-6 md:items-center")}>
          <div className="min-w-0">
            <span className="project-eyebrow">Live product</span>
            <h2>Explore {project.title} in context.</h2>
            <p>Visit the live product in a new browser tab.</p>
          </div>
          <a
            className={cn("button button-primary", "w-full min-h-11 sm:w-auto")}
            href={project.link}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Visit ${project.title} product (opens in a new tab)`}
          >
            Visit Product <ExternalLink size={16} />
          </a>
        </section>
      )}

      {!project.images && (
        <section className="case-stack">
          <span>Core stack</span>
          <div className="tech-cloud">{project.tech.map((item) => <span key={item}>{item}</span>)}</div>
        </section>
      )}

      <footer className={cn("case-footer", "flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between")}>
        <Link href="/#work" className="min-h-11"><ArrowLeft size={16} /> Explore other work</Link>
        <a href="mailto:kashfi.sf@gmail.com" className="min-h-11">Discuss a project <ArrowUpRight size={16} /></a>
      </footer>
    </main>
  );
}
