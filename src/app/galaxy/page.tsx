"use client";

import React, { useState, useEffect, useRef } from "react";
import LayoutWrapper from "@/components/LayoutWrapper";
import galaxyData from "@/data/generated/galaxy.json";
import { gsap } from "@/lib/gsap-config";
import { floatLoop } from "@/lib/animations";
import { Star, GitFork, Link2, Sparkles, Orbit } from "lucide-react";

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
  angle: number;
}

// Generate stars with coordinates, colors, and speeds
const STARS = Array.from({ length: 45 }).map((_, i) => ({
  cx: 30 + (i * 23) % 540,
  cy: 20 + (i * 17) % 410,
  r: 0.4 + (i % 3) * 0.5,
  opacity: 0.15 + (i % 6) * 0.13,
  color: i % 4 === 0 ? "#00ccff" : i % 5 === 0 ? "#ffb86c" : "#ffffff",
  speed: 1.5 + (i % 3) * 0.8
}));

// Helper: animate an SVG line drawing on (hover enter)
function animateEdgeIn(lineEl: SVGLineElement): void {
  const length =
    lineEl.getTotalLength?.() ??
    Math.hypot(
      parseFloat(lineEl.getAttribute("x2") ?? "0") - parseFloat(lineEl.getAttribute("x1") ?? "0"),
      parseFloat(lineEl.getAttribute("y2") ?? "0") - parseFloat(lineEl.getAttribute("y1") ?? "0")
    );
  gsap.fromTo(
    lineEl,
    { strokeDasharray: length, strokeDashoffset: length },
    { strokeDashoffset: 0, duration: 0.5, ease: "power2.out" }
  );
}

// Helper: animate an SVG line drawing off (hover leave)
function animateEdgeOut(lineEl: SVGLineElement): void {
  const length = parseFloat(lineEl.style.strokeDasharray || "0");
  gsap.to(lineEl, { strokeDashoffset: length, duration: 0.3, ease: "power1.in" });
}

