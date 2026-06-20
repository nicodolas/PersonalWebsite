"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import timelineData from "@/data/generated/timeline.json";
import dnaData from "@/data/dna.json";
import galaxyData from "@/data/generated/galaxy.json";
import achievementsData from "@/data/generated/achievements.json";
import changelogData from "@/data/generated/changelog.json";
import technologyMapData from "@/data/generated/technology-map.json";
import { useAudioManager } from "@/lib/useAudioManager";

const timeline = timelineData.data;
const galaxy = galaxyData.data;
const achievements = achievementsData.data;
const changelog = changelogData.data;
const technologyMap = technologyMapData.data;

interface LogLine {
  text: string;
  type: "input" | "output" | "error" | "system" | "heading";
}

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
  isBackup?: boolean;
}

// Client-side synthesizer helper using Web Audio API
let zzfxCtx: AudioContext | null = null;

// zzFX — Zuper Zmall Zound Zynth (inline, no package)
// https://github.com/KilledByAPixel/ZzFX
const zzfxPlay = (...z: number[]) => {
  try {
    const savedSound = localStorage.getItem("neko_sound_enabled");
    if (savedSound === "false") return;
    const AC = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return;
    if (!zzfxCtx) zzfxCtx = new AC();
    if (zzfxCtx.state === "suspended") zzfxCtx.resume();
    const [
      volume = 1, randomness = .05, frequency = 220, attack = 0, sustain = 0,
      release = .1, shape = 0, shapeCurve = 1, slide = 0, deltaSlide = 0,
      pitchJump = 0, pitchJumpTime = 0, repeatTime = 0, noise = 0,
      modulation = 0, bitCrush = 0, delay = 0, sustainVolume = 1, decay = 0, tremolo = 0
    ] = z;
    const sr = zzfxCtx.sampleRate;
    let freq2 = frequency * (1 + randomness * 2 * Math.random() - randomness);
    let sl = slide * (500 * Math.PI * Math.PI * 2 / sr / sr);
    const startSl = sl;
    let d = 0, e = 1;
    const len = sr * (attack + sustain + release + decay) | 0;
    const bm = sr * repeatTime | 0;
    const pjx = sr * pitchJumpTime | 0;
    const dm = sr * delay | 0;
    const buf = zzfxCtx.createBuffer(1, len + dm, sr);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len + dm; i++) {
      if (bm && !(i % bm)) { freq2 = frequency; sl = startSl; }
      if (pjx && i === pjx) freq2 += pitchJump;
      sl += deltaSlide; freq2 += sl;
      d = Math.sin(d + freq2 * 2 * Math.PI / sr);
      const s = i < len ? (
        i < sr * attack ? i / sr / attack :
          i < sr * (attack + sustain) ? 1 :
            i < sr * (attack + sustain + release) ? 1 - (i - sr * (attack + sustain)) / sr / release :
              (i - (sr * (attack + sustain + release + decay))) > 0 ? 0 :
                -(i - sr * (attack + sustain + release + decay)) / sr / decay * sustainVolume
      ) : 0;
      const sample = volume * s * (
        shape === 0 ? d :
          shape === 1 ? (d < 0 ? -1 : 1) :
            shape === 2 ? Math.abs(d) * 2 - 1 :
              shape === 3 ? d ** 3 :
                shape === 4 ? Math.min(Math.max(d * 9, -1), 1) :
                  Math.sin(d * Math.PI)
      );
      data[i] = noise ? sample * (1 - noise) + (Math.random() * 2 - 1) * noise : sample;
      if (dm && i >= len) data[i] += (data[i - dm] || 0) * delay * Math.sin(i * modulation * 2 * Math.PI / sr);
      if (bitCrush > 0) { const bc = 2 ** (bitCrush * 16 | 0); data[i] = Math.round(data[i] * bc) / bc; }
      if (tremolo) data[i] *= 1 + tremolo * Math.sin(e += freq2 * shapeCurve * 2 * Math.PI / sr);
    }
    const src = zzfxCtx.createBufferSource();
    src.buffer = buf;
    src.connect(zzfxCtx.destination);
    src.start();
  } catch { /* autoplay blocked */ }
};

// Preset sounds
const soundType = () => zzfxPlay(.2, .02, 1100 + Math.random() * 300, 0, 0, .04, 0, 1, 0, 0, 0, 0, 0, 0, 0, .08);
const soundEnter = () => zzfxPlay(.35, .01, 660, 0, .01, .12, 1, 1.5, -2);
const soundError = () => zzfxPlay(.3, .02, 180, 0, .01, .15, 4, .5, -6, 0, 0, 0, 0, .2);
const soundTab = () => zzfxPlay(.15, .01, 1800, 0, 0, .06, 0, 1);
const soundStartup = () => {
  zzfxPlay(.3, 0, 523, 0, .01, .12, 5, 1);
  setTimeout(() => zzfxPlay(.3, 0, 659, 0, .01, .12, 5, 1), 100);
  setTimeout(() => zzfxPlay(.4, 0, 784, 0, .01, .2, 5, 1), 200);
};
const soundLevelUp = () => {
  zzfxPlay(.4, 0, 523, 0, .01, .1, 5, 1);
  setTimeout(() => zzfxPlay(.4, 0, 659, 0, .01, .1, 5, 1), 80);
  setTimeout(() => zzfxPlay(.5, 0, 784, 0, .01, .25, 5, 1), 160);
};
const soundTheme = () => {
  zzfxPlay(.25, 0, 440, 0, .01, .08, 0, 1);
  setTimeout(() => zzfxPlay(.25, 0, 554, 0, .01, .1, 0, 1), 80);
};
const soundOn = () => {
  zzfxPlay(.3, 0, 880, 0, .01, .1, 5, 1);
  setTimeout(() => zzfxPlay(.3, 0, 1200, 0, .01, .15, 5, 1), 100);
};

