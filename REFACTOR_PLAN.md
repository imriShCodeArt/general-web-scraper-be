# Lib Directory Modular Restructuring Plan

## Overview
This document outlines the plan to restructure the `src/lib` directory for better modularity, maintainability, and organization.

## Current State Analysis

### Strengths
- ✅ Good separation of concerns
- ✅ Well-implemented dependency injection
- ✅ Comprehensive error handling
- ✅ Strong TypeScript usage
- ✅ Good test coverage

### Issues
- ✅ Flat directory structure makes navigation difficult - **FIXED**
- ✅ Related functionality scattered across files - **FIXED**
- ✅ No clear public API boundaries - **FIXED**
- ✅ Mixed concerns in single files - **FIXED**
- ✅ Difficult to understand dependencies - **FIXED**

## Target Structure

```
src/lib/
├── core/                           # Core business logic
│   ├── services/
│   │   ├── scraping-service.ts
│   │   ├── recipe-manager.ts
│   │   ├── storage-service.ts
│   │   └── csv-generator.ts
│   ├── adapters/
│   │   ├── base-adapter.ts
│   │   ├── enhanced-base-adapter.ts
│   │   ├── generic-adapter.ts
│   │   └── puppeteer-http-client.ts
│   └── normalization/
│       └── normalization.ts
│
├── validation/                     # Validation logic
│   ├── woocommerce/
│   │   ├── woocommerce-recipe-validator.ts
│   │   ├── woocommerce-attribute-validator.ts
│   │   ├── woocommerce-variation-validator.ts
│   │   ├── woocommerce-cross-field-validator.ts
│   │   ├── woocommerce-performance-validator.ts
│   │   ├── woocommerce-advanced-feature-validator.ts
│   │   └── woocommerce-validation-schema.ts
│   └── recipe-compliance-auditor.ts
│
├── infrastructure/                 # Infrastructure concerns
│   ├── http/
│   │   ├── http-client.ts
│   │   └── puppeteer-http-client.ts
│   ├── storage/
│   │   └── storage.ts
│   ├── logging/
│   │   └── logger.ts
│   └── di/
│       ├── container.ts
│       ├── tokens.ts
│       ├── types.ts
│       └── lifecycle.ts
│
├── domain/                        # Domain models and types
│   ├── models/
│   │   ├── product.ts
│   │   ├── recipe.ts
│   │   └── job.ts
│   ├── interfaces/
│   │   ├── adapters.ts
│   │   └── services.ts
│   └── types/
│       └── index.ts
│
├── utils/                         # Utility functions
│   ├── error-handler.ts
│   ├── recipe-loader.ts
│   └── recipe-maintenance-tools.ts
│
├── composition-root.ts            # DI configuration
└── index.ts                       # Public API exports
```

## Implementation Phases

### Phase 1: Create Directory Structure ✅ **COMPLETED**
- [x] Create new branch
- [x] Create target directory structure
- [x] Create placeholder files for organization

### Phase 2: Extract Domain Models ✅ **COMPLETED**
- [x] Extract product-related types to `domain/models/product.ts`
- [x] Extract recipe-related types to `domain/models/recipe.ts`
- [x] Extract job-related types to `domain/models/job.ts`
- [x] Create domain interfaces

### Phase 3: Reorganize Core Services ✅ **COMPLETED**
- [x] Move scraping service to `core/services/`
- [x] Move recipe manager to `core/services/`
- [x] Move storage service to `infrastructure/storage/` (moved to infrastructure)
- [x] Move CSV generator to `core/services/`

### Phase 4: Reorganize Infrastructure ✅ **COMPLETED**
- [x] Move HTTP clients to `infrastructure/http/`
- [x] Move storage to `infrastructure/storage/`
- [x] Move logging to `infrastructure/logging/`
- [x] Move DI container to `infrastructure/di/`

