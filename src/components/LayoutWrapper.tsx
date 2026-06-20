"use client";

import React, { useState, useEffect, useRef, startTransition } from "react";
import {
  Terminal, Calendar, Award, GitBranch, Cpu,
  Network, Clock, Monitor, Volume2, VolumeX, Music,
  Menu, X, TreePine, FlaskConical, Skull,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAudioManager, ROUTE_MUSIC } from "@/lib/useAudioManager";

const ROUTE_TRACK_LABEL: Record<string, string> = {
  "/": "Hall of Fame",
  "/terminal": "Hacker Night",
  "/workshop-board": "Deep Focus",
  "/timeline": "Nostalgia",
  "/galaxy": "Cosmos",
  "/achievements": "Victory",
  "/brain": "AI Core",
  "/skill-tree": "RPG Theme",
  "/experiment-log": "Lab 404",
  "/graveyard": "Requiem",
};

interface LayoutWrapperProps {
  children: React.ReactNode;
}

export default function LayoutWrapper({ children }: LayoutWrapperProps) {
  const pathname = usePathname();
  const [time, setCpuTime] = useState("");
  const [cpuLoad, setCpuLoad] = useState(12);
  const [menuOpen, setMenuOpen] = useState(false);
  const [volumeOpen, setVolumeOpen] = useState(false);
  const volumeRef = useRef<HTMLDivElement>(null);

  const { toggleMute, getMuted, setVolume, getVolume } = useAudioManager();

  const [muted, setMuted] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("neko_music_muted") === "true";
  });
  const [volume, setVolumeState] = useState(() => {
    if (typeof window === "undefined") return 0.32;
    const saved = localStorage.getItem("neko_music_volume");
    if (saved !== null) {
      const v = parseFloat(saved);
      if (!isNaN(v)) return Math.max(0, Math.min(1, v));
    }
    return 0.32;
  });

  // Đóng menu khi chuyển route
  useEffect(() => {
    startTransition(() => {
      setMenuOpen(false);
      setVolumeOpen(false);
    });
  }, [pathname]);

  // Đóng volume popover khi click ngoài
  useEffect(() => {
    if (!volumeOpen) return;
    const handler = (e: MouseEvent) => {
      if (volumeRef.current && !volumeRef.current.contains(e.target as Node)) {
        setVolumeOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [volumeOpen]);

  const handleToggleMute = () => {
    const newMuted = toggleMute();
    setMuted(newMuted);
    if (newMuted) setVolumeOpen(false);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseFloat(e.target.value);
    setVolumeState(v);
    setVolume(v);
    // Unmute tự động khi kéo volume lên
    if (muted && v > 0) {
      const newMuted = toggleMute();
      setMuted(newMuted);
    }
  };

  // Sync UI khi Terminal (hoặc bất kỳ nơi nào) thay đổi volume/mute qua lệnh
  useEffect(() => {
    const onAudioChange = () => {
      setVolumeState(getVolume());
      setMuted(getMuted());
    };
    window.addEventListener("neko:audio-change", onAudioChange);
    return () => window.removeEventListener("neko:audio-change", onAudioChange);
  }, [getMuted, getVolume]);

  const handleMusicButtonClick = () => {
    if (!hasMusic) return;
    setVolumeOpen((v) => !v);
  };

  const hasMusic = pathname in ROUTE_MUSIC;
  const trackLabel = ROUTE_TRACK_LABEL[pathname] ?? null;

  // Clock
  useEffect(() => {
    const update = () =>
      setCpuTime(new Date().toLocaleTimeString("vi-VN", { hour12: false }));
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  // Fake CPU load
  useEffect(() => {
    const id = setInterval(
      () => setCpuLoad(Math.floor(8 + Math.random() * 15)),
      3000
    );
    return () => clearInterval(id);
  }, []);

  const navLinks = [
    { href: "/terminal", label: "Terminal", icon: Terminal },
    { href: "/workshop-board", label: "Board", icon: Monitor },
    { href: "/timeline", label: "Timeline", icon: Calendar },
    { href: "/galaxy", label: "Galaxy", icon: GitBranch },
    { href: "/achievements", label: "Milestones", icon: Award },
    { href: "/skill-tree", label: "Skills", icon: TreePine },
    { href: "/brain", label: "Brain", icon: Cpu },
    { href: "/experiment-log", label: "Lab", icon: FlaskConical },
    { href: "/graveyard", label: "Graveyard", icon: Skull },
  ];

  const volumePct = Math.round(volume * 100);

  return (
    <div className="flex flex-col flex-grow min-h-screen bg-[#05070a] text-[#e2e8f0] font-mono crt-screen">
      <div className="scanline-effect" />

      {/* ── Header ────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 bg-[#090d16]/95 border-b border-[#00ff66]/20 backdrop-blur-md select-none">
        <div className="max-w-7xl mx-auto px-4">

          {/* Top row */}
          <div className="flex items-center justify-between gap-3 h-11">

            {/* Logo */}
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-xs bg-[#00ff66]/10 text-[#00ff66] px-2 py-1 border border-[#00ff66]/30 rounded font-bold animate-pulse shrink-0">
                NEKO_OS v4
              </span>
              <Link
                href="/"
                className="text-sm font-bold tracking-wider text-[#00ccff] hover:text-[#00ff66] transition-colors truncate"
              >
                nekovibecoder@home:~
              </Link>
            </div>

            {/* Right: stats + music + hamburger */}
            <div className="flex items-center gap-3 shrink-0">

              {/* Stats strip */}
              <div className="hidden sm:flex items-center gap-3 text-xs text-slate-400">
                <div className="flex items-center gap-1.5">
                  <Cpu size={13} className="text-[#ffb86c]" />
                  <span>CPU: <span className="text-slate-200 font-bold">{cpuLoad}%</span></span>
                </div>
                <div className="hidden md:flex items-center gap-1.5">
                  <Network size={13} className="text-[#00ccff]" />
                  <span className="text-[#00ccff] font-bold">ONLINE</span>
                </div>
                <div className="flex items-center gap-1.5 border-l border-slate-700/60 pl-3">
                  <Clock size={13} className="text-[#bd93f9]" />
                  <span className="text-slate-200 font-bold tabular-nums w-[62px]">{time}</span>
                </div>
              </div>

              {/* Music / volume control */}
              <div className="relative flex items-center border-l border-slate-700/60 pl-3" ref={volumeRef}>
                {/* Track label */}
                {hasMusic && !muted && trackLabel && (
                  <span className="hidden lg:flex items-center gap-1 text-[10px] text-[#bd93f9]/70 mr-2 max-w-[84px] truncate">
                    <Music size={9} className="shrink-0 animate-pulse" />
                    {trackLabel}
                  </span>
                )}

                {/* Main button — click opens volume panel */}
                <button
                  onClick={handleMusicButtonClick}
                  onContextMenu={(e) => { e.preventDefault(); handleToggleMute(); }}
                  title={
                    !hasMusic ? "No music on this page"
                      : muted ? "Click to open volume / right-click to unmute"
                        : "Click to adjust volume / right-click to mute"
                  }
                  className={`flex items-center gap-1.5 px-2 py-1 rounded border transition-all text-[10px] font-bold tracking-wider ${!hasMusic
                    ? "border-slate-800 text-slate-700 cursor-default"
                    : muted
                      ? "border-slate-700 text-slate-500 hover:border-slate-500 hover:text-slate-300"
                      : volumeOpen
                        ? "border-[#00ff66] text-[#00ff66] shadow-[0_0_8px_rgba(0,255,102,0.25)]"
                        : "border-[#00ff66]/30 text-[#00ff66] hover:border-[#00ff66] hover:shadow-[0_0_8px_rgba(0,255,102,0.2)]"
                    }`}
                  disabled={!hasMusic}
                >
                  {muted || !hasMusic ? <VolumeX size={13} /> : <Volume2 size={13} />}
                  <span className="hidden sm:inline">
                    {!hasMusic ? "NO BGM" : muted ? "OFF" : "ON"}
                  </span>
                </button>

                {/* Volume popover */}
                {volumeOpen && hasMusic && (
                  <div className="absolute top-full right-0 mt-2 w-48 bg-[#090d16] border border-[#00ff66]/30 rounded-lg shadow-[0_0_20px_rgba(0,255,102,0.1)] p-3 z-50">
                    {/* Header row */}
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] text-[#00ff66]/70 font-bold tracking-widest uppercase">Volume</span>
                      <span className="text-[11px] text-[#00ff66] font-black tabular-nums">{volumePct}%</span>
                    </div>

                    {/* Slider */}
                    <input
                      type="range"
                      min={0}
                      max={1}
                      step={0.01}
                      value={volume}
                      onChange={handleVolumeChange}
                      className="w-full h-1.5 rounded-full appearance-none cursor-pointer
                        bg-slate-700
                        [&::-webkit-slider-thumb]:appearance-none
                        [&::-webkit-slider-thumb]:w-3.5
                        [&::-webkit-slider-thumb]:h-3.5
                        [&::-webkit-slider-thumb]:rounded-full
                        [&::-webkit-slider-thumb]:bg-[#00ff66]
                        [&::-webkit-slider-thumb]:shadow-[0_0_6px_rgba(0,255,102,0.6)]
                        [&::-webkit-slider-thumb]:cursor-pointer
                        [&::-moz-range-thumb]:w-3.5
                        [&::-moz-range-thumb]:h-3.5
                        [&::-moz-range-thumb]:rounded-full
                        [&::-moz-range-thumb]:bg-[#00ff66]
                        [&::-moz-range-thumb]:border-0
                        [&::-moz-range-thumb]:cursor-pointer"
                      style={{
                        background: `linear-gradient(to right, #00ff66 ${volumePct}%, #334155 ${volumePct}%)`,
                      }}
                    />

                    {/* Mute toggle + hint */}
                    <div className="flex items-center justify-between mt-3">
                      <button
                        onClick={handleToggleMute}
                        className="flex items-center gap-1.5 text-[10px] text-slate-400 hover:text-slate-200 transition-colors"
                      >
                        {muted ? <VolumeX size={11} /> : <Volume2 size={11} />}
                        {muted ? "Unmute" : "Mute"}
                      </button>
                      <span className="text-[9px] text-slate-600">saved automatically</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Hamburger */}
              <button
                onClick={() => setMenuOpen((v) => !v)}
                aria-label={menuOpen ? "Close menu" : "Open menu"}
                className="md:hidden flex items-center justify-center w-8 h-8 rounded border border-slate-700 text-slate-400 hover:border-[#00ff66]/50 hover:text-[#00ff66] transition-all"
              >
                {menuOpen ? <X size={16} /> : <Menu size={16} />}
              </button>
            </div>
          </div>

          {/* Desktop nav — same horizontal padding, flush với logo */}
          <nav className="hidden md:flex items-center gap-1 pb-2">
            {navLinks.map(({ href, label, icon: Icon }) => {
              const isActive = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs border transition-all ${isActive
                    ? "bg-[#00ff66]/10 border-[#00ff66]/60 text-[#00ff66]"
                    : "border-transparent text-slate-400 hover:border-[#00ccff]/40 hover:text-[#00ccff]"
                    }`}
                >
                  <Icon size={13} />
                  <span>{label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Mobile drawer */}
          {menuOpen && (
            <nav className="md:hidden border-t border-slate-800 py-3 flex flex-col gap-1">
              {/* Stats row mobile */}
              <div className="flex items-center gap-4 text-xs text-slate-400 px-1 pb-2.5 mb-1 border-b border-slate-800/60">
                <span className="flex items-center gap-1.5">
                  <Cpu size={12} className="text-[#ffb86c]" />
                  CPU: <span className="text-slate-200 font-bold">{cpuLoad}%</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <Network size={12} className="text-[#00ccff]" />
                  <span className="text-[#00ccff] font-bold">ONLINE</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock size={12} className="text-[#bd93f9]" />
                  <span className="text-slate-200 font-bold">{time}</span>
                </span>
              </div>

              {navLinks.map(({ href, label, icon: Icon }) => {
                const isActive = pathname === href;
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setMenuOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded text-sm border transition-all ${isActive
                      ? "bg-[#00ff66]/10 border-[#00ff66]/60 text-[#00ff66]"
                      : "border-transparent text-slate-300 hover:border-[#00ccff]/40 hover:text-[#00ccff]"
                      }`}
                  >
                    <Icon size={15} />
                    <span>{label}</span>
                  </Link>
                );
              })}
            </nav>
          )}
        </div>
      </header>

      {/* ── Content ───────────────────────────────────────────────────── */}
      <main className="flex-grow flex flex-col p-3 sm:p-4 md:p-6 max-w-7xl w-full mx-auto relative z-10">
        {children}
      </main>

      {/* ── Footer ────────────────────────────────────────────────────── */}
      <footer className="bg-[#090d16] border-t border-[#00ff66]/10 select-none">
        <div className="max-w-7xl mx-auto px-4 py-2 flex justify-between items-center text-xs text-slate-500">
          <span>&copy; {new Date().getFullYear()} Nguyễn Văn Hiếu</span>
          <span className="flex items-center gap-2">
            <span className="hidden sm:inline">
              LANG: <span className="text-slate-300 font-bold">VI/EN</span>
            </span>
            <span className="w-2 h-2 rounded-full bg-[#00ff66] animate-ping" />
          </span>
        </div>
      </footer>
    </div>
  );
}
