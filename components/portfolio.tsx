"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion, useReducedMotion, useScroll, useSpring } from "framer-motion";
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  Check,
  ChevronRight,
  Code2,
  Download,
  ExternalLink,
  GraduationCap,
  Languages,
  Layers3,
  Mail,
  MapPin,
  Menu,
  Moon,
  Palette,
  Send,
  GamepadDirectional,
  Hand,
  Sun,
  X,
  Zap,
} from "lucide-react";
import { useTheme } from "next-themes";
import Image from "next/image";
import { useEffect, useState, useSyncExternalStore } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  education,
  experience,
  interests,
  languages,
  metrics,
  profile,
  projects,
  recommendations,
  skillGroups,
  technologies,
  type Project,
} from "@/lib/portfolio-data";
import { cn } from "@/lib/cn";

const navItems = [
  { label: "Home", href: "#top" },
  { label: "Selected Projects", href: "#work" },
  { label: "Career", href: "#experience" },
  { label: "Expertise", href: "#expertise" },
  { label: "About", href: "#about" },
  { label: "References", href: "#references" },
];

const formSchema = z.object({
  name: z.string().min(2, "Please enter your name."),
  email: z.string().email("Enter a valid email address."),
  message: z.string().min(12, "Tell me a little more about your project."),
});

type FormValues = z.infer<typeof formSchema>;

const reveal = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

const emptySubscribe = () => () => { };

function GitHubIcon({ size = 17 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        fill="currentColor"
        d="M12 2C6.48 2 2 6.58 2 12.23c0 4.52 2.87 8.35 6.84 9.71.5.1.68-.22.68-.49 0-.24-.01-1.05-.01-1.91-2.78.62-3.37-1.21-3.37-1.21-.45-1.18-1.11-1.49-1.11-1.49-.91-.64.07-.62.07-.62 1 .07 1.53 1.05 1.53 1.05.89 1.57 2.34 1.11 2.91.85.09-.66.35-1.11.63-1.36-2.22-.26-4.56-1.14-4.56-5.06 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.71 0 0 .84-.28 2.75 1.05A9.35 9.35 0 0 1 12 6.95c.85 0 1.7.12 2.5.35 1.91-1.33 2.75-1.05 2.75-1.05.55 1.41.2 2.45.1 2.71.64.72 1.03 1.63 1.03 2.75 0 3.93-2.34 4.8-4.57 5.06.36.32.68.95.68 1.92 0 1.38-.01 2.49-.01 2.83 0 .27.18.59.69.49A10.24 10.24 0 0 0 22 12.23C22 6.58 17.52 2 12 2Z"
      />
    </svg>
  );
}

function LinkedInIcon({ size = 17 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        fill="currentColor"
        d="M6.5 8.25H3.25V21H6.5V8.25ZM4.88 2A1.89 1.89 0 1 0 4.87 5.78 1.89 1.89 0 0 0 4.88 2ZM21 13.69c0-3.84-2.05-5.63-4.78-5.63-2.2 0-3.19 1.21-3.74 2.06V8.25H9.23V21h3.25v-6.31c0-1.66.31-3.26 2.37-3.26 2.03 0 2.05 1.9 2.05 3.37V21H21v-7.31Z"
      />
    </svg>
  );
}

