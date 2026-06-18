# Neko Workshop Independent Analyzers

This document details the 11 independent data analyzers located in `src/analyzers/` that process raw GitHub data and output structural JSON representations.

---

## 🛠️ The Base Class: `BaseAnalyzer`

Every analyzer inherits from `BaseAnalyzer` (`src/analyzers/base-analyzer.js`), which provides shared capabilities:
- **File System Utilities**: Helpers for reading raw files and writing to `src/data/generated/`.
- **AI Integration**: Access to the decoupled AI Provider.
- **SHA-256 Hashing & Caching**: Automatic caching of AI prompts based on input content hashes to minimize cost.
- **Graceful Fallbacks**: Fallback mechanism to output deterministic defaults if API limits are hit or variables are missing.

---

## 📋 Detail of the 11 Analyzers

### 1. Repository Classifier
- **Purpose**: Classifies repositories based on traits rather than treating them identically.
- **Input**: `src/data/raw/repos.json`
- **Output**: `src/data/generated/classified-repos.json`
- **Algorithm**: Deterministic classification based on repository properties (stars, size, topics, name). Classifies into: `learning` (tutorials, lessons), `production` (deployed applications), `experimental` (explorations, hacks), and `tooling` (scripts, helper templates).
- **Failure Handling**: Fallback to marking all repositories as `experimental`.

### 2. Timeline Analyzer
- **Purpose**: Maps the developer's journey into chronological technology eras and milestones.
- **Input**: `src/data/generated/classified-repos.json`
- **Output**: `src/data/generated/timeline.json` & `timeline-summary.json`
- **Algorithm**: Groups repositories and commit metrics by year. Uses OpenRouter to generate short, compelling era summaries and a high-level journey description based on the year's active languages and project counts.
- **Dependencies**: Repository Classifier.
- **Caching**: SHA-256 hash of the grouped yearly stats.

### 3. Brain Analyzer
- **Purpose**: Captures current technology focus, interests, and research directions.
- **Input**: `src/data/raw/commits.json`, `src/data/raw/repos.json`
- **Output**: `src/data/generated/brain.json`
- **Algorithm**: Counts active repositories and language frequencies in the last 30 days to calculate a deterministic interest score. Uses AI to synthesize a "curiosity summary" describing what the developer is exploring.
- **Caching**: Hash of language frequencies and commit counts.

### 4. Technology Trend Analyzer
- **Purpose**: Tracks tech stack usage changes (rising vs. falling technologies).
- **Input**: `src/data/raw/repos.json`
- **Output**: `src/data/generated/technology-trends.json`
- **Algorithm**: Compares language byte counts and usage frequencies across the codebase. Measures velocity and classifies tech into `rising`, `stable`, or `declining`.
- **Failure Handling**: Default to marking primary languages as stable.

### 5. Achievement Analyzer
- **Purpose**: Discovers developer milestones (e.g., repository counts, commit thresholds).
- **Input**: `src/data/raw/profile.json`, `src/data/raw/repos.json`
- **Output**: `src/data/generated/achievements.json`
- **Algorithm**: Deterministic rule checker. Checks for achievements like: `first-repo`, `10-repos`, `mcp-pioneer` (if MCP topic is present), and `commit-master`.
- **Failure Handling**: Returns empty achievements array.

### 6. Workshop Analyzer
- **Purpose**: Builds a Kanban board representing current active projects, ideas, and backlogged tools.
- **Input**: `src/data/generated/classified-repos.json`
- **Output**: `src/data/generated/workshop.json`
- **Algorithm**: Maps repositories to board columns (`researching`, `building`, `archived`) based on their `archived` flag, last update date, and classifier status.
- **Dependencies**: Repository Classifier.

### 7. Experiment Analyzer
- **Purpose**: Translates standard repositories into structured technical experiments.
- **Input**: `src/data/raw/repos.json`
- **Output**: `src/data/generated/experiments.json` & `experiment-insights.json`
- **Algorithm**: Generates a hypothesis-style report (Problem → Approach → Outcome → Lessons learned) for each repository. Uses OpenRouter to write concise narratives based on readme texts and topics.
- **Caching**: Hash of repository readme files and descriptions.

### 8. Graveyard Analyzer
- **Purpose**: Document archived projects, old experiments, and lessons learned from failures.
- **Input**: `src/data/raw/repos.json`
- **Output**: `src/data/generated/graveyard.json`
- **Algorithm**: Extracts repositories that are marked as `archived` or have not been updated for over a year. Uses OpenRouter to draft "RIP reasons" and "lessons learned" from the project's metadata.
- **Caching**: Hash of the repository metadata.

### 9. Skill Tree Analyzer
- **Purpose**: Renders knowledge domains as RPG-style unlockable trees.
- **Input**: `src/data/generated/technology-trends.json`
- **Output**: `src/data/generated/skill-tree.json`
- **Algorithm**: Map tech tags to three core skill paths: `Automation`, `AI Systems`, and `Web & ERP`. Status is unlocked or mastered depending on usage scores from the Trend Analyzer.
- **Dependencies**: Technology Trend Analyzer.

### 10. Changelog Analyzer
- **Purpose**: Generates monthly release notes describing the developer's growth.
- **Input**: `src/data/raw/commits.json`
- **Output**: `src/data/generated/changelog.json`
- **Algorithm**: Groups git commits by month. Determines key changes (Feat/Fix/Docs) and uses OpenRouter to synthesize monthly highlights (e.g. "Learned MCP", "Built AI Agent").
- **Caching**: Hash of the grouped commit messages.

### 11. Repository Graph Analyzer
- **Purpose**: Maps relationships between repositories based on shared technologies and topics.
- **Input**: `src/data/raw/repos.json`
- **Output**: `src/data/generated/repository-map.json` & `galaxy.json`
- **Algorithm**: Generates a node-link graph. Nodes represent repositories and languages; edges represent tech stack commonalities and dependencies.
