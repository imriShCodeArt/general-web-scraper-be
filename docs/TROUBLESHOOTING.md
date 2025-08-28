# Troubleshooting Guide

## Common Issues

- Job not created (400): Ensure `siteUrl` and `recipe` are provided.
- Empty variation CSV (404): The site may not have variations; check selectors.
- Recipe not found (404): Verify the recipe name or add the YAML file.
- Timeouts: Reduce `options.maxPages` or increase timeouts.

## Debugging Tips

- Check `/api/scrape/status/{jobId}` for progress.
- Use `/api/storage/job/{jobId}` to inspect stored results.
- Enable logs and inspect server console output.

## Performance

- Use `/api/scrape/performance` for metrics and `/api/scrape/performance/recommendations` for guidance.
- Limit concurrent pages and requests in options where possible.

