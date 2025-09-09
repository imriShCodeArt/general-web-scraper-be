# Contributing to General Web Scraper

Thank you for your interest in contributing to the General Web Scraper project! This guide will help you understand how to contribute effectively.

## Table of Contents

- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Testing Guidelines](#testing-guidelines)
- [Smoke Testing](#smoke-testing)
- [Fixture Management](#fixture-management)
- [Code Quality](#code-quality)
- [Documentation](#documentation)
- [Pull Request Process](#pull-request-process)

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Git
- Basic understanding of TypeScript and web scraping

### Setup

1. **Fork and clone the repository**
   ```bash
   git clone https://github.com/your-username/general-web-scraper-be.git
   cd general-web-scraper-be
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run initial tests**
   ```bash
   npm test
   ```

4. **Verify smoke tests work**
   ```bash
   npm run smoke:scrape -- --url "https://example.com" --recipe "Generic Ecommerce"
   ```

## Development Workflow

### Branch Strategy

- **`main`**: Production-ready code
- **`development`**: Integration branch for features
- **`feature/*`**: Feature development branches
- **`hotfix/*`**: Critical bug fixes

### Creating a Feature Branch

```bash
# Start from development branch
git checkout development
git pull origin development

# Create feature branch
git checkout -b feature/your-feature-name

# Make your changes and commit
git add .
git commit -m "feat: add your feature description"
```

### Commit Message Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

**Types**:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples**:
```
feat(csv): add batch-wide attribute union
fix(adapters): resolve variation detection issue
docs: update README with new features
test: add performance tests for Phase 8
```

## Testing Guidelines

### Test Structure

```
src/
├── lib/
│   ├── __tests__/           # Unit tests
│   └── core/
│       └── adapters/
│           └── __tests__/   # Adapter-specific tests
├── test/
│   ├── e2e/                 # End-to-end tests
│   ├── performance/         # Performance tests
│   └── fixtures/            # Test data
```

### Running Tests

```bash
# Run all tests
npm test

# Run specific test suites
npm run test:unit          # Unit tests only
npm run test:e2e           # E2E tests only
npm run test:performance   # Performance tests only

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch

# Run tests for specific file
npm test -- --testPathPattern=csv-generator
```

### Writing Tests

#### Unit Tests
- Test individual functions and classes
- Mock external dependencies
- Use descriptive test names
- Follow AAA pattern (Arrange, Act, Assert)

```typescript
describe('CsvGenerator', () => {
  it('should generate parent CSV with correct headers', async () => {
    // Arrange
    const products = [mockProduct];
    const generator = new CsvGenerator();

    // Act
    const csv = await generator.generateParentCsv(products);

    // Assert
    expect(csv).toContain('post_title,sku,attribute:Color');
  });
});
```

#### Integration Tests
- Test component interactions
- Use real data when possible
- Test error scenarios

```typescript
describe('ScrapingService Integration', () => {
  it('should scrape product and generate valid CSV', async () => {
    const service = new ScrapingService();
    const result = await service.scrapeProduct('https://example.com');
    
    expect(result.parentCsv).toBeDefined();
    expect(result.variationCsv).toBeDefined();
  });
});
```

#### E2E Tests
- Test complete workflows
- Use mock websites or fixtures
- Validate CSV output format

```typescript
describe('E2E Scraping', () => {
  it('should scrape mock website and generate WooCommerce CSV', async () => {
    const result = await scrapeMockWebsite();
    
    expect(result.parentCsv).toMatchWooCommerceFormat();
    expect(result.variationCsv).toHaveValidVariations();
  });
});
```

### Test Data Management

#### Fixtures
- Store HTML fixtures in `src/test/fixtures/`
- Use realistic data from actual websites
- Keep fixtures up to date with site changes

#### Mock Data
- Create mock objects for testing
- Use factories for consistent test data
- Avoid hardcoded values in tests

## Smoke Testing

Smoke tests are quick, end-to-end tests that verify basic functionality works.

### Running Smoke Tests

```bash
# Test specific product URL
npm run smoke:scrape -- --url "https://example.com/product" --recipe "Generic Ecommerce"

# Test archive page
npm run smoke:scrape -- --archive "https://example.com/products" --max 3 --recipe "Generic Ecommerce"

# Test with specific recipe
npm run smoke:scrape -- --url "https://shukrehut.co.il/he/כיסאות/כיסא-סמבה" --recipe "Shuk Rehut Furniture"
```

### Smoke Test Options

- `--url <product>`: Test single product page
- `--archive <url>`: Test product archive page
- `--max <number>`: Maximum products to scrape (default: 5)
- `--recipe <name>`: Recipe to use (default: "Generic Ecommerce")
- `--output <dir>`: Output directory for CSVs (default: "./output")

### Smoke Test Validation

Smoke tests automatically validate:
- [ ] Product data extraction works
- [ ] CSV generation succeeds
- [ ] Parent CSV has required columns
- [ ] Variation CSV has proper attribute mappings
- [ ] No critical errors occur

## Fixture Management

### Creating New Fixtures

1. **Scrape real HTML** from target website
2. **Save to appropriate directory**:
   ```
   src/test/fixtures/
   ├── site-name/
   │   ├── product.html
   │   ├── archive.html
   │   └── variation.html
   ```
3. **Update tests** to use new fixtures
4. **Document fixture purpose** in test files

### Updating Existing Fixtures

1. **Check if site structure changed**
2. **Re-scrape HTML** if needed
3. **Update tests** if selectors changed
4. **Verify tests still pass**

### Fixture Best Practices

- Use realistic, complete HTML pages
- Include edge cases (missing data, malformed HTML)
- Keep fixtures small but representative
- Document any special characteristics

## Code Quality

### Linting

```bash
# Check for linting issues
npm run lint

# Fix auto-fixable issues
npm run lint:fix

# Check specific files
npm run lint -- src/lib/core/services/csv-generator.ts
```

### Type Checking

```bash
# Run TypeScript compiler
npm run type-check

# Watch mode for development
npm run type-check:watch
```

### Pre-commit Hooks

We use pre-commit hooks to ensure code quality:

```bash
# Install pre-commit hooks
npm run prepare

# Manual pre-commit check
npm run pre-commit
```

### Code Style Guidelines

- Use TypeScript strict mode
- Follow ESLint configuration
- Use meaningful variable names
- Add JSDoc comments for public APIs
- Keep functions small and focused
- Use async/await over Promises

## Documentation

### Code Documentation

- Add JSDoc comments for public APIs
- Include examples in complex functions
- Link to related documentation
- Keep comments up to date

### README Updates

- Update README when adding new features
- Include usage examples
- Document new configuration options
- Update installation instructions

### Recipe Documentation

- Document new recipes in `docs/recipes/`
- Include selector explanations
- Document known issues and solutions
- Provide testing examples

## Pull Request Process

### Before Submitting

1. **Run all tests**
   ```bash
   npm test
   npm run smoke:scrape -- --url "https://example.com"
   ```

2. **Check code quality**
   ```bash
   npm run lint
   npm run type-check
   ```

3. **Update documentation** if needed

4. **Rebase on latest development**
   ```bash
   git checkout development
   git pull origin development
   git checkout your-feature-branch
   git rebase development
   ```

### PR Description Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] E2E tests added/updated
- [ ] Smoke tests pass
- [ ] Manual testing completed

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No breaking changes (or documented)
```

### Review Process

1. **Automated checks** must pass
2. **Code review** by maintainers
3. **Testing** on target websites
4. **Documentation** review
5. **Approval** and merge

## Troubleshooting

### Common Issues

#### Tests Failing
- Check if fixtures are up to date
- Verify selectors still work
- Run tests individually to isolate issues

#### Smoke Tests Failing
- Check if target website changed
- Verify recipe configuration
- Test with different URLs

#### Linting Errors
- Run `npm run lint:fix` for auto-fixes
- Fix remaining issues manually
- Check ESLint configuration

#### Type Errors
- Run `npm run type-check` for details
- Fix type annotations
- Update type definitions if needed

### Getting Help

- Check existing issues on GitHub
- Create new issue with detailed description
- Include error messages and steps to reproduce
- Provide system information and versions

## Release Process

### Version Bumping

We use semantic versioning (SemVer):
- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes (backward compatible)

### Release Checklist

- [ ] All tests pass
- [ ] Documentation updated
- [ ] Version bumped in package.json
- [ ] CHANGELOG.md updated
- [ ] Release notes prepared
- [ ] Tag created and pushed

## Contributing to Recipes

### Recipe Development

1. **Analyze target website** structure
2. **Create initial recipe** with basic selectors
3. **Test with smoke tests**
4. **Iterate and refine** selectors
5. **Add comprehensive documentation**
6. **Create fixtures** for testing

### Recipe Best Practices

- Use specific, performant selectors
- Include fallback selectors
- Document known patterns and issues
- Test with multiple product types
- Handle edge cases gracefully

### Recipe Testing

```bash
# Test new recipe
npm run smoke:scrape -- --url "https://target-site.com/product" --recipe "Your Recipe Name"

# Test with archive
npm run smoke:scrape -- --archive "https://target-site.com/products" --max 5 --recipe "Your Recipe Name"
```

## Thank You

Thank you for contributing to the General Web Scraper project! Your contributions help make web scraping more reliable and accessible for everyone.

If you have any questions or need help, please don't hesitate to reach out through GitHub issues or discussions.