export default function Terminal() {
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<LogLine[]>([
    { text: "Welcome to Neko.OS Terminal v4.1.0", type: "system" },
    { text: "Type 'help' to see available commands or click navigation tabs above.", type: "system" },
    { text: "Synthesizer sounds active. Type 'sound off' to mute.", type: "system" },
    { text: "", type: "output" },
  ]);
  const [cmdHistory, setCmdHistory] = useState<string[]>([]);
  const [historyIdx, setHistoryIdx] = useState(-1);

  // New States
  const [theme, setTheme] = useState<"default" | "matrix" | "amber" | "cyber" | "dracula">("default");
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [xp, setXp] = useState(0);
  // Typewriter: lines queued to be printed one-by-one
  const [isPrinting, setIsPrinting] = useState(false);
  const printQueueRef = useRef<LogLine[]>([]);
  const printTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Autocomplete
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [suggestionIdx, setSuggestionIdx] = useState(-1);

  const terminalEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { toggleMute, getMuted, setVolume, getVolume } = useAudioManager();

  // Focus input on click anywhere inside terminal
  const focusInput = () => {
    if (inputRef.current) inputRef.current.focus();
  };

  // ── Typewriter engine ─────────────────────────────────────────────────
  // Nhận 1 batch lines, in từng line với delay để tạo cảm giác terminal load từ từ
  const printLines = useCallback((lines: LogLine[]) => {
    // Flush bất kỳ timer đang chạy
    if (printTimerRef.current) clearTimeout(printTimerRef.current);
    printQueueRef.current = [...lines];
    setIsPrinting(true);

    const printNext = (queue: LogLine[]) => {
      if (queue.length === 0) {
        setIsPrinting(false);
        return;
      }
      const [line, ...rest] = queue;
      setHistory((prev) => [...prev, line]);
      printQueueRef.current = rest;

      // Delay tỉ lệ với độ dài text: ngắn = 18ms, dài = max 55ms
      const delay = line.text.length === 0 ? 10 : Math.min(18 + line.text.length * 0.3, 55);
      printTimerRef.current = setTimeout(() => printNext(rest), delay);
    };

    printNext([...lines]);
  }, []);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (printTimerRef.current) clearTimeout(printTimerRef.current);
    };
  }, []);

  // ── Autocomplete data ─────────────────────────────────────────────────
  const ALL_COMMANDS = [
    "help", "whoami", "timeline", "workshop-board", "experiment-log",
    "graveyard", "skill-tree", "galaxy", "brain", "changelog",
    "achievements", "nexus", "clear", "theme", "sound", "guestbook", "xp",
    // sub-commands
    "theme default", "theme matrix", "theme amber", "theme cyber", "theme dracula",
    "sound on", "sound off", "sound vol",
  ];

  // Commands that expect an argument after them — show a hint
  const ARG_HINTS: Record<string, string> = {
    "sound vol": "<0-100>",
    "theme": "<default|matrix|amber|cyber|dracula>",
    "guestbook": "<tên> <lời_nhắn>",
  };

  const getSuggestions = (val: string): string[] => {
    const trimmed = val.trimStart();
    if (!trimmed) return [];
    return ALL_COMMANDS.filter(c => c.startsWith(trimmed.toLowerCase()) && c !== trimmed.toLowerCase());
  };

  // Returns a hint string if the current input matches a command that needs more args
  const getArgHint = (val: string): string => {
    const trimmed = val.trim().toLowerCase();
    for (const [cmd, hint] of Object.entries(ARG_HINTS)) {
      // exact match (with or without trailing space, no extra args yet)
      if (trimmed === cmd) return hint;
    }
    return "";
  };

  useEffect(() => {
    focusInput();

    // Load settings from localStorage asynchronously to avoid synchronous setState inside render effect
    setTimeout(() => {
      const savedTheme = localStorage.getItem("neko_terminal_theme");
      if (savedTheme) {
        setTheme(savedTheme as "default" | "matrix" | "amber" | "cyber" | "dracula");
      }

      const savedSound = localStorage.getItem("neko_sound_enabled");
      if (savedSound !== null) {
        setSoundEnabled(savedSound === "true");
      }

      const savedXp = localStorage.getItem("neko_user_xp");
      if (savedXp) {
        setXp(parseInt(savedXp, 10));
      }
    }, 0);

    // Play startup tune
    setTimeout(() => soundStartup(), 400);
  }, []);

  // Scroll to bottom whenever history updates
  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [history]);

  // XP accumulation helper
  const addXp = (amount: number) => {
    const prevXp = xp;
    const newXp = prevXp + amount;
    setXp(newXp);
    localStorage.setItem("neko_user_xp", newXp.toString());

    // Check level up (100 XP per level)
    const prevLvl = Math.floor(prevXp / 100) + 1;
    const newLvl = Math.floor(newXp / 100) + 1;
    if (newLvl > prevLvl) {
      setTimeout(() => {
        soundLevelUp();
      }, 150);

      setHistory((prev) => [
        ...prev,
        { text: `✨ LEVEL UP! You are now Explorer Level ${newLvl}! (+${amount} XP)`, type: "system" }
      ]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // ── Suggestions navigation ──────────────────────────────────────────
    if (suggestions.length > 0) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSuggestionIdx(i => (i + 1) % suggestions.length);
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setSuggestionIdx(i => (i - 1 + suggestions.length) % suggestions.length);
        return;
      }
      if (e.key === "Tab" || (e.key === "Enter" && suggestionIdx >= 0)) {
        e.preventDefault();
        const chosen = suggestionIdx >= 0 ? suggestions[suggestionIdx] : suggestions[0];
        setInput(chosen);
        setSuggestions([]);
        setSuggestionIdx(-1);
        soundTab();
        return;
      }
      if (e.key === "Escape") {
        setSuggestions([]);
        setSuggestionIdx(-1);
        return;
      }
    }

    if (e.key === "Enter") {
      const trimmedInput = input.trim();
      if (!trimmedInput) return;
      setSuggestions([]);
      setSuggestionIdx(-1);

      // Add to command history
      const newCmdHistory = [trimmedInput, ...cmdHistory].slice(0, 50);
      setCmdHistory(newCmdHistory);
      setHistoryIdx(-1);

      // Add input line
      setHistory((prev) => [...prev, { text: trimmedInput, type: "input" }]);

      // Execute command
      soundEnter();
      executeCommand(trimmedInput);
      setInput("");
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (cmdHistory.length > 0 && historyIdx < cmdHistory.length - 1) {
        const nextIdx = historyIdx + 1;
        setHistoryIdx(nextIdx);
        const val = cmdHistory[nextIdx];
        setInput(val);
        setSuggestions([]);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIdx > 0) {
        const nextIdx = historyIdx - 1;
        setHistoryIdx(nextIdx);
        const val = cmdHistory[nextIdx];
        setInput(val);
        setSuggestions([]);
      } else if (historyIdx === 0) {
        setHistoryIdx(-1);
        setInput("");
        setSuggestions([]);
      }
    } else if (e.key === "Tab") {
      e.preventDefault();
      const list = getSuggestions(input);
      if (list.length === 1) {
        setInput(list[0]);
        setSuggestions([]);
        soundTab();
      } else if (list.length > 1) {
        setSuggestions(list);
        setSuggestionIdx(0);
        soundTab();
      }
    } else if (e.key === "Escape") {
      setSuggestions([]);
      setSuggestionIdx(-1);
    } else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
      soundType();
    } else if (e.key === "Backspace") {
      soundType();
    }
  };

  // Update suggestions live as user types
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInput(val);
    setSuggestionIdx(-1);
    const list = getSuggestions(val);
    setSuggestions(list);
  };

  const executeCommand = (cmdStr: string) => {
    const parts = cmdStr.split(" ");
    const command = parts[0].toLowerCase();

    const galaxyNodes = galaxy.nodes as unknown as Node[];

    let outputs: LogLine[] = [];

    // Award XP per command
    const xpAwards: Record<string, number> = {
      help: 5,
      whoami: 15,
      timeline: 20,
      "workshop-board": 15,
      "experiment-log": 20,
      graveyard: 15,
      "skill-tree": 15,
      galaxy: 15,
      brain: 15,
      changelog: 15,
      achievements: 20,
      nexus: 20,
      theme: 10,
      sound: 10,
      guestbook: 15,
      xp: 5
    };

    if (xpAwards[command]) {
      addXp(xpAwards[command]);
    }

    switch (command) {
      case "help":
        outputs = [
          { text: "┌─────────────────────────────────────────────────────┐", type: "heading" },
          { text: "│           NEKO.OS — HỆ THỐNG LỆNH KHẢ DỤNG         │", type: "heading" },
          { text: "└─────────────────────────────────────────────────────┘", type: "heading" },
          { text: "", type: "output" },
          { text: "── 📁 KHÁM PHÁ ─────────────────────────────────────", type: "heading" },
          { text: "  whoami          Thông tin lập trình viên & Developer DNA", type: "output" },
          { text: "  timeline        Dòng thời gian các kỷ nguyên hoạt động", type: "output" },
          { text: "  galaxy          Bản đồ chòm sao dự án (3D visualization)", type: "output" },
          { text: "  brain           Luồng suy nghĩ & định hướng hiện tại", type: "output" },
          { text: "  skill-tree      Cây kỹ năng & kiến thức chuyên môn", type: "output" },
          { text: "  achievements    Các thành tựu và cột mốc nổi bật", type: "output" },
          { text: "", type: "output" },
          { text: "── 🗂️  DỰ ÁN ──────────────────────────────────────", type: "heading" },
          { text: "  workshop-board  Bảng Kanban phân loại dự án", type: "output" },
          { text: "  experiment-log  Nhật ký thí nghiệm — toàn bộ dự án", type: "output" },
          { text: "  graveyard       Nghĩa trang dự án thất bại / lưu trữ", type: "output" },
          { text: "  changelog       Nhật ký phát hành hệ thống theo tháng", type: "output" },
          { text: "  nexus           Tổng quan hệ sinh thái Neko Nexus", type: "output" },
          { text: "", type: "output" },
          { text: "── ⚙️  HỆ THỐNG ────────────────────────────────────", type: "heading" },
          { text: "  theme <name>    Đổi giao diện terminal", type: "output" },
          { text: "    └─ tên hợp lệ: default · matrix · amber · cyber · dracula", type: "output" },
          { text: "  sound on|off    Bật / tắt toàn bộ âm thanh", type: "output" },
          { text: "  sound vol <0-100>  Chỉnh âm lượng nhạc nền (0 = tắt, 100 = max)", type: "output" },
          { text: "  xp              Xem điểm tích lũy & level khám phá", type: "output" },
          { text: "  clear           Xóa màn hình terminal", type: "output" },
          { text: "", type: "output" },
          { text: "── 📝 GUESTBOOK ────────────────────────────────────", type: "heading" },
          { text: "  guestbook                   Xem toàn bộ lời nhắn", type: "output" },
          { text: "  guestbook <tên> <lời_nhắn>  Ghi lại lời nhắn mới", type: "output" },
          { text: "", type: "output" },
          { text: "  💡 Tip: Nhấn Tab để auto-complete lệnh", type: "system" },
          { text: "  💡 Tip: Nhấn ↑↓ để duyệt lệnh đã gõ trước đó", type: "system" },
        ];
        break;

      case "nexus":
        const ins = technologyMap.insights;
        outputs = [
          { text: "=== NEKO NEXUS SYSTEM SCAN ===", type: "heading" },
          { text: "1. What is connected? (Hệ Sinh Thái Kết Nối)", type: "heading" },
          { text: `   VI: ${ins.connected_vi}`, type: "output" },
          { text: `   EN: ${ins.connected_en}`, type: "output" },
          { text: "2. What is emerging? (Xu Hướng Trỗi Dậy)", type: "heading" },
          { text: `   VI: ${ins.emerging_vi}`, type: "output" },
          { text: `   EN: ${ins.emerging_en}`, type: "output" },
          { text: "3. What is fading? (Công Nghệ Phai Nhạt)", type: "heading" },
          { text: `   VI: ${ins.fading_vi}`, type: "output" },
          { text: `   EN: ${ins.fading_en}`, type: "output" },
          { text: "4. What is becoming important? (Trọng Tâm Phát Triển)", type: "heading" },
          { text: `   VI: ${ins.important_vi}`, type: "output" },
          { text: `   EN: ${ins.important_en}`, type: "output" },
        ];
        break;

      case "whoami":
        outputs = [
          { text: "=== DEVELOPER DNA ===", type: "heading" },
          { text: "Họ tên: Nguyễn Văn Hiếu (Neko Vibe Coder)", type: "output" },
          { text: "Vai trò: Web Developer | PERN & Next.js Specialization", type: "output" },
          { text: "Học văn: Trường Đại học Công Thương TP.HCM (HUIT) - GPA: 3.51/4.0", type: "output" },
          { text: "Liên hệ: nvanhieuk13@gmail.com | Github: github.com/nicodolas", type: "output" },
          { text: "Phẩm chất nổi bật:", type: "output" },
          ...dnaData.traits.map(t => ({
            text: `  - [${t.name}]: ${"█".repeat(Math.round(t.score / 10))}${"░".repeat(10 - Math.round(t.score / 10))} ${t.score}%`,
            type: "output" as const
          })),
          { text: `Ngôn ngữ yêu thích nhất: ${dnaData.favorite_languages.join(", ")}`, type: "output" },
          { text: `Thời gian hoạt động nhiều nhất: ${dnaData.most_active_hour}`, type: "output" },
        ];
        break;

      case "timeline":
        outputs = [
          { text: "=== DÒNG THỜI GIAN KỶ NGUYÊN ===", type: "heading" },
          ...timeline.eras.map(e => ({
            text: `[${e.year}] - ${e.title_vi} (${e.title})\n  > Mô tả: ${e.description_vi}\n  > Công nghệ: ${e.technologies.join(", ")}\n  > Tích lũy: ${e.commits}+ Commits | ${e.repos.length} Repositories`,
            type: "output" as const
          }))
        ];
        break;

      case "workshop-board":
        const activeNodes = galaxyNodes.filter(n => !n.id.toLowerCase().includes("old") && !n.id.toLowerCase().includes("abandoned"));
        const archivedNodes = galaxyNodes.filter(n => n.id.toLowerCase().includes("old") || n.id.toLowerCase().includes("abandoned"));
        outputs = [
          { text: "=== BẢNG CÔNG VIỆC WORKSHOP (KANBAN) ===", type: "heading" },
          { text: "🧪 RESEARCH / BUILDING:", type: "heading" },
          ...activeNodes.slice(0, 6).map(n => ({ text: `  - [⚙️] ${n.id} : ${n.description_vi}`, type: "output" as const })),
          { text: "\n📦 ARCHIVED / GRAVEYARD:", type: "heading" },
          ...archivedNodes.map(n => ({ text: `  - [⚰️] ${n.id} : ${n.description_vi}`, type: "output" as const })),
          { text: "(Để xem đầy đủ hơn, vui lòng truy cập trang 'Board' trên menu)", type: "system" }
        ];
        break;

      case "experiment-log":
        outputs = [
          { text: "=== NHẬT KÝ THÍ NGHIỆM ===", type: "heading" },
          ...galaxyNodes.map(n => ({
            text: `🧪 [${n.id}] : ${n.description_vi || n.description}\n  > Tech: ${n.tech ? n.tech.join(", ") : "Chưa xác định"}\n  > GitHub: ${n.githubUrl || "N/A"}`,
            type: "output" as const
          }))
        ];
        break;

      case "graveyard":
        const dead = galaxyNodes.filter(n => n.id.toLowerCase().includes("old") || n.id.toLowerCase().includes("abandoned"));
        outputs = [
          { text: "=== NGHĨA TRANG DỰ ÁN (FAILED / ABANDONED) ===", type: "heading" },
          ...dead.map(n => ({
            text: `⚰️ Dự án: [${n.id}]\n  - Lý do lưu trữ: Chuyển dịch công nghệ hoặc ưu tiên dự án mới hơn.\n  - Bài học: Rút gọn tối đa kiến trúc trước khi code, tập trung MVP.`,
            type: "output" as const
          })),
          { text: dead.length === 0 ? "Không có dự án nào bị bỏ hoang. Mọi thí nghiệm đều thành công tốt đẹp!" : "", type: "output" }
        ];
        break;

      case "skill-tree":
        outputs = [
          { text: "=== CÂY KỸ NĂNG NÂNG CAO ===", type: "heading" },
          { text: "── Lập trình ngôn ngữ ──", type: "heading" },
          { text: "  ├── TypeScript / JavaScript\n  ├── Python\n  ├── C#\n  └── SQL (PostgreSQL, MySQL)", type: "output" },
          { text: "── Phát triển Backend ──", type: "heading" },
          { text: "  ├── Node.js / Express.js\n  └── PHP (Laravel)", type: "output" },
          { text: "── Phát triển Frontend ──", type: "heading" },
          { text: "  ├── Next.js (15/16 App Router)\n  ├── React.js\n  └── Tailwind CSS & GSAP animations", type: "output" },
          { text: "── Tự động hóa & Khác ──", type: "heading" },
          { text: "  ├── n8n / Workflows Automation\n  ├── Docker\n  └── Data Structures & Algorithms", type: "output" }
        ];
        break;

      case "galaxy":
        outputs = [
          { text: "=== CHÒM SAO DỰ ÁN (GALAXY STATS) ===", type: "heading" },
          { text: `Tổng số thực thể liên kết (Nodes): ${galaxyNodes.length}`, type: "output" },
          { text: `Tổng số liên kết công nghệ (Edges): ${galaxy.links.length}`, type: "output" },
          { text: "Chủ đề chính trong hệ hành tinh: Next.js, n8n, AI APIs, Three.js.", type: "output" },
          { text: "Bạn có thể vào trang 'Galaxy' trên menu để xem tinh vân 2D tương tác bằng GSAP.", type: "system" },
        ];
        break;

      case "brain":
        outputs = [
          { text: "=== TRÍ NÃO NEKO (THOUGHT STREAMS) ===", type: "heading" },
          { text: `Trọng tâm học tập: ${dnaData.favorite_topic || "Agentic Workflows"}`, type: "output" },
          { text: `Định hướng nghiên cứu: Thiết lập các MCP server và tích hợp AI Agents.`, type: "output" },
          { text: "Bạn có thể vào trang 'Brain' trên menu để xem luồng suy nghĩ chi tiết thời gian thực.", type: "system" },
        ];
        break;

      case "changelog":
        outputs = [
          { text: "=== BẢN PHÁT HÀNH HỆ THỐNG ===", type: "heading" },
          ...changelog.releases.map(r => ({
            text: `[${r.version}] - ${r.monthNameVi || r.monthName} (${r.date})\n${r.notes.map(n => `  ${n}`).join("\n")}`,
            type: "output" as const
          }))
        ];
        break;

      case "achievements":
        outputs = [
          { text: "=== CÁC THÀNH TỰU VÀ CỘT MỐC ĐẠT ĐƯỢC ===", type: "heading" },
          ...achievements.achievements.map(a => ({
            text: `${a.icon} [${a.date}] - ${a.title_vi} (${a.title})\n  > ${a.desc_vi || a.desc}`,
            type: "output" as const
          }))
        ];
        break;

      case "sound":
        const soundArg = parts[1];
        if (soundArg === "on") {
          setSoundEnabled(true);
          localStorage.setItem("neko_sound_enabled", "true");
          if (getMuted()) toggleMute();
          window.dispatchEvent(new Event("neko:audio-change"));
          soundOn();
          outputs = [
            { text: "✔ Sound effects  : ENABLED", type: "system" },
            { text: "✔ Background music: ENABLED", type: "system" },
          ];
        } else if (soundArg === "off") {
          setSoundEnabled(false);
          localStorage.setItem("neko_sound_enabled", "false");
          if (!getMuted()) toggleMute();
          window.dispatchEvent(new Event("neko:audio-change"));
          outputs = [
            { text: "✖ Sound effects  : DISABLED", type: "system" },
            { text: "✖ Background music: DISABLED", type: "system" },
          ];
        } else if (soundArg === "vol") {
          const rawVol = parts[2];
          const volNum = parseInt(rawVol, 10);
          if (!rawVol) {
            soundError();
            outputs = [
              { text: "Error: missing volume value.", type: "error" },
              { text: "Usage  : sound vol <0-100>", type: "output" },
              { text: "Example: sound vol 60", type: "output" },
            ];
          } else if (isNaN(volNum) || rawVol !== String(volNum)) {
            soundError();
            outputs = [
              { text: `Error: '${rawVol}' is not a valid integer.`, type: "error" },
              { text: "Usage: sound vol <0-100>", type: "output" },
            ];
          } else if (volNum < 0) {
            soundError();
            outputs = [
              { text: `Error: volume cannot be negative (got: ${volNum}).`, type: "error" },
              { text: "Valid : sound vol <0-100>", type: "output" },
            ];
          } else if (volNum > 100) {
            soundError();
            outputs = [
              { text: `Error: volume exceeds maximum of 100 (got: ${volNum}).`, type: "error" },
              { text: "Valid : sound vol <0-100>", type: "output" },
            ];
          } else {
            const fraction = volNum / 100;
            setVolume(fraction);
            if (volNum > 0 && getMuted()) toggleMute();
            if (volNum === 0 && !getMuted()) toggleMute();
            window.dispatchEvent(new Event("neko:audio-change"));
            const filled = Math.round(volNum / 10);
            const bar = "█".repeat(filled) + "░".repeat(10 - filled);
            outputs = [
              { text: `Background music volume: [${bar}] ${volNum}%`, type: "system" },
            ];
          }
        } else {
          const sfxState = soundEnabled ? "ENABLED" : "DISABLED";
          const musicState = getMuted() ? "MUTED" : "PLAYING";
          const currentVol = Math.round(getVolume() * 100);
          outputs = [
            { text: "Usage: sound [on|off|vol <0-100>]", type: "error" },
            { text: `  Sound effects  : ${sfxState}`, type: "output" },
            { text: `  Background music: ${musicState} (${currentVol}%)`, type: "output" },
          ];
        }
        break;

      case "theme":
        const selectedTheme = parts[1];
        if (["default", "matrix", "amber", "cyber", "dracula"].includes(selectedTheme)) {
          setTheme(selectedTheme as "default" | "matrix" | "amber" | "cyber" | "dracula");
          localStorage.setItem("neko_terminal_theme", selectedTheme);
          soundTheme();
          outputs = [{ text: `Theme changed to: ${selectedTheme.toUpperCase()}`, type: "system" }];
        } else {
          outputs = [
            { text: "Usage: theme [default|matrix|amber|cyber|dracula]", type: "error" },
            { text: "Current themes available:", type: "output" },
            { text: "  - default : Classic Neko terminal colors", type: "output" },
            { text: "  - matrix  : Phosphor green terminal", type: "output" },
            { text: "  - amber   : Industrial CRT amber screen", type: "output" },
            { text: "  - cyber   : Neon synthwave colors", type: "output" },
            { text: "  - dracula : Vampire dark purple styling", type: "output" }
          ];
        }
        break;

      case "xp":
        const currentLvl = Math.floor(xp / 100) + 1;
        const xpForNext = 100 - (xp % 100);
        const barLength = Math.floor((xp % 100) / 10);
        const progressBar = "█".repeat(barLength) + "░".repeat(10 - barLength);

        outputs = [
          { text: "=== HỆ THỐNG TRẢI NGHIỆM (EXPLORER STATUS) ===", type: "heading" },
          { text: `Cấp độ khám phá: Level ${currentLvl}`, type: "output" },
          { text: `Tiến trình: [${progressBar}] ${xp % 100}/100 XP`, type: "output" },
          { text: `Cần thêm ${xpForNext} XP để thăng cấp tiếp theo.`, type: "output" },
          { text: `Tổng số XP đã tích lũy: ${xp} XP`, type: "output" },
          { text: "💡 Mẹo: XP dùng để nâng cấp/mở khóa các node tại Skill Tree!", type: "system" }
        ];
        break;

      case "guestbook":
        const guestName = parts[1];
        const guestMessage = parts.slice(2).join(" ");

        // Retrieve existing guestbook from local storage
        let guestbookList: { name: string; message: string; date: string }[] = [];
        try {
          const savedGB = localStorage.getItem("neko_guestbook");
          if (savedGB) guestbookList = JSON.parse(savedGB);
        } catch { }

        if (guestName && guestMessage) {
          // Write message
          const newEntry = {
            name: guestName,
            message: guestMessage,
            date: new Date().toLocaleDateString()
          };
          guestbookList.unshift(newEntry);
          // Limit to 20 entries
          const trimmedGB = guestbookList.slice(0, 20);
          localStorage.setItem("neko_guestbook", JSON.stringify(trimmedGB));

          soundEnter();

          outputs = [
            { text: "Guestbook message successfully registered in local browser storage!", type: "system" },
            { text: `${guestName} >> ${guestMessage}`, type: "output" }
          ];
        } else {
          // Read messages
          outputs = [
            { text: "=== SỔ LƯU BÚT ĐỊA PHƯƠNG (LOCAL GUESTBOOK) ===", type: "heading" },
            { text: "Sử dụng: guestbook [tên_bạn] [lời_nhắn_của_bạn]", type: "system" },
            { text: "", type: "output" }
          ];

          if (guestbookList.length === 0) {
            outputs.push({ text: "Sổ lưu bút hiện tại trống. Hãy để lại lời nhắn đầu tiên!", type: "output" });
          } else {
            guestbookList.forEach(item => {
              outputs.push({ text: `[${item.date}] ${item.name} >> ${item.message}`, type: "output" });
            });
          }
        }
        break;

      case "clear":
        // Flush print queue trước khi clear
        if (printTimerRef.current) clearTimeout(printTimerRef.current);
        printQueueRef.current = [];
        setIsPrinting(false);
        setHistory([]);
        return;

      default:
        soundError();
        outputs = [
          { text: `Neko.OS: command not found: '${command}'. Type 'help' to see list of valid commands.`, type: "error" }
        ];
    }

    printLines([...outputs, { text: "", type: "output" }]);
  };

  // Theme styles resolver
  const getContainerStyle = () => {
    switch (theme) {
      case "matrix": return "bg-[#020502]/95 border-[#00ff33]/30 text-[#00ff33]";
      case "amber": return "bg-[#0d0700]/95 border-[#ffb000]/30 text-[#ffb000]";
      case "cyber": return "bg-[#0f051d]/90 border-[#ff007f]/30 text-[#00f0ff]";
      case "dracula": return "bg-[#282a36]/95 border-[#bd93f9]/30 text-[#f8f8f2]";
      default: return "bg-[#090d16]/90 border-[#00ff66]/20 text-[#e2e8f0]";
    }
  };

  const getPromptColor = () => {
    switch (theme) {
      case "matrix": return "text-[#00ff33]";
      case "amber": return "text-[#ffb000]";
      case "cyber": return "text-[#ff007f]";
      case "dracula": return "text-[#ff79c6]";
      default: return "text-[#00ff66]";
    }
  };

  const getVisitorPrompt = () => {
    switch (theme) {
      case "matrix": return "text-[#00ff33] font-bold before:content-['visitor@matrix:~$__']";
      case "amber": return "text-[#ffb000] font-bold before:content-['visitor@amber:~$__']";
      case "cyber": return "text-[#ff007f] font-bold before:content-['visitor@cyberpunk:~$__']";
      case "dracula": return "text-[#ff79c6] font-bold before:content-['visitor@dracula:~$__']";
      default: return "text-[#00ccff] font-bold before:content-['visitor@neko:~$__']";
    }
  };

  const getSystemColor = () => {
    switch (theme) {
      case "matrix": return "text-[#00cc33] italic opacity-85";
      case "amber": return "text-[#d88d00] italic opacity-85";
      case "cyber": return "text-[#bd93f9] italic";
      case "dracula": return "text-[#50fa7b] italic";
      default: return "text-[#a855f7] italic";
    }
  };

  const getHeadingColor = () => {
    switch (theme) {
      case "matrix": return "text-[#00ff33] font-bold border-b border-[#00ff33]/20 pb-1 mt-3";
      case "amber": return "text-[#ffb000] font-bold border-b border-[#ffb000]/20 pb-1 mt-3";
      case "cyber": return "text-[#00f0ff] font-bold border-b border-[#00f0ff]/20 pb-1 mt-3 glow-cyan";
      case "dracula": return "text-[#8be9fd] font-bold border-b border-[#bd93f9]/20 pb-1 mt-3";
      default: return "text-[#ffb86c] font-bold glow-orange border-b border-[#ffb86c]/20 pb-1 mt-3";
    }
  };

  const getErrorColor = () => {
    switch (theme) {
      case "matrix": return "text-[#ff3333] font-bold";
      case "amber": return "text-[#ff5555] font-bold";
      default: return "text-[#ff5555]";
    }
  };

  const getOutputColor = (lineText: string) => {
    if (lineText.startsWith("  -") || lineText.startsWith("  ├──") || lineText.startsWith("  └──")) {
      switch (theme) {
        case "matrix": return "text-[#00ff33]";
        case "amber": return "text-[#ffb000]";
        case "cyber": return "text-[#ff007f]";
        case "dracula": return "text-[#50fa7b]";
        default: return "text-[#00ff66]";
      }
    }
    return "";
  };

  return (
    <div
      onClick={focusInput}
      className={`flex-grow flex flex-col p-4 min-h-[500px] shadow-2xl relative select-text overflow-hidden rounded-lg border transition-all duration-300 ${getContainerStyle()}`}
    >
      {/* Glow highlight */}
      <div className="absolute inset-0 border border-[#00ff66]/5 rounded-lg pointer-events-none"></div>

      {/* Terminal logs list */}
      <div className="flex-grow overflow-y-auto mb-4 space-y-2.5 text-xs md:text-sm select-text pr-2 scroll-smooth">
        {history.map((line, idx) => {
          let colorClass = "text-[#e2e8f0]";
          if (line.type === "input") colorClass = getVisitorPrompt();
          else if (line.type === "system") colorClass = getSystemColor();
          else if (line.type === "error") colorClass = getErrorColor();
          else if (line.type === "heading") colorClass = getHeadingColor();
          else if (line.type === "output") {
            const specificColor = getOutputColor(line.text);
            colorClass = specificColor || (theme === "matrix" ? "text-[#00ff33]" : theme === "amber" ? "text-[#ffb000]" : "text-[#e2e8f0]");
          }

          return (
            <div
              key={idx}
              className={`${colorClass} leading-relaxed whitespace-pre-wrap`}
            >
              {line.text}
            </div>
          );
        })}
        <div ref={terminalEndRef} />
      </div>

      {/* Terminal prompt input */}
      <div className="relative flex flex-col border-t border-slate-800 pt-3 mt-auto select-none">
        {/* Suggestions dropdown */}
        {suggestions.length > 0 && (
          <div className="absolute bottom-full mb-1 left-0 right-0 bg-[#0d1117] border border-[#00ff66]/30 rounded shadow-[0_0_16px_rgba(0,255,102,0.1)] overflow-hidden z-20 max-h-48 overflow-y-auto">
            {suggestions.map((s, i) => {
              const isActive = i === suggestionIdx;
              // highlight phần đã gõ
              const typed = input.trimStart().toLowerCase();
              const matchEnd = typed.length;
              return (
                <div
                  key={s}
                  onMouseDown={(e) => { e.preventDefault(); setInput(s); setSuggestions([]); setSuggestionIdx(-1); soundTab(); inputRef.current?.focus(); }}
                  className={`flex items-center gap-3 px-3 py-1.5 text-xs font-mono cursor-pointer transition-colors ${isActive ? "bg-[#00ff66]/15 text-[#00ff66]" : "text-slate-300 hover:bg-slate-800/60"}`}
                >
                  <span className="text-[#00ff66]/40 text-[10px] select-none">›_</span>
                  <span>
                    <span className={isActive ? "text-[#00ff66] font-bold" : "text-[#00ccff] font-bold"}>
                      {s.slice(0, matchEnd)}
                    </span>
                    <span className="opacity-60">{s.slice(matchEnd)}</span>
                  </span>
                </div>
              );
            })}
          </div>
        )}

        <div className="flex items-center text-xs md:text-sm">
          <span className={`font-bold mr-2 shrink-0 ${getPromptColor()}`}>
            visitor@{theme === "default" ? "neko" : theme === "cyber" ? "cyberpunk" : theme}:~$
          </span>
          {/* Input + inline hint wrapper */}
          <div className="relative flex-grow flex items-center min-w-0">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              className={`w-full bg-transparent outline-none font-mono select-text ${getPromptColor()} ${isPrinting ? "opacity-50" : ""}`}
              style={{ caretColor: "inherit" }}
              maxLength={100}
              autoComplete="off"
              autoFocus
              disabled={isPrinting}
            />
            {/* Ghost hint — rendered as invisible mirror text + colored hint right after */}
            {getArgHint(input) && (
              <span
                className="absolute left-0 top-0 font-mono text-xs md:text-sm pointer-events-none select-none whitespace-pre"
                aria-hidden="true"
              >
                {/* invisible mirror of typed text to push hint to correct position */}
                <span className="invisible">{input}</span>
                <span className="text-slate-500"> {getArgHint(input)}</span>
              </span>
            )}
          </div>
          {suggestions.length > 0 && (
            <span className="text-[10px] text-slate-600 ml-2 shrink-0 hidden sm:inline">Tab ↑↓ Esc</span>
          )}
        </div>
      </div>
    </div>
  );
}
