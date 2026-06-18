# Neko Workshop Deployment Guide

This document covers compiling, validating, and deploying the static website to **Cloudflare Pages**.

---

## ⚡ Deployment Model

Neko Workshop is deployed as a 100% static application:
- **Build Output**: Static HTML, CSS, JavaScript, and JSON files generated at compile-time.
- **Hosting**: Distributed via Cloudflare Pages edge networks for sub-second page loads.
- **API Call Cost**: Zero runtime backend costs. All calculations are pre-compiled.

---

## 🏗️ Next.js Static Export Configuration

Static exports are configured in [next.config.ts](file:///D:/PersonalWebsite/next.config.ts):
```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
```

### Static Constraints Rules
1. **No SSR/ISR Routes**: Since the build output is static, Next.js dynamic routes (e.g. standard route handlers, dynamic sitemaps) must export `export const dynamic = "force-static"` in their route files (e.g. `robots.ts` and `sitemap.ts`).
2. **Image Optimization**: Local Next.js Image components cannot use Vercel-specific serverless image optimization. We configure `unoptimized: true` so images are rendered directly as static SVGs/PNGs.

---

## 🚀 Cloudflare Pages Configuration

### Build Settings
When connecting your GitHub repository to Cloudflare Pages, use the following build configuration:
- **Framework Preset**: `Next.js (Static HTML Export)`
- **Build Command**: `npm run build`
- **Build Output Directory**: `out`

### Environment Variables
Configure these variables in your Cloudflare Pages dashboard:
- `NODE_VERSION`: `20` or higher.
- `NEXT_TELEMETRY_DISABLED`: `1` (Recommended).

---

## 🤖 Continuous Deployment via GitHub Actions

Deployments are coordinated by the [.github/workflows/deploy.yml](file:///D:/PersonalWebsite/.github/workflows/deploy.yml) workflow:
- **Preview Deployments**: Runs on pull requests. Deploys to a temporary preview URL so you can inspect changes.
- **Production Deployments**: Runs when commits are pushed or merged into the `main` branch. Updates the live `nekovibecoder.site` site.

### 🛡️ Source Code Immutability Guard
As a security precaution, all deployment workflows verify that no source code files have been modified by automatic runners. This is enforced by `ci-safety-check.js` before any auto-commits are executed. If any file outside the approved mutable data folders is modified, the deployment run will immediately fail to prevent accidental overrides of UI components or configs.

---

## 🛡️ Rollback & Incident Recovery Strategy

Because the website compiles down to static assets:
1. **Instant Rollback**: If a deployment breaks, go to the Cloudflare Pages dashboard, select a previous successful build, and click **Rollback to this deployment**. This will instantly revert the live traffic with zero downtime.
2. **Commit Rollback**: If the data pipeline generates invalid JSON data, revert the commit containing the broken JSON in the `main` branch. GitHub Actions will auto-build and overwrite the broken static deploy.
