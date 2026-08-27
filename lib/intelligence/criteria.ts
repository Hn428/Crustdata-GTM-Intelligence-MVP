import type { GTMSearchCriteria } from "@/lib/intelligence/types";

export const DEFAULT_SEARCH_ID = "ai-recruiting-gtm";

export const defaultRealSearchCriteria: GTMSearchCriteria = {
  query: "Find US AI and software companies with 20–500 employees and recent hiring activity.",
  industry: "Artificial Intelligence (AI)",
  country: "USA",
  minEmployees: 20,
  maxEmployees: 500,
  jobKeywords: ["sales", "revenue", "growth", "marketing", "business development"],
  buyerTitles: ["Head of GTM", "VP Sales", "VP Revenue", "Head of Sales", "Founder", "CEO"],
  limit: 5,
};

export function getSearchCriteria(id: string, displayedQuery?: string): GTMSearchCriteria {
  void id;
  const safeQuery = displayedQuery?.trim().slice(0, 500);

  return {
    ...defaultRealSearchCriteria,
    query: safeQuery || defaultRealSearchCriteria.query,
  };
}
