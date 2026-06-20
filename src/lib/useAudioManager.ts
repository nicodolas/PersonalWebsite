"use client";

import { useEffect, useCallback, useRef } from "react";
import { usePathname } from "next/navigation";

// ── Route → track map ──────────────────────────────────────────────────────
export const ROUTE_MUSIC: Record<string, string> = {
    "/": "/music/home.mp3",
    "/terminal": "/music/terminal.mp3",
    "/workshop-board": "/music/workshop.mp3",
    "/timeline": "/music/timeline.mp3",
    "/galaxy": "/music/galaxy.mp3",
    "/achievements": "/music/achievements.mp3",
    "/brain": "/music/brain.mp3",
    "/skill-tree": "/music/skill-tree.mp3",
    "/experiment-log": "/music/experiment-log.mp3",
    "/graveyard": "/music/graveyard.mp3",
};

const DEFAULT_VOLUME = 0.32;
const FADE_IN_MS = 1200;
const FADE_OUT_MS = 500;

const VOLUME_KEY = "neko_music_volume";
const MUTED_KEY = "neko_music_muted";
const INTERACTION_KEY = "neko_has_interacted";

// ── Module-level singletons ────────────────────────────────────────────────
let audioEl: HTMLAudioElement | null = null;
let currentSrc = "";
let hasInteracted = false;
let isMutedState = false;
let userVolume = DEFAULT_VOLUME;   // volume khi không mute
let fadeRafId: number | null = null;
let interactionListenersAdded = false;

// ── Audio element ──────────────────────────────────────────────────────────
function getAudio(): HTMLAudioElement {
    if (!audioEl && typeof window !== "undefined") {
        audioEl = new Audio();
        audioEl.loop = true;
        audioEl.volume = 0;
        audioEl.preload = "none";
    }
    return audioEl!;
}

// ── Fade ──────────────────────────────────────────────────────────────────
function cancelFade() {
    if (fadeRafId !== null) {
        cancelAnimationFrame(fadeRafId);
        fadeRafId = null;
    }
}

function fadeTo(
    audio: HTMLAudioElement,
    from: number,
    to: number,
    durationMs: number,
    onDone?: () => void
) {
    cancelFade();
    const start = performance.now();
    audio.volume = Math.max(0, Math.min(1, from));

    const tick = (now: number) => {
        const elapsed = now - start;
        const progress = Math.min(elapsed / durationMs, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        audio.volume = Math.max(0, Math.min(1, from + (to - from) * eased));

        if (progress < 1) {
            fadeRafId = requestAnimationFrame(tick);
        } else {
            fadeRafId = null;
            audio.volume = Math.max(0, Math.min(1, to));
            onDone?.();
        }
    };

    fadeRafId = requestAnimationFrame(tick);
}

// ── Play / switch track ───────────────────────────────────────────────────
function startTrack(src: string) {
    const audio = getAudio();
    currentSrc = src;
    audio.src = src;
    audio.load();

    if (hasInteracted && !isMutedState) {
        audio.play().catch(() => { });
        fadeTo(audio, 0, userVolume, FADE_IN_MS);
    }
}

function switchTrack(src: string) {
    const audio = getAudio();
    if (src === currentSrc && !audio.paused) return;

    if (!audio.paused) {
        fadeTo(audio, audio.volume, 0, FADE_OUT_MS, () => {
            audio.pause();
            startTrack(src);
        });
    } else {
        startTrack(src);
    }
}

function stopAudio() {
    const audio = getAudio();
    if (!audio.paused) {
        fadeTo(audio, audio.volume, 0, FADE_OUT_MS, () => {
            audio.pause();
            currentSrc = "";
        });
    }
}

// ── Interaction unlock ────────────────────────────────────────────────────
export function registerInteractionUnlock() {
    if (typeof window === "undefined" || interactionListenersAdded) return;
    interactionListenersAdded = true;

    const unlock = () => {
        const audio = getAudio();

        if (!hasInteracted) {
            hasInteracted = true;
            localStorage.setItem(INTERACTION_KEY, "true");
        }

        // Luôn thử play nếu audio đang paused và không muted
        // (bao gồm cả trường hợp reload — hasInteracted đã true nhưng audio chưa play)
        if (audio.src && audio.paused && !isMutedState) {
            audio.play().catch(() => { });
            fadeTo(audio, 0, userVolume, FADE_IN_MS);
        }

        window.removeEventListener("click", unlock);
        window.removeEventListener("keydown", unlock);
        window.removeEventListener("touchstart", unlock);
        window.removeEventListener("neko:interaction", unlock);
    };

    window.addEventListener("click", unlock);
    window.addEventListener("keydown", unlock);
    window.addEventListener("touchstart", unlock, { passive: true });
    window.addEventListener("neko:interaction", unlock);
}

// ── Hook ──────────────────────────────────────────────────────────────────
export function useAudioManager() {
    const pathname = usePathname();
    const initializedRef = useRef(false);

    useEffect(() => {
        if (initializedRef.current) return;
        initializedRef.current = true;

        const savedMuted = localStorage.getItem(MUTED_KEY);
        isMutedState = savedMuted === "true";

        const savedVolume = localStorage.getItem(VOLUME_KEY);
        if (savedVolume !== null) {
            const v = parseFloat(savedVolume);
            if (!isNaN(v)) userVolume = Math.max(0, Math.min(1, v));
        }

        if (localStorage.getItem(INTERACTION_KEY) === "true") {
            hasInteracted = true;
        }

        registerInteractionUnlock();
    }, []);

    useEffect(() => {
        const src = ROUTE_MUSIC[pathname] ?? null;
        if (!src) { stopAudio(); return; }
        switchTrack(src);
    }, [pathname]);

    const toggleMute = useCallback((): boolean => {
        isMutedState = !isMutedState;
        localStorage.setItem(MUTED_KEY, String(isMutedState));

        const audio = getAudio();
        if (isMutedState) {
            fadeTo(audio, audio.volume, 0, 400, () => audio.pause());
        } else if (audio.src) {
            audio.play().catch(() => { });
            fadeTo(audio, 0, userVolume, 600);
        }

        return isMutedState;
    }, []);

    const setVolume = useCallback((v: number) => {
        userVolume = Math.max(0, Math.min(1, v));
        localStorage.setItem(VOLUME_KEY, String(userVolume));

        const audio = getAudio();
        if (!isMutedState && !audio.paused) {
            cancelFade();
            audio.volume = userVolume;
        }
    }, []);

    const getMuted = useCallback(() => isMutedState, []);
    const getVolume = useCallback(() => userVolume, []);

    return { toggleMute, getMuted, setVolume, getVolume };
}
