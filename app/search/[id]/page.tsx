import Link from "next/link";
import { AlertTriangle, ArrowLeft, CalendarClock, Database, Globe2, SearchCheck, ShieldCheck } from "lucide-react";
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
                <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.1em] ${search.source === "crustdata" ? "bg-[#e6f8ed] text-[#176b48]" : "bg-[#f5eddf] text-[#8a5b24]"}`}>
                  <Database size={12} /> {search.source === "crustdata" ? "Live Crustdata" : "Mock data"}
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
            <Link href={`/search/${search.id}/publish`} className="button-primary whitespace-nowrap">
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

      <div className="shell grid gap-8 py-8 sm:py-10 lg:grid-cols-[minmax(0,1fr)_260px] lg:items-start">
        <section className="space-y-5" aria-label="Ranked company results">
          {search.results.length > 0 ? (
            search.results.map((company) => <PrivateCompanyCard key={company.id} company={company} />)
          ) : (
            <div className="card p-8 text-center sm:p-12">
              <SearchCheck size={30} className="mx-auto text-[#82958d]" />
              <h2 className="mt-4 text-xl font-extrabold tracking-[-0.03em]">No companies matched this structured search</h2>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#687c74]">Try mock mode for the full demo, or adjust the predefined filters in the intelligence criteria module.</p>
            </div>
          )}
        </section>

        <aside className="order-first lg:order-last lg:sticky lg:top-6">
          <div className="card p-6">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#e8f7ed] text-[var(--mint-dark)]"><ShieldCheck size={19} /></span>
            <h2 className="mt-5 text-[17px] font-extrabold tracking-[-0.025em]">Private workspace</h2>
            <p className="mt-2 text-sm leading-6 text-[#657a72]">Fit scores, buyer hypotheses, and outreach angles stay private to your team.</p>
            <div className="mt-5 rounded-xl border border-[#dfe7e2] bg-white p-3 text-xs leading-5 text-[#60766d]">
              <strong className="block text-[var(--ink)]">Structured filters</strong>
              {search.criteria.industry ?? "Any industry"} · {search.criteria.country ?? "Any country"}<br />
              {search.criteria.minEmployees ?? 0}–{search.criteria.maxEmployees ?? "any"} employees
            </div>
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
