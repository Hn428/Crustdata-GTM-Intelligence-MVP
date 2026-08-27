import type { GTMSearchCriteria, SearchRecord } from "@/lib/intelligence/types";

/**
 * Boundary for factual company intelligence. A future Crustdata provider can
 * implement this interface without changing page or component contracts.
 */
export interface IntelligenceProvider {
  search(criteria: GTMSearchCriteria): Promise<SearchRecord>;
}
