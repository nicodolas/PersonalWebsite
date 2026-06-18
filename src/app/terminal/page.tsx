"use client";

import React from "react";
import LayoutWrapper from "@/components/LayoutWrapper";
import Terminal from "@/components/Terminal";

export default function TerminalPage() {
  return (
    <LayoutWrapper>
      <div className="flex flex-col flex-grow gap-6">
        {/* Breadcrumbs / Status Header */}
        <div className="flex justify-between items-center bg-[#090d16]/80 border border-[#00ff66]/10 px-4 py-3 rounded-lg text-xs select-none">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#00ccff] animate-pulse"></span>
            <span className="text-slate-300 font-bold tracking-wider uppercase">Neko.OS CLI Console</span>
          </div>
          <span className="text-slate-500 font-mono">DIRECT ROUTE [ /terminal ]</span>
        </div>

        {/* Terminal Component */}
        <Terminal />
      </div>
    </LayoutWrapper>
  );
}
