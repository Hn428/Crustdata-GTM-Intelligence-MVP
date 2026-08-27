import { calculateFitScore } from "@/lib/intelligence/scoring";
import type { CompanyResult, GTMSearchCriteria, ResearchTraceStep, SearchRecord, Signal } from "@/lib/intelligence/types";
import type { AgentCompanyResult, AgentResearchResult } from "@/lib/agent/schemas";

export type AgentMcpCall = {
  name: string;
  output?: string | null;
  error?: unknown;
};

const COMPANY_COLORS = ["#6757d9", "#176b5a", "#246d91", "#ef694f", "#c44581", "#4769c2", "#d36a2e"];

function normalizeText(value: string) {
  return value
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function collectScalarValues(value: unknown, values: string[]) {
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    values.push(String(value));
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((item) => collectScalarValues(item, values));
    return;
  }
  if (value && typeof value === "object") {
    Object.entries(value).forEach(([key, item]) => {
      values.push(key);
      collectScalarValues(item, values);
    });
  }
}

function searchableOutput(output: string) {
  const values = [output];
  try {
    collectScalarValues(JSON.parse(output) as unknown, values);
  } catch {
    // Plain-text MCP responses are searched directly.
  }
  return normalizeText(values.join(" "));
}

function buildToolCorpora(calls: AgentMcpCall[]) {
  return calls.reduce<Map<string, string>>((corpora, call) => {
    if (!call.output || call.error) return corpora;
    const previous = corpora.get(call.name) ?? "";
    corpora.set(call.name, `${previous} ${searchableOutput(call.output)}`.trim());
    return corpora;
  }, new Map());
}

function excerptIsSupported(corpora: Map<string, string>, sourceTool: string, excerpt: string) {
  const normalizedExcerpt = normalizeText(excerpt);
  const corpus = corpora.get(sourceTool);
  return Boolean(corpus && normalizedExcerpt.length >= 2 && corpus.includes(normalizedExcerpt));
}

function valueIsSupported(corpus: string, value: string | number | null) {
  if (value === null) return false;
  const normalizedValue = normalizeText(String(value));
  return normalizedValue.length > 0 && corpus.includes(normalizedValue);
}

function numberClaimsAreSupported(text: string, evidence: string) {
  const evidenceNumbers = new Set(evidence.match(/-?\d+(?:\.\d+)?/g) ?? []);
  return (text.match(/-?\d+(?:\.\d+)?/g) ?? []).every((number) => evidenceNumbers.has(number));
}

function initials(name: string) {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "CO"
  );
}

function colorFor(value: string) {
  const hash = [...value].reduce((total, character) => total + character.charCodeAt(0), 0);
  return COMPANY_COLORS[hash % COMPANY_COLORS.length];
}

function slugId(name: string, domain: string | null) {
  return (domain ?? name).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "company";
}

function industryMatches(industry: string | null, target: string | null) {
  if (!target) return true;
  if (!industry) return false;
  const normalizedIndustry = normalizeText(industry);
  const normalizedTarget = normalizeText(target);
  if (normalizedIndustry.includes(normalizedTarget) || normalizedTarget.includes(normalizedIndustry)) return true;
  const targetTerms = normalizedTarget.split(" ").filter((term) => term.length >= 3);
  return targetTerms.some((term) => normalizedIndustry.includes(term));
}

function safeInterpretation(text: string, companyName: string, signals: Signal[], fallback: string) {
  const evidence = signals.map((signal) => `${signal.label} ${signal.evidence ?? ""}`).join(" ");
  if (!numberClaimsAreSupported(text, evidence)) return fallback;
  if (!normalizeText(text).includes(normalizeText(companyName))) return `${companyName}: ${text}`;
  return text;
}

function verifyBuyer(company: AgentCompanyResult, corpora: Map<string, string>) {
  const buyer = company.likelyBuyer;
  if (!buyer || !excerptIsSupported(corpora, buyer.sourceTool, buyer.evidence)) return undefined;
  const corpus = corpora.get(buyer.sourceTool) ?? "";
  if (!valueIsSupported(corpus, buyer.name) || !valueIsSupported(corpus, buyer.title)) return undefined;
  return buyer;
}

