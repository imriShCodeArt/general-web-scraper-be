# Web‑Scraper Characterization (products → normalized → CSVs)

## 1) Goals
- **Universal**: Adaptable to any retail/catalog site (multi‑language incl. Hebrew, RTL).
- **Deterministic outputs**: Always emit WooCommerce‑compatible CSVs (Parent + Variation) with correct linking and attributes.
- **Robust**: Survive messy markup, percent‑encoding, HTML entities, odd dimension formats, duplicate/placeholder options.
- **Performant**: Batch, parallel generation, memory‑safe storage and cleanup.

## 2) High‑level Pipeline
1) **Discovery**: find product URLs via sitemap, site search, pagination, category trees, or internal JSON APIs.  
2) **Extraction**: per‑site adapters (“recipes”) parse HTML/JSON for: core fields, pricing, stock, images, attributes, and variations.  
3) **Normalization**: decode/clean text, normalize attributes (incl. Hebrew‑safe logic), transform dimensions, remove placeholders.  
4) **Product Typing**: auto‑detect simple vs variable products.  
5) **CSV Mapping**: map to Parent/Variation schemas and link variations by parent SKU with correct attribute syntax.  
6) **Storage & Delivery**: buffer CSVs, persist (fs + in‑mem), generate smart filenames, expose download endpoint.

## 3) Core Data Model (Normalized Product)
- `title`, `slug`, `description`, `shortDescription`
- `sku` (required), `stockStatus` (`instock`/`outofstock`)
- `images[]` (absolute URLs)
- `category` (best guess; fallback = “Uncategorized”)
- `productType` (`simple` | `variable`) auto‑detected from presence of `variations[]`  
- `attributes: Record<name, string[]>` (e.g., Color, Size) — normalized names + cleaned values
- `variations[]`: each has `sku`, `regularPrice`, `taxClass`, `stockStatus`, `images[]`, and attribute assignments

## 4) Adaptability Strategy (works on “any” site)

### 4.1 Adapter/Recipe system
- **Site Adapter Interface** (per domain):
  - `discoverProducts(): AsyncIterable<string>` (URLs)
  - `extractProduct(url): RawProduct` (HTML/JSON selectors, fallbacks)
- **Config‑first**: YAML/JSON recipes declare selectors for title, price, images, stock, attribute rows, variation tables; plus regex transforms for edge cases.
- **Multi‑extractor support**: CSS selectors, XPath, embedded JSON (e.g., `application/ld+json`, `__NEXT_DATA__`), REST/GraphQL hints, and paging patterns.

### 4.2 Normalization Toolkit (shared)
- **Text decoding**: repeatable percent‑decode (+ → space) + HTML entities.
- **Attribute name cleanup**: strip `pa_`/`attribute_`, decode percent‑encoded keys, Hebrew preserved as‑is, Latin capitalized.
- **Dimension heuristics**: split “140140” → “140*140”, etc.
- **Placeholder filtering**: remove “בחר אפשרות/בחירת אפשרות/Select option”.

### 4.3 Variation detection & binding
- If any attribute matrix or option rows detected → `variable`, else `simple`.
- **WooCommerce linking**: parent row carries attributes; each variation row repeats meta attribute assignments; variations link via `parent_sku`.

## 5) CSV Mapping Rules (authoritative)
- **Parent (products) CSV**:  
  `ID, post_title, post_name, post_status, post_content, post_excerpt, post_parent, menu_order, post_type, sku, stock_status, images, tax:product_type, tax:product_cat, description, attribute:Color, attribute_data:Color, attribute:Size, attribute_data:Size`  
  - Attribute syntax: `attribute:Name = "Red | Blue"` and `attribute_data:Name = "1 | 1"` (visible flags).

- **Variation CSV**:  
  `ID, post_type, post_status, parent_sku, post_title, post_name, post_content, post_excerpt, menu_order, sku, stock_status, regular_price, tax_class, images, meta:attribute_Color, meta:attribute_Size`

- **Import order**: Parent first, then Variations.

## 6) Quality & Reliability
- **Validation**: strip placeholders, ensure attribute consistency, guarantee required fields present; default category if none.
- **Error handling**: continue on partial failures; log per product; keep partial CSVs.
- **Performance**: generate Parent/Variation CSVs in parallel; buffer‑based; automatic cleanup of stale jobs.
- **I18N/RTL**: UTF‑8 end‑to‑end; Hebrew preserved; filename encoding for downloads.

## 7) Storage & Delivery (operational)
- **Dual storage**: in‑memory map + filesystem JSON with base64 CSV payloads; job metadata (count, slugs) for filenames.
- **Smart filenames**: derive from top categories or archive title; sanitize (Hebrew‑safe).
- **Download API**: `GET /api/scrape/download/[jobId]/(parent|variation)` with proper headers and UTF‑8 filename handling.

## 8) Extensibility & Ops
- **New site onboarding**: add a recipe (selectors + transforms), minimal code.  
- **Feature flags**: enable/disable enrichment steps (e.g., title cleanup, dimension parsing).  
- **CLI + API**: run headless (cron) or on‑demand with a job queue.  
- **Observability**: per‑job logs, CSV byte sizes, product counts, and storage verification.

## 9) MVP vs. Next Iterations
**MVP**
- Adapters: CSS/JSON + pagination
- Normalizers: decode, attribute cleanup, placeholders, dimension heuristics
- Variation typing & CSV generation (parallel)  
- Dual storage + Download API

**Later**
- Anti‑bot mitigation (rotating proxies, headless browser)
- Tax/VAT inference by locale; richer category mapping
- Media de‑duplication, image re‑hosting
- Duplicate product detection across runs
- LLM‑assisted fallback parsing (only when selectors fail), with strict “no hallucination” gates
