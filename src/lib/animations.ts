import { gsap, ScrollTrigger } from "@/lib/gsap-config";

/**
 * Scroll-triggered fade + rise from below. Kills itself after first fire (once: true).
 * @param targets  CSS selector string scoped to the caller's gsap.context
 * @param trigger  Trigger element or selector
 * @param stagger  Optional inter-element stagger in seconds (default 0.1)
 */
export function fadeInUp(
    targets: string,
    trigger: string | Element,
    stagger: number = 0.1
): void {
    gsap.from(targets, {
        y: 30,
        autoAlpha: 0,
        duration: 0.7,
        stagger,
        ease: "power2.out",
        scrollTrigger: {
            trigger,
            start: "top 85%",
            once: true,
        },
    });
}

/**
 * Cascade entrance for a grid/list of cards.
 * Combines y-slide + autoAlpha stagger via ScrollTrigger batch.
 * Calls gsap.set first to prevent FOUC.
 * @param targets  CSS selector for card elements
 * @param trigger  Scroll trigger element or selector
 */
export function staggerCards(
    targets: string,
    // trigger is part of the public API signature; ScrollTrigger.batch derives
    // its own trigger from each element, so the parameter is intentionally unused.
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _trigger: string | Element
): void {
    // Set initial hidden state immediately to prevent FOUC
    gsap.set(targets, { opacity: 0, y: 40 });

    ScrollTrigger.batch(targets, {
        onEnter: (elements) =>
            gsap.to(elements, {
                opacity: 1,
                y: 0,
                duration: 0.6,
                stagger: 0.08,
                ease: "power2.out",
                overwrite: true,
            }),
        start: "top 88%",
        once: true,
    });
}

/**
 * Animates a counter display from 0 to `target` when element enters viewport.
 * Updates element.textContent on each tick; appends `suffix` after the number.
 * Skips animation if `target` is not a valid number.
 * @param element  Direct DOM element reference
 * @param target   Numeric end value
 * @param suffix   Text appended after the number (e.g. " Repos")
 */
export function counterUp(element: Element, target: number, suffix: string): void {
    if (typeof target !== "number" || isNaN(target)) {
        return;
    }

    const counter = { val: 0 };
    gsap.to(counter, {
        val: target,
        duration: 1.5,
        ease: "power1.out",
        onUpdate() {
            element.textContent = `${Math.round(counter.val)}${suffix}`;
        },
        scrollTrigger: {
            trigger: element,
            start: "top 90%",
            once: true,
        },
    });
}

/**
 * Gradient shimmer sweep left-to-right across each target after it enters viewport.
 * Each target must contain a `.shimmer-overlay` child element; elements without
 * one are silently skipped.
 * @param targets  CSS selector string or array of elements
 */
export function shimmerEffect(targets: string | Element[]): void {
    const elements: Element[] =
        typeof targets === "string"
            ? Array.from(document.querySelectorAll(targets))
            : targets;

    elements.forEach((card) => {
        ScrollTrigger.create({
            trigger: card,
            start: "top 88%",
            once: true,
            onEnter() {
                const shimmerEl = card.querySelector(".shimmer-overlay");
                if (!shimmerEl) return;
                gsap.fromTo(
                    shimmerEl,
                    { x: "-100%", autoAlpha: 1 },
                    { x: "150%", autoAlpha: 0, duration: 0.8, delay: 0.3, ease: "power1.out" }
                );
            },
        });
    });
}

/**
 * Repeating border-glow pulse using box-shadow tween (repeat: -1, yoyo: true).
 * Triggered on scroll enter via ScrollTrigger.batch; runs indefinitely until
 * component unmounts and ctx.revert() is called.
 * @param targets  CSS selector string or array of elements
 */
export function glowPulse(targets: string | Element[]): void {
    ScrollTrigger.batch(targets as string, {
        onEnter(elements) {
            gsap.to(elements, {
                boxShadow:
                    "0 0 20px rgba(0,255,102,0.4), 0 0 40px rgba(0,255,102,0.15)",
                duration: 1.2,
                repeat: -1,
                yoyo: true,
                ease: "sine.inOut",
                stagger: 0.15,
            });
        },
        start: "top 85%",
        once: true,
    });
}

/**
 * Infinite gentle y-oscillation for SVG nodes or floating UI elements.
 * Staggered start offsets prevent lockstep motion.
 * @param targets    CSS selector string or array of elements
 * @param amplitude  Peak y offset in px (default 6)
 */
export function floatLoop(targets: string | Element[], amplitude: number = 6): void {
    gsap.to(targets as string, {
        y: amplitude,
        duration: 2.5,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        stagger: {
            each: 0.4,
            from: "random",
        },
    });
}
