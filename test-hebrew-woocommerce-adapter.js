// Test script showing the new Hebrew WooCommerce adapter for modanbags.co.il
// This addresses the pagination issue with Hebrew sites using "Show More" buttons

console.log('🔧 Hebrew WooCommerce Adapter for modanbags.co.il');
console.log('');

console.log('🎯 The Problem:');
console.log('- Site: https://modanbags.co.il/product-category/...');
console.log('- Language: Hebrew (RTL)');
console.log('- Pagination: Uses "הצג עוד" (Show More) button instead of traditional pagination');
console.log('- Current scraper fails to handle this pattern');
console.log('');

console.log('🛠️ The Solution:');
console.log('');

console.log('📋 New modanbags.co.il Adapter Features:');
console.log('');

console.log('1. Hebrew-Aware Product Detection:');
console.log('   - WooCommerce selectors: .woocommerce ul.products li.product a[href*="/product/"]');
console.log('   - Hebrew product category support: a[href*="/product-category/"]');
console.log('   - Filters out add-to-cart and cart links');
console.log('');

console.log('2. Hebrew Pagination Detection:');
console.log('   - Primary: a:contains("הצג עוד") (Hebrew "Show More")');
console.log('   - Secondary: button:contains("הצג עוד") (Hebrew button)');
console.log('   - Fallback: Standard WooCommerce pagination');
console.log('   - Hebrew next: a:contains("הבא") (Hebrew "Next")');
console.log('');

console.log('3. Smart URL Handling:');
console.log('   - Supports both /product/ and /product-category/ URLs');
console.log('   - Hebrew-friendly URL normalization');
console.log('   - Cleans tracking parameters (utm_source, gclid, etc.)');
console.log('');

console.log('🔍 What the HTML Actually Contains:');
console.log('- Hebrew WooCommerce structure: .woocommerce ul.products li.product');
console.log('- "הצג עוד" button for loading more products');
console.log('- Hebrew category titles and navigation');
console.log('- RTL (Right-to-Left) text layout');
console.log('');

console.log('📊 Expected Results After Fix:');
console.log('');

console.log('🌐 Collection Page (modanbags.co.il):');
console.log('- Should find all products on current page');
console.log('- Should detect "הצג עוד" button for pagination');
console.log('- Console output:');
console.log('  "🔍 Selector X found Y links"');
console.log('  "✅ Found next page using selector: a:contains(\"הצג עוד\")"');
console.log('  "⚠️ Found \"Show More\" button - this site may use AJAX loading"');
console.log('');

console.log('🛍️ Product Pages:');
console.log('- Should extract Hebrew product titles correctly');
console.log('- Should handle Hebrew category names');
console.log('- Should process Hebrew price formats (₪)');
console.log('');

console.log('🚀 To Test:');
console.log('');

console.log('1. Open your scraper app');
console.log('2. Enter: https://modanbags.co.il/product-category/...');
console.log('3. Start scraping');
console.log('4. Watch console for:');
console.log('   - Hebrew selector detection');
console.log('   - "Show More" button detection');
console.log('   - Product URL extraction');
console.log('   - Pagination handling');
console.log('');

console.log('💡 Why This Fixes It:');
console.log('- Previous adapters were designed for English/Left-to-Right sites');
console.log('- New adapter understands Hebrew WooCommerce structure');
console.log('- Handles "Show More" pagination pattern');
console.log('- Supports Hebrew text in selectors');
console.log('');

console.log('🔬 Technical Details:');
console.log('- Selector specificity: Hebrew-aware WooCommerce patterns');
console.log('- Pagination: Multiple Hebrew and English fallbacks');
console.log('- URL handling: Hebrew-friendly normalization');
console.log('- Language support: RTL text and Hebrew characters');
console.log('');

console.log('📝 If You Still See Issues:');
console.log('- Check if "הצג עוד" button is detected');
console.log('- Look for Hebrew selector success messages');
console.log('- Share console output for further debugging');
console.log('- Consider if site uses AJAX loading instead of traditional pagination');
console.log('');

console.log('🌍 Future Enhancements:');
console.log('- AJAX pagination handling for "Show More" sites');
console.log('- Dynamic content loading detection');
console.log('- Hebrew-specific content extraction');
console.log('- RTL layout optimization');
