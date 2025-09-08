## Modular Refactor and Variation/CSV Fix Plan

### Overview
This plan improves modularity, testability, and maintainability first, then fixes variation detection and WooCommerce CSV generation. It includes validation steps using known variable product pages:
- Variable product (Samba): [Samba product](https://shukrehut.co.il/he/%D7%9B%D7%99%D7%A1%D7%90%D7%95%D7%AA/%D7%9B%D7%99%D7%A1%D7%90-%D7%9C%D7%9E%D7%A9%D7%A8%D7%93-samba)
- Archive (scrape 2–3 items): [Chairs archive](https://shukrehut.co.il/he/%D7%9B%D7%99%D7%A1%D7%90%D7%95%D7%AA)

---

## Phase 1 — Baseline & Guardrails
- Goals
  - Lock current behavior, add observability, and define success criteria.
- Tasks
  - Add debug logs (toggled via `SCRAPER_DEBUG=1`) in: `detectProductType`, `collectVariations`, `normalizeAttributes`, `aggregateAttributesAcrossProducts`, `buildParentHeaders`.
  - Add runtime checks: warn if attribute keys lack `pa_` or contain spaces.
  - Add fixtures: `fixtures/shuk-rehut/samba.html` and 1–2 variable products from the archive.
- Deliverables
  - `docs/DEBUGGING.md` (how to enable logs, interpret outputs).
- Acceptance
  - Running on Samba shows variations > 0 and normalized `pa_*` keys in logs.

## Phase 2 — Extract Helpers (Modularity Foundation)
- Goals
  - Decouple DOM parsing and transformations from orchestration.
- New modules
  - `dom/collectRadioGroups(root)`, `dom/extractLabelText(el)`, `dom/getAttributeNameFor(el, scope?)`
  - `attrs/ensurePaPrefixed(name)`, `attrs/normalizeAttrKey(name)`, `attrs/isPlaceholderValue(text)`
  - `variations/buildVariationSku(base, token)`, `variations/createAssignments(name, value)`, `variations/mergeVariationSources(...lists)`, `variations/dedupeBySku(list)`
  - `csv/aggregateAttributesAcrossProducts(products)`, `csv/buildParentHeaders(attrKeys)`, `csv/formatAttributeDataFlags(position, visible, isTaxonomy, inVariations)`
- Acceptance
  - Unit tests for each helper (radio/select extraction, Hebrew labels, key normalization, headers).

## Phase 3 — Normalize Attribute Keys Everywhere
- Goals
  - Eliminate mixed keys (`צבע` vs `pa_צבע`) and numeric leakage.
- Tasks
  - Replace all direct `attributeAssignments` with `createAssignments(normalizeAttrKey(name), textValue)`.
  - Ensure select path uses option text, not numeric `value`.
  - Defensive normalization pass on collected variations.
- Acceptance
  - Logs show only `pa_*` keys in final aggregated attributes.

## Phase 4 — Batch‑Wide Attribute Union & Parent CSV
- Goals
  - Parent CSV includes all attributes discovered across the entire batch.
- Tasks
  - Implement `aggregateAttributesAcrossProducts` (union over `product.attributes` and each variation’s `attributeAssignments`).
  - Build dynamic headers: `attribute:<pa_name>`, `attribute_data:<pa_name>`, `attribute_default:<pa_name>`.
  - Row rules:
    - `attribute:<pa_name>` = pipe-joined values.
    - `attribute_data:<pa_name>` = `position|visible|is_taxonomy|in_variations` (e.g., `0|1|1|1`).
    - `attribute_default:<pa_name>` = single value if only one exists, else empty.
- Acceptance
  - Mixed batch (color/size/material across products) yields all relevant parent attribute columns; empty cells for products without that attribute.

## Phase 5 — Variation CSV Correctness
- Goals
  - Match WooCommerce meta attribute conventions and preserve Hebrew.
- Tasks
  - Emit `meta:attribute_<pa_name>` columns for each variation attribute.
  - Stable SKU generation + deduping (`buildVariationSku` + `dedupeBySku`).
- Acceptance
  - Columns like `meta:attribute_pa_צבע`, `meta:attribute_pa_מידה` contain correct Hebrew values.

## Phase 6 — Recipe Hardening for Shuk Rehut
- Goals
  - Robust detection across radio/select templates and form scopes.
- Tasks
  - In `recipes/shuk-rehut-furniture.yaml`:
    - Scope to `.options_group` / form; include known `#input-option386` when present.
    - Provide prioritized selectors for radio and select.
    - Add `waitForSelectors` for `.options_group` and option containers.
- Acceptance
  - Samba consistently produces variations; archive scrape (max 3) finds at least one variable product.

## Phase 7 — Integration Tests & CLI Harness
- Goals
  - Deterministic end‑to‑end verification.
- Tasks
  - Add `scripts/smoke-scrape.ts`:
    - `--url <product>` or `--archive <url> --max 3`, `--recipe "Shuk Rehut Furniture"`.
    - Save CSVs to `./output/`.
    - Assertions:
      - If any variation present, parent CSV must include `attribute:pa_` columns.
      - Headers include union of attributes across the batch.
- Acceptance
  - CI runs smoke tests against fixtures and passes on every commit.

## Phase 8 — Performance & Resilience
- Goals
  - Keep scraping stable and fast.
- Tasks
  - Tighten selectors; prefer scoping inside `.options_group`.
  - Retry element discovery with capped backoff.
  - Cache label lookups per control.

## Phase 9 — Documentation & DX
- Goals
  - Easier evolution and debugging.
- Tasks
  - Cross‑link `docs/woocommerce_csv_spec.md` from code.
  - `docs/recipes/shuk-rehut.md` with selectors and known patterns.
  - `CONTRIBUTING.md` covering tests, smoke runs, and fixture updates.

## Phase 10 — Rollout
- Goals
  - Ship safely, verify, then enable by default.
- Tasks
  - Feature‑flag batch‑wide union + normalized keys.
  - Validate on:
    - Samba product page.
    - Archive sample (3 items).
  - If CSVs look correct, enable flag by default.

---

## Immediate Fixes (Execute First)
- Apply `normalizeAttrKey()` at all assignment points and again before CSV aggregation.
- Ensure select paths use human‑readable option text, not numeric values.
- Aggregate attributes across the whole batch to produce parent headers for all discovered `pa_*` attributes.

## Validation Steps
- Run scraper on:
  - Samba product: [link](https://shukrehut.co.il/he/%D7%9B%D7%99%D7%A1%D7%90%D7%95%D7%AA/%D7%9B%D7%99%D7%A1%D7%90-%D7%9C%D7%9E%D7%A9%D7%A8%D7%93-samba)
  - Archive (max 3): [link](https://shukrehut.co.il/he/%D7%9B%D7%99%D7%A1%D7%90%D7%95%D7%AA)
- Expect:
  - Variation CSV: `meta:attribute_pa_צבע`, `meta:attribute_pa_מידה`, …
  - Parent CSV headers include union: `attribute:pa_צבע`, `attribute:pa_מידה`, `attribute_data:*`, `attribute_default:*`.

## Risks
- DOM variability between products (different label containers).
- Unicode/RTL handling (add UTF‑8 BOM if needed for Excel).
- Over‑broad selectors causing timeouts (keep scopes tight).
