import "server-only";

import { z } from "zod";
import type { PublicReport } from "@/lib/intelligence/types";

const REPORT_TTL_MS = 24 * 60 * 60 * 1000;
const MAX_REPORTS = 50;

const PublicSignalSchema = z
  .object({
    label: z.string().trim().min(1).max(200),
    description: z.string().trim().min(1).max(1_000).optional(),
    evidence: z.string().trim().min(1).max(1_000).optional(),
  })
  .strict();

const PublicCompanySchema = z
  .object({
    id: z.string().trim().min(1).max(200),
    rank: z.number().int().min(1).max(10),
    name: z.string().trim().min(1).max(200),
    domain: z.string().trim().min(1).max(300),
    initials: z.string().trim().min(1).max(8),
    color: z.string().trim().min(1).max(32),
    industry: z.string().trim().min(1).max(300),
    companySize: z.string().trim().min(1).max(100),
    location: z.string().trim().min(1).max(300),
    signals: z.array(PublicSignalSchema).max(6),
    notability: z.string().trim().min(1).max(1_500),
  })
  .strict();

export const PublicReportSchema = z
  .object({
    id: z.string().trim().min(1).max(200),
    searchId: z.string().trim().min(1).max(200),
    title: z.string().trim().min(1).max(240),
    slug: z.string().trim().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(90),
    intro: z.string().trim().min(1).max(2_000),
    summary: z.string().trim().min(1).max(1_000),
    createdAt: z.string().date(),
    updatedAt: z.string().date(),
    methodology: z.string().trim().min(1).max(3_000),
    companies: z.array(PublicCompanySchema).min(1).max(10),
  })
  .strict();

type StoredReport = {
  expiresAt: number;
  report: PublicReport;
};

const globalReportStore = globalThis as typeof globalThis & {
  __signalistPublicReports?: Map<string, StoredReport>;
};

const reports = (globalReportStore.__signalistPublicReports ??= new Map<string, StoredReport>());

function removeExpiredReports() {
  const now = Date.now();
  reports.forEach((entry, slug) => {
    if (entry.expiresAt <= now) reports.delete(slug);
  });
}

export function savePublicReport(input: unknown) {
  const report = PublicReportSchema.parse(input) as PublicReport;
  removeExpiredReports();

  if (!reports.has(report.slug) && reports.size >= MAX_REPORTS) {
    const oldestSlug = reports.keys().next().value;
    if (oldestSlug) reports.delete(oldestSlug);
  }

  reports.set(report.slug, { expiresAt: Date.now() + REPORT_TTL_MS, report });
  return report;
}

export function getStoredPublicReport(slug: string) {
  removeExpiredReports();
  return reports.get(slug)?.report;
}
