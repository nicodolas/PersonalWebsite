"use client";

import React, { useState, useRef } from "react";
import dynamic from "next/dynamic";
import LayoutWrapper from "@/components/LayoutWrapper";
import galaxyData from "@/data/generated/galaxy.json";
import { gsap } from "@/lib/gsap-config";
import { Star, GitFork, Link2, Sparkles, Orbit } from "lucide-react";
import { useEffect } from "react";

// Load Three.js scene client-side only (no SSR)
const GalaxyScene = dynamic(() => import("@/components/GalaxyScene"), { ssr: false });

const galaxy = galaxyData.data;

interface Node {
  id: string;
  description?: string;
  description_vi?: string;
  group: string;
  stars?: number;
  forks?: number;
  size: number;
  tech: string[];
  githubUrl?: string;
}

function getColor(group: string) {
  const g = group.toLowerCase();
  if (g.includes("react") || g.includes("next") || g.includes("frontend")) return "#00ccff";
  if (g.includes("node") || g.includes("express") || g.includes("backend")) return "#ff5555";
  if (g.includes("n8n") || g.includes("docker") || g.includes("automation")) return "#bd93f9";
  return "#00ff66";
}

export default function Galaxy() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isOrbiting, setIsOrbiting] = useState(true);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);

  // Entrance animation
  useEffect(() => {
    if (!containerRef.current) return;
    const ctx = gsap.context(() => {
      gsap.from(".galaxy-header", { y: -20, autoAlpha: 0, duration: 0.5, ease: "power2.out" });
      gsap.from(".galaxy-canvas", { autoAlpha: 0, scale: 0.97, duration: 0.7, delay: 0.1, ease: "power2.out" });
      gsap.from(".galaxy-panel", { x: 30, autoAlpha: 0, duration: 0.5, delay: 0.25, ease: "power2.out" });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  const nodes = galaxy.nodes as unknown as Node[];
  const links = galaxy.links as { source: string; target: string }[];

  return (
    <LayoutWrapper>
      <div ref={containerRef} className="flex flex-col gap-6 py-4 select-none">

        {/* Header */}
        <div className="galaxy-header flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-[#00ff66]/10 pb-4">
          <div className="flex flex-col gap-1.5">
            <h1 className="text-2xl font-bold text-[#00ff66] flex items-center gap-2">
              <Orbit className="animate-spin-slow" size={24} /> Project Galaxy Map
              <span className="text-xs font-normal text-[#00ff66]/50 border border-[#00ff66]/20 px-2 py-0.5 rounded ml-1">
                3D · Three.js
              </span>
            </h1>
            <p className="text-xs text-slate-400">
              Real-time 3D galaxy. Drag to orbit · Scroll to zoom · Click a planet to scan.
            </p>
          </div>
          <button
            onClick={() => {
              setIsOrbiting(p => !p);
              // Dispatch custom event so GalaxyScene can hear it
              window.dispatchEvent(new CustomEvent("galaxy:toggleOrbit"));
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-xs font-mono font-bold transition-all ${isOrbiting
                ? "bg-[#00ff66]/10 border-[#00ff66]/40 text-[#00ff66] hover:bg-[#00ff66]/20"
                : "bg-[#ff5555]/10 border-[#ff5555]/40 text-[#ff5555] hover:bg-[#ff5555]/20"
              }`}
          >
            <Orbit size={14} className={isOrbiting ? "animate-spin-slow" : ""} />
            {isOrbiting ? "⏸ FREEZE ORBIT" : "▶ RESUME ORBIT"}
          </button>
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">

          {/* 3D Galaxy Canvas */}
          <div className="galaxy-canvas lg:col-span-2 bg-[#03050a] border border-slate-800/60 rounded-xl overflow-hidden relative"
            style={{ minHeight: 500 }}>

            <GalaxyScene
              nodes={nodes}
              links={links}
              onSelectNode={(n) => setSelectedNode(n)}
              selectedId={selectedNode?.id ?? null}
            />

            {/* Legend */}
            <div className="absolute bottom-3 left-4 flex gap-3 text-[9px] font-mono text-slate-500 bg-slate-950/80 border border-slate-800 px-3 py-1.5 rounded backdrop-blur-sm pointer-events-none">
              {[["#00ccff", "Frontend"], ["#ff5555", "Backend"], ["#bd93f9", "Automation"], ["#00ff66", "Core"]].map(([c, l]) => (
                <span key={l} className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full" style={{ background: c }} />
                  {l}
                </span>
              ))}
            </div>

            {/* Controls hint */}
            <div className="absolute top-3 right-4 text-[9px] font-mono text-slate-600 bg-slate-950/70 border border-slate-800 px-2 py-1 rounded pointer-events-none leading-relaxed">
              🖱 Drag to rotate · Scroll to zoom
            </div>
          </div>

          {/* Detail panel */}
          <div className="galaxy-panel bg-[#090d16]/75 border border-slate-800 rounded-xl p-5 flex flex-col justify-between backdrop-blur-md relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-[#00ccff]/30 animate-pulse" />

            {selectedNode ? (
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1 border-b border-slate-800 pb-3">
                  <span className="text-[9px] font-mono font-bold tracking-widest text-[#00ccff] flex items-center gap-1">
                    <Sparkles size={10} className="animate-pulse" /> PLANET SPECIFICATION
                  </span>
                  <span className="text-[8px] font-mono text-slate-500 uppercase">
                    SECTOR: {selectedNode.group.substring(0, 12)}
                  </span>
                  <h2 className="text-lg font-bold text-slate-100 font-mono mt-1">{selectedNode.id}</h2>
                  <span
                    className="text-[9px] px-2 py-0.5 mt-1 rounded border border-slate-800 bg-slate-950/80 w-fit font-bold font-mono uppercase"
                    style={{ color: getColor(selectedNode.group) }}
                  >
                    {selectedNode.group}
                  </span>
                </div>

                <div className="bg-slate-950/40 border border-slate-900/60 p-3 rounded-lg">
                  <span className="text-[9px] font-mono uppercase font-bold text-slate-500 block mb-1">Description</span>
                  <p className="text-slate-300 leading-relaxed font-mono italic text-[11px]">
                    &ldquo;{selectedNode.description_vi || selectedNode.description || "No data available."}&rdquo;
                  </p>
                </div>

                {selectedNode.tech?.length > 0 && (
                  <div>
                    <span className="text-[9px] font-mono uppercase font-bold text-slate-500 block mb-1.5">Tech Stack</span>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedNode.tech.map(t => (
                        <span key={t} className="bg-slate-950 text-slate-300 border border-slate-800 px-2 py-0.5 rounded text-[9px] font-mono">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-5 text-xs border-t border-slate-800 pt-3 font-mono">
                  <div className="flex items-center gap-1.5 text-[#ffb86c]">
                    <Star size={12} /> Stars: <strong className="text-slate-200">{selectedNode.stars || 0}</strong>
                  </div>
                  <div className="flex items-center gap-1.5 text-[#00ccff]">
                    <GitFork size={12} /> Forks: <strong className="text-slate-200">{selectedNode.forks || 0}</strong>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-xs text-slate-500 py-16 font-mono">
                🚀 SCANNING GALAXY...<br />
                <span className="text-slate-600 text-[10px] mt-2 block">Click any planet to display specs.</span>
              </div>
            )}

            {selectedNode?.githubUrl && (
              <a
                href={selectedNode.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 flex items-center justify-center gap-2 w-full py-2.5 bg-[#00ff66]/10 hover:bg-[#00ff66] text-[#00ff66] hover:text-slate-950 border border-[#00ff66]/30 hover:border-[#00ff66] rounded-lg text-xs font-mono font-bold transition-all"
              >
                <Link2 size={14} /> OPEN GITHUB LINK &gt;&gt;
              </a>
            )}
          </div>
        </div>
      </div>
    </LayoutWrapper>
  );
}
