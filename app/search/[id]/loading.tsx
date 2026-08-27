import { AppHeader } from "@/components/app-header";

export default function SearchLoading() {
  return (
    <main className="min-h-screen" aria-busy="true" aria-label="Loading market research">
      <AppHeader />
      <div className="shell py-12">
        <div className="rounded-2xl border border-[#dce6df] bg-white px-5 py-4 shadow-sm">
          <p className="text-sm font-extrabold text-[var(--ink)]">Researching your GTM hypothesis…</p>
          <p className="mt-1 text-xs leading-5 text-[#6c8078]">The agent is selecting relevant Crustdata tools; supported facts and deterministic rankings will appear when complete.</p>
          <div className="mt-3 flex flex-wrap gap-2 text-[10px] font-bold uppercase tracking-[0.08em] text-[#6c8078]">
            <span className="rounded-full bg-[#f3f7f4] px-3 py-1.5">Interpret goal</span>
            <span className="rounded-full bg-[#f3f7f4] px-3 py-1.5">Research signals</span>
            <span className="rounded-full bg-[#f3f7f4] px-3 py-1.5">Validate evidence</span>
            <span className="rounded-full bg-[#f3f7f4] px-3 py-1.5">Score accounts</span>
          </div>
        </div>
        <div className="mt-6 h-12 max-w-3xl animate-pulse rounded-2xl bg-[#dfe7e2]" />
        <div className="mt-3 h-5 w-64 animate-pulse rounded-full bg-[#e5ebe7]" />
        <div className="mt-10 grid gap-5 lg:grid-cols-[minmax(0,1fr)_260px]">
          <div className="space-y-5">
            {[0, 1, 2].map((item) => (
              <div key={item} className="card h-64 animate-pulse bg-white" />
            ))}
          </div>
          <div className="card hidden h-72 animate-pulse bg-white lg:block" />
        </div>
      </div>
    </main>
  );
}