function normalizeCompany(
  company: AgentCompanyResult,
  corpora: Map<string, string>,
  criteria: GTMSearchCriteria,
): CompanyResult | undefined {
  const preferredCorpus = corpora.get(company.companyEvidence.sourceTool) ?? "";
  const companyCorpus = valueIsSupported(preferredCorpus, company.companyName)
    ? preferredCorpus
    : [...corpora.values()].find((corpus) => valueIsSupported(corpus, company.companyName));

  // Company identity must exist in completed Crustdata output. The model's
  // supporting excerpt is advisory because JSON formatting often prevents an
  // otherwise factual excerpt from remaining contiguous after serialization.
  // Signals and named buyers retain their stricter exact-excerpt checks below.
  if (!companyCorpus) return undefined;

  const domain = valueIsSupported(companyCorpus, company.domain) ? company.domain : null;
  const industry = valueIsSupported(companyCorpus, company.industry) ? company.industry : null;
  const employeeCount = valueIsSupported(companyCorpus, company.employeeCount) ? company.employeeCount : null;
  const location = valueIsSupported(companyCorpus, company.location) ? company.location : null;
  const headcountGrowth6m = valueIsSupported(companyCorpus, company.headcountGrowth6m) ? company.headcountGrowth6m : null;
  const lastFundingDate = valueIsSupported(companyCorpus, company.lastFundingDate) ? company.lastFundingDate : null;
  const recentJobCount = valueIsSupported(companyCorpus, company.recentJobCount) ? company.recentJobCount : null;
  const gtmJobCount = valueIsSupported(companyCorpus, company.gtmJobCount) ? company.gtmJobCount : null;

  const signals = company.signals
    .filter((signal) => excerptIsSupported(corpora, signal.sourceTool, signal.evidence))
    .filter((signal) => numberClaimsAreSupported(signal.label, signal.evidence))
    .map<Signal>((signal) => ({ label: signal.label, evidence: signal.evidence }))
    .slice(0, 4);

  const buyer = verifyBuyer(company, corpora);
  const firstSignal = signals[0]?.label;
  const whyNowFallback = firstSignal
    ? `${company.companyName} has a verified signal—${firstSignal.toLowerCase()}—that makes the account relevant to this research goal.`
    : `${company.companyName} was returned by Crustdata for the requested market, but no additional factual signal passed evidence validation.`;
  const outreachFallback = firstSignal
    ? `Use the verified ${firstSignal.toLowerCase()} signal as a timely starting point for a relevant conversation.`
    : `Confirm current priorities with the ${company.likelyBuyerPersona} persona before proposing a specific workflow.`;

  return {
    id: slugId(company.companyName, domain),
    rank: 0,
    name: company.companyName,
    domain: domain ?? "Domain unavailable",
    initials: initials(company.companyName),
    color: colorFor(domain ?? company.companyName),
    industry: industry ?? "Industry unavailable",
    employeeCount: employeeCount ?? 0,
    location: location ?? "Location unavailable",
    fitScore: calculateFitScore({
      employeeCount: employeeCount ?? 0,
      minEmployees: criteria.minEmployees,
      maxEmployees: criteria.maxEmployees,
      industryMatches: industryMatches(industry, criteria.industry ?? null),
      lastFundingDate: lastFundingDate ?? undefined,
      headcountGrowth6m: headcountGrowth6m ?? undefined,
      recentJobCount: recentJobCount ?? 0,
      gtmJobCount: gtmJobCount ?? 0,
    }),
    signals,
    whyNow: safeInterpretation(company.whyNow, company.companyName, signals, whyNowFallback),
    likelyBuyerName: buyer?.name,
    likelyBuyerTitle: buyer?.title ?? company.likelyBuyerPersona,
    outreachAngle: safeInterpretation(company.outreachAngle, company.companyName, signals, outreachFallback),
  };
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

function traceFor(calls: AgentMcpCall[], resultCount: number): ResearchTraceStep[] {
  const completedCalls = calls.filter((call) => call.output && !call.error);
  const uniqueTools = [...new Set(completedCalls.map((call) => call.name))];
  const steps: ResearchTraceStep[] = [{ label: "Interpreted the natural-language GTM goal" }];

  uniqueTools.forEach((tool) => {
    steps.push({ label: "Queried Crustdata", detail: `Used the ${tool} tool for targeted factual research.` });
  });
  steps.push({ label: "Validated returned evidence", detail: `Checked facts against ${completedCalls.length} completed MCP tool call${completedCalls.length === 1 ? "" : "s"}.` });
  steps.push({ label: "Ranked the supported accounts", detail: `Applied deterministic scoring to ${resultCount} compan${resultCount === 1 ? "y" : "ies"}.` });
  steps.push({ label: "Generated evidence-bound interpretations" });
  return steps.slice(0, 8);
}

export function normalizeAgentResearch(
  research: AgentResearchResult,
  calls: AgentMcpCall[],
  originalCriteria: GTMSearchCriteria,
  maxCompanies: number,
): SearchRecord {
  const corpora = buildToolCorpora(calls);
  const interpreted = research.interpretedCriteria;
  const minEmployees = interpreted.minEmployees ?? undefined;
  const maxEmployees = interpreted.maxEmployees ?? undefined;
  const criteria: GTMSearchCriteria = {
    query: originalCriteria.query,
    industry: interpreted.industry ?? undefined,
    country: interpreted.country ?? undefined,
    minEmployees,
    maxEmployees: minEmployees !== undefined && maxEmployees !== undefined && maxEmployees < minEmployees ? minEmployees : maxEmployees,
    buyerTitles: interpreted.buyerTitles,
    limit: maxCompanies,
  };

  const results = research.companies
    .slice(0, maxCompanies)
    .map((company) => normalizeCompany(company, corpora, criteria))
    .filter((company): company is CompanyResult => Boolean(company))
    .sort((a, b) => b.fitScore - a.fitScore)
    .map((company, index) => ({ ...company, rank: index + 1 }));

  const failedCalls = calls.filter((call) => call.error).length;

  return {
    id: "agent-gtm-research",
    query: originalCriteria.query,
    createdAt: formatGeneratedAt(new Date()),
    results,
    criteria,
    source: "agent",
    notice: failedCalls > 0 ? `${failedCalls} Crustdata enrichment call${failedCalls === 1 ? "" : "s"} failed; supported partial results are shown.` : undefined,
    interpretedQuery: research.interpretedQuery,
    researchSummary: research.researchSummary,
    researchPriorities: research.priorities,
    researchTrace: traceFor(calls, results.length),
  };
}
