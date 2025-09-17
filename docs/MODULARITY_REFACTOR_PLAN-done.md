## Modularity and Testability Refactor Plan

This plan breaks down helper extraction and decoupling work into focused phases. Each phase lists goals, concrete edits, suggested helper modules, and acceptance criteria.

---

### Phase 1 — Establish Core Helper Modules and Conventions

- **Goals**
  - Create foundational helper modules with clear boundaries, pure functions, and unit tests.
  - Avoid behavioral changes; only move logic out of large classes.

- **New/expanded helper modules**
  - `src/lib/helpers/dom.ts`: DOM selection utilities
    - `selectText(dom, selector)`
    - `selectAllText(dom, selector)`
    - `selectAttr(dom, selector, attr)`
    - `extractWithFallbacks(dom, primary, fallbacks)`
  - `src/lib/helpers/transforms.ts`
    - `parseTransformSpec(spec)`
    - `applyTransforms(text, transforms[])`
  - `src/lib/helpers/url.ts`
    - `resolveUrl(baseUrl, relative)`
    - `normalizeUrl(url)`
    - `isInternalUrl(url, baseHost)`
  - Expand `src/lib/helpers/csv.ts`
    - Keep existing helpers and add header builders and formatters used by CSV generator.

- **Primary edits**
  - Extract transform logic from `base-adapter.ts` into `helpers/transforms.ts` and re-use.
  - Extract selection/fallback logic from `generic-adapter.ts` into `helpers/dom.ts` and re-use.
  - Replace adhoc URL handling with `helpers/url.ts` utilities.

- **Tests**
  - Unit tests for DOM fallbacks, transform parsing/apply, URL normalization.

- **Acceptance**
  - No behavior changes; unit tests cover new helpers; adapters compile using helpers.

---

### Phase 2 — CSV Generation Decomposition

- **Goals**
  - Slim `CsvGenerator` by extracting attribute union, header building, and row builders into helpers.

- **New/expanded helpers**
  - Extend `src/lib/helpers/csv.ts` with:
    - `aggregateAttributesAcrossProducts(products)`
    - `buildParentHeaders(attrKeys)` (already exists, keep and standardize)
    - `buildParentRow(product, unionKeys, aggregated)`
    - `buildVariationRows(product, unionKeys)`
    - `formatAttributeDataFlags(position, visible, isTaxonomy, inVariations)` (exists)
  - Co-locate name utilities in `src/lib/helpers/attrs.ts`:
    - `attributeDisplayName(rawKey)`
    - `cleanAttributeName(rawKey)`

- **Primary edits**
  - Refactor `src/lib/core/services/csv-generator.ts` to call new helpers for:
    - Attribute union and header assembly
    - Parent row building (including defaults)
    - Variation rows (taxonomy vs custom attribute meta columns)

- **Tests**
  - Attribute union correctness across products and variations.
  - Header and naming consistency between parent and variation CSVs.
  - Default attribute value rules.

- **Acceptance**
  - Same CSV output for existing fixtures; helper unit tests pass; generator code size reduced materially.

---

### Phase 3 — Normalization Toolkit Extraction

- **Goals**
  - Isolate normalization primitives (text cleaning, placeholders, key normalization, SKU/slug builders).

- **New/expanded helpers**
  - `src/lib/helpers/text.ts`: `cleanText`, `isPlaceholder`
  - `src/lib/helpers/attrs.ts`: `normalizeAttrKey`, `normalizeAttributes(map)`, `mergeAttributeAssignments(a, b)`
  - `src/lib/helpers/sku.ts`: `generateSku(url)`, `buildVariationSku(parentSku, assignments)`

- **Primary edits**
  - Update `src/lib/core/normalization/normalization.ts` to delegate to helpers, keeping orchestration and logging.
  - Ensure feature flags are passed explicitly to helpers when required.

- **Tests**
  - Hebrew/RTL-safe normalization of keys and values.
  - Deterministic SKU generation and variation SKU construction.
  - Placeholder filtering and text cleanup.

- **Acceptance**
  - No behavior change on fixtures; helpers fully unit-tested.

---

### Phase 4 — Adapter Logic Modularization

- **Goals**
  - Break up `generic-adapter.ts` responsibilities into helper calls.
  - Keep `BaseAdapter` focused on wiring and shared strategy.

