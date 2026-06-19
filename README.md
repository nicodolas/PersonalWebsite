# Neko OS — Personal Portfolio

> A retro terminal OS-themed developer portfolio for [Nguyễn Văn Hiếu](https://github.com/nicodolas).

**Live:** https://www.nekovibecoder.site/

---

## What is this?

Neko OS is a fully data-driven portfolio designed to look and feel like a retro terminal operating system — complete with a boot sequence, a working in-browser CLI, and a galaxy map of projects. All displayed content is auto-generated from live GitHub data and enriched with AI-generated summaries.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16.2.9 (App Router, static export) |
| Language | TypeScript 5, React 19 |
| Styling | Tailwind CSS v4 |
| Animation | GSAP 3.15 + ScrollTrigger |
| 3D rendering | Three.js (galaxy page — WebGL, client-side only) |
| Icons | Lucide React |
| Deployment | Cloudflare Pages |
| Data pipeline | Node.js scripts |
| AI enrichment | OpenRouter API (google/gemini-2.5-flash) |
| Linting | ESLint 9, lint-staged, Husky |

> **Static export:** `output: 'export'` — no SSR, no API routes, no server components.

---

## Pages

| Route | Description |
|-------|-------------|
| `/` | Home / Nexus — stat cards, knowledge clusters, terminal callout |
| `/timeline` | Developer Eras Timeline |
| `/galaxy` | Project Galaxy Map — real-time 3D WebGL scene (Three.js) with orbiting planet nodes |
| `/skill-tree` | Gamified skill tree with XP system |
| `/achievements` | Achievement cards with shimmer reveal |
| `/brain` | Thought streams, interest matrix, orbiting brain SVG |
| `/workshop-board` | Kanban board (Research / Building / Archived) |
| `/graveyard` | Archived/failed projects with tombstone cards |
| `/experiment-log` | Lab-format project reports |
| `/terminal` | Standalone retro terminal page |

---

## Data Pipeline

All content is generated — nothing is hardcoded.

```
GitHub API
    │
    ▼
scripts/fetch-github-data.js
    │  → src/data/raw/*.json
    ▼
src/scripts/run-analyzers.js   (12 analyzers)
    │
    ▼
src/data/generated/*.json      ← consumed by Next.js pages
```

### Running the pipeline

```bash
# 1. Fetch latest GitHub data
node scripts/fetch-github-data.js

# 2. Run all analyzers
node src/scripts/run-analyzers.js

# 3. Start dev server
npm run dev
```

---

## Getting Started

### Prerequisites

- Node.js 20+
- A [GitHub personal access token](https://github.com/settings/tokens) with `repo` scope
- (Optional) An [OpenRouter](https://openrouter.ai) API key for AI-enriched summaries

### Setup

```bash
git clone https://github.com/nicodolas/PersonalWebsite.git
cd PersonalWebsite
npm install
```

Create a `.env` file:

```env
GH_TOKEN=ghp_...                  # GitHub PAT (required)
OPENAI_API_KEY=sk-or-v1-...       # OpenRouter key (optional)
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

```bash
npm run dev   # dev server at localhost:3000
npm run build # static export to /out
```

---

## Environment Variables

| Variable | Required | Purpose |
|----------|----------|---------|
| `GH_TOKEN` | Yes | GitHub PAT for data pipeline |
| `OPENAI_API_KEY` | Optional | OpenRouter key for AI summaries |
| `NEXT_PUBLIC_SITE_URL` | Yes | Site URL for OG metadata |

> Never commit `.env` — it is gitignored.

---

## Deployment

Deployed on **Cloudflare Pages** with auto-deploy on push to `main`.

```
Build command:        npm run build
Build output:         /out
Node.js version:      20
```

Always use a feature branch and PR — never push directly to `main`.

---

## Key Rules (for contributors / AI agents)

1. **Static export** — no Server Components, no API routes.
2. **GSAP imports** — always use `@/lib/gsap-config`, never `"gsap"` directly.
3. **Three.js** — only used in `src/components/GalaxyScene.tsx`, loaded via `dynamic({ ssr: false })`. Import directly from `"three"`.
4. **BootSequence** — must stay loaded with `dynamic({ ssr: false })`.
5. **Generated data** — never manually edit `src/data/generated/*.json`.
6. **Language** — static JSX strings are English only; data fields like `{field.title_vi}` stay untouched.

See `docs/` for full documentation:

| Doc | Topic |
|-----|-------|
| `docs/PROJECT_OVERVIEW.md` | Architecture & pages |
| `docs/ANIMATIONS.md` | GSAP animation system |
| `docs/DATA_PIPELINE.md` | Data pipeline details |
| `docs/DEPLOYMENT.md` | Deployment & CI |
| `docs/CONVENTIONS.md` | Code style & rules |

---

## License

Private project — all rights reserved.
