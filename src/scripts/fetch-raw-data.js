// src/scripts/fetch-raw-data.js
const fs = require("fs");
const path = require("path");

// Load .env locally if present
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

const GITHUB_USERNAME = "nicodolas";
let GH_TOKEN = process.env.GH_TOKEN;

// Prefix check for token
if (GH_TOKEN) {
  const trimmed = GH_TOKEN.trim();
  if (trimmed.startsWith("ghp_") || trimmed.startsWith("github_pat_")) {
    GH_TOKEN = trimmed;
  } else {
    GH_TOKEN = null;
  }
}

async function githubFetch(url) {
  const headers = {
    "User-Agent": "Neko-Workshop-Data-Pipeline",
  };
  if (GH_TOKEN) {
    headers["Authorization"] = `token ${GH_TOKEN}`;
  }

  let response = await fetch(url, { headers });
  if (response.status === 401 && GH_TOKEN) {
    console.warn(`[Pipeline] GH_TOKEN unauthorized (401) for URL: ${url}. Retrying unauthenticated...`);
    const cleanHeaders = { "User-Agent": "Neko-Workshop-Data-Pipeline" };
    response = await fetch(url, { headers: cleanHeaders });
  }

  if (!response.ok) {
    throw new Error(`GitHub API Error: ${response.status} ${response.statusText} for URL: ${url}`);
  }
  return response.json();
}

async function main() {
  console.log(`[Pipeline] Fetching raw GitHub data for user: ${GITHUB_USERNAME}...`);
  const rawDir = path.join(__dirname, "../data/raw");

  if (!fs.existsSync(rawDir)) {
    fs.mkdirSync(rawDir, { recursive: true });
  }

  try {
    // 1. Fetch Profile
    console.log("[Pipeline] Fetching profile...");
    const profile = await githubFetch(`https://api.github.com/users/${GITHUB_USERNAME}`);
    fs.writeFileSync(path.join(rawDir, "github-profile.json"), JSON.stringify(profile, null, 2), "utf8");

    // 2. Fetch Repositories
    console.log("[Pipeline] Fetching repositories...");
    const repos = await githubFetch(`https://api.github.com/users/${GITHUB_USERNAME}/repos?per_page=100&sort=updated`);
    fs.writeFileSync(path.join(rawDir, "github-repos.json"), JSON.stringify(repos, null, 2), "utf8");

    // 3. Fetch Events
    console.log("[Pipeline] Fetching public activity events...");
    let events = [];
    try {
      events = await githubFetch(`https://api.github.com/users/${GITHUB_USERNAME}/events?per_page=100`);
    } catch (err) {
      console.warn("[Pipeline] Warning: Could not fetch events, using empty list.", err.message);
    }
    fs.writeFileSync(path.join(rawDir, "github-events.json"), JSON.stringify(events, null, 2), "utf8");

    console.log("[Pipeline] Success! Saved raw data to src/data/raw/");
  } catch (error) {
    console.error("[Pipeline] Critical Error during fetch:", error.message);
    
    if (process.env.GITHUB_ACTIONS === "true") {
      console.error("[Pipeline] Running in CI/CD. Crashing process to prevent stale/degraded data deployment.");
      process.exit(1);
    }
    
    // Check if files exist, otherwise write fallback placeholders
    const profilePath = path.join(rawDir, "github-profile.json");
    if (!fs.existsSync(profilePath)) {
      console.log("[Pipeline] Writing fallback raw templates...");
      fs.writeFileSync(profilePath, JSON.stringify({ login: GITHUB_USERNAME, name: "Nguyen Van Hieu", bio: "Developer" }, null, 2), "utf8");
      fs.writeFileSync(path.join(rawDir, "github-repos.json"), JSON.stringify([], null, 2), "utf8");
      fs.writeFileSync(path.join(rawDir, "github-events.json"), JSON.stringify([], null, 2), "utf8");
    }
  }
}

main();
