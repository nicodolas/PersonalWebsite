#!/usr/bin/env node
/**
 * update-github-descriptions.js
 * Updates GitHub repository descriptions for public repos that have none.
 * Usage: node scripts/update-github-descriptions.js
 */

const fs = require("fs");
const path = require("path");

// Parse .env manually (no dotenv dependency needed)
function loadEnv(envPath) {
  try {
    const content = fs.readFileSync(envPath, "utf8");
    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eqIdx = trimmed.indexOf("=");
      if (eqIdx === -1) continue;
      const key = trimmed.slice(0, eqIdx).trim();
      const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, "");
      if (!process.env[key]) process.env[key] = val;
    }
  } catch {}
}

loadEnv(path.join(__dirname, "../.env"));

const GH_TOKEN = process.env.GH_TOKEN;
const GITHUB_USERNAME = "nicodolas";

if (!GH_TOKEN) {
  console.error("❌ GH_TOKEN not found in .env");
  process.exit(1);
}

// Curated descriptions for repos that need them
const DESCRIPTIONS = {
  "ai-smoke-detect": "Real-time smoke detection system using AI/ML models with a React frontend for live camera feed analysis.",
  "frontend-milk-tea": "TypeScript frontend for the Milk-Tea Web Shop — built with Next.js, featuring cart, checkout, and product catalog.",
  "myroom": "Interactive personal room visualization project — JavaScript-based 3D room scene with customizable furniture layout.",
  "Bigdata": "Big Data processing and analytics experiments using Python, Pandas, and data visualization libraries.",
  "Demo-Cipher-O": "Cryptography demonstration project — visualizes classic cipher algorithms (Caesar, Vigenère, RSA) step by step.",
  "FE-Smoke-AI-React": "React-based frontend for the AI smoke detection system — real-time dashboard with alert notifications.",
  "Demo-Cipher": "Group project implementing classic and modern cipher algorithms with an interactive HTML/JS interface.",
  "IoTKhoaBaoMat": "IoT-based smart security lock system — HTML/JS interface for remote door control and access logging.",
  "dongcuuanhoa": "E-commerce website for a flower shop — online catalog with cart and order management built in HTML/CSS/JS.",
  "Watchshopmanager": "C# WinForms application for managing a watch shop — inventory, sales records, and customer management.",
  "ChatBot_NiFi": "NiFi-powered chatbot prototype — event-driven message routing with a JavaScript frontend interface.",
  "MobileWatchShop": "Cross-platform mobile app for a watch shop — built with Flutter/Dart for Android and iOS.",
  "Kmeans_AdvisoryMajor": "Python academic advisory tool using K-Means clustering to recommend suitable university majors for students.",
  "flowershop": "Node.js/Handlebars flower shop web application with product listing, cart functionality, and order processing.",
  "Bookstoremanagement": "C# WinForms bookstore management system — handles inventory, sales, suppliers, and reporting.",
  "Valk_Hub": "Lua-based utility hub — a collection of scripts and tools for game automation and system utilities.",
  "flower_shop": "HTML/CSS/JS static flower shop landing page with product gallery and contact form.",
  "SJF": "C++ implementation of the Shortest Job First (SJF) CPU scheduling algorithm with simulation output.",
  "RR": "C++ implementation of the Round Robin (RR) CPU scheduling algorithm with configurable time quantum.",
  "Claw-OMX-9Router-AI": "AI-powered network router configuration tool — automates OMX-9 router setup and optimization via intelligent agents.",
  "nicodolas": "GitHub profile README — personal introduction, tech stack, stats, and project highlights for @nicodolas.",
};

async function getRepos() {
  const res = await fetch(`https://api.github.com/users/${GITHUB_USERNAME}/repos?per_page=100&type=public`, {
    headers: {
      Authorization: `Bearer ${GH_TOKEN}`,
      Accept: "application/vnd.github+json",
    },
  });
  if (!res.ok) throw new Error(`Failed to fetch repos: ${res.status} ${await res.text()}`);
  return res.json();
}

async function updateDescription(repoName, description) {
  const res = await fetch(`https://api.github.com/repos/${GITHUB_USERNAME}/${repoName}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${GH_TOKEN}`,
      Accept: "application/vnd.github+json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ description }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Failed to update ${repoName}: ${res.status} ${err}`);
  }
  return res.json();
}

async function main() {
  console.log("🚀 Fetching public repos for @" + GITHUB_USERNAME + "...\n");
  
  const repos = await getRepos();
  console.log(`Found ${repos.length} public repos.\n`);

  let updated = 0;
  let skipped = 0;
  let failed = 0;

  for (const repo of repos) {
    const newDesc = DESCRIPTIONS[repo.name];
    
    if (!newDesc) {
      // No curated description for this repo
      if (!repo.description) {
        console.log(`⚠️  ${repo.name} — no curated description, skipping`);
      } else {
        console.log(`✅ ${repo.name} — already has description, skipping`);
      }
      skipped++;
      continue;
    }

    if (repo.description === newDesc) {
      console.log(`✅ ${repo.name} — already up to date`);
      skipped++;
      continue;
    }

    try {
      await updateDescription(repo.name, newDesc);
      console.log(`📝 ${repo.name} — updated: "${newDesc.substring(0, 60)}..."`);
      updated++;
      // Rate limit: 1 request per second to be safe
      await new Promise(r => setTimeout(r, 1000));
    } catch (err) {
      console.error(`❌ ${repo.name} — ${err.message}`);
      failed++;
    }
  }

  console.log(`\n✨ Done! Updated: ${updated} | Skipped: ${skipped} | Failed: ${failed}`);
}

main().catch(err => {
  console.error("Fatal error:", err);
  process.exit(1);
});
