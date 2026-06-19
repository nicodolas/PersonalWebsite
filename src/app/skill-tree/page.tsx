"use client";

import React, { useState, useEffect, useRef } from "react";
import LayoutWrapper from "@/components/LayoutWrapper";
import skillTreeData from "@/data/generated/skill-tree.json";
import { gsap } from "@/lib/gsap-config";
import { fadeInUp } from "@/lib/animations";
import { Award, Code, Shield, Wrench, Cpu, Lock, CheckCircle2, Circle, Sparkles } from "lucide-react";

// Icon mapping based on category ID
const categoryMeta: Record<string, { icon: React.ComponentType<{ size?: number; className?: string }>; color: string; glow: string }> = {
  "automation": {
    icon: Wrench,
    color: "text-[#bd93f9]",
    glow: "shadow-[0_0_15px_rgba(189,147,249,0.3)]",
  },
  "ai-systems": {
    icon: Cpu,
    color: "text-[#00ff66]",
    glow: "shadow-[0_0_15px_rgba(0,255,102,0.3)]",
  },
  "web-erp": {
    icon: Shield,
    color: "text-[#00ccff]",
    glow: "shadow-[0_0_15px_rgba(0,204,255,0.3)]",
  },
};

// Local audio synthesizer helper
let globalAudioCtx: AudioContext | null = null;

const playBeep = (freq: number, duration: number, type: OscillatorType = "sine", volume = 0.04) => {
  try {
    const savedSound = localStorage.getItem("neko_sound_enabled");
    if (savedSound === "false") return;

    const AudioContextClass = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    if (!globalAudioCtx) {
      globalAudioCtx = new AudioContextClass();
    }

    if (globalAudioCtx.state === "suspended") {
      globalAudioCtx.resume();
    }

    const ctx = globalAudioCtx;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);

    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch {
    // Autoplay blocked
  }
};

