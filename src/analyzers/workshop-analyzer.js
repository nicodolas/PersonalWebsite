// src/analyzers/workshop-analyzer.js
const { BaseAnalyzer } = require("./base-analyzer");

class WorkshopAnalyzer extends BaseAnalyzer {
  constructor() {
    super("Workshop Analyzer", "workshop.json");
  }

  async analyze(raw, backupProjects) {
    const repos = raw.repos || [];
    const projects = [];

    // Process backup projects first
    backupProjects.forEach(proj => {
      let status = "archived";
      let progress = 100;
      if (proj.year === "2026") {
        status = "building";
        progress = 85;
      } else if (proj.year === "2025" && proj.id === "portfolio-3d") {
        status = "building"; // Keep active
        progress = 90;
      }

      const matchingRepo = repos.find(r => r.name.toLowerCase() === proj.id.toLowerCase());
      const stars = matchingRepo ? (matchingRepo.stargazers_count || 0) : 0;
      const forks = matchingRepo ? (matchingRepo.forks_count || 0) : 0;

      projects.push({
        id: proj.id,
        title: proj.title,
        status,
        progress,
        commits_count: proj.id === "review-lecturers" ? 280 : 150,
        tech_stack: proj.tech,
        description: proj.description_en,
        description_vi: proj.description_vi,
        github_url: proj.links.repo !== "#" ? proj.links.repo : undefined,
        demo_url: proj.links.demo !== "#" ? proj.links.demo : undefined,
        stars,
        forks
      });
    });

    // Process GitHub repos
    repos.forEach(repo => {
      // Avoid duplicate nodes
      if (projects.some(p => p.id.toLowerCase() === repo.name.toLowerCase())) {
        return;
      }

      const year = new Date(repo.created_at).getFullYear();
      const isRecent = (new Date() - new Date(repo.updated_at)) < (90 * 24 * 60 * 60 * 1000); // 90 days
      const isArchived = repo.archived || (!isRecent && year < 2025);

      let status = "building";
      let progress = 75;

      if (isArchived) {
        status = "archived";
        progress = 100;
      } else if (isRecent && repo.size === 0) {
        status = "researching";
        progress = 20;
      }

      const techStack = repo.language ? [repo.language] : [];
      if (repo.topics) {
        repo.topics.forEach(topic => {
          if (!techStack.includes(topic)) techStack.push(topic);
        });
      }

      projects.push({
        id: repo.name,
        title: repo.name,
        status,
        progress,
        commits_count: Math.max(10, Math.floor(repo.size / 10 + 5)),
        tech_stack: techStack,
        description: repo.description || "Experimental code and utility repository.",
        description_vi: repo.description || "Kho chứa mã nguồn thử nghiệm và tiện ích.",
        github_url: repo.html_url,
        stars: repo.stargazers_count || 0,
        forks: repo.forks_count || 0
      });
    });

    this.writeJson({ projects });
    return projects;
  }
}

module.exports = { WorkshopAnalyzer };
