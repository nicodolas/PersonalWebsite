import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Register ScrollTrigger once at module evaluation time.
// The typeof window guard makes this SSR-safe: Next.js evaluates modules on the
// server where window is undefined, and calling registerPlugin there is a no-op
// at best and an error at worst.
if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

export { gsap, ScrollTrigger };