- **New/expanded helpers**
  - `src/lib/helpers/dom-loader.ts`: DOM acquisition strategy
    - `getDomWithStrategy(url, options, { httpClient, puppeteerClient, useHeadless })`
  - `src/lib/helpers/parse.ts`: `parsePrice(text)`, `parseNumber(text)`, `extractStockStatus(dom, selectorOrConfig)`
  - `src/lib/helpers/json.ts`: `extractJsonFromScriptTags(dom, matchers)`, `mergeJsonProductData(a, b)`

- **Primary edits**
  - Move `getDom` from `base-adapter.ts` into `helpers/dom-loader.ts`; inject clients.
  - In `generic-adapter.ts`, use helpers for:
    - DOM selection/fallbacks
    - Pagination URL resolution and stop rules
    - Image extraction, stock mapping, attribute/variation extraction skeletons
    - Embedded JSON parsing and merge

- **Tests**
  - Pagination next-page URL resolution and max page stop.
  - JSON-in-script extraction with multiple script patterns.
  - Price/number parsing across locale variants.

- **Acceptance**
  - Adapter still passes existing tests and manual smoke scrape; code significantly slimmer with pure helper usage.

---

### Phase 5 — Concurrency and Metrics Extraction

- **Goals**
  - Decouple scheduling and metrics from `ScrapingService`.

- **New helpers**
  - `src/lib/helpers/concurrency.ts`: `pMapWithRateLimit(items, worker, { concurrency, minDelayMs })`
  - `src/lib/helpers/metrics.ts`: `aggregateMetrics(prev, batch)`, `timer()`
  - `src/lib/helpers/api.ts`: `makeApiResponse(payload, status, meta?)`
  - `src/lib/helpers/naming.ts`: `makeCsvFilenames(siteUrl, jobId, now?)`

- **Primary edits**
  - Replace inline queue/rate-limit loops in `scraping-service.ts` with `pMapWithRateLimit`.
  - Move response and filename utilities into helpers.

- **Tests**
  - Deterministic rate limiting with fake timers.
  - Metrics aggregation math.

- **Acceptance**
  - Service behavior identical; simpler to test worker functions independently.

---

### Phase 6 — Error Handling and Retry Policy Helpers

- **Goals**
  - Centralize retry/backoff logic and error mapping for consistent usage.

- **New helpers**
  - `src/lib/helpers/retry.ts`: `withRetry(fn, policy)`, `exponentialBackoff(attempt, baseMs, jitterRange)`
  - `src/lib/helpers/errors.ts`: error mappers/formatters for API/logging

- **Primary edits**
  - Replace ad-hoc retries in adapters or services with `withRetry`.

- **Tests**
  - Backoff sequence bounds and jitter.
  - Max attempts and error propagation.

- **Acceptance**
  - Stable behavior; clearer configuration of resilience policies.

---

### Phase 7 — Recipe Management Hardening

- **Goals**
  - Isolate recipe selection/validation and add schema validation.

- **New/expanded helpers**
  - `src/lib/helpers/recipe-schema.ts`: Zod/Yup schema definitions for `RecipeConfig`
  - Utilities in `RecipeManager` extracted:
    - `validateSiteUrl(expected, actual)`
    - `buildAdapterCacheKey(recipeName, siteUrl)`

- **Primary edits**
  - Validate recipes on load; provide clear diagnostics.

- **Tests**
  - URL validation edge cases; schema failures with helpful messages.

- **Acceptance**
  - Misconfigured recipes fail fast with actionable errors.

---

### Rollout Strategy

- Start with Phases 1–2 (low-risk, high-payoff), then 3–4 (core logic), then 5–7.
- Keep PRs small and focused per phase; ensure parity with fixtures/coverage.
- Favor dependency injection for IO (CSV writer, HTTP/Puppeteer, DOM loader) to keep helpers pure.

---

### Testing Matrix (unit-first)

- DOM helpers: fallbacks, attribute/text extraction
- Transforms: spec parsing and application
- URL: resolve/normalize/internal checks
- CSV: attribute union, headers, defaults, variation meta naming
- Normalization: key/value cleaning, SKU/slug determinism
- Concurrency: spacing and concurrency limits
- Retry: backoff and jitter bounds


