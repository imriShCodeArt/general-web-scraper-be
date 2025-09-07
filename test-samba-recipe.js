const { RecipeManager } = require('./dist/lib/recipe-manager');
const { ScrapingService } = require('./dist/lib/scraping-service');

async function withTimeout(promise, ms, label) {
  let timeoutId;
  const timeout = new Promise((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error(`Timeout: ${label} after ${ms}ms`)), ms);
  });
  try {
    const result = await Promise.race([promise, timeout]);
    clearTimeout(timeoutId);
    return result;
  } catch (e) {
    clearTimeout(timeoutId);
    throw e;
  }
}

async function testSambaRecipe() {
  let adapter;
  const scrapingService = new ScrapingService();
  try {
    console.log('Testing Shuk Rehut Samba recipe...');

    const recipeManager = new RecipeManager('./recipes');

    // Test with the specific Samba chair URL (percent-encoded)
    const testUrl = 'https://shukrehut.co.il/he/%D7%9B%D7%99%D7%A1%D7%90%D7%95%D7%AA/%D7%9B%D7%99%D7%A1%D7%90-%D7%9C%D7%9E%D7%A9%D7%A8%D7%93-samba';
    console.log('Testing URL:', testUrl);

    // Create adapter directly from the recipe file to avoid lookup issues
    adapter = await withTimeout(
      recipeManager.createAdapterFromFile(testUrl, 'recipes/shuk-rehut-furniture.yaml'),
      20000,
      'createAdapterFromFile',
    );
    console.log('Adapter created');

    // Extract product data
    console.log('Extracting product data...');
    const product = await withTimeout(adapter.extractProduct(testUrl), 45000, 'extractProduct');

    console.log('\n=== EXTRACTED PRODUCT DATA ===');
    console.log('Title:', product.title);
    console.log('SKU:', product.sku);
    console.log('Price:', product.price);
    console.log('Sale Price:', product.salePrice);
    console.log('Description length:', product.description?.length || 0);
    console.log('Images count:', product.images?.length || 0);
    console.log('Category:', product.category);
    console.log('Stock Status:', product.stockStatus);
    console.log('Attributes:', product.attributes);

    if (product.images && product.images.length > 0) {
      console.log('\nFirst few images:');
      product.images.slice(0, 3).forEach((img, i) => {
        console.log(`  ${i + 1}: ${img}`);
      });
    }

    if (product.description) {
      console.log('\nDescription preview:');
      console.log(product.description.substring(0, 200) + '...');
    }
  } catch (error) {
    console.error('Error testing recipe:', error);
  } finally {
    try {
      if (adapter && typeof adapter.cleanup === 'function') {
        await adapter.cleanup();
      }
    } catch (e) {
      // ignore cleanup errors
    }
    // Force process exit so it never hangs
    process.exit(0);
  }
}

// Global safety timeout (1 minute)
setTimeout(() => {
  console.warn('Global timeout reached, exiting.');
  process.exit(1);
}, 60000);

testSambaRecipe();
