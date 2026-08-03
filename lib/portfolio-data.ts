export type ProjectImage = {
  src: string;
  alt: string;
  label: string;
  description: string;
  group: string;
  theme: "light" | "dark";
  emphasis: "hero" | "feature" | "supporting";
  device?: "desktop" | "mobile";
  width: number;
  height: number;
};

export type ProjectPreviewImage = Pick<ProjectImage, "src" | "alt" | "label">;

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
  images?: ProjectImage[];
  lightPreviewImages?: ProjectPreviewImage[];
  previewLabel?: string;
  previewStatus?: string;
  previewVariant?: "trading" | "investor";
  businessOverview?: string;
  technicalOverview?: string;
  engineeringChallenges?: string[];
  stackGroups?: { label: string; items: string[] }[];
  gallery?: {
    eyebrow: string;
    title: string;
    intro: string;
    capabilities: string[];
    groups: { name: string; description: string }[];
  };
  accent: "teal" | "coral" | "amber";
};

const oms = (file: string) => `/images/projects/oms/${file}`;
const atom = (file: string) => `/images/projects/attom/${file}`;

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
    slug: "order-management",
    title: "OMS",
    eyebrow: "Financial trading platform",
    summary:
      "A comprehensive Order Management System built with React to streamline trading across financial instruments—from market watch and execution to portfolios, accounting, OTC workflows, and analysis.",
    challenge:
      "Unify large, rapidly changing market datasets and high-stakes trading actions in an interface that remains fast, legible, and dependable for expert operators.",
    solution:
      "A performance-focused React and TypeScript frontend with normalized Redux Toolkit state, saga-driven workflows, AG Grid data surfaces, validated forms, and domain-specific visualizations including portfolio treemaps.",
    achievements: [
      "30% UI performance improvement",
      "20% task-efficiency increase",
      "Multi-instrument trading workflows",
      "Real-time portfolio visualization",
    ],
    tech: [
      "React",
      "TypeScript",
      "Redux",
      "Redux Toolkit",
      "Redux Saga",
      "Material UI",
      "AG Grid",
      "React Hook Form",
      "Yup",
    ],
    lightPreviewImages: [
      {
        src: oms("technical-analysis-light.png"),
        alt: "OMS light-theme technical analysis workspace with candlestick chart, volume, and drawing tools",
        label: "Technical analysis",
      },
      {
        src: oms("market-treemap-light.png"),
        alt: "OMS light-theme market treemap showing sector and instrument performance with proportional tiles",
        label: "Market treemap",
      },
      {
        src: oms("broker-order-entry-light.png"),
        alt: "OMS light-theme order entry workflow with broker selection, market watch, and order history",
        label: "Order entry",
      },
    ],
    images: [
      {
        src: oms("market-overview.png"),
        alt: "OMS market overview dashboard with index chart, capital activity, and high-volume trading tables",
        label: "Market overview",
        description: "A consolidated view of market movement, capital activity, high-volume symbols, and live index performance.",
        group: "Market intelligence",
        theme: "dark",
        emphasis: "hero",
        width: 1024,
        height: 512,
      },
      {
        src: oms("market-treemap.png"),
        alt: "OMS market treemap visualizing portfolio and sector performance with proportional tiles",
        label: "Market treemap",
        description: "A proportional heat map that makes sector breadth, winners, and laggards immediately scannable.",
        group: "Market intelligence",
        theme: "dark",
        emphasis: "feature",
        width: 1024,
        height: 512,
      },
      {
        src: oms("technical-analysis.png"),
        alt: "OMS technical analysis workspace showing a detailed candlestick chart and trading volume",
        label: "Technical analysis",
        description: "A focused charting workspace with candlesticks, volume, drawing tools, and market context.",
        group: "Market intelligence",
        theme: "dark",
        emphasis: "feature",
        width: 1024,
        height: 487,
      },
      {
        src: oms("symbol-dashboard.png"),
        alt: "OMS symbol dashboard combining trade flow, valuation, market depth, and financial indicators",
        label: "Symbol dashboard",
        description: "Dense symbol-level intelligence organized into clear analytical modules and comparison panels.",
        group: "Market intelligence",
        theme: "dark",
        emphasis: "feature",
        width: 1024,
        height: 488,
      },
      {
        src: oms("symbol-analysis.png"),
        alt: "OMS symbol analysis screen with indicators, support and resistance levels, and market status",
        label: "Symbol analysis",
        description: "Technical indicators, price levels, and trend signals brought together for faster evaluation.",
        group: "Market intelligence",
        theme: "dark",
        emphasis: "supporting",
        width: 1024,
        height: 488,
      },
      {
        src: oms("market-depth.png"),
        alt: "OMS market depth table with bid and ask quantities across a large instrument watchlist",
        label: "Market depth",
        description: "A high-density depth surface designed for scanning bid, ask, volume, and price movement.",
        group: "Market intelligence",
        theme: "dark",
        emphasis: "supporting",
        width: 1024,
        height: 487,
      },
      {
        src: oms("market-watch.png"),
        alt: "OMS market watch with instrument sparklines, live prices, and bid and ask columns",
        label: "Market watch",
        description: "Live instruments, compact trend lines, price changes, and market actions in one operational view.",
        group: "Market intelligence",
        theme: "dark",
        emphasis: "supporting",
        width: 1024,
        height: 489,
      },
      {
        src: oms("legacy-market-overview-light.png"),
        alt: "OMS light-theme chronological order history with account balances and conditional order actions",
        label: "Order timeline",
        description: "A date-grouped order history that keeps balances, status, and conditional order actions close at hand.",
        group: "Trading operations",
        theme: "light",
        emphasis: "supporting",
        width: 1024,
        height: 512,
      },
      {
        src: oms("orders-market-watch.png"),
        alt: "OMS trading workspace with market watch, order book, and order management grids",
        label: "Orders & market watch",
        description: "A multi-panel workspace for monitoring instruments while managing active and historical orders.",
        group: "Trading operations",
        theme: "dark",
        emphasis: "feature",
        width: 1024,
        height: 512,
      },
      {
        src: oms("orders-and-trades.png"),
        alt: "OMS portfolio and order tracking workspace with holdings and active order grids",
        label: "Orders & trades",
        description: "Holdings and order state stay linked so operators can monitor positions while tracking every execution.",
        group: "Trading operations",
        theme: "dark",
        emphasis: "feature",
        width: 1024,
        height: 512,
      },
      {
        src: oms("order-ticket-light.png"),
        alt: "OMS light-theme order ticket over market watch and order history tables",
        label: "Order ticket",
        description: "A compact execution ticket keeps quantity, price, validity, and order-side controls close to market context.",
        group: "Trading operations",
        theme: "light",
        emphasis: "feature",
        width: 1024,
        height: 512,
      },
      {
        src: oms("broker-order-entry-light.png"),
        alt: "OMS light-theme order entry workflow with broker selection and order form",
        label: "Broker order entry",
        description: "Broker selection, account controls, and validated execution fields in a guided order workflow.",
        group: "Trading operations",
        theme: "light",
        emphasis: "supporting",
        width: 1024,
        height: 512,
      },
      {
        src: oms("order-amendment.png"),
        alt: "OMS initial offering and securities subscription request form over order tables",
        label: "Offering request",
        description: "Initial offering and subscription requests capture volume, price limits, and validation constraints in one form.",
        group: "Trading operations",
        theme: "dark",
        emphasis: "supporting",
        width: 1024,
        height: 512,
      },
      {
        src: oms("trading-calendar.png"),
        alt: "OMS monthly trading calendar with daily activity indicators and transaction volume summaries",
        label: "Trading calendar",
        description: "Monthly activity patterns and buy/sell distribution summarized for historical review.",
        group: "Trading operations",
        theme: "dark",
        emphasis: "supporting",
        width: 1024,
        height: 660,
      },
      {
        src: oms("modular-trading-workspace.png"),
        alt: "OMS modular trading workspace showing market watch, portfolio, and order management panels",
        label: "Modular workspace",
        description: "Independent data modules combine into a flexible operating surface for day-to-day trading.",
        group: "Trading operations",
        theme: "dark",
        emphasis: "supporting",
        width: 1024,
        height: 512,
      },
      {
        src: oms("otc-requests-light.png"),
        alt: "OMS light-theme over-the-counter request workflow with request and response tables",
        label: "OTC requests",
        description: "Request and response states for over-the-counter transactions presented in a focused workflow.",
        group: "Trading operations",
        theme: "light",
        emphasis: "supporting",
        width: 1024,
        height: 512,
      },
      {
        src: oms("portfolio-market-watch.png"),
        alt: "OMS portfolio allocation panel beside a comprehensive market watch table",
        label: "Portfolio allocation",
        description: "Portfolio distribution and market positions remain visible alongside a detailed instrument watchlist.",
        group: "Portfolio & access",
        theme: "dark",
        emphasis: "feature",
        width: 1024,
        height: 512,
      },
      {
        src: oms("portfolio-dashboard.png"),
        alt: "OMS portfolio dashboard with allocation chart, holdings table, and market watch",
        label: "Portfolio dashboard",
        description: "Allocation, holdings detail, and market context share one surface for faster portfolio decisions.",
        group: "Portfolio & access",
        theme: "dark",
        emphasis: "feature",
        width: 1024,
        height: 512,
      },
      {
        src: oms("portfolio-allocation-dashboard.png"),
        alt: "OMS portfolio allocation dashboard with donut chart, instrument table, and allocation tooltip",
        label: "Allocation detail",
        description: "Interactive allocation detail links portfolio composition to the underlying instrument data.",
        group: "Portfolio & access",
        theme: "dark",
        emphasis: "supporting",
        width: 1024,
        height: 512,
      },
      {
        src: oms("login.png"),
        alt: "Pasargad Trader OMS sign-in page with a laptop preview of the market dashboard",
        label: "Secure access",
        description: "The authenticated product entry point introduces the trading environment and account access.",
        group: "Portfolio & access",
        theme: "dark",
        emphasis: "supporting",
        width: 1024,
        height: 512,
      },
    ],
    link: "https://app.pasargadtrader.ir/",
    previewLabel: "OMS / LIVE TRADING ENVIRONMENT",
    previewStatus: "REAL-TIME",
    previewVariant: "trading",
    accent: "amber",
  },
  {
    slug: "atom-investor",
    title: "Atom Investor (InvestoPod)",
    eyebrow: "Capital markets · Investor platform",
    summary:
      "A digital investor gateway for Pasargad funds, connecting Sejam onboarding, portfolio visibility, unit issue and redemption, payment, and order tracking in a responsive RTL experience.",
    challenge:
      "Give investors a dependable self-service path through regulated identity checks, fund transactions, payment, and account servicing without relying on branch or offline processes.",
    solution:
      "A Vite and React SPA with typed domain contracts, Redux Toolkit and saga orchestration, centralized Axios services, and accessible MUI workflows designed for Persian RTL financial data.",
    achievements: [
      "Sejam-backed investor onboarding",
      "Issue, agreement, and payment orchestration",
      "Redemption against available fund units",
      "Filterable orders, revocation, and statements",
    ],
    tech: ["React", "TypeScript", "Redux Toolkit", "Redux Saga", "Vite", "MUI", "Axios", "MUI Data Grid"],
    previewLabel: "INVESTOPOD / INVESTOR GATEWAY",
    previewStatus: "RTL · PWA",
    previewVariant: "investor",
    businessOverview:
      "Atom Investor is the digital investor gateway for funds managed under the Pasargad capital-market services group. It enables investors to open access, complete regulatory identity steps, and place subscription (issue) and redemption requests without relying solely on branch or offline processes. Sejam-backed registration and login lead into portfolio holdings and fund NAV context, multi-step purchases with agreement acceptance and payment, redemption against available units, order tracking with filters and revocation where allowed, and account statement review. Profile tools also support Sejam data refresh and password management, keeping identity, payment, and portfolio data aligned throughout the investor journey.",
    technicalOverview:
      "The frontend is a Vite, React, and TypeScript SPA organized into pages, shared components, theme, and an application layer for models, API services, and state. Hash-based routing separates public authentication and landing routes from an authenticated sidebar shell. Redux Toolkit slices and redux-saga coordinate portfolio enrichment, paginated orders with per-document status, statements, fund catalog data, and draft issue creation followed by agreement retrieval. Centralized Axios wrappers attach session tokens, support multipart uploads, normalize API envelopes, and surface Persian toast feedback. MUI Data Grid, Jalali date pickers, multi-step wizards, typed DTOs, reusable forms, and light/dark Yekan themes support a maintainable RTL product as fund and order APIs evolve.",
    engineeringChallenges: [
      "Multi-step issue and payment branching: draft creation leads to agreement retrieval, then receipt upload or gateway payment while preserving request context across an external redirect.",
      "Order-list enrichment: each row combines document status, mapped fund identity, and cancellation eligibility before the Data Grid is ready to render.",
      "Sejam and fund-access gating: navigation blockers and contextual dialogs prevent investors from entering issue or redemption flows before eligibility checks pass.",
      "Clear UI and state boundaries: API models, saga side effects, Redux slices, and reusable view components stay separated as transaction workflows grow.",
    ],
    stackGroups: [
      { label: "Core", items: ["React", "TypeScript", "Vite", "React Router DOM (hash)"] },
      { label: "State", items: ["Redux", "Redux Toolkit", "Redux Saga", "React Context"] },
      { label: "Data & forms", items: ["Axios", "Controlled forms", "Custom ID/password validation", "MUI LoadingButton"] },
      { label: "UI & RTL", items: ["MUI", "MUI Lab", "Emotion", "Bootstrap", "iconsax-react", "MUI Icons", "React Toastify", "MUI Carousel"] },
      { label: "Tables & dates", items: ["MUI X Data Grid", "MUI X Charts", "MUI X Date Pickers", "date-fns-jalali"] },
      { label: "Tooling", items: ["ESLint", "TypeScript ESLint", "Vite React plugin"] },
    ],
    gallery: {
      eyebrow: "Investor journey",
      title: "From verified access to settled fund orders.",
      intro:
        "The product connects identity, portfolio context, transactions, and servicing in one Persian RTL journey. Desktop data surfaces and focused mobile steps keep the same financial state understandable at every point.",
      capabilities: ["Sejam access", "Portfolio", "Fund issue", "Payment", "Redemption", "Order tracking", "Statements"],
      groups: [
        { name: "Access & identity", description: "Authentication and Sejam verification establish trusted access before an investor can move money or manage fund units." },
        { name: "Portfolio overview", description: "Responsive dashboards connect holdings, NAV context, bank details, service hours, and the next available action." },
        { name: "Issue & payment", description: "Guided issue steps preserve fund and request context from amount entry through payment selection and confirmation." },
        { name: "Servicing & records", description: "Redemption, request status, statements, and filtered RTL grids keep account activity traceable after an order is placed." },
      ],
    },
    images: [
      {
        src: atom("Dashboard -1-28.jpg"),
        alt: "Atom Investor desktop dashboard in Persian showing fund NAV cards, investor holdings, bank accounts, service hours, and issue and redemption journeys",
        label: "Investor dashboard",
        description: "A complete investor overview links holdings, current NAVs, bank accounts, operating windows, and the two core fund journeys.",
        group: "Portfolio overview",
        theme: "light",
        emphasis: "hero",
        device: "desktop",
        width: 1440,
        height: 1024,
      },
      {
        src: atom("Investo PWA-39.png"),
        alt: "Atom Investor mobile dashboard in Persian with funds, holdings, NAV values, account information, and operating hours",
        label: "Mobile portfolio",
        description: "The extended mobile dashboard keeps fund access, holdings, NAV values, and service context available without compressing the RTL hierarchy.",
        group: "Portfolio overview",
        theme: "light",
        emphasis: "supporting",
        device: "mobile",
        width: 375,
        height: 1024,
      },
      {
        src: atom("Investo PWA-29.png"),
        alt: "Atom Investor mobile fund issue form in Persian with fund selection, NAV date, investment amount, and unit estimate",
        label: "Fund issue",
        description: "A focused purchase step translates the investment amount into expected units while keeping fund and NAV context visible.",
        group: "Issue & payment",
        theme: "light",
        emphasis: "supporting",
        device: "mobile",
        width: 375,
        height: 812,
      },
      {
        src: atom("Login-1.png"),
        alt: "Atom Investor desktop login page in Persian with mobile number and password fields, registration entry point, and partner branding",
        label: "Investor access",
        description: "The public entry point separates returning-investor access from the registration path and establishes the Pasargad product context.",
        group: "Access & identity",
        theme: "light",
        emphasis: "feature",
        device: "desktop",
        width: 1440,
        height: 1024,
      },
      {
        src: atom("Investo PWA-12.png"),
        alt: "Atom Investor mobile Sejam identity verification dialog in Persian with a verification-code field",
        label: "Sejam verification",
        description: "A focused verification dialog handles the regulatory identity checkpoint without taking the investor out of the product journey.",
        group: "Access & identity",
        theme: "light",
        emphasis: "supporting",
        device: "mobile",
        width: 375,
        height: 812,
      },
      {
        src: atom("Investo PWA-13.png"),
        alt: "Atom Investor mobile success dialog confirming Sejam identity verification in Persian",
        label: "Identity confirmed",
        description: "A clear success state closes the Sejam step and sets expectations for the protected investor area that follows.",
        group: "Access & identity",
        theme: "light",
        emphasis: "supporting",
        device: "mobile",
        width: 375,
        height: 812,
      },
      {
        src: atom("Investo PWA-35.png"),
        alt: "Atom Investor mobile payment-method screen in Persian offering account balance, bank gateway, and deposit receipt options",
        label: "Payment routing",
        description: "Alternative settlement paths are presented in one decision point, including gateway payment and receipt upload.",
        group: "Issue & payment",
        theme: "light",
        emphasis: "supporting",
        device: "mobile",
        width: 375,
        height: 812,
      },
      {
        src: atom("Investo PWA-37.png"),
        alt: "Atom Investor mobile payment confirmation in Persian with successful status and transaction reference",
        label: "Payment confirmed",
        description: "The gateway return state confirms settlement and exposes a reference investors can use when following the order.",
        group: "Issue & payment",
        theme: "light",
        emphasis: "supporting",
        device: "mobile",
        width: 375,
        height: 812,
      },
      {
        src: atom("Investo PWA-30.png"),
        alt: "Atom Investor mobile redemption form in Persian showing available and pending units",
        label: "Unit redemption",
        description: "Available and pending units are made explicit before the investor submits a redemption request.",
        group: "Servicing & records",
        theme: "light",
        emphasis: "supporting",
        device: "mobile",
        width: 375,
        height: 812,
      },
      {
        src: atom("Investo PWA-6.png"),
        alt: "Atom Investor mobile issue-request detail in Persian showing status, fund, amount, units, and request date",
        label: "Order status",
        description: "A compact request detail makes fund, amount, unit count, date, and current processing status easy to verify.",
        group: "Servicing & records",
        theme: "light",
        emphasis: "supporting",
        device: "mobile",
        width: 375,
        height: 812,
      },
      {
        src: atom("Dashboard -1-12.jpg"),
        alt: "Atom Investor desktop account statement in Persian with Jalali date, fund, status, and request-type filters above an RTL table",
        label: "Account activity",
        description: "Jalali date, fund, status, and transaction filters turn the account statement into a practical audit surface.",
        group: "Servicing & records",
        theme: "light",
        emphasis: "feature",
        device: "desktop",
        width: 1440,
        height: 1024,
      },
      {
        src: atom("Dashboard -1-36.jpg"),
        alt: "Atom Investor desktop request report in Persian with status metrics and a detailed RTL orders table",
        label: "Request reporting",
        description: "Status summaries and a dense MUI Data Grid support fast scanning across issue and redemption requests.",
        group: "Servicing & records",
        theme: "light",
        emphasis: "feature",
        device: "desktop",
        width: 1440,
        height: 1024,
      },
    ],
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
