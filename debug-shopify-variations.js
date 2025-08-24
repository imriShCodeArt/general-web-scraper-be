// Debug script to identify why Shopify variations aren't being extracted
// This will help us understand the actual HTML structure of wash-and-dry.eu

console.log('🔍 Debugging Shopify Variation Extraction...');
console.log('');

console.log('🎯 The issue: Variations are not being extracted from wash-and-dry.eu product pages');
console.log('');

console.log('📋 What we need to check:');
console.log('1. Are there any <select> elements on the page?');
console.log('2. What are their names, classes, and options?');
console.log('3. Do the options contain size information?');
console.log('4. Are the selectors in our adapter matching?');
console.log('');

console.log('🔧 Updated adapter now includes:');
console.log('- More comprehensive selectors');
console.log('- Debug logging for all select elements');
console.log('- Better filtering of placeholder options');
console.log('- Multiple fallback strategies');
console.log('');

console.log('📝 To test the updated adapter:');
console.log('1. Open your scraper app');
console.log('2. Enter: https://wash-and-dry.eu/collections/bestseller/products/monocolour-cool-grey');
console.log('3. Start scraping');
console.log('4. Check console for debug output:');
console.log('');
console.log('   Expected debug output:');
console.log('   - "🎯 Using product scraper adapter for host: wash-and-dry.eu"');
console.log('   - "Found Shopify size selector, extracting variations..."');
console.log('   - "Processing select element with X options"');
console.log('   - "Option: '35x75cm - €25,95' (value: '...')"');
console.log('   - "✅ Extracted Shopify variation: 35x75 - €25.95"');
console.log('   - "Total variations extracted: X"');
console.log('');

console.log('❌ If still failing, look for:');
console.log('- "❌ No size selector found with standard selectors"');
console.log('- "Found X total select elements on page:"');
console.log('- Individual select element details');
console.log('');

console.log('💡 Common issues and solutions:');
console.log('1. Select element has different class names');
console.log('   → Add more selectors to the adapter');
console.log('');
console.log('2. Options are loaded dynamically via JavaScript');
console.log('   → May need to wait for page to fully load');
console.log('');
console.log('3. Size information is in different format');
console.log('   → Update the regex patterns');
console.log('');
console.log('4. Select element is nested in different structure');
console.log('   → Update the parent selectors');
console.log('');

console.log('🚀 Next steps:');
console.log('1. Test with the updated adapter');
console.log('2. Check console output for debug information');
console.log('3. If still failing, share the debug output');
console.log('4. We can then create a more targeted solution');
