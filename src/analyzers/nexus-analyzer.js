// src/analyzers/nexus-analyzer.js
const { BaseAnalyzer } = require("./base-analyzer");
const fs = require("fs");
const path = require("path");
const { SYSTEM_PROMPTS, PROMPT_TEMPLATES } = require("../lib/ai/prompts");

class NexusAnalyzer extends BaseAnalyzer {
  constructor() {
    super("Nexus Analyzer", "technology-map.json");
  }

  // Low-signal technologies that inflate counts but provide no insight
  static NOISE_TECHS = new Set(["HTML", "CSS"]);

  normalizeTechnology(name) {
    if (!name) return "";
    const lower = name.toLowerCase().trim();
    
    // Normalize frameworks and libraries
    if (lower === "next.js 16" || lower === "next.js" || lower === "nextjs") return "Next.js";
    if (lower === "react.js" || lower === "react" || lower === "reactjs") return "React";
    if (lower === "express.js" || lower === "express" || lower === "expressjs") return "Express";
    if (lower === "node.js" || lower === "node" || lower === "nodejs") return "Node.js";
    if (lower === "postgresql" || lower === "postgres") return "PostgreSQL";
    if (lower === "sql server" || lower === "sql") return "SQL";
    if (lower === "three.js" || lower === "threejs" || lower === "r3f") return "Three.js";
    if (lower === "tailwind css" || lower === "tailwind") return "Tailwind CSS";
    if (lower === "github actions" || lower === "actions") return "GitHub Actions";
    if (lower === "git/github" || lower === "git" || lower === "github") return "Git/GitHub";
    if (lower === "shadcn ui" || lower === "shadcn") return "Shadcn UI";
    if (lower === "tanstack query" || lower === "react-query") return "TanStack Query";
    if (lower === "zustand") return "Zustand";
    if (lower === "ai api" || lower === "openai" || lower === "gemini api") return "AI API";
    if (lower === "sepay") return "SePay";
    if (lower === "netlify") return "Netlify";
    if (lower === "async/await") return null; // Not a technology
    if (lower === "odoo") return "Odoo";
    if (lower === "laravel") return "Laravel";
    if (lower === "flutter") return "Flutter";
    if (lower === "gsap") return "GSAP";
    
    // Standardize casing
    if (lower === "typescript") return "TypeScript";
    if (lower === "javascript") return "JavaScript";
    if (lower === "python") return "Python";
    if (lower === "html5" || lower === "html") return "HTML";
    if (lower === "css3" || lower === "css") return "CSS";
    if (lower === "prisma") return "Prisma";
    if (lower === "n8n") return "n8n";
    if (lower === "docker") return "Docker";
    if (lower === "c++" || lower === "cpp") return "C++";
    if (lower === "c#" || lower === "csharp") return "C#";
    if (lower === "dart") return "Dart";
    if (lower === "lua") return "Lua";
    if (lower === "blade") return "Blade";
    if (lower === "handlebars") return "Handlebars";
    
    // Return original if no normalization rule matches
    return name;
  }

