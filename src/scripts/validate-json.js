// src/scripts/validate-json.js
const fs = require("fs");
const path = require("path");

const generatedDir = path.join(__dirname, "../data/generated");

const requiredFiles = [
  "timeline.json",
  "brain.json",
  "workshop.json",
  "achievements.json",
  "skill-tree.json",
  "experiments.json",
  "graveyard.json",
  "technologies.json",
  "changelog.json",
  "repository-map.json",
  "timeline-summary.json",
  "experiment-insights.json",
  "technology-trends.json",
  "galaxy.json", // compatibility mapping
  "technology-map.json",
  "interest-map.json",
  "repository-network.json",
  "knowledge-clusters.json"
];

function validate() {
  console.log("[Validation] Validating generated JSON schemas...");
  let errors = 0;

  requiredFiles.forEach(fileName => {
    const filePath = path.join(generatedDir, fileName);
    if (!fs.existsSync(filePath)) {
      console.error(`❌ [Validation] Missing required file: ${fileName}`);
      errors++;
      return;
    }

    try {
      const content = JSON.parse(fs.readFileSync(filePath, "utf8"));
      
      // Enforce JSON contract
      if (typeof content.version !== "number" || !content.generatedAt || !content.data) {
        console.error(`❌ [Validation] ${fileName} does not conform to JSON contract (version, generatedAt, data fields).`);
        errors++;
        return;
      }

      const data = content.data;
      
      // Basic sanity assertions per file type on nested data
      if (fileName === "timeline.json" && !Array.isArray(data.eras)) {
        console.error(`❌ [Validation] timeline.json should contain an "eras" array inside "data".`);
        errors++;
      } else if (fileName === "brain.json" && (!data.current_focus || !Array.isArray(data.interests))) {
        console.error(`❌ [Validation] brain.json schema is invalid inside "data".`);
        errors++;
      } else if (fileName === "workshop.json" && !Array.isArray(data.projects)) {
        console.error(`❌ [Validation] workshop.json should contain a "projects" array inside "data".`);
        errors++;
      } else if (fileName === "achievements.json" && !Array.isArray(data.achievements)) {
        console.error(`❌ [Validation] achievements.json should contain an "achievements" array inside "data".`);
        errors++;
      } else if (fileName === "skill-tree.json" && !Array.isArray(data.trees)) {
        console.error(`❌ [Validation] skill-tree.json should contain a "trees" array inside "data".`);
        errors++;
      } else if (fileName === "experiments.json" && !Array.isArray(data.experiments)) {
        console.error(`❌ [Validation] experiments.json should contain an "experiments" array inside "data".`);
        errors++;
      } else if (fileName === "graveyard.json" && !Array.isArray(data.projects)) {
        console.error(`❌ [Validation] graveyard.json should contain a "projects" array inside "data".`);
        errors++;
      } else if (fileName === "changelog.json" && !Array.isArray(data.releases)) {
        console.error(`❌ [Validation] changelog.json should contain a "releases" array inside "data".`);
        errors++;
      } else if (fileName === "repository-map.json" && (!Array.isArray(data.nodes) || !Array.isArray(data.links))) {
        console.error(`❌ [Validation] repository-map.json must contain "nodes" and "links" arrays inside "data".`);
        errors++;
      } else if (fileName === "technology-map.json" && (!Array.isArray(data.nodes) || !Array.isArray(data.links) || !data.insights)) {
        console.error(`❌ [Validation] technology-map.json must contain "nodes", "links", and "insights" inside "data".`);
        errors++;
      } else if (fileName === "interest-map.json" && (!Array.isArray(data.nodes) || !Array.isArray(data.links))) {
        console.error(`❌ [Validation] interest-map.json must contain "nodes" and "links" inside "data".`);
        errors++;
      } else if (fileName === "repository-network.json" && (!Array.isArray(data.nodes) || !Array.isArray(data.links))) {
        console.error(`❌ [Validation] repository-network.json must contain "nodes" and "links" inside "data".`);
        errors++;
      } else if (fileName === "knowledge-clusters.json" && !Array.isArray(data.clusters)) {
        console.error(`❌ [Validation] knowledge-clusters.json must contain a "clusters" array inside "data".`);
        errors++;
      } else {
        console.log(`✅ [Validation] ${fileName} format and contract parsed successfully.`);
      }
    } catch (err) {
      console.error(`❌ [Validation] Error parsing ${fileName}:`, err.message);
      errors++;
    }
  });

  if (errors > 0) {
    console.error(`\n❌ [Validation] Failed with ${errors} schema errors.`);
    process.exit(1);
  } else {
    console.log("\n🎉 [Validation] All JSON schemas validated successfully!");
  }
}

validate();