export default function Galaxy() {
  const containerRef = useRef<HTMLDivElement>(null);

  // Track hovered node for dynamic relationships highlighting
  const [hoveredNode, setHoveredNode] = useState<PositionNode | null>(null);

  // Position nodes using a Phyllotaxis Golden Spiral distribution to avoid label overlapping
  const [nodes] = useState<PositionNode[]>(() => {
    const width = 600;
    const height = 450;
    const cx = width / 2;
    const cy = height / 2;
    const rawNodes = galaxy.nodes as unknown as Node[];

    // Sort by group then by size to group similar technologies together in the spiral
    const sortedNodes = [...rawNodes].sort((a, b) => {
      if (a.group !== b.group) return a.group.localeCompare(b.group);
      return b.size - a.size;
    });

    return sortedNodes.map((node, index) => {
      // Phyllotaxis Golden Spiral
      const theta = index * 137.5 * (Math.PI / 180); // Golden angle

      // Compute radius with sqrt spacing and spread multiplier to prevent collisions
      const r = 50 + Math.sqrt(index) * 31;

      const x = cx + r * Math.cos(theta);
      const y = cy + r * Math.sin(theta);

      return {
        ...node,
        x,
        y,
        angle: theta
      };
    });
  });

  const [selectedNode, setSelectedNode] = useState<PositionNode | null>(() => {
    return nodes.length > 0 ? nodes[0] : null;
  });

  // Main GSAP entrance animations, wrapped in matchMedia for reduced-motion support
  useEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from(".galaxy-node", {
          scale: 0,
          opacity: 0,
          duration: 1.4,
          stagger: 0.04,
          ease: "elastic.out(1, 0.75)"
        });
        gsap.from(".galaxy-edge", {
          opacity: 0,
          duration: 1.8,
          stagger: 0.01,
          ease: "power1.out"
        });

        // Float loop for galaxy nodes
        floatLoop(".galaxy-node", 6);
        // Override the stagger from the floatLoop default with a tighter per-element stagger
        gsap.to(".galaxy-node", {
          y: 6,
          duration: 2.5,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
          stagger: { each: 0.15, from: "random" },
          overwrite: "auto",
        });

        // Star twinkling ambient animation
        gsap.to(".twinkle-star", {
          opacity: 0.1,
          duration: "random(1.5, 3.5)",
          repeat: -1,
          yoyo: true,
          stagger: 0.05,
          ease: "sine.inOut"
        });

        // Pulse orbits gently
        gsap.to(".orbit-guide", {
          strokeOpacity: 0.15,
          duration: 4,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut"
        });
      });

      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(".galaxy-node", { y: 0, opacity: 1 });
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  // Galaxy detail panel slide-in on mount
  useEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      gsap.from(".galaxy-detail-panel", {
        autoAlpha: 0,
        x: 40,
        duration: 0.4,
        ease: "power2.out"
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  // Map group to color theme
  const getNodeColor = (group: string) => {
    const g = group.toLowerCase();
    if (g.includes("react") || g.includes("next") || g.includes("frontend")) return "#00ccff";
    if (g.includes("node") || g.includes("express") || g.includes("backend")) return "#ff5555";
    if (g.includes("n8n") || g.includes("docker") || g.includes("automation")) return "#bd93f9";
    return "#00ff66";
  };

  // Map group to 3D sphere radial gradient
  const getNodeGradient = (group: string) => {
    const g = group.toLowerCase();
    if (g.includes("react") || g.includes("next") || g.includes("frontend")) return "url(#sphere-blue)";
    if (g.includes("node") || g.includes("express") || g.includes("backend")) return "url(#sphere-red)";
    if (g.includes("n8n") || g.includes("docker") || g.includes("automation")) return "url(#sphere-purple)";
    return "url(#sphere-green)";
  };

  // Map group to glow filter
  const getNodeGlow = (group: string) => {
    const g = group.toLowerCase();
    if (g.includes("react") || g.includes("next") || g.includes("frontend")) return "url(#glow-blue)";
    if (g.includes("node") || g.includes("express") || g.includes("backend")) return "url(#glow-red)";
    if (g.includes("n8n") || g.includes("docker") || g.includes("automation")) return "url(#glow-purple)";
    return "url(#glow-green)";
  };

  // Resolve links between nodes
  const activeLinks = galaxy.links.map(link => {
    const sourceNode = nodes.find(n => n.id === link.source);
    const targetNode = nodes.find(n => n.id === link.target);
    if (sourceNode && targetNode) {
      let isHighlighted = false;
      let isDimmed = false;

      if (hoveredNode) {
        if (link.source === hoveredNode.id || link.target === hoveredNode.id) {
          isHighlighted = true;
        } else {
          isDimmed = true;
        }
      } else if (selectedNode) {
        if (link.source === selectedNode.id || link.target === selectedNode.id) {
          isHighlighted = true;
        }
      }

      return {
        id: `${link.source}-${link.target}`,
        x1: sourceNode.x,
        y1: sourceNode.y,
        x2: targetNode.x,
        y2: targetNode.y,
        sourceId: link.source,
        targetId: link.target,
        color: getNodeColor(sourceNode.group),
        isHighlighted,
        isDimmed
      };
    }
    return null;
  }).filter(Boolean);

  return (
    <LayoutWrapper>
      <div ref={containerRef} className="flex flex-col gap-6 py-4 select-none">

        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-[#00ff66]/10 pb-4">
          <div className="flex flex-col gap-1.5">
            <h1 className="text-2xl font-bold text-[#00ff66] flex items-center gap-2">
              <Orbit className="animate-spin-slow text-[#00ff66]" size={24} /> Project Galaxy Map
            </h1>
            <p className="text-xs text-slate-400">
              Interactive simulation of software projects. Hover over a planet to scan its connection network.
            </p>
          </div>
        </div>

        {/* Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-2 items-stretch">

          {/* Cosmic SVG Map Canvas */}
          <div className="lg:col-span-2 bg-[#05080e] border border-slate-850 rounded-xl p-4 flex items-center justify-center relative min-h-[480px] overflow-hidden shadow-inner">

            {/* Ambient Background Grid */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293710_1px,transparent_1px),linear-gradient(to_bottom,#1f293710_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>

            <svg viewBox="0 0 600 450" className="w-full h-full max-h-[500px] z-10 relative">
              <defs>
                <filter id="glow-blue" x="-30%" y="-30%" width="160%" height="160%">
                  <feGaussianBlur stdDeviation="3.5" result="blur" />
                  <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                </filter>
                <filter id="glow-red" x="-30%" y="-30%" width="160%" height="160%">
                  <feGaussianBlur stdDeviation="3.5" result="blur" />
                  <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                </filter>
                <filter id="glow-purple" x="-30%" y="-30%" width="160%" height="160%">
                  <feGaussianBlur stdDeviation="3.5" result="blur" />
                  <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                </filter>
                <filter id="glow-green" x="-30%" y="-30%" width="160%" height="160%">
                  <feGaussianBlur stdDeviation="3.5" result="blur" />
                  <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                </filter>
                <radialGradient id="sphere-blue" cx="30%" cy="30%" r="70%">
                  <stop offset="0%" stopColor="#e0f7ff" />
                  <stop offset="35%" stopColor="#00ccff" />
                  <stop offset="85%" stopColor="#003b80" />
                  <stop offset="100%" stopColor="#001a40" />
                </radialGradient>
                <radialGradient id="sphere-red" cx="30%" cy="30%" r="70%">
                  <stop offset="0%" stopColor="#ffebeb" />
                  <stop offset="35%" stopColor="#ff5555" />
                  <stop offset="85%" stopColor="#a82222" />
                  <stop offset="100%" stopColor="#4a0000" />
                </radialGradient>
                <radialGradient id="sphere-purple" cx="30%" cy="30%" r="70%">
                  <stop offset="0%" stopColor="#f5efff" />
                  <stop offset="35%" stopColor="#bd93f9" />
                  <stop offset="85%" stopColor="#753cb5" />
                  <stop offset="100%" stopColor="#311257" />
                </radialGradient>
                <radialGradient id="sphere-green" cx="30%" cy="30%" r="70%">
                  <stop offset="0%" stopColor="#ebfffa" />
                  <stop offset="35%" stopColor="#00ff66" />
                  <stop offset="85%" stopColor="#00993d" />
                  <stop offset="100%" stopColor="#003d19" />
                </radialGradient>
                <radialGradient id="sun-core" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#ffffff" />
                  <stop offset="50%" stopColor="#00ff66" />
                  <stop offset="100%" stopColor="#001103" stopOpacity="0" />
                </radialGradient>
              </defs>

              {/* Twinkling Space Star Field */}
              {STARS.map((star, i) => (
                <circle
                  key={i}
                  cx={star.cx}
                  cy={star.cy}
                  r={star.r}
                  fill={star.color}
                  opacity={star.opacity}
                  className="twinkle-star"
                />
              ))}

              {/* Orbit Guide Dotted Paths */}
              <circle cx="300" cy="225" r="75" fill="none" stroke="#00ff66" strokeWidth="0.4" strokeDasharray="3, 12" className="orbit-guide" strokeOpacity="0.06" />
              <circle cx="300" cy="225" r="135" fill="none" stroke="#00ccff" strokeWidth="0.4" strokeDasharray="3, 12" className="orbit-guide" strokeOpacity="0.06" />
              <circle cx="300" cy="225" r="195" fill="none" stroke="#bd93f9" strokeWidth="0.4" strokeDasharray="3, 12" className="orbit-guide" strokeOpacity="0.06" />

              {/* Edge Links — with data-id for draw-on-hover targeting */}
              {activeLinks.map(link => link && (
                <line
                  key={link.id}
                  data-id={link.id}
                  x1={link.x1}
                  y1={link.y1}
                  x2={link.x2}
                  y2={link.y2}
                  stroke={link.color}
                  strokeWidth={link.isHighlighted ? "1.6" : "0.6"}
                  opacity={link.isDimmed ? "0.03" : link.isHighlighted ? "0.8" : "0.15"}
                  className="galaxy-edge transition-all duration-300"
                />
              ))}

              {/* Central Sun System Core Node */}
              <circle cx="300" cy="225" r="24" fill="url(#sun-core)" opacity="0.4" />
              <circle cx="300" cy="225" r="10" fill="#00ff66" filter="url(#glow-green)" opacity="0.9" />
              <text x="300" y="243" textAnchor="middle" fill="#00ff66" className="text-[8px] font-bold font-mono tracking-widest uppercase">NEKO_CORE</text>

              {/* Repository Planets */}
              {nodes.map((node, idx) => {
                const isSelected = selectedNode?.id === node.id;
                const isHovered = hoveredNode?.id === node.id;

                let nodeOpacity = "0.75";
                if (isSelected || isHovered) {
                  nodeOpacity = "1.0";
                } else if (hoveredNode) {
                  const isConnected = activeLinks.some(l =>
                    l && (l.sourceId === node.id && l.targetId === hoveredNode.id ||
                      l.targetId === node.id && l.sourceId === hoveredNode.id)
                  );
                  nodeOpacity = isConnected ? "0.9" : "0.15";
                }

                const isLabelBelow = idx % 2 === 0;
                const labelOffsetY = isLabelBelow ? node.size + 11 : -node.size - 4;
                const labelColor = isSelected ? "#00ff66" : isHovered ? "#ffffff" : "#cbd5e1";

                return (
                  <g
                    key={node.id}
                    className="galaxy-node cursor-pointer group"
                    onClick={() => setSelectedNode(node)}
                    onMouseEnter={(e) => {
                      setHoveredNode(node);
                      // Animate connected edges in
                      const svgEl = (e.currentTarget as SVGGElement).closest("svg");
                      if (svgEl) {
                        activeLinks.forEach(link => {
                          if (!link) return;
                          if (link.sourceId === node.id || link.targetId === node.id) {
                            const lineEl = svgEl.querySelector<SVGLineElement>(`line[data-id="${link.id}"]`);
                            if (lineEl) animateEdgeIn(lineEl);
                          }
                        });
                      }
                    }}
                    onMouseLeave={(e) => {
                      setHoveredNode(null);
                      // Animate connected edges out
                      const svgEl = (e.currentTarget as SVGGElement).closest("svg");
                      if (svgEl) {
                        activeLinks.forEach(link => {
                          if (!link) return;
                          if (link.sourceId === node.id || link.targetId === node.id) {
                            const lineEl = svgEl.querySelector<SVGLineElement>(`line[data-id="${link.id}"]`);
                            if (lineEl) animateEdgeOut(lineEl);
                          }
                        });
                      }
                    }}
                  >
                    {(isSelected || isHovered) && (
                      <circle
                        cx={node.x}
                        cy={node.y}
                        r={node.size + 4.5}
                        fill="none"
                        stroke={getNodeColor(node.group)}
                        strokeWidth="0.8"
                        strokeDasharray="4, 3"
                        className="animate-spin-slow"
                      />
                    )}
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r={node.size + 1.5}
                      fill={getNodeGradient(node.group)}
                      filter={(isSelected || isHovered) ? getNodeGlow(node.group) : undefined}
                      opacity={nodeOpacity}
                      className="transition-all duration-300 transform group-hover:scale-110 origin-center"
                    />
                    <text
                      x={node.x}
                      y={node.y + labelOffsetY}
                      textAnchor="middle"
                      fill={labelColor}
                      fontWeight={(isSelected || isHovered) ? "bold" : "normal"}
                      opacity={nodeOpacity}
                      className="text-[7.5px] font-mono select-none pointer-events-none transition-all duration-300"
                    >
                      {node.id}
                    </text>
                  </g>
                );
              })}
            </svg>

            {/* Bottom Floating Map Key / Legend */}
            <div className="absolute bottom-3 left-4 flex gap-4 text-[9px] font-mono text-slate-500 bg-slate-950/80 border border-slate-900 px-3 py-1.5 rounded-md backdrop-blur-sm">
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#00ccff]"></span>Frontend</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#ff5555]"></span>Backend</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#bd93f9]"></span>Automation</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#00ff66]"></span>Core/Others</span>
            </div>
          </div>

          {/* Planet Specification Scanner Panel */}
          <div className="galaxy-detail-panel bg-[#090d16]/75 border border-slate-850 rounded-xl p-5 flex flex-col justify-between shadow-2xl relative overflow-hidden backdrop-blur-md">

            {/* Top Scanning Line Animation decoration */}
            <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-[#00ccff]/30 animate-pulse"></div>

            {selectedNode ? (
              <div className="flex flex-col gap-4">
                {/* Header Information */}
                <div className="flex flex-col gap-1 border-b border-slate-800 pb-3.5">
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] font-mono font-bold tracking-widest text-[#00ccff] flex items-center gap-1">
                      <Sparkles size={10} className="animate-pulse" /> PLANET SPECIFICATION
                    </span>
                    <span className="text-[8px] font-mono text-slate-500 uppercase">SECTOR: {selectedNode.group.substring(0, 10)}</span>
                  </div>
                  <h2 className="text-lg font-bold text-slate-100 glow-blue font-mono tracking-tight mt-1">{selectedNode.id}</h2>
                  <span
                    className="text-[9px] px-2 py-0.5 mt-1 rounded border border-slate-800 bg-slate-950/80 w-fit font-bold font-mono uppercase tracking-wider"
                    style={{ color: getNodeColor(selectedNode.group), borderColor: `${getNodeColor(selectedNode.group)}15` }}
                  >
                    Ecosystem: {selectedNode.group}
                  </span>
                </div>

                {/* Description Box */}
                <div className="flex flex-col gap-1.5 text-xs bg-slate-950/40 border border-slate-900/60 p-3 rounded-lg">
                  <span className="text-[9px] font-mono uppercase font-bold text-slate-500">Planet description:</span>
                  <p className="text-slate-300 leading-relaxed font-mono italic text-[11px]">
                    &ldquo;{selectedNode.description_vi || selectedNode.description || "Planet under investigation. No description data available."}&rdquo;
                  </p>
                </div>

                {/* Tech elements */}
                {selectedNode.tech && selectedNode.tech.length > 0 && (
                  <div className="flex flex-col gap-1.5 text-xs">
                    <span className="text-[9px] font-mono uppercase font-bold text-slate-500">Tech Stack:</span>
                    <div className="flex flex-wrap gap-1.5 mt-0.5">
                      {selectedNode.tech.map(t => (
                        <span
                          key={t}
                          className="bg-slate-950 text-slate-300 border border-slate-850 px-2 py-0.5 rounded text-[9px] font-mono hover:border-slate-700 transition-colors"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Repository Stats */}
                <div className="flex items-center gap-5 text-xs mt-2 border-t border-slate-800/60 pt-4 font-mono">
                  <div className="flex items-center gap-1.5 text-[#ffb86c]">
                    <Star size={12} className="fill-[#ffb86c]/10" />
                    <span>Stars: <strong className="text-slate-200">{selectedNode.stars || 0}</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[#00ccff]">
                    <GitFork size={12} />
                    <span>Forks: <strong className="text-slate-200">{selectedNode.forks || 0}</strong></span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-xs text-slate-500 py-16 font-mono">
                🚀 SCANNING GALAXY...<br />Select a planet on the map to display detailed specifications.
              </div>
            )}

            {/* GitHub Redirect Link Button */}
            {selectedNode?.githubUrl && (
              <a
                href={selectedNode.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 flex items-center justify-center gap-2 w-full py-2.5 bg-[#00ff66]/10 hover:bg-[#00ff66] text-[#00ff66] hover:text-slate-950 border border-[#00ff66]/30 hover:border-[#00ff66] rounded-lg text-xs font-mono font-bold transition-all duration-300 shadow-[0_0_15px_rgba(0,255,102,0.05)] hover:shadow-[0_0_15px_rgba(0,255,102,0.25)]"
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
