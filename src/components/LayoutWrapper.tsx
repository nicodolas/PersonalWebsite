"use client";

import React, { useState, useEffect } from "react";
import {
  Terminal, Calendar, Award, GitBranch, Cpu,
  Network, Clock, Monitor, Volume2, VolumeX, Music,
  Menu, X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAudioManager, ROUTE_MUSIC } from "@/lib/useAudioManager";

// Tên hiển thị thân thiện cho từng route
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

  const { toggleMute, getMuted } = useAudioManager();

  // Sync initial mute state từ localStorage — lazy initializer, không cần effect
  const [muted, setMuted] = useState(() => {
    if (typeof window === "undefined") return false;
    return getMuted();
  });

  // Đóng menu khi chuyển route
  useEffect(() => {
    setMenuOpen((prev) => (prev ? false : prev)); // eslint-disable-line react-hooks/set-state-in-effect
  }, [pathname]);

  const handleToggleMute = () => {
    const newMuted = toggleMute();
    setMuted(newMuted);
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
    { href: "/brain", label: "Brain", icon: Cpu },
  ];

  return (
    <div className="flex flex-col flex-grow min-h-screen bg-[#05070a] text-[#e2e8f0] font-mono crt-screen">
      <div className="scanline-effect" />

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 bg-[#090d16]/95 border-b border-[#00ff66]/20 backdrop-blur-md px-4 py-3 select-none">

        {/* Top row — logo + status strip + hamburger */}
        <div className="flex items-center justify-between gap-3">

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

          {/* Right side — stats strip (desktop) + music + hamburger */}
          <div className="flex items-center gap-2 shrink-0">

            {/* Stats — hidden on small screens */}
            <div className="hidden sm:flex items-center gap-3 text-xs text-slate-400">
              {/* CPU */}
              <div className="flex items-center gap-1.5">
                <Cpu size={14} className="text-[#ffb86c]" />
                <span>CPU: <span className="text-slate-200 font-bold">{cpuLoad}%</span></span>
              </div>

              {/* Network */}
              <div className="hidden md:flex items-center gap-1.5">
                <Network size={14} className="text-[#00ccff]" />
                <span className="text-slate-200 font-bold">ONLINE</span>
              </div>

              {/* Clock */}
              <div className="flex items-center gap-1.5 border-l border-slate-700 pl-3">
                <Clock size={14} className="text-[#bd93f9]" />
                <span className="text-slate-200 font-bold w-[70px]">{time}</span>
              </div>
            </div>

            {/* Music control */}
            <div className="flex items-center gap-1.5 sm:border-l sm:border-slate-700 sm:pl-3">
              {/* Track name — chỉ hiện khi có nhạc và chưa mute, chỉ desktop */}
              {hasMusic && !muted && trackLabel && (
                <span className="hidden lg:flex items-center gap-1 text-[10px] text-[#bd93f9]/70 max-w-[90px] truncate">
                  <Music size={10} className="shrink-0 animate-pulse" />
                  {trackLabel}
                </span>
              )}

              {/* Toggle button */}
              <button
                onClick={handleToggleMute}
                title={muted ? "Bật nhạc nền" : "Tắt nhạc nền"}
                className={`flex items-center gap-1 px-2 py-1 rounded border transition-all ${!hasMusic
                  ? "border-slate-800 text-slate-700 cursor-default"
                  : muted
                    ? "border-slate-700 text-slate-500 hover:text-slate-300 hover:border-slate-500"
                    : "border-[#00ff66]/30 text-[#00ff66] hover:border-[#00ff66] hover:shadow-[0_0_8px_rgba(0,255,102,0.3)]"
                  }`}
                disabled={!hasMusic}
              >
                {muted || !hasMusic ? <VolumeX size={13} /> : <Volume2 size={13} />}
                <span className="hidden sm:inline text-[10px] font-bold tracking-wider">
                  {!hasMusic ? "NO BGM" : muted ? "OFF" : "ON"}
                </span>
              </button>
            </div>

            {/* Hamburger — mobile only */}
            <button
              onClick={() => setMenuOpen((v) => !v)}
              aria-label={menuOpen ? "Đóng menu" : "Mở menu"}
              className="md:hidden flex items-center justify-center w-8 h-8 rounded border border-slate-700 text-slate-400 hover:border-[#00ff66]/50 hover:text-[#00ff66] transition-all"
            >
              {menuOpen ? <X size={16} /> : <Menu size={16} />}
            </button>
          </div>
        </div>

        {/* Desktop nav — inline below top row */}
        <nav className="hidden md:flex items-center gap-2 flex-wrap mt-2.5">
          {navLinks.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs border transition-all ${isActive
                  ? "bg-[#00ff66]/10 border-[#00ff66] text-[#00ff66] glow-green"
                  : "border-transparent hover:border-[#00ccff]/50 hover:text-[#00ccff]"
                  }`}
              >
                <Icon size={14} />
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Mobile drawer nav */}
        {menuOpen && (
          <nav className="md:hidden mt-3 border-t border-slate-800 pt-3 flex flex-col gap-1">
            {/* Mobile stats row */}
            <div className="flex items-center gap-4 text-xs text-slate-400 px-1 pb-2 border-b border-slate-800/60 mb-1">
              <div className="flex items-center gap-1.5">
                <Cpu size={12} className="text-[#ffb86c]" />
                <span>CPU: <span className="text-slate-200 font-bold">{cpuLoad}%</span></span>
              </div>
              <div className="flex items-center gap-1.5">
                <Network size={12} className="text-[#00ccff]" />
                <span className="text-slate-200 font-bold">ONLINE</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock size={12} className="text-[#bd93f9]" />
                <span className="text-slate-200 font-bold">{time}</span>
              </div>
            </div>

            {navLinks.map(({ href, label, icon: Icon }) => {
              const isActive = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded text-sm border transition-all ${isActive
                    ? "bg-[#00ff66]/10 border-[#00ff66] text-[#00ff66] glow-green"
                    : "border-transparent hover:border-[#00ccff]/50 hover:text-[#00ccff] text-slate-300"
                    }`}
                >
                  <Icon size={16} />
                  <span>{label}</span>
                </Link>
              );
            })}
          </nav>
        )}
      </header>

      {/* ── Content ────────────────────────────────────────────────────── */}
      <main className="flex-grow flex flex-col p-3 sm:p-4 md:p-6 max-w-7xl w-full mx-auto relative z-10">
        {children}
      </main>

      {/* ── Footer ─────────────────────────────────────────────────────── */}
      <footer className="bg-[#090d16] border-t border-[#00ff66]/10 px-4 py-2 flex justify-between items-center text-xs text-slate-500 select-none">
        <span>&copy; {new Date().getFullYear()} Nguyễn Văn Hiếu</span>
        <span className="flex items-center gap-2">
          <span className="hidden sm:inline">
            LANG: <span className="text-slate-300 font-bold">VI/EN</span>
          </span>
          <span className="w-2 h-2 rounded-full bg-[#00ff66] animate-ping" />
        </span>
      </footer>
    </div>
  );
}