  async analyze(raw, backupProjects) {
    console.log("[NexusAnalyzer] Building Neko Nexus Layer...");

    const repos = raw.repos || [];
    
    // 1. Gather all normalized projects (repos + backup projects)
    const allProjects = [
      ...repos.map(r => ({
        id: r.name,
        name: r.name,
        description: r.description || "GitHub Repository",
        description_vi: r.description_vi || r.description || "Kho lưu trữ GitHub",
        languages: r.language ? [r.language] : [],
        topics: r.topics || [],
        archived: r.archived || false,
        stars: r.stars || 0,
        forks: r.forks || 0,
        created_at: r.created_at || "2025-01-01"
      })),
      ...backupProjects.map(bp => ({
        id: bp.id || bp.title,
        name: bp.title,
        description: bp.description || "Legacy Project",
        description_vi: bp.description_vi || bp.description || "Dự án cũ",
        languages: bp.tech || [],
        topics: bp.tech || [],
        archived: bp.status === "archived",
        stars: bp.stars || 0,
        forks: bp.forks || 0,
        created_at: bp.year ? `${bp.year}-01-01` : "2024-01-01"
      }))
    ];

    // Load brain interests for mapping
    const brainPath = path.join(__dirname, "../data/generated/brain.json");
    let brainData = { data: { interests: [], research_topics: [], current_focus: "" } };
    if (fs.existsSync(brainPath)) {
      try {
        brainData = JSON.parse(fs.readFileSync(brainPath, "utf8"));
      } catch (e) {
        console.error("[NexusAnalyzer] Failed to read brain.json:", e.message);
      }
    }
    const interests = brainData.data?.interests || [];
    const brainInfo = brainData.data || {};

    // Load timeline eras for mapping
    const timelinePath = path.join(__dirname, "../data/generated/timeline.json");
    let timelineData = { data: { eras: [] } };
    if (fs.existsSync(timelinePath)) {
      try {
        timelineData = JSON.parse(fs.readFileSync(timelinePath, "utf8"));
      } catch (e) {
        console.error("[NexusAnalyzer] Failed to read timeline.json:", e.message);
      }
    }
    const eras = timelineData.data?.eras || [];

    // Load achievements for mapping
    const achievementsPath = path.join(__dirname, "../data/generated/achievements.json");
    let achievementsData = { data: { achievements: [] } };
    if (fs.existsSync(achievementsPath)) {
      try {
        achievementsData = JSON.parse(fs.readFileSync(achievementsPath, "utf8"));
      } catch (e) {
        console.error("[NexusAnalyzer] Failed to read achievements.json:", e.message);
      }
    }
    const achievements = achievementsData.data?.achievements || [];

    // --- MAP 1: technology-map.json (Deterministic Technology Co-occurrence) ---
    const techMap = this.buildTechnologyMap(allProjects);

    // --- MAP 2: interest-map.json (Deterministic mapping of brain interests to tech, eras, achievements, and brain) ---
    const interestMap = this.buildInterestMap(interests, techMap.nodes, eras, achievements, brainInfo);

    // --- MAP 3: repository-network.json (Deterministic repository connection map) ---
    const repositoryNetwork = this.buildRepositoryNetwork(allProjects, eras, achievements, brainInfo);

    // --- MAP 4: knowledge-clusters.json (Deterministic grouping of projects and tech) ---
    const knowledgeClusters = this.buildKnowledgeClusters(allProjects, techMap.nodes, eras, achievements, brainInfo);

    // --- AI Explainers (Generate insights for the dashboard) ---
    console.log("[NexusAnalyzer] Querying AI to synthesize relationship insights...");
    const summaryText = JSON.stringify({
      top_technologies: techMap.nodes.slice(0, 8).map(n => n.id),
      top_interests: interests.map(i => i.name),
      recent_projects: allProjects.slice(0, 6).map(p => p.name)
    });

    let insights = {
      connected_en: "Core cluster connects Node.js, Express, and Next.js for full-stack application rendering.",
      connected_vi: "Cụm cốt lõi kết hợp Node.js, Express và Next.js để dựng các ứng dụng Full-Stack.",
      emerging_en: "Model Context Protocol (MCP) and agentic workflows are rapidly rising in active exploration.",
      emerging_vi: "Giao thức Model Context Protocol (MCP) và quy trình tác nhân AI đang phát triển mạnh mẽ.",
      fading_en: "Legacy languages like C++ and Lua show decreasing frequency of commit activity.",
      fading_vi: "Các ngôn ngữ lập trình hệ thống như C++ và Lua đang phai nhạt dần trong lịch sử commits.",
      important_en: "Custom automated ETL workflows and AI integrations occupy highest priority.",
      important_vi: "Tích hợp AI Agents và xây dựng quy trình tự động hóa n8n đang chiếm ưu tiên cao nhất."
    };

    try {
      const prompt = PROMPT_TEMPLATES.NEXUS_INSIGHTS(
        allProjects.slice(0, 8).map(p => ({ name: p.name, tech: [...p.languages, ...p.topics] })),
        techMap.links.slice(0, 10),
        interests
      );
      const aiResponse = await this.askAI(prompt, SYSTEM_PROMPTS.NEXUS, summaryText);
      if (aiResponse) {
        insights = this.parseJsonFromAI(aiResponse, insights);
      }
    } catch (err) {
      console.error("[NexusAnalyzer] OpenRouter call failed, using default insights:", err.message);
    }

    // Wrap and write all four files following JSON wrapper contract
    this.writeJson({
      nodes: techMap.nodes,
      links: techMap.links,
      insights: insights
    });

    this.writeCustomJson("interest-map.json", {
      nodes: interestMap.nodes,
      links: interestMap.links
    });

    this.writeCustomJson("repository-network.json", {
      nodes: repositoryNetwork.nodes,
      links: repositoryNetwork.links
    });

    this.writeCustomJson("knowledge-clusters.json", {
      clusters: knowledgeClusters
    });

    return {
      techMap,
      interestMap,
      repositoryNetwork,
      knowledgeClusters,
      insights
    };
  }

