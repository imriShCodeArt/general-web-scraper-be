import { Command } from 'commander';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { CsvGenerator } from '../lib/core/services/csv-generator';
import { factories } from '../test/utils/factories';

const program = new Command();

program
  .name('smoke-scrape')
  .description('Smoke scrape a product or archive and write CSVs to ./output')
  .option('--url <productUrl>', 'Product URL to scrape')
  .option('--archive <archiveUrl>', 'Archive URL to scrape with optional --max')
  .option('--max <n>', 'Max products to process from archive', '3')
  .option('--recipe <name>', 'Recipe name to use', 'Shuk Rehut Furniture')
  .action(async (opts) => {
    const jobId = uuidv4();
    const outputDir = path.resolve(process.cwd(), 'output');
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

    // For demonstration we use factories to create normalized products;
    // in real usage this would invoke the scraping pipeline.
    const productCount = Number(opts.max) || 3;
    const products = Array.from({ length: productCount }).map((_, i) =>
      factories.variableProduct({ id: `p${i + 1}`, sku: `SKU-${i + 1}` }),
    );

    const generator = new CsvGenerator();
    const { parentCsv, variationCsv } = await generator.generateBothCsvs(products);

    const parentPath = path.join(outputDir, `parent-${jobId}.csv`);
    const variationPath = path.join(outputDir, `variation-${jobId}.csv`);
    fs.writeFileSync(parentPath, parentCsv, 'utf8');
    fs.writeFileSync(variationPath, variationCsv, 'utf8');

    // Basic smoke assertions
    if (!parentCsv.includes('attribute:')) {
      throw new Error('Parent CSV missing attribute columns');
    }

    console.log(`Wrote parent CSV: ${parentPath}`);
    console.log(`Wrote variation CSV: ${variationPath}`);
  });

program.parseAsync().catch((err) => {
  console.error(err);
  process.exit(1);
});
