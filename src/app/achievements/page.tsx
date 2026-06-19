"use client";

import React, { useEffect, useRef } from "react";
import LayoutWrapper from "@/components/LayoutWrapper";
import achievementsData from "@/data/generated/achievements.json";
import { gsap, ScrollTrigger } from "@/lib/gsap-config";
import { shimmerEffect } from "@/lib/animations";
import { Award, Star } from "lucide-react";

export default function Achievements() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // Prevent FOUC — set initial hidden state immediately
        gsap.set(".achievement-card", { autoAlpha: 0, y: 40 });

        ScrollTrigger.batch(".achievement-card", {
          onEnter: (els) => {
            gsap.to(els, { autoAlpha: 1, y: 0, stagger: 0.08, duration: 0.6, ease: "power2.out" });
            gsap.from(
              els.map(el => el.querySelector(".trophy-icon")).filter(Boolean),
              { scale: 0, duration: 0.4, delay: 0.2, ease: "back.out(1.7)" }
            );
            shimmerEffect(els);
          },
          start: "top 88%",
          once: true,
        });
      });
      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(".achievement-card", { autoAlpha: 1, y: 0 });
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
            <Award size={24} /> Achievements
          </h1>
          <p className="text-xs text-slate-400">
            Achievement system recognizing open source contribution milestones.
          </p>
        </div>

        {/* Trophies Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
          {achievementsData.data.achievements.map((ach, idx) => (
            <div
              key={idx}
              className="achievement-card bg-[#090d16]/80 border border-slate-800 hover:border-[#00ff66]/40 transition-all rounded-lg p-5 flex flex-col items-center text-center gap-3 shadow-lg relative overflow-hidden group"
            >
              {/* Shimmer overlay */}
              <div className="shimmer-overlay absolute inset-0 pointer-events-none rounded-lg" style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)" }} />

              {/* Star corner effect */}
              <Star size={10} className="absolute top-2 right-2 text-slate-600 group-hover:text-[#ffb86c] transition-colors" />

              {/* Trophy icon */}
              <div className="trophy-icon w-16 h-16 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform shadow-inner">
                {ach.icon || "🏆"}
              </div>

              {/* Content */}
              <div className="flex flex-col gap-1">
                <h3 className="font-bold text-xs text-slate-200 uppercase tracking-wider">
                  {ach.title_vi || ach.title}
                </h3>
                <span className="text-[9px] text-[#00ccff] font-mono">{ach.date}</span>
              </div>

              {/* Description */}
              <p className="text-[10px] text-slate-400 leading-relaxed">
                {ach.desc_vi || ach.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </LayoutWrapper>
  );
}
