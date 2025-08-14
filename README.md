# Product Table Scraper - WooCommerce CSV Generator

A web application that extracts product data from HTML tables and generates WooCommerce-compatible CSV files for easy import.

## Features

- **Table Parsing**: Automatically extract product URLs from HTML tables with columns for URL, Images, and Last Modified
- **Product Extraction**: Scrape product details including titles, descriptions, images, attributes, and variations
- **WooCommerce Ready**: Generate CSV files compatible with WooCommerce Product CSV Import Suite
- **Modern UI**: Clean, responsive interface built with Next.js and Tailwind CSS
- **Robust Scraping**: Fallback from Cheerio to Playwright for JavaScript-rendered pages

## Tech Stack

- **Frontend**: Next.js 14 (App Router) + TypeScript + Tailwind CSS
- **Backend**: Next.js API Routes + Node.js
- **Scraping**: Cheerio (primary) + Playwright (fallback)
- **CSV Generation**: fast-csv
- **Logging**: pino
- **Validation**: zod

## Prerequisites

- Node.js 18+ 
- npm or yarn
- Git

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd general-web-scraper
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Install Playwright browsers** (required for JS-rendered page fallback)
   ```bash
   npx playwright install chromium
   ```

## Development

1. **Start the development server**
   ```bash
   npm run dev
   ```

2. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Usage

### 1. Input Table URLs
Enter URLs of HTML pages containing tables with product information. The table should have columns for:
- **URL**: Product page links
- **Images**: Product images (optional)
- **Last Modified**: Last update date (optional)

### 2. Start Scraping
Click "Start Scraping" to begin the extraction process. The system will:
- Parse each table page to extract product URLs
- Scrape individual product pages for metadata
- Generate WooCommerce-compatible CSV files

### 3. Download Results
Once complete, download two CSV files:
- **PARENT_PRODUCTS.csv**: Main product information and attributes
- **VARIATION_PRODUCTS.csv**: Product variations and pricing

### 4. Import to WooCommerce
1. Import the Parent Products CSV first
2. Then import the Variation Products CSV
3. Review and adjust product data as needed

## API Endpoints

### POST /api/scrape/init
Initiates a scraping job.

**Request Body:**
```json
{
  "urls": [
    "https://example.com/products-table-1",
    "https://example.com/products-table-2"
  ]
}
```

**Response:**
```json
{
  "success": true,
  "requestId": "uuid",
  "data": {
    "total_products": 25,
    "processed_urls": 3,
    "csv_files": {
      "parent_products": "PARENT_PRODUCTS_2024-01-15T10-30-00.csv",
      "variation_products": "VARIATION_PRODUCTS_2024-01-15T10-30-00.csv"
    },
    "download_links": {
      "parent_products": "/api/scrape/download/uuid/parent",
      "variation_products": "/api/scrape/download/uuid/variation"
    }
  }
}
```

### GET /api/scrape/download/[jobId]/[type]
Downloads generated CSV files (parent or variation).

## CSV Schema

### PARENT_PRODUCTS.csv
```
post_title,post_name,post_status,sku,stock_status,images,tax:product_type,tax:product_cat,attribute:Color,attribute_data:Color,attribute:Size,attribute_data:Size
```

### VARIATION_PRODUCTS.csv
```
parent_sku,sku,stock_status,regular_price,tax_class,images,meta:attribute_Color,meta:attribute_Size
```

## Configuration

### Environment Variables
Create a `.env.local` file in the root directory:

```env
LOG_LEVEL=info
NODE_ENV=development
```

### Scraping Behavior
- **Batch Processing**: Products are scraped in batches of 5 to avoid overwhelming servers
- **Rate Limiting**: 1-second delay between batches
- **Timeout**: 30 seconds per page request
- **User Agent**: Modern Chrome user agent to avoid blocking

## Production Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Deploy automatically on push

### Other Platforms
- **Railway**: Good for Node.js applications
- **Render**: Alternative to Heroku
- **DigitalOcean App Platform**: Scalable container deployment

### Required Production Setup
1. **S3 Storage**: Configure S3-compatible storage for CSV files
2. **Database**: Add PostgreSQL for job tracking (optional)
3. **Redis**: Add Redis for job queuing (optional)
4. **Environment Variables**: Set production environment variables

## Testing

Run the test suite:
```bash
npm test
```

Run tests in watch mode:
```bash
npm run test:watch
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For issues and questions:
1. Check the existing issues
2. Create a new issue with detailed information
3. Include error logs and reproduction steps

## Roadmap

- [ ] Custom attribute mapping in UI
- [ ] Proxy rotation for blocked domains
- [ ] Scheduled scraping for periodic updates
- [ ] Advanced filtering and search
- [ ] Bulk URL import from file
- [ ] Real-time progress updates
- [ ] Export to other e-commerce platforms
