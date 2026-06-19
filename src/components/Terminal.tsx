"use client";

import React, { useState, useEffect, useRef } from "react";
import timelineData from "@/data/generated/timeline.json";
import dnaData from "@/data/dna.json";
import galaxyData from "@/data/generated/galaxy.json";
import achievementsData from "@/data/generated/achievements.json";
import changelogData from "@/data/generated/changelog.json";
import technologyMapData from "@/data/generated/technology-map.json";

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
let globalAudioCtx: AudioContext | null = null;

const playBeep = (freq: number, duration: number, type: OscillatorType = "sine", volume = 0.03) => {
  try {
    const savedSound = localStorage.getItem("neko_sound_enabled");
    if (savedSound === "false") return;

    const AudioContextClass = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    if (!globalAudioCtx) {
      globalAudioCtx = new AudioContextClass();
    }

    if (globalAudioCtx.state === "suspended") {
      globalAudioCtx.resume();
    }

    const ctx = globalAudioCtx;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);

    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch {
    // Autoplay blocked
  }
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

  const terminalEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input on click anywhere inside terminal
  const focusInput = () => {
    if (inputRef.current) inputRef.current.focus();
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
    setTimeout(() => {
      playBeep(440, 0.08, "sine", 0.04);
      setTimeout(() => playBeep(554.37, 0.08, "sine", 0.04), 80);
      setTimeout(() => playBeep(659.25, 0.15, "sine", 0.04), 160);
    }, 400);
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
        playBeep(523.25, 0.1, "sine", 0.08); // C5
        setTimeout(() => playBeep(659.25, 0.1, "sine", 0.08), 80); // E5
        setTimeout(() => playBeep(783.99, 0.2, "sine", 0.08), 160); // G5
      }, 150);

      setHistory((prev) => [
        ...prev,
        { text: `✨ LEVEL UP! You are now Explorer Level ${newLvl}! (+${amount} XP)`, type: "system" }
      ]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      const trimmedInput = input.trim();
      if (!trimmedInput) return;

      // Add to command history
      const newCmdHistory = [trimmedInput, ...cmdHistory].slice(0, 50);
      setCmdHistory(newCmdHistory);
      setHistoryIdx(-1);

      // Add input line
      setHistory((prev) => [...prev, { text: trimmedInput, type: "input" }]);

      // Execute command
      executeCommand(trimmedInput);
      setInput("");
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (cmdHistory.length > 0 && historyIdx < cmdHistory.length - 1) {
        const nextIdx = historyIdx + 1;
        setHistoryIdx(nextIdx);
        setInput(cmdHistory[nextIdx]);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIdx > 0) {
        const nextIdx = historyIdx - 1;
        setHistoryIdx(nextIdx);
        setInput(cmdHistory[nextIdx]);
      } else if (historyIdx === 0) {
        setHistoryIdx(-1);
        setInput("");
      }
    } else if (e.key === "Tab") {
      // Autocomplete suggestions
      e.preventDefault();
      const currentInput = input.trim().toLowerCase();
      if (!currentInput) return;

      const commands = ["help", "whoami", "timeline", "workshop-board", "experiment-log", "graveyard", "skill-tree", "galaxy", "brain", "changelog", "achievements", "nexus", "clear", "theme", "sound", "guestbook", "xp"];
      const match = commands.find(c => c.startsWith(currentInput));
      if (match) {
        setInput(match);
        playBeep(900, 0.05, "sine", 0.01);
      }
    }
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
          { text: "=== HỆ THỐNG LỆNH KHẢ DỤNG ===", type: "heading" },
          { text: "whoami         -> Thông tin tổng quan về lập trình viên (Developer DNA)", type: "output" },
          { text: "timeline       -> Dòng thời gian các kỷ nguyên hoạt động", type: "output" },
          { text: "workshop-board -> Bảng công việc phân loại dự án (Kanban)", type: "output" },
          { text: "experiment-log -> Nhật ký thí nghiệm (danh sách toàn bộ dự án)", type: "output" },
          { text: "graveyard      -> Kho lưu trữ các đồ án thất bại/lưu trữ", type: "output" },
          { text: "skill-tree     -> Cây kỹ năng và kiến thức chuyên môn", type: "output" },
          { text: "galaxy         -> Bản đồ trực quan chòm sao dự án", type: "output" },
          { text: "brain          -> Trí não Neko (luồng suy nghĩ hiện tại)", type: "output" },
          { text: "changelog      -> Nhật ký phát hành hệ thống theo từng tháng", type: "output" },
          { text: "achievements   -> Các thành tựu và cột mốc nổi bật", type: "output" },
          { text: "nexus          -> Tổng quan mối quan hệ hệ sinh thái Neko Nexus", type: "output" },
          { text: "theme [name]   -> Thay đổi giao diện [default|matrix|amber|cyber|dracula]", type: "output" },
          { text: "sound [on|off] -> Bật/Tắt hiệu ứng âm thanh cổ điển", type: "output" },
          { text: "guestbook [n] [m] -> Ghi lại lời nhắn địa phương (guestbook [tên] [lời_nhắn])", type: "output" },
          { text: "xp             -> Xem điểm tích lũy và level khám phá hiện tại", type: "output" },
          { text: "clear          -> Xóa màn hình terminal", type: "output" },
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
          playBeep(880, 0.1, "sine", 0.05);
          setTimeout(() => playBeep(1200, 0.15, "sine", 0.05), 100);
          outputs = [{ text: "System sound effects ENABLED.", type: "system" }];
        } else if (soundArg === "off") {
          setSoundEnabled(false);
          localStorage.setItem("neko_sound_enabled", "false");
          outputs = [{ text: "System sound effects DISABLED.", type: "system" }];
        } else {
          outputs = [
            { text: "Usage: sound [on|off]", type: "error" },
            { text: `Current state: ${soundEnabled ? "ENABLED" : "DISABLED"}`, type: "output" }
          ];
        }
        break;

      case "theme":
        const selectedTheme = parts[1];
        if (["default", "matrix", "amber", "cyber", "dracula"].includes(selectedTheme)) {
          setTheme(selectedTheme as "default" | "matrix" | "amber" | "cyber" | "dracula");
          localStorage.setItem("neko_terminal_theme", selectedTheme);
          playBeep(587.33, 0.08, "triangle"); // D5
          setTimeout(() => playBeep(659.25, 0.12, "triangle"), 80); // E5
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

          playBeep(523.25, 0.1, "sine");
          setTimeout(() => playBeep(659.25, 0.15, "sine"), 80);

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
        setHistory([]);
        return;

      default:
        playBeep(220, 0.25, "sawtooth", 0.05); // Error tone
        outputs = [
          { text: `Neko.OS: command not found: '${command}'. Type 'help' to see list of valid commands.`, type: "error" }
        ];
    }

    setHistory((prev) => [...prev, ...outputs, { text: "", type: "output" }]);
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
      <div className="flex items-center text-xs md:text-sm border-t border-slate-800 pt-3 mt-auto select-none">
        <span className={`font-bold mr-2 ${getPromptColor()}`}>
          visitor@{theme === "default" ? "neko" : theme === "cyber" ? "cyberpunk" : theme}:~$
        </span>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            // Play physical keypress tick sound
            playBeep(600 + Math.random() * 200, 0.015, "triangle", 0.015);
          }}
          onKeyDown={handleKeyDown}
          className={`flex-grow bg-transparent outline-none font-mono select-text ${getPromptColor()}`}
          style={{ caretColor: "inherit" }}
          maxLength={100}
          autoComplete="off"
          autoFocus
        />
      </div>
    </div>
  );
}
