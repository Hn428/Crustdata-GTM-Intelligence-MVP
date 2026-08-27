import type { PublicCompanyResult, PublicReport } from "@/lib/intelligence/types";
import { seedSearch } from "@/lib/intelligence/mock-provider";
import { getStoredPublicReport } from "@/lib/publication/report-store";
import { toPublicReport } from "@/lib/publication/transform";

const methodology =
  "We evaluated companies using publicly observable company growth, funding, leadership, hiring, and web-momentum signals. Companies are listed by the combined strength and recency of those signals. This report uses illustrative data for this product preview.";

export const primaryReportDetails = {
  id: "report-ai-recruiting-2026",
  title: "Fast-Growing AI Recruiting Startups Hiring GTM Teams in 2026",
  slug: "fast-growing-ai-recruiting-startups-hiring-gtm-teams-2026",
  intro:
    "A data-backed look at emerging AI recruiting companies showing meaningful hiring, funding, and go-to-market momentum across the United States.",
  summary: "AI recruiting companies with recent hiring, funding, and commercial growth signals.",
  createdAt: "2026-08-27",
  updatedAt: "2026-08-27",
  methodology,
} satisfies Parameters<typeof toPublicReport>[1];

const primaryReport = toPublicReport(seedSearch, primaryReportDetails);

export function createPublicReportFromSearch(search: Parameters<typeof toPublicReport>[0]) {
  const date = new Date().toISOString().slice(0, 10);
  const interpretedQuery = search.interpretedQuery ?? search.query;
  const subject = interpretedQuery
    .replace(/^(find|show|identify|which)\s+/i, "")
    .replace(/[.?!]+$/, "")
    .trim();
  const conciseSubject = subject.length > 96 ? `${subject.slice(0, 93).trimEnd()}…` : subject;
  const slugSubject = subject
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 72);
  const liveMethodology =
    search.source === "agent"
      ? "OpenAI interpreted the research goal and selected read-only Crustdata MCP tools. Company facts and signals were retained only when they matched returned Crustdata evidence. Rankings use deterministic application scoring; private buyer, outreach, and score fields are excluded from this report."
      : search.source === "crustdata"
        ? "Companies were selected from direct Crustdata company and job searches, then ranked with deterministic application scoring. Private buyer, outreach, and score fields are excluded from this report."
        : methodology;

  return toPublicReport(search, {
    id: `report-${slugSubject || "gtm-research"}`,
    title: conciseSubject ? `GTM market research: ${conciseSubject}` : "GTM market research",
    slug: `gtm-research-${slugSubject || "companies"}`,
    intro:
      search.researchSummary ??
      `A focused review of ${search.results.length} companies returned for the research goal, using the factual signals available in the source data.`,
    summary: `A public-safe market view of ${search.results.length} researched companies and their verified signals.`,
    createdAt: date,
    updatedAt: date,
    methodology: liveMethodology,
  });
}

const fintechCompanies: PublicCompanyResult[] = [
  {
    id: "ledgerlane",
    rank: 1,
    name: "LedgerLane",
    domain: "ledgerlane.example",
    initials: "LL",
    color: "#355f9b",
    industry: "B2B Payments",
    companySize: "138 employees",
    location: "London, UK",
    signals: [{ label: "Engineering +38%" }, { label: "Opened NYC office" }, { label: "Raised Series A" }],
    notability: "LedgerLane is using fresh funding to establish a US product and engineering hub while expanding its enterprise payment infrastructure.",
  },
  {
    id: "mintbridge",
    rank: 2,
    name: "MintBridge",
    domain: "mintbridge.example",
    initials: "MB",
    color: "#247a60",
    industry: "Treasury Software",
    companySize: "91 employees",
    location: "Paris, France",
    signals: [{ label: "11 technical openings" }, { label: "US entity formed" }, { label: "Headcount +29%" }],
    notability: "A newly formed US entity and concentrated technical hiring indicate an active market-entry phase rather than exploratory expansion.",
  },
  {
    id: "clearrail",
    rank: 3,
    name: "ClearRail",
    domain: "clearrail.example",
    initials: "CR",
    color: "#c45c43",
    industry: "Risk Infrastructure",
    companySize: "76 employees",
    location: "Berlin, Germany",
    signals: [{ label: "New US CTO" }, { label: "Product team +25%" }, { label: "2 bank partnerships" }],
    notability: "Senior US technical leadership and new distribution partners create a strong foundation for a larger North American engineering footprint.",
  },
  {
    id: "northstar-pay",
    rank: 4,
    name: "Northstar Pay",
    domain: "northstarpay.example",
    initials: "NP",
    color: "#7653a8",
    industry: "Payment Operations",
    companySize: "119 employees",
    location: "Dublin, Ireland",
    signals: [{ label: "Series A extension" }, { label: "7 US roles" }, { label: "Cloud hiring +34%" }],
    notability: "An extended funding round and simultaneous US and cloud hiring point to a deliberate investment in scale and regional reliability.",
  },
];

