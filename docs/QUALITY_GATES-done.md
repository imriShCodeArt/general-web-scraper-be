# 🛡️ Quality Gates Documentation

This document explains the quality assurance process for the general-web-scraper-be project.

## 🎯 Overview

We use a **two-tier quality gate system** to ensure code quality while maintaining development velocity:

1. **Fast Checks** - Run on every PR and development branch
2. **Comprehensive Checks** - Run only on main branch merges

## 🚀 Fast Quality Checks

**When:** Every PR and development branch push  
**Duration:** ~2-3 minutes  
**Includes:**
- ✅ TypeScript type checking
- ✅ ESLint code linting  
- ✅ Unit test execution (110 tests)
- ✅ Test coverage reporting

## 🧬 Comprehensive Quality Checks

**When:** Only when merging to main branch  
**Duration:** ~15-30 minutes  
**Includes:**
- ✅ All fast checks
- ✅ **Mutation testing** (5,475+ mutants tested)
- ✅ Performance validation
- ✅ Integration test validation

## 📋 Local Development Workflow

### Before Creating PRs
```bash
# Run fast checks locally
npm run quality-gate

# Or run individual checks
npm run type-check
npm run lint
npm run test:ci
```

### Before Merging to Main
```bash
# Windows
.\scripts\pre-merge-check.ps1

# Linux/Mac
./scripts/pre-merge-check.sh
```

## 🔄 GitHub Actions Workflows

### 1. Development Branch Checks
- **File:** `.github/workflows/development-checks.yml`
- **Triggers:** Push to `development`, `feat/*`, `feature/*` branches
- **Duration:** ~3 minutes
- **Purpose:** Fast feedback for developers

### 2. Main Branch Quality Gate
- **File:** `.github/workflows/main-quality-gate.yml`
- **Triggers:** Push to `main` branch
- **Duration:** ~20 minutes
- **Purpose:** Production-ready validation

## 🧬 Mutation Testing Details

### What is Mutation Testing?
Mutation testing **intentionally introduces bugs** into your code to verify that your tests actually catch them. It's the gold standard for test quality validation.

### Our Mutation Testing Setup
- **Tool:** Stryker Mutator
- **Scope:** Core business logic files only
  - `src/lib/csv-generator.ts`
  - `src/lib/normalization.ts`
  - `src/lib/scraping-service.ts`
  - `src/lib/generic-adapter.ts`
  - `src/lib/recipe-manager.ts`
- **Thresholds:**
  - **High:** 70% mutation score
  - **Break:** 50% mutation score

### Mutation Score Interpretation
- **90%+** 🟢 Excellent - Tests catch almost all bugs
- **70-89%** 🟡 Good - Tests catch most bugs
- **50-69%** 🟠 Fair - Some bugs might slip through
- **<50%** 🔴 Poor - Many bugs could go undetected

## 📊 Quality Metrics

### Current Status
- **Test Coverage:** 110 tests passing
- **Type Safety:** 100% TypeScript coverage
- **Code Quality:** ESLint compliant
- **Mutation Score:** TBD (runs on GitHub)

### Monitoring
- Check GitHub Actions for latest results
- Mutation reports available as artifacts
- Coverage reports uploaded to artifacts

## 🚨 Quality Gate Failures

### If Fast Checks Fail
1. Fix the issues locally
2. Re-run `npm run quality-gate`
3. Push changes to your branch

### If Mutation Testing Fails
1. Check the mutation report in GitHub Actions
2. Identify which mutants survived (weren't caught by tests)
3. Add or improve tests for those cases
4. Re-run the workflow

## 🔧 Configuration Files

- **Stryker Config:** `stryker.conf.json`
- **Jest Config:** `package.json` (jest section)
- **ESLint Config:** `.eslintrc.js`
- **TypeScript Config:** `tsconfig.json`

## 💡 Best Practices

### For Developers
1. **Always run fast checks** before pushing
2. **Write comprehensive tests** for new features
3. **Check mutation reports** when they fail
4. **Keep tests fast** and focused

### For Main Branch
1. **Only merge** after all quality gates pass
2. **Review mutation reports** for test quality
3. **Monitor performance** of quality gates
4. **Update thresholds** as codebase matures

## 🆘 Troubleshooting

### Mutation Testing Too Slow
- Check if too many files are being mutated
- Consider excluding more files in `stryker.conf.json`
- Reduce concurrency if needed

### Tests Failing in CI
- Run tests locally first
- Check for environment differences
- Verify all dependencies are installed

### Quality Gate Blocking
- Review the specific failure
- Fix the underlying issue
- Don't bypass quality gates

## 📈 Continuous Improvement

### Regular Reviews
- Monthly review of mutation scores
- Quarterly threshold adjustments
- Annual quality gate process review

### Metrics to Track
- Mutation score trends
- Test execution time
- Quality gate pass rate
- Developer feedback

---

**Remember:** Quality gates are there to help, not hinder. They catch issues early and ensure our codebase remains maintainable and reliable! 🚀
