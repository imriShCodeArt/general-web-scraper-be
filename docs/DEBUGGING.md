# Debugging Guide

Enable verbose scraper debug logs and guardrails.

## Enable Debug Logs

Set one of the following environment variables before running the server/CLI:

- `SCRAPER_DEBUG=1` (preferred)
- `DEBUG=1` (compat)

Effects:
- Activates `infrastructure/logging/logger.ts` debug output
- Sets `pino` log level to `debug` in `server.ts` and `scraping-service.ts`
- Enables additional runtime guardrail warnings for attribute keys
- Wires Phase 2 helpers for observability (no behavior change):
  - `helpers/dom.ts`: radio group discovery, label extraction, nearby label name
  - `helpers/attrs.ts`: attribute key normalization and placeholder detection
  - `helpers/variations.ts`: SKU utilities and variation list merging/deduping
  - `helpers/csv.ts`: attribute union and header helpers

## What You’ll See

- Normalization:
  - Calls to `normalizeProduct`, `detectProductType`, `normalizeAttributes`
  - Placeholder detection events
- CSV Generation:
  - Aggregated attributes, dynamic headers, variation rows count
  - Warnings when attribute keys lack `pa_` or contain spaces
- Adapters:
  - DOM engine used (JSDOM/Puppeteer)

## Quick Start

1. `SCRAPER_DEBUG=1 npm run dev`
2. Scrape using API or CLI
3. Inspect logs for:
   - Product type variable/simple
   - `finalAggregatedAttributes` keys
   - `meta:attribute_...` headers
   - BaseAdapter: radio groups, name resolution (`selector vs helper`), option label vs text

## Notes

- If Excel mangles Hebrew, export with UTF‑8 BOM.
- Keep selectors scoped (e.g., `.options_group`) to reduce timeouts.


