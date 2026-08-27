import "server-only";

import { CrustdataApiError } from "@/lib/intelligence/crustdata-client";
import { CrustdataIntelligenceProvider } from "@/lib/intelligence/crustdata-provider";
import { MockIntelligenceProvider } from "@/lib/intelligence/mock-provider";
import type { GTMSearchCriteria, SearchRecord } from "@/lib/intelligence/types";

const mockProvider = new MockIntelligenceProvider();
let crustdataProvider: CrustdataIntelligenceProvider | undefined;

function requestedProvider() {
  return process.env.INTELLIGENCE_PROVIDER?.toLowerCase() === "crustdata" ? "crustdata" : "mock";
}

async function mockFallback(criteria: GTMSearchCriteria, notice?: string): Promise<SearchRecord> {
  const result = await mockProvider.search(criteria);
  return notice ? { ...result, notice } : result;
}

export async function runIntelligenceSearch(criteria: GTMSearchCriteria): Promise<SearchRecord> {
  if (requestedProvider() === "mock") return mockFallback(criteria);

  const apiKey = process.env.CRUSTDATA_API_KEY?.trim();
  if (!apiKey) {
    return mockFallback(criteria, "Crustdata mode is selected, but CRUSTDATA_API_KEY is missing. Showing mock results instead.");
  }

  try {
    crustdataProvider ??= new CrustdataIntelligenceProvider(apiKey);
    return await crustdataProvider.search(criteria);
  } catch (error) {
    const status = error instanceof CrustdataApiError ? error.status : undefined;
    const message = error instanceof Error ? error.message : "Unknown provider error";
    console.error(`[Intelligence provider] Crustdata search failed; using mock fallback. status=${status ?? "network"} message=${message}`);

    const notice =
      status === 401
        ? "Crustdata authentication failed. Check CRUSTDATA_API_KEY. Showing mock results instead."
        : status === 403
          ? "This Crustdata key cannot access one of the required endpoints or fields. Showing mock results instead."
          : status === 429
            ? "Crustdata rate-limited the search. Showing mock results instead."
            : status === 400
              ? "Crustdata rejected the predefined structured search. Showing mock results instead."
              : "Crustdata is currently unavailable. Showing mock results instead.";

    return mockFallback(criteria, notice);
  }
}
