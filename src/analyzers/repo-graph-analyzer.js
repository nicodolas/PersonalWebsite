// src/analyzers/repo-graph-analyzer.js
const { BaseAnalyzer } = require("./base-analyzer");
const fs = require("fs");
const path = require("path");

class RepoGraphAnalyzer extends BaseAnalyzer {
  constructor() {
    super("Repository Graph Analyzer", "repository-map.json");
  }

  async analyze(raw, backupProjects) {
    const repos = raw.repos || [];
    const nodes = [];
    const links = [];
    const processedNames = new Set();

    // 1. Process backup projects
    backupProjects.forEach(proj => {
      const id = proj.title || proj.id;
      processedNames.add(id.toLowerCase());
      nodes.push({
        id,
        description: proj.description_en,
        description_vi: proj.description_vi,
        group: proj.tech[0] || "Frontend",
        size: 15,
        tech: proj.tech,
        isBackup: true
      });
    });

    // 2. Process GitHub repos
    repos.forEach(repo => {
      if (processedNames.has(repo.name.toLowerCase())) {
        const existing = nodes.find(n => n.id.toLowerCase() === repo.name.toLowerCase());
        if (existing) {
          existing.stars = repo.stargazers_count;
          existing.forks = repo.forks_count;
          existing.size = 15 + Math.min(repo.stargazers_count * 2, 20);
          existing.githubUrl = repo.html_url;
        }
        return;
      }

      const group = repo.language || "Others";
      nodes.push({
        id: repo.name,
        description: repo.description || "Experimental utility code.",
        description_vi: repo.description || "Mã tiện ích thử nghiệm.",
        group,
        stars: repo.stargazers_count,
        forks: repo.forks_count,
        size: 10 + Math.min(repo.stargazers_count * 2, 20),
        tech: repo.language ? [repo.language] : [],
        githubUrl: repo.html_url
      });
    });

    // 3. Connect nodes sharing technologies or groups
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const nodeA = nodes[i];
        const nodeB = nodes[j];
        const sharedTech = nodeA.tech.filter(t => nodeB.tech.includes(t));

        if (sharedTech.length > 0) {
          links.push({
            source: nodeA.id,
            target: nodeB.id,
            label: `Both use ${sharedTech[0]}`
          });
        } else if (nodeA.group === nodeB.group && nodeA.group !== "Others") {
          links.push({
            source: nodeA.id,
            target: nodeB.id,
            label: `Same group: ${nodeA.group}`
          });
        }
      }
    }

    const graphData = { nodes, links };
    
    // Write primary repository-map.json
    this.writeJson(graphData);

    // Also write galaxy.json for compatibility with the UI
    const galaxyPath = path.join(__dirname, "../data/generated/galaxy.json");
    const wrappedGalaxy = {
      version: 1,
      generatedAt: new Date().toISOString(),
      data: graphData
    };
    fs.writeFileSync(galaxyPath, JSON.stringify(wrappedGalaxy, null, 2), "utf8");
    console.log("[RepoGraphAnalyzer] Successfully wrote: galaxy.json");

    return graphData;
  }
}

module.exports = { RepoGraphAnalyzer };
