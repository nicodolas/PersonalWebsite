# Data Quality Recovery Report

**Generated:** 2026-06-18  
**Phase:** Data Quality Recovery  
**Status:** ✅ Complete

---

## Summary

The Nexus data layer has been repaired. All five audit findings have been addressed.  
No features were added. No UI was modified. No workflows were created. Only data correctness was improved.

---

## Audit Findings → Fixes

| # | Finding | Root Cause | Fix Applied |
|---|---------|-----------|-------------|
| 1 | `bp.tech_stack` used instead of `bp.tech` | Property name mismatch in backup project mapping | Corrected to `bp.tech` (applied in prior session) |
| 2 | `technology-map.json` contains `"links": []` | `buildTechnologyMap` did not normalize tech names before co-occurrence; raw GitHub `language` (singular) + empty `topics` = no overlap | Applied `normalizeTechnology()` to all tech names before counting; changed link key separator from `-` to `\|` to avoid splitting issues |
| 3 | `knowledge-clusters.json` heavily skewed to `systems-legacy` | Cluster classification used substring `includes()` with keywords like `"js"`, `"ts"` which matched `"JavaScript"`, `"TypeScript"` incorrectly | Replaced substring matching with exact `Set.has()` lookup using normalized tech IDs |
| 4 | `repository-network.json` relationships incomplete | Tech intersection used raw, unnormalized values; backup project tech arrays were empty due to bug #1 | Pre-normalize all tech lists; exclude noise techs (HTML, CSS) from intersection |
| 5 | HTML incorrectly appears as dominant technology | HTML counted per-repo as GitHub's `language` field often reports HTML; no noise filtering | Added `NOISE_TECHS` set to filter HTML/CSS from tech graph nodes and co-occurrence links |

---

## Before / After Metrics

### technology-map.json

| Metric | Before | After |
|--------|--------|-------|
| Node count | 10 | 23 |
| Link count | **0** | **52** |
| Top technology | HTML (count: 5) | JavaScript (count: 5) |
| Frameworks detected | 0 | 6 (Next.js, React, Express, TanStack Query, Shadcn UI, Zustand) |
| Database types detected | 0 | 2 (PostgreSQL, Prisma) |
| Tool types detected | 0 | 3 (n8n, SePay, Netlify) |
| AI types detected | 0 | 1 (AI API) |
| UI types detected | 0 | 1 (Three.js) |
| HTML as dominant | ✅ Yes (count: 5) | ❌ Filtered as noise |

### Sample Links (Before: Empty)

| Source | Target | Weight |
|--------|--------|--------|
| Next.js | Node.js | 2 |
| Express | Next.js | 2 |
| Next.js | PostgreSQL | 2 |
| Express | Node.js | 2 |
| Node.js | PostgreSQL | 2 |
| Express | PostgreSQL | 2 |
| React | Three.js | 1 |
| React | Zustand | 1 |
| AI API | React | 1 |
| Three.js | Zustand | 1 |

### knowledge-clusters.json

| Cluster | Technologies Before | Technologies After |
|---------|--------------------|--------------------|
| AI & Agentic Systems | Python (1 tech) | Python, AI API (2 techs) |
| Modern Web & Enterprise ERP | (0 techs) | JavaScript, TypeScript, Next.js, Node.js, Express, PostgreSQL, React, Blade, Dart, Handlebars, TanStack Query, Shadcn UI, Prisma, SePay, Netlify, Three.js, Zustand (17 techs) |
| Automation & CI/CD | (0 techs) | n8n (1 tech) |
| Systems & Legacy | HTML, JavaScript, C#, C++, TypeScript, Blade, Dart, Handlebars, Lua (9 techs) | C#, C++, Lua (3 techs) |

| Cluster | Repositories Before | Repositories After |
|---------|--------------------|--------------------|
| AI & Agentic Systems | 0 repos | 1 repo (Age Prediction App) |
| Modern Web & Enterprise ERP | 6 repos | 8 repos (+ReviewLecturers_HUIT, 3D Portfolio) |
| Automation & CI/CD | 0 repos | 0 repos |
| Systems & Legacy | 21 repos | 19 repos (correct redistribution) |

### repository-network.json

| Metric | Before | After |
|--------|--------|-------|
| Link count | 18 | 16 |
| Backup project nodes with `tech: []` | 4/4 (100%) | **0/4 (0%)** |
| Backup project nodes with populated tech | 0/4 | 4/4 |
| Max link weight | 1 | **4** (ReviewLecturers ↔ Milk-tea Shop) |
| Cross-source links (GitHub ↔ backup) | 0 | 6 (new connections) |

### Sample Repository Nodes (Before → After)

**ReviewLecturers_HUIT:**
- Before: `tech: [], group: "Unknown"`
- After: `tech: ["Next.js", "Node.js", "Express", "TypeScript", "TanStack Query", "Shadcn UI", "PostgreSQL", "Prisma", "n8n"], group: "Next.js"`

**Milk-tea Web Shop:**
- Before: `tech: [], group: "Unknown"`
- After: `tech: ["Node.js", "Express", "Next.js", "JavaScript", "PostgreSQL", "SePay", "Netlify"], group: "Node.js"`

**3D Portfolio:**
- Before: `tech: [], group: "Unknown"`
- After: `tech: ["React", "Three.js", "Zustand"], group: "React"`

**Age Prediction App:**
- Before: `tech: [], group: "Unknown"`
- After: `tech: ["React", "AI API"], group: "React"`

---

## Strongest Connection

**ReviewLecturers_HUIT ↔ Milk-tea Web Shop** (weight: 4)  
Shared normalized technologies: `Node.js`, `Express`, `Next.js`, `PostgreSQL`

---

## Normalization Table

| Raw Input | Normalized Output |
|-----------|-------------------|
| `Next.js 16` | `Next.js` |
| `express.js` | `Express` |
| `React` | `React` |
| `R3F` | `Three.js` |
| `Async/Await` | *(filtered: not a technology)* |
| `Shadcn UI` | `Shadcn UI` |
| `TanStack Query` | `TanStack Query` |
| `SePay` | `SePay` |

---

## Remaining Issues

| Issue | Severity | Notes |
|-------|----------|-------|
| Many GitHub repos have `language: null` and `topics: []` | Low | This is a GitHub API limitation — repos with no pushed code or only README have no detected language. Cannot be fixed at the analyzer level. |
| Automation cluster has 0 repos | Low | No GitHub repos are tagged with n8n/workflow topics. The ReviewLecturers project uses n8n but is correctly classified as web-erp due to its primary stack. |
| AI insights use cached/default text (no API key) | Medium | OpenRouter API key not configured locally. In CI, the key is provided via secrets. Default insights are reasonable fallbacks. |

---

## Files Modified

| File | Change |
|------|--------|
| `src/analyzers/nexus-analyzer.js` | Added `NOISE_TECHS` static set, expanded `normalizeTechnology()` with 15 new entries, rewrote `buildTechnologyMap()` to normalize + filter noise, added `normalizeTechList()` helper, rewrote `buildRepositoryNetwork()` to use normalized tech, replaced substring cluster matching with exact `Set.has()` lookup |

## Files Generated

| File | Nodes | Links |
|------|-------|-------|
| `technology-map.json` | 23 | 52 |
| `interest-map.json` | *(unchanged structure)* | *(unchanged structure)* |
| `repository-network.json` | 23 | 16 |
| `knowledge-clusters.json` | 4 clusters | N/A |
