"use client";

import React, { useEffect, useState, useRef } from "react";
import LayoutWrapper from "@/components/LayoutWrapper";
import brainData from "@/data/generated/brain.json";
import changelogData from "@/data/generated/changelog.json";
import { gsap } from "@/lib/gsap-config";
import { fadeInUp } from "@/lib/animations";
import { Cpu, Terminal, RefreshCw, Layers, Award, Sparkles, BookOpen } from "lucide-react";

const brain = brainData.data;
const changelog = changelogData.data;

// Dynamically build thought streams from brain data
const thoughtStreams = [
  `Initializing Neko's Cognitive Engine... [LOADED]`,
  `Analyzing active developer interest vectors...`,
  `Detected primary focus: ${brain.current_focus}`,
  `Retrieving current curiosity narrative...`,
  `Curiosity context: "${brain.ai_curiosity_summary}"`,
  `Syncing learning parameters. Learning rate is at ${brain.learning_rate}%.`,
  `Registering active research topics: ${brain.research_topics.join(", ")}`,
  `Scanning recent changelog events...`,
  `Latest release: ${changelog.releases?.[0]?.version || "v1.0.0"} (${changelog.releases?.[0]?.monthName || "Current"})`,
  `Brain Status: ACTIVE. Thought streams fully synchronized.`,
];

