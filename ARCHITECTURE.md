# Neko Workshop System Architecture

Welcome to the **Neko Workshop** architecture documentation. This document describes the design principles, directory structure, and runtime model of the platform.

---

## 🌌 Architectural Vision

Neko Workshop is designed not as a static portfolio or resume, but as a **living digital laboratory**. It dynamically tracks the developer's journey, technology exploration, achievements, and even failures. 

To achieve this at zero runtime cost and with maximum reliability, the architecture separates data gathering, analysis, and presentation into distinct, decoupled phases.

---

## 🏗️ Decoupled Data & View Pipeline

The core architecture follows a strict, one-way data flow:

```
GitHub APIs (Public Activity)
     ↓ (Daily fetch / Weekly deep-crawl)
Raw Data Layer (src/data/raw/*.json)
     ↓
Analyzer Layer (src/analyzers/*-analyzer.js) -- [Optional AI Enrichment via OpenRouter]
     ↓
Generated JSON Layer (src/data/generated/*.json)
     ↓
Presentation Layer (Next.js 15 App Router static export)
     ↓
Static Website (Cloudflare Pages CDN)
```

### Key Architectural Constraints
1. **No Direct Frontend API Calls**: The Next.js frontend **NEVER** calls GitHub APIs or OpenRouter APIs directly. This guarantees sub-second page loads, prevents API rate limiting, and eliminates client-side API key exposure.
2. **Deterministic-First Analysis**: The analyzers perform calculations, classifications, and relationship mapping deterministically using standard algorithms. AI is strictly reserved for narrative storytelling, summaries, and trend synthesis.
3. **AI Cost Optimization**: All OpenRouter API calls are cached using a hash-based change detection algorithm. If raw data and prompt templates do not change, no AI calls are made.
4. **Source Code Immutability & CI Safety**: Application source code files are strictly immutable for automation. GitHub Actions workflows may only modify and commit files inside approved directories (`src/data/generated/`, `src/data/cache/`). The `ci-safety-check.js` script actively enforces this boundary.

---

## 📂 Project Directory Structure

Here is the complete production-grade folder layout for Neko Workshop:

```
D:/PersonalWebsite/
├── .github/
│   └── workflows/
│       ├── generate-data.yml      # Daily data fetching + running analyzers
│       ├── weekly-analysis.yml    # Weekly deep era/trend narrative analysis
│       ├── validate-data.yml      # Schema validation for raw and generated JSON
│       ├── build-check.yml        # Lint and type-checking PRs
│       └── deploy.yml             # Cloudflare Pages static site deployment
├── src/
│   ├── app/                       # Next.js 15 App Router pages & visual routes
│   │   ├── layout.tsx             # Root page layout
│   │   ├── page.tsx               # Main landing page (Boot Sequence & Terminal)
│   │   ├── achievements/          # Dynamic achievements list
│   │   ├── brain/                 # Cognitive interests & research streams
│   │   ├── experiment-log/        # Log of repository-based experiments
│   │   ├── galaxy/                # Visual interactive galaxy graph of projects
│   │   ├── graveyard/             # Archived projects and lessons learned
│   │   ├── skill-tree/            # Game-style skill trees and unlocks
│   │   ├── timeline/              # Timeline eras and repository milestones
│   │   └── workshop-board/        # Kanban board of active/archived work
│   ├── components/                # Modular visual components (CRT screen, Boot, etc.)
│   ├── data/                      # Multi-tier data storage
│   │   ├── raw/                   # Raw GitHub API outputs (repos, commits, profile)
│   │   ├── generated/             # Target JSON files mapped directly to UI pages
│   │   ├── cache/                 # SHA-256 hash database for AI query caching
│   │   ├── schemas/               # JSON Schema files for automated validation
│   │   ├── profile-backup.json    # Off-line local developer profile backup
│   │   └── projects-backup.json   # Off-line local projects backup
│   ├── lib/
│   │   └── ai/                    # OpenRouter AI client wrapper and caching layers
│   │       ├── provider.ts        # AI Provider Interface
│   │       ├── openrouter.ts      # OpenRouter API client implementation
│   │       ├── cache.ts           # AICache file-backed hash detection
│   │       └── prompts.ts         # Pre-configured prompt templates for analyzers
│   ├── types/
│   │   └── data-schemas.d.ts      # TypeScript definitions for all generated JSONs
│   ├── scripts/
│   │   ├── fetch-raw-data.js      # Fetch raw GitHub data (with fallback handling)
│   │   ├── run-analyzers.js       # Dependency-ordered runner for all analyzers
│   │   └── validate-json.js       # JSON schema validator
│   └── analyzers/                 # 11 independent data analyzers
│       ├── base-analyzer.js       # Base class handling file system and AI caching
│       ├── repo-classifier.js     # Classifies repos (real, learning, test, etc.)
│       ├── timeline-analyzer.js   # Generates timeline.json and timeline-summary.json
│       ├── brain-analyzer.js      # Generates brain.json
│       ├── tech-trend-analyzer.js # Generates technology-trends.json
│       ├── achievement-analyzer.js# Generates achievements.json
│       ├── workshop-analyzer.js   # Generates workshop.json
│       ├── experiment-analyzer.js # Generates experiments.json and experiment-insights.json
│       ├── graveyard-analyzer.js  # Generates graveyard.json
│       ├── skill-tree-analyzer.js # Generates skill-tree.json
│       ├── changelog-analyzer.js  # Generates changelog.json
│       └── repo-graph-analyzer.js # Generates repository-map.json and galaxy.json
├── public/                        # Static assets (images, fonts, sounds)
├── tsconfig.json                  # TypeScript compiler settings
└── next.config.ts                 # Next.js configurations (static export)
```

---

## 🛠️ Folder Details & Responsibilities

### 1. `/src/app`
Contains Next.js App Router components. Every subfolder represents a page route on `nekovibecoder.site`. Page components use dynamic JSON imports from `/src/data/generated/*.json` to render content with 0 client-side API requests.

### 2. `/src/data`
* **`/raw`**: Store exact, unmodified results of GitHub REST/GraphQL API queries.
* **`/generated`**: Ready-to-use JSON structures used by Next.js components. 
* **`/cache`**: Holds `ai-cache.json` to prevent duplicate AI text generations.
* **`/schemas`**: Declares JSON Schemas to ensure analyzers produce correct properties.

### 3. `/src/lib/ai`
Exposes the AI abstraction. Analyzers request summaries, narratives, or insights by calling the generic `AIProvider` wrapper, which routes queries through `OpenRouter` and handles caching automatically.

### 4. `/src/analyzers`
Modular classes extending `BaseAnalyzer`. Each analyzer focuses on processing a specific slice of raw data, converting it into a single clean generated JSON schema.
