# Deployment

---

## Platform

**Cloudflare Pages** — static hosting with automatic deploys on push to `main`.

**Live URL:** https://www.nekovibecoder.site/

---

## Build Configuration

```toml
# Cloudflare Pages build settings
Build command: npm run build
Build output directory: /out
Node.js version: 20
```

Next.js is configured as a **static export** (`output: 'export'` in `next.config.ts`). This means:
- No server-side rendering
- No API routes
- No `next/image` optimization (set `images: { unoptimized: true }`)
- Output goes to `/out` directory

---

## Branch Strategy

| Branch | Purpose |
|--------|---------|
| `main` | Production — auto-deploys to Cloudflare Pages |
| `feat/*` | Feature branches — create PR to merge to main |
| `data/auto-update-*` | Auto-created by `generate-data.yml` workflow — deleted after merge |
| `data/weekly-*` | Auto-created by `weekly-analysis.yml` workflow — deleted after merge |

**Never push directly to `main`** — always use a feature branch + PR.

---

## GitHub Actions Workflows

Five workflows in `.github/workflows/`:

| Workflow | Trigger | Purpose |
|----------|---------|---------|
| `generate-data.yml` | Daily at 02:00 UTC + manual | Runs full data pipeline, commits to `data/auto-update-*` branch, opens PR with `--squash --auto --delete-branch` |
| `weekly-analysis.yml` | Sundays at 04:00 UTC + manual | Same as above but clears AI cache first for forced regeneration. Branch: `data/weekly-*` |
| `pr-check.yml` | PR opened/updated | Validates the build compiles and type-checks pass before merge |
| `production-build.yml` | Push to `main` | Final build verification on main branch |
| `validate-data.yml` | PR opened/updated | Runs `src/scripts/validate-json.js` to ensure generated data is valid |

**Auto-merge:** `generate-data.yml` and `weekly-analysis.yml` use `gh pr merge --auto --delete-branch`. This requires **"Allow auto-merge"** to be enabled in the repo Settings → General. If auto-merge is not enabled, branches will pile up — the PR must be merged manually.

---

## Environment Variables

Set these in Cloudflare Pages dashboard under **Settings → Environment Variables**:

| Variable | Required | Purpose |
|----------|----------|---------|
| `GH_TOKEN` | Yes | GitHub PAT for data pipeline |
| `OPENROUTER_API_KEY` | Optional | OpenRouter key for AI summaries |
| `OPENROUTER_BASE_URL` | Optional | OpenRouter base URL override |
| `OPENROUTER_MODEL` | Optional | OpenRouter model name (default: `google/gemini-2.5-flash`) |
| `NEXT_PUBLIC_SITE_URL` | Yes | Site URL for OG metadata |

For GitHub Actions, set `GH_TOKEN`, `OPENROUTER_API_KEY`, `OPENROUTER_BASE_URL`, and `OPENROUTER_MODEL` as **repository secrets** in Settings → Secrets and variables → Actions.

`.env` is gitignored — never commit it.

---

## Local Build

```bash
npm run build   # generates /out static export
npm run dev     # dev server at localhost:3000
```

---

## Pre-commit Hooks

Husky runs `lint-staged` on commit:
- `*.{ts,tsx,js,jsx,mjs}` → `eslint --fix`

Hook file: `.husky/pre-commit`
```sh
node_modules/.bin/lint-staged
```

If lint-staged fails: check `node_modules/.bin/lint-staged` exists. Run `npm install` if missing.
