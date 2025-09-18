## Modularity Improvement Roadmap

A phased plan to improve code quality and modularity, increase testability, and clarify boundaries between orchestration, IO, and pure logic.

### Objectives
- Thin orchestration services; extract pure helpers and infrastructure
- Replace concrete dependencies with interfaces and DI everywhere
- Isolate HTTP from domain logic; validate inputs at the edge
- Standardize logging/config; unify error taxonomy and mapping

---

### Prerequisites & Non‑Goals
- Keep behavior and outputs stable during refactors (no CSV or API breaking changes) unless explicitly called out.
- Avoid large renames/moves in a single PR; prefer incremental, reviewable edits.
- Non‑goals: new features, storage backend changes, queue introduction (covered by production roadmap), or API versioning (Phase 8 only prepares structure).

### Implementation Guidelines
- Prefer interfaces over classes in public boundaries; inject dependencies via DI tokens.
- Keep helpers pure and side‑effect free; separate orchestration from logic.
- Add/adjust unit tests alongside each extraction; preserve coverage on moved code.
- Use small PRs (≤ 400 LOC diff) with clear acceptance criteria.

### Sequencing Notes
- Phase 1 is a strict prerequisite for all other phases.
- Phase 2 (storage abstraction) can run in parallel with Phase 3 after DI cleanup.
- Phases 4–6 may proceed in parallel per file boundaries once controllers are separated.

## Phase 1 — Service Boundaries & DI Cleanup (High Impact)

Tasks
- [*] Make `ScrapingService` orchestration-only; remove HTTP/response helpers
- [*] Extract `JobQueueService` (enqueue, process, cancel, retries/backoff)
- [*] Extract `JobLifecycleService` (status, metrics aggregation, progress)
- [*] Extract `AdapterFactory` (create/detect, single cleanup responsibility)
- [*] Remove in-class defaults (`new StorageService()`, `new CsvGenerator()`); inject via DI only

Edits (indicative files)
- `src/lib/core/services/scraping-service.ts`
- `src/lib/core/services/job-queue-service.ts` (new)
- `src/lib/core/services/job-lifecycle-service.ts` (new)
- `src/lib/core/services/adapter-factory.ts` (new)

Acceptance Criteria
- `ScrapingService` contains no HTTP types and no direct `new` of infra
- Jobs can be enqueued/cancelled via `JobQueueService`; processing path uses extracted services
- Unit tests cover queue and lifecycle services in isolation
 - All existing tests pass; API surface and CSV outputs unchanged

---

## Phase 2 — Storage Abstraction & Durability

Tasks
- [*] Define `IStorageService` interface (store/get/delete/stats/clear)
- [*] Move current FS implementation to `FsStorageService`
- [*] Add `S3StorageService` with pluggable provider choice via config/DI
- [*] Update composition root to bind storage by environment

Edits
- `src/lib/infrastructure/storage/IStorageService.ts` (new)
- `src/lib/infrastructure/storage/fs-storage.service.ts` (new)
- `src/lib/infrastructure/storage/s3-storage.service.ts` (new)
- `src/lib/composition-root.ts`

Acceptance Criteria
- No module imports `storage.ts` concrete class directly
- All consumers depend on `IStorageService`
- Integration tests pass against FS; S3 impl smoke-tested
 - Backward compatibility: persisted files remain readable by FS impl

---

## Phase 3 — HTTP Controllers & Validation Separation

Tasks
- [*] Add `zod` schemas for all request bodies/params
- [*] Validate at route layer; services accept typed domain arguments
- [*] Map domain results/errors to HTTP in controllers only

Edits
- `src/app/api/**` (route handlers + validation)
- `src/lib/helpers/validation.ts` (optional shared schemas)
- Refactor service methods to return domain `Result`/types (no `ApiResponse`)

Acceptance Criteria
- Services contain no HTTP concerns or response wrappers
- Invalid requests are rejected with 400 and structured error details
- [*] OpenAPI updated to include validation/error schema alignment

---

## Phase 4 — Adapter Factory & Normalization Purity

Tasks
- [*] Introduce `AdapterFactory` to encapsulate recipe/detection logic
- [*] Ensure adapters expose `cleanup()` and are cleaned in one place
- [*] Keep `NormalizationToolkit` purely functional; no I/O or logging