  // Helper to build Technology Map
  buildTechnologyMap(projects) {
    const techCounts = {};
    const coOccurrences = {};
    // Use a pipe separator to avoid splitting issues with tech names containing hyphens
    const LINK_SEP = "|";

    projects.forEach(proj => {
      // Collect unique NORMALIZED technologies for this project
      const rawTechs = [
        ...proj.languages,
        ...proj.topics.filter(t => t.length < 30) // Filter out very long strings
      ];

      const normalizedSet = new Set();
      rawTechs.forEach(t => {
        const normalized = this.normalizeTechnology(t);
        if (normalized && !NexusAnalyzer.NOISE_TECHS.has(normalized)) {
          normalizedSet.add(normalized);
        }
      });

      const techList = Array.from(normalizedSet);

      techList.forEach(t => {
        techCounts[t] = (techCounts[t] || 0) + 1;
      });

      // Build co-occurrence links
      for (let i = 0; i < techList.length; i++) {
        for (let j = i + 1; j < techList.length; j++) {
          const t1 = techList[i];
          const t2 = techList[j];
          const key = t1 < t2 ? `${t1}${LINK_SEP}${t2}` : `${t2}${LINK_SEP}${t1}`;
          coOccurrences[key] = (coOccurrences[key] || 0) + 1;
        }
      }
    });

    const nodes = Object.keys(techCounts).map(name => {
      let type = "language";
      const lower = name.toLowerCase();
      if (["react", "next.js", "express", "laravel", "flutter", "tanstack", "shadcn", "zustand"].some(f => lower.includes(f))) {
        type = "framework";
      } else if (["n8n", "docker", "git", "github", "actions", "netlify", "sepay"].some(t => lower.includes(t))) {
        type = "tool";
      } else if (["mcp", "agent", "rag", "ai api", "openai", "gemini"].some(a => lower.includes(a))) {
        type = "ai";
      } else if (["prisma", "postgresql", "sql", "odoo"].some(d => lower.includes(d))) {
        type = "database";
      } else if (["tailwind", "gsap", "three.js"].some(u => lower.includes(u))) {
        type = "ui";
      }

      return {
        id: name,
        label: name,
        type,
        count: techCounts[name]
      };
    }).sort((a, b) => b.count - a.count);

    const links = Object.keys(coOccurrences).map(key => {
      const sepIdx = key.indexOf(LINK_SEP);
      const source = key.substring(0, sepIdx);
      const target = key.substring(sepIdx + 1);
      return {
        source,
        target,
        weight: coOccurrences[key]
      };
    }).filter(link => link.weight > 0)
      .sort((a, b) => b.weight - a.weight);

    return { nodes, links };
  }

