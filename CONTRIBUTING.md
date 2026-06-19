# Neko Workshop Contributing Guide

This document explains how to set up the development environment, run the pipeline locally, and contribute new features or analyzers to **Neko Workshop**.

---

## 🛠️ Prerequisites

Make sure you have the following installed:
- **Node.js**: `v20.x` or higher
- **npm**: `v10.x` or higher
- **Git**

---

## 🚀 Local Development Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/nicodolas/nicodolas.git
   cd nicodolas
   ```
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Configure Environment Variables**:
   Create a `.env` file in the root of the project:
   ```ini
   GH_TOKEN=your_github_personal_access_token
   OPENROUTER_API_KEY=your_openrouter_api_key
   OPENROUTER_MODEL=google/gemini-2.5-flash
   ```
   *Note: A GitHub PAT (Personal Access Token) with public read access is sufficient. If you don't configure `GH_TOKEN`, the rate limit will fall back to 60 calls per hour.*

4. **Run Dev Server**:
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` to preview the retro workshop interface.

---

## 🔄 Running the Data Pipeline Locally

To test data collection and analysis before committing, run these scripts in order:

```bash
# 1. Fetch raw data from GitHub API
node src/scripts/fetch-raw-data.js

# 2. Run the 11 analyzers to process the raw data
node src/scripts/run-analyzers.js

# 3. Validate generated JSON layouts against schemas
node src/scripts/validate-json.js
```

---

## 🧪 Implementing a New Analyzer

If you need to analyze a new dimension of GitHub activity:
1. Create a new analyzer file in `src/analyzers/my-new-analyzer.js`.
2. Extend `BaseAnalyzer` and implement the `analyze()` method.
3. Define its typescript interface in `src/types/data-schemas.d.ts`.
4. Register the new analyzer in the pipeline runner: [run-analyzers.js](file:///D:/PersonalWebsite/src/scripts/run-analyzers.js).

---

## 🛡️ Code Quality Standards

### Linting & Type Checking
We maintain strict linting and type-checking rules. Run these checks locally before opening a pull request:
```bash
# Check code style and formatting
npm run lint

# Trigger Next.js static build to check TypeScript errors
npm run build
```
Any PR that breaks the TypeScript build or schema validation will fail the CI/CD checks.
