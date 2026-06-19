# Data Pipeline

The portfolio content is 100% generated — not hardcoded. Here's how data flows from GitHub to the browser.

---

## Pipeline Overview

```
GitHub API
    │
    ▼
scripts/fetch-github-data.js
    │  → src/data/raw/github-profile.json
    │  → src/data/raw/github-repos.json
    │  → src/data/raw/github-events.json
    ▼
src/scripts/run-analyzers.js
    │  (runs 12 analyzers in sequence)
    │
    ▼
src/data/generated/*.json      ← consumed by Next.js pages
```

---

## Step 1 — Fetch Raw Data

**Script:** `scripts/fetch-github-data.js`

Calls GitHub API for user `nicodolas`:
- `GET /users/nicodolas` → profile
- `GET /users/nicodolas/repos?per_page=100` → all public repos
- `GET /users/nicodolas/events?per_page=100` → recent activity

Requires `GH_TOKEN` in `.env`. Falls back gracefully if API fails (uses existing cache).

Output saved to `src/data/raw/`.

---

## Step 2 — Run Analyzers

**Script:** `src/scripts/run-analyzers.js`

Runs 12 analyzer classes in sequence. Each reads from `src/data/raw/` + backup files, writes to `src/data/generated/`.

| # | Analyzer | Output file(s) |
|---|----------|---------------|
| 1 | `RepoClassifier` | `classified-repos.json` |
| 2 | `TimelineAnalyzer` | `timeline.json`, `timeline-summary.json` |
| 3 | `BrainAnalyzer` | `brain.json` |
| 4 | `TechTrendAnalyzer` | `technology-trends.json` |
| 5 | `AchievementAnalyzer` | `achievements.json` |
| 6 | `WorkshopAnalyzer` | `workshop.json` |
| 7 | `ExperimentAnalyzer` | `experiments.json`, `experiment-insights.json` |
| 8 | `GraveyardAnalyzer` | `graveyard.json` |
| 9 | `SkillTreeAnalyzer` | `skill-tree.json` |
| 10 | `ChangelogAnalyzer` | `changelog.json` |
| 11 | `RepoGraphAnalyzer` | `repository-map.json`, `galaxy.json` |
| 12 | `NexusAnalyzer` | `technology-map.json`, `interest-map.json`, `repository-network.json`, `knowledge-clusters.json` |
| — | (inline) | `technologies.json` |

---

## AI Enrichment

Some analyzers use AI to generate bilingual summaries. The AI layer lives in `src/lib/ai/`.

| File | Purpose |
|------|---------|
| `provider.js` | Abstract base class for AI providers |
| `openrouter.js` | OpenRouter API client (default: `google/gemini-2.5-flash`) |
| `prompts.js` | All system prompts and prompt templates |
| `cache.js` | File-based cache to avoid redundant API calls |

**Environment variables:**
```
OPENAI_API_KEY=sk-or-v1-...    # OpenRouter key (used via OPENAI_API_KEY)
GH_TOKEN=ghp_...               # GitHub PAT (classic, repo scope)
```

If no AI key is set, analyzers fall back to heuristic/deterministic outputs — the pipeline still runs.

---

## Backup Data

`src/data/projects-backup.json` and `src/data/profile-backup.json` are manual curated backups used to enrich GitHub API data with additional context (bilingual descriptions, status overrides, etc.). These are the source of truth for projects not on GitHub.

---

## Running the Pipeline Locally

```bash
# 1. Fetch latest GitHub data
node scripts/fetch-github-data.js

# 2. Run all analyzers (generates src/data/generated/*.json)
node src/scripts/run-analyzers.js

# 3. Start dev server
npm run dev
```

---

## Generated File Formats

All generated files follow this wrapper format:
```json
{
  "version": 1,
  "generatedAt": "2026-06-18T11:00:13.043Z",
  "data": { ... }
}
```

Page components import from `src/data/generated/` directly. TypeScript types are in `src/types/data-schemas.d.ts`.
