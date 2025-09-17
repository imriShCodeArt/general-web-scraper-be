# Usage Examples

## Start a scraping job

```bash
curl -X POST http://localhost:3000/api/scrape/init \
  -H "Content-Type: application/json" \
  -d '{
    "siteUrl": "https://example.com",
    "recipe": "generic-ecommerce",
    "options": { "maxPages": 2 }
  }'
```

## Check job status

```bash
curl http://localhost:3000/api/scrape/status/<jobId>
```

## Download CSV

```bash
# Parent products
curl -L -o parent.csv http://localhost:3000/api/scrape/download/<jobId>/parent

# Variation products
curl -L -o variation.csv http://localhost:3000/api/scrape/download/<jobId>/variation
```

## List recipes

```bash
curl http://localhost:3000/api/recipes/list
```

## Find recipe by site URL

```bash
curl "http://localhost:3000/api/recipes/getBySite?siteUrl=https://example.com"
```

## Validate a recipe

```bash
curl -X POST http://localhost:3000/api/recipes/validate \
  -H "Content-Type: application/json" \
  -d '{ "recipeName": "generic-ecommerce" }'
```

