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

const TARGET_VOLUME = 0.32;
const FADE_IN_MS = 1200;
const FADE_OUT_MS = 500;

// ── Module-level singletons (survive React remounts) ──────────────────────
let audioEl: HTMLAudioElement | null = null;
let currentSrc = "";
let hasInteracted = false;
let isMutedState = false;
let fadeRafId: number | null = null;   // requestAnimationFrame id

// listeners được đăng ký 1 lần, track để cleanup khi cần
let interactionListenersAdded = false;

// ── Audio element ──────────────────────────────────────────────────────────
function getAudio(): HTMLAudioElement {
    if (!audioEl && typeof window !== "undefined") {
        audioEl = new Audio();
        audioEl.loop = true;
        audioEl.volume = 0;
        audioEl.preload = "none"; // chỉ load khi cần — tiết kiệm bandwidth
    }
    return audioEl!;
}

// ── Fade dùng requestAnimationFrame + ease-out ────────────────────────────
// Mượt hơn setInterval vì sync với repaint cycle
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
        // ease-out cubic: nghe tự nhiên hơn linear
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

    // Đổi src + load — browser chỉ fetch khi play() được gọi (preload=none)
    audio.src = src;
    audio.load();

    if (hasInteracted && !isMutedState) {
        audio.play().catch(() => {
            // Autoplay blocked — sẽ tự play lại khi user interact lần tiếp
        });
        fadeTo(audio, 0, TARGET_VOLUME, FADE_IN_MS);
    }
}

function switchTrack(src: string) {
    const audio = getAudio();

    if (src === currentSrc) return;

    // Nếu đang phát → fade out rồi switch
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

// ── Interaction unlock (đăng ký 1 lần toàn app) ───────────────────────────
function registerInteractionUnlock() {
    if (typeof window === "undefined" || interactionListenersAdded) return;
    interactionListenersAdded = true;

    const unlock = () => {
        if (hasInteracted) return;
        hasInteracted = true;

        const audio = getAudio();
        if (audio.src && audio.paused && !isMutedState) {
            audio.play().catch(() => { });
            fadeTo(audio, 0, TARGET_VOLUME, FADE_IN_MS);
        }

        // Cleanup sau khi unlock — không cần lắng nghe nữa
        window.removeEventListener("click", unlock);
        window.removeEventListener("keydown", unlock);
        window.removeEventListener("touchstart", unlock);
    };

    window.addEventListener("click", unlock);
    window.addEventListener("keydown", unlock);
    window.addEventListener("touchstart", unlock, { passive: true });
}

// ── Hook ──────────────────────────────────────────────────────────────────
export function useAudioManager() {
    const pathname = usePathname();
    const initializedRef = useRef(false);

    // Setup chạy 1 lần
    useEffect(() => {
        if (initializedRef.current) return;
        initializedRef.current = true;

        // Đọc mute preference
        const saved = localStorage.getItem("neko_music_muted");
        isMutedState = saved === "true";

        registerInteractionUnlock();
    }, []);

    // Đổi track theo route
    useEffect(() => {
        const src = ROUTE_MUSIC[pathname] ?? null;

        if (!src) {
            stopAudio();
            return;
        }

        switchTrack(src);
    }, [pathname]);

    // ── Toggle mute ─────────────────────────────────────────────────────────
    const toggleMute = useCallback((): boolean => {
        isMutedState = !isMutedState;
        localStorage.setItem("neko_music_muted", String(isMutedState));

        const audio = getAudio();

        if (isMutedState) {
            fadeTo(audio, audio.volume, 0, 400, () => audio.pause());
        } else if (audio.src) {
            audio.play().catch(() => { });
            fadeTo(audio, 0, TARGET_VOLUME, 600);
        }

        return isMutedState;
    }, []);

    const getMuted = useCallback(() => isMutedState, []);

    return { toggleMute, getMuted };
}