const devtoolCompanies: PublicCompanyResult[] = [
  {
    id: "stackforge",
    rank: 1,
    name: "StackForge",
    domain: "stackforge.example",
    initials: "SF",
    color: "#292d32",
    industry: "Developer Infrastructure",
    companySize: "104 employees",
    location: "San Francisco, CA",
    signals: [{ label: "New CRO joined" }, { label: "10 sales roles" }, { label: "Enterprise tier launched" }],
    notability: "StackForge has paired new commercial leadership with a dedicated enterprise offering and its largest sales hiring push to date.",
  },
  {
    id: "tracebit",
    rank: 2,
    name: "Tracebit",
    domain: "tracebit.example",
    initials: "TB",
    color: "#3d72b4",
    industry: "Observability",
    companySize: "67 employees",
    location: "Seattle, WA",
    signals: [{ label: "Headcount +41%" }, { label: "SOC 2 completed" }, { label: "First RevOps hire" }],
    notability: "Security readiness and the first revenue operations hire suggest Tracebit is formalizing the systems needed for larger contracts.",
  },
  {
    id: "branchline",
    rank: 3,
    name: "Branchline",
    domain: "branchline.example",
    initials: "BL",
    color: "#ba6638",
    industry: "Deployment Automation",
    companySize: "83 employees",
    location: "Austin, TX",
    signals: [{ label: "5 enterprise AEs" }, { label: "Partner program launched" }, { label: "Traffic +47%" }],
    notability: "A new partner channel and concentrated enterprise hiring show Branchline is diversifying beyond its established developer-led motion.",
  },
  {
    id: "querynest",
    rank: 4,
    name: "QueryNest",
    domain: "querynest.example",
    initials: "QN",
    color: "#8a4873",
    industry: "Data Developer Tools",
    companySize: "55 employees",
    location: "New York, NY",
    signals: [{ label: "Raised Series B" }, { label: "New VP Marketing" }, { label: "Pricing redesigned" }],
    notability: "Fresh capital, senior marketing leadership, and a redesigned pricing model together signal a decisive move toward enterprise acquisition.",
  },
];

export const publicReports: PublicReport[] = [
  primaryReport,
  {
    id: "report-fintech-engineering",
    searchId: "fintech-us-engineering",
    title: "Series A Fintech Companies Expanding Engineering",
    slug: "series-a-fintech-companies-expanding-engineering",
    intro: "European fintech startups pairing fresh capital with tangible engineering expansion in the United States.",
    summary: "Funded fintech teams translating US expansion plans into technical hiring.",
    createdAt: "2026-08-21",
    updatedAt: "2026-08-25",
    methodology,
    companies: fintechCompanies,
  },
  {
    id: "report-devtools-enterprise-sales",
    searchId: "devtools-enterprise-sales",
    title: "Developer Tools Startups Scaling Enterprise Sales",
    slug: "developer-tools-startups-scaling-enterprise-sales",
    intro: "Developer infrastructure companies adding the people, packaging, and operating systems required to sell upmarket.",
    summary: "Developer-first businesses showing clear evidence of an enterprise GTM transition.",
    createdAt: "2026-08-18",
    updatedAt: "2026-08-24",
    methodology,
    companies: devtoolCompanies,
  },
];

export function getPublicReport(slug: string): PublicReport | undefined {
  return getStoredPublicReport(slug) ?? publicReports.find((report) => report.slug === slug);
}
