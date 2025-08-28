# Contributing & Git/CI-CD Workflow Guide

This document is the **single source of truth** for how we work with Git
and CI/CD in this project.\
We use a **trunk-based hybrid strategy**: `main` is the trunk, and
`develop` is a staging mirror for deployments.

------------------------------------------------------------------------

## 🚀 Branching Strategy

-   **`main` = the trunk**
    -   All development happens here via short-lived feature branches.
    -   Always stable and deployable.
-   **`develop` = staging mirror**
    -   No direct commits.
    -   Auto-synced to `main` after CI passes.
    -   Used only for **staging deployments**.
-   **Feature branches**
    -   Branch from `main` only.
    -   Naming conventions:
        -   `feat/<scope>-<slug>` → new features
        -   `fix/<scope>-<slug>` → bug fixes
        -   `chore/...` → maintenance
        -   `docs/...` → documentation
        -   `refactor/...` → code improvements

------------------------------------------------------------------------

## 🔄 Daily Developer Workflow

1.  Sync with `main`:

    ``` bash
    git checkout main
    git pull --rebase
    ```

2.  Create a new branch:

    ``` bash
    git checkout -b feat/<scope>-<slug>
    ```

3.  Commit frequently using **Conventional Commits**.

4.  Push your branch and open a PR against `main`.

5.  Ensure CI passes and self-review your PR.

6.  Merge via **Squash and Merge** only.

7.  Delete your branch after merge.

------------------------------------------------------------------------

## 📝 Commit Messages

We use [Conventional Commits](https://www.conventionalcommits.org):

Format:

    <type>(<scope>): <description>

Types: - `feat:` --- new feature - `fix:` --- bug fix - `docs:` --- docs
only - `style:` --- style-only changes - `refactor:` --- restructure
code - `test:` --- add/fix tests - `chore:` --- maintenance

Examples:

    feat(csv): add parser for attribute_data
    fix(api): handle 429 retry logic
    chore(ci): update Node version in workflow

------------------------------------------------------------------------

## 📦 Pull Requests

-   One PR = one logical change.
-   Keep PRs small (\<300 LOC if possible).
-   Fill out the PR template.
-   CI must pass (lint, typecheck, tests).
-   PR must be approved (self-review if solo).
-   Merge using **Squash and Merge**.

------------------------------------------------------------------------

## 🛠️ CI/CD Workflows

### Main Workflow (`.github/workflows/ci.yml`)

-   Runs on `main` (push & PR).
-   Stages:
    -   Type checking (TypeScript)
    -   Linting (ESLint + Prettier)
    -   Unit tests (Jest)
    -   Integration/e2e tests
-   If successful, auto-syncs `develop` to `main`.

### Deployment Workflow

-   **Staging**: every push to `develop` deploys to staging.
-   **Production**: deployments triggered by **tags** on `main`.
-   Optional manual approval before production deploys.

------------------------------------------------------------------------

## 🎯 Releases

-   We follow **Semantic Versioning (SemVer)**.

-   Every production deploy is tagged:

    -   `v1.2.0` = new features
    -   `v1.2.1` = bug fixes
    -   `v2.0.0` = breaking changes

-   Release process:

    ``` bash
    git checkout main
    git pull
    npm version patch|minor|major
    git push && git push --tags
    ```

------------------------------------------------------------------------

## 🔄 Rollback Strategy

### 1. Infra-level rollback (fastest)

-   Use Vercel dashboard to "promote previous deployment" (staging or
    prod).
-   Automatic rollback can trigger if health checks fail.

### 2. Code-level rollback (permanent fix)

-   Use `git revert` on `main`:

    ``` bash
    git checkout -b revert/pr-123
    git revert <sha>
    git push -u origin revert/pr-123
    ```

-   Merge PR → `main` → auto-syncs `develop`.

### 3. Database migrations

-   Use **expand/contract pattern** to avoid schema breaks.
-   Ensure rollbacks are non-breaking.

------------------------------------------------------------------------

## 🔐 Environment & Secrets

-   Never commit `.env.local`.
-   Use `.env.example` for placeholders.
-   Required secrets (examples):
    -   `VERCEL_TOKEN`
    -   `ORG_ID`
    -   `PROJECT_ID`
    -   `DATABASE_URL`
    -   `API_KEYS`

------------------------------------------------------------------------

## 📊 Monitoring & Observability

-   Health check endpoint: `/api/health`
-   Structured logs with correlation IDs
-   Metrics: Prometheus-compatible
-   Staging and production monitored separately

------------------------------------------------------------------------

## 🧑‍💻 Local Development Workflow

### Pre-commit hooks

``` bash
npm run prepare   # install hooks
npm run pre-commit
```

### Run tests

``` bash
npm test             # all tests
npm run test:unit
npm run test:integration
npm run test:e2e
npm run test:coverage
```

### Troubleshooting

``` bash
rm -rf node_modules package-lock.json
npm ci
npm test -- --verbose
```

------------------------------------------------------------------------

## ✅ Summary

-   **All dev work → `main`**\
-   **PRs required, squash merges only**\
-   **CI gates: lint, typecheck, tests**\
-   **`develop` = auto-mirror for staging**\
-   **Prod deploys = tags on `main`**\
-   **Rollback = infra (fast) + git revert (permanent)**\
-   **Secrets in CI/CD, never in repo**

This hybrid keeps trunk-based simplicity while giving us two
environments (staging & prod) with safe rollback paths.
