# Deployment

---

## Platform

**Cloudflare Pages** — static hosting with automatic deploys on push to `main`.

**Live URL:** https://personalwebsite-4eb.pages.dev

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

**Never push directly to `main`** — always use a feature branch + PR.

---

## Environment Variables

Set these in Cloudflare Pages dashboard under **Settings → Environment Variables**:

| Variable | Required | Purpose |
|----------|----------|---------|
| `GH_TOKEN` | Yes | GitHub PAT for data pipeline |
| `OPENAI_API_KEY` | Optional | OpenRouter key for AI summaries |
| `NEXT_PUBLIC_SITE_URL` | Yes | Site URL for OG metadata |

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