function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const reduceMotion = useReducedMotion();
  return (
    <motion.div
      className={className}
      variants={reveal}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-48px" }}
      transition={{ duration: reduceMotion ? 0 : 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);

  return (
    <button
      className={cn("icon-button", "min-h-11 min-w-11")}
      type="button"
      aria-label={mounted && resolvedTheme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
    >
      {!mounted ? <Moon size={17} /> : resolvedTheme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
    </button>
  );
}

function Header() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    const onResize = () => {
      if (window.matchMedia("(min-width: 960px)").matches) setOpen(false);
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKeyDown);
    window.addEventListener("resize", onResize);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("resize", onResize);
    };
  }, [open]);

  return (
    <>
      {open && (
        <button
          className="mobile-nav-backdrop"
          type="button"
          aria-label="Close navigation"
          onClick={() => setOpen(false)}
        />
      )}
          <header
        className={cn(
          "site-header",
          open && "is-menu-open",
          "grid grid-cols-[minmax(0,1fr)_auto] items-center md:grid-cols-[1fr_auto_1fr]",
          "md:min-h-[68px] md:rounded-[22px] md:px-3.5 md:py-2",
        )}
      >
        <a className="brand min-w-0" href="#top" aria-label="Fatemeh Kashfi, home" onClick={() => setOpen(false)}>
          <span className="brand-mark">FK</span>
          <span className="hidden sm:inline">Fatemeh Kashfi</span>
        </a>
        <nav className={cn("desktop-nav", "hidden items-center md:flex")} aria-label="Primary navigation">
          {navItems.map((item) => (
            <a key={item.href} href={item.href}>
              {item.label}
            </a>
          ))}
        </nav>
        <div className={cn("header-actions", "justify-end")}>
          <ThemeToggle />
          <a className={cn("header-cta", "hidden min-h-11 md:inline-flex")} href="#contact">
            Let&apos;s talk <ArrowUpRight size={15} />
          </a>
          <button
            className={cn("icon-button menu-button", "inline-grid min-h-11 min-w-11 md:hidden")}
            type="button"
            aria-label={open ? "Close navigation" : "Open navigation"}
            aria-expanded={open}
            aria-controls="mobile-navigation"
            onClick={() => setOpen((value) => !value)}
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
        <AnimatePresence>
          {open && (
            <motion.nav
              id="mobile-navigation"
              className={cn("mobile-nav", "absolute left-0 right-0 top-[calc(100%+8px)] z-[2]")}
              aria-label="Mobile navigation"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
            >
              {navItems.map((item) => (
                <a key={item.href} href={item.href} onClick={() => setOpen(false)}>
                  {item.label} <ChevronRight size={16} />
                </a>
              ))}
              <a href="#contact" onClick={() => setOpen(false)}>
                Contact <ChevronRight size={16} />
              </a>
            </motion.nav>
          )}
        </AnimatePresence>
      </header>
    </>
  );
}

function HeroVisual() {
  const reduceMotion = useReducedMotion();
  return (
    <div
      className={cn(
        "hero-visual",
        "min-h-[300px] sm:min-h-[380px] md:min-h-[460px] lg:min-h-[560px]",
      )}
      aria-label="Frontend engineering workspace visualization"
    >
      <div className="visual-grid" />
      <div className="visual-heading">
        <span>Engineering workspace</span>
        <strong>Designing dependable product systems</strong>
      </div>
      <motion.div
        className="visual-window window-primary"
        animate={reduceMotion ? undefined : { y: [0, -6, 0], rotate: [-1.5, -0.5, -1.5] }}
        transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }}
      >
        <div className="window-bar"><i /><i /><i /><span>product-system.tsx</span></div>
        <div className="workspace-title"><small>Architecture</small><strong>Complexity, composed.</strong></div>
        <div className="code-line long" />
        <div className="code-line medium" />
        <div className="code-line short" />
        <div className="mini-panels">
          <span><b>UI</b><small>Accessible</small></span>
          <span><b>DX</b><small>Typed</small></span>
          <span><b>QA</b><small>Tested</small></span>
        </div>
      </motion.div>
      <motion.div
        className="visual-window window-secondary"
        animate={reduceMotion ? undefined : { y: [0, 7, 0], x: [0, -3, 0] }}
        transition={{ repeat: Infinity, duration: 9, ease: "easeInOut" }}
      >
        <div className="signal-row"><span className="live-dot" /> SYSTEM HEALTH</div>
        <div className="chart-bars">{[48, 72, 58, 88, 68, 96, 76].map((h, index) => <i key={`${h}-${index}`} style={{ height: `${h}%` }} />)}</div>
      </motion.div>
      <div className={cn("visual-orbit orbit-one", "hidden sm:grid")}><span>React</span></div>
      <div className={cn("visual-orbit orbit-two", "hidden sm:grid")}><span>TS</span></div>
      <div className="visual-badge"><Zap size={14} /> Performance-minded</div>
    </div>
  );
}

