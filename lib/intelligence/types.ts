export type Signal = {
  label: string;
  description?: string;
};

export type GTMSearchCriteria = {
  query: string;
  industry?: string;
  country?: string;
  minEmployees?: number;
  maxEmployees?: number;
  jobKeywords?: string[];
  buyerTitles?: string[];
  limit?: number;
};

export type IntelligenceSource = "mock" | "crustdata";

export type CompanyResult = {
  id: string;
  rank: number;
  name: string;
  domain: string;
  initials: string;
  color: string;
  industry: string;
  employeeCount: number;
  location: string;
  fitScore: number;
  signals: Signal[];
  whyNow: string;
  likelyBuyerTitle: string;
  outreachAngle: string;
};

export type SearchRecord = {
  id: string;
  query: string;
  createdAt: string;
  results: CompanyResult[];
  criteria: GTMSearchCriteria;
  source: IntelligenceSource;
  notice?: string;
};

// PublicCompanyResult intentionally cannot carry private scoring, buyer, or outreach fields.
export type PublicCompanyResult = {
  id: string;
  rank: number;
  name: string;
  domain: string;
  initials: string;
  color: string;
  industry: string;
  companySize: string;
  location: string;
  signals: Signal[];
  notability: string;
};

export type PublicReport = {
  id: string;
  searchId: string;
  title: string;
  slug: string;
  intro: string;
  summary: string;
  createdAt: string;
  updatedAt: string;
  methodology: string;
  companies: PublicCompanyResult[];
};
