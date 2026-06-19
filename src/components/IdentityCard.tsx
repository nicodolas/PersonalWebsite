"use client";

import { Mail, GraduationCap, MapPin } from "lucide-react";

const GitHubIcon = () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
    </svg>
);

const LinkedInIcon = () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
);

export default function IdentityCard() {
    return (
        <div className="bg-[#090d16]/80 border border-[#00ff66]/20 rounded-lg p-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center select-none">
            {/* Avatar */}
            <div className="flex-shrink-0 w-12 h-12 rounded-full border-2 border-[#00ff66]/40 bg-[#00ff66]/5 flex items-center justify-center text-xl">
                🐱
            </div>

            {/* Info */}
            <div className="flex flex-col gap-1 flex-1 min-w-0">
                <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                    <span className="text-sm font-bold text-slate-100 tracking-wide">Nguyễn Văn Hiếu</span>
                    <span className="text-[10px] text-slate-500 font-mono">/ nicodolas</span>
                    <span className="text-[9px] text-[#00ff66]/60 font-mono italic hidden sm:inline">
                        Human
                    </span>
                </div>
                <div className="flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-slate-400 font-mono">
                    <span className="flex items-center gap-1">
                        <MapPin size={10} className="text-[#ffb86c]" />
                        Vietnam
                    </span>
                    <span className="flex items-center gap-1">
                        <GraduationCap size={10} className="text-[#bd93f9]" />
                        HUIT K13 — IT — Bachelor
                    </span>
                </div>
            </div>

            {/* Contact links */}
            <div className="flex items-center gap-2 flex-shrink-0">
                <a
                    href="https://github.com/nicodolas"
                    target="_blank"
                    rel="noopener noreferrer me"
                    title="GitHub"
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded border border-slate-700 text-slate-400 hover:border-[#00ff66]/50 hover:text-[#00ff66] transition-all text-[10px] font-mono"
                >
                    <GitHubIcon />
                    <span className="hidden sm:inline">GitHub</span>
                </a>
                <a
                    href="mailto:nvanhieuk13@gmail.com"
                    title="Email"
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded border border-slate-700 text-slate-400 hover:border-[#00ccff]/50 hover:text-[#00ccff] transition-all text-[10px] font-mono"
                >
                    <Mail size={12} />
                    <span className="hidden sm:inline">Email</span>
                </a>
                <a
                    href="https://www.linkedin.com/in/nguyenvanhieu-nicodolas"
                    target="_blank"
                    rel="noopener noreferrer me"
                    title="LinkedIn"
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded border border-slate-700 text-slate-400 hover:border-[#00ccff]/50 hover:text-[#00ccff] transition-all text-[10px] font-mono"
                >
                    <LinkedInIcon />
                    <span className="hidden sm:inline">LinkedIn</span>
                </a>
            </div>
        </div>
    );
}
