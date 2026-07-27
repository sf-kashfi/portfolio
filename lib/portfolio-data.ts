export type Project = {
  slug: string;
  title: string;
  eyebrow: string;
  summary: string;
  challenge: string;
  solution: string;
  achievements: string[];
  tech: string[];
  link?: string;
  confidential?: boolean;
  accent: "teal" | "coral" | "amber";
};

export const profile = {
  name: "Fatemeh Kashfi",
  role: "Senior Frontend Engineer",
  location: "Tehran, Iran",
  email: "kashfi.sf@gmail.com",
  phone: "+98 919 649 5033",
  intro:
    "I architect high-performance interfaces for complex, mission-critical platforms—spanning real-time data environments, enterprise workflows, and scalable SaaS products.",
  about:
    "Senior Frontend Engineer with experience building scalable React and Next.js applications across fintech, capital markets, and oil, gas, and petrochemical operations. I turn dense workflows into clear product experiences, pairing strong TypeScript architecture with thoughtful interaction design, testing, and performance engineering.",
  links: {
    github: "https://github.com/sf-kashfi/",
    linkedin: "https://www.linkedin.com/in/fateme-kashfi/",
    telegram: "https://t.me/sfkashfi",
  },
};

export const metrics = [
  { value: "16+", label: "Enterprise Projects Shipped" },
  { value: "30%", label: "OMS UI performance gain" },
  { value: "10+", label: "Teams Collaborated" },
  { value: "12+", label: "domain modules delivered" },
];

export const experience = [
  {
    period: "Dec 2025 — Present",
    role: "Senior Frontend Developer",
    company: "Hirbod Niroo",
    domain: "Oil, Gas & Petrochemical",
    summary:
      "Leading the frontend architecture of a unified enterprise workspace for operational teams.",
    highlights: [
      "Architected a window management system hosting 30+ draggable and resizable applications with portal-aware stacking and container-query layouts.",
      "Modularized a legacy work desk into 12+ domain-scoped TypeScript modules with typed services and React Query data hooks.",
      "Built conflict-aware meeting scheduling, calendar timelines, minutes capture, Excel export, and Playwright lifecycle coverage.",
      "Delivered permission-aware Kanban workflows, nested file management, work logs, and analytics reporting.",
    ],
  },
  {
    period: "Dec 2024 — Dec 2025",
    role: "Frontend Developer",
    company: "OmidBank",
    domain: "Fintech · Bank Sepah",
    summary:
      "Built secure, responsive banking experiences across PWA, Android web views, and administration tools.",
    highlights: [
      "Delivered banking flows for transfers, cheques, loans, guarantees, cards, and wallets using React Query and Material UI.",
      "Implemented Axios encryption and decryption interceptors to strengthen API data handling.",
      "Built a ref-counted SSE client with topic multiplexing, token-aware reconnect, and automatic query invalidation.",
      "Maintained Vue.js administration features and led the migration direction toward React.",
    ],
  },
  {
    period: "Sep 2021 — Dec 2024",
    role: "Frontend Developer",
    company: "Datxsoft",
    domain: "Capital Markets · Pasargad Financial Group",
    summary:
      "Developed data-intensive trading and investment products used in high-traffic financial operations.",
    highlights: [
      "Improved order-management UI performance by 30% with React, TypeScript, and Redux.",
      "Integrated Material UI and AG Grid to streamline operational workflows, contributing to a 20% task-efficiency gain.",
      "Reduced load time by 15% while maintaining and refactoring ExtJS and AngularJS systems.",
      "Delivered a concurrent SharePoint and React smart-office project that optimized content workflows by 25%.",
    ],
  },
];

