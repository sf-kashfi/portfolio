import { ArrowLeft, ArrowUpRight, Check, LockKeyhole } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
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
          <a className="button button-primary" href={project.link} target="_blank" rel="noreferrer">
            Visit product <ArrowUpRight size={16} />
          </a>
        ) : null}
      </header>

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

      <section className="case-narrative">
        <div><span>Challenge</span><h2>Making operational complexity feel manageable.</h2></div>
        <p>{project.challenge}</p>
        <div><span>Engineering approach</span><h2>Architecture that protects both speed and clarity.</h2></div>
        <p>{project.solution}</p>
      </section>

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

      <section className="case-stack">
        <span>Core stack</span>
        <div className="tech-cloud">{project.tech.map((item) => <span key={item}>{item}</span>)}</div>
      </section>

      <footer className="case-footer">
        <Link href="/#work"><ArrowLeft size={16} /> Explore other work</Link>
        <a href="mailto:kashfi.sf@gmail.com">Discuss a project <ArrowUpRight size={16} /></a>
      </footer>
    </main>
  );
}
