# Web Scraper Performance Optimization Guide

## Overview

This guide outlines the performance optimizations implemented to make the web scraping process significantly faster.

## Key Performance Improvements

### 1. Enhanced Concurrency

- **Increased default concurrent workers**: From 5 to 10 (configurable up to 20)
- **Batch processing**: Products are processed in optimized batches
- **Dynamic rate limiting**: Delays are adjusted based on batch performance

### 2. Reduced Delays

- **Ultra-fast rate limiting**: Reduced from 1000ms to 10-50ms between requests
- **Smart delays**: Only apply delays between batches, not individual products
- **Dynamic timing**: Faster batches get reduced delays

### 3. HTTP Client Optimizations

- **Connection pooling**: Keep-alive connections with increased socket limits
- **Reduced timeouts**: From 30s to 15s for faster failure detection
- **HTTP/2 support**: Better performance for modern servers
- **Resource blocking**: Skip unnecessary resources (fonts, media, analytics)

### 4. Puppeteer Optimizations

- **Faster page loading**: Changed from 'networkidle2' to 'domcontentloaded'
- **Reduced wait times**: Timeouts reduced from 10s to 5s
- **Resource blocking**: Block CSS, images, and non-essential scripts
- **Browser flags**: Disable unnecessary browser features

### 5. Fast Mode

- **Skip heavy processing**: Attributes and variations skipped in fast mode
- **Limited data**: Description truncated, images limited to 3
- **Minimal validation**: Reduced validation rules for speed

## Recipe Configuration

### Performance-Optimized Recipe

Use the new `performance-optimized.yaml` recipe for maximum speed:

```yaml
behavior:
  rateLimit: 10 # 10ms between requests
  maxConcurrent: 20 # 20 concurrent workers
  fastMode: true # Enable fast mode
  skipStyles: true # Skip CSS processing
  skipScripts: true # Skip JavaScript processing
  timeout: 8000 # 8 second timeout
```

### Custom Recipe Optimization

Add these settings to any recipe for better performance:

```yaml
behavior:
  rateLimit: 25 # 25ms between requests
  maxConcurrent: 15 # 15 concurrent workers
  fastMode: true # Enable fast mode
  timeout: 10000 # 10 second timeout
```

## Performance Monitoring

### Real-time Metrics

- `/api/scrape/performance/live` - Live performance data
- `/api/scrape/performance/recommendations` - Performance suggestions

### Key Metrics to Monitor

- **Products per second**: Target >2 products/second
- **Average processing time**: Target <500ms per product
- **Concurrent workers**: Optimal 10-20 workers
- **Rate limiting**: Balance between speed and server load

## Best Practices

### 1. Choose the Right Recipe

- **Simple sites**: Use HTTP client (faster)
- **Complex sites**: Use Puppeteer (more reliable)
- **Speed priority**: Use performance-optimized recipe

### 2. Adjust Concurrency

- **Start with 10-15 workers**
- **Monitor server response times**
- **Reduce if getting blocked/errors**

### 3. Rate Limiting

- **Conservative**: 100-200ms (avoid blocking)
- **Balanced**: 25-50ms (good performance)
- **Aggressive**: 10-25ms (maximum speed, risk of blocking)

### 4. Fast Mode Usage

- **Enable for**: High-volume scraping, simple sites
- **Disable for**: Complex sites, detailed data needed
- **Customize**: Adjust what to skip based on needs

## Troubleshooting

### Common Performance Issues

#### 1. High Memory Usage

- Reduce `maxConcurrent` workers
- Enable `fastMode`
- Skip heavy data extraction

#### 2. Slow Processing

- Increase `maxConcurrent` workers
- Reduce `rateLimit` delays
- Use HTTP client instead of Puppeteer

#### 3. Getting Blocked

- Increase `rateLimit` delays
- Reduce `maxConcurrent` workers
- Rotate user agents (already implemented)

#### 4. Timeout Errors

- Increase `timeout` values
- Check network connectivity
- Verify site accessibility

## Expected Performance Improvements

### Before Optimization

- **Rate limit**: 1000ms (1 second between requests)
- **Concurrency**: 3-5 workers
- **Performance**: ~0.5-1 products/second

### After Optimization

- **Rate limit**: 10-50ms (0.01-0.05 seconds between requests)
- **Concurrency**: 10-20 workers
- **Performance**: ~5-20 products/second

### Performance Gain

- **Speed improvement**: 5-40x faster
- **Efficiency gain**: 80-95% reduction in total time
- **Resource optimization**: Better CPU and memory usage

## Advanced Optimizations

### 1. Custom Selectors

Optimize selectors for your specific site:

```yaml
selectors:
  title: ['.specific-title-class'] # Use specific, fast selectors
  price: ['.price-value'] # Avoid complex CSS selectors
```

### 2. Resource Blocking

Block unnecessary resources in Puppeteer:

```typescript
// Block analytics, fonts, images for speed
if (['font', 'media', 'stylesheet', 'image'].includes(type)) {
  return req.abort();
}
```

### 3. Batch Size Optimization

Adjust batch sizes based on site performance:

```typescript
const batchSize = Math.min(maxConcurrent, 10); // Cap at 10 for stability
```

## Monitoring and Maintenance

### Regular Performance Checks

1. Monitor `/api/scrape/performance/live` endpoint
2. Check memory and CPU usage
3. Review error rates and timeouts
4. Adjust settings based on performance data

### Performance Tuning

1. Start with conservative settings
2. Gradually increase concurrency
3. Monitor for errors or blocking
4. Find optimal balance for your use case

## Conclusion

These optimizations should provide a 5-40x performance improvement depending on your specific use case. Start with the performance-optimized recipe and adjust settings based on your needs and site characteristics.

Remember: **Faster scraping = Higher risk of being blocked**. Monitor your scraping jobs and adjust settings accordingly.
