# Job Tracker MVP

A modular frontend MVP for a future multi-user SaaS style job search workspace, now oriented around a searchable job database plus application tracking.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn/ui style components
- React Hook Form
- Zod
- TanStack Table
- Mock data and local state, structured for future API replacement

## Run locally

```bash
cd /Users/zhoumingxuan/Desktop/Myself/job-tracker-mvp
npm install
npm run dev
```

Then open [http://127.0.0.1:3001](http://127.0.0.1:3001).

## Current features

- Chinese UI with top navigation layout
- Fresh Glass visual system:
  - glassmorphism cards
  - blue / mint / coral color tokens
  - shared button, badge, and status styles
- Dashboard:
  - top-level application stats
  - upcoming deadline panel
- Applications page:
  - searchable table
  - status filter
  - add / edit / delete
  - CSV export
  - application link field removed from the data model and UI
- Jobs page:
  - job database style workspace
  - structured job model with tags, work mode, employment type, source type, summary, and raw description
  - structured multi-filter panel
  - filters for `地区类别` / `岗位方向` / `招聘项目`
  - save job / unsave job
  - convert a job into an application record
  - manual add / edit / delete
  - refresh-style job sync flow with last sync result
- Real job ingestion interface layer:
  - server routes at `/api/jobs/search` and `/api/jobs/refresh`
  - provider abstraction for Greenhouse / Lever
  - live provider scaffolding plus mock providers
  - China / campus oriented heuristic filtering
  - first version of a config-driven enterprise campus site ingestor
  - supports HTML list parsing and JSON list parsing through source config
  - first live Tencent campus source wired to the real `join.qq.com` campus APIs
  - Tencent source normalizes `校招 / 实习` and `中国大陆 / 中国香港` into searchable tags
  - sync results are recorded as `JobSyncRun` in frontend state
- Multi-channel provider architecture:
  - ATS providers
  - China campus platform providers
  - enterprise campus site provider framework
- Resume Profile page with structured profile editing
- Settings page with export entry points and future integration placeholders

## Project structure

```text
app/
components/
components/layout/
components/applications/
components/jobs/
components/resume/
components/dashboard/
components/providers/
features/
features/applications/
features/jobs/
features/resume/
lib/
lib/mock-data.ts
lib/types.ts
lib/utils.ts
```

## Frontend data flow

```text
Pages
  -> feature hooks
  -> app state provider
  -> lib/mock-data.ts
  -> future API layer
  -> Prisma + PostgreSQL
```

## Job ingestion flow

```text
Jobs page
  -> use-job-ingestion
  -> /api/jobs/refresh
  -> job sync service
  -> provider layer
  -> normalize + auto-tag to JobPosting shape
  -> merge into local job database
  -> record JobSyncRun
  -> future persistent storage
```

## Tag system

Each job now carries a structured tag memory layer:

- `normalizedTags`
- `regionTags`
- `roleTags`
- `programTags`

Current examples:

- `regionTags`: `中国大陆`, `中国香港`
- `roleTags`: `前端`, `后端`, `算法`, `AI`, `产品`, `设计`
- `programTags`: `校招`, `实习`, `应届实习`, `日常实习`, `青云计划`

## Live provider config

The first real-source config lives in:

- `features/jobs/providers/live-source-config.ts`

This file holds the company ATS source list for:

- Greenhouse live sources
- Lever live sources
- China / campus focused search strategy defaults
- Enterprise campus site source config slots

## Enterprise campus site ingestor

The first version of the enterprise campus site ingestor is now in place.

Core idea:

- register a campus source in config
- let the server fetch it
- parse it through a generic parser
- normalize it into the shared `JobPosting` shape

Current implementation supports:

- HTML list pages through selector-based parsing
- JSON list endpoints through path-based parsing
- driver-based campus source adapters for sources that need a custom fetch workflow

Relevant files:

- `features/jobs/providers/live-source-config.ts`
- `features/jobs/providers/china-campus-live-provider.ts`

This means future company onboarding should mostly be:

1. add a new source config
2. choose `html` or `json`
3. map title / location / summary / URL / date fields
4. test and refine selectors

For more advanced enterprise campus sites, the provider layer also supports source-specific drivers. Tencent is the first example:

- source config declares a `tencent_position_api` driver
- server fetches project mappings, search results, and job details from Tencent campus APIs
- jobs are normalized into shared `JobPosting` shape with:
  - `校招` / `实习` tags
  - `中国大陆` / `中国香港` region tags
  - direct campus job detail URLs

Important note:

- Greenhouse and Lever are not global search engines.
- They only work when we know the target company's public board token or site name.
- So this version is a "target company source list" approach, not a full China campus web crawler.

## How to connect a backend later

1. Replace reads in `components/providers/app-state-provider.tsx` with API queries.
2. Move mutations from in-memory state to route handlers or a typed client.
3. Keep `lib/types.ts` as the shared frontend contract, or evolve it into API DTOs.
4. Add repository / service modules under `features/*` or `lib/api/*` for:
   - `GET /applications`
   - `POST /applications`
   - `PATCH /applications/:id`
   - `DELETE /applications/:id`
   - equivalent endpoints for jobs and resume profile
5. Introduce Prisma models that mirror:
   - `User`
   - `ResumeProfile`
   - `Company`
   - `JobPosting`
   - `Application`
   - `SourceDocument`

## Suggested next steps

- Add persistent storage with Prisma + PostgreSQL
- Add auth and per-user data isolation
- Replace local provider with TanStack Query + API routes
- Add file upload for resume and source documents
- Expand real job sources beyond ATS boards into China campus channels
- Add sync history, ingestion logs, and dedupe review UI
- Build browser extension and OCR / AI parsing on top of the existing types
