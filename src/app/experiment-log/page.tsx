"use client";

import React, { useEffect, useRef } from "react";
import LayoutWrapper from "@/components/LayoutWrapper";
import experimentsData from "@/data/generated/experiments.json";
import gsap from "gsap";
import { FlaskConical, CircleDot } from "lucide-react";

interface Experiment {
  id: string;
  name: string;
  problem: string;
  problem_vi: string;
  approach: string;
  approach_vi: string;
  outcome: string;
  outcome_vi: string;
  lessons_learned: string[];
  lessons_learned_vi: string[];
  status: "active" | "success" | "failed";
}

export default function ExperimentLog() {
  const containerRef = useRef<HTMLDivElement>(null);
  const experiments = (experimentsData.data.experiments || []) as Experiment[];

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".experiment-card", {
        opacity: 0,
        x: -30,
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
            <FlaskConical size={24} /> Nhật Ký Thí Nghiệm (Experiment Logbook)
          </h1>
          <p className="text-xs text-slate-400">
            Hồ sơ chi tiết về các dự án dưới dạng báo cáo thí nghiệm khoa học máy tính.
          </p>
        </div>

        {/* Experiment cards list */}
        <div className="space-y-6 mt-4">
          {experiments.map((exp, idx) => (
            <div 
              key={exp.id} 
              className="experiment-card bg-[#090d16]/80 border border-slate-800 hover:border-[#00ccff]/30 transition-all rounded-lg p-6 shadow-xl flex flex-col gap-4"
            >
              {/* Card Title Header */}
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <div className="flex items-center gap-3">
                  <span className="text-xs bg-[#00ccff]/10 text-[#00ccff] border border-[#00ccff]/30 px-2 py-0.5 rounded font-bold">
                    EXP_LOG #{idx + 101}
                  </span>
                  <h2 className="text-lg font-bold text-slate-200 glow-blue">{exp.name}</h2>
                </div>
                
                <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                  exp.status === "success" 
                    ? "bg-[#00ff66]/10 text-[#00ff66] border border-[#00ff66]/20" 
                    : exp.status === "active"
                    ? "bg-[#00ccff]/10 text-[#00ccff] border border-[#00ccff]/20"
                    : "bg-[#ff5555]/10 text-[#ff5555] border border-[#ff5555]/20"
                }`}>
                  STATUS: {exp.status}
                </span>
              </div>

              {/* Lab format details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs md:text-sm">
                {/* Problem */}
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-[#ffb86c]">🧪 PROBLEM / OBJECTIVE</span>
                  <p className="text-slate-300 leading-relaxed">
                    {exp.problem_vi || exp.problem}
                  </p>
                </div>

                {/* Solution / Approach */}
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-[#00ff66]">⚙️ METHODOLOGY / APPROACH</span>
                  <p className="text-slate-300 leading-relaxed">
                    {exp.approach_vi || exp.approach}
                  </p>
                </div>

                {/* Outcome */}
                <div className="space-y-1 md:col-span-2 border-t border-slate-800/60 pt-3">
                  <span className="text-[10px] uppercase font-bold text-[#00ccff]">🚀 OUTCOME / RESULTS</span>
                  <p className="text-slate-300 leading-relaxed mt-1">
                    {exp.outcome_vi || exp.outcome}
                  </p>
                </div>
              </div>

              {/* Lessons Learned */}
              {exp.lessons_learned_vi && exp.lessons_learned_vi.length > 0 && (
                <div className="flex flex-col gap-1.5 mt-2 border-t border-slate-800/60 pt-3">
                  <span className="text-[10px] uppercase font-bold text-slate-500">Bài học kinh nghiệm:</span>
                  <div className="space-y-1 mt-1">
                    {exp.lessons_learned_vi.map((lesson, lIdx) => (
                      <div key={lIdx} className="flex items-start gap-2 text-xs text-slate-300">
                        <CircleDot size={10} className="text-[#00ff66] mt-0.5 shrink-0" />
                        <span>{lesson}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </LayoutWrapper>
  );
}
