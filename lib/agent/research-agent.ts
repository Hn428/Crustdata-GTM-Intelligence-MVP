import "server-only";

import { zodTextFormat } from "openai/helpers/zod";
import { buildAgentInput, buildAgentInstructions } from "@/lib/agent/prompts";
import { createOpenAIClient } from "@/lib/agent/openai-client";
import { normalizeAgentResearch, type AgentMcpCall } from "@/lib/agent/normalize-agent-result";
import { AgentResearchSchema } from "@/lib/agent/schemas";
import type { IntelligenceProvider } from "@/lib/intelligence/provider";
import type { GTMSearchCriteria, SearchRecord } from "@/lib/intelligence/types";

const DEFAULT_MODEL = "gpt-5.4-mini";
const DEFAULT_MCP_URL = "https://mcp.crustdata.com/mcp";
const CACHE_TTL_MS = 15 * 60 * 1000;

type AgentFailureCode = "auth" | "rate_limit" | "timeout" | "mcp" | "malformed" | "no_results" | "openai";

type CacheEntry = {
  expiresAt: number;
  value: Promise<SearchRecord>;
};

const researchCache = new Map<string, CacheEntry>();

const ALLOWED_CRUSTDATA_TOOLS = [
  "crustdata_company_search_db_v2",
  "crustdata_company_enrich_v2",
  "crustdata_job_search",
  "crustdata_people_search_db_v2",
  "crustdata_social_posts_by_keyword_v2",
  "crustdata_web_search_v2",
];

export class AgentResearchError extends Error {
  constructor(
    message: string,
    readonly code: AgentFailureCode,
  ) {
    super(message);
    this.name = "AgentResearchError";
  }
}

function clamp(value: number | undefined, fallback: number, maximum: number) {
  if (!Number.isFinite(value)) return fallback;
  return Math.min(maximum, Math.max(1, Math.floor(value ?? fallback)));
}

export function agentLimits() {
  return {
    maxCompanies: clamp(Number(process.env.AGENT_MAX_COMPANIES), 5, 10),
    maxToolCalls: clamp(Number(process.env.AGENT_MAX_MCP_CALLS), 6, 10),
  };
}

function modelName() {
  return process.env.OPENAI_MODEL?.trim() || DEFAULT_MODEL;
}

function mcpServerUrl() {
  const configured = process.env.CRUSTDATA_MCP_URL?.trim() || DEFAULT_MCP_URL;
  let url: URL;

  try {
    url = new URL(configured);
  } catch {
    throw new AgentResearchError("CRUSTDATA_MCP_URL is invalid.", "mcp");
  }

  const allowedHosts = new Set(["mcp.crustdata.com", "install.crustdata.com"]);
  if (url.protocol !== "https:" || !allowedHosts.has(url.hostname)) {
    throw new AgentResearchError("CRUSTDATA_MCP_URL must use an approved Crustdata HTTPS host.", "mcp");
  }
  return url.toString();
}

function cacheKey(criteria: GTMSearchCriteria, maxCompanies: number, maxToolCalls: number) {
  return JSON.stringify({
    query: criteria.query.trim().toLowerCase(),
    model: modelName(),
    maxCompanies,
    maxToolCalls,
    mcpUrl: mcpServerUrl(),
  });
}

function classifyFailure(error: unknown) {
  if (error instanceof AgentResearchError) return error;

  const status = typeof error === "object" && error && "status" in error ? Number(error.status) : undefined;
  const apiCode = typeof error === "object" && error && "code" in error ? String(error.code) : undefined;
  const name = error instanceof Error ? error.name : "";
  console.error(`[Agent research] request failed. name=${name || "unknown"} status=${status ?? "network"} code=${apiCode ?? "unknown"}`);
  if (status === 401) return new AgentResearchError("OpenAI authentication failed.", "auth");
  if (status === 429) return new AgentResearchError("OpenAI rate-limited the agent request.", "rate_limit");
  if (name.includes("Timeout") || name.includes("Abort")) return new AgentResearchError("OpenAI agent research timed out.", "timeout");
  return new AgentResearchError("OpenAI agent research failed.", "openai");
}

function developmentLog(message: string) {
  if (process.env.NODE_ENV === "development") console.info(`[Agent research] ${message}`);
}

export class AgentIntelligenceProvider implements IntelligenceProvider {
  constructor(
    private readonly openaiApiKey: string,
    private readonly crustdataApiKey: string,
  ) {}

  async search(criteria: GTMSearchCriteria): Promise<SearchRecord> {
    const { maxCompanies, maxToolCalls } = agentLimits();
    const key = cacheKey(criteria, maxCompanies, maxToolCalls);
    const cached = researchCache.get(key);
    if (cached && cached.expiresAt > Date.now()) return cached.value;

    const value = this.executeSearch(criteria, maxCompanies, maxToolCalls);
    researchCache.set(key, { expiresAt: Date.now() + CACHE_TTL_MS, value });

    try {
      return await value;
    } catch (error) {
      researchCache.delete(key);
      throw classifyFailure(error);
    }
  }

  private async executeSearch(criteria: GTMSearchCriteria, maxCompanies: number, maxToolCalls: number) {
    if (!this.crustdataApiKey.trim()) throw new AgentResearchError("CRUSTDATA_API_KEY is not configured.", "mcp");

    const startedAt = performance.now();
    developmentLog("started");

    const client = createOpenAIClient(this.openaiApiKey);
    const response = await client.responses.parse({
      model: modelName(),
      instructions: buildAgentInstructions(maxCompanies, maxToolCalls),
      input: buildAgentInput(criteria.query, maxCompanies),
      tools: [
        {
          type: "mcp",
          server_label: "crustdata",
          server_description: "Crustdata's read-only B2B company, job, person, social, and web intelligence tools.",
          server_url: mcpServerUrl(),
          headers: { Authorization: `Bearer ${this.crustdataApiKey}` },
          require_approval: "never",
          allowed_tools: ALLOWED_CRUSTDATA_TOOLS,
        },
      ],
      tool_choice: "auto",
      parallel_tool_calls: false,
      max_tool_calls: maxToolCalls,
      max_output_tokens: 8_000,
      store: false,
      text: {
        format: zodTextFormat(AgentResearchSchema, "gtm_research_result"),
      },
    });

    const calls: AgentMcpCall[] = response.output.flatMap((item) =>
      item.type === "mcp_call"
        ? [{ name: item.name, output: item.output, error: item.error }]
        : [],
    );
    const completedCalls = calls.filter((call) => call.output && !call.error);
    developmentLog(`MCP research and synthesis finished: ${Math.round(performance.now() - startedAt)} ms (${completedCalls.length} completed calls)`);

    if (completedCalls.length === 0) {
      throw new AgentResearchError("The model did not complete a useful Crustdata tool call.", "mcp");
    }
    if (!response.output_parsed) {
      throw new AgentResearchError("The model returned malformed structured output.", "malformed");
    }

    const validationStartedAt = performance.now();
    const search = normalizeAgentResearch(response.output_parsed, calls, criteria, maxCompanies);
    developmentLog(`evidence validation and scoring finished: ${Math.round(performance.now() - validationStartedAt)} ms`);

    if (search.results.length === 0) {
      throw new AgentResearchError("No company passed Crustdata evidence validation.", "no_results");
    }

    developmentLog(`total research time: ${Math.round(performance.now() - startedAt)} ms`);
    return search;
  }
}
