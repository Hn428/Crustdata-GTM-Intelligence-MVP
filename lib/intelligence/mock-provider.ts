import type { IntelligenceProvider } from "@/lib/intelligence/provider";
import type { CompanyResult, SearchRecord } from "@/lib/intelligence/types";

export const exampleQueries = [
  {
    label: "Fintech · First sales team",
    query: "Find Series A fintech companies hiring their first sales team.",
  },
  {
    label: "Devtools · Enterprise",
    query: "Find developer-tool startups expanding enterprise sales.",
  },
  {
    label: "Cybersecurity · Leadership",
    query: "Find cybersecurity startups where a new sales leader may have joined.",
  },
];

const companies: CompanyResult[] = [
  {
    id: "nova-recruit",
    rank: 1,
    name: "NovaRecruit AI",
    domain: "novarecruit.example",
    initials: "NR",
    color: "#6757d9",
    industry: "Interview Intelligence",
    employeeCount: 72,
    location: "New York, NY",
    fitScore: 96,
    signals: [
      { label: "Headcount +31% in 6 months" },
      { label: "9 open GTM roles" },
      { label: "Raised Series A" },
    ],
    whyNow:
      "NovaRecruit is shifting from product-led adoption toward an enterprise motion, with the strongest combined people-growth and commercial hiring signal in this cohort.",
    likelyBuyerTitle: "Founder / VP Sales",
    outreachAngle:
      "Lead with how enriched hiring and growth signals can help a newly expanded revenue team prioritize accounts before competitors see the change.",
  },
  {
    id: "talently",
    rank: 2,
    name: "Talently",
    domain: "talently.example",
    initials: "TY",
    color: "#161616",
    industry: "AI Talent Marketplace",
    employeeCount: 164,
    location: "San Francisco, CA",
    fitScore: 94,
    signals: [
      { label: "Raised Series B" },
      { label: "Headcount +54%" },
      { label: "New sales leadership" },
    ],
    whyNow:
      "A fresh growth round and rapid team expansion suggest a shift from marketplace momentum toward a more structured enterprise go-to-market motion.",
    likelyBuyerTitle: "Head of Growth",
    outreachAngle:
      "Connect their move upmarket to the need for timely account research and repeatable territory intelligence across a quickly growing team.",
  },
  {
    id: "relay-hire",
    rank: 3,
    name: "RelayHire",
    domain: "relayhire.example",
    initials: "RH",
    color: "#246d91",
    industry: "AI Recruiting Platform",
    employeeCount: 88,
    location: "Palo Alto, CA",
    fitScore: 91,
    signals: [
      { label: "6 new enterprise roles" },
      { label: "Headcount +28%" },
      { label: "Launched new product" },
    ],
    whyNow:
      "RelayHire is building a commercial layer around a broader product suite, creating a timely window for sales infrastructure and market-mapping tools.",
    likelyBuyerTitle: "Chief Revenue Officer",
    outreachAngle:
      "Position live market maps as a way to give new enterprise sellers a useful book of business before their first day in territory.",
  },
  {
    id: "prism-ats",
    rank: 4,
    name: "PrismATS",
    domain: "prismats.example",
    initials: "PA",
    color: "#ef694f",
    industry: "Recruiting Operations",
    employeeCount: 246,
    location: "Austin, TX",
    fitScore: 89,
    signals: [
      { label: "12 open sales roles" },
      { label: "International expansion" },
      { label: "Traffic +35%" },
    ],
    whyNow:
      "Sustained demand and international hiring point to a larger addressable market and a need to coordinate prospecting across regions and segments.",
    likelyBuyerTitle: "VP of Sales",
    outreachAngle:
      "Focus on consistent global account qualification as the sales organization grows across new regions and verticals.",
  },
  {
    id: "scout-pilot",
    rank: 5,
    name: "ScoutPilot",
    domain: "scoutpilot.example",
    initials: "SP",
    color: "#176b5a",
    industry: "Recruiting Automation",
    employeeCount: 94,
    location: "San Francisco, CA",
    fitScore: 87,
    signals: [
      { label: "New VP Sales joined" },
      { label: "5 GTM openings" },
      { label: "Product hiring +22%" },
    ],
    whyNow:
      "New commercial leadership and active GTM hiring indicate a likely reset of outbound process, tooling, and ideal-customer targeting.",
    likelyBuyerTitle: "VP of Sales",
    outreachAngle:
      "Use the recent leadership change as a reason to discuss a cleaner, signal-driven foundation for their next phase of outbound.",
  },
  {
    id: "cohortly",
    rank: 6,
    name: "Cohortly",
    domain: "cohortly.example",
    initials: "CO",
    color: "#d36a2e",
    industry: "Recruiter Marketplace",
    employeeCount: 58,
    location: "Denver, CO",
    fitScore: 84,
    signals: [
      { label: "Raised Series A" },
      { label: "Headcount +46%" },
      { label: "Expanding enterprise" },
    ],
    whyNow:
      "Recent financing is translating into employee growth and an enterprise push, both strong indicators of near-term GTM experimentation.",
    likelyBuyerTitle: "Co-founder, GTM",
    outreachAngle:
      "Show how a lean team can turn one vertical thesis into both an outbound list and credible category content.",
  },
  {
    id: "people-canvas",
    rank: 7,
    name: "PeopleCanvas",
    domain: "peoplecanvas.example",
    initials: "PC",
    color: "#c44581",
    industry: "People Search AI",
    employeeCount: 45,
    location: "New York, NY",
    fitScore: 82,
    signals: [
      { label: "Enterprise plan launched" },
      { label: "3 GTM hires" },
      { label: "Traffic +61%" },
    ],
    whyNow:
      "Strong web interest and a new enterprise package suggest the company is formalizing how it captures and converts larger customers.",
    likelyBuyerTitle: "Head of Revenue",
    outreachAngle:
      "Tie rising inbound demand to a complementary outbound motion built around specific, verifiable buyer signals.",
  },
  {
    id: "interview-lens",
    rank: 8,
    name: "InterviewLens",
    domain: "interviewlens.example",
    initials: "IL",
    color: "#4769c2",
    industry: "Interview Notetaking",
    employeeCount: 86,
    location: "Boston, MA",
    fitScore: 80,
    signals: [
      { label: "Headcount +24%" },
      { label: "US team expansion" },
      { label: "7 open roles" },
    ],
    whyNow:
      "A growing US team and steady hiring imply the company is investing in category ownership as interview intelligence becomes more competitive.",
    likelyBuyerTitle: "Director of Demand Gen",
    outreachAngle:
      "Pitch a repeatable way to convert proprietary market research into both campaign targets and category-defining public reports.",
  },
  {
    id: "vox-talent",
    rank: 9,
    name: "VoxTalent",
    domain: "voxtalent.example",
    initials: "VT",
    color: "#1d8b8a",
    industry: "Voice Recruiting AI",
    employeeCount: 62,
    location: "Seattle, WA",
    fitScore: 78,
    signals: [
      { label: "Raised growth round" },
      { label: "4 sales openings" },
      { label: "Partner channel launched" },
    ],
    whyNow:
      "A new capital injection and partner motion point to broader distribution ambitions and rising demand for structured market coverage.",
    likelyBuyerTitle: "VP of Growth",
    outreachAngle:
      "Frame signal-based research as the common data layer for direct sales and a newly launched partner channel.",
  },
  {
    id: "siftwork",
    rank: 10,
    name: "Siftwork",
    domain: "siftwork.example",
    initials: "SW",
    color: "#697a35",
    industry: "Candidate Matching AI",
    employeeCount: 51,
    location: "Chicago, IL",
    fitScore: 76,
    signals: [
      { label: "First marketing leader" },
      { label: "Headcount +19%" },
      { label: "Launched integrations" },
    ],
    whyNow:
      "A first senior marketing hire and new ecosystem integrations suggest Siftwork is preparing to create and capture a more defined category.",
    likelyBuyerTitle: "VP of Marketing",
    outreachAngle:
      "Connect category creation to a research engine that gives campaigns an evidence-backed point of view and an account list to activate.",
  },
];

export const seedSearch: SearchRecord = {
  id: "ai-recruiting-gtm",
  query: "Find fast-growing AI recruiting startups in the US that recently raised funding and are hiring GTM leaders.",
  createdAt: "August 27, 2026 at 10:32 AM UTC",
  results: companies,
  criteria: {
    query: "Find fast-growing AI recruiting startups in the US that recently raised funding and are hiring GTM leaders.",
    industry: "Artificial Intelligence (AI)",
    country: "USA",
    minEmployees: 20,
    maxEmployees: 500,
    jobKeywords: ["sales", "revenue", "growth", "marketing"],
    buyerTitles: ["Head of GTM", "VP Sales", "VP Revenue", "Founder"],
    limit: 10,
  },
  source: "mock",
};

export class MockIntelligenceProvider implements IntelligenceProvider {
  async search(criteria: SearchRecord["criteria"]): Promise<SearchRecord> {
    return {
      ...seedSearch,
      query: criteria.query,
      criteria,
    };
  }
}

export const intelligenceProvider: IntelligenceProvider = new MockIntelligenceProvider();
