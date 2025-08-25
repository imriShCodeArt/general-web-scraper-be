# Project Structure

This document outlines the improved project structure for the Web Scraper v2 application.

## 🏗️ Overview

The project has been restructured into a **monorepo** architecture for better organization, maintainability, and scalability.

```
general-web-scraper/
├── 📁 apps/                    # Application packages
│   ├── 📁 backend/            # Node.js + TypeScript API
│   └── 📁 frontend/           # React + Vite UI
├── 📁 packages/                # Shared libraries
│   ├── 📁 core/               # Core scraping logic
│   ├── 📁 adapters/           # Site-specific adapters
│   └── 📁 utils/              # Shared utilities
├── 📁 configs/                 # Configuration files
│   ├── 📁 docker/             # Docker configurations
│   ├── 📁 eslint/             # ESLint configurations
│   ├── 📁 typescript/         # TypeScript configurations
│   └── 📁 env/                # Environment configurations
├── 📁 docs/                    # Documentation
├── 📁 scripts/                 # Build and deployment scripts
├── 📁 storage/                 # Generated CSV files
├── 📁 recipes/                 # Scraping recipes
└── 📁 tests/                   # Test files and fixtures
```

## 📦 Package Details

### **Apps**

#### `apps/backend/`
- **Purpose**: Main API server for web scraping operations
- **Tech Stack**: Node.js, Express, TypeScript, Puppeteer
- **Key Features**:
  - REST API endpoints
  - Scraping job management
  - CSV generation and storage
  - Recipe system management

#### `apps/frontend/`
- **Purpose**: React-based user interface
- **Tech Stack**: React, Vite, TypeScript, Tailwind CSS
- **Key Features**:
  - Scraping job creation and monitoring
  - Recipe management interface
  - Real-time progress tracking
  - CSV download and preview

### **Packages**

#### `packages/core/`
- **Purpose**: Core scraping logic and utilities
- **Contents**:
  - Base scraper classes
  - Data normalization tools
  - CSV generation logic
  - Storage management

#### `packages/adapters/`
- **Purpose**: Site-specific scraping adapters
- **Contents**:
  - Generic adapter implementation
  - Site-specific overrides
  - Selector management
  - Data transformation logic

#### `packages/utils/`
- **Purpose**: Shared utility functions
- **Contents**:
  - HTTP client utilities
  - Data validation helpers
  - Common type definitions
  - Testing utilities

### **Configs**

#### `configs/docker/`
- **Purpose**: Docker containerization configurations
- **Contents**:
  - `Dockerfile.backend` - Backend container definition
  - `Dockerfile` - Frontend container definition
  - `docker-compose.yml` - Production orchestration
  - `docker-compose.dev.yml` - Development orchestration

#### `configs/typescript/`
- **Purpose**: TypeScript configuration files
- **Contents**:
  - `tsconfig.base.json` - Base TypeScript configuration
  - Package-specific configurations

#### `configs/eslint/`
- **Purpose**: Code quality and style enforcement
- **Contents**:
  - ESLint rules and configurations
  - Prettier integration
  - TypeScript-specific rules

#### `configs/env/`
- **Purpose**: Environment configuration management
- **Contents**:
  - `.env.example` - Example environment variables
  - Environment-specific configurations

## 🔄 Migration Guide

### **From Old Structure**

1. **Backend Code**: Moved from `src/` to `apps/backend/src/`
2. **Frontend Code**: Moved from `frontend/` to `apps/frontend/`
3. **Docker Files**: Moved to `configs/docker/`
4. **Configuration**: Centralized in `configs/` directory

### **New Commands**

```bash
# Install all dependencies
npm install

# Build all packages
npm run build

# Start backend development
npm run dev

# Start frontend development
npm run dev:frontend

# Start both services
npm run dev:full

# Docker commands (updated paths)
npm run docker:build
npm run docker:up
```

## 🚀 Benefits of New Structure

### **1. Better Organization**
- Clear separation of concerns
- Logical grouping of related files
- Easier navigation and maintenance

### **2. Improved Scalability**
- Monorepo architecture for shared code
- Independent package development
- Better dependency management

### **3. Enhanced Development Experience**
- Workspace-based development
- Shared tooling and configurations
- Consistent development environment

### **4. Better Testing**
- Isolated testing per package
- Shared test utilities
- Easier test orchestration

### **5. Simplified Deployment**
- Centralized Docker configurations
- Environment-specific builds
- Streamlined CI/CD pipelines

## 🔧 Development Workflow

### **Adding New Features**

1. **Identify Package**: Determine which package the feature belongs to
2. **Implement**: Add code to the appropriate package
3. **Test**: Run tests for the specific package
4. **Build**: Ensure the package builds successfully
5. **Integrate**: Update any dependent packages

### **Adding New Packages**

1. **Create Directory**: Add new package under `packages/`
2. **Package.json**: Create package configuration
3. **TypeScript Config**: Extend base configuration
4. **Dependencies**: Add to root workspace
5. **Build Scripts**: Update root build scripts

### **Configuration Changes**

1. **Identify Scope**: Determine if change affects all packages or specific ones
2. **Update Configs**: Modify appropriate configuration files
3. **Test Impact**: Ensure changes don't break existing functionality
4. **Document**: Update relevant documentation

## 📚 Documentation Structure

```
docs/
├── README.md                   # Main documentation index
├── getting-started.md          # Quick start guide
├── architecture.md             # System architecture
├── api.md                      # API reference
├── recipes.md                  # Recipe system guide
├── deployment.md               # Deployment instructions
├── contributing.md             # Contribution guidelines
└── examples/                   # Code examples and recipes
```

## 🐳 Docker Integration

### **Production Build**
```bash
# Build all containers
npm run docker:build

# Start services
npm run docker:up

# View logs
npm run docker:logs
```

### **Development Build**
```bash
# Start development environment
npm run docker:dev

# View development logs
npm run docker:dev:logs
```

## 🔍 Troubleshooting

### **Common Issues**

1. **Build Failures**: Ensure all dependencies are installed with `npm install`
2. **TypeScript Errors**: Check package-specific `tsconfig.json` files
3. **Docker Issues**: Verify Docker Compose file paths are correct
4. **Workspace Issues**: Ensure root `package.json` has correct workspace configuration

### **Getting Help**

- Check package-specific documentation
- Review configuration files
- Check build and error logs
- Consult the main README.md

## 🎯 Future Improvements

### **Planned Enhancements**

1. **Database Integration**: Add PostgreSQL/MySQL support
2. **Job Queue**: Implement Redis-based job queuing
3. **Monitoring**: Add application performance monitoring
4. **CI/CD**: Automated testing and deployment pipelines
5. **API Versioning**: Implement API versioning strategy

### **Architecture Evolution**

1. **Microservices**: Potential split into microservices
2. **Event-Driven**: Implement event-driven architecture
3. **Caching**: Add Redis caching layer
4. **Load Balancing**: Implement load balancing for scalability

---

This structure provides a solid foundation for the Web Scraper v2 application, enabling better development experience, easier maintenance, and future scalability.