export default function Brain() {
  const [thoughts, setThoughts] = useState<string[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const pulseRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timeoutIds: ReturnType<typeof setTimeout>[] = [];
    let delay = 0.5;

    thoughtStreams.forEach((stream) => {
      const id = setTimeout(() => {
        setThoughts((prev) => {
          // Guard: không thêm nếu đã có dòng này (StrictMode double-invoke)
          if (prev[prev.length - 1] === stream) return prev;
          return [...prev, stream];
        });
        if (pulseRef.current) {
          gsap.fromTo(
            pulseRef.current,
            { scale: 1, opacity: 0.15 },
            { scale: 1.25, opacity: 0.4, duration: 0.3, yoyo: true, repeat: 1, ease: "power1.inOut" }
          );
        }
      }, delay * 1000);
      timeoutIds.push(id);
      delay += 1 + Math.random() * 1.2;
    });

    const ctx = gsap.context(() => {
      fadeInUp(".brain-header", containerRef.current!, 0);
      gsap.from(".interest-bar-fill", { width: "0%", duration: 1, ease: "power2.out", stagger: 0.05 });
      gsap.to(".orbit-inner", { rotation: 360, svgOrigin: "50 50", duration: 10, repeat: -1, ease: "none" });
      gsap.to(".orbit-outer", { rotation: -360, svgOrigin: "50 50", duration: 20, repeat: -1, ease: "none" });
    }, containerRef);

    return () => {
      timeoutIds.forEach(clearTimeout);
      ctx.revert();
    };
  }, []);

  return (
    <LayoutWrapper>
      <div ref={containerRef} className="flex flex-col gap-6 py-4 select-none">
        {/* Header */}
        <div className="brain-header flex flex-col gap-2">
          <h1 className="text-2xl font-bold text-[#00ff66] border-b border-[#00ff66]/20 pb-2 flex items-center gap-2">
            <Cpu size={24} /> Thought Streams
          </h1>
          <p className="text-xs text-slate-400">
            Simulated thought streams, active research directions, and learning focus.
          </p>
        </div>

        {/* Dynamic focus, summary, and stats grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-2">
          {/* Current Focus Board */}
          <div className="lg:col-span-2 bg-[#090d16]/70 border border-slate-800 rounded-lg p-5 flex flex-col justify-between">
            <div className="flex flex-col gap-3">
              <span className="text-[10px] text-[#00ccff] uppercase font-mono tracking-widest flex items-center gap-1.5 font-bold">
                <Sparkles size={12} /> Current Focus
              </span>
              <h2 className="text-lg font-bold text-slate-200 leading-snug">
                {brain.current_focus_vi || brain.current_focus}
              </h2>
              <p className="text-xs text-slate-400 font-mono mt-1 leading-relaxed border-l-2 border-[#00ff66]/40 pl-3">
                {brain.ai_curiosity_summary_vi || brain.ai_curiosity_summary}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-6 pt-4 border-t border-slate-850">
              <div>
                <span className="text-[10px] text-slate-500 uppercase block">Learning Rate</span>
                <span className="text-lg font-mono font-bold text-[#00ff66]">{brain.learning_rate}%</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase block">Active Hours</span>
                <span className="text-lg font-mono font-bold text-[#00ccff]">{brain.active_hours}</span>
              </div>
            </div>
          </div>

          {/* Research Areas */}
          <div className="lg:col-span-1 bg-[#090d16]/70 border border-slate-800 rounded-lg p-5 flex flex-col gap-3">
            <span className="text-[10px] text-[#bd93f9] uppercase font-mono tracking-widest flex items-center gap-1.5 font-bold">
              <BookOpen size={12} /> Research Topics
            </span>
            <div className="flex flex-wrap gap-2 mt-1">
              {brain.research_topics.map((topic) => (
                <span
                  key={topic}
                  className="text-xs bg-[#bd93f9]/10 text-[#bd93f9] border border-[#bd93f9]/20 px-2.5 py-1 rounded font-mono font-bold"
                >
                  #{topic}
                </span>
              ))}
            </div>
            <p className="text-[10px] text-slate-500 font-mono mt-auto pt-2 border-t border-slate-850">
              Research keywords automatically extracted from code change frequency and recent repository topics.
            </p>
          </div>
        </div>

        {/* Thought visualization & log dashboard */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
          {/* Visual brain core */}
          <div className="lg:col-span-1 bg-[#090d16]/70 border border-slate-800 rounded-lg p-6 flex flex-col items-center justify-center min-h-[300px] relative overflow-hidden">
            {/* Pulsing glow background */}
            <div
              ref={pulseRef}
              className="absolute w-48 h-48 rounded-full bg-[#00ff66] opacity-[0.08] blur-2xl pointer-events-none"
            ></div>

            {/* Simulated brain core SVG */}
            <svg viewBox="0 0 100 100" className="w-32 h-32 relative z-10">
              {/* Orbits */}
              <circle cx="50" cy="50" r="35" fill="none" stroke="#00ccff" strokeWidth="0.5" strokeDasharray="2, 5" opacity="0.3" className="orbit-outer" />
              <circle cx="50" cy="50" r="25" fill="none" stroke="#00ff66" strokeWidth="0.5" strokeDasharray="3, 3" opacity="0.4" className="orbit-inner" />

              {/* Nucleus */}
              <circle cx="50" cy="50" r="12" fill="#090d16" stroke="#00ff66" strokeWidth="1.5" className="glow-green" />
              <circle cx="50" cy="50" r="6" fill="#00ff66" opacity="0.8" />
              <circle cx="50" cy="50" r="2" fill="#ffffff" />
            </svg>

            <div className="mt-6 text-center z-10">
              <span className="text-xs uppercase font-extrabold text-slate-300 tracking-widest block mb-1">
                Cognitive State
              </span>
              <span className="text-[10px] text-[#00ff66] font-mono font-bold px-2 py-0.5 rounded border border-[#00ff66]/20 bg-[#00ff66]/5">
                SYNCHRONIZED
              </span>
            </div>
          </div>

          {/* Thought stream logs console */}
          <div className="lg:col-span-2 bg-[#090d16]/70 border border-slate-800 rounded-lg p-5 flex flex-col min-h-[350px]">
            {/* Header console */}
            <div className="flex justify-between items-center border-b border-slate-850 pb-3 mb-4 text-xs select-none">
              <div className="flex items-center gap-2 text-slate-400">
                <Terminal size={14} className="text-[#00ff66]" />
                <span>Neko.OS Thought Logs</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-500">
                <RefreshCw size={12} className="animate-spin" />
                <span>Live stream</span>
              </div>
            </div>

            {/* Log streams list */}
            <div className="flex-grow space-y-2.5 overflow-y-auto text-xs md:text-sm font-mono text-slate-300 select-text">
              {thoughts.map((thought, idx) => (
                <div key={idx} className="thought-log flex items-start">
                  <span className="text-[#00ccff] mr-2 shrink-0 select-none">&gt;&gt;</span>
                  <span className="leading-relaxed">{thought}</span>
                </div>
              ))}

              {thoughts.length < thoughtStreams.length && (
                <div className="flex items-center mt-2 text-[#00ff66] opacity-75">
                  <span className="text-[#00ccff] mr-2 shrink-0 select-none">&gt;&gt;</span>
                  <span>Agent formulating next thought...</span>
                  <span className="blinking-cursor"></span>
                </div>
              )}
            </div>

            {/* Legend info */}
            <div className="mt-4 pt-3 border-t border-slate-850 flex items-center justify-between text-[10px] text-slate-500 select-none">
              <span className="flex items-center gap-1">
                <Layers size={10} /> Mode: Autonomous Inference
              </span>
              <span>Memory Blocks: 256MB</span>
            </div>
          </div>
        </div>

        {/* Cognitive Interests Matrix */}
        <div className="bg-[#090d16]/70 border border-slate-800 rounded-lg p-5 flex flex-col gap-4">
          <span className="text-[10px] text-[#00ff66] uppercase font-mono tracking-widest flex items-center gap-1.5 font-bold">
            <Award size={12} /> Skills & Interest Matrix
          </span>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {brain.interests.map((interest, idx) => (
              <div
                key={interest.name}
                style={{
                  animation: `fadeSlideUp 0.4s ease-out ${idx * 0.06}s both`,
                }}
                className="bg-[#0b1322] border border-slate-800/80 p-3.5 rounded flex flex-col gap-2 transition-all hover:border-[#00ff66]/20"
              >
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-200 font-mono">{interest.name}</span>
                  <span className="text-[10px] uppercase px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 border border-slate-750 font-mono">
                    {interest.level}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-grow bg-slate-900 rounded-full h-1.5 overflow-hidden border border-slate-850">
                    <div className="interest-bar-fill bg-[#00ff66] h-full shadow-[0_0_5px_rgba(0,255,102,0.6)]"></div>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono w-6 text-right">{interest.score}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </LayoutWrapper>
  );
}
