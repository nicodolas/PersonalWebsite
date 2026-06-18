// src/scripts/run-analyzers.js
const fs = require("fs");
const path = require("path");

// Load env variables
function loadEnv() {
  const envPath = path.join(__dirname, "../../.env");
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, "utf8");
    envContent.split(/\r?\n/).forEach(line => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) return;
      const index = trimmed.indexOf("=");
      if (index > 0) {
        const key = trimmed.substring(0, index).trim();
        const value = trimmed.substring(index + 1).trim();
        process.env[key] = value;
      }
    });
  }
}

loadEnv();

// Import Analyzers
const { RepoClassifier } = require("../analyzers/repo-classifier");
const { TimelineAnalyzer } = require("../analyzers/timeline-analyzer");
const { BrainAnalyzer } = require("../analyzers/brain-analyzer");
const { TechTrendAnalyzer } = require("../analyzers/tech-trend-analyzer");
const { AchievementAnalyzer } = require("../analyzers/achievement-analyzer");
const { WorkshopAnalyzer } = require("../analyzers/workshop-analyzer");
const { ExperimentAnalyzer } = require("../analyzers/experiment-analyzer");
const { GraveyardAnalyzer } = require("../analyzers/graveyard-analyzer");
const { SkillTreeAnalyzer } = require("../analyzers/skill-tree-analyzer");
const { ChangelogAnalyzer } = require("../analyzers/changelog-analyzer");
const { RepoGraphAnalyzer } = require("../analyzers/repo-graph-analyzer");
const { NexusAnalyzer } = require("../analyzers/nexus-analyzer");

function readJson(filePath, defaultValue = {}) {
  try {
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath, "utf8"));
    }
  } catch (err) {
    console.error(`[Runner] Error reading ${path.basename(filePath)}:`, err.message);
  }
  return defaultValue;
}

async function run() {
  console.log("[Runner] Starting analyzer pipeline...");

  const rawDir = path.join(__dirname, "../data/raw");
  const dataDir = path.join(__dirname, "../data");

  // Read raw inputs
  const profile = readJson(path.join(rawDir, "github-profile.json"), {});
  const repos = readJson(path.join(rawDir, "github-repos.json"), []);
  const events = readJson(path.join(rawDir, "github-events.json"), []);

  const raw = { profile, repos, events };

  // Read backup inputs
  const backupProjects = readJson(path.join(dataDir, "projects-backup.json"), []);
  const profileBackup = readJson(path.join(dataDir, "profile-backup.json"), {});

  try {
    // 1. Run Repo Classifier
    const classifier = new RepoClassifier();
    const classifiedRepos = await classifier.analyze(raw, backupProjects);
    raw.repos = classifiedRepos; // Enrich raw repos with classifications

    // 2. Run Timeline Analyzer (Generates timeline.json and timeline-summary.json)
    const timelineAnalyzer = new TimelineAnalyzer();
    await timelineAnalyzer.analyze(raw, backupProjects);

    // 3. Run Brain Analyzer (Generates brain.json)
    const brainAnalyzer = new BrainAnalyzer();
    await brainAnalyzer.analyze(raw, backupProjects);

    // 4. Run Tech Trend Analyzer (Generates technology-trends.json)
    const techTrendAnalyzer = new TechTrendAnalyzer();
    await techTrendAnalyzer.analyze(raw, backupProjects);

    // 5. Run Achievement Analyzer (Generates achievements.json)
    const achievementAnalyzer = new AchievementAnalyzer();
    await achievementAnalyzer.analyze(raw, backupProjects, profileBackup);

    // 6. Run Workshop Analyzer (Generates workshop.json)
    const workshopAnalyzer = new WorkshopAnalyzer();
    await workshopAnalyzer.analyze(raw, backupProjects);

    // 7. Run Experiment Analyzer (Generates experiments.json and experiment-insights.json)
    const experimentAnalyzer = new ExperimentAnalyzer();
    await experimentAnalyzer.analyze(raw, backupProjects);

    // 8. Run Graveyard Analyzer (Generates graveyard.json)
    const graveyardAnalyzer = new GraveyardAnalyzer();
    await graveyardAnalyzer.analyze(raw);

    // 9. Run Skill Tree Analyzer (Generates skill-tree.json)
    const skillTreeAnalyzer = new SkillTreeAnalyzer();
    await skillTreeAnalyzer.analyze(raw, backupProjects, profileBackup);

    // 10. Run Changelog Analyzer (Generates changelog.json)
    const changelogAnalyzer = new ChangelogAnalyzer();
    await changelogAnalyzer.analyze(raw);

    // 11. Run Repo Graph Analyzer (Generates repository-map.json and galaxy.json)
    const repoGraphAnalyzer = new RepoGraphAnalyzer();
    await repoGraphAnalyzer.analyze(raw, backupProjects);

    // 12. Run Nexus Analyzer (Generates technology-map.json, interest-map.json, repository-network.json, knowledge-clusters.json)
    const nexusAnalyzer = new NexusAnalyzer();
    await nexusAnalyzer.analyze(raw, backupProjects);

    // 12. Write simple category technology config
    const categories = [
      { name: "Languages", items: ["JavaScript", "TypeScript", "Python", "C#", "C++", "HTML", "CSS", "SQL", "Dart"] },
      { name: "Frontend", items: ["React.js", "Next.js", "Tailwind CSS", "Three.js", "GSAP"] },
      { name: "Backend & ERP", items: ["Node.js", "Express.js", "PostgreSQL", "Prisma", "Odoo"] },
      { name: "Automation & Tools", items: ["n8n", "Docker", "Git/GitHub", "GitHub Actions"] }
    ];
    const wrappedTechnologies = {
      version: 1,
      generatedAt: new Date().toISOString(),
      data: { categories }
    };
    fs.writeFileSync(path.join(dataDir, "generated/technologies.json"), JSON.stringify(wrappedTechnologies, null, 2), "utf8");
    console.log("[Runner] Successfully wrote: technologies.json");

    console.log("[Runner] All analyzers completed successfully!");
  } catch (err) {
    console.error("[Runner] Pipeline crashed:", err.message);
    process.exit(1);
  }
}

run();
