<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

---

## AI Agent Instructions

**Read `docs/PROJECT_OVERVIEW.md` first.** It gives the full picture in ~5 minutes.

### Quick Reference

| Question | Read this |
|----------|-----------|
| What is this project? | `docs/PROJECT_OVERVIEW.md` |
| How do animations work? | `docs/ANIMATIONS.md` |
| How is data generated? | `docs/DATA_PIPELINE.md` |
| How to deploy? | `docs/DEPLOYMENT.md` |
| Code style and rules? | `docs/CONVENTIONS.md` |

### Critical Rules (read before touching any code)

1. **Static export** — `next.config.ts` has `output: 'export'`. No Server Components, no API routes.
2. **GSAP imports** — always `@/lib/gsap-config`, never `"gsap"` directly in components.
3. **BootSequence** — loaded with `dynamic({ ssr: false })`. Do NOT remove this or hydration errors return.
4. **Generated data** — `src/data/generated/*.json` is auto-generated. Never manually edit these files.
5. **Language** — static JSX strings are English only. Data fields like `{field.title_vi}` are untouched.

### After Making Changes

If you make a significant change, **update the relevant doc in `docs/`** so the next AI session has accurate context:

- New/changed page → update `docs/PROJECT_OVERVIEW.md`
- Animation system change → update `docs/ANIMATIONS.md`
- Data pipeline change → update `docs/DATA_PIPELINE.md`
- New convention or rule → update `docs/CONVENTIONS.md`
- Deployment change → update `docs/DEPLOYMENT.md`

This keeps the docs as the live source of truth for every AI session.