function SectionHeading({
  index,
  eyebrow,
  title,
  copy,
}: {
  index: string;
  eyebrow: string;
  title: string;
  copy?: string;
}) {
  return (
    <Reveal className={cn("section-heading", "grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-x-8")}>
      <div className={cn("section-kicker", "md:col-span-12")}>
        <span>{index}</span>
        {eyebrow}
      </div>
      <h2 className={cn("min-w-0", copy ? "md:col-span-7" : "md:col-span-12")}>{title}</h2>
      {copy && <p className="min-w-0 md:col-span-5 md:self-end">{copy}</p>}
    </Reveal>
  );
}

function ProjectPreview({ project }: { project: Project }) {
  const { resolvedTheme } = useTheme();
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);
  const previewLabel = project.previewLabel ?? `${project.slug}.app`;
  const previewStatus = project.previewStatus ?? "PRODUCT UI";
  const previewVariant = project.previewVariant ?? "trading";

  if (project.images?.length) {
    if (!mounted && project.lightPreviewImages?.length) {
      return (
        <div
          className={`project-preview project-preview-real preview-${previewVariant} accent-${project.accent}`}
          role="status"
          aria-label={`Loading ${project.title} screenshots`}
          aria-busy="true"
        >
          <div className="oms-preview-header" aria-hidden="true">
            <span /><span /><span />
            <small>{previewLabel}</small>
            <i>{previewStatus}</i>
          </div>
          <div className="oms-preview-grid oms-preview-loading" aria-hidden="true">
            <figure className="oms-preview-main" />
            <div className="oms-preview-supporting"><figure /><figure /></div>
          </div>
        </div>
      );
    }

    const previewImages = resolvedTheme === "light" && project.lightPreviewImages?.length
      ? project.lightPreviewImages
      : project.images;
    const [hero, ...supporting] = previewImages;

    return (
      <div className={`project-preview project-preview-real preview-${previewVariant} accent-${project.accent}`}>
        <div className="oms-preview-header" aria-hidden="true">
          <span /><span /><span />
          <small>{previewLabel}</small>
          <i>{previewStatus}</i>
        </div>
        <div className="oms-preview-grid">
          <figure className="oms-preview-main">
            <Image
              src={hero.src}
              alt={hero.alt}
              fill
              loading="lazy"
              sizes="(max-width: 640px) calc(100vw - 52px), (max-width: 840px) 65vw, (max-width: 1100px) 46vw, 52vw"
            />
            <figcaption>{hero.label}</figcaption>
          </figure>
          <div className="oms-preview-supporting">
            {supporting.slice(0, 2).map((image) => (
              <figure key={image.label}>
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  loading="lazy"
                  sizes="(max-width: 640px) calc(50vw - 31px), (max-width: 840px) 25vw, 20vw"
                />
                <figcaption>{image.label}</figcaption>
              </figure>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`project-preview accent-${project.accent}`}>
      <div className="preview-topbar"><span /><span /><span /><small>{project.slug}.app</small></div>
      <div className="preview-sidebar">
        {[1, 2, 3, 4, 5].map((item) => <i key={item} />)}
      </div>
      <div className="preview-canvas">
        <div className="preview-metric"><small>System signal</small><strong>{project.achievements[0]}</strong></div>
        <div className="preview-chart">
          {[35, 52, 42, 74, 60, 86, 72, 94].map((height, index) => (
            <i key={`${height}-${index}`} style={{ height: `${height}%` }} />
          ))}
        </div>
        <div className="preview-table">{[1, 2, 3].map((row) => <span key={row} />)}</div>
      </div>
    </div>
  );
}

function ProjectDialog({ project }: { project: Project }) {
  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <button className="text-link" type="button">
          View case study <ArrowRight size={16} />
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="dialog-overlay" />
        <Dialog.Content
          className={cn(
            "dialog-content",
            "fixed inset-3 z-[120] flex max-h-none w-auto max-w-none flex-col overflow-hidden",
            "md:inset-auto md:left-1/2 md:top-1/2 md:w-[min(100%-48px,980px)]",
            "md:max-h-[min(90svh,900px)] md:-translate-x-1/2 md:-translate-y-1/2",
          )}
        >
          <div className="dialog-scroll">
            <div className="dialog-top">
              <div className="min-w-0">
                <span className="project-eyebrow">{project.eyebrow}</span>
                <Dialog.Title>{project.title}</Dialog.Title>
                <Dialog.Description>{project.summary}</Dialog.Description>
              </div>
              <Dialog.Close className={cn("icon-button", "min-h-11 min-w-11")} aria-label="Close case study">
                <X size={18} />
              </Dialog.Close>
            </div>
            <ProjectPreview project={project} />
            <div className={cn("case-study-grid", "grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5")}>
              <div className="min-w-0"><span>Challenge</span><p>{project.challenge}</p></div>
              <div className="min-w-0"><span>Approach</span><p>{project.solution}</p></div>
            </div>
            <div className="case-results">
              <span>Outcomes</span>
              <ul>{project.achievements.map((item) => <li key={item}><Check size={15} />{item}</li>)}</ul>
            </div>
            <div className="dialog-footer">
              <div className="tech-row">{project.tech.map((tech) => <span key={tech}>{tech}</span>)}</div>
              <div className={cn("dialog-actions", "grid grid-cols-1 gap-3 sm:flex sm:flex-wrap")}>
                <a className={cn("button button-secondary", "w-full min-h-11 sm:w-auto")} href={`/projects/${project.slug}`}>
                  Full case study <ArrowRight size={16} />
                </a>
                {project.link && (
                  <a
                    className={cn("button button-primary", "w-full min-h-11 sm:w-auto")}
                    href={project.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Visit ${project.title} product (opens in a new tab)`}
                  >
                    Visit project <ExternalLink size={16} />
                  </a>
                )}
              </div>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function ContactForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitSuccessful },
  } = useForm<FormValues>({ resolver: zodResolver(formSchema) });

  const onSubmit = ({ name, email, message }: FormValues) => {
    const subject = encodeURIComponent(`Portfolio inquiry from ${name}`);
    const body = encodeURIComponent(`${message}\n\nFrom: ${name} (${email})`);
    window.location.assign(`mailto:${profile.email}?subject=${subject}&body=${body}`);
  };

  return (
    <form className="contact-form" onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className={cn("field-row", "grid grid-cols-1 sm:grid-cols-2 gap-4")}>
        <label className="min-w-0">
          <span>Name</span>
          <input {...register("name")} placeholder="Your name" autoComplete="name" />
          {errors.name && <small>{errors.name.message}</small>}
        </label>
        <label className="min-w-0">
          <span>Email</span>
          <input {...register("email")} placeholder="you@company.com" type="email" autoComplete="email" />
          {errors.email && <small>{errors.email.message}</small>}
        </label>
      </div>
      <label>
        <span>How can I help?</span>
        <textarea {...register("message")} placeholder="Tell me about the role, product, or problem…" rows={5} />
        {errors.message && <small>{errors.message.message}</small>}
      </label>
      <button className={cn("button button-primary submit-button", "w-full min-h-11")} type="submit">
        {isSubmitSuccessful ? "Opening your email client" : "Start a conversation"} <Send size={16} />
      </button>
    </form>
  );
}

export function Portfolio() {
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30, restDelta: 0.001 });

  return (
    <>
      <motion.div className="scroll-progress" style={{ scaleX: progress }} />
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />
      <Header />
      <main className="portfolio-main">
        <section
          id="top"
          className={cn(
            "hero section-shell",
            "grid grid-cols-1 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] gap-y-6 lg:gap-x-10 xl:gap-x-16",
          )}
        >
          <div className="hero-copy min-w-0">
            <motion.div className="availability" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}>
              <span /> Available for senior frontend opportunities
            </motion.div>
            <motion.p className="hero-greeting" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              Hi, I&apos;m Fatemeh <span aria-hidden="true"><Hand size={14} strokeWidth={1.8} /></span>
            </motion.p>
            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.65 }}>
              I turn complex systems
              <span> into clear products.</span>
            </motion.h1>
            <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12, duration: 0.6 }}>
              {profile.intro}
            </motion.p>
            <motion.div
              className={cn("hero-actions", "grid grid-cols-1 gap-3 sm:flex sm:flex-wrap")}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.22 }}
            >
              <a className={cn("button button-primary", "w-full min-h-11 sm:w-auto")} href="#work">
                See my selected work <ArrowDown size={16} />
              </a>
              <a
                className={cn("button button-secondary", "w-full min-h-11 sm:w-auto")}
                href="/documents/resume/Fatemeh-Kashfi.pdf"
                download="Fatemeh-Kashfi.pdf"
              >
                Download CV <Download size={16} />
              </a>
            </motion.div>
            <motion.div className="hero-meta" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
              <span><MapPin size={14} /> {profile.location}</span>
              <span><Code2 size={14} /> React · Next.js · TypeScript</span>
            </motion.div>
          </div>
          <motion.div
            className="hero-art min-w-0"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.1 }}
          >
            <HeroVisual />
          </motion.div>
          <div className={cn("metric-strip", "grid grid-cols-1 xs:grid-cols-2 md:grid-cols-4 gap-3")}>
            {metrics.map((metric, index) => (
              <Reveal key={metric.label} delay={index * 0.06} className="metric min-w-0">
                <strong>{metric.value}</strong><span>{metric.label}</span>
              </Reveal>
            ))}
          </div>
        </section>

        <section id="work" className="section section-shell">
          <SectionHeading
            index="01"
            eyebrow="Featured Projects"
            title="Built for complexity. Designed for people."
            copy="Selected enterprise products and platforms I've designed and built. Explore each case study for the product challenge, engineering approach, stack, and measurable outcomes."
          />
          <div className={cn("projects-grid", "grid grid-cols-1 md:grid-cols-2 gap-5")}>
            {projects.slice(0, 4).map((project, index) => (
              <Reveal
                key={project.slug}
                delay={index * 0.08}
                className={cn("project-card", "min-w-0 md:col-span-1")}
              >
                <ProjectPreview project={project} />
                <div className="project-copy min-w-0">
                  <div className="project-label-row">
                    <span className="project-eyebrow">{project.eyebrow}</span>
                  </div>
                  <h3>{project.title}</h3>
                  <p>{project.summary}</p>
                  <div className="tech-row">{project.tech.slice(0, 4).map((tech) => <span key={tech}>{tech}</span>)}</div>
                  <ProjectDialog project={project} />
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal
            className={cn(
              "project-archive",
              "flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between",
            )}
          >
            <div className="min-w-0"><span>SMS Sender</span><h3>Targeted messaging & campaign operations</h3></div>
            <div className={cn("archive-links", "flex flex-wrap gap-2")}>
              {projects.slice(4).map((project) => <ProjectDialog key={project.slug} project={project} />)}
            </div>
          </Reveal>
        </section>

        <section id="experience" className="section section-shell">
          <SectionHeading
            index="02"
            eyebrow="Career timeline"
            title="Growing from delivery to architecture."
            copy="Production-tested frontend engineering across complex enterprise systems, driven by performance, reliability, and usability."
          />
          <div className="timeline">
            {experience.map((item, index) => (
              <Reveal
                key={item.company}
                delay={index * 0.07}
                className={cn(
                  "timeline-item",
                  "grid grid-cols-[36px_minmax(0,1fr)] sm:grid-cols-[48px_minmax(0,1fr)] md:grid-cols-[58px_minmax(0,0.65fr)_minmax(0,1.55fr)]",
                )}
              >
                <div className="timeline-rail"><span>{String(index + 1).padStart(2, "0")}</span></div>
                <div className={cn("timeline-meta", "col-start-2 min-w-0 md:col-auto")}>
                  <span>{item.period}</span>
                  <small>{item.domain}</small>
                </div>
                <div className={cn("timeline-content", "col-start-2 min-w-0 md:col-auto")}>
                  <h3>{item.role}</h3>
                  <h4>{item.company}</h4>
                  <p>{item.summary}</p>
                  <ul>{item.highlights.map((highlight) => <li key={highlight}>{highlight}</li>)}</ul>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        <section id="expertise" className="section section-shell">
          <SectionHeading
            index="03"
            eyebrow="Engineering practice"
            title="A frontend discipline that reaches beyond the screen."
            copy="I work across product thinking, architecture, interaction design, data flow, quality, and delivery."
          />
          <div className={cn("skills-bento", "grid grid-cols-1 md:grid-cols-2 gap-5")}>
            {skillGroups.map((group, index) => {
              const Icon = [Code2, Layers3, Palette, Check][index];
              return (
                <Reveal key={group.title} delay={index * 0.06} className={cn("skill-card", "min-w-0")}>
                  <div className="skill-icon"><Icon size={20} /></div>
                  <span>0{index + 1}</span>
                  <h3>{group.title}</h3>
                  <p>{group.description}</p>
                  <div className="skill-list">{group.skills.map((skill) => <span key={skill}>{skill}</span>)}</div>
                </Reveal>
              );
            })}
          </div>
          <Reveal className={cn("technology-cloud", "grid grid-cols-1 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] gap-7")}>
            <div className="min-w-0">
              <span className="section-kicker"><span>Stack</span>Daily tools</span>
              <h3>Modern where it matters. Pragmatic everywhere.</h3>
            </div>
            <div className="tech-cloud min-w-0">
              {technologies.map((technology) => <span key={technology}>{technology}</span>)}
            </div>
          </Reveal>
        </section>

        <section id="about" className="section section-shell">
          <div className={cn("about-grid", "grid grid-cols-1 md:grid-cols-2 gap-8")}>
            <Reveal className="about-intro min-w-0">
              <span className="section-kicker"><span>04</span>Profile</span>
              <h2>Technical depth, with a product designer&apos;s eye.</h2>
            </Reveal>
            <Reveal delay={0.08} className="about-copy min-w-0">
              <p>{profile.about}</p>
              <p>
                My best work happens where the interface is not merely presentation: it is the operating surface for decisions, transactions, and collaboration.
              </p>
              <a className="text-link" href={`mailto:${profile.email}`}>Work with me <ArrowRight size={16} /></a>
            </Reveal>
          </div>
          <div className={cn("profile-cards", "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4")}>
            <Reveal className={cn("profile-card education-card", "min-w-0 sm:col-span-2 lg:col-span-1")}>
              <GraduationCap size={22} />
              <span>Education</span>
              <h3>{education.degree}</h3>
              <p>{education.school}<br />{education.location} · {education.period}</p>
            </Reveal>
            <Reveal delay={0.06} className={cn("profile-card", "min-w-0")}>
              <Languages size={22} />
              <span>Languages</span>
              {languages.map((language) => <div className="language-row" key={language.name}><strong>{language.name}</strong><small>{language.level}</small></div>)}
            </Reveal>
            <Reveal delay={0.12} className={cn("profile-card", "min-w-0 sm:col-span-2 lg:col-span-1")}>
              <GamepadDirectional size={22} />
              <span>Beyond work</span>
              <h3>Curiosity stays switched on.</h3>
              <div className="interest-list">{interests.map((interest) => <span key={interest}>{interest}</span>)}</div>
            </Reveal>
          </div>
        </section>

        <section id="references" className="section section-shell references-section" aria-labelledby="references-title">
          <Reveal className={cn("references-heading", "grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-x-8")}>
            <div className={cn("section-kicker", "md:col-span-12")}>
              <span>05</span>LinkedIn recommendations
            </div>
            <h2 id="references-title" className="min-w-0 md:col-span-7">
              Trusted by the people I&apos;ve built alongside.
            </h2>
            <p className="min-w-0 md:col-span-5 md:self-end">
              First-hand perspectives from teammates across engineering, quality, and product collaboration.
            </p>
          </Reveal>

          <div className={cn("references-grid", "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4")}>
            {recommendations.map((recommendation, index) => (
              <Reveal
                key={recommendation.name}
                delay={index * 0.07}
                className={cn("reference-card", "min-w-0")}
              >
                <article>
                  <header className="reference-author">
                    <div
                      className="reference-avatar"
                      role="img"
                      aria-label={`${recommendation.name} profile monogram`}
                    >
                      {recommendation.initials}
                    </div>
                    <div className="reference-identity">
                      <h3>{recommendation.name}</h3>
                      <p>{recommendation.role}</p>
                    </div>
                  </header>

                  <div className="reference-meta">
                    <span>LinkedIn recommendation</span>
                    <time dateTime={recommendation.dateTime}>{recommendation.date}</time>
                  </div>

                  <blockquote>
                    {recommendation.quote.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                  </blockquote>

                  <footer className="reference-relationship">
                    <span aria-hidden="true" />
                    <p>{recommendation.relationship}</p>
                  </footer>
                </article>
              </Reveal>
            ))}
          </div>

          <Reveal className={cn("references-source", "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between")}>
            <p>Three verified professional recommendations, shared publicly on LinkedIn.</p>
            <a
              href="https://www.linkedin.com/in/fateme-kashfi/details/recommendations/?detailScreenTabIndex=0"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="View all recommendations on Fatemeh Kashfi’s LinkedIn profile (opens in a new tab)"
              className="min-h-11"
            >
              <LinkedInIcon size={16} />
              View all on LinkedIn
              <ArrowUpRight size={14} />
            </a>
          </Reveal>
        </section>

        <section
          id="contact"
          className={cn("section section-shell contact-section", "grid grid-cols-1 md:grid-cols-12 gap-10")}
        >
          <Reveal className={cn("contact-copy", "min-w-0 md:col-span-4")}>
            <span className="section-kicker"><span>06</span>Contact</span>
            <h2>Have a complex product that needs clarity?</h2>
            <p>I&apos;m open to senior and lead frontend roles, product engineering work, and thoughtful collaborations.</p>
            <div className="contact-links">
              <a href={`mailto:${profile.email}`} className="min-h-11"><Mail size={17} />{profile.email}</a>
              <a href={profile.links.linkedin} target="_blank" rel="noreferrer" className="min-h-11"><LinkedInIcon />LinkedIn</a>
              <a href={profile.links.github} target="_blank" rel="noreferrer" className="min-h-11"><GitHubIcon />GitHub</a>
            </div>
          </Reveal>
          <Reveal delay={0.08} className="min-w-0 md:col-span-7 md:col-start-6">
            <ContactForm />
          </Reveal>
        </section>
      </main>

      <footer
        className={cn(
          "footer section-shell",
          "grid grid-cols-1 sm:grid-cols-[1fr_auto] md:grid-cols-[1fr_auto_1fr] items-center gap-4",
        )}
      >
        <div className="footer-brand min-w-0">
          <span className="brand-mark">FK</span>
          <div><strong>{profile.name}</strong><span>{profile.role}</span></div>
        </div>
        <p className="hidden md:block">Built with Next.js, TypeScript, and an obsession with the details.</p>
        <div className={cn("footer-links", "sm:justify-end md:justify-end")}>
          <a href="#top" className="min-h-11">Back to top <ArrowUpRight size={14} /></a>
          <a href="/documents/resume/Fatemeh-Kashfi.pdf" target="_blank" rel="noopener noreferrer" className="min-h-11">
            Resume <Download size={14} />
          </a>
        </div>
      </footer>
    </>
  );
}
