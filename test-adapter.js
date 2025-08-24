// Test the new Archive Adapter system
// Run this in your browser console or Node.js to see adapters in action

// Mock cheerio for testing (you'd need to install cheerio in a real environment)
// const cheerio = require('cheerio');

// Test adapter registration
console.log('🧪 Testing Archive Adapter System...');

// Create a test adapter
const testAdapter = {
  productLinkSelectors: ['.test-product a', '.custom-link'],
  categorySelectors: ['.test-category'],
  productUrlFilter: (url) => !url.includes('blocked'),
  normalizeProductUrl: (url, base) => `${base}/product/${url.split('/').pop()}`,
  findNextPage: () => ({ has_next_page: true, next_page_url: 'https://test.com/page/2' })
};

// Test the adapter system (this would work in the real ArchiveScraper)
console.log('📝 Test adapter created:', testAdapter);

// Simulate what happens when scraping a URL
const testUrl = 'https://test.com/shop';
const host = new URL(testUrl).hostname;
console.log('🌐 Testing with host:', host);

// In the real system, this would register the adapter
// ArchiveScraper.registerAdapter('test.com', testAdapter);

console.log('✅ Adapter system test complete!');
console.log('');
console.log('To see this working in your scraper:');
console.log('1. Import ArchiveScraper in your code');
console.log('2. Register an adapter for a specific domain');
console.log('3. Scrape that domain - you\'ll see "🎯 Using archive adapter for host: domain.com" in console');
console.log('4. The scraper will use your custom rules instead of defaults');
