# Web Scraper v2 - Universal E-commerce Scraper

A powerful, universal web scraper with deterministic CSV outputs and WooCommerce compatibility.

## 🏗️ Project Structure

```
general-web-scraper/
├── 📁 apps/
│   ├── 📁 backend/           # Node.js + TypeScript API
│   └── 📁 frontend/          # React + Vite UI
├── 📁 packages/              # Shared libraries
│   ├── 📁 core/              # Core scraping logic
│   ├── 📁 adapters/          # Site-specific adapters
│   └── 📁 utils/             # Shared utilities
├── 📁 configs/               # Configuration files
│   ├── 📁 docker/            # Docker configurations
│   ├── 📁 eslint/            # ESLint configurations
│   └── 📁 typescript/        # TypeScript configurations
├── 📁 docs/                  # Documentation
├── 📁 scripts/               # Build and deployment scripts
├── 📁 storage/               # Generated CSV files
├── 📁 recipes/               # Scraping recipes
└── 📁 tests/                 # Test files and fixtures
```

## 🚀 Quick Start

### **Development**
```bash
# Install all dependencies
npm install

# Start both services
npm run dev:full

# Or start individually
npm run dev              # Backend only
npm run frontend:dev     # Frontend only
```

### **Docker (Recommended)**
```bash
# Production
npm run docker:build
npm run docker:up

# Development
npm run docker:dev
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
- **Frontend**: React, Vite, Tailwind CSS, Zustand
- **Database**: File-based storage (CSV)
- **Containerization**: Docker + Docker Compose
- **Testing**: Jest, Playwright

## 📄 License

MIT License - see [LICENSE](./LICENSE) file for details.
