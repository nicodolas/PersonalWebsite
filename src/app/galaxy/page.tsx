"use client";

import React, { useState, useEffect, useRef } from "react";
import LayoutWrapper from "@/components/LayoutWrapper";
import galaxyData from "@/data/generated/galaxy.json";
import gsap from "gsap";
import { GitBranch, Star, GitFork, Link2 } from "lucide-react";

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

interface PositionNode extends Node {
  x: number;
  y: number;
}

const STARS = Array.from({ length: 30 }).map((_, i) => ({
  cx: 40 + (i * 19) % 520,
  cy: 30 + (i * 13) % 390,
  r: 0.5 + (i % 3) * 0.4,
  opacity: 0.2 + (i % 5) * 0.15
}));

export default function Galaxy() {
  const [nodes] = useState<PositionNode[]>(() => {
    const width = 600;
    const height = 450;
    const cx = width / 2;
    const cy = height / 2;

    return (galaxy.nodes as unknown as Node[]).map((node, index) => {
      let radius = 100;
      if (node.group.includes("Next") || node.group.includes("React")) radius = 80;
      else if (node.group.includes("Node") || node.group.includes("Express")) radius = 140;
      else if (node.group?.includes("n8n") || node.group?.includes("Docker")) radius = 200;
      else radius = 220;

      const angle = (index * (2 * Math.PI)) / galaxy.nodes.length + (index % 3) * 0.1 - 0.1;
      const x = cx + radius * Math.cos(angle);
      const y = cy + radius * Math.sin(angle);

      return {
        ...node,
        x,
        y
      };
    });
  });

  const [selectedNode, setSelectedNode] = useState<PositionNode | null>(() => {
    const width = 600;
    const height = 450;
    const cx = width / 2;
    const cy = height / 2;
    const items = (galaxy.nodes as unknown as Node[]).map((node, index) => {
      let radius = 100;
      if (node.group.includes("Next") || node.group.includes("React")) radius = 80;
      else if (node.group.includes("Node") || node.group.includes("Express")) radius = 140;
      else if (node.group?.includes("n8n") || node.group?.includes("Docker")) radius = 200;
      else radius = 220;

      const angle = (index * (2 * Math.PI)) / galaxy.nodes.length + (index % 3) * 0.1 - 0.1;
      return {
        ...node,
        x: cx + radius * Math.cos(angle),
        y: cy + radius * Math.sin(angle)
      };
    });
    return items.length > 0 ? items[0] : null;
  });

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // GSAP animations for planetary system
    const ctx = gsap.context(() => {
      gsap.from(".galaxy-node", {
        scale: 0,
        opacity: 0,
        duration: 1.2,
        stagger: 0.05,
        ease: "back.out(1.5)"
      });
      gsap.from(".galaxy-edge", {
        strokeDasharray: "5, 5",
        opacity: 0,
        duration: 1.5,
        stagger: 0.02,
        ease: "power2.out"
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  // Get color for node group
  const getNodeColor = (group: string) => {
    const g = group.toLowerCase();
    if (g.includes("react") || g.includes("next") || g.includes("frontend")) return "#00ccff"; // Blue
    if (g.includes("node") || g.includes("express") || g.includes("backend")) return "#ff5555"; // Red
    if (g.includes("n8n") || g.includes("docker") || g.includes("automation")) return "#bd93f9"; // Purple
    return "#00ff66"; // Green
  };

  // Find edges connecting the nodes
  const activeLinks = galaxy.links.map(link => {
    const sourceNode = nodes.find(n => n.id === link.source);
    const targetNode = nodes.find(n => n.id === link.target);
    if (sourceNode && targetNode) {
      return {
        id: `${link.source}-${link.target}`,
        x1: sourceNode.x,
        y1: sourceNode.y,
        x2: targetNode.x,
        y2: targetNode.y,
        label: link.label,
        color: getNodeColor(sourceNode.group)
      };
    }
    return null;
  }).filter(Boolean);

  return (
    <LayoutWrapper>
      <div ref={containerRef} className="flex flex-col gap-6 py-4 select-none">
        {/* Title */}
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold text-[#00ff66] border-b border-[#00ff66]/20 pb-2 flex items-center gap-2">
            <GitBranch size={24} /> Tinh Vân Dự Án (Project Galaxy Map)
          </h1>
          <p className="text-xs text-slate-400">
            Khám phá vũ trụ liên kết các dự án của Neko. Mỗi chòm sao đại diện cho một chủ đề và ngôn ngữ phát triển.
          </p>
        </div>

        {/* Map UI */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-4 items-stretch">
          {/* SVG Map Canvas */}
          <div className="lg:col-span-2 bg-[#090d16]/70 border border-slate-800 rounded-lg p-4 flex items-center justify-center relative min-h-[480px]">
            <svg viewBox="0 0 600 450" className="w-full h-full max-h-[500px]">
              {/* Star background decoration */}
              {STARS.map((star, i) => (
                <circle 
                  key={i}
                  cx={star.cx}
                  cy={star.cy}
                  r={star.r}
                  fill="#ffffff"
                  opacity={star.opacity}
                  className="animate-pulse"
                />
              ))}

              {/* Edge Links */}
              {activeLinks.map(link => link && (
                <line 
                  key={link.id}
                  x1={link.x1}
                  y1={link.y1}
                  x2={link.x2}
                  y2={link.y2}
                  stroke={link.color}
                  strokeWidth="0.8"
                  opacity="0.15"
                  className="galaxy-edge"
                />
              ))}

              {/* Core Sun Node */}
              <circle cx="300" cy="225" r="14" fill="#00ff66" opacity="0.08" className="animate-ping" />
              <circle cx="300" cy="225" r="8" fill="#00ff66" opacity="0.8" className="glow-green" />
              <text x="300" y="245" textAnchor="middle" fill="#00ff66" className="text-[9px] font-bold font-mono">NEKO_CORE</text>

              {/* Orbit guide circles */}
              <circle cx="300" cy="225" r="80" fill="none" stroke="#ffffff" strokeWidth="0.3" strokeDasharray="3, 10" opacity="0.1" />
              <circle cx="300" cy="225" r="140" fill="none" stroke="#ffffff" strokeWidth="0.3" strokeDasharray="3, 10" opacity="0.1" />
              <circle cx="300" cy="225" r="200" fill="none" stroke="#ffffff" strokeWidth="0.3" strokeDasharray="3, 10" opacity="0.1" />

              {/* Repository Planets */}
              {nodes.map(node => (
                <g 
                  key={node.id} 
                  className="galaxy-node cursor-pointer"
                  onClick={() => setSelectedNode(node)}
                >
                  {/* Outer glow ring on selected */}
                  {selectedNode?.id === node.id && (
                    <circle 
                      cx={node.x}
                      cy={node.y}
                      r={node.size + 4}
                      fill="none"
                      stroke={getNodeColor(node.group)}
                      strokeWidth="1"
                      className="animate-spin"
                      strokeDasharray="4, 4"
                    />
                  )}

                  {/* Body Circle */}
                  <circle 
                    cx={node.x}
                    cy={node.y}
                    r={node.size}
                    fill={getNodeColor(node.group)}
                    opacity={selectedNode?.id === node.id ? "1" : "0.75"}
                    className="hover:opacity-100 transition-opacity"
                  />

                  {/* Label */}
                  <text 
                    x={node.x}
                    y={node.y + node.size + 10}
                    textAnchor="middle"
                    fill="#e2e8f0"
                    className="text-[8px] font-mono select-none"
                    opacity={selectedNode?.id === node.id ? "1" : "0.5"}
                  >
                    {node.id}
                  </text>
                </g>
              ))}
            </svg>
          </div>

          {/* Planet detail Panel */}
          <div className="bg-[#090d16]/70 border border-slate-800 rounded-lg p-5 flex flex-col justify-between min-h-[350px]">
            {selectedNode ? (
              <div className="flex flex-col gap-4">
                {/* Header info */}
                <div className="flex flex-col gap-1 border-b border-slate-800 pb-3">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#00ccff]">PLANET SPECIFICATION</span>
                  <h2 className="text-base font-bold text-slate-200 glow-blue">{selectedNode.id}</h2>
                  <span 
                    className="text-[9px] px-2 py-0.5 rounded border border-slate-800 bg-slate-900 w-fit font-bold font-mono"
                    style={{ color: getNodeColor(selectedNode.group) }}
                  >
                    Group: {selectedNode.group}
                  </span>
                </div>

                {/* Description */}
                <div className="flex flex-col gap-1 text-xs">
                  <span className="text-[9px] uppercase font-bold text-slate-500">Mô tả:</span>
                  <p className="text-slate-300 leading-relaxed italic">
                    &ldquo;{selectedNode.description_vi || selectedNode.description}&rdquo;
                  </p>
                </div>

                {/* Tech stack */}
                {selectedNode.tech && selectedNode.tech.length > 0 && (
                  <div className="flex flex-col gap-1 text-xs mt-1">
                    <span className="text-[9px] uppercase font-bold text-slate-500">Nguyên tố lõi:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {selectedNode.tech.map(t => (
                        <span key={t} className="bg-slate-900 text-slate-300 border border-slate-800 px-2 py-0.5 rounded text-[9px] font-mono">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Stats */}
                <div className="flex items-center gap-4 text-xs mt-2 border-t border-slate-800/60 pt-3">
                  <div className="flex items-center gap-1 text-[#ffb86c]">
                    <Star size={12} />
                    <span>Stars: <strong>{selectedNode.stars || 0}</strong></span>
                  </div>
                  <div className="flex items-center gap-1 text-[#00ccff]">
                    <GitFork size={12} />
                    <span>Forks: <strong>{selectedNode.forks || 0}</strong></span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-xs text-slate-500 py-12">
                Chọn một hành tinh trên bản đồ để hiển thị thông số.
              </div>
            )}

            {/* Bottom link */}
            {selectedNode?.githubUrl && (
              <a 
                href={selectedNode.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 flex items-center justify-center gap-2 w-full py-2 bg-[#00ff66]/10 hover:bg-[#00ff66] text-[#00ff66] hover:text-[#05070a] border border-[#00ff66]/30 hover:border-[#00ff66] rounded text-xs font-bold transition-all"
              >
                <Link2 size={14} /> KÍCH HOẠT ĐƯỜNG DẪN GITHUB
              </a>
            )}
          </div>
        </div>
      </div>
    </LayoutWrapper>
  );
}
