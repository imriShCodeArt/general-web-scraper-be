// Test the wash-and-dry.eu adapter
// This shows how the new adapter system handles non-standard websites

console.log('🧪 Testing wash-and-dry.eu Adapter...');

// Simulate what happens when scraping wash-and-dry.eu
const testUrl = 'https://wash-and-dry.eu/collections/bestseller';
const host = new URL(testUrl).hostname;

console.log('🌐 Testing with host:', host);
console.log('📋 This site uses Shopify (not WooCommerce)');
console.log('🔍 Default selectors would fail: .woocommerce ul.products li.product');
console.log('✅ Custom adapter will use: a[href*="/products/"]');

console.log('');
console.log('🎯 What the adapter does:');
console.log('1. Detects wash-and-dry.eu host');
console.log('2. Uses custom product link selectors for Shopify');
console.log('3. Filters URLs to only include /products/ links');
console.log('4. Cleans up tracking parameters');
console.log('5. Handles Shopify pagination patterns');

console.log('');
console.log('📝 To test this:');
console.log('1. Open your scraper app');
console.log('2. Enter: https://wash-and-dry.eu/collections/bestseller');
console.log('3. Start scraping');
console.log('4. Check console for: "🎯 Using archive adapter for host: wash-and-dry.eu"');
console.log('5. The scraper should now find product URLs successfully!');

console.log('');
console.log('💡 The adapter automatically handles:');
console.log('- Non-standard HTML structure');
console.log('- Shopify-specific URL patterns');
console.log('- Custom pagination');
console.log('- URL cleaning and normalization');
