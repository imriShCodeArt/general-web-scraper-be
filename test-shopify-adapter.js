// Test the new Shopify Product Adapter for wash-and-dry.eu
// This shows how the adapter system handles both archive and product pages

console.log('🧪 Testing Shopify Product Adapter System...');

// Test URLs
const archiveUrl = 'https://wash-and-dry.eu/collections/bestseller';
const productUrl = 'https://wash-and-dry.eu/collections/bestseller/products/monocolour-cool-grey';

console.log('🌐 Archive URL:', archiveUrl);
console.log('🛍️ Product URL:', productUrl);

console.log('');
console.log('🎯 What the new adapters do:');
console.log('');
console.log('📋 ARCHIVE ADAPTER (wash-and-dry.eu):');
console.log('1. Detects Shopify site structure');
console.log('2. Uses custom selectors: a[href*="/products/"]');
console.log('3. Filters out non-product links');
console.log('4. Handles Shopify pagination');
console.log('5. Cleans tracking parameters from URLs');
console.log('');
console.log('🛍️ PRODUCT ADAPTER (wash-and-dry.eu):');
console.log('1. Detects variable products by size selector');
console.log('2. Extracts variations from size options:');
console.log('   - 35x75cm - €25,95');
console.log('   - 35x120cm - €40,95');
console.log('   - 40x60cm - €23,50');
console.log('   - etc.');
console.log('3. Creates proper Variation objects with:');
console.log('   - Size attribute in meta');
console.log('   - Individual pricing');
console.log('   - Unique SKUs');
console.log('4. Extracts Shopify-specific images and prices');

console.log('');
console.log('📝 To test this:');
console.log('1. Open your scraper app');
console.log('2. Enter the archive URL: https://wash-and-dry.eu/collections/bestseller');
console.log('3. Start scraping');
console.log('4. Check console for:');
console.log('   - "🎯 Using archive adapter for host: wash-and-dry.eu"');
console.log('   - "🎯 Using product scraper adapter for host: wash-and-dry.eu"');
console.log('   - "Found Shopify size selector, extracting variations..."');
console.log('   - "Extracted Shopify variation: 35x75cm - €25.95"');
console.log('');
console.log('💡 The adapters automatically:');
console.log('- Switch between WooCommerce and Shopify rules');
console.log('- Handle non-standard HTML structures');
console.log('- Extract variations that default scraper would miss');
console.log('- Maintain compatibility with existing sites');
