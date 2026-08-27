import type { CrustdataCompany, CrustdataJob } from "@/lib/intelligence/crustdata-types";
import { calculateFitScore } from "@/lib/intelligence/scoring";
import type { CompanyResult, GTMSearchCriteria, Signal } from "@/lib/intelligence/types";

export type HiringSignals = {
  total: number;
  gtm: number;
  engineering: number;
  leadership: number;
};

const GTM_TITLE = /\b(sales|revenue|account executive|business development|growth|marketing|customer success|partnerships?)\b/i;
const ENGINEERING_TITLE = /\b(engineer|developer|technical|data|machine learning|infrastructure|platform)\b/i;
const LEADERSHIP_TITLE = /\b(head|vp|vice president|chief|director|founder)\b/i;
const COMPANY_COLORS = ["#6757d9", "#176b5a", "#246d91", "#ef694f", "#c44581", "#4769c2", "#d36a2e"];

export function summarizeJobs(jobs: CrustdataJob[], jobKeywords: string[] = []): HiringSignals {
  return jobs.reduce<HiringSignals>(
    (summary, job) => {
      const title = job.job_details?.title ?? "";
      const normalizedTitle = title.toLowerCase();
      summary.total += 1;
      if (GTM_TITLE.test(title) || jobKeywords.some((keyword) => normalizedTitle.includes(keyword.toLowerCase()))) summary.gtm += 1;
      if (ENGINEERING_TITLE.test(title)) summary.engineering += 1;
      if (LEADERSHIP_TITLE.test(title)) summary.leadership += 1;
      return summary;
    },
    { total: 0, gtm: 0, engineering: 0, leadership: 0 },
  );
}

function titleCase(value: string) {
  return value
    .split("_")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "CO";
}

function colorFor(value: string) {
  const hash = [...value].reduce((total, character) => total + character.charCodeAt(0), 0);
  return COMPANY_COLORS[hash % COMPANY_COLORS.length];
}

function fundingIsRecent(date?: string) {
  if (!date) return false;
  const timestamp = Date.parse(date);
  return !Number.isNaN(timestamp) && Date.now() - timestamp <= 548 * 24 * 60 * 60 * 1000;
}

function industryMatches(company: CrustdataCompany, criteria: GTMSearchCriteria) {
  if (!criteria.industry) return true;
  const target = criteria.industry.toLowerCase();
  const values = [
    company.taxonomy?.professional_network_industry,
    ...(company.taxonomy?.categories ?? []),
    ...(company.basic_info?.industries ?? []),
  ];
  return values.some((value) => value?.toLowerCase().includes(target));
}

function buildSignals(company: CrustdataCompany, hiring: HiringSignals): Signal[] {
  const signals: Signal[] = [];
  const growth = company.headcount?.growth_percent?.["6m"];

  if (typeof growth === "number") {
    signals.push({ label: `Headcount ${growth >= 0 ? "+" : ""}${Math.round(growth)}% in 6 months` });
  }

  if (hiring.total > 0) {
    signals.push({
      label: `${hiring.total} job ${hiring.total === 1 ? "listing" : "listings"} indexed recently`,
      description: "Recent means indexed by Crustdata during the last 120 days, not necessarily posted by the employer then.",
    });
  }
  if (hiring.gtm > 0) signals.push({ label: `${hiring.gtm} GTM ${hiring.gtm === 1 ? "role" : "roles"} detected` });
  if (hiring.engineering > 0) signals.push({ label: `${hiring.engineering} engineering ${hiring.engineering === 1 ? "role" : "roles"} detected` });
  if (hiring.leadership > 0) signals.push({ label: `${hiring.leadership} leadership ${hiring.leadership === 1 ? "role" : "roles"} detected` });

  const funding = company.funding;
  if (fundingIsRecent(funding?.last_fundraise_date)) {
    const round = funding?.last_round_type ? titleCase(funding.last_round_type) : "funding round";
    signals.push({ label: `Raised ${round} recently` });
  } else if ((funding?.total_investment_usd ?? 0) > 0) {
    const millions = Math.round((funding?.total_investment_usd ?? 0) / 1_000_000);
    signals.push({ label: `$${millions}M disclosed funding` });
  }

  return signals.slice(0, 4);
}

function buildWhyNow(name: string, company: CrustdataCompany, hiring: HiringSignals, criteria: GTMSearchCriteria) {
  const observations: string[] = [];
  const growth = company.headcount?.growth_percent?.["6m"];

  if (hiring.total > 0) {
    observations.push(`Crustdata indexed ${hiring.total} ${hiring.total === 1 ? "listing" : "listings"} for ${name} in the last 120 days`);
  }
  if (hiring.gtm > 0) observations.push(`${hiring.gtm} matched GTM-oriented titles`);
  if (typeof growth === "number" && growth > 0) observations.push(`headcount grew ${Math.round(growth)}% over six months`);
  if (fundingIsRecent(company.funding?.last_fundraise_date)) observations.push("the company raised funding within the last 18 months");

  if (observations.length === 0) {
    return `${name} fits the structured ${criteria.industry ?? "company"} and employee-size criteria, though no recent hiring or funding signal was returned.`;
  }

  const [first, ...rest] = observations;
  return `${first}${rest.length ? `; ${rest.join("; ")}` : ""}.`;
}

export function normalizeCompany(
  company: CrustdataCompany,
  jobs: CrustdataJob[],
  criteria: GTMSearchCriteria,
): CompanyResult {
  const rawId = company.crustdata_company_id;
  const name = company.basic_info?.name?.trim() || "Company name unavailable";
  const domain = company.basic_info?.primary_domain?.trim() || "Domain unavailable";
  const hiring = summarizeJobs(jobs, criteria.jobKeywords);
  const industry =
    company.taxonomy?.professional_network_industry ??
    company.taxonomy?.categories?.[0] ??
    company.basic_info?.industries?.[0] ??
    "Industry unavailable";
  const employeeCount = Math.max(0, Math.round(company.headcount?.total ?? 0));
  const likelyBuyerTitle = criteria.buyerTitles?.[0] ?? "Head of GTM";
  const matchedIndustry = industryMatches(company, criteria);

  return {
    id: rawId ? String(rawId) : domain !== "Domain unavailable" ? domain : name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    rank: 0,
    name,
    domain,
    initials: initials(name),
    color: colorFor(String(rawId ?? domain)),
    industry,
    employeeCount,
    location: company.locations?.headquarters ?? company.locations?.country ?? "Location unavailable",
    fitScore: calculateFitScore({
      employeeCount,
      minEmployees: criteria.minEmployees,
      maxEmployees: criteria.maxEmployees,
      industryMatches: matchedIndustry,
      lastFundingDate: company.funding?.last_fundraise_date,
      headcountGrowth6m: company.headcount?.growth_percent?.["6m"],
      recentJobCount: hiring.total,
      gtmJobCount: hiring.gtm,
    }),
    signals: buildSignals(company, hiring),
    whyNow: buildWhyNow(name, company, hiring, criteria),
    likelyBuyerTitle,
    outreachAngle:
      hiring.gtm > 0
        ? `${name}'s detected GTM hiring suggests a team that may benefit from real-time company and people intelligence as it expands.`
        : `${name}'s company profile and recent signals create a timely reason to discuss a more systematic market-intelligence workflow.`,
  };
}