  // Helper to build Interest Map
  buildInterestMap(interests, techNodes, eras, achievements, brainInfo) {
    const nodes = [];
    const links = [];

    // 1. Add Current Brain Node
    const focusLabel = brainInfo.current_focus || "AI & Web Development";
    nodes.push({
      id: "current-brain",
      label: focusLabel,
      type: "brain",
      score: brainInfo.learning_rate || 100
    });

    // 2. Add Interest Nodes and link to Current Brain
    interests.forEach(i => {
      nodes.push({
        id: i.name,
        label: i.name,
        type: "interest",
        score: i.score
      });

      // Link: Current Brain -> Interest
      links.push({
        source: "current-brain",
        target: i.name,
        weight: i.score || 50
      });
    });

    // 3. Add Tech Nodes
    techNodes.forEach(t => {
      nodes.push({
        id: t.id,
        label: t.id,
        type: "technology"
      });

      // Link: Current Brain -> Technology (if it is a research topic)
      const isResearchTopic = (brainInfo.research_topics || []).some(
        rt => rt.toLowerCase() === t.id.toLowerCase() || t.id.toLowerCase().includes(rt.toLowerCase())
      );
      if (isResearchTopic) {
        links.push({
          source: "current-brain",
          target: t.id,
          weight: 90
        });
      }
    });

    // 4. Add Timeline Era Nodes and link to Technologies
    eras.forEach(era => {
      const eraId = `era-${era.year}`;
      nodes.push({
        id: eraId,
        label: era.title_vi || era.title,
        type: "era",
        year: era.year
      });

      // Link: Era -> Technologies used in this Era
      if (era.technologies) {
        era.technologies.forEach(techName => {
          // Find if the tech node exists
          const matchedTech = techNodes.find(t => t.id.toLowerCase() === techName.toLowerCase());
          const targetId = matchedTech ? matchedTech.id : techName;
          
          // Ensure the tech node is in the list
          if (!nodes.some(n => n.id === targetId)) {
            nodes.push({
              id: targetId,
              label: targetId,
              type: "technology"
            });
          }

          links.push({
            source: eraId,
            target: targetId,
            weight: 70
          });
        });
      }

      // Link: Current Brain -> Current Era (2026 or most recent)
      if (era.year === 2026) {
        links.push({
          source: "current-brain",
          target: eraId,
          weight: 100
        });
      }
    });

    // 5. Add Achievement Nodes and link to Eras and Technologies/Interests
    achievements.forEach(ach => {
      const achId = `achievement-${ach.title}`;
      nodes.push({
        id: achId,
        label: ach.title_vi || ach.title,
        type: "achievement",
        icon: ach.icon
      });

      // Parse year from date
      if (ach.date) {
        const year = parseInt(ach.date.split("-")[0]);
        if (!isNaN(year)) {
          const eraId = `era-${year}`;
          // Check if era node exists
          if (nodes.some(n => n.id === eraId)) {
            links.push({
              source: eraId,
              target: achId,
              weight: 80
            });
          }
        }
      }

      // Link: Achievement -> Tech/Interest if mentioned
      const descLower = (ach.desc + " " + ach.title).toLowerCase();
      
      techNodes.forEach(t => {
        const techNameLower = t.id.toLowerCase();
        if (descLower.includes(techNameLower) || (techNameLower === "three.js" && descLower.includes("three")) || (techNameLower === "react" && descLower.includes("react"))) {
          links.push({
            source: achId,
            target: t.id,
            weight: 85
          });
        }
      });

      interests.forEach(i => {
        const interestLower = i.name.toLowerCase();
        if (descLower.includes(interestLower)) {
          links.push({
            source: achId,
            target: i.name,
            weight: 80
          });
        }
      });
    });

    // 6. Connect interests to technologies based on keyword mapping
    interests.forEach(i => {
      const nameLower = i.name.toLowerCase();
      
      techNodes.forEach(t => {
        const techLower = t.id.toLowerCase();
        let connected = false;

        if (nameLower.includes("agent") || nameLower.includes("mcp")) {
          if (["mcp", "agent", "rag", "python", "ai"].some(k => techLower.includes(k))) {
            connected = true;
          }
        }
        if (nameLower.includes("next") || nameLower.includes("web") || nameLower.includes("stack")) {
          if (["next", "react", "tailwind", "typescript", "javascript", "postgres", "prisma"].some(k => techLower.includes(k))) {
            connected = true;
          }
        }
        if (nameLower.includes("automation") || nameLower.includes("workflow")) {
          if (["n8n", "actions", "docker", "git", "yaml"].some(k => techLower.includes(k))) {
            connected = true;
          }
        }
        if (nameLower.includes("3d") || nameLower.includes("three")) {
          if (["three", "webgl", "canvas", "css"].some(k => techLower.includes(k))) {
            connected = true;
          }
        }
        if (nameLower.includes("iot") || nameLower.includes("embedded") || nameLower.includes("security")) {
          if (["iot", "esp32", "cpp", "c", "lua"].some(k => techLower.includes(k))) {
            connected = true;
          }
        }

        if (connected) {
          links.push({
            source: i.name,
            target: t.id,
            weight: i.score || 50
          });
        }
      });
    });

    return { nodes, links };
  }

