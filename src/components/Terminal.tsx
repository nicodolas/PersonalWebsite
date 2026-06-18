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

export default function Terminal() {
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<LogLine[]>([
    { text: "Welcome to Neko.OS Terminal v4.0.0", type: "system" },
    { text: "Type 'help' to see available commands or click navigation tabs above.", type: "system" },
    { text: "", type: "output" },
  ]);
  const [cmdHistory, setCmdHistory] = useState<string[]>([]);
  const [historyIdx, setHistoryIdx] = useState(-1);
  const terminalEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input on click anywhere inside terminal
  const focusInput = () => {
    if (inputRef.current) inputRef.current.focus();
  };

  useEffect(() => {
    focusInput();
  }, []);

  // Scroll to bottom whenever history updates
  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [history]);

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
    }
  };

  const executeCommand = (cmdStr: string) => {
    const parts = cmdStr.split(" ");
    const command = parts[0].toLowerCase();

    const galaxyNodes = galaxy.nodes as unknown as Node[];

    let outputs: LogLine[] = [];

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
          { text: "Học vấn: Trường Đại học Công Thương TP.HCM (HUIT) - GPA: 3.51/4.0", type: "output" },
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

      case "clear":
        setHistory([]);
        return;

      default:
        outputs = [
          { text: `Neko.OS: command not found: '${command}'. Type 'help' to see list of valid commands.`, type: "error" }
        ];
    }

    setHistory((prev) => [...prev, ...outputs, { text: "", type: "output" }]);
  };

  return (
    <div 
      onClick={focusInput}
      className="flex-grow flex flex-col bg-[#090d16]/90 border border-[#00ff66]/20 rounded-lg p-4 min-h-[500px] shadow-2xl relative select-text overflow-hidden"
    >
      {/* Glow highlight */}
      <div className="absolute inset-0 border border-[#00ff66]/5 rounded-lg pointer-events-none"></div>

      {/* Terminal logs list */}
      <div className="flex-grow overflow-y-auto mb-4 space-y-2.5 text-xs md:text-sm select-text pr-2 scroll-smooth">
        {history.map((line, idx) => {
          let colorClass = "text-[#e2e8f0]";
          if (line.type === "input") colorClass = "text-[#00ccff] font-bold before:content-['visitor@neko:~$__']";
          if (line.type === "system") colorClass = "text-[#a855f7] italic";
          if (line.type === "error") colorClass = "text-[#ff5555]";
          if (line.type === "heading") colorClass = "text-[#ffb86c] font-bold glow-orange border-b border-[#ffb86c]/20 pb-1 mt-3";
          if (line.type === "output" && line.text.startsWith("  -")) colorClass = "text-[#00ff66]";

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
        <span className="text-[#00ff66] font-bold mr-2">visitor@neko:~$</span>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-grow bg-transparent text-[#00ff66] outline-none font-mono caret-transparent select-text"
          maxLength={100}
          autoComplete="off"
          autoFocus
        />
        <span className="blinking-cursor shrink-0"></span>
      </div>
    </div>
  );
}
