import { z } from "zod";

const nullableText = z.string().trim().min(1).max(500).nullable();
const nullableCount = z.number().int().nonnegative().nullable();

export const AgentEvidenceSchema = z
  .object({
    sourceTool: z.string().trim().min(1).max(120),
    evidence: z.string().trim().min(1).max(500),
  })
  .strict();

export const AgentSignalSchema = z
  .object({
    label: z.string().trim().min(1).max(160),
    sourceTool: z.string().trim().min(1).max(120),
    evidence: z.string().trim().min(1).max(500),
  })
  .strict();

export const AgentBuyerSchema = z
  .object({
    name: z.string().trim().min(1).max(160),
    title: z.string().trim().min(1).max(160),
    sourceTool: z.string().trim().min(1).max(120),
    evidence: z.string().trim().min(1).max(500),
  })
  .strict();

export const AgentCompanySchema = z
  .object({
    companyName: z.string().trim().min(1).max(200),
    companyEvidence: AgentEvidenceSchema,
    domain: nullableText,
    industry: nullableText,
    employeeCount: nullableCount,
    location: nullableText,
    headcountGrowth6m: z.number().min(-100).max(10_000).nullable(),
    lastFundingDate: nullableText,
    recentJobCount: nullableCount,
    gtmJobCount: nullableCount,
    signals: z.array(AgentSignalSchema).max(6),
    whyNow: z.string().trim().min(1).max(900),
    likelyBuyer: AgentBuyerSchema.nullable(),
    likelyBuyerPersona: z.string().trim().min(1).max(200),
    outreachAngle: z.string().trim().min(1).max(700),
  })
  .strict();

export const AgentResearchSchema = z
  .object({
    interpretedQuery: z.string().trim().min(1).max(900),
    researchSummary: z.string().trim().min(1).max(1_500),
    interpretedCriteria: z
      .object({
        industry: nullableText,
        country: nullableText,
        minEmployees: nullableCount,
        maxEmployees: nullableCount,
        buyerTitles: z.array(z.string().trim().min(1).max(160)).max(8),
      })
      .strict(),
    priorities: z.array(z.string().trim().min(1).max(200)).min(1).max(6),
    researchSteps: z.array(z.string().trim().min(1).max(240)).min(1).max(8),
    companies: z.array(AgentCompanySchema).max(10),
  })
  .strict();

export type AgentResearchResult = z.infer<typeof AgentResearchSchema>;
export type AgentCompanyResult = z.infer<typeof AgentCompanySchema>;