export const projects: Project[] = [
  {
    slug: "enterprise-workspace",
    title: "Enterprise Workspace",
    eyebrow: "Current · Confidential",
    summary:
      "A browser-based operating environment that brings 30+ enterprise applications into one coherent, desktop-like workspace.",
    challenge:
      "Independent operational tools needed to coexist without sacrificing performance, permission safety, or usability at highly variable window sizes.",
    solution:
      "A typed modular shell with imperative dragging, portal-aware overlay management, container queries, domain services, and shared data primitives.",
    achievements: [
      "30+ hosted applications",
      "12+ domain-scoped modules",
      "Full meeting lifecycle E2E coverage",
    ],
    tech: ["React", "TypeScript", "React Query", "Playwright", "Container Queries"],
    confidential: true,
    accent: "teal",
  },
  {
    slug: "omid-bank",
    title: "OmidBank PWA",
    eyebrow: "Fintech · Public product",
    summary:
      "A secure mobile-first banking experience spanning daily transactions, credit products, cards, and wallets.",
    challenge:
      "Deliver sensitive financial workflows reliably across constrained mobile contexts while keeping server state live and consistent.",
    solution:
      "Composable validated forms, secure Axios transport interceptors, resilient SSE synchronization, and focused responsive flows.",
    achievements: [
      "Encrypted API transport layer",
      "Real-time resource synchronization",
      "PWA and Android web-view delivery",
    ],
    tech: ["React", "React Query", "Material UI", "React Hook Form", "Axios"],
    link: "https://omidbank.ir/app/",
    accent: "coral",
  },
  {
    slug: "order-management",
    title: "Capital Markets OMS",
    eyebrow: "Trading platform",
    summary:
      "A high-traffic order management environment for market watch, portfolios, OTC operations, and dense financial data.",
    challenge:
      "Make large, rapidly changing datasets and complex trade actions fast, legible, and dependable for expert operators.",
    solution:
      "A performance-focused React and TypeScript frontend using normalized state, sagas, AG Grid, and domain-specific visualizations.",
    achievements: [
      "30% UI performance improvement",
      "20% task-efficiency increase",
      "Multi-instrument trading workflows",
    ],
    tech: ["React", "TypeScript", "Redux Saga", "Material UI", "AG Grid"],
    link: "https://fatemehkashfi.crevado.com/oms",
    accent: "amber",
  },
  {
    slug: "investment-funds",
    title: "Investment Fund System",
    eyebrow: "Capital markets",
    summary:
      "A fund discovery and management product for investors, financial advisors, and fund managers.",
    challenge:
      "Present comparable investment information and transaction paths without overwhelming users.",
    solution:
      "A responsive information architecture with React Query-backed data and reusable Core UI and Material UI patterns.",
    achievements: ["Fund exploration and comparison", "Role-aware workflows", "Responsive product UI"],
    tech: ["React", "Redux", "React Query", "Core UI", "Material UI"],
    link: "https://fatemehkashfi.crevado.com/investment-fund-system",
    accent: "teal",
  },
  {
    slug: "sms-platform",
    title: "SMS Delivery Platform",
    eyebrow: "Communications",
    summary:
      "A web-based system for composing, managing, and delivering operational SMS communications.",
    challenge:
      "Make bulk messaging workflows clear while maintaining reliable backend delivery feedback.",
    solution:
      "A focused React interface with predictable Redux state and React Query server synchronization.",
    achievements: ["Streamlined message delivery", "Backend status integration", "Reusable operational UI"],
    tech: ["React", "Redux", "React Query", "Core UI"],
    link: "https://fatemehkashfi.crevado.com/sms-sending-system",
    accent: "coral",
  },
];

export const skillGroups = [
  {
    title: "Frontend systems",
    description: "Scalable, typed interfaces built around clear domain boundaries.",
    skills: ["React", "Next.js", "TypeScript", "JavaScript ES6+", "Vue.js", "Tailwind CSS"],
  },
  {
    title: "Architecture & data",
    description: "Reliable client architecture for dense, real-time products.",
    skills: ["React Query", "Redux", "Redux Saga", "REST APIs", "Axios", "SSE", "Zod"],
  },
  {
    title: "Product & UI engineering",
    description: "Accessible design systems and workflows for expert users.",
    skills: ["Figma", "Material UI", "shadcn/ui", "Sass", "Responsive UI", "Adobe Photoshop"],
  },
  {
    title: "Quality & delivery",
    description: "Testing and team practices that make change safer.",
    skills: ["Playwright", "Cypress", "Git", "GitHub", "Scrum", "Cross-browser delivery"],
  },
];

export const technologies = [
  "React",
  "Next.js",
  "TypeScript",
  "React Query",
  "Redux",
  "Playwright",
  "Tailwind CSS",
  "Material UI",
  "React Hook Form",
  "Zod",
  "PostgreSQL",
  "Microsoft SQL Server",
  "Figma",
  "Git",
];

export const education = {
  degree: "B.Sc. Software Engineering",
  school: "Bu-Ali Sina University",
  location: "Hamedan",
  period: "2016 — 2020",
};

export const languages = [
  { name: "Persian", level: "Native" },
  { name: "English", level: "Professional working proficiency" },
];

export const interests = ["Product design", "Games", "Cinema"];
