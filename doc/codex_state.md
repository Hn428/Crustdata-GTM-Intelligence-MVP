# Codex handoff — current repository state

Last inspected: 2026-08-27 UTC. This describes the working tree as it exists now, including uncommitted work.

## Git and environment

- Repository: `/workspaces/Crustdata-GTM-Intelligence-MVP`
- Branch: `main`
- `HEAD`: `c535051 feat: integrate Crustdata GTM intelligence MVP`, equal to `origin/main`.
- The Phase 3 implementation and subsequent consistency/publication fixes are **not committed**. Before this handoff file, `git status` showed 16 modified tracked files and 3 untracked path entries (`app/api/`, `lib/agent/`, and `lib/publication/report-store.ts`). Preserve these changes.
- Codespaces runtime inspected as Node `v24.14.0`, npm `11.9.0`. No Next dev process was detected at handoff time.
- Next.js is `16.3.3`; `AGENTS.md` requires reading the relevant local guide under `node_modules/next/dist/docs/` before changing Next code.
- `.env.local` exists and is ignored. Both API keys are set; do not print or commit them. Non-secret active values are:
  - `INTELLIGENCE_MODE=agent`
  - `OPENAI_MODEL=gpt-5.4-mini`
  - `CRUSTDATA_MCP_URL=https://mcp.crustdata.com/mcp`
  - `AGENT_MAX_COMPANIES=10`
  - `AGENT_MAX_MCP_CALLS=6`
- Run with `npm install` then `npm run dev`; webpack dev binds `0.0.0.0:3000` for Codespaces forwarding.

## Implemented application

Routes:

- `/` — natural-language research form.
- `/search/[id]?q=...` — private ranked research with source/fallback notice, agent interpretation, trace, verified signals/evidence, fit score, buyer/persona, and outreach angle.
- `/search/[id]/publish?q=...` — sanitized editable preview built from the same cached search snapshot.
- `POST /api/reports` — validates and stores a public-safe report.
- `/insights` — three static mock report cards only; dynamically published reports are not added to this gallery.
- `/insights/[slug]` — dynamic public report; unknown or expired slugs return 404.

Provider selection is in `lib/intelligence/selected-provider.ts`:

1. `agent`: OpenAI Responses API + remote Crustdata MCP.
2. Agent failure falls back to direct Crustdata REST.
3. Direct failure falls back to mock fixtures.
4. `direct` and `mock` can be selected explicitly. Legacy `INTELLIGENCE_PROVIDER=crustdata` maps to direct mode.
5. The final selected result, including fallbacks, is cached in process for 15 minutes by mode and criteria. This is what keeps private and publish-preview companies identical and prevents a second MCP call.

## Agent and evidence behavior

- `lib/agent/research-agent.ts` uses `client.responses.parse`, Zod Structured Outputs, `store: false`, a 90-second SDK timeout, one retry, sequential tool calls, and at most the configured MCP-call limit.
- Allowed read-only MCP tools are company search/enrichment, job search, people search, social-post keyword search, and web search. MCP credentials are server-only and can only be sent to the two allowlisted Crustdata HTTPS hosts.
- The agent must make at least one completed MCP call. Responses without usable calls, valid structured output, or any evidence-supported company fall back to direct mode.
- `lib/agent/normalize-agent-result.ts` validates company identity against completed MCP output. Exact contiguous evidence remains required for factual signals and named buyers; named buyers also require both name and title in the referenced output. Unsupported values are removed.
- `whyNow` and outreach are interpretations; unsupported numeric claims are replaced by safe fallbacks. Contact details are forbidden.
- A prior `code=no_results` case was caused by an overly strict contiguous company-identity excerpt check. Company identity now only needs to occur in completed MCP output, while signal/buyer checks remain strict. Handled agent fallback is logged with `console.warn`, not a Next console error.

## Scoring

- Live direct and agent results always call `calculateFitScore` in `lib/intelligence/scoring.ts`; the model never assigns the score. Mock fixture scores are static.
- Maximum 100 points: size fit 10, industry fit 15, funding within 18 months 20, six-month headcount growth 8 or 15, recent indexed jobs 8 or 15, and any GTM job 25.
- The formula is deterministic for the same normalized inputs at the same evaluation date. Funding recency uses `Date.now()`, so an unchanged company can cross the 18-month boundary later.

## Publication and privacy

- `lib/publication/transform.ts` copies an explicit public allowlist. Public types omit fit score, buyer name/title, and outreach angle.
- `components/publish-editor.tsx` posts the exact edited sanitized preview before navigating. It shows all public signals, not only the first two.
- `lib/publication/report-store.ts` applies a second strict Zod boundary; unknown fields such as `fitScore` are rejected. Storage is process-local via `globalThis`, limited to 50 reports with a 24-hour TTL.
- Published reports disappear on process restart and are not shared between instances. There is no database or authentication.
- The public route is forced dynamic so it can see the in-process store. Missing reports no longer silently substitute the primary mock report.

## Last verification completed

All passed after the latest code changes:

- `npm run lint`
- `npm run typecheck`
- `npm run build`
- `git diff --check`

Live checks against the dev server also passed:

- One agent search completed six MCP calls.
- Private and publish preview showed the same five companies in the same order; opening preview logged no second agent/MCP run.
- Sanitized report POST returned 201 and its final page returned 200 with the expected company and headcount-growth signal.
- A report payload containing `fitScore` returned 400.
- An unknown report slug returned 404.

There is no automated test suite or test runner beyond lint, TypeScript, build, and the manual HTTP checks above.

## Known current limitations / stale copy

- All caches and published reports are process-local.
- `/insights` and the sitemap include only the three fixture reports, not newly published reports.
- Parts of the public report template remain hard-coded for the original recruiting demo: metadata keywords, Open Graph `publishedTime`, cohort description, and some gallery/footer copy. Dynamic report data itself is used for companies, signals, dates, counts, and locations.
- `lib/orchestration/provider.ts` is an unused Phase 1 placeholder and its comment is stale; actual orchestration lives in `lib/agent/`.
- Direct REST mode still uses the fixed structured filters from `lib/intelligence/criteria.ts`; only agent mode interprets the natural-language query into criteria.
- Live verification consumes OpenAI tokens and Crustdata credits and may still encounter service rate limits.