export default function SkillTree() {
  const containerRef = useRef<HTMLDivElement>(null);
  const xpBarRef = useRef<HTMLDivElement>(null);

  // Game state
  const [xp, setXp] = useState(0);
  const [unlockedSkills, setUnlockedSkills] = useState<string[]>([]);
  const [notification, setNotification] = useState<string | null>(null);

  useEffect(() => {
    // Load local storage values asynchronously to avoid synchronous setState inside render effect
    setTimeout(() => {
      const savedXp = localStorage.getItem("neko_user_xp");
      if (savedXp) setXp(parseInt(savedXp, 10));

      const savedUnlocks = localStorage.getItem("neko_unlocked_skills");
      if (savedUnlocks) {
        try {
          setUnlockedSkills(JSON.parse(savedUnlocks));
        } catch { }
      }
    }, 0);

    const ctx = gsap.context(() => {
      fadeInUp(".skill-category", containerRef.current!, 0.15);
    }, containerRef);

    return () => ctx.revert();
  }, []);

  // Level computation (100 XP per Level)
  const currentLvl = Math.floor(xp / 100) + 1;
  const xpInCurrentLvl = xp % 100;

  useEffect(() => {
    if (!xpBarRef.current || !containerRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(xpBarRef.current!,
        { width: "0%" },
        { width: `${xpInCurrentLvl}%`, duration: 1.2, ease: "power2.out" }
      );
    }, containerRef);
    return () => ctx.revert();
  }, [xpInCurrentLvl]);

  const handleUnlockSkill = (skillId: string, skillLabel: string) => {
    const unlockCost = 50;

    if (xp < unlockCost) {
      playBeep(220, 0.25, "sawtooth", 0.05); // Error sound
      setNotification(`⚠️ Not enough XP! You need ${unlockCost} XP to unlock. Earn more XP in the Terminal.`);
      setTimeout(() => setNotification(null), 4000);
      return;
    }

    // Deduct XP and add skill to unlocked list
    const newXp = xp - unlockCost;
    const newUnlocks = [...unlockedSkills, skillId];

    setXp(newXp);
    setUnlockedSkills(newUnlocks);

    localStorage.setItem("neko_user_xp", newXp.toString());
    localStorage.setItem("neko_unlocked_skills", JSON.stringify(newUnlocks));

    // GSAP Unlock Animation
    const targetElement = document.getElementById(`skill-node-${skillId}`);
    if (targetElement) {
      gsap.timeline()
        .to(targetElement, { scale: 1.05, duration: 0.1, ease: "power1.out" })
        .to(targetElement, { backgroundColor: "#0c2b1a", borderColor: "#00ff66", duration: 0.3 })
        .to(targetElement, { scale: 1, duration: 0.2, ease: "power1.in" });
    }

    // Play unlocking melody
    playBeep(523.25, 0.1, "sine", 0.06); // C5
    setTimeout(() => playBeep(659.25, 0.1, "sine", 0.06), 70); // E5
    setTimeout(() => playBeep(783.99, 0.12, "sine", 0.06), 140); // G5
    setTimeout(() => playBeep(1046.50, 0.2, "sine", 0.06), 210); // C6

    setNotification(`🎉 Unlocked: "${skillLabel}" (-${unlockCost} XP)`);
    setTimeout(() => setNotification(null), 4500);
  };

  return (
    <LayoutWrapper>
      <div ref={containerRef} className="flex flex-col gap-6 py-4 select-none">

        {/* Floating Notification */}
        {notification && (
          <div className="fixed bottom-6 right-6 bg-[#090d16] border border-[#00ff66]/30 px-5 py-3 rounded-lg text-xs font-mono text-[#00ff66] shadow-[0_0_20px_rgba(0,255,102,0.15)] z-50 flex items-center gap-2 animate-bounce">
            <Sparkles size={14} className="text-[#00ff66]" />
            <span>{notification}</span>
          </div>
        )}

        {/* Header & Level Progress */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[#090d16]/40 border border-slate-850 p-5 rounded-lg">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-bold text-[#00ff66] flex items-center gap-2">
              <Award size={24} /> Skill Tree
            </h1>
            <p className="text-xs text-slate-400">
              Explore and spend XP earned from the Terminal to activate skill blocks.
            </p>
          </div>

          {/* Gamified Header Stats */}
          <div className="flex flex-col gap-1.5 w-full md:w-64 bg-[#05080e] border border-slate-800 p-3.5 rounded font-mono">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">EXP LEVEL</span>
              <span className="text-[#00ff66] font-bold">LVL {currentLvl}</span>
            </div>
            {/* Progress Bar */}
            <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-850">
              <div
                ref={xpBarRef}
                className="bg-gradient-to-r from-[#00ccff] to-[#00ff66] h-full rounded-full"
              ></div>
            </div>
            <div className="flex justify-between items-center text-[10px] text-slate-500">
              <span>{xp} XP earned</span>
              <span>{xpInCurrentLvl}/100 XP</span>
            </div>
          </div>
        </div>

        {/* Tree categories list */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mt-4">
          {skillTreeData.data.trees.map((cat) => {
            const meta = categoryMeta[cat.id] || { icon: Code, color: "text-[#ff5555]", glow: "" };
            const Icon = meta.icon;

            return (
              <div
                key={cat.id}
                className={`skill-category bg-[#090d16]/70 border border-slate-800 rounded-lg p-6 shadow-xl flex flex-col gap-4 transition-all hover:border-slate-700 ${meta.glow}`}
              >
                {/* Category Header */}
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <Icon className={`${meta.color} shrink-0`} size={20} />
                    <h2 className="text-sm font-bold text-slate-200 uppercase tracking-widest">{cat.label_vi}</h2>
                  </div>
                  <span className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded ${cat.status === "mastered"
                    ? "bg-[#00ff66]/10 text-[#00ff66] border border-[#00ff66]/20"
                    : cat.status === "unlocked"
                      ? "bg-[#00ccff]/10 text-[#00ccff] border border-[#00ccff]/20"
                      : "bg-slate-800 text-slate-400"
                    }`}>
                    {cat.status === "mastered" ? "MASTERED" : cat.status === "unlocked" ? "UNLOCKED" : "LOCKED"}
                  </span>
                </div>

                {/* Skills Nodes */}
                <div className="flex flex-col gap-4">
                  {cat.children.map((skill) => {
                    // Skill node is locked only if marked locked in json AND not unlocked dynamically in client
                    const isLocked = skill.status === "locked" && !unlockedSkills.includes(skill.id);
                    const isMastered = skill.status === "mastered";
                    const isDynamicUnlocked = unlockedSkills.includes(skill.id);

                    return (
                      <div
                        id={`skill-node-${skill.id}`}
                        key={skill.id}
                        onClick={() => isLocked && handleUnlockSkill(skill.id, skill.label_vi)}
                        className={`border transition-all rounded p-3 flex flex-col gap-2 relative group ${isLocked
                          ? "bg-[#05080f]/50 border-slate-900 opacity-60 hover:opacity-100 hover:border-[#ff5555]/30 cursor-pointer"
                          : isMastered
                            ? "bg-[#071512]/50 border-[#00ff66]/20 hover:border-[#00ff66]/40"
                            : "bg-[#0b1322] border-slate-800 hover:border-[#00ccff]/30"
                          }`}
                      >
                        {/* Hover Overlay for locked nodes */}
                        {isLocked && (
                          <div className="absolute inset-0 bg-black/60 rounded flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="text-[10px] text-[#ffb86c] font-mono font-bold flex items-center gap-1">
                              🔑 CLICK TO UNLOCK (50 XP)
                            </span>
                          </div>
                        )}

                        {/* Name & level/status */}
                        <div className="flex justify-between items-center text-xs">
                          <span className={`font-bold ${isLocked ? "text-slate-500" : "text-slate-200"}`}>
                            {skill.label_vi}
                          </span>
                          <div className="flex items-center gap-1.5 font-mono text-[10px]">
                            {isLocked ? (
                              <span className="text-[#ff5555] flex items-center gap-1">
                                <Lock size={10} /> LOCKED
                              </span>
                            ) : isMastered ? (
                              <span className="text-[#00ff66] flex items-center gap-1 font-bold">
                                <CheckCircle2 size={10} /> MAX LEVEL
                              </span>
                            ) : isDynamicUnlocked ? (
                              <span className="text-[#00ff66] flex items-center gap-1 font-bold">
                                <Sparkles size={10} className="animate-spin" /> UNLOCKED (XP)
                              </span>
                            ) : (
                              <span className="text-[#00ccff] flex items-center gap-1">
                                <Circle size={10} className="fill-[#00ccff]/20 animate-pulse" /> IN PROGRESS
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Progress Nodes Indicator */}
                        <div className="flex gap-1 mt-1">
                          {Array.from({ length: 5 }).map((_, i) => {
                            let filled = false;
                            if (isMastered) filled = true;
                            else if (!isLocked && i < 3) filled = true; // Unlocked defaults to level 3/5

                            return (
                              <span
                                key={i}
                                className={`w-full h-1.5 rounded-sm ${filled
                                  ? isMastered
                                    ? "bg-[#00ff66] shadow-[0_0_5px_rgba(0,255,102,0.8)]"
                                    : "bg-[#00ccff] shadow-[0_0_5px_rgba(0,204,255,0.8)]"
                                  : "bg-slate-950 border border-slate-900"
                                  }`}
                              ></span>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </LayoutWrapper>
  );
}
