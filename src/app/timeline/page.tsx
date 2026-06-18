"use client";

import React, { useEffect, useRef } from "react";
import LayoutWrapper from "@/components/LayoutWrapper";
import timelineData from "@/data/generated/timeline.json";
import gsap from "gsap";
import { GitCommit, Calendar, Code, ChevronRight } from "lucide-react";

export default function Timeline() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Animate title
      gsap.from(".timeline-title", { opacity: 0, y: -20, duration: 0.8, ease: "power2.out" });
      
      // Animate timeline path
      gsap.from(".timeline-line", { scaleY: 0, transformOrigin: "top", duration: 1.5, ease: "power3.inOut" });

      // Animate timeline nodes
      gsap.from(".timeline-item", {
        opacity: 0,
        x: (index) => (index % 2 === 0 ? -40 : 40),
        duration: 1,
        stagger: 0.2,
        ease: "power2.out",
        delay: 0.3
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <LayoutWrapper>
      <div ref={containerRef} className="flex flex-col gap-6 py-4 select-none">
        {/* Title */}
        <div className="timeline-title flex flex-col gap-2">
          <h1 className="text-2xl font-bold text-[#00ff66] border-b border-[#00ff66]/20 pb-2 flex items-center gap-2">
            <Calendar size={24} /> Dòng Thời Gian Kỷ Nguyên (Developer Eras)
          </h1>
          <p className="text-xs text-slate-400">
            Hành trình phát triển kỹ năng và tích lũy công nghệ được cập nhật tự động từ lịch sử GitHub.
          </p>
        </div>

        {/* Timeline body */}
        <div className="relative flex flex-col items-center my-8">
          {/* Vertical line path */}
          <div className="timeline-line absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-[#00ff66]/20"></div>

          {/* Timeline Nodes */}
          <div className="w-full space-y-12">
            {timelineData.data.eras.map((era, index) => {
              const isEven = index % 2 === 0;
              return (
                <div 
                  key={era.year} 
                  className={`timeline-item flex flex-col md:flex-row items-stretch w-full ${
                    isEven ? "md:flex-row-reverse" : ""
                  }`}
                >
                  {/* Left side spacing */}
                  <div className="w-full md:w-1/2 px-4 md:px-8 flex flex-col items-start md:items-end justify-center text-left md:text-right">
                    {isEven ? (
                      <div className="flex flex-col items-start gap-1">
                        <span className="text-3xl font-extrabold text-[#00ccff] tracking-widest">{era.year}</span>
                        <h3 className="text-base font-bold text-slate-200">{era.title_vi}</h3>
                        <p className="text-xs text-slate-400 font-mono italic">{era.title}</p>
                      </div>
                    ) : null}
                  </div>

                  {/* Node icon dot */}
                  <div className="absolute left-4 md:left-1/2 -translate-x-1/2 flex items-center justify-center w-8 h-8 rounded-full border-2 border-[#00ff66] bg-[#05070a] z-10 shadow-lg border-glow-green">
                    <span className="text-xs font-bold text-[#00ff66]">{index + 1}</span>
                  </div>

                  {/* Right side content */}
                  <div className="w-full md:w-1/2 pl-12 pr-4 md:px-8 flex flex-col justify-center">
                    {!isEven ? (
                      <div className="flex flex-col items-start gap-1 mb-2">
                        <span className="text-3xl font-extrabold text-[#00ccff] tracking-widest">{era.year}</span>
                        <h3 className="text-base font-bold text-slate-200">{era.title_vi}</h3>
                        <p className="text-xs text-slate-400 font-mono italic">{era.title}</p>
                      </div>
                    ) : null}

                    {/* Detailed Card info */}
                    <div className="bg-[#090d16]/80 border border-slate-800 hover:border-[#00ff66]/30 transition-all rounded-lg p-5 shadow-xl text-left">
                      <p className="text-xs md:text-sm text-slate-300 leading-relaxed mb-4">
                        {era.description_vi}
                      </p>

                      {/* Timeline Stats */}
                      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 border-t border-slate-800/60 pt-3">
                        <div className="flex items-center gap-1">
                          <GitCommit size={14} className="text-[#ff5555]" />
                          <span>Commits: <strong className="text-slate-200">{era.commits}+</strong></span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Code size={14} className="text-[#00ccff]" />
                          <span>Projects: <strong className="text-slate-200">{era.repos.length}</strong></span>
                        </div>
                      </div>

                      {/* Tech badges */}
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {era.technologies.map((tech) => (
                          <span 
                            key={tech}
                            className="bg-[#00ff66]/5 text-[#00ff66] border border-[#00ff66]/10 px-2 py-0.5 rounded text-[10px] uppercase font-bold"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>

                      {/* Associated Repos List */}
                      {era.repos.length > 0 && (
                        <div className="mt-4 pt-3 border-t border-slate-800/60">
                          <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Dự án cốt lõi:</span>
                          <div className="space-y-1">
                            {era.repos.slice(0, 4).map(repo => (
                              <div key={repo} className="flex items-center gap-1 text-xs text-slate-400">
                                <ChevronRight size={10} className="text-[#00ccff]" />
                                <span>{repo}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </LayoutWrapper>
  );
}
