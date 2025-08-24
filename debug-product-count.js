// Debug script to identify why only 10 products are found instead of 25
// This will help us understand what's happening in the product extraction

console.log('🔍 Debug: Why Only 10 Products Found Instead of 25?');
console.log('');

console.log('🎯 The Issue:');
console.log('- HTML contains 25 products with class "productitem--image-link"');
console.log('- Scraper is only finding 10 products');
console.log('- Need to identify where the filtering is happening');
console.log('');

console.log('🛠️ Enhanced Debugging Added:');
console.log('');

console.log('📋 Detailed Selector Logging:');
console.log('- Each selector now shows exactly how many links it finds');
console.log('- Shows how many URLs are added vs filtered for each selector');
console.log('- Logs individual URL processing decisions');
console.log('');

console.log('🔍 What to Look For in Console:');
console.log('');

console.log('1. Primary Selector Results:');
console.log('   🔍 Selector ".productitem--image-link[href*="/products/"]" found X links');
console.log('   📊 Selector results: X added, Y filtered');
console.log('');

console.log('2. Individual URL Processing:');
console.log('   ✅ Added product URL: [URL]');
console.log('   ❌ Filtered out URL: [URL] (reason: [reason])');
console.log('');

console.log('3. Total Results:');
console.log('   ✅ Total unique product URLs found: X');
console.log('');

console.log('🔬 Possible Issues:');
console.log('');

console.log('❌ Issue 1: Selector Not Finding Links');
console.log('   - If primary selector shows "found 0 links"');
console.log('   - HTML structure may have changed');
console.log('   - Need to inspect actual HTML');
console.log('');

console.log('❌ Issue 2: Over-Filtering URLs');
console.log('   - If selector finds 25 links but filters out 15');
console.log('   - Check filtering logic in extractProductUrls');
console.log('   - Look for "Filtered out URL" messages');
console.log('');

console.log('❌ Issue 3: Duplicate Detection');
console.log('   - If URLs are being marked as duplicates');
console.log('   - Check if URL normalization is working correctly');
console.log('   - Look for "reason: duplicate" messages');
console.log('');

console.log('🚀 To Debug:');
console.log('');

console.log('1. Run your scraper with: https://wash-and-dry.eu/collections/bestseller');
console.log('2. Watch console for detailed logging');
console.log('3. Look for these key messages:');
console.log('   - "🔍 Selector X found Y links"');
console.log('   - "📊 Selector results: X added, Y filtered"');
console.log('   - "✅ Total unique product URLs found: X"');
console.log('');

console.log('4. If you see issues, share the console output');
console.log('5. The detailed logging will show exactly where products are being lost');
console.log('');

console.log('💡 Expected Debug Output:');
console.log('');

console.log('🔍 Selector ".productitem--image-link[href*="/products/"]" found 25 links');
console.log('  ✅ Added product URL: https://wash-and-dry.eu/collections/bestseller/products/...');
console.log('  ✅ Added product URL: https://wash-and-dry.eu/collections/bestseller/products/...');
console.log('  ... (25 times)');
console.log('  📊 Selector results: 25 added, 0 filtered');
console.log('✅ Total unique product URLs found: 25');
console.log('');

console.log('🔍 If You Still See Only 10 Products:');
console.log('- Check if the primary selector is finding 25 links');
console.log('- Look for filtering messages that show why 15 are being removed');
console.log('- Share the complete console output for further analysis');
console.log('- The enhanced logging should reveal exactly what\'s happening');
