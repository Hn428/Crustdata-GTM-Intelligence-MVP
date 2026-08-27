import "server-only";

import { AgentIntelligenceProvider, AgentResearchError } from "@/lib/agent/research-agent";
import { CrustdataApiError } from "@/lib/intelligence/crustdata-client";
import { CrustdataIntelligenceProvider } from "@/lib/intelligence/crustdata-provider";
import { MockIntelligenceProvider } from "@/lib/intelligence/mock-provider";
import type { GTMSearchCriteria, SearchRecord } from "@/lib/intelligence/types";

const mockProvider = new MockIntelligenceProvider();
let crustdataProvider: CrustdataIntelligenceProvider | undefined;
let agentProvider: AgentIntelligenceProvider | undefined;
const SEARCH_SNAPSHOT_TTL_MS = 15 * 60 * 1000;

type SearchSnapshotEntry = {
  expiresAt: number;
  value: Promise<SearchRecord>;
};

const searchSnapshots = new Map<string, SearchSnapshotEntry>();

type IntelligenceMode = "mock" | "direct" | "agent";

function requestedMode(): IntelligenceMode {
  const configured = process.env.INTELLIGENCE_MODE?.trim().toLowerCase();
  if (configured === "agent" || configured === "direct" || configured === "mock") return configured;

  // Preserve Phase 2 configuration while users migrate to INTELLIGENCE_MODE.
  return process.env.INTELLIGENCE_PROVIDER?.trim().toLowerCase() === "crustdata" ? "direct" : "mock";
}

async function mockFallback(criteria: GTMSearchCriteria, notice?: string): Promise<SearchRecord> {
  const result = await mockProvider.search(criteria);
  return notice ? { ...result, notice } : result;
}

async function runDirectSearch(criteria: GTMSearchCriteria, priorNotice?: string): Promise<SearchRecord> {
  const apiKey = process.env.CRUSTDATA_API_KEY?.trim();
  if (!apiKey) {
    const notice = "CRUSTDATA_API_KEY is missing. Showing mock results instead.";
    return mockFallback(criteria, priorNotice ? `${priorNotice} ${notice}` : notice);
  }

  try {
    crustdataProvider ??= new CrustdataIntelligenceProvider(apiKey);
    const search = await crustdataProvider.search(criteria);
    return priorNotice ? { ...search, notice: priorNotice } : search;
  } catch (error) {
    const status = error instanceof CrustdataApiError ? error.status : undefined;
    const message = error instanceof Error ? error.message : "Unknown provider error";
    console.warn(`[Intelligence provider] Crustdata search failed; using mock fallback. status=${status ?? "network"} message=${message}`);

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

    return mockFallback(criteria, priorNotice ? `${priorNotice} ${notice}` : notice);
  }
}

function agentFailureNotice(error: unknown) {
  const code = error instanceof AgentResearchError ? error.code : "openai";
  if (code === "auth") return "OpenAI authentication failed. Falling back to direct Crustdata mode.";
  if (code === "rate_limit") return "OpenAI rate-limited the agent search. Falling back to direct Crustdata mode.";
  if (code === "timeout") return "Agent research timed out. Falling back to direct Crustdata mode.";
  if (code === "malformed") return "The agent returned invalid structured output. Falling back to direct Crustdata mode.";
  if (code === "no_results") return "No agent result passed factual evidence validation. Falling back to direct Crustdata mode.";
  if (code === "mcp") return "Crustdata MCP research was unavailable or incomplete. Falling back to direct Crustdata mode.";
  return "OpenAI agent research is currently unavailable. Falling back to direct Crustdata mode.";
}

async function runAgentSearch(criteria: GTMSearchCriteria) {
  const openaiApiKey = process.env.OPENAI_API_KEY?.trim();
  const crustdataApiKey = process.env.CRUSTDATA_API_KEY?.trim();

  if (!openaiApiKey) {
    return runDirectSearch(criteria, "Agent mode is selected, but OPENAI_API_KEY is missing. Falling back to direct Crustdata mode.");
  }
  if (!crustdataApiKey) {
    return mockFallback(criteria, "Agent mode is selected, but CRUSTDATA_API_KEY is missing. Showing mock results instead.");
  }

  try {
    agentProvider ??= new AgentIntelligenceProvider(openaiApiKey, crustdataApiKey);
    return await agentProvider.search(criteria);
  } catch (error) {
    const code = error instanceof AgentResearchError ? error.code : "openai";
    console.warn(`[Intelligence provider] Agent search failed; using direct fallback. code=${code}`);
    return runDirectSearch(criteria, agentFailureNotice(error));
  }
}

function snapshotKey(mode: IntelligenceMode, criteria: GTMSearchCriteria) {
  return JSON.stringify({
    mode,
    query: criteria.query.trim().toLowerCase(),
    industry: criteria.industry,
    country: criteria.country,
    minEmployees: criteria.minEmployees,
    maxEmployees: criteria.maxEmployees,
    jobKeywords: criteria.jobKeywords,
    buyerTitles: criteria.buyerTitles,
    limit: criteria.limit,
  });
}

export async function runIntelligenceSearch(criteria: GTMSearchCriteria): Promise<SearchRecord> {
  const mode = requestedMode();
  const key = snapshotKey(mode, criteria);
  const cached = searchSnapshots.get(key);
  if (cached && cached.expiresAt > Date.now()) return cached.value;

  const value = mode === "mock" ? mockFallback(criteria) : mode === "direct" ? runDirectSearch(criteria) : runAgentSearch(criteria);
  searchSnapshots.set(key, { expiresAt: Date.now() + SEARCH_SNAPSHOT_TTL_MS, value });

  try {
    return await value;
  } catch (error) {
    searchSnapshots.delete(key);
    throw error;
  }
}
