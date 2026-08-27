export type ResearchPlan = {
  objective: string;
  companyFilters: string[];
  signalCategories: string[];
};

/**
 * Future boundary for query understanding and research planning.
 * No OpenAI implementation is included in Phase 1.
 */
export interface ResearchOrchestrator {
  createPlan(query: string): Promise<ResearchPlan>;
}
