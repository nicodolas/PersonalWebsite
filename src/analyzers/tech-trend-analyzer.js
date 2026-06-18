// src/analyzers/tech-trend-analyzer.js
const { BaseAnalyzer } = require("./base-analyzer");

class TechTrendAnalyzer extends BaseAnalyzer {
  constructor() {
    super("Technology Trend Analyzer", "technology-trends.json");
  }

  async analyze(raw, backupProjects) {
    const repos = raw.repos || [];
    const languageCounts = {};
    const recentCounts = {};
    const pastCounts = {};

    repos.forEach(repo => {
      const lang = repo.language;
      if (!lang) return;

      languageCounts[lang] = (languageCounts[lang] || 0) + 1;
      
      const year = new Date(repo.created_at).getFullYear();
      if (year >= 2025) {
        recentCounts[lang] = (recentCounts[lang] || 0) + 1;
      } else {
        pastCounts[lang] = (pastCounts[lang] || 0) + 1;
      }
    });

    backupProjects.forEach(proj => {
      proj.tech.forEach(lang => {
        languageCounts[lang] = (languageCounts[lang] || 0) + 1;
        const year = parseInt(proj.year, 10);
        if (year >= 2025) {
          recentCounts[lang] = (recentCounts[lang] || 0) + 1;
        } else {
          pastCounts[lang] = (pastCounts[lang] || 0) + 1;
        }
      });
    });

    const totalTechEntries = Object.values(languageCounts).reduce((sum, count) => sum + count, 0) || 1;

    const trends = Object.keys(languageCounts).map(lang => {
      const count = languageCounts[lang];
      const percentage = parseFloat(((count / totalTechEntries) * 100).toFixed(1));

      const recent = recentCounts[lang] || 0;
      const past = pastCounts[lang] || 0;

      let trend = "stable";
      if (recent > past) {
        trend = "rising";
      } else if (recent < past && past > 0) {
        trend = "declining";
      }

      return {
        language: lang,
        repos_count: count,
        percentage,
        trend
      };
    }).sort((a, b) => b.repos_count - a.repos_count).slice(0, 10);

    this.writeJson({ trends });
    return trends;
  }
}

module.exports = { TechTrendAnalyzer };
