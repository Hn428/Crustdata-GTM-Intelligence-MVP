import type { PublicCompanyResult, PublicReport, SearchRecord } from "@/lib/intelligence/types";

export type PublicReportDetails = Omit<PublicReport, "searchId" | "companies">;

export function toPublicCompany(company: SearchRecord["results"][number]): PublicCompanyResult {
  return {
    id: company.id,
    rank: company.rank,
    name: company.name,
    domain: company.domain,
    initials: company.initials,
    color: company.color,
    industry: company.industry,
    companySize: `${company.employeeCount} employees`,
    location: company.location,
    signals: company.signals,
    notability: company.whyNow,
  };
}

/** Deterministic privacy boundary: private GTM fields are not copied. */
export function toPublicReport(search: SearchRecord, details: PublicReportDetails): PublicReport {
  return {
    ...details,
    searchId: search.id,
    companies: search.results.map(toPublicCompany),
  };
}
