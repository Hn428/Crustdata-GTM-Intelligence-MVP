# Signalist — GTM Intelligence MVP

A lightweight GTM intelligence MVP that turns one research query into:

- a private, ranked outbound research workspace; and
- a sanitized public market-intelligence report.

Phase 2 supports real company and indexed-job data from Crustdata while preserving a complete fictional mock mode. OpenAI/LLM orchestration is intentionally not included yet.

## Run in GitHub Codespaces

The repository is configured to listen on all interfaces so the Next.js server is available through Codespaces port forwarding.

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open the forwarded port for `3000`. Codespaces usually detects the port automatically and offers an **Open in Browser** action.

### Provider setup

Mock mode works without credentials and consumes no credits:

```env
INTELLIGENCE_PROVIDER=mock
CRUSTDATA_API_KEY=
```

For real data, edit `.env.local`:

```env
INTELLIGENCE_PROVIDER=crustdata
CRUSTDATA_API_KEY=your_crustdata_api_key
```

Restart `npm run dev` after changing environment values. `.env.local` is Git-ignored; never commit the real key.

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
                             Environment selection and mock fallback
lib/orchestration/provider.ts
                             Future LLM planning boundary (interface only)
lib/publication/transform.ts Deterministic private-to-public sanitizer
lib/publication/mock-reports.ts
                             Mock public report collection
```

The public report type deliberately omits fit score, buyer title, and outreach angle. The sanitizer copies only explicitly public fields, preventing private GTM context from leaking into public pages by accidental object reuse.

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

Buyer lookup remains persona-only in Phase 2. This avoids five additional paid person-search calls while the core company/job flow is validated; no personal emails or contact fields are requested.
