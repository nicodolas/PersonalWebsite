# GitHub Actions Workflows Guide

This document describes the 5 automated workflows configured under `.github/workflows/` that coordinate data updates, validation, compilation checks, and deployments.

---

## 📅 Summary of Workflows

| Workflow File | Trigger | Responsibility |
| :--- | :--- | :--- |
| **`generate-data.yml`** | Daily Cron (`0 0 * * *`) | Fetches raw data, runs daily analyzers, updates data files, and commits them. |
| **`weekly-analysis.yml`** | Weekly Cron (`0 0 * * 0`) | Performs deep journey analysis, era summaries, monthly narratives, and repository graph rebuilds. |
| **`validate-data.yml`** | Push & PR | Verifies that all generated data complies with TS schema validations. |
| **`build-check.yml`** | Push & PR | Runs code linting, compiler diagnostics, and mock compilation checks. |
| **`deploy.yml`** | Push to `main` / PR | Deploys static build to Cloudflare Pages (Production or Preview staging). |

---

## 🔍 Detailed Workflow Explanations

### 1. Daily Data Sync (`generate-data.yml`)
Runs once a day at midnight.
- **Actions**:
  1. Checks out the code.
  2. Sets up Node.js.
  3. Executes `node src/scripts/fetch-raw-data.js` and `node src/scripts/run-analyzers.js`.
  4. Runs **CI Safety Check** (`node src/scripts/ci-safety-check.js`) to block commits containing files outside approved data directories.
  5. Commits modifications back to the repository using a bot author.
- **Avoid Infinite Loops**: Commits are flagged with `[skip ci]` in the message to prevent triggering other test/deployment workflows.
- **Mutable Commit Pattern**: Commit is strictly restricted to `src/data/generated/**` and `src/data/cache/**`.

### 2. Weekly Deep Analysis (`weekly-analysis.yml`)
Runs once a week on Sundays.
- **Actions**:
  1. Runs deep trend checks, era syntheses, monthly narratives, and repository graph mappings.
  2. Bypasses standard AI cache files to force new narration styles.
  3. Runs **CI Safety Check** to verify no source code files are modified.
  4. Commits generated updates strictly within approved paths back to the repo.

### 3. Data Validation (`validate-data.yml`)
Ensures no malformed JSON disrupts the website display.
- **Actions**:
  1. Runs on every commit and pull request.
  2. Executes `node src/scripts/validate-json.js`.
  3. Fails the build if properties are missing or types are incorrect.

### 4. Build Checker (`build-check.yml`)
Validates codebase compilation soundness.
- **Actions**:
  1. Runs ESLint to check formatting.
  2. Runs `tsc` to verify static types.
  3. Compiles the Next.js static output via `npm run build`.

### 5. Deployment Coordinator (`deploy.yml`)
Ties everything together.
- **Actions**:
  - **Pull Request**: Compiles static site, uploads build as preview page, and comments the staging URL on the PR.
  - **Push to main**: Builds the site, deploys it live on Cloudflare Pages, and purges the CDN cache.

---

## 🔒 Secret Configuration Requirement

The workflows require two secrets to be set in the GitHub repository settings:
1. `GITHUB_TOKEN` (Automatically provided by GitHub runner context; used for API requests).
2. `OPENROUTER_API_KEY`: Custom secret containing the API key for OpenRouter models.
