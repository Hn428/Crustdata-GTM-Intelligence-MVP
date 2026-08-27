import { AppHeader } from "@/components/app-header";

export default function SearchLoading() {
  return (
    <main className="min-h-screen" aria-busy="true" aria-label="Loading market research">
      <AppHeader />
      <div className="shell py-12">
        <div className="h-4 w-36 animate-pulse rounded-full bg-[#dce6df]" />
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
