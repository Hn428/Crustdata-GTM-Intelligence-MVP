import Link from "next/link";
import { ArrowUpRight, Database, Globe2, LockKeyhole, MoveRight, SearchCheck } from "lucide-react";
import { Brand } from "@/components/brand";
import { SearchForm } from "@/components/search-form";

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden">
      <header className="relative z-10">
        <div className="shell flex h-[76px] items-center justify-between">
          <Brand />
          <nav className="flex items-center gap-2 sm:gap-5" aria-label="Primary navigation">
            <a href="#how-it-works" className="hidden text-sm font-semibold text-[#50645d] no-underline hover:text-[var(--ink)] sm:block">
              How it works
            </a>
            <Link
              href="/insights"
              className="button-secondary min-h-10 px-3.5 text-[13px]"
            >
              Browse insights <ArrowUpRight size={14} />
            </Link>
          </nav>
        </div>
      </header>

      <section className="relative border-b border-[#dce5df] pb-20 pt-16 sm:pb-28 sm:pt-24">
        <div className="pointer-events-none absolute -right-24 -top-28 h-[440px] w-[440px] rounded-full bg-[#c7f1d8]/45 blur-3xl" />
        <div className="pointer-events-none absolute -left-40 bottom-[-80px] h-[360px] w-[360px] rounded-full bg-[#f2d9b9]/40 blur-3xl" />
        <div className="shell relative grid items-start gap-12 lg:grid-cols-[1.08fr_.92fr] lg:gap-16">
          <div className="max-w-[680px] rise-in">
            <span className="eyebrow">From one query to two growth loops</span>
            <h1 className="mt-6 max-w-[720px] text-[46px] font-extrabold leading-[1.02] tracking-[-0.055em] text-[var(--ink)] sm:text-[66px] lg:text-[76px]">
              Research your market. <span className="text-[var(--mint-dark)]">Make it compound.</span>
            </h1>
            <p className="mt-7 max-w-[610px] text-[17px] leading-7 text-[#546a62] sm:text-xl sm:leading-8">
              Turn a natural-language GTM question into ranked prospects for outbound—and a publishable market report for inbound.
            </p>
            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm font-semibold text-[#536961]">
              <span className="flex items-center gap-2"><SearchCheck size={17} className="text-[var(--mint-dark)]" /> Ranked company research</span>
              <span className="flex items-center gap-2"><Globe2 size={17} className="text-[var(--mint-dark)]" /> Public insight in one click</span>
            </div>
          </div>

          <div className="relative lg:pt-2">
            <div className="absolute -inset-8 -z-10 rounded-[40px] bg-white/20 dot-grid [mask-image:radial-gradient(black,transparent_72%)]" />
            <SearchForm />
          </div>
        </div>
      </section>

      <section id="how-it-works" className="shell py-20 sm:py-24">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <span className="eyebrow">One research asset, twice the value</span>
            <h2 className="mt-4 max-w-xl text-3xl font-extrabold tracking-[-0.04em] sm:text-[42px]">
              Your market work shouldn&apos;t disappear into a spreadsheet.
            </h2>
          </div>
          <p className="max-w-md text-[15px] leading-6 text-[#61756e]">
            Signalist gives private deal context to your team, then safely reshapes the same evidence into public category intelligence.
          </p>
        </div>

        <div className="mt-12 grid gap-5 lg:grid-cols-[1fr_auto_1fr] lg:items-stretch">
          <article className="card p-7 sm:p-9">
            <div className="flex items-start justify-between gap-4">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#e7f8ee] text-[#14714b]"><LockKeyhole size={22} /></span>
              <span className="rounded-full bg-[#eef3ef] px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.14em] text-[#62776f]">Private</span>
            </div>
            <h3 className="mt-8 text-2xl font-extrabold tracking-[-0.035em]">Outbound workspace</h3>
            <p className="mt-3 text-[15px] leading-6 text-[#61756e]">Rank accounts by fit, see the evidence, understand the likely buyer, and arrive with a timely point of view.</p>
            <div className="mt-7 space-y-3 border-t border-[#e4eae6] pt-6 text-sm font-semibold text-[#3d554c]">
              <p>✓ Fit scoring and company signals</p>
              <p>✓ “Why now” timing context</p>
              <p>✓ Buyer and outreach hypotheses</p>
            </div>
          </article>

          <div className="flex items-center justify-center py-1 lg:px-1">
            <span className="grid h-12 w-12 rotate-90 place-items-center rounded-full border border-[#cbd8d0] bg-white text-[var(--mint-dark)] shadow-sm lg:rotate-0"><MoveRight size={20} /></span>
          </div>

          <article className="card p-7 sm:p-9">
            <div className="flex items-start justify-between gap-4">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#f7eedf] text-[#a65c20]"><Globe2 size={22} /></span>
              <span className="rounded-full bg-[#f7f0e5] px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.14em] text-[#8d682f]">Public</span>
            </div>
            <h3 className="mt-8 text-2xl font-extrabold tracking-[-0.035em]">Market intelligence</h3>
            <p className="mt-3 text-[15px] leading-6 text-[#61756e]">Remove private sales context and publish a credible, crawlable report that earns attention in your market.</p>
            <div className="mt-7 space-y-3 border-t border-[#e4eae6] pt-6 text-sm font-semibold text-[#3d554c]">
              <p>✓ Sanitized company evidence</p>
              <p>✓ Clear ranking methodology</p>
              <p>✓ Search-friendly public page</p>
            </div>
          </article>
        </div>
      </section>

      <section className="border-y border-[#dce5df] bg-white py-10">
        <div className="shell flex flex-col items-start justify-between gap-5 sm:flex-row sm:items-center">
          <div className="flex items-center gap-4">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-[var(--ink)] text-white"><Database size={19} /></span>
            <div>
              <p className="font-extrabold tracking-[-0.02em]">Built for fresh market signals</p>
              <p className="mt-1 text-sm text-[#6b7e77]">Phase 1 uses realistic mock data. Live data sources come next.</p>
            </div>
          </div>
          <span className="rounded-full border border-[#d8e2db] bg-[#f5f8f5] px-4 py-2 text-xs font-bold text-[#567068]">No emails exposed · Public-safe by design</span>
        </div>
      </section>

      <footer className="shell flex flex-col gap-3 py-8 text-xs text-[#71847c] sm:flex-row sm:items-center sm:justify-between">
        <Brand />
        <p>GTM intelligence that gets more valuable every time you use it.</p>
      </footer>
    </main>
  );
}
