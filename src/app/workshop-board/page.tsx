"use client";

import React, { useEffect, useRef } from "react";
import LayoutWrapper from "@/components/LayoutWrapper";
import workshopData from "@/data/generated/workshop.json";
import { gsap, ScrollTrigger } from "@/lib/gsap-config";
import { staggerCards } from "@/lib/animations";
import { Folder, GitFork, Star, Monitor, PlayCircle } from "lucide-react";

interface Node {
  id: string;
  title: string;
  description?: string;
  description_vi?: string;
  status: "researching" | "building" | "archived";
  progress: number;
  commits_count: number;
  tech_stack: string[];
  github_url?: string;
  demo_url?: string;
  stars?: number;
  forks?: number;
}

export default function WorkshopBoard() {
  const containerRef = useRef<HTMLDivElement>(null);

  const rawNodes = (workshopData.data.projects || []) as unknown as Node[];

  // Categorize projects
  const research = rawNodes.filter(n => n.status === "researching");
  const archived = rawNodes.filter(n => n.status === "archived");
  const building = rawNodes.filter(n => n.status === "building");

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Stagger-reveal board columns
      staggerCards(".board-column", containerRef.current!);

      // Workshop card stagger reveal via ScrollTrigger batch
      gsap.set(".workshop-card", { autoAlpha: 0, y: 40 });
      ScrollTrigger.batch(".workshop-card", {
        onEnter: (els) => gsap.to(els, { autoAlpha: 1, y: 0, stagger: 0.08, duration: 0.5 }),
        start: "top 88%",
        once: true,
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const columns = [
    { title: "🧪 RESEARCH", desc: "Research & New Technology Ideas", items: research, color: "text-[#bd93f9] border-[#bd93f9]/30" },
    { title: "⚙️ BUILDING", desc: "Actively Developed Projects", items: building, color: "text-[#00ff66] border-[#00ff66]/30" },
    { title: "📦 ARCHIVED", desc: "Old Projects / Archived Ideas", items: archived, color: "text-[#ff5555] border-[#ff5555]/30" }
  ];

  return (
    <LayoutWrapper>
      <div ref={containerRef} className="flex flex-col gap-6 py-4 select-none">
        {/* Header */}
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold text-[#00ff66] border-b border-[#00ff66]/20 pb-2 flex items-center gap-2">
            <Monitor size={24} /> Workshop Board
          </h1>
          <p className="text-xs text-slate-400">
            Kanban simulation categorizing project research and development progress.
          </p>
        </div>

        {/* Board grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start mt-4">
          {columns.map((col, idx) => (
            <div
              key={idx}
              className={`board-column flex flex-col bg-[#090d16]/70 border rounded-lg p-4 min-h-[600px] shadow-lg ${col.color}`}
            >
              {/* Header */}
              <div className="flex flex-col gap-1 border-b border-slate-800 pb-3 mb-4">
                <span className="font-extrabold tracking-widest text-sm">{col.title}</span>
                <span className="text-[10px] text-slate-500">{col.desc}</span>
              </div>

              {/* Items */}
              <div className="space-y-3 flex-grow overflow-y-auto max-h-[700px] pr-1">
                {col.items.length === 0 ? (
                  <div className="text-center text-xs text-slate-600 py-12">
                    No items in this state.
                  </div>
                ) : (
                  col.items.map((item) => (
                    <div
                      key={item.id}
                      className="workshop-card bg-[#0b1322] border border-slate-800 hover:border-[#00ff66]/30 transition-all rounded p-4 flex flex-col gap-2 shadow hover:translate-y-[-2px]"
                    >
                      {/* Title & icons */}
                      <div className="flex justify-between items-start">
                        <span className="font-bold text-xs text-slate-200 truncate pr-2" title={item.id}>
                          {item.id}
                        </span>
                        <Folder size={12} className="text-[#00ccff] shrink-0" />
                      </div>

                      {/* Description */}
                      <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-3">
                        {item.description_vi || item.description}
                      </p>

                      {/* Tech stack */}
                      {item.tech_stack && item.tech_stack.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {item.tech_stack.slice(0, 3).map((t) => (
                            <span
                              key={t}
                              className="text-[9px] bg-slate-800/80 text-slate-300 px-1.5 py-0.5 rounded font-mono"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Meta stats / links */}
                      <div className="flex justify-between items-center text-[10px] text-slate-500 border-t border-slate-800/60 pt-2 mt-2">
                        <div className="flex items-center gap-2">
                          <span className="flex items-center gap-0.5">
                            <Star size={10} className="text-[#ffb86c]" />
                            {item.stars || 0}
                          </span>
                          <span className="flex items-center gap-0.5">
                            <GitFork size={10} className="text-[#00ccff]" />
                            {item.forks || 0}
                          </span>
                        </div>

                        {item.github_url && (
                          <a
                            href={item.github_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#00ff66] hover:underline flex items-center gap-0.5"
                          >
                            <PlayCircle size={10} />
                            Code
                          </a>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </LayoutWrapper>
  );
}
