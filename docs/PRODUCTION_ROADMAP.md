## Production Readiness Roadmap

This document outlines the gaps, risks, and a phased roadmap to bring the backend to production-grade quality. It is organized for actionability with clear tasks, owners, and acceptance criteria.

### Goals
- Security-first API with auth, input validation, and rate limiting
- Durable, scalable scraping via background workers and reliable storage
- Observability (logs, metrics, traces) and SLO-driven operations
- Reproducible builds, CI/CD gates, and safe rollouts

---

## 0) Current Strengths
- Express app with `helmet`, `cors`, `compression`, JSON limits, health route
- Request-scoped DI, graceful shutdown hooks
- OpenAPI spec + Swagger UI
- Scraping stack: Puppeteer, Axios, Cheerio, recipe system, CSV gen
- Quality scripts: type-check, lint, tests, mutation testing configured

---

## 1) Gaps and Risks
- Runtime/Infra
  - No containerization; Vercel serverless + headless browser is risky
  - Long-running jobs run via HTTP; no queue/worker separation
  - Storage is filesystem-based, not durable or shareable across instances
- Reliability
  - No centralized retry/backoff; no idempotency for job creation
  - Service-level concurrency/rate-limits for target-site protection are missing
  - Health lacks readiness checks for dependencies (queue, storage, browser)
- Security
  - No auth/authorization; Swagger UI open in prod; permissive CORS
  - Secrets not integrated; config not validated from env
  - CSV downloads unauthenticated by `jobId` (data exposure risk)
- Observability
  - Pretty logs in prod; no metrics or tracing; limited correlation
- Data/Compliance
  - FS storage retention ad-hoc; no S3 lifecycle or encryption
  - CSV schema not versioned; no contract tests
- Testing/Quality
  - Low coverage thresholds; workflows referenced but not present
  - Perf/load tests not integrated; Husky hooks missing
- Docs/Process
  - README links to non-existent docs; license file missing
- Dependency/Runtime hygiene
  - Unused deps; no vuln scanning in CI; no pinned Node runtime

---

## 2) Quick-Win Task List (Prioritize Now)
- Security & Validation
  - [ ] Add API key auth middleware; protect all `/api/*` routes
  - [ ] Lock down CORS to allowed origins
  - [ ] Add `express-rate-limit` with sane defaults and per-IP buckets
  - [ ] Validate all inputs with `zod` and return 400 with details
- Logging & Config
  - [ ] Use JSON logs in production (`pino` without pretty transport)
  - [ ] Introduce `dotenv` and a central `config` validated by `zod`
- Storage & Downloads
  - [ ] Abstract storage interface; implement S3 provider
  - [ ] Replace API CSV streaming with pre-signed S3 URLs
- CI/CD
  - [ ] Add GitHub Actions for PR/main with type-check, lint, tests, coverage, audit
  - [ ] Add Husky hooks: pre-commit (lint+type-check), pre-push (tests)
- Containerization
  - [ ] Add `Dockerfile` and `.dockerignore`; run locally as container

---

## 3) Phased Roadmap

### Phase 1 — Foundations (1–2 weeks)
Owner: Platform/Backend

Deliverables:
- [ ] Containerize service (Node 20 LTS, non-root user, healthcheck)
- [ ] `.dockerignore`, `docker-compose` (optional local Redis/Postgres)
- [ ] Central `config` with env validation via `zod`; `.env.example`
- [ ] API security: API key auth, tightened CORS, `express-rate-limit`
- [ ] Input validation on all routes (`zod` schemas)
- [ ] Logging: `pino` JSON in prod, `pino-http` request logs with `requestId`
- [ ] GitHub Actions: PR pipeline (type-check, lint, tests, coverage, audit)
- [ ] Husky hooks enabled and committed

Acceptance Criteria:
- Container build runs locally; `/health` OK; logs are JSON in prod
- All API endpoints require API key; invalid input returns 400 with schema errors
- CI enforces gates on PRs; hooks run on developer machines

---

### Phase 2 — Job Orchestration & Durability (2–3 weeks)
Owner: Backend

Deliverables:
- [ ] Introduce queue and worker (BullMQ + Redis)
- [ ] Convert `/api/scrape/init` to enqueue job and return `jobId`
- [ ] Add job retries/backoff/timeouts; idempotency keys for dedupe
- [ ] Storage abstraction: `IStorageService` interface
- [ ] Implement `S3StorageService` (CSV and metadata)
- [ ] Presigned S3 download links instead of proxying CSV through API
- [ ] `/ready` endpoint checks Redis/S3/DB and browser launch canary

Acceptance Criteria:
- Jobs survive API restarts; status visible via API; retries/backoff observable
- Storage is durable; downloads use time-limited presigned URLs
- Readiness reflects dependency health; deployments only route when ready

