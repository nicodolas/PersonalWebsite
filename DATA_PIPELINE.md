# Neko Workshop Data Pipeline

This document explains the data pipeline that powers **Neko Workshop**. The pipeline gathers raw data from GitHub, processes it using deterministic and AI-powered analyzers, and exports optimized JSON files for the static website.

---

## 🔁 Overview of the Pipeline Flow

The pipeline executes in three main phases:

```
[ Phase 1: Fetching ]
  - Checks GH_TOKEN
  - Queries REST/GraphQL APIs
  - Saves responses to src/data/raw/

[ Phase 2: Analyzing ]
  - Run Analyzers in dependency order
  - Uses AI caching to optimize OpenRouter API calls
  - Outputs structured data to src/data/generated/

[ Phase 3: Validating ]
  - Validates JSON format
  - Validates schemas against src/types/data-schemas.d.ts
```

---

## 📥 Phase 1: Raw Data Acquisition

The data fetching script is located at [fetch-raw-data.js](file:///D:/PersonalWebsite/src/scripts/fetch-raw-data.js).

### Responsibilities
1. **GitHub Auth & Rate Limit Handling**:
   - Queries GitHub APIs using `GH_TOKEN` environment variable.
   - If no token is provided, it falls back to unauthenticated public requests (subject to lower rate limits).
   - Gracefully handles 403/401 auth failures by using a self-healing local mock backup.
2. **Data Gathered**:
   - **User Profile**: Core user bio, public follower/following counts, creation dates.
   - **Repositories**: List of public repositories including sizes, languages, stars, forks, and tags.
   - **Commits**: Fetches the most recent commits (up to 100) across all public repositories to track coding activity.

---

## ⚙️ Phase 2: Analysis & Transformation

The pipeline coordinator is located at [run-analyzers.js](file:///D:/PersonalWebsite/src/scripts/run-analyzers.js).

### Execution Order (Dependency Order)
Some analyzers require output from other analyzers. They are executed in this specific order:
1. `RepoClassifier` -> Classifies all repositories (e.g., experimental vs. production).
2. `TimelineAnalyzer` -> Builds historical timeline milestones.
3. `BrainAnalyzer` -> Synthesizes interests and focus.
4. `TechTrendAnalyzer` -> Measures tech growth and decline patterns.
5. `AchievementAnalyzer` -> Flags milestones like commit counts or tech-specific achievements.
6. `WorkshopAnalyzer` -> Generates active/archived project statuses for the Kanban board.
7. `ExperimentAnalyzer` -> Converts repos to structured experiments (Problem -> Solution -> Lessons).
8. `GraveyardAnalyzer` -> Identifies archived/inactive projects.
9. `SkillTreeAnalyzer` -> Builds the game-style tech-tree.
10. `ChangelogAnalyzer` -> Aggregates monthly changelogs.
11. `RepoGraphAnalyzer` -> Outputs nodes and edges for the Interactive Project Galaxy.

---

## 📄 JSON Contract Specification

Every generated data file written to `src/data/generated/` conforms to a standard metadata envelope to guarantee data tracking and structural integrity:

```json
{
  "version": 1,
  "generatedAt": "2026-06-18T10:02:00.000Z",
  "data": {
    // Actual processed analyzer payload
  }
}
```

The Next.js presentation layers import these JSON files and read their payload directly via the `.data` property.

---

## 🛡️ Phase 3: Validation & CI Safety

Before code can be built or deployed, it must pass validation checks:

### 1. JSON Schema Validation
Managed by [validate-json.js](file:///D:/PersonalWebsite/src/scripts/validate-json.js).
- **Format Verification**: Assures that all JSON files are well-formed and readable.
- **Contract Verification**: Ensures the top-level `version`, `generatedAt`, and `data` wrapper keys are present.
- **Schema Validation**: Validates that all nested keys and types in `data` match the specifications in [data-schemas.d.ts](file:///D:/PersonalWebsite/src/types/data-schemas.d.ts).

### 2. CI Safety Check
Managed by [ci-safety-check.js](file:///D:/PersonalWebsite/src/scripts/ci-safety-check.js).
- **Git Status Scanning**: Scans the git workspace for modified or untracked files.
- **Source Code Protection**: If any changes are detected outside the approved directories (`src/data/generated/`, `src/data/cache/`, `src/data/raw/`, `src/data/reports/`, `docs/generated/`), it fails the workflow with exit code 1 to block illegal commits of source code.

---

## 🚀 Running the Pipeline

### Local Run
To fetch data and run all analyzers locally:
```bash
# Set environment variables
$env:GH_TOKEN="your-github-token"
$env:OPENROUTER_API_KEY="your-openrouter-key"

# Run the fetcher
node src/scripts/fetch-raw-data.js

# Run the analyzers
node src/scripts/run-analyzers.js

# Run the validator
node src/scripts/validate-json.js
```

### Automation (CI/CD)
The pipeline runs automatically in GitHub Actions.
- **Daily**: The `generate-data.yml` workflow runs at midnight UTC.
- **Commit/PR Hooks**: The `validate-data.yml` workflow ensures data consistency on every code push.
