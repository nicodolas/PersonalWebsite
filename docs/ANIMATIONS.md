# Animation System

All animations use GSAP 3.15 + ScrollTrigger. This document describes the shared infrastructure and per-page patterns.

---

## Shared Infrastructure

### `src/lib/gsap-config.ts`
Single entry point for GSAP. Registers ScrollTrigger **once** at module evaluation time (with SSR guard):
```typescript
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
if (typeof window !== "undefined") gsap.registerPlugin(ScrollTrigger);
export { gsap, ScrollTrigger };
```

**Rule:** Never import `gsap` or `ScrollTrigger` directly from `"gsap"` in page components — always use `"@/lib/gsap-config"`.

### `src/lib/animations.ts`
Exports 6 reusable animation presets:

| Function | Description |
|----------|-------------|
| `fadeInUp(targets, trigger, stagger?)` | Scroll-triggered fade + y-rise, `once: true` |
| `staggerCards(targets, trigger)` | `ScrollTrigger.batch` cascade reveal with FOUC prevention |
| `counterUp(element, target, suffix)` | Tween numeric display 0→target on viewport entry |
| `shimmerEffect(targets)` | Sweeps `.shimmer-overlay` child left→right |
| `glowPulse(targets)` | Infinite `box-shadow` yoyo pulse on scroll entry |
| `floatLoop(targets, amplitude?)` | Infinite y-oscillation with random phase stagger |

---

## Page-Level Pattern

Every page follows this exact pattern:
```typescript
useEffect(() => {
  if (!containerRef.current) return;
  const ctx = gsap.context(() => {
    // animations here
  }, containerRef);  // scope limits selectors to this component
  return () => ctx.revert();  // cleanup on unmount
}, []);
```

**Rules:**
- All GSAP inside `useEffect` or `useLayoutEffect` — never at module level
- Always return `() => ctx.revert()` for cleanup
- `ScrollTrigger` with `scrub` → do NOT add `once` property (they conflict)
- `containerRef` must be attached to the root div of each page

---

## Reduced Motion

Vestibular-sensitive animations (floatLoop, shimmerEffect, parallax scrub) are wrapped in `gsap.matchMedia()`:
```typescript
const mm = gsap.matchMedia();
mm.add("(prefers-reduced-motion: no-preference)", () => { /* full animations */ });
mm.add("(prefers-reduced-motion: reduce)", () => { gsap.set(targets, { autoAlpha: 1, y: 0 }); });
```

---

## Galaxy Page — Special Case

The Galaxy page (`src/app/galaxy/page.tsx`) uses a **custom `requestAnimationFrame` orbit loop** — NOT GSAP tweens — to animate planet positions. This is because planets need live `x/y` coordinates to update SVG edge `<line>` positions simultaneously.

- `orbitAnglesRef` tracks current angle per planet
- `livePositions` state drives both planet `<circle>` and edge `<line>` coordinates
- `isOrbiting` state controls freeze/resume via a header button

---

## BootSequence — SSR Guard

`BootSequence` is loaded with `dynamic({ ssr: false })` in `src/app/page.tsx` to prevent hydration mismatch from `Date` and `Math.random()` values. **Do not remove this dynamic import.**
