// src/analyzers/repo-classifier.js
const { BaseAnalyzer } = require("./base-analyzer");

class RepoClassifier extends BaseAnalyzer {
  constructor() {
    super("Repository Classifier", "classified-repos.json");
  }

  async analyze(raw, backupProjects) {
    const repos = raw.repos || [];
    const classified = [];

    repos.forEach(repo => {
      const name = (repo.name || "").toLowerCase();
      const desc = (repo.description || "").toLowerCase();
      const topics = (repo.topics || []).map(t => t.toLowerCase());
      const lang = repo.language;

      let category = "Software Engineering";
      
      // Determine category based on topics, name, description
      if (
        topics.some(t => ["ai", "agent", "llm", "rag", "mcp", "gpt", "gemini", "nlp"].includes(t)) ||
        ["ai", "agent", "router", "ziwei"].some(k => name.includes(k) || desc.includes(k))
      ) {
        category = "AI & Agents";
      } else if (
        topics.some(t => ["n8n", "nifi", "automation", "workflow", "pipeline", "etl"].includes(t)) ||
        ["n8n", "nifi", "automation", "workflow"].some(k => name.includes(k) || desc.includes(k))
      ) {
        category = "Automation & DevOps";
      } else if (
        topics.some(t => ["react", "nextjs", "next", "tailwind", "css", "html", "frontend"].includes(t)) ||
        ["react", "next", "tailwind", "html", "css", "flowershop", "portfolio"].some(k => name.includes(k))
      ) {
        category = "Frontend Development";
      } else if (
        topics.some(t => ["node", "express", "backend", "laravel", "php", "postgresql", "mysql", "api"].includes(t)) ||
        ["express", "node", "laravel", "php", "server", "backend", "db"].some(k => name.includes(k))
      ) {
        category = "Backend Development";
      } else if (
        topics.some(t => ["iot", "embedded", "esp32", "arduino", "hardware"].includes(t)) ||
        ["iot", "embedded", "esp32", "arduino", "khoabaomat"].some(k => name.includes(k) || desc.includes(k))
      ) {
        category = "IoT & Embedded Systems";
      } else if (lang === "C++" || lang === "C" || name === "sjf" || name === "rr") {
        category = "Algorithms & Systems";
      } else if (lang === "C#") {
        category = "Desktop & ERP Systems";
      } else if (lang) {
        category = `${lang} Development`;
      }

      classified.push({
        id: repo.name,
        name: repo.name,
        description: repo.description || "No description available.",
        description_vi: repo.description_vi || repo.description || "Chưa có mô tả.",
        language: lang,
        stars: repo.stargazers_count || 0,
        forks: repo.forks_count || 0,
        size: repo.size || 0,
        url: repo.html_url,
        created_at: repo.created_at,
        updated_at: repo.updated_at,
        topics: repo.topics || [],
        category
      });
    });

    this.writeJson(classified);
    return classified;
  }
}

module.exports = { RepoClassifier };
