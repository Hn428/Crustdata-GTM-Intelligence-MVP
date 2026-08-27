import { ArrowUpRight, BriefcaseBusiness, Building2, MapPin, MessageSquareText, Sparkles } from "lucide-react";
import { CompanyLogo } from "@/components/company-logo";
import { ScoreRing } from "@/components/score-ring";
import type { CompanyResult } from "@/lib/intelligence/types";

export function PrivateCompanyCard({ company }: { company: CompanyResult }) {
  return (
    <article className="card overflow-hidden">
      <div className="grid gap-6 p-6 sm:p-7 lg:grid-cols-[minmax(0,1fr)_92px]">
        <div className="min-w-0">
          <div className="flex items-start gap-4">
            <CompanyLogo initials={company.initials} color={company.color} />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <h2 className="text-xl font-extrabold tracking-[-0.035em]">{company.name}</h2>
                {company.domain.includes(".") && !company.domain.includes(" ") ? (
                  <a href={`https://${company.domain}`} className="flex items-center gap-1 text-xs font-semibold text-[#71857d] hover:text-[var(--mint-dark)]">
                    {company.domain} <ArrowUpRight size={12} />
                  </a>
                ) : (
                  <span className="text-xs font-semibold text-[#71857d]">{company.domain}</span>
                )}
              </div>
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1.5 text-xs font-medium text-[#6b8078]">
                <span className="flex items-center gap-1.5"><Building2 size={13} />{company.industry}</span>
                <span>{company.employeeCount} employees</span>
                <span className="flex items-center gap-1.5"><MapPin size={13} />{company.location}</span>
              </div>
            </div>
          </div>

          <p className="mt-5 text-[10px] font-extrabold uppercase tracking-[0.12em] text-[#70847c]">Verified facts</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {company.signals.map((signal) => (
              <span key={signal.label} title={signal.evidence} className="signal-pill"><Sparkles size={11} />{signal.label}</span>
            ))}
            {company.signals.length === 0 && <span className="text-xs text-[#71857d]">No enriched fact passed evidence validation.</span>}
          </div>
          {company.signals.some((signal) => signal.evidence) && (
            <details className="mt-4 rounded-xl border border-[#e2e9e4] bg-[#fafcfb] px-4 py-3">
              <summary className="cursor-pointer text-xs font-bold text-[#557067]">View supporting Crustdata evidence</summary>
              <ul className="mt-3 space-y-3">
                {company.signals.filter((signal) => signal.evidence).map((signal) => (
                  <li key={signal.label} className="text-xs leading-5 text-[#5c7169]">
                    <span className="font-bold text-[#344c43]">{signal.label}:</span> {signal.evidence}
                  </li>
                ))}
              </ul>
            </details>
          )}
        </div>
        <div className="flex items-start justify-between border-t border-[#e5ebe7] pt-5 lg:justify-end lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#71867e] lg:hidden">Match score</p>
          <ScoreRing score={company.fitScore} />
        </div>
      </div>

      <div className="grid border-t border-[#e4eae6] bg-[#fafbf9] lg:grid-cols-[1fr_1fr]">
        <div className="p-6 sm:p-7 lg:border-r lg:border-[#e4eae6]">
          <p className="flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.12em] text-[#70847c]"><Sparkles size={13} className="text-[var(--mint-dark)]" /> Interpretation · Why now</p>
          <p className="mt-3 text-sm leading-6 text-[#3e574e]">{company.whyNow}</p>
        </div>
        <div className="border-t border-[#e4eae6] p-6 sm:p-7 lg:border-t-0">
          <div className="flex flex-wrap items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.12em] text-[#70847c]">
            <BriefcaseBusiness size={13} className="text-[#bd722a]" /> Likely buyer
            <span className="rounded-full bg-[#f4ecdf] px-2.5 py-1 text-[10px] tracking-normal text-[#84501e]">
              {company.likelyBuyerName ? `${company.likelyBuyerName} · ${company.likelyBuyerTitle}` : company.likelyBuyerTitle}
            </span>
          </div>
          <p className="mt-3 flex gap-2.5 text-sm leading-6 text-[#3e574e]"><MessageSquareText size={15} className="mt-1 shrink-0 text-[#82948d]" />{company.outreachAngle}</p>
        </div>
      </div>
    </article>
  );
}
