"use client";

import { Mail, GraduationCap, MapPin, Star, Zap, Code2, Trophy } from "lucide-react";
import achievementsData from "@/data/generated/achievements.json";
import repositoryNetworkData from "@/data/generated/repository-network.json";
import profileData from "@/data/profile-backup.json";

const achievements = achievementsData.data;
const repoNetwork = repositoryNetworkData.data;
const profile = profileData;

// Total stars across all repos
const totalStars = repoNetwork.nodes.reduce(
    (sum: number, n: { stars?: number }) => sum + (n.stars || 0),
    0
);

// 3 most recent achievements as badges
const featuredAchievements = achievements.achievements.slice(0, 3);

const GitHubIcon = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
    </svg>
);

const LinkedInIcon = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
);

export default function IdentityCard() {
    return (
        <div className="relative bg-[#090d16] border border-[#00ff66]/20 rounded-xl overflow-hidden select-none">

            {/* Top accent bar */}
            <div className="h-[3px] w-full bg-gradient-to-r from-transparent via-[#ffb86c] to-transparent opacity-80" />

            {/* Background glow */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_0%,rgba(0,255,102,0.04)_0%,transparent_60%)] pointer-events-none" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_100%,rgba(0,204,255,0.04)_0%,transparent_60%)] pointer-events-none" />

            <div className="relative p-5 flex flex-col md:flex-row gap-5 items-start md:items-center">

                {/* Left: Avatar + rank badge */}
                <div className="flex-shrink-0 relative">
                    <div className="w-16 h-16 rounded-xl border-2 border-[#ffb86c]/50 bg-gradient-to-br from-[#00ff66]/10 to-[#00ccff]/10 flex items-center justify-center text-3xl shadow-[0_0_20px_rgba(255,184,108,0.15)]">
                        🐱
                    </div>
                    <div className="absolute -bottom-2 -right-2 bg-[#ffb86c] text-[#05070a] text-[8px] font-black px-1.5 py-0.5 rounded font-mono tracking-wider shadow-lg">
                        LV.★
                    </div>
                </div>

                {/* Center: Name + bio + meta */}
                <div className="flex flex-col gap-2 flex-1 min-w-0">

                    {/* Name row — from profile data */}
                    <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
                        <span className="text-base font-bold text-slate-100 tracking-wide">
                            {profile.name_vi}
                        </span>
                        <span className="text-[10px] text-[#00ff66]/70 font-mono border border-[#00ff66]/20 px-1.5 py-0.5 rounded bg-[#00ff66]/5">
                            nicodolas
                        </span>
                        <span className="text-[10px] text-[#ffb86c]/70 font-mono border border-[#ffb86c]/20 px-1.5 py-0.5 rounded bg-[#ffb86c]/5">
                            nekovibecoder
                        </span>
                    </div>

                    {/* Role */}
                    <p className="text-[11px] text-slate-400 font-mono leading-relaxed">
                        {profile.role} · Next.js · Node.js · AI Automation · GSAP · Three.js
                    </p>

                    {/* Meta row — from profile data */}
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-slate-500 font-mono">
                        <span className="flex items-center gap-1">
                            <MapPin size={10} className="text-[#ffb86c]" />
                            Vietnam
                        </span>
                        <span className="flex items-center gap-1">
                            <GraduationCap size={10} className="text-[#bd93f9]" />
                            {profile.education.school_en} — GPA {profile.education.gpa}
                        </span>
                        <span className="flex items-center gap-1">
                            <Code2 size={10} className="text-[#00ff66]" />
                            {repoNetwork.nodes.length} Repos
                        </span>
                        <span className="flex items-center gap-1">
                            <Star size={10} className="text-[#ffb86c]" />
                            {totalStars} Stars
                        </span>
                    </div>

                    {/* Achievement badges */}
                    {featuredAchievements.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-0.5">
                            {featuredAchievements.map((a) => (
                                <span
                                    key={a.id}
                                    title={a.title_vi || a.title}
                                    className="flex items-center gap-1 text-[9px] font-mono font-bold px-2 py-0.5 rounded border border-[#ffb86c]/25 bg-[#ffb86c]/5 text-[#ffb86c]/80"
                                >
                                    <Trophy size={8} />
                                    {a.icon} {a.title}
                                </span>
                            ))}
                            <span className="flex items-center gap-1 text-[9px] font-mono px-2 py-0.5 rounded border border-slate-800 text-slate-500">
                                +{achievements.achievements.length - 3} more
                            </span>
                        </div>
                    )}
                </div>

                {/* Right: Stats + contact */}
                <div className="flex flex-col gap-3 flex-shrink-0 items-end">

                    {/* Stat pills */}
                    <div className="flex gap-2">
                        <div className="flex flex-col items-center px-3 py-1.5 rounded-lg border border-[#00ff66]/20 bg-[#00ff66]/5 min-w-[52px]">
                            <Zap size={10} className="text-[#00ff66] mb-0.5" />
                            <span className="text-[10px] font-black text-[#00ff66] font-mono">{repoNetwork.links.length}</span>
                            <span className="text-[8px] text-slate-500 font-mono">links</span>
                        </div>
                        <div className="flex flex-col items-center px-3 py-1.5 rounded-lg border border-[#00ccff]/20 bg-[#00ccff]/5 min-w-[52px]">
                            <Trophy size={10} className="text-[#00ccff] mb-0.5" />
                            <span className="text-[10px] font-black text-[#00ccff] font-mono">{achievements.achievements.length}</span>
                            <span className="text-[8px] text-slate-500 font-mono">awards</span>
                        </div>
                    </div>

                    {/* Contact links — from profile data */}
                    <div className="flex items-center gap-1.5">
                        <a
                            href={profile.github}
                            target="_blank"
                            rel="noopener noreferrer me"
                            title="GitHub"
                            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-700 text-slate-400 hover:border-[#00ff66]/60 hover:text-[#00ff66] hover:bg-[#00ff66]/5 transition-all text-[10px] font-mono"
                        >
                            <GitHubIcon />
                            <span className="hidden sm:inline">GitHub</span>
                        </a>
                        <a
                            href={`mailto:${profile.email}`}
                            title="Email"
                            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-700 text-slate-400 hover:border-[#ffb86c]/60 hover:text-[#ffb86c] hover:bg-[#ffb86c]/5 transition-all text-[10px] font-mono"
                        >
                            <Mail size={12} />
                            <span className="hidden sm:inline">Email</span>
                        </a>
                        <a
                            href="https://www.linkedin.com/in/nguyenvanhieu-nicodolas"
                            target="_blank"
                            rel="noopener noreferrer me"
                            title="LinkedIn"
                            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-700 text-slate-400 hover:border-[#00ccff]/60 hover:text-[#00ccff] hover:bg-[#00ccff]/5 transition-all text-[10px] font-mono"
                        >
                            <LinkedInIcon />
                            <span className="hidden sm:inline">LinkedIn</span>
                        </a>
                    </div>
                </div>
            </div>

            {/* Bottom marquee ticker */}
            <div className="border-t border-[#00ff66]/10 px-5 py-2 flex items-center gap-3 overflow-hidden">
                <span className="text-[#ffb86c] text-[9px] font-black font-mono tracking-widest flex-shrink-0">
                    ★ HALL OF FAME
                </span>
                <div className="flex-1 overflow-hidden">
                    <div className="flex gap-6 text-[9px] font-mono text-slate-600 whitespace-nowrap animate-[marquee_18s_linear_infinite]">
                        {[
                            "Code như thở · Build như sống",
                            `Full-Stack · AI Automation · 3D Web`,
                            `${repoNetwork.nodes.length} Repositories · ${totalStars} Stars · ${achievements.achievements.length} Achievements`,
                            `${profile.education.school_en} · GPA ${profile.education.gpa}`,
                            "Next.js · Node.js · GSAP · Three.js · PostgreSQL",
                            "Neko OS v4 · nicodolas",
                        ].map((t, i) => (
                            <span key={i} className="flex items-center gap-1">
                                <span className="text-[#00ff66]/40">◆</span> {t}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
