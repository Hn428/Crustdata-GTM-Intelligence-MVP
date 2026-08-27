import Link from "next/link";
import { AlertTriangle, ArrowLeft, BrainCircuit, CalendarClock, Database, Globe2, SearchCheck, ShieldCheck } from "lucide-react";
import { AppHeader } from "@/components/app-header";
import { PrivateCompanyCard } from "@/components/private-company-card";
import { getSearchCriteria } from "@/lib/intelligence/criteria";
import { runIntelligenceSearch } from "@/lib/intelligence/selected-provider";

type SearchPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ q?: string | string[] }>;
};

export default async function SearchResultsPage({ params, searchParams }: SearchPageProps) {
  const [{ id }, queryParams] = await Promise.all([params, searchParams]);
  const requestedQuery = typeof queryParams.q === "string" ? queryParams.q.slice(0, 500) : undefined;
  const search = await runIntelligenceSearch(getSearchCriteria(id, requestedQuery));
  const sourceLabel = search.source === "agent" ? "OpenAI + Crustdata MCP" : search.source === "crustdata" ? "Direct Crustdata" : "Mock data";
  const sourceClass = search.source === "mock" ? "bg-[#f5eddf] text-[#8a5b24]" : "bg-[#e6f8ed] text-[#176b48]";

  return (
    <main className="min-h-screen">
      <AppHeader action="view-insight" />

      <section className="border-b border-[#dce5df] bg-white">
        <div className="shell py-9 sm:py-12">
          <Link href="/" className="mb-6 inline-flex items-center gap-2 text-sm font-bold text-[#62776f] no-underline hover:text-[var(--ink)]">
            <ArrowLeft size={15} /> Back to search
          </Link>
          <div className="grid gap-7 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <span className="eyebrow">Research complete</span>
                <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.1em] ${sourceClass}`}>
                  {search.source === "agent" ? <BrainCircuit size={12} /> : <Database size={12} />} {sourceLabel}
                </span>
              </div>
              <h1 className="mt-4 max-w-[850px] text-[30px] font-extrabold leading-[1.18] tracking-[-0.045em] sm:text-[42px]">
                {requestedQuery || search.query}
              </h1>
              <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm font-semibold text-[#687d75]">
                <span className="flex items-center gap-2"><SearchCheck size={16} className="text-[var(--mint-dark)]" /> {search.results.length} companies found</span>
                <span className="flex items-center gap-2"><CalendarClock size={16} /> Generated {search.createdAt}</span>
              </div>
            </div>
            <Link href={`/search/${search.id}/publish?q=${encodeURIComponent(requestedQuery || search.query)}`} className="button-primary whitespace-nowrap">
              <Globe2 size={17} /> Create public report
            </Link>
          </div>
        </div>
      </section>

      {search.notice && (
        <div className="shell pt-6">
          <div role="status" className="flex items-start gap-3 rounded-2xl border border-[#ead8b9] bg-[#fff8eb] px-4 py-3.5 text-sm leading-5 text-[#765b31]">
            <AlertTriangle size={17} className="mt-0.5 shrink-0" />
            <p>{search.notice}</p>
          </div>
        </div>
      )}

      {search.researchSummary && (
        <section className="shell pt-6" aria-labelledby="research-interpretation-heading">
          <div className="card p-6 sm:p-7">
            <div className="flex items-start gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#e8f7ed] text-[var(--mint-dark)]"><BrainCircuit size={19} /></span>
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-[#70847c]">Agent interpretation</p>
                <h2 id="research-interpretation-heading" className="mt-1 text-lg font-extrabold tracking-[-0.025em]">{search.interpretedQuery}</h2>
                <p className="mt-3 max-w-4xl text-sm leading-6 text-[#536960]">{search.researchSummary}</p>
                {search.researchPriorities && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {search.researchPriorities.map((priority) => <span key={priority} className="signal-pill">{priority}</span>)}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      <div className="shell grid gap-8 py-8 sm:py-10 lg:grid-cols-[minmax(0,1fr)_260px] lg:items-start">
        <section className="space-y-5" aria-label="Ranked company results">
          {search.results.length > 0 ? (
            search.results.map((company) => <PrivateCompanyCard key={company.id} company={company} />)
          ) : (
            <div className="card p-8 text-center sm:p-12">
              <SearchCheck size={30} className="mx-auto text-[#82958d]" />
              <h2 className="mt-4 text-xl font-extrabold tracking-[-0.03em]">No supported companies found</h2>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#687c74]">Try broadening the natural-language goal or switch to direct/mock mode for a reliable demo fallback.</p>
            </div>
          )}
        </section>

        <aside className="order-first lg:order-last lg:sticky lg:top-6">
          <div className="card p-6">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#e8f7ed] text-[var(--mint-dark)]"><ShieldCheck size={19} /></span>
            <h2 className="mt-5 text-[17px] font-extrabold tracking-[-0.025em]">Private workspace</h2>
            <p className="mt-2 text-sm leading-6 text-[#657a72]">Fit scores, buyer hypotheses, and outreach angles stay private to your team.</p>
            <div className="mt-5 rounded-xl border border-[#dfe7e2] bg-white p-3 text-xs leading-5 text-[#60766d]">
              <strong className="block text-[var(--ink)]">{search.source === "agent" ? "Interpreted criteria" : "Structured filters"}</strong>
              {search.criteria.industry ?? "Any industry"} · {search.criteria.country ?? "Any country"}<br />
              {search.criteria.minEmployees ?? 0}–{search.criteria.maxEmployees ?? "any"} employees
            </div>
            {search.researchTrace && search.researchTrace.length > 0 && (
              <details className="mt-5 border-t border-[#e2e9e4] pt-5">
                <summary className="cursor-pointer text-xs font-extrabold uppercase tracking-[0.1em] text-[#60766d]">How this research was generated</summary>
                <ol className="mt-4 space-y-3 text-xs leading-5 text-[#536960]">
                  {search.researchTrace.map((step, index) => (
                    <li key={`${step.label}-${index}`} className="flex gap-2.5">
                      <span className="font-extrabold text-[var(--mint-dark)]">{String(index + 1).padStart(2, "0")}</span>
                      <span><strong className="block text-[var(--ink)]">{step.label}</strong>{step.detail}</span>
                    </li>
                  ))}
                </ol>
              </details>
            )}
            <div className="my-5 border-t border-[#e2e9e4]" />
            <p className="text-xs font-bold uppercase tracking-[0.11em] text-[#758980]">How ranking works</p>
            <ul className="mt-4 space-y-3 text-sm leading-5 text-[#536960]">
              <li className="flex gap-2"><span className="font-bold text-[var(--mint-dark)]">01</span> Industry and size fit</li>
              <li className="flex gap-2"><span className="font-bold text-[var(--mint-dark)]">02</span> Headcount growth</li>
              <li className="flex gap-2"><span className="font-bold text-[var(--mint-dark)]">03</span> Funding recency</li>
              <li className="flex gap-2"><span className="font-bold text-[var(--mint-dark)]">04</span> Job and GTM activity</li>
            </ul>
          </div>
        </aside>
      </div>
    </main>
  );
}
