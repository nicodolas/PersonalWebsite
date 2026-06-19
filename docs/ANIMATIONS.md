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

The Galaxy page (`src/app/galaxy/page.tsx`) uses a **Three.js WebGL scene** rendered inside `src/components/GalaxyScene.tsx`. The component is loaded with `dynamic({ ssr: false })` to prevent SSR issues.

- Real 3D scene with `THREE.WebGLRenderer`, `PerspectiveCamera`, `MeshStandardMaterial` planets
- `requestAnimationFrame` loop inside `GalaxyScene` handles planet orbits + camera auto-rotation
- Drag rotates camera (`theta`/`phi` spherical coords), scroll zooms (`radius`)
- `isOrbitingRef` controls freeze/resume; toggled via `window.dispatchEvent(new CustomEvent("galaxy:toggleOrbit"))`
- Raycaster handles planet click/tap selection
- Labels are `THREE.Sprite` with `CanvasTexture` text
- 2500-point star field with `THREE.Points`, colored per star type
- Connection lines between nodes update positions every frame via `BufferAttribute`

---

## BootSequence — SSR Guard

`BootSequence` is loaded with `dynamic({ ssr: false })` in `src/app/page.tsx` to prevent hydration mismatch from `Date` and `Math.random()` values. **Do not remove this dynamic import.**
