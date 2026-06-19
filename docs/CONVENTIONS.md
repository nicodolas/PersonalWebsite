# Code Conventions & Rules

Rules that apply to every file in this project.

---

## TypeScript / React

- All components are `"use client"` — this is a static export site, no Server Components used in practice
- `containerRef` is always `useRef<HTMLDivElement>(null)` on the root div of each page
- GSAP is always inside `useEffect` (or via `useGSAP` from `@gsap/react`), wrapped in `gsap.context(callback, containerRef)`, cleanup via `ctx.revert()`
- Never import from `"gsap"` directly in page/component files — use `"@/lib/gsap-config"`
- `@gsap/react` is installed — use `useGSAP` hook from `@gsap/react` as the preferred pattern for new components
- Three.js (`three`) is used **only** in `src/components/GalaxyScene.tsx` — import directly from `"three"`, no wrapper needed
- Three.js components must be loaded with `dynamic({ ssr: false })` — they use `window`, `canvas`, and `requestAnimationFrame` which are not available server-side

---

## Data

- Page components import data from `src/data/generated/*.json` — these are auto-generated, do not manually edit
- Manual curated data lives in `src/data/projects-backup.json` and `src/data/profile-backup.json`
- Static personal data: `src/data/dna.json` (traits, favorite languages, etc.)
- All generated files have the shape: `{ version: number, generatedAt: string, data: T }`
- TypeScript types for generated data shapes live in `src/types/data-schemas.d.ts`
- TypeScript ambient module declarations for backup JSON files live in `src/types/json.d.ts` — add a new `declare module` block here if you add a new backup JSON import that TypeScript cannot resolve via path alias

---

## Language Standardization

- **Static JSX string literals** (headings, labels, buttons, subtitles) → English only
- **Data content fields** rendered from JSON (e.g. `{era.title_vi}`, `{cluster.description_vi}`) → keep as-is, never translate
- Footer `LANG: VI/EN` badge → never change
- After any language change: verify no Vietnamese characters (U+00C0–U+1EF9) remain in static JSX

---

## Styling

- Tailwind CSS v4 (CSS-first config)
- Color palette (design tokens):
  - Terminal green: `#00ff66`
  - Terminal blue: `#00ccff`
  - Terminal purple: `#bd93f9`
  - Terminal orange: `#ffb86c`
  - Terminal red: `#ff5555`
  - Background: `#05070a`
  - Card bg: `#090d16`
- Font: Geist Mono (monospace) everywhere
- All animations are GSAP — avoid CSS `transition` or `animation` on elements GSAP controls

---

## Git

- Branch naming: `feat/feature-name`, `fix/bug-description`, `chore/task`
- Commit messages: conventional commits format (`feat:`, `fix:`, `chore:`, `docs:`, `refactor:`)
- `.env` is gitignored — never commit secrets
- `out/` (build output) is gitignored — never commit

---

## Updating `docs/`

**When an AI agent makes a significant change**, update the relevant doc in `docs/`:

| Change type | Update this doc |
|-------------|-----------------|
| New page or route | `PROJECT_OVERVIEW.md` |
| Animation system change | `ANIMATIONS.md` |
| Data pipeline change | `DATA_PIPELINE.md` |
| Deployment/CI change | `DEPLOYMENT.md` |
| New code convention | `CONVENTIONS.md` (this file) |
| New component or major feature | create new doc or update relevant one |

---

## Files to Never Modify

- `src/data/generated/*.json` — auto-generated, will be overwritten by pipeline
- `src/data/raw/*.json` — raw GitHub API data, auto-fetched
- `.next/` — build artifacts
- `out/` — static export output
- `node_modules/` — package installs

---

## Three.js / WebGL

- Three.js is scoped to `src/components/GalaxyScene.tsx` only — do not add it to other pages without good reason
- Always dispose renderer and remove canvas on unmount: `renderer.dispose()` + `mount.removeChild(renderer.domElement)`
- Use `renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))` to cap resolution on high-DPI screens
- All mouse/touch/wheel event listeners added inside `useEffect` must be cleaned up in the return function
- Raycaster click vs drag: track `isDraggingRef` — only fire `onSelectNode` if drag distance was small
- Orbit toggle communicates via `window.dispatchEvent(new CustomEvent("galaxy:toggleOrbit"))` — no prop drilling needed
