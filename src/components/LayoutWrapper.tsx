"use client";

import React, { useState, useEffect } from "react";
import { Terminal, Calendar, Award, GitBranch, Cpu, Network, Clock, Monitor } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface LayoutWrapperProps {
  children: React.ReactNode;
}

export default function LayoutWrapper({ children }: LayoutWrapperProps) {
  const pathname = usePathname();
  const [time, setTime] = useState("");
  const [cpuLoad, setCpuLoad] = useState(12);

  // Time update effect
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString("vi-VN", { hour12: false }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // CPU Load simulator
  useEffect(() => {
    const interval = setInterval(() => {
      setCpuLoad(Math.floor(8 + Math.random() * 15));
    }, 3000);
    return () => clearInterval(interval);
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
      <div className="scanline-effect"></div>
      
      {/* Dynamic Status Header */}
      <header className="sticky top-0 z-40 bg-[#090d16]/95 border-b border-[#00ff66]/20 backdrop-blur-md px-4 py-3 flex flex-col md:flex-row justify-between items-center gap-3 select-none">
        {/* Host logo */}
        <div className="flex items-center gap-2">
          <span className="text-xs bg-[#00ff66]/10 text-[#00ff66] px-2 py-1 border border-[#00ff66]/30 rounded font-bold animate-pulse">
            NEKO_OS v4
          </span>
          <Link href="/" className="text-sm font-bold tracking-wider text-[#00ccff] hover:text-[#00ff66] transition-colors">
            nekovibecoder@home:~
          </Link>
        </div>

        {/* Navigation buttons */}
        <nav className="flex items-center gap-2 flex-wrap justify-center">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs border transition-all ${
                  isActive
                    ? "bg-[#00ff66]/10 border-[#00ff66] text-[#00ff66] glow-green"
                    : "border-transparent hover:border-[#00ccff]/50 hover:text-[#00ccff]"
                }`}
              >
                <Icon size={14} />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Stats segment */}
        <div className="flex items-center gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <Cpu size={14} className="text-[#ffb86c]" />
            <span>CPU: <span className="text-slate-200 font-bold">{cpuLoad}%</span></span>
          </div>
          <div className="flex items-center gap-1.5">
            <Network size={14} className="text-[#00ccff]" />
            <span className="text-slate-200 font-bold">ONLINE</span>
          </div>
          <div className="flex items-center gap-1.5 border-l border-slate-700 pl-3">
            <Clock size={14} className="text-[#bd93f9]" />
            <span className="text-slate-200 font-bold w-[70px]">{time}</span>
          </div>
        </div>
      </header>

      {/* Main workspace area */}
      <main className="flex-grow flex flex-col p-4 md:p-6 max-w-7xl w-full mx-auto relative z-10">
        {children}
      </main>

      {/* Retro style status footer */}
      <footer className="bg-[#090d16] border-t border-[#00ff66]/10 px-4 py-2 flex justify-between items-center text-xs text-slate-500 select-none">
        <span>&copy; {new Date().getFullYear()} Nguyễn Văn Hiếu</span>
        <span className="flex items-center gap-2">
          <span>LANG: <span className="text-slate-300 font-bold">VI/EN</span></span>
          <span className="w-2 h-2 rounded-full bg-[#00ff66] animate-ping"></span>
        </span>
      </footer>
    </div>
  );
}
