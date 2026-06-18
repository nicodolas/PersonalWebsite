// src/analyzers/skill-tree-analyzer.js
const { BaseAnalyzer } = require("./base-analyzer");

class SkillTreeAnalyzer extends BaseAnalyzer {
  constructor() {
    super("Skill Tree Analyzer", "skill-tree.json");
  }

  async analyze(raw, backupProjects, profileBackup) {
    const repos = raw.repos || [];
    
    // Flatten all tech and topics
    const techs = new Set();
    repos.forEach(repo => {
      if (repo.language) techs.add(repo.language.toLowerCase());
      (repo.topics || []).forEach(t => techs.add(t.toLowerCase()));
    });
    backupProjects.forEach(proj => {
      proj.tech.forEach(t => techs.add(t.toLowerCase()));
    });
    if (profileBackup && profileBackup.skills) {
      Object.values(profileBackup.skills).forEach(arr => {
        arr.forEach(s => techs.add(s.toLowerCase()));
      });
    }

    const hasTech = (keys) => keys.some(k => techs.has(k.toLowerCase()));

    // Define tree nodes dynamically based on techs set
    const trees = [
      {
        id: "automation",
        label: "Automation & CI/CD",
        label_vi: "Tự Động Hóa & CI/CD",
        status: hasTech(["n8n", "workflow", "actions", "docker"]) ? "mastered" : "unlocked",
        children: [
          {
            id: "github-actions",
            label: "GitHub Actions",
            label_vi: "GitHub Actions",
            status: hasTech(["actions", "github-actions"]) ? "mastered" : "unlocked"
          },
          {
            id: "n8n",
            label: "n8n Workflows",
            label_vi: "Quy Trình n8n",
            status: hasTech(["n8n"]) ? "mastered" : "unlocked"
          },
          {
            id: "docker-deploy",
            label: "Docker Containerization",
            label_vi: "Đóng Gói Docker",
            status: hasTech(["docker"]) ? "unlocked" : "locked"
          }
        ]
      },
      {
        id: "ai-systems",
        label: "AI & Agents Systems",
        label_vi: "Hệ Thống AI & Tác Nhân",
        status: hasTech(["ai", "agent", "mcp", "rag"]) ? "unlocked" : "locked",
        children: [
          {
            id: "mcp",
            label: "Model Context Protocol (MCP)",
            label_vi: "Giao Thức MCP",
            status: hasTech(["mcp"]) ? "unlocked" : "locked"
          },
          {
            id: "ai-agents",
            label: "AI Agents Workflows",
            label_vi: "Quy Trình Tác Nhân AI",
            status: hasTech(["agent", "agents"]) ? "unlocked" : "locked"
          },
          {
            id: "rag",
            label: "RAG & LLM Integration",
            label_vi: "Tích Hợp RAG & LLM",
            status: hasTech(["rag", "llm"]) ? "unlocked" : "locked"
          }
        ]
      },
      {
        id: "web-erp",
        label: "Enterprise Web & ERP",
        label_vi: "Web Doanh Nghiệp & ERP",
        status: "mastered",
        children: [
          {
            id: "nextjs",
            label: "Next.js 15/16 Full-Stack",
            label_vi: "Next.js 15/16 Full-Stack",
            status: hasTech(["next", "next.js"]) ? "mastered" : "unlocked"
          },
          {
            id: "odoo",
            label: "Odoo ERP customization",
            label_vi: "Tùy Biến Odoo ERP",
            status: hasTech(["odoo"]) ? "unlocked" : "locked" // locked to represent goal!
          },
          {
            id: "databases",
            label: "PostgreSQL & Prisma",
            label_vi: "PostgreSQL & Prisma",
            status: hasTech(["postgresql", "postgres", "prisma"]) ? "mastered" : "unlocked"
          }
        ]
      }
    ];

    this.writeJson({ trees });
    return trees;
  }
}

module.exports = { SkillTreeAnalyzer };
