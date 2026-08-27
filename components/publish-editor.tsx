"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, CalendarDays, Check, Eye, Globe2, LoaderCircle, LockKeyhole, ShieldCheck, Sparkles } from "lucide-react";
import { CompanyLogo } from "@/components/company-logo";
import type { IntelligenceSource, PublicReport } from "@/lib/intelligence/types";

type PublishEditorProps = {
  report: PublicReport;
  source: IntelligenceSource;
  notice?: string;
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 90);
}

export function PublishEditor({ report, source, notice }: PublishEditorProps) {
  const router = useRouter();
  const [title, setTitle] = useState(report.title);
  const [slug, setSlug] = useState(report.slug);
  const [introduction, setIntroduction] = useState(report.intro);
  const [isPublishing, setIsPublishing] = useState(false);

  function publish() {
    setIsPublishing(true);
    window.setTimeout(() => router.push(`/insights/${report.slug}`), 450);
  }

  return (
    <div className="min-h-screen bg-[#edf1ed]">
      <header className="border-b border-[#d8e1db] bg-white">
        <div className="shell flex min-h-[72px] flex-wrap items-center justify-between gap-3 py-3">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-[#70847c]">Report builder</p>
            <p className="mt-1 text-sm font-bold text-[var(--ink)]">Public report preview · {source === "crustdata" ? "live Crustdata source" : "mock source"}</p>
          </div>
          <div className="flex items-center gap-2.5">
            <button onClick={() => router.back()} className="button-secondary min-h-10 px-3.5 text-[13px]"><ArrowLeft size={14} /> Cancel</button>
            <button onClick={publish} disabled={isPublishing} className="button-primary min-h-10 px-4 text-[13px] disabled:opacity-70">
              {isPublishing ? <LoaderCircle size={15} className="animate-spin" /> : <Globe2 size={15} />}
              {isPublishing ? "Publishing…" : "Publish report"}
            </button>
          </div>
        </div>
      </header>

      <div className="shell grid gap-6 py-6 lg:grid-cols-[350px_minmax(0,1fr)] lg:items-start">
        <aside className="card p-6 lg:sticky lg:top-6">
          <div className="flex items-center gap-2 text-sm font-extrabold"><Sparkles size={16} className="text-[var(--mint-dark)]" /> Report details</div>
          <p className="mt-2 text-xs leading-5 text-[#71847d]">Edit the public framing. The private research stays unchanged.</p>
          {notice && <p className="mt-4 rounded-xl border border-[#ead8b9] bg-[#fff8eb] p-3 text-xs leading-5 text-[#765b31]">{notice}</p>}

          <div className="mt-6 space-y-5">
            <div>
              <label htmlFor="report-title" className="field-label">Report title</label>
              <textarea
                id="report-title"
                value={title}
                onChange={(event) => {
                  setTitle(event.target.value);
                  setSlug(slugify(event.target.value));
                }}
                rows={3}
                className="field resize-none px-3.5 py-3 text-sm leading-5"
              />
            </div>
            <div>
              <label htmlFor="report-slug" className="field-label">URL slug</label>
              <div className="field flex items-center overflow-hidden px-3.5 focus-within:border-[var(--mint-dark)] focus-within:ring-4 focus-within:ring-[#27c77a]/10">
                <span className="text-xs text-[#8a9a94]">/insights/</span>
                <input id="report-slug" value={slug} onChange={(event) => setSlug(slugify(event.target.value))} className="min-w-0 flex-1 bg-transparent py-3 text-xs outline-none" />
              </div>
            </div>
            <div>
              <label htmlFor="report-intro" className="field-label">Short introduction</label>
              <textarea id="report-intro" value={introduction} onChange={(event) => setIntroduction(event.target.value)} rows={5} className="field resize-none px-3.5 py-3 text-sm leading-5" />
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-[#d7e7dc] bg-[#eff9f2] p-4">
            <p className="flex items-center gap-2 text-xs font-extrabold text-[#236344]"><ShieldCheck size={15} /> Privacy check passed</p>
            <ul className="mt-3 space-y-2 text-xs leading-4 text-[#587168]">
              <li className="flex gap-2"><Check size={13} className="shrink-0 text-[#1c8a58]" /> Fit scores removed</li>
              <li className="flex gap-2"><Check size={13} className="shrink-0 text-[#1c8a58]" /> Buyer fields removed</li>
              <li className="flex gap-2"><Check size={13} className="shrink-0 text-[#1c8a58]" /> Outreach angles removed</li>
            </ul>
          </div>
        </aside>

        <section aria-label="Public report preview">
          <div className="mb-3 flex items-center justify-between px-1 text-xs font-bold uppercase tracking-[0.11em] text-[#70847c]">
            <span className="flex items-center gap-2"><Eye size={14} /> Live preview</span>
            <span className="flex items-center gap-2 normal-case tracking-normal"><span className="h-2 w-2 rounded-full bg-[var(--mint)]" /> Public-safe</span>
          </div>
          <div className="overflow-hidden rounded-[24px] border border-[#dbe4de] bg-white shadow-[0_18px_50px_rgba(24,55,44,0.08)]">
            <div className="bg-[var(--ink)] px-7 py-12 text-white sm:px-12 sm:py-16">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3.5 py-2 text-[10px] font-extrabold uppercase tracking-[0.13em] text-[#bce8ce]"><Globe2 size={13} /> Market intelligence</span>
              <h1 className="mt-6 max-w-3xl text-[34px] font-extrabold leading-[1.08] tracking-[-0.05em] sm:text-[48px]">{title || "Untitled market report"}</h1>
              <p className="mt-6 max-w-2xl text-[15px] leading-7 text-[#c5d5cf]">{introduction || "Add a short introduction for this report."}</p>
              <div className="mt-7 flex flex-wrap gap-4 text-xs font-semibold text-[#a9bcb5]"><span className="flex items-center gap-1.5"><CalendarDays size={14} /> Updated August 27, 2026</span><span>{report.companies.length} companies analyzed</span></div>
            </div>

            <div className="px-5 py-6 sm:px-10 sm:py-10">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-xl font-extrabold tracking-[-0.03em]">Companies to watch</h2>
                <span className="hidden items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.1em] text-[#80918b] sm:flex"><LockKeyhole size={12} /> Sanitized view</span>
              </div>
              <div className="divide-y divide-[#e5ebe7] rounded-2xl border border-[#e1e8e3]">
                {report.companies.slice(0, 5).map((company) => (
                  <article key={company.name} className="p-5 sm:p-6">
                    <div className="flex gap-3.5">
                      <span className="w-4 pt-1 text-xs font-extrabold text-[#98a59f]">{company.rank}</span>
                      <CompanyLogo initials={company.initials} color={company.color} size="sm" />
                      <div className="min-w-0">
                        <h3 className="font-extrabold tracking-[-0.02em]">{company.name}</h3>
                        <p className="mt-1 text-xs text-[#74877f]">{company.industry} · {company.companySize}</p>
                      </div>
                    </div>
                    <div className="ml-0 mt-4 flex flex-wrap gap-1.5 sm:ml-[70px]">
                      {company.signals.slice(0, 2).map((signal) => <span key={signal.label} className="signal-pill">{signal.label}</span>)}
                    </div>
                    <p className="ml-0 mt-3 text-[13px] leading-5 text-[#536960] sm:ml-[70px]">{company.notability}</p>
                  </article>
                ))}
              </div>
              <p className="mt-5 text-center text-xs font-semibold text-[#7a8d85]">+ {report.companies.length - 5} more companies in the published report</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