  // Helper to normalize a tech list for a project
  normalizeTechList(rawTechs) {
    const normalized = new Set();
    rawTechs.forEach(t => {
      const n = this.normalizeTechnology(t);
      if (n) normalized.add(n);
    });
    return Array.from(normalized);
  }

  // Helper to build Repository Network
  buildRepositoryNetwork(projects, eras, achievements, brainInfo) {
    // Pre-normalize tech for each project
    const projectsWithNormalizedTech = projects.map(p => {
      const normalizedTech = this.normalizeTechList([...p.languages, ...p.topics]);
      return { ...p, normalizedTech };
    });

    const nodes = projectsWithNormalizedTech.map(p => {
      // Find the era this project belongs to
      let matchedEra = eras.find(era => (era.repos || []).some(rName => rName.toLowerCase() === p.name.toLowerCase()));
      const eraStr = matchedEra ? matchedEra.title_vi || matchedEra.title : (p.created_at ? p.created_at.split("-")[0] : "Unknown Era");

      // Find achievements related to this project
      const matchedAchievements = achievements.filter(ach => {
        const titleAndDesc = (ach.title + " " + ach.desc).toLowerCase();
        return titleAndDesc.includes(p.name.toLowerCase());
      }).map(ach => ach.title_vi || ach.title);

      // Check if project uses technologies that align with current brain focus or interests
      const repoTechLower = p.normalizedTech.map(t => t.toLowerCase());
      const brainFocusTech = (brainInfo.research_topics || []).map(t => t.toLowerCase());
      const hasCurrentBrainConnection = repoTechLower.some(t => 
        brainFocusTech.includes(t) || 
        (brainInfo.current_focus || "").toLowerCase().includes(t)
      );

      return {
        id: p.id,
        name: p.name,
        description_vi: p.description_vi,
        group: p.normalizedTech[0] || "Unknown",
        size: 5 + Math.min(p.stars + p.forks, 15),
        tech: p.normalizedTech,
        era: eraStr,
        achievements: matchedAchievements.length > 0 ? matchedAchievements : undefined,
        currentBrainConnection: hasCurrentBrainConnection
      };
    });

    const links = [];
    for (let i = 0; i < projectsWithNormalizedTech.length; i++) {
      for (let j = i + 1; j < projectsWithNormalizedTech.length; j++) {
        const p1 = projectsWithNormalizedTech[i];
        const p2 = projectsWithNormalizedTech[j];

        // Find intersection of NORMALIZED tech stacks (excluding noise)
        const set1 = new Set(p1.normalizedTech.filter(t => !NexusAnalyzer.NOISE_TECHS.has(t)));
        const set2 = new Set(p2.normalizedTech.filter(t => !NexusAnalyzer.NOISE_TECHS.has(t)));
        
        let intersection = 0;
        set1.forEach(t => {
          if (set2.has(t)) intersection++;
        });

        if (intersection > 0) {
          links.push({
            source: p1.id,
            target: p2.id,
            weight: intersection
          });
        }
      }
    }

    return { nodes, links };
  }

