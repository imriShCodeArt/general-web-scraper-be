# General Web Scraper - Backend API

A powerful, backend-only web scraper API with deterministic CSV outputs and WooCommerce compatibility.

## 🏗️ Project Structure

```
general-web-scraper-be/
├── 📁 src/                   # TypeScript source code
│   ├── 📁 lib/               # Core scraping libraries
│   ├── 📁 app/               # API routes and middleware
│   └── index.ts              # Main entry point
├── 📁 dist/                  # Compiled JavaScript output
├── 📁 storage/               # Generated CSV files
├── 📁 recipes/               # Scraping recipes (YAML)
├── 📁 node_modules/          # Dependencies
├── 📄 package.json           # Project configuration
├── 📄 tsconfig.json          # TypeScript configuration
├── 📄 vercel.json            # Vercel deployment config
└── 📄 vercel-build.js        # Custom build script
```

## 🚀 Quick Start

### **Development**

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## 🛠️ Features

- **Universal Scraping**: Works with any website using configurable recipes
- **Multi-Strategy**: Cheerio (fast) + Playwright (JavaScript-rendered)
- **WooCommerce Ready**: Direct CSV import compatibility
- **Recipe System**: YAML-based configuration for different sites
- **Real-time Progress**: Live scraping progress tracking
- **Data Validation**: Comprehensive product data validation
- **CSV Generation**: Dual output (parent + variation products)

## 📚 Documentation

- [API Reference](./docs/api.md)
- [Recipe Configuration](./docs/recipes.md)
- [Deployment Guide](./docs/deployment.md)
- [Contributing](./docs/contributing.md)

## 🔧 Tech Stack

- **Backend**: Node.js, Express, TypeScript, Puppeteer
- **Storage**: File-based storage (CSV)
- **Deployment**: Vercel serverless functions
- **Testing**: Jest
- **Build**: TypeScript compilation

## 📄 License

MIT License - see [LICENSE](./LICENSE) file for details.
