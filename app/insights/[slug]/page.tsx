import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  CheckCircle2,
  Globe2,
  LineChart,
  MapPin,
  Search,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { Brand } from "@/components/brand";
import { CompanyLogo } from "@/components/company-logo";
import { getPublicReport, publicReports } from "@/lib/publication/mock-reports";

type InsightPageProps = {
  params: Promise<{ slug: string }>;
};

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: InsightPageProps): Promise<Metadata> {
  const { slug } = await params;
  const report = getPublicReport(slug);
  if (!report) notFound();

  return {
    title: report.title,
    description: report.intro,
    keywords: ["AI recruiting startups", "GTM hiring", "recruiting technology", "market intelligence"],
    alternates: { canonical: `/insights/${slug}` },
    openGraph: {
      type: "article",
      title: report.title,
      description: report.intro,
      url: `/insights/${slug}`,
      publishedTime: "2026-08-27T10:32:00.000Z",
    },
  };
}

export function generateStaticParams() {
  return publicReports.map((report) => ({ slug: report.slug }));
}

export default async function InsightPage({ params }: InsightPageProps) {
  const { slug } = await params;
  const report = getPublicReport(slug);
  if (!report) notFound();
  const updatedDate = new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${report.updatedAt}T00:00:00.000Z`));
  const signalCount = report.companies.reduce((total, company) => total + company.signals.length, 0);
  const multiSignalCount = report.companies.filter((company) => company.signals.length >= 3).length;
  const locationCount = new Set(report.companies.map((company) => company.location)).size;
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: report.title,
    description: report.intro,
    datePublished: report.createdAt,
    dateModified: report.updatedAt,
    author: { "@type": "Organization", name: "Signalist" },
    publisher: { "@type": "Organization", name: "Signalist" },
    about: report.companies.map((company) => ({ "@type": "Organization", name: company.name, url: `https://${company.domain}` })),
  };

  return (
    <main className="min-h-screen bg-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }} />

      <div className="bg-[var(--ink)] text-white">
        <header className="border-b border-white/10">
          <div className="shell flex h-[76px] items-center justify-between">
            <Brand light />
            <Link href="/" className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/8 px-4 py-2.5 text-xs font-bold text-white no-underline transition hover:bg-white/15">
              <Search size={14} /> Run your own search
            </Link>
          </div>
        </header>

        <section className="relative overflow-hidden pb-20 pt-16 sm:pb-28 sm:pt-24">
          <div className="pointer-events-none absolute right-[-100px] top-[-130px] h-[500px] w-[500px] rounded-full bg-[#1a7f58]/25 blur-3xl" />
          <div className="pointer-events-none absolute bottom-[-180px] left-[20%] h-[380px] w-[380px] rounded-full bg-[#d3833d]/10 blur-3xl" />
          <div className="shell relative">
            <div className="max-w-[880px]">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/8 px-4 py-2 text-[11px] font-extrabold uppercase tracking-[0.14em] text-[#b8e9cc]">
                <Globe2 size={14} /> Market intelligence report
              </div>
              <h1 className="mt-7 text-[42px] font-extrabold leading-[1.04] tracking-[-0.055em] sm:text-[62px] lg:text-[72px]">{report.title}</h1>
              <p className="mt-7 max-w-[760px] text-[17px] leading-8 text-[#bfd0c9] sm:text-xl">{report.intro}</p>
              <div className="mt-9 flex flex-wrap gap-x-7 gap-y-3 text-sm font-semibold text-[#a9bdb5]">
                <span className="flex items-center gap-2"><CalendarDays size={16} className="text-[#63d998]" /> Last updated {updatedDate}</span>
                <span className="flex items-center gap-2"><Building2 size={16} className="text-[#63d998]" /> {report.companies.length} companies analyzed</span>
                <span className="flex items-center gap-2"><MapPin size={16} className="text-[#63d998]" /> {locationCount} {locationCount === 1 ? "location" : "locations"} represented</span>
              </div>
            </div>
          </div>
        </section>
      </div>

      <section className="relative z-10 -mt-8">
        <div className="shell grid gap-3 sm:grid-cols-3">
          <article className="rounded-2xl border border-[#dfe7e2] bg-white p-5 shadow-[0_12px_35px_rgba(20,50,40,0.08)]">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#e8f8ee] text-[#16724c]"><TrendingUp size={17} /></span>
            <p className="mt-4 text-2xl font-extrabold tracking-[-0.04em]">{report.companies.length}</p>
            <p className="mt-1 text-xs font-semibold text-[#6d8179]">Companies showing recent momentum</p>
          </article>
          <article className="rounded-2xl border border-[#dfe7e2] bg-white p-5 shadow-[0_12px_35px_rgba(20,50,40,0.08)]">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#f7eee0] text-[#a85f26]"><BriefcaseBusiness size={17} /></span>
            <p className="mt-4 text-2xl font-extrabold tracking-[-0.04em]">{signalCount}</p>
            <p className="mt-1 text-xs font-semibold text-[#6d8179]">Market signals highlighted</p>
          </article>
          <article className="rounded-2xl border border-[#dfe7e2] bg-white p-5 shadow-[0_12px_35px_rgba(20,50,40,0.08)]">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#e8eef8] text-[#42669b]"><BarChart3 size={17} /></span>
            <p className="mt-4 text-2xl font-extrabold tracking-[-0.04em]">{multiSignalCount} of {report.companies.length}</p>
            <p className="mt-1 text-xs font-semibold text-[#6d8179]">Companies with multiple growth signals</p>
          </article>
        </div>
      </section>

      <div className="shell grid gap-12 py-16 sm:py-20 lg:grid-cols-[minmax(0,1fr)_300px] lg:items-start">
        <article>
          <header className="border-b border-[#e0e7e2] pb-7">
            <span className="eyebrow">The cohort</span>
            <h2 className="mt-4 text-3xl font-extrabold tracking-[-0.045em] sm:text-[42px]">Companies showing real momentum</h2>
            <p className="mt-4 max-w-2xl text-[15px] leading-7 text-[#62776f]">These recruiting technology companies stand out for the strength, variety, and recency of their publicly visible growth signals.</p>
          </header>

          <div className="divide-y divide-[#e2e9e4]">
            {report.companies.map((company) => (
              <section key={company.name} className="grid gap-5 py-8 sm:grid-cols-[42px_minmax(0,1fr)] sm:py-10">
                <span className="text-sm font-extrabold tabular-nums text-[#9aa8a2]">{String(company.rank).padStart(2, "0")}</span>
                <div>
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex items-center gap-3.5">
                      <CompanyLogo initials={company.initials} color={company.color} />
                      <div>
                        <h3 className="text-xl font-extrabold tracking-[-0.03em]">{company.name}</h3>
                        <p className="mt-1.5 text-xs font-semibold text-[#75877f]">{company.industry} · {company.companySize}</p>
                      </div>
                    </div>
                    <a href={`https://${company.domain}`} className="inline-flex items-center gap-1 text-xs font-bold text-[#557067] hover:text-[var(--mint-dark)]">
                      {company.domain} <ArrowUpRight size={13} />
                    </a>
                  </div>
                  <div className="mt-5 flex flex-wrap gap-2">
                    {company.signals.map((signal) => <span key={signal.label} className="signal-pill"><Sparkles size={11} /> {signal.label}</span>)}
                  </div>
                  <div className="mt-5 border-l-2 border-[#a3d9bb] pl-4">
                    <p className="text-[11px] font-extrabold uppercase tracking-[0.11em] text-[#688078]">Why this company is notable</p>
                    <p className="mt-2 text-[15px] leading-7 text-[#40584f]">{company.notability}</p>
                  </div>
                </div>
              </section>
            ))}
          </div>
        </article>

        <aside className="space-y-5 lg:sticky lg:top-7">
          <div className="rounded-[22px] border border-[#dfe7e2] bg-[#f5f8f5] p-6">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-white text-[var(--mint-dark)] shadow-sm"><LineChart size={19} /></span>
            <h2 className="mt-5 text-lg font-extrabold tracking-[-0.03em]">Signals we tracked</h2>
            <ul className="mt-4 space-y-3.5 text-sm text-[#556b63]">
              <li className="flex gap-2.5"><CheckCircle2 size={15} className="mt-0.5 shrink-0 text-[#20905c]" /> Employee growth</li>
              <li className="flex gap-2.5"><CheckCircle2 size={15} className="mt-0.5 shrink-0 text-[#20905c]" /> Open GTM roles</li>
              <li className="flex gap-2.5"><CheckCircle2 size={15} className="mt-0.5 shrink-0 text-[#20905c]" /> Recent fundraising</li>
              <li className="flex gap-2.5"><CheckCircle2 size={15} className="mt-0.5 shrink-0 text-[#20905c]" /> Leadership changes</li>
              <li className="flex gap-2.5"><CheckCircle2 size={15} className="mt-0.5 shrink-0 text-[#20905c]" /> Website momentum</li>
            </ul>
          </div>
          <div className="rounded-[22px] border border-[#e9dfce] bg-[#fbf7ef] p-6">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-[#926431]">A note on the data</p>
            <p className="mt-3 text-xs leading-5 text-[#765f43]">This report includes only evidence-backed company signals. Private fit scores, buyer details, and outreach recommendations are excluded from the public view.</p>
          </div>
        </aside>
      </div>

      <section id="methodology" className="border-y border-[#dfe7e2] bg-[var(--paper)] py-16 sm:py-20">
        <div className="shell grid gap-8 lg:grid-cols-[280px_minmax(0,1fr)]">
          <div>
            <span className="eyebrow">Transparent by default</span>
            <h2 className="mt-4 text-3xl font-extrabold tracking-[-0.045em]">Methodology</h2>
          </div>
          <div>
            <p className="max-w-3xl text-[16px] leading-8 text-[#526860]">{report.methodology}</p>
            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {["Define the market", "Collect fresh signals", "Rank by momentum"].map((step, index) => (
                <div key={step} className="rounded-2xl border border-[#dbe4de] bg-white p-4">
                  <span className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-[#879790]">Step {index + 1}</span>
                  <p className="mt-2 text-sm font-extrabold">{step}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[var(--ink)] py-16 text-white sm:py-20">
        <div className="shell flex flex-col items-start justify-between gap-8 sm:flex-row sm:items-center">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.13em] text-[#68d89c]">Turn curiosity into pipeline</p>
            <h2 className="mt-4 text-3xl font-extrabold tracking-[-0.045em] sm:text-[42px]">Want to research your own market?</h2>
            <p className="mt-3 max-w-xl text-[15px] leading-6 text-[#b8cac3]">Ask a GTM question, find the companies moving now, and turn your research into an asset worth sharing.</p>
          </div>
          <Link href="/" className="inline-flex min-h-12 shrink-0 items-center gap-2 rounded-xl bg-white px-5 text-sm font-extrabold text-[var(--ink)] no-underline transition hover:-translate-y-0.5 hover:bg-[#edf8f1]">
            Run a GTM search <ArrowRight size={17} />
          </Link>
        </div>
      </section>

      <footer className="border-t border-[#e1e8e3] bg-white py-8">
        <div className="shell flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Brand />
          <p className="text-xs text-[#72857d]">Independent market research · Updated {updatedDate}</p>
        </div>
      </footer>
    </main>
  );
}