---

### Phase 3 — Observability & Performance (1–2 weeks)
Owner: Platform/Backend

Deliverables:
- [ ] Prometheus metrics endpoint (`/metrics`)
  - job counts, success/failure, durations, queue depth, scrape rate
- [ ] OpenTelemetry tracing (HTTP + scraping spans, site tags)
- [ ] Performance tests (autocannon scenarios) with thresholds and CI (nightly)
- [ ] Per-domain concurrency/rate limits with polite backoff on 429/5xx

Acceptance Criteria:
- Dashboards show SLI/SLOs; traces link API requests to worker jobs
- Perf tests meet thresholds under expected load; alerts configured

---

### Phase 4 — Security & Compliance Hardening (1–2 weeks)
Owner: Security/Platform

Deliverables:
- [ ] Secrets via platform (GitHub Envs, AWS Secrets Manager)
- [ ] S3 SSE encryption at rest; server-side encryption enforced
- [ ] Access control: per-client API keys, audit logging
- [ ] Data retention policy documented and enforced (S3 lifecycle rules)
- [ ] CSV schema versioning + contract tests

Acceptance Criteria:
- No secrets in repo or env files in prod; KMS-backed secrets
- Prescribed retention windows applied; contract tests gate schema changes

---

### Phase 5 — Testing Maturity (continuous)
Owner: Backend/QA

Deliverables:
- [ ] Raise coverage thresholds to ≥ 70% lines/branches
- [ ] Curated mutation testing set on critical modules; thresholds enforced in CI
- [ ] E2E tests against mock sites and real headless runs; flaky test mitigation
- [ ] Chaos tests for network/site failures and anti-bot responses

Acceptance Criteria:
- CI blocks on new thresholds; mutation score trends tracked
- E2E suite stable; flake rate below defined threshold

---

### Phase 6 — Deployment & Scalability (k8s) (timeboxed)
Owner: Platform

Deliverables:
- [ ] Kubernetes manifests for API and worker
- [ ] HPA, resource limits/requests, PodDisruptionBudgets
- [ ] Liveness/readiness probes; Ingress with WAF/rate limiting
- [ ] Blue/green or canary rollout with auto-rollback
- [ ] Semantic versioning and CHANGELOG; release automation

Acceptance Criteria:
- Safe rollouts with automated rollback on SLO violations
- Versioned releases with traceability and audit logs

---

## 4) Code-Level Changes (high priority summary)
- `server.ts`
  - Add auth middleware, `rateLimit`, and `zod` validation on all endpoints
  - Remove console debug logs; ensure prod JSON logs
- `src/lib/infrastructure/storage/` 
  - Extract `IStorageService`; implement `S3StorageService`; deprecate FS for prod
- `src/app/openapi.ts`
  - Document auth (header), detailed schemas, error formats; introduce `/v1`
- `src/lib/composition-root.ts`
  - Inject validated config; stop hardcoded `recipesDir` and log level
- `package.json`
  - Increase `coverageThreshold`; add `audit` script; pin Node in `engines`

---

## 5) New Files to Add
- CI/CD: `.github/workflows/pr.yml`, `.github/workflows/main.yml`
- Code quality: `.eslintrc.cjs`, `.prettierrc`, `.nvmrc`
- Legal/docs: `LICENSE`, `CHANGELOG.md`, `docs/deployment.md`, `docs/api.md`, `docs/recipes.md`, `docs/contributing.md`
- Runtime: `Dockerfile`, `.dockerignore`, `docker-compose.yml` (optional)

---

## 6) Decision: Serverless vs Containers for Headless Browser
- If serverless:
  - Use Playwright serverless-compatible bundle or `chrome-aws-lambda`
  - Monitor cold starts and memory/time limits; prefer short jobs with queue handoff
- If containers:
  - Use official Playwright image; set resource limits; scale workers horizontally

Recommendation: Containers + queue for long-running, resource-heavy scraping.

---

## 7) Milestones & Tracking
- Milestone A (Foundations): containerization, config+auth+validation, CI, logging
- Milestone B (Durability): queue/worker, S3 storage, readiness
- Milestone C (Observability): metrics, tracing, perf tests
- Milestone D (Security/Compliance): secrets, encryption, retention, contract tests
- Milestone E (Testing Maturity): coverage thresholds, mutation, E2E, chaos
- Milestone F (Scalability): k8s deployment and safe rollouts

---

## 8) Acceptance Checks (Overall)
- [ ] All endpoints authenticated and validated
- [ ] Jobs run in workers; API is stateless
- [ ] Durable storage with presigned downloads and retention
- [ ] Observability in place (logs/metrics/traces) with SLOs
- [ ] CI/CD gates enforce quality and security
- [ ] Repeatable deployments with safe rollouts


