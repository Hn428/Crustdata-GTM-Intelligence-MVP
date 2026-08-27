# Signalist — GTM Intelligence MVP

A lightweight GTM intelligence MVP that turns one research query into:

- a private, ranked outbound research workspace; and
- a sanitized public market-intelligence report.

Phase 3 adds a bounded OpenAI Responses API orchestration layer over Crustdata MCP while preserving the complete Phase 1 mock provider and Phase 2 direct REST provider as demo-safe fallbacks.

## Run in GitHub Codespaces

The repository is configured to listen on all interfaces so the Next.js server is available through Codespaces port forwarding.

```bash
npm install
cp .env.example .env.local
npm run dev
```

Node.js 22 or newer is required by the current OpenAI SDK. Open the forwarded port for `3000`; Codespaces usually detects it automatically and offers an **Open in Browser** action.

### Provider setup

Mock mode works without credentials and consumes no credits:

```env
INTELLIGENCE_MODE=mock
CRUSTDATA_API_KEY=
OPENAI_API_KEY=
```

For deterministic Phase 2 Crustdata REST data:

```env
INTELLIGENCE_MODE=direct
CRUSTDATA_API_KEY=your_crustdata_api_key
```

For Phase 3 natural-language orchestration:

```env
INTELLIGENCE_MODE=agent
CRUSTDATA_API_KEY=your_crustdata_api_key
OPENAI_API_KEY=your_openai_api_key
OPENAI_MODEL=gpt-5.4-mini
CRUSTDATA_MCP_URL=https://mcp.crustdata.com/mcp
AGENT_MAX_COMPANIES=5
AGENT_MAX_MCP_CALLS=6
```

`AGENT_MAX_COMPANIES` is clamped to 1–10 and MCP calls are capped at 10. The default keeps development searches to five final companies and six MCP calls. `INTELLIGENCE_PROVIDER=crustdata` remains supported as a legacy alias for `INTELLIGENCE_MODE=direct`.

Restart `npm run dev` after changing environment values. `.env.local` is Git-ignored; never commit either real key. OpenAI and Crustdata requests run only from server modules.

For canonical metadata outside local development, you may optionally add:

```bash
NEXT_PUBLIC_SITE_URL=https://your-public-domain.example
```

## Product routes

- `/` — natural-language GTM research search
- `/search/ai-recruiting-gtm` — private outbound results
- `/search/ai-recruiting-gtm/publish` — sanitized public-report preview
- `/insights` — public report gallery
- `/insights/[slug]` — server-rendered public market report

## Verification

```bash
npm run lint
npm run typecheck
npm run build
```

The development and build scripts use Next.js with webpack. This avoids Turbopack worker restrictions in managed Codespace/sandbox environments while keeping the normal App Router and server-component behavior.

## Architecture

```text
app/                         Next.js routes and metadata
components/                  Shared UI and interactive client components
lib/intelligence/types.ts    Private and public domain types
lib/intelligence/provider.ts Future factual-data provider boundary
lib/intelligence/mock-provider.ts
                             Phase 1 fictional data provider
lib/intelligence/crustdata-client.ts
                             Server-only versioned REST client
lib/intelligence/crustdata-provider.ts
                             Company search, batched jobs, and cache
lib/intelligence/crustdata-types.ts
                             Narrow external response types
lib/intelligence/criteria.ts Predefined structured Phase 2 search
lib/intelligence/normalize.ts
                             External-data normalization and hiring rules
lib/intelligence/scoring.ts  Transparent deterministic fit score
lib/intelligence/selected-provider.ts
                             Mode selection and agent → direct → mock fallback
lib/agent/openai-client.ts   Server-only OpenAI SDK setup and timeout
lib/agent/schemas.ts        Strict Zod structured-output schemas
lib/agent/prompts.ts        Concise bounded GTM research instructions
lib/agent/research-agent.ts Responses API + remote Crustdata MCP provider/cache
lib/agent/normalize-agent-result.ts
                             MCP evidence validation and CompanyResult mapping
lib/publication/transform.ts Deterministic private-to-public sanitizer
lib/publication/report-store.ts
                             Validated, process-local published-report store
lib/publication/mock-reports.ts
                             Mock public report collection
app/api/reports/route.ts     Sanitized report publication endpoint
```

The public report type deliberately omits fit score, buyer name/title, and outreach angle. The sanitizer copies only explicitly public fields, preventing private GTM context from leaking into public pages by accidental object reuse.

## Agent behavior

Agent mode sends the natural-language goal to the OpenAI Responses API with Crustdata configured as a remote MCP tool. One model chooses useful company/job/person/signal research steps; no agent framework or autonomous loop is used.

The returned result is parsed with a strict Zod-backed Structured Output schema. Application code then cross-checks each company, factual signal, and named buyer against the actual MCP tool-call output. Unsupported claims are dropped, named buyers require both name and title evidence, and fit scores are always recomputed by the existing deterministic scoring function. `whyNow` and the outreach angle are treated as interpretations and cannot introduce unsupported numeric claims.

Agent responses are cached by normalized query, model, MCP endpoint, and limits. The selected provider's final snapshot—including a direct or mock fallback—is also cached in memory for 15 minutes. Opening a matching publish preview therefore reuses the exact private-search snapshot in the same server process instead of triggering another MCP request. Development logs contain timings and call counts only—not credentials or full tool responses.

Failure behavior is intentionally layered:

- agent configuration, OpenAI auth/timeout, malformed output, MCP failure, refusal/no useful tool call, or zero evidence-validated companies → direct Crustdata;
- direct Crustdata auth/rate-limit/network/response failure → mock data;
- partial MCP failures may still return supported partial agent results with a visible notice.

## Crustdata behavior

The live provider makes server-side requests only, using:

- `POST /company/search` for five US AI companies with 20–500 employees;
- `POST /job/search` once for all returned company IDs, capped at 50 rows and restricted to listings Crustdata indexed during the last 120 days.

Requests include `Authorization: Bearer …` and `x-api-version: 2025-11-01`. The API key never crosses the server/client boundary.

`metadata.date_added` is treated as Crustdata&apos;s indexing date—not the employer&apos;s original posting date. UI copy therefore says “indexed recently” rather than claiming every job was recently posted or remains open.

Fit scoring is deterministic and capped at 100:

- company size match: 10 points
- industry match: 15 points
- funding within 18 months: 20 points
- six-month headcount growth: up to 15 points
- indexed job activity: up to 15 points
- detected GTM-title hiring: 25 points

The provider caches each structured search promise in memory for 15 minutes. Job enrichment is best-effort: a job failure still returns company results. Company-search authentication, access, rate-limit, network, malformed-response, and validation failures degrade to mock results with a visible notice.

Direct mode remains persona-only. Agent mode can display a named buyer only when Crustdata output verifies both the person and title; otherwise it displays a persona. The agent prompt forbids requesting emails, phone numbers, or other contact details.

## Known MVP limitations

- Search and agent caches are process-local; restarting the dev server discards them.
- Published reports are schema-validated and retained in process memory for 24 hours (up to 50 reports). They are lost on server restart and are not yet shared across multiple server instances; durable production storage remains future work.
- The prompt-specified MCP URL is the default. `CRUSTDATA_MCP_URL` can be changed to Crustdata's current documented `https://install.crustdata.com/mcp`; only those two HTTPS hosts are accepted to prevent credential forwarding elsewhere.
- Live agent verification requires both paid-service keys and consumes OpenAI tokens plus Crustdata credits.
