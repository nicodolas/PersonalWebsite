// src/analyzers/brain-analyzer.js
const { BaseAnalyzer } = require("./base-analyzer");
const { SYSTEM_PROMPTS, PROMPT_TEMPLATES } = require("../lib/ai/prompts");

class BrainAnalyzer extends BaseAnalyzer {
  constructor() {
    super("Brain Analyzer", "brain.json");
  }

  async analyze(raw, backupProjects) {
    const repos = raw.repos || [];
    const events = raw.events || [];

    // Calculate active hours dynamically from events
    const hours = new Array(24).fill(0);
    events.forEach(e => {
      if (e.created_at) {
        const hour = new Date(e.created_at).getHours();
        hours[hour]++;
      }
    });

    let peakHour = 2; // Default 2 AM (UTC) or 9 AM (Vietnam)
    let maxEvents = 0;
    for (let i = 0; i < 24; i++) {
      if (hours[i] > maxEvents) {
        maxEvents = hours[i];
        peakHour = i;
      }
    }

    const formattedPeakHour = `${String(peakHour).padStart(2, '0')}:00 ${peakHour >= 12 ? 'PM' : 'AM'} (UTC)`;

    // Collect all topics and languages
    const topicsMap = {};
    const languagesMap = {};
    repos.forEach(repo => {
      if (repo.language) {
        languagesMap[repo.language] = (languagesMap[repo.language] || 0) + 3;
      }
      (repo.topics || []).forEach(t => {
        topicsMap[t] = (topicsMap[t] || 0) + 5;
      });
    });

    backupProjects.forEach(proj => {
      proj.tech.forEach(t => {
        languagesMap[t] = (languagesMap[t] || 0) + 4;
      });
    });

    // Form interest topics
    const defaultInterests = [
      { name: "AI Agents & MCP", score: 95, level: "proficient" },
      { name: "Workflow Automation", score: 92, level: "proficient" },
      { name: "Next.js Full-Stack", score: 95, level: "mastered" },
      { name: "3D Graphics & Three.js", score: 80, level: "learning" },
      { name: "IoT & Embedded Security", score: 75, level: "learning" }
    ];

    // Merge dynamic topics if available
    const interests = [...defaultInterests];
    Object.keys(topicsMap).forEach(t => {
      const formatted = t.charAt(0).toUpperCase() + t.slice(1);
      const score = Math.min(98, 50 + topicsMap[t]);
      const level = score >= 90 ? "mastered" : score >= 75 ? "proficient" : "learning";
      
      const existing = interests.find(i => i.name.toLowerCase() === formatted.toLowerCase());
      if (existing) {
        existing.score = Math.max(existing.score, score);
      } else {
        interests.push({ name: formatted, score, level });
      }
    });

    // Sort and limit interests to top 8
    const sortedInterests = interests.sort((a, b) => b.score - a.score).slice(0, 8);

    // Heuristics fallback summaries
    let currentFocus = "Agentic AI & Custom Automation Systems";
    let currentFocusVi = "AI Tác Nhân & Hệ Thống Tự Động Hóa Tùy Biến";
    let curiositySummary = "Exploring standard Model Context Protocol (MCP) integrations, custom workflow design with n8n, and interactive 3D frontend systems.";
    let curiositySummaryVi = "Khám phá tích hợp chuẩn Model Context Protocol (MCP), tự động hóa quy trình nghiệp vụ với n8n, và thiết kế 3D frontend tương tác.";

    // If OpenRouter is available, get AI curiosity summary
    if (process.env.OPENROUTER_API_KEY && repos.length > 0) {
      const recentRepos = repos.slice(0, 5).map(r => ({ name: r.name, desc: r.description, topics: r.topics }));
      const recentTech = Object.keys(languagesMap).slice(0, 6);
      const prompt = PROMPT_TEMPLATES.BRAIN_CURIOSITY(recentRepos, recentTech);

      try {
        const response = await this.askAI(prompt, SYSTEM_PROMPTS.BRAIN, JSON.stringify(recentRepos));
        const parsed = this.parseJsonFromAI(response);
        if (parsed.current_focus_en && parsed.current_focus_vi) {
          currentFocus = parsed.current_focus_en;
          currentFocusVi = parsed.current_focus_vi;
          curiositySummary = parsed.summary_en;
          curiositySummaryVi = parsed.summary_vi;
        }
      } catch (err) {
        console.warn("[BrainAnalyzer] AI curiosity analysis failed. Falling back to default heuristics.", err.message);
      }
    }

    const brainData = {
      current_focus: currentFocus,
      current_focus_vi: currentFocusVi,
      learning_rate: Math.min(98, 80 + Math.floor(events.length * 0.5)),
      active_hours: formattedPeakHour,
      research_topics: Object.keys(topicsMap).slice(0, 5).map(t => t.toUpperCase()),
      interests: sortedInterests,
      ai_curiosity_summary: curiositySummary,
      ai_curiosity_summary_vi: curiositySummaryVi
    };

    if (brainData.research_topics.length === 0) {
      brainData.research_topics = ["AI-AGENTS", "MCP", "AUTOMATION", "NEXTJS", "IOT"];
    }

    this.writeJson(brainData);
    return brainData;
  }
}

module.exports = { BrainAnalyzer };
