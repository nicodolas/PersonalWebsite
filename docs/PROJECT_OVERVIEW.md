# Neko OS — Project Overview

> **For AI agents:** Read this document first. It gives you the full picture of what this project is, what it does, and how it's structured. All other docs in this folder go deeper on specific subsystems.

---

## What is this?

**Neko OS** is a personal developer portfolio for Nguyễn Văn Hiếu (GitHub: `nicodolas`). It is designed to look and feel like a retro terminal operating system — complete with a boot sequence, a working terminal CLI, and a galaxy map of projects.

The portfolio is **fully data-driven**: all displayed content (projects, timeline, skills, achievements, etc.) is generated automatically from live GitHub data via a local data pipeline, then enriched with AI-generated summaries via OpenRouter/OpenAI.

**Live URL:** https://personalwebsite-4eb.pages.dev  
**GitHub:** https://github.com/nicodolas/PersonalWebsite

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16.2.9 (App Router, `output: 'export'` — static site) |
| Language | TypeScript 5, React 19 |
| Styling | Tailwind CSS v4 |
| Animation | GSAP 3.15 + ScrollTrigger |
| Icons | Lucide React |
| Deployment | Cloudflare Pages |
| Data pipeline | Node.js scripts (no framework) |
| AI enrichment | OpenRouter API (google/gemini-2.5-flash default) |
| Linting | ESLint 9, lint-staged, Husky |

**Key constraint:** `output: 'export'` means this is a **static export** — no server-side rendering, no API routes, no `getServerSideProps`. Everything runs client-side after the initial static HTML is served.

---

## Pages & Navigation

| Route | Component | Description |
|-------|-----------|-------------|
| `/` | `src/app/page.tsx` | Home/Nexus — stat cards, knowledge clusters, terminal callout |
| `/timeline` | `src/app/timeline/page.tsx` | Developer Eras Timeline — alternating slide-in with scrub line |
| `/galaxy` | `src/app/galaxy/page.tsx` | Project Galaxy Map — orbital SVG with planet nodes |
| `/skill-tree` | `src/app/skill-tree/page.tsx` | Gamified skill tree with XP system |
| `/achievements` | `src/app/achievements/page.tsx` | Achievement cards with shimmer reveal |
| `/brain` | `src/app/brain/page.tsx` | Thought streams, interest matrix, orbiting brain SVG |
| `/workshop-board` | `src/app/workshop-board/page.tsx` | Kanban board (Research / Building / Archived) |
| `/graveyard` | `src/app/graveyard/page.tsx` | Archived/failed projects with tombstone cards |
| `/experiment-log` | `src/app/experiment-log/page.tsx` | Lab-format project reports |
| `/terminal` | `src/app/terminal/page.tsx` | Standalone terminal page |

---

## Global Components

| Component | Purpose |
|-----------|---------|
| `LayoutWrapper` | Sticky header with nav, time clock, CPU simulator, footer. Wraps all pages. |
| `BootSequence` | Full-screen terminal boot animation on first visit. Loaded with `dynamic({ ssr: false })` to prevent hydration mismatch. |
| `Terminal` | Retro CLI with 15+ commands, XP system, theme switcher, guestbook, audio synthesizer. |

---

## Bilingual Content

The site supports Vietnamese + English. The convention is:
- **Static JSX strings** → English only (headings, labels, buttons)
- **Data content fields** → Both VI and EN: `{field.title_vi}` and `{field.title}` rendered together
- Footer badge `LANG: VI/EN` → intentionally kept as a design element, do not change

---

## Public Assets

| File | Purpose |
|------|---------|
| `public/favicon.svg` | Browser tab icon — neon green cat ears + terminal |
| `public/neko-logo.svg` | 64px logo for general use |
| `public/og-image.svg` | 1200×630 Open Graph image for social sharing |

Default Next.js placeholder SVGs (globe, vercel, window, file, next) have been removed.