  // Helper to build Knowledge Clusters
  buildKnowledgeClusters(projects, techNodes, eras, achievements, brainInfo) {
    const clusters = [
      {
        id: "ai-agents",
        label: "AI & Agentic Systems",
        label_vi: "Hệ Thống AI & Tác Nhân",
        description: "Intelligent tools, Model Context Protocol integration, LLM pipelines, and automated reasoning projects.",
        description_vi: "Công cụ thông minh, tích hợp giao thức MCP, đường ống mô hình ngôn ngữ lớn (LLM) và tác nhân tự động.",
        technologies: [],
        repositories: [],
        eras: [],
        achievements: []
      },
      {
        id: "web-erp",
        label: "Modern Web & Enterprise ERP",
        label_vi: "Web Hiện Đại & ERP Doanh Nghiệp",
        description: "Responsive React/Next.js frameworks, Odoo ERP custom business flows, and relational databases.",
        description_vi: "Hệ sinh thái React/Next.js, giải pháp doanh nghiệp Odoo ERP và cơ sở dữ liệu quan hệ.",
        technologies: [],
        repositories: [],
        eras: [],
        achievements: []
      },
      {
        id: "automation-cicd",
        label: "Automation & CI/CD Pipelines",
        label_vi: "Quy Trình Tự Động Hóa & CI/CD",
        description: "Workflow orchestration with n8n, automated testing runners, containerization, and daily scripts.",
        description_vi: "Điều phối công việc với n8n, kiểm thử tự động, đóng gói Docker và kịch bản tự động hóa.",
        technologies: [],
        repositories: [],
        eras: [],
        achievements: []
      },
      {
        id: "systems-legacy",
        label: "Systems & Legacy Explorations",
        label_vi: "Hệ Thống & Thử Nghiệm Ngôn Ngữ",
        description: "Algorithms, embedded exploration, C/C++, Lua scripts, and basic programming language foundations.",
        description_vi: "Giải thuật, lập trình nhúng, ngôn ngữ C/C++, kịch bản Lua và nghiên cứu nền tảng.",
        technologies: [],
        repositories: [],
        eras: [],
        achievements: []
      }
    ];

    // Map technologies to clusters using exact ID matching for precision
    const AI_TECHS = new Set(["Python", "AI API", "MCP"]);
    const WEB_TECHS = new Set(["Next.js", "React", "Tailwind CSS", "Odoo", "PostgreSQL", "Prisma", "SQL", "JavaScript", "TypeScript", "Express", "Node.js", "Shadcn UI", "TanStack Query", "Zustand", "SePay", "Netlify", "Three.js", "GSAP", "Flutter", "Dart", "Laravel", "Blade", "Handlebars"]);
    const AUTOMATION_TECHS = new Set(["n8n", "Docker", "GitHub Actions", "Git/GitHub"]);

    techNodes.forEach(t => {
      if (AI_TECHS.has(t.id)) {
        clusters[0].technologies.push(t.id);
      } else if (WEB_TECHS.has(t.id)) {
        clusters[1].technologies.push(t.id);
      } else if (AUTOMATION_TECHS.has(t.id)) {
        clusters[2].technologies.push(t.id);
      } else {
        clusters[3].technologies.push(t.id);
      }
    });

    // Map repositories to clusters
    projects.forEach(p => {
      const keys = [...p.languages, ...p.topics].map(k => k.toLowerCase());
      const name = p.name.toLowerCase();
      
      let clusterIdx = 3; // default to legacy/systems/general

      if (keys.some(k => ["mcp", "agent", "rag", "ai", "openai"].some(k2 => k.includes(k2))) || name.includes("agent") || name.includes("mcp")) {
        clusterIdx = 0;
      } else if (keys.some(k => ["next", "react", "odoo", "postgres", "prisma", "huit"].some(k2 => k.includes(k2))) || name.includes("web") || name.includes("shop")) {
        clusterIdx = 1;
      } else if (keys.some(k => ["n8n", "docker", "action", "workflow"].some(k2 => k.includes(k2))) || name.includes("n8n") || name.includes("automate")) {
        clusterIdx = 2;
      }

      clusters[clusterIdx].repositories.push(p.name);
    });

    // Map Eras to clusters based on year and matching technologies
    eras.forEach(era => {
      if (era.year === 2026) {
        clusters[0].eras.push(era.year);
        clusters[2].eras.push(era.year);
      } else if (era.year === 2025) {
        clusters[0].eras.push(era.year);
        clusters[1].eras.push(era.year);
        clusters[2].eras.push(era.year);
      } else if (era.year === 2024) {
        clusters[1].eras.push(era.year);
        clusters[3].eras.push(era.year);
      } else if (era.year === 2023) {
        clusters[3].eras.push(era.year);
      }
    });

    // Map Achievements to clusters based on title/desc keywords
    achievements.forEach(ach => {
      const titleAndDesc = (ach.title + " " + ach.desc).toLowerCase();
      let clusterIdx = 1; // default to web

      if (titleAndDesc.includes("gemini") || titleAndDesc.includes("ai") || titleAndDesc.includes("agent")) {
        clusterIdx = 0;
      } else if (titleAndDesc.includes("workflow") || titleAndDesc.includes("automate") || titleAndDesc.includes("n8n")) {
        clusterIdx = 2;
      } else if (titleAndDesc.includes("first") || titleAndDesc.includes("c++") || titleAndDesc.includes("rr") || titleAndDesc.includes("sjf")) {
        clusterIdx = 3;
      }

      clusters[clusterIdx].achievements.push(ach.title_vi || ach.title);
    });

    return clusters;
  }
}

module.exports = { NexusAnalyzer };
