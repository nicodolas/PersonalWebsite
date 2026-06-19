"use client";

import React, { useEffect, useRef } from "react";
import LayoutWrapper from "@/components/LayoutWrapper";
import graveyardData from "@/data/generated/graveyard.json";
import { gsap, ScrollTrigger } from "@/lib/gsap-config";
import { Skull, HelpCircle, Archive, AlertTriangle } from "lucide-react";

export default function Graveyard() {
  const containerRef = useRef<HTMLDivElement>(null);
  const projects = graveyardData.data.projects || [];

  useEffect(() => {
    if (!containerRef.current) return;
    const ctx = gsap.context(() => {
      gsap.set(".tombstone", { autoAlpha: 0, y: 40 });
      ScrollTrigger.batch(".tombstone", {
        onEnter: (els) => gsap.to(els, { autoAlpha: 1, y: 0, stagger: 0.08, duration: 0.6, ease: "power2.out" }),
        start: "top 88%",
        once: true,
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <LayoutWrapper>
      <div ref={containerRef} className="flex flex-col gap-6 py-4 select-none">
        {/* Header */}
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold text-[#ff5555] border-b border-[#ff5555]/20 pb-2 flex items-center gap-2">
            <Skull size={24} /> Project Graveyard
          </h1>
          <p className="text-xs text-slate-400">
            Archive of old experiments, closed projects, and deferred ideas. Failures are celebrated as learning.
          </p>
        </div>

        {/* Tombstones grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {projects.map((repo) => (
            <div
              key={repo.id}
              className="tombstone bg-[#0d0912]/80 border-t-4 border-t-slate-600 border border-slate-900 rounded-t-xl p-5 flex flex-col gap-3 shadow-2xl relative hover:border-[#ff5555]/30 hover:translate-y-[-2px] transition-all"
            >
              {/* RIP inscription */}
              <div className="text-center border-b border-slate-800 pb-2 flex flex-col gap-0.5">
                <span className="text-xs font-bold text-slate-500 tracking-widest font-mono">R.I.P</span>
                <h3 className="font-extrabold text-sm text-[#ff5555] font-mono truncate px-2" title={repo.name}>
                  {repo.name}
                </h3>
                {repo.tech && repo.tech.length > 0 && (
                  <div className="flex flex-wrap justify-center gap-1 mt-1.5">
                    {repo.tech.map((t) => (
                      <span key={t} className="text-[8px] bg-slate-900 text-slate-400 border border-slate-800 px-1 py-0.2 rounded font-mono">
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Reason / Description */}
              <div className="flex flex-col gap-1 py-1 text-center">
                <span className="text-[9px] text-[#ff5555]/60 font-bold uppercase flex items-center justify-center gap-1">
                  <AlertTriangle size={8} /> Reason:
                </span>
                <p className="text-xs text-slate-400 leading-relaxed italic">
                  &ldquo;{repo.reason_vi || repo.reason}&rdquo;
                </p>
              </div>

              {/* Lesson learned */}
              <div className="bg-black/40 border border-slate-900 rounded p-2.5 mt-auto flex flex-col gap-1 text-[10px]">
                <span className="text-[#ffb86c] font-bold flex items-center gap-1 uppercase">
                  <HelpCircle size={10} /> Lesson Learned:
                </span>
                <span className="text-slate-450 font-mono leading-relaxed">
                  {repo.lessons_learned_vi || repo.lessons_learned}
                </span>
              </div>

              {/* RIP bottom info */}
              <div className="text-center text-[9px] text-slate-600 font-mono border-t border-slate-850 pt-2 mt-1">
                ARCHIVED {repo.date_archived ? repo.date_archived.substring(0, 7) : "UNKNOWN"}
              </div>
            </div>
          ))}

          {projects.length === 0 && (
            <div className="col-span-full py-24 text-center border border-dashed border-slate-800 rounded-lg flex flex-col items-center gap-3">
              <Archive size={48} className="text-slate-600" />
              <p className="text-xs text-slate-500">
                No abandoned or failed projects. All entities are operating perfectly!
              </p>
            </div>
          )}
        </div>
      </div>
    </LayoutWrapper>
  );
}
