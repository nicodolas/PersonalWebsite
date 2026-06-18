"use client";

import React, { useEffect, useRef } from "react";
import LayoutWrapper from "@/components/LayoutWrapper";
import skillTreeData from "@/data/generated/skill-tree.json";
import gsap from "gsap";
import { Award, Code, Shield, Wrench, Cpu, Lock, CheckCircle2, Circle } from "lucide-react";

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

export default function SkillTree() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".skill-category", {
        opacity: 0,
        y: 30,
        duration: 0.8,
        stagger: 0.15,
        ease: "power2.out"
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <LayoutWrapper>
      <div ref={containerRef} className="flex flex-col gap-6 py-4 select-none">
        {/* Header */}
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold text-[#00ff66] border-b border-[#00ff66]/20 pb-2 flex items-center gap-2">
            <Award size={24} /> Cây Kỹ Năng Game Hóa (Skill Tree)
          </h1>
          <p className="text-xs text-slate-400">
            Hồ sơ học tập của lập trình viên được thể hiện dưới dạng cây kỹ năng nhập vai và trạng thái mở khóa.
          </p>
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
                  <span className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded ${
                    cat.status === "mastered" 
                      ? "bg-[#00ff66]/10 text-[#00ff66] border border-[#00ff66]/20" 
                      : cat.status === "unlocked"
                      ? "bg-[#00ccff]/10 text-[#00ccff] border border-[#00ccff]/20"
                      : "bg-slate-800 text-slate-400"
                  }`}>
                    {cat.status === "mastered" ? "LÀNH NGHỀ" : cat.status === "unlocked" ? "ĐÃ MỞ" : "KHOÁ"}
                  </span>
                </div>

                {/* Skills Nodes */}
                <div className="flex flex-col gap-4">
                  {cat.children.map((skill) => {
                    const isLocked = skill.status === "locked";
                    const isMastered = skill.status === "mastered";

                    return (
                      <div 
                        key={skill.id}
                        className={`border transition-all rounded p-3 flex flex-col gap-2 relative group ${
                          isLocked 
                            ? "bg-[#05080f]/50 border-slate-900 opacity-60" 
                            : isMastered
                            ? "bg-[#071512]/50 border-[#00ff66]/20 hover:border-[#00ff66]/40"
                            : "bg-[#0b1322] border-slate-800 hover:border-[#00ccff]/30"
                        }`}
                      >
                        {/* Name & level/status */}
                        <div className="flex justify-between items-center text-xs">
                          <span className={`font-bold ${isLocked ? "text-slate-500" : "text-slate-200"}`}>
                            {skill.label_vi}
                          </span>
                          <div className="flex items-center gap-1.5 font-mono text-[10px]">
                            {isLocked ? (
                              <span className="text-[#ff5555] flex items-center gap-1">
                                <Lock size={10} /> ĐÃ KHOÁ
                              </span>
                            ) : isMastered ? (
                              <span className="text-[#00ff66] flex items-center gap-1 font-bold">
                                <CheckCircle2 size={10} /> MAX LEVEL
                              </span>
                            ) : (
                              <span className="text-[#00ccff] flex items-center gap-1">
                                <Circle size={10} className="fill-[#00ccff]/20 animate-pulse" /> ĐANG HỌC
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
                                className={`w-full h-1.5 rounded-sm ${
                                  filled 
                                    ? isMastered 
                                      ? "bg-[#00ff66] shadow-[0_0_5px_rgba(0,255,102,0.8)]" 
                                      : "bg-[#00ccff] shadow-[0_0_5px_rgba(0,204,255,0.8)]"
                                    : "bg-slate-900 border border-slate-800"
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
