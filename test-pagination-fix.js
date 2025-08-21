// Test script showing the pagination and product detection fixes for wash-and-dry.eu

console.log('🔧 Updated wash-and-dry.eu Adapters - Pagination & Product Detection Fix');
console.log('');

console.log('🎯 Issues Fixed:');
console.log('1. ❌ Only found 10 products (should find all products across pages)');
console.log('2. ❌ Only 2 products had variations (should detect more)');
console.log('3. ❌ Pagination not working (German "Weiter" vs English "Next")');
console.log('');

console.log('🛠️ ARCHIVE ADAPTER IMPROVEMENTS:');
console.log('');
console.log('📋 Enhanced Product Detection:');
console.log('- Added custom extractProductUrls() method');
console.log('- Tries multiple selectors:');
console.log('  • .product-grid a[href*="/products/"]');
console.log('  • .collection-grid a[href*="/products/"]');
console.log('  • a[href*="/products/"]:not([href*="add-to-cart"])');
console.log('  • .product-item a[href*="/products/"]');
console.log('  • h2 a[href*="/products/"] (product titles)');
console.log('  • a[href*="/collections/bestseller/products/"] (collection-specific)');
console.log('- Logs how many links each selector finds');
console.log('- Deduplicates URLs automatically');
console.log('');

console.log('🔗 Fixed Pagination Detection:');
console.log('- Now detects German "Weiter" button');
console.log('- Multiple fallback strategies:');
console.log('  • a[rel="next"] (standard)');
console.log('  • .pagination a:contains("Weiter") (German)');
console.log('  • .pagination a:contains("Next") (English)');
console.log('  • .pagination a[href*="page="] (generic)');
console.log('- Manual URL construction if needed');
console.log('- Detailed logging for debugging');
console.log('');

console.log('🛍️ PRODUCT ADAPTER IMPROVEMENTS:');
console.log('');
console.log('📏 Better Variation Detection:');
console.log('- More comprehensive size selectors');
console.log('- Debug logging for all select elements');
console.log('- Better placeholder filtering');
console.log('- Enhanced price/image extraction');
console.log('');

console.log('📊 Expected Results After Fix:');
console.log('');
console.log('🌐 Collection Page (https://wash-and-dry.eu/collections/bestseller):');
console.log('- Should find ALL products on page 1 (not just 10)');
console.log('- Should detect pagination and continue to page 2');
console.log('- Should process "Weiter" button correctly');
console.log('- Console output:');
console.log('  "Found X links with selector: h2 a[href*="/products/"]"');
console.log('  "✅ Total unique product URLs found: XX"');
console.log('  "✅ Found next page using selector: a:contains("Weiter")"');
console.log('');

console.log('🛍️ Product Pages:');
console.log('- More products should show as variable (with size options)');
console.log('- Better variation extraction for Shopify size selectors');
console.log('- Console output:');
console.log('  "🎯 Using product scraper adapter for host: wash-and-dry.eu"');
console.log('  "Found Shopify size selector, extracting variations..."');
console.log('  "✅ Extracted Shopify variation: 35x75 - €25.95"');
console.log('');

console.log('🚀 To Test:');
console.log('1. Open your scraper app');
console.log('2. Enter: https://wash-and-dry.eu/collections/bestseller');
console.log('3. Start scraping');
console.log('4. Watch console for:');
console.log('   - More product URLs found per page');
console.log('   - Successful pagination detection');
console.log('   - More products with variations');
console.log('');

console.log('💡 If you still see issues:');
console.log('- Check console for detailed debug output');
console.log('- Look for "Found X links with selector:" messages');
console.log('- Check if pagination detection logs appear');
console.log('- Share the console output for further debugging');