### Phase 5: Reorganize Validation ✅ **COMPLETED**
- [x] Move WooCommerce validators to `validation/woocommerce/`
- [x] Move recipe compliance auditor to `utils/` (moved to utils)

### Phase 6: Reorganize Adapters ✅ **COMPLETED**
- [x] Move adapters to `core/adapters/`
- [x] Move normalization to `core/normalization/`

### Phase 7: Update Imports and Dependencies ✅ **COMPLETED**
- [x] Update all import statements
- [x] Update DI container registrations
- [x] Update test imports

### Phase 8: Create Public API ✅ **COMPLETED**
- [x] Create `lib/index.ts` with public exports
- [x] Update external imports to use public API

### Phase 9: Update Tests ✅ **COMPLETED**
- [x] Update test file locations
- [x] Update test imports
- [x] Ensure all tests pass

### Phase 10: Cleanup ✅ **COMPLETED**
- [x] Remove old files
- [x] Update documentation
- [x] Run full test suite

## Benefits

### Improved Organization
- Related functionality grouped together
- Clear separation of concerns
- Easier navigation and discovery

### Better Maintainability
- Changes localized to specific modules
- Clearer dependency relationships
- Easier to understand codebase

### Enhanced Reusability
- Modules can be imported individually
- Clear public API boundaries
- Better encapsulation

### Easier Testing
- Each module can be tested independently
- Clearer test organization
- Better test isolation

## Migration Strategy

1. **Incremental Approach**: Move files gradually to avoid breaking changes
2. **Backward Compatibility**: Maintain existing imports during transition
3. **Comprehensive Testing**: Ensure all tests pass after each phase
4. **Documentation**: Update all documentation to reflect new structure

## Risk Mitigation

- Create comprehensive tests before refactoring
- Use TypeScript strict mode to catch import issues
- Maintain git history with proper file moves
- Test each phase thoroughly before proceeding

## Success Criteria

- [x] All existing functionality preserved
- [x] All tests passing
- [x] Clear module boundaries
- [x] Improved code organization
- [x] Better developer experience
- [x] Maintained performance

## 🎉 **RESTRUCTURING COMPLETED SUCCESSFULLY!**

### Summary of Achievements

✅ **All 10 phases completed successfully**
✅ **New modular directory structure implemented**
✅ **Domain models extracted and organized**
✅ **Core services reorganized**
✅ **Infrastructure components properly separated**
✅ **Validation logic consolidated**
✅ **Adapters and normalization organized**
✅ **All import statements updated**
✅ **Public API created**
✅ **Tests updated and passing**
✅ **Cleanup completed**

### Final Directory Structure

The `src/lib` directory now follows a clean, modular architecture:

```
src/lib/
├── core/                    # Core business logic
│   ├── services/           # Main services (scraping, recipe, CSV)
│   ├── adapters/           # Site adapters
│   └── normalization/      # Data normalization
├── domain/                 # Domain models and types
│   ├── models/            # Product, Recipe, Job models
│   ├── interfaces/        # Service and adapter interfaces
│   └── types/             # Error types and utilities
├── infrastructure/         # Infrastructure concerns
│   ├── di/               # Dependency injection
│   ├── http/             # HTTP clients
│   ├── logging/          # Logging utilities
│   └── storage/          # Storage service
├── validation/            # Validation logic
│   └── woocommerce/      # WooCommerce validators
├── utils/                 # Utility functions
├── composition-root.ts   # DI configuration
└── index.ts              # Public API exports
```

### Benefits Realized

- **Better Organization**: Related functionality is now grouped together
- **Clear Separation of Concerns**: Domain, infrastructure, and business logic are properly separated
- **Improved Maintainability**: Changes are localized to specific modules
- **Enhanced Discoverability**: Easy to find what you're looking for
- **Better Testability**: Each module can be tested independently
- **Clean Public API**: Well-defined external interface through `index.ts`

The restructuring has been completed and all functionality has been preserved while significantly improving the codebase organization and maintainability!
