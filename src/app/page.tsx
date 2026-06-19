"use client";

import React, { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import LayoutWrapper from "@/components/LayoutWrapper";
import IdentityCard from "@/components/IdentityCard";
import Terminal from "@/components/Terminal";
import technologyMapData from "@/data/generated/technology-map.json";
import knowledgeClustersData from "@/data/generated/knowledge-clusters.json";
import repositoryNetworkData from "@/data/generated/repository-network.json";
import { gsap, ScrollTrigger } from "@/lib/gsap-config";
import { counterUp, staggerCards } from "@/lib/animations";
import { GitBranch, TrendingUp, Skull, Zap, Terminal as TerminalIcon, Layers, Activity } from "lucide-react";

// Disable SSR for BootSequence — it uses Date.now() and random delays
// that cause hydration mismatches when server-rendered
const BootSequence = dynamic(() => import("@/components/BootSequence"), { ssr: false });

export default function Home() {
  const [isBooted, setIsBooted] = useState(false);
  const [activeTab, setActiveTab] = useState<"nexus" | "terminal">("nexus");
  const dashboardRef = useRef<HTMLDivElement>(null);
  const repoCountRef = useRef<HTMLSpanElement>(null);
  const linkCountRef = useRef<HTMLSpanElement>(null);
  const clusterCountRef = useRef<HTMLSpanElement>(null);

  // Extract data at the top so it's available in useEffect
  const { insights } = technologyMapData.data;
  const { clusters } = knowledgeClustersData.data;
  const repoNetwork = repositoryNetworkData.data;

  useEffect(() => {
    const sessionBooted = sessionStorage.getItem("neko_booted");
    if (sessionBooted === "true") {
      setTimeout(() => {
        setIsBooted(true);
      }, 0);
    }
  }, []);

  useEffect(() => {
    if (isBooted && activeTab === "nexus" && dashboardRef.current) {
      const ctx = gsap.context(() => {
        if (repoCountRef.current) {
          counterUp(repoCountRef.current, repoNetwork.nodes.length, "");
        }
        if (linkCountRef.current) {
          counterUp(linkCountRef.current, repoNetwork.links.length, "");
        }
        if (clusterCountRef.current) {
          counterUp(clusterCountRef.current, clusters.length, "");
        }
        staggerCards(".nexus-card", dashboardRef.current!);
        ScrollTrigger.batch(".knowledge-cluster-card", {
          onEnter: (els) => gsap.to(els, { autoAlpha: 1, y: 0, stagger: 0.07, duration: 0.5 }),
          start: "top 88%",
          once: true,
        });
        gsap.from(".terminal-callout", {
          y: 40,
          autoAlpha: 0,
          duration: 0.6,
          ease: "power2.out",
          scrollTrigger: { trigger: ".terminal-callout", start: "top 85%", once: true },
        });
      }, dashboardRef);
      return () => ctx.revert();
    }
  }, [isBooted, activeTab, clusters.length, repoNetwork.nodes.length, repoNetwork.links.length]);

  const handleBootComplete = () => {
    sessionStorage.setItem("neko_booted", "true");
    setIsBooted(true);
  };

  if (!isBooted) {
    return <BootSequence onComplete={handleBootComplete} />;
  }

  return (
    <LayoutWrapper>
      {/* SEO identity block — ẩn hoàn toàn với người dùng, Google/AI crawlers vẫn đọc được */}
      <div style={{ position: "absolute", width: 1, height: 1, padding: 0, margin: -1, overflow: "hidden", clip: "rect(0,0,0,0)", whiteSpace: "nowrap", border: 0 }}>
        <h1>Nguyễn Văn Hiếu — Portfolio & CV</h1>

        {/* Speakable target: tagline — AI sẽ trích dẫn câu này */}
        <p id="seo-bio-tagline">
          <strong>
            &ldquo;Code như thở, build như sống.&rdquo; — Nguyễn Văn Hiếu (nicodolas)
          </strong>
        </p>

        {/* Speakable target: giới thiệu chính */}
        <p id="seo-bio-intro">
          Nguyễn Văn Hiếu, còn được biết đến là <strong>nicodolas</strong> và{" "}
          <strong>nekovibecoder</strong>, là một lập trình viên tâm huyết đến từ Việt Nam.
          Cựu sinh viên Khoá 13 ngành Công nghệ Thông tin tại{" "}
          <strong>Trường Đại học Công Thương TP.HCM (HUIT)</strong>, tiền thân là Trường Đại học
          Công nghiệp Thực phẩm TP.HCM (HUFI). Anh ấy tin rằng mỗi dòng code là một lần đặt cược
          vào tương lai — viết không chỉ để chạy được, mà để sống được.
        </p>

        <p>
          Chuyên môn: Full-Stack Developer với Next.js, Node.js, PostgreSQL, GSAP animation và AI
          automation. Đặc biệt đam mê xây dựng agentic workflows và các hệ thống tự động hoá thông
          minh.
        </p>

        <p>
          GitHub:{" "}
          <a href="https://github.com/nicodolas" rel="me" tabIndex={-1}>
            github.com/nicodolas
          </a>{" "}
          · LinkedIn:{" "}
          <a href="https://www.linkedin.com/in/nguyenvanhieu-nicodolas" rel="me" tabIndex={-1}>
            linkedin.com/in/nguyenvanhieu-nicodolas
          </a>
        </p>
      </div>

      <div className="flex flex-col flex-grow gap-6">
        {/* Identity card — who is this */}
        <IdentityCard />

        {/* Navigation & Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-[#090d16]/80 border border-[#00ff66]/10 px-4 py-3 rounded-lg text-xs select-none">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#00ff66] animate-ping"></span>
            <span className="text-slate-300 font-bold tracking-wider uppercase">Neko Nexus Console</span>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab("nexus")}
              className={`px-3 py-1.5 rounded font-bold border transition-all ${activeTab === "nexus"
                ? "bg-[#00ff66]/10 border-[#00ff66] text-[#00ff66] glow-green"
                : "border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                }`}
            >
              [ Nexus Overview ]
            </button>
            <button
              onClick={() => setActiveTab("terminal")}
              className={`px-3 py-1.5 rounded font-bold border transition-all flex items-center gap-1.5 ${activeTab === "terminal"
                ? "bg-[#00ccff]/10 border-[#00ccff] text-[#00ccff]"
                : "border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                }`}
            >
              <TerminalIcon size={12} />
              <span>[ OS Terminal ]</span>
            </button>
          </div>
        </div>

        {/* Tab Contents */}
        {activeTab === "nexus" ? (
          <div ref={dashboardRef} className="flex flex-col gap-6 select-none">
            {/* Quick Stats Panel */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="nexus-card bg-[#090d16]/40 border border-slate-850 p-4 rounded flex flex-col gap-1">
                <span className="text-[10px] text-slate-500 uppercase tracking-widest font-mono">Total Repositories</span>
                <span ref={repoCountRef} className="text-xl font-bold font-mono text-[#00ff66]">{repoNetwork.nodes.length}</span>
              </div>
              <div className="nexus-card bg-[#090d16]/40 border border-slate-850 p-4 rounded flex flex-col gap-1">
                <span className="text-[10px] text-slate-500 uppercase tracking-widest font-mono">Ecosystem Links</span>
                <span ref={linkCountRef} className="text-xl font-bold font-mono text-[#00ccff]">{repoNetwork.links.length}</span>
              </div>
              <div className="nexus-card bg-[#090d16]/40 border border-slate-850 p-4 rounded flex flex-col gap-1">
                <span className="text-[10px] text-slate-500 uppercase tracking-widest font-mono">Knowledge Clusters</span>
                <span ref={clusterCountRef} className="text-xl font-bold font-mono text-[#bd93f9]">{clusters.length}</span>
              </div>
              <div className="nexus-card bg-[#090d16]/40 border border-slate-850 p-4 rounded flex flex-col gap-1">
                <span className="text-[10px] text-slate-500 uppercase tracking-widest font-mono">Sync Status</span>
                <span className="text-xl font-bold font-mono text-[#ffb86c] flex items-center gap-1.5">
                  <Activity size={16} className="animate-pulse" /> LIVE
                </span>
              </div>
            </div>

            {/* Core Nexus Questions Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Connected */}
              <div className="nexus-card bg-[#090d16]/60 border border-slate-800 rounded-lg p-5 flex flex-col gap-3 hover:border-[#00ff66]/30 transition-all">
                <div className="flex items-center gap-2 border-b border-slate-850 pb-2.5">
                  <GitBranch size={16} className="text-[#00ff66]" />
                  <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">What is Connected?</h3>
                </div>
                <div className="flex flex-col gap-2">
                  <p className="text-xs text-slate-300 leading-relaxed font-mono">
                    {insights.connected_vi}
                  </p>
                  <p className="text-[10px] text-slate-500 leading-relaxed font-mono italic">
                    {insights.connected_en}
                  </p>
                </div>
              </div>

              {/* Emerging */}
              <div className="nexus-card bg-[#090d16]/60 border border-slate-800 rounded-lg p-5 flex flex-col gap-3 hover:border-[#00ccff]/30 transition-all">
                <div className="flex items-center gap-2 border-b border-slate-850 pb-2.5">
                  <TrendingUp size={16} className="text-[#00ccff]" />
                  <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">What is Emerging?</h3>
                </div>
                <div className="flex flex-col gap-2">
                  <p className="text-xs text-slate-300 leading-relaxed font-mono">
                    {insights.emerging_vi}
                  </p>
                  <p className="text-[10px] text-slate-500 leading-relaxed font-mono italic">
                    {insights.emerging_en}
                  </p>
                </div>
              </div>

              {/* Fading */}
              <div className="nexus-card bg-[#090d16]/60 border border-slate-800 rounded-lg p-5 flex flex-col gap-3 hover:border-[#ff5555]/30 transition-all">
                <div className="flex items-center gap-2 border-b border-slate-850 pb-2.5">
                  <Skull size={16} className="text-[#ff5555]" />
                  <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">What is Fading?</h3>
                </div>
                <div className="flex flex-col gap-2">
                  <p className="text-xs text-slate-300 leading-relaxed font-mono">
                    {insights.fading_vi}
                  </p>
                  <p className="text-[10px] text-slate-500 leading-relaxed font-mono italic">
                    {insights.fading_en}
                  </p>
                </div>
              </div>

              {/* Important */}
              <div className="nexus-card bg-[#090d16]/60 border border-slate-800 rounded-lg p-5 flex flex-col gap-3 hover:border-[#ffb86c]/30 transition-all">
                <div className="flex items-center gap-2 border-b border-slate-850 pb-2.5">
                  <Zap size={16} className="text-[#ffb86c]" />
                  <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">What is Becoming Important?</h3>
                </div>
                <div className="flex flex-col gap-2">
                  <p className="text-xs text-slate-300 leading-relaxed font-mono">
                    {insights.important_vi}
                  </p>
                  <p className="text-[10px] text-slate-500 leading-relaxed font-mono italic">
                    {insights.important_en}
                  </p>
                </div>
              </div>
            </div>

            {/* Knowledge Clusters Panel */}
            <div className="bg-[#090d16]/40 border border-slate-800 rounded-lg p-5 flex flex-col gap-4">
              <div className="flex items-center gap-2 border-b border-slate-850 pb-3">
                <Layers size={18} className="text-[#00ff66]" />
                <h2 className="text-sm font-bold text-slate-200 uppercase tracking-widest">Knowledge Clusters</h2>
              </div>
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {clusters.map((cluster) => (
                  <div
                    key={cluster.id}
                    className="knowledge-cluster-card bg-[#060a12] border border-slate-900 rounded p-4 flex flex-col gap-2.5"
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-[#00ccff] uppercase font-mono">{cluster.label_vi}</span>
                      <span className="text-[9px] bg-slate-850 text-slate-400 px-2 py-0.5 rounded font-mono border border-slate-800">
                        {cluster.repositories.length} Projects
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 font-mono leading-relaxed">
                      {cluster.description_vi}
                    </p>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {cluster.technologies.slice(0, 8).map(tech => (
                        <span
                          key={tech}
                          className="text-[9px] bg-[#00ff66]/5 text-[#00ff66]/70 border border-[#00ff66]/10 px-2 py-0.2 rounded font-mono"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Launch Terminal Callout */}
            <div className="terminal-callout nexus-card bg-gradient-to-r from-[#090d16]/80 to-[#0c1624]/60 border border-[#00ccff]/25 rounded-lg p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h3 className="text-sm font-bold text-[#00ccff] font-mono">OS Terminal CLI</h3>
                <p className="text-xs text-slate-400 font-mono mt-1">
                  Explore the full platform through a retro hacker-style command-line emulator.
                </p>
              </div>
              <button
                onClick={() => setActiveTab("terminal")}
                className="w-full md:w-auto px-6 py-2.5 rounded font-bold text-xs bg-[#00ccff] text-black hover:bg-[#00ff66] transition-colors font-mono uppercase shadow-[0_0_15px_rgba(0,204,255,0.4)]"
              >
                &gt;&gt; Launch Terminal Console
              </button>
            </div>
          </div>
        ) : (
          <Terminal />
        )}
      </div>
    </LayoutWrapper>
  );
}