Edits
- `src/lib/core/services/adapter-factory.ts` (new)
- `src/lib/core/normalization/normalization.ts` (purity pass)

Acceptance Criteria
- Adapter creation and cleanup are not duplicated across services
- Normalization functions are pure and unit-tested
 - No logging/IO inside normalization; all side effects moved to callers

---

## Phase 5 — Concurrency & Resilience Helpers

Tasks
- [*] Standardize on `pMapWithRateLimit` for batch work
- [*] Add `withRetry` helper (exponential backoff + jitter) for IO
- [*] Apply retry policy to extraction/HTTP operations

Edits
- `src/lib/helpers/concurrency.ts` (ensure coverage)
- `src/lib/helpers/retry.ts` (new)
- Call-sites in services/adapters updated to use helpers

Acceptance Criteria
- No ad-hoc `for`/`setTimeout` concurrency loops in services
- Retries configurable and covered by unit tests with fake timers
- Concurrency/retry policies passed via config/DI; no hardcoded timings in services

Configuration Notes
- Concurrency comes from recipe behavior (e.g., `behavior.maxConcurrent`) and is passed via DI.
- Rate limiting comes from recipe behavior (e.g., `behavior.rateLimit`).
- Retry policy comes from recipe behavior (e.g., `behavior.retryAttempts`, `behavior.retryDelay`).
- When an adapter provides `extractProductWithRetry`, it is preferred; otherwise a generic `withRetry` policy is applied from behavior.

---

## Phase 6 — Error Taxonomy & Mapping

Tasks
- [*] Define domain error classes/enums (e.g., `RecipeNotFound`, `ExtractionFailed`)
- [*] Services throw/return domain errors; controllers map to HTTP codes
- [*] Centralize error-to-HTTP mapping in error middleware

Edits
- `src/lib/domain/errors.ts` (new)
- `src/app/middleware/error-handler.ts` (new)
- Refactor services to stop creating `ApiResponse` error shapes

Acceptance Criteria
- Consistent error responses; tests cover mapping for common cases
- Services throw/return domain errors only; controllers map to HTTP

---

## Phase 7 — Logging & Config Standardization

Tasks
- [*] Provide `LoggerFactory` via DI; remove `pino-pretty` in prod
- [*] Add `pino-http` in server for request logs with `requestId`
- [*] Central `config` module validated by `zod` (env-only)

Edits
- `src/lib/infrastructure/logging/logger-factory.ts` (new)
- `src/lib/infrastructure/config/config.ts` (new)
- `src/lib/composition-root.ts`, `src/server.ts`

Acceptance Criteria
- No direct `new pino()` scattered; consistent JSON logs in prod
- Config access is typed/validated; no hardcoded env fallbacks in services
- Request logs include `requestId`, method, route, latency

---

## Phase 8 — OpenAPI & Versioning

Tasks
- [*] Introduce `/v1` route prefix
- [*] Document auth header, error schemas, and all responses
- [ ] Optionally derive OpenAPI from `zod` schemas

Edits
- `src/app/openapi.ts`
- Routes under `src/app/api/v1/**`

Acceptance Criteria
- OpenAPI matches runtime validation and auth requirements
- API remains backward compatible until `/v1` is formally adopted

---

## Cross-Cutting Cleanup
- [ ] Remove console debug statements from prod paths
- [ ] Increase coverage thresholds; add tests for extracted helpers/services
- [ ] Eliminate unused deps; ensure services depend on interfaces only
- [ ] Add ADRs (architecture decision records) for each major boundary

---

## Milestones
- Milestone A (P1–P2): Boundaries, DI, Storage abstraction
- Milestone B (P3–P4): Controllers+validation, Adapter/Normalization purity
- Milestone C (P5–P6): Concurrency/retry, Error taxonomy
- Milestone D (P7–P8): Logging/config, OpenAPI versioning

---

## Acceptance Checklist (Overall)
- [ ] Services are orchestration-only; no HTTP concerns
- [ ] All infra dependencies hidden behind interfaces
- [ ] Request validation at edge; domain types in services
- [ ] Standardized logging and config via DI
- [ ] Consistent error taxonomy and HTTP mapping
- [ ] Tests cover helpers/services; coverage thresholds increased
 - [ ] No externally visible behavior changes unless explicitly versioned


