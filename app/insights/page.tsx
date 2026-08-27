import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Building2, CalendarDays, FileSearch, Search, Sparkles } from "lucide-react";
import { Brand } from "@/components/brand";
import { publicReports } from "@/lib/publication/mock-reports";

export const metadata: Metadata = {
  title: "Market Intelligence Reports",
  description: "Browse signal-backed market reports on fast-moving startups, hiring trends, and go-to-market expansion.",
  alternates: { canonical: "/insights" },
};

const accentStyles = [
  { background: "bg-[#e9f7ed]", color: "text-[#19734c]", marker: "bg-[#26b973]" },
  { background: "bg-[#edf1f9]", color: "text-[#3f659b]", marker: "bg-[#597bb2]" },
  { background: "bg-[#f8eee2]", color: "text-[#a45e27]", marker: "bg-[#dd8743]" },
];

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${date}T00:00:00.000Z`));
}

export default function InsightsPage() {
  return (
    <main className="min-h-screen bg-[var(--paper)]">
      <header className="border-b border-[#dee6e1] bg-white">
        <div className="shell flex h-[76px] items-center justify-between">
          <Brand />
          <Link href="/" className="button-primary min-h-10 px-4 text-[13px]"><Search size={14} /> Run a GTM search</Link>
        </div>
      </header>

      <section className="relative overflow-hidden border-b border-[#dce5df] bg-white py-16 sm:py-24">
        <div className="pointer-events-none absolute right-[-100px] top-[-180px] h-[440px] w-[440px] rounded-full bg-[#c5f0d6]/50 blur-3xl" />
        <div className="shell relative">
          <span className="eyebrow">Public intelligence library</span>
          <div className="mt-5 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <h1 className="max-w-3xl text-[42px] font-extrabold leading-[1.05] tracking-[-0.055em] sm:text-[60px]">Markets worth watching, backed by signals.</h1>
            <p className="max-w-md text-[16px] leading-7 text-[#5f746c]">Shareable research on the companies hiring, funding, and building momentum across important technology categories.</p>
          </div>
        </div>
      </section>

      <section className="shell py-14 sm:py-20" aria-labelledby="latest-reports">
        <div className="flex items-center justify-between border-b border-[#dce4df] pb-5">
          <h2 id="latest-reports" className="text-2xl font-extrabold tracking-[-0.035em]">Latest reports</h2>
          <span className="text-xs font-bold text-[#788a83]">{publicReports.length} reports</span>
        </div>

        <div className="mt-7 grid gap-5 lg:grid-cols-3">
          {publicReports.map((report, index) => {
            const accent = accentStyles[index % accentStyles.length];

            return (
              <article key={report.id} className="group card flex min-h-[390px] flex-col overflow-hidden transition duration-200 hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(20,52,40,0.1)]">
                <div className={`relative h-28 overflow-hidden ${accent.background}`}>
                  <div className="absolute inset-0 dot-grid opacity-40" />
                  <div className={`absolute -bottom-9 -right-7 h-28 w-28 rounded-full ${accent.marker} opacity-20`} />
                  <span className={`absolute left-6 top-6 grid h-11 w-11 place-items-center rounded-xl bg-white shadow-sm ${accent.color}`}><FileSearch size={20} /></span>
                  <span className={`absolute right-5 top-5 rounded-full bg-white/75 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.12em] ${accent.color}`}><Sparkles size={11} className="mr-1 inline" /> Signal report</span>
                </div>
                <div className="flex flex-1 flex-col p-6 sm:p-7">
                  <h3 className="text-[22px] font-extrabold leading-[1.2] tracking-[-0.035em]">{report.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-[#62766f]">{report.summary}</p>
                  <div className="mt-auto flex flex-wrap gap-x-4 gap-y-2 border-t border-[#e4eae6] pt-5 text-xs font-semibold text-[#73867e]">
                    <span className="flex items-center gap-1.5"><Building2 size={13} /> {report.companies.length} companies</span>
                    <span className="flex items-center gap-1.5"><CalendarDays size={13} /> {formatDate(report.updatedAt)}</span>
                  </div>
                  <Link href={`/insights/${report.slug}`} className="mt-5 inline-flex items-center gap-2 text-sm font-extrabold text-[var(--mint-dark)] no-underline">
                    Read the report <ArrowRight size={15} className="transition group-hover:translate-x-1" />
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="border-t border-[#dce4df] bg-white py-12">
        <div className="shell flex flex-col items-start justify-between gap-5 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-xl font-extrabold tracking-[-0.03em]">Have a market question of your own?</h2>
            <p className="mt-2 text-sm text-[#687c74]">Build private prospect research, then publish the public-safe version.</p>
          </div>
          <Link href="/" className="button-primary">Start researching <ArrowRight size={16} /></Link>
        </div>
      </section>

      <footer className="shell flex flex-col gap-3 py-8 text-xs text-[#72857d] sm:flex-row sm:items-center sm:justify-between">
        <Brand />
        <p>Illustrative market intelligence for the Signalist Phase 1 preview.</p>
      </footer>
    </main>
  );
}
