# Web Scraper v2

A universal web scraper with deterministic CSV outputs and WooCommerce compatibility.

## 🎯 Features

- **Universal**: Adaptable to any retail/catalog site (multi-language incl. Hebrew, RTL)
- **Deterministic outputs**: Always emit WooCommerce-compatible CSVs (Parent + Variation) with correct linking and attributes
- **Robust**: Survive messy markup, percent-encoding, HTML entities, odd dimension formats, duplicate/placeholder options
- **Performant**: Batch, parallel generation, memory-safe storage and cleanup
- **Configurable**: YAML/JSON recipes for site-specific selectors and transformations

## 🏗️ Architecture

### Core Components

1. **Site Adapters**: Per-domain implementations for product discovery and extraction
2. **Normalization Toolkit**: Text cleaning, attribute normalization, dimension parsing
3. **CSV Generator**: WooCommerce-compatible Parent and Variation CSV generation
4. **Storage Service**: Dual storage (in-memory + filesystem) with automatic cleanup
5. **HTTP Client**: Robust web requests with rotating user agents and error handling
6. **Scraping Service**: Job queue management and orchestration

### Data Flow

```
Discovery → Extraction → Normalization → Product Typing → CSV Mapping → Storage & Delivery
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <your-repo>
cd web-scraper-v2

# Install dependencies
npm install

# Build the project
npm run build

# Start the server
npm start
```

### Development

```bash
# Start in development mode with auto-reload
npm run dev

# Run tests
npm test

# Lint code
npm run lint
```

## 📡 API Endpoints

### Scraping

- `POST /api/scrape/init` - Start a new scraping job
- `GET /api/scrape/status/:jobId` - Get job status
- `GET /api/scrape/jobs` - List all jobs
- `POST /api/scrape/cancel/:jobId` - Cancel a job
- `GET /api/scrape/download/:jobId/:type` - Download CSV files

### Storage

- `GET /api/storage/stats` - Get storage statistics
- `DELETE /api/storage/clear` - Clear all storage

### Health

- `GET /health` - Health check endpoint

## 🔧 Configuration

### Recipe Format

Recipes define how to extract data from specific sites:

```yaml
selectors:
  title: "h1, .product-title, .title"
  price: ".price, .product-price, [data-price]"
  images: "img[src*='product'], .product-image img"
  stock: ".stock, .availability, [data-stock]"
  attributes: ".attributes, .product-options, .variations"
  variations: ".variation, .product-variant, .option"

transforms:
  title: "Remove Brand -> Brand Name"
  price: "Clean Currency -> [0-9.,]+"

pagination:
  pattern: "page={page}"
  nextPage: ".next-page, .pagination-next"
```

## 📊 CSV Output

### Parent Products CSV

```
ID, post_title, post_name, post_status, post_content, post_excerpt, 
post_parent, menu_order, post_type, sku, stock_status, images, 
tax:product_type, tax:product_cat, description, 
attribute:Color, attribute_data:Color, attribute:Size, attribute_data:Size
```

### Variation CSV

```
ID, post_type, post_status, parent_sku, post_title, post_name, 
post_content, post_excerpt, menu_order, sku, stock_status, 
regular_price, tax_class, images, meta:attribute_Color, meta:attribute_Size
```

## 🌍 Multi-language Support

- **Hebrew/RTL**: Full support for Hebrew text and right-to-left languages
- **UTF-8**: End-to-end UTF-8 encoding
- **Internationalization**: Support for multiple languages and locales

## 🛡️ Robustness Features

- **Error Handling**: Continue on partial failures, log per product, keep partial CSVs
- **Anti-bot Mitigation**: Rotating user agents, configurable delays
- **Fallback Parsing**: Multiple extraction strategies (CSS, XPath, embedded JSON)
- **Validation**: Strip placeholders, ensure attribute consistency, guarantee required fields

## 📈 Performance

- **Parallel Processing**: Generate Parent/Variation CSVs in parallel
- **Memory Management**: Buffer-based processing with automatic cleanup
- **Batch Operations**: Process multiple products efficiently
- **Storage Optimization**: Dual storage with smart cleanup intervals

## 🔌 Extensibility

### Adding New Site Adapters

1. Extend the `BaseAdapter` class
2. Implement `discoverProducts()` and `extractProduct()` methods
3. Add site-specific logic for product discovery and extraction
4. Configure selectors and transformations in recipe files

### Custom Normalizers

Extend the `NormalizationToolkit` with site-specific cleaning logic:

```typescript
export class CustomNormalizer extends NormalizationToolkit {
  static customCleanup(text: string): string {
    // Custom cleaning logic
    return text;
  }
}
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run specific test file
npm test -- csv-generator.test.ts
```

## 📝 Logging

The application uses Pino for structured logging with pretty-printed output in development.

## 🚀 Deployment

### Production Build

```bash
npm run build
npm start
```

### Environment Variables

- `PORT`: Server port (default: 3000)
- `NODE_ENV`: Environment (development/production)

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
EXPOSE 3000
CMD ["npm", "start"]
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details.

## 🔗 Related

- [WooCommerce Import Documentation](https://docs.woocommerce.com/document/product-csv-import-suite/)
- [Cheerio Documentation](https://cheerio.js.org/)
- [JSDOM Documentation](https://github.com/jsdom/jsdom)

## 📞 Support

For issues and questions:
1. Check the documentation
2. Search existing issues
3. Create a new issue with detailed information
