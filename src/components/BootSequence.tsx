"use client";

import { useEffect, useState, useRef } from "react";
import gsap from "gsap";

interface BootSequenceProps {
  onComplete: () => void;
}

const bootLines = [
  "NEKO.OS v4.0.0 (x86_64-neko-desktop)",
  "Initializing system memory check... 16GB RAM [OK]",
  "Loading kernel modules [fs, net, sys, input]... Done.",
  "Mounting digital presence at nekovibecoder.site...",
  "Retrieving environment settings... MODE=PUBLIC [OK]",
  "Connecting to GitHub servers (https://api.github.com)...",
  "Fetching profile metadata for 'nicodolas'...",
  "Found 4 public core repositories...",
  "Found 1,500+ commit records...",
  "Caching timeline events and achievements locally...",
  "Parsing Developer DNA: Builder(92%), Automator(88%), Researcher(80%)...",
  "Initializing GreenSock Animation Engine (GSAP v3.15)... [SUCCESS]",
  "Applying CRT phosphor simulation scanlines...",
  "System boot sequence completed.",
  "Ready to accept visitor input.",
];

export default function BootSequence({ onComplete }: BootSequenceProps) {
  const [booting, setBooting] = useState(false);
  const [logs, setLogs] = useState<Array<{ text: string; time: string }>>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const skipRef = useRef<HTMLButtonElement>(null);
  const timerIdsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const startBoot = () => {
    if (booting) return;
    // Trusted gesture → unlock audio
    window.dispatchEvent(new Event("neko:interaction"));
    setBooting(true);
  };

  // Keydown listener trên màn hình press
  useEffect(() => {
    if (booting) return;
    const onKey = (e: KeyboardEvent) => {
      // Bỏ qua modifier keys
      if (e.key === "Tab" || e.key === "Shift" || e.key === "Control" || e.key === "Alt") return;
      startBoot();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [booting]);

  // Chạy boot lines sau khi booting = true
  useEffect(() => {
    if (!booting) return;

    let completed = false;
    const ids: ReturnType<typeof setTimeout>[] = [];
    timerIdsRef.current = ids;

    // Animate skip button vào
    const animCtx = gsap.context(() => {
      if (skipRef.current) {
        gsap.fromTo(
          skipRef.current,
          { opacity: 0, y: 10 },
          { opacity: 1, y: 0, duration: 1, delay: 0.3 }
        );
      }
    });

    let delay = 0.1;
    bootLines.forEach((line, index) => {
      const id = setTimeout(() => {
        const time = new Date().toLocaleTimeString();
        setLogs((prev) => [...prev, { text: line, time }]);
        // Scroll xuống cuối
        requestAnimationFrame(() => {
          if (containerRef.current) {
            containerRef.current.scrollTop = containerRef.current.scrollHeight;
          }
        });
        // Sau dòng cuối → gọi onComplete
        if (index === bootLines.length - 1) {
          const finishId = setTimeout(() => {
            if (!completed) {
              completed = true;
              onComplete();
            }
          }, 1200);
          ids.push(finishId);
        }
      }, delay * 1000);

      ids.push(id);
      delay += 0.15 + Math.random() * 0.25;
    });

    return () => {
      animCtx.revert();
      ids.forEach(clearTimeout);
    };
  }, [booting, onComplete]);

  // ── Màn hình PRESS ANY KEY ────────────────────────────────────────────
  if (!booting) {
    return (
      <div
        onClick={startBoot}
        className="fixed inset-0 z-50 bg-[#05070a] text-[#00ff66] font-mono flex flex-col items-center justify-center gap-8 cursor-pointer select-none crt-screen"
      >
        <div className="scanline-effect" />

        <div className="text-center space-y-2">
          <div className="text-4xl md:text-6xl font-black tracking-widest glow-green">
            NEKO_OS
          </div>
          <div className="text-xs text-[#00ccff] tracking-[0.4em] uppercase">
            v4.0.0 — nekovibecoder.site
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm md:text-base text-[#00ff66]/80 animate-pulse">
          <span className="text-[#ffb86c]">&gt;_</span>
          <span>PRESS ANY KEY TO BOOT</span>
        </div>

        <div className="text-[10px] text-slate-600 tracking-widest uppercase">
          click anywhere or press any key
        </div>
      </div>
    );
  }

  // ── Màn hình boot terminal ────────────────────────────────────────────
  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 bg-[#05070a] text-[#00ff66] font-mono p-6 md:p-12 overflow-y-auto select-none crt-screen"
    >
      <div className="scanline-effect" />

      <div className="flex justify-between items-center border-b border-[#00ff66]/30 pb-3 mb-6">
        <span className="text-xs uppercase tracking-widest font-bold glow-green">
          System Boot Sequence
        </span>
        <button
          ref={skipRef}
          onClick={onComplete}
          className="px-3 py-1 border border-[#00ff66] text-xs hover:bg-[#00ff66] hover:text-[#05070a] transition-all cursor-pointer font-bold rounded"
        >
          SKIP BOOT
        </button>
      </div>

      <div className="space-y-2 text-sm md:text-base max-w-4xl mx-auto">
        {logs.map((log, index) => (
          <div key={index} className="flex items-start">
            <span className="text-[#00ccff] mr-3 shrink-0 select-none">
              [{log.time}]
            </span>
            <span className="leading-relaxed whitespace-pre-wrap">{log.text}</span>
          </div>
        ))}

        {logs.length < bootLines.length && (
          <div className="flex items-center text-sm md:text-base mt-2">
            <span className="text-[#00ccff] mr-3 shrink-0" suppressHydrationWarning>
              [{logs.length > 0 ? logs[logs.length - 1].time : ""}]
            </span>
            <span className="text-[#00ff66] opacity-75">Loading system modules...</span>
            <span className="blinking-cursor" />
          </div>
        )}
      </div>
    </div>
  );
}
