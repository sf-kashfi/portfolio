import { ArrowLeft, ArrowUpRight, Check, ExternalLink, LockKeyhole } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProjectGallery } from "@/components/project-gallery";
import { projects } from "@/lib/portfolio-data";

export function generateStaticParams() {
  return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
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
      <nav className="case-nav">
        <Link href="/#work"><ArrowLeft size={16} /> Back to portfolio</Link>
        <span>Fatemeh Kashfi · Selected work</span>
      </nav>

      <header className="case-hero">
        <div>
          <span className="project-eyebrow">{project.eyebrow}</span>
          <h1>{project.title}</h1>
          <p>{project.summary}</p>
        </div>
        {project.confidential ? (
          <div className="case-access"><LockKeyhole size={18} /> Protected client work</div>
        ) : project.link ? (
          <a
            className="button button-primary"
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
        <section className={`case-gallery accent-${project.accent}`} aria-label="Project interface gallery">
          {[0, 1, 2].map((item) => (
            <div className="gallery-frame" key={item}>
              <div className="preview-topbar"><span /><span /><span /><small>view-{item + 1}.tsx</small></div>
              <div className="gallery-ui">
                <i /><i /><i /><i /><i /><i />
              </div>
            </div>
          ))}
        </section>
      )}

      <section className="case-narrative">
        <div>
          <span>{project.businessOverview ? "Business overview" : "Challenge"}</span>
          <h2>{project.businessOverview ? "Connecting the complete product journey." : "Making operational complexity feel manageable."}</h2>
        </div>
        <p>{project.businessOverview ?? project.challenge}</p>
        <div>
          <span>{project.technicalOverview ? "Technical overview" : "Engineering approach"}</span>
          <h2>{project.technicalOverview ? "Stateful workflows, clear product boundaries." : "Architecture that protects both speed and clarity."}</h2>
        </div>
        <p>{project.technicalOverview ?? project.solution}</p>
      </section>

      {project.engineeringChallenges && (
        <section className="case-engineering" aria-labelledby="engineering-challenges-title">
          <div className="case-engineering-heading">
            <span className="project-eyebrow">Engineering challenges</span>
            <h2 id="engineering-challenges-title">{project.engineeringHeading ?? "Complexity handled below the interface."}</h2>
            <p>{project.engineeringIntro ?? "Security, transaction state, and performance constraints stay explicit while customers see a guided, coherent journey."}</p>
          </div>
          <div className="case-engineering-grid">
            {project.engineeringChallenges.map((challenge, index) => (
              <article key={challenge}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <p>{challenge}</p>
              </article>
            ))}
          </div>
        </section>
      )}

      <section className="case-outcomes">
        <div>
          <span>Outcomes</span>
          <h2>Measured impact and dependable delivery.</h2>
        </div>
        <ul>
          {project.achievements.map((achievement) => (
            <li key={achievement}><Check size={17} />{achievement}</li>
          ))}
        </ul>
      </section>

      {project.stackGroups && (
        <section className="case-technology" aria-labelledby="technology-title">
          <div>
            <span className="project-eyebrow">Technology system</span>
            <h2 id="technology-title">{project.technologyHeading ?? "Purpose-built for regulated, data-heavy RTL workflows."}</h2>
          </div>
          <div className="case-technology-groups">
            {project.stackGroups.map((group) => (
              <section key={group.label}>
                <h3>{group.label}</h3>
                <div className="tech-row">{group.items.map((item) => <span key={item}>{item}</span>)}</div>
              </section>
            ))}
          </div>
        </section>
      )}

      {project.images && project.link && (
        <section className="oms-final-cta">
          <div>
            <span className="project-eyebrow">Live product</span>
            <h2>Explore {project.title} in context.</h2>
            <p>Visit the live product in a new browser tab.</p>
          </div>
          <a
            className="button button-primary"
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

      <footer className="case-footer">
        <Link href="/#work"><ArrowLeft size={16} /> Explore other work</Link>
        <a href="mailto:kashfi.sf@gmail.com">Discuss a project <ArrowUpRight size={16} /></a>
      </footer>
    </main>
  );
}
