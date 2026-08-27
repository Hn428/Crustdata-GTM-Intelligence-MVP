"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { ArrowRight, Search, Sparkles } from "lucide-react";
import { exampleQueries } from "@/lib/intelligence/mock-provider";

const defaultQuery =
  "Find US AI infrastructure startups with 20–500 employees that appear to be scaling enterprise sales.";

export function SearchForm() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [isRunning, setIsRunning] = useState(false);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalizedQuery = query.trim() || defaultQuery;
    setIsRunning(true);
    router.push(`/search/ai-recruiting-gtm?q=${encodeURIComponent(normalizedQuery)}`);
  }

  return (
    <>
      <form onSubmit={submit} className="relative mt-10 rounded-[26px] border border-white/60 bg-white p-2.5 shadow-[0_26px_80px_rgba(14,48,36,0.16)]">
        <label htmlFor="research-query" className="sr-only">
          Describe the market you want to research
        </label>
        <div className="flex items-center gap-2 border-b border-[#e5ebe6] px-4 py-3 text-xs font-bold uppercase tracking-[0.13em] text-[#688077]">
          <Sparkles size={15} className="text-[var(--mint-dark)]" />
          Research brief
        </div>
        <textarea
          id="research-query"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={defaultQuery}
          rows={4}
          className="block w-full resize-none bg-transparent px-4 pb-3 pt-5 text-[17px] leading-7 text-[var(--ink)] outline-none placeholder:text-[#7d918a] sm:min-h-32 sm:px-5 sm:text-xl sm:leading-8"
        />
        <div className="flex flex-col gap-3 px-1 pb-1 sm:flex-row sm:items-center sm:justify-between">
          <span className="hidden items-center gap-2 px-4 text-xs text-[#789087] sm:flex">
            <Search size={14} /> The research agent chooses relevant live data tools
          </span>
          <button type="submit" disabled={isRunning} className="button-primary min-w-44 disabled:cursor-wait disabled:opacity-70">
            {isRunning ? "Building research…" : "Run research"}
            {!isRunning && <ArrowRight size={16} aria-hidden="true" />}
          </button>
        </div>
      </form>

      <div className="mt-7">
        <p className="mb-3 text-xs font-bold uppercase tracking-[0.12em] text-[#789087]">Try an example</p>
        <div className="flex flex-wrap gap-2.5">
          {exampleQueries.map((example) => (
            <button
              key={example.label}
              type="button"
              onClick={() => setQuery(example.query)}
              className="rounded-full border border-[#d9e2dc] bg-white/75 px-4 py-2.5 text-left text-[13px] font-semibold text-[#3e574e] transition hover:-translate-y-0.5 hover:border-[#a9c6b3] hover:bg-white"
            >
              {example.label}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
