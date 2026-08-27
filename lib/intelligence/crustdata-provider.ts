import "server-only";

import { CrustdataClient } from "@/lib/intelligence/crustdata-client";
import type { CrustdataCompany, CrustdataJob } from "@/lib/intelligence/crustdata-types";
import { normalizeCompany } from "@/lib/intelligence/normalize";
import type { IntelligenceProvider } from "@/lib/intelligence/provider";
import type { GTMSearchCriteria, SearchRecord } from "@/lib/intelligence/types";

const CACHE_TTL_MS = 15 * 60 * 1000;
const RECENT_JOB_WINDOW_DAYS = 120;
const MAX_JOB_RESULTS = 50;

type CacheEntry = {
  expiresAt: number;
  value: Promise<SearchRecord>;
};

const searchCache = new Map<string, CacheEntry>();

function clampLimit(limit = 5) {
  return Math.min(10, Math.max(1, Math.floor(limit)));
}

function cacheKey(criteria: GTMSearchCriteria) {
  return JSON.stringify({
    industry: criteria.industry,
    country: criteria.country,
    minEmployees: criteria.minEmployees,
    maxEmployees: criteria.maxEmployees,
    jobKeywords: criteria.jobKeywords,
    buyerTitles: criteria.buyerTitles,
    limit: clampLimit(criteria.limit),
  });
}

function companyConditions(criteria: GTMSearchCriteria) {
  const conditions: Array<Record<string, unknown>> = [];

  if (criteria.country) {
    conditions.push({ field: "locations.country", type: "in", value: [criteria.country] });
  }
  if (criteria.minEmployees !== undefined) {
    conditions.push({ field: "headcount.total", type: "=>", value: criteria.minEmployees });
  }
  if (criteria.maxEmployees !== undefined) {
    conditions.push({ field: "headcount.total", type: "=<", value: criteria.maxEmployees });
  }
  if (criteria.industry) {
    conditions.push({ field: "taxonomy.categories", type: "in", value: [criteria.industry] });
  }

  if (conditions.length === 1) return conditions[0];
  return { op: "and", conditions };
}

function indexedAfterDate() {
  const date = new Date(Date.now() - RECENT_JOB_WINDOW_DAYS * 24 * 60 * 60 * 1000);
  return date.toISOString().slice(0, 10);
}

function formatGeneratedAt(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "UTC",
    timeZoneName: "short",
  }).format(date);
}

function groupJobsByCompany(jobs: CrustdataJob[]) {
  return jobs.reduce<Map<number, CrustdataJob[]>>((groups, job) => {
    const id = job.company?.basic_info?.crustdata_company_id;
    if (typeof id !== "number") return groups;
    const companyJobs = groups.get(id) ?? [];
    companyJobs.push(job);
    groups.set(id, companyJobs);
    return groups;
  }, new Map());
}

export class CrustdataIntelligenceProvider implements IntelligenceProvider {
  private readonly client: CrustdataClient;

  constructor(apiKey: string) {
    this.client = new CrustdataClient(apiKey);
  }

  async search(criteria: GTMSearchCriteria): Promise<SearchRecord> {
    const key = cacheKey(criteria);
    const cached = searchCache.get(key);

    if (cached && cached.expiresAt > Date.now()) return cached.value;

    const value = this.executeSearch({ ...criteria, limit: clampLimit(criteria.limit) });
    searchCache.set(key, { expiresAt: Date.now() + CACHE_TTL_MS, value });

    try {
      return await value;
    } catch (error) {
      searchCache.delete(key);
      throw error;
    }
  }

  private async executeSearch(criteria: GTMSearchCriteria): Promise<SearchRecord> {
    const companyResponse = await this.client.searchCompanies({
      filters: companyConditions(criteria),
      sorts: [{ field: "headcount.total", order: "desc" }],
      limit: criteria.limit,
      fields: [
        "crustdata_company_id",
        "basic_info.name",
        "basic_info.primary_domain",
        "basic_info.year_founded",
        "taxonomy.professional_network_industry",
        "taxonomy.categories",
        "headcount",
        "locations.country",
        "locations.headquarters",
        "funding.total_investment_usd",
        "funding.last_round_amount_usd",
        "funding.last_fundraise_date",
        "funding.last_round_type",
      ],
    });

    if (!Array.isArray(companyResponse.companies)) {
      throw new Error("Crustdata company search returned an unexpected response shape.");
    }

    const companies = companyResponse.companies;
    const companyIds = companies
      .map((company) => company.crustdata_company_id)
      .filter((id): id is number => typeof id === "number");

    let jobs: CrustdataJob[] = [];
    if (companyIds.length > 0) {
      try {
        const jobResponse = await this.client.searchJobs({
          filters: {
            op: "and",
            conditions: [
              { field: "company.basic_info.company_id", type: "in", value: companyIds },
              { field: "metadata.date_added", type: "=>", value: indexedAfterDate() },
            ],
          },
          sorts: [{ field: "metadata.date_added", order: "desc" }],
          limit: MAX_JOB_RESULTS,
          fields: [
            "crustdata_job_id",
            "job_details.title",
            "company.basic_info.crustdata_company_id",
            "company.basic_info.name",
            "company.basic_info.primary_domain",
            "metadata.date_added",
          ],
        });

        if (Array.isArray(jobResponse.job_listings)) jobs = jobResponse.job_listings;
        else console.error("[Crustdata] Job search returned an unexpected response shape; continuing without job enrichment.");
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown job-search failure";
        console.error(`[Crustdata] Job enrichment failed; continuing with company data. ${message}`);
      }
    }

    const jobsByCompany = groupJobsByCompany(jobs);
    const results = companies
      .map((company: CrustdataCompany) =>
        normalizeCompany(company, jobsByCompany.get(company.crustdata_company_id ?? -1) ?? [], criteria),
      )
      .sort((a, b) => b.fitScore - a.fitScore)
      .map((company, index) => ({ ...company, rank: index + 1 }));

    return {
      id: "ai-recruiting-gtm",
      query: criteria.query,
      createdAt: formatGeneratedAt(new Date()),
      results,
      criteria,
      source: "crustdata",
    };
  }
}
