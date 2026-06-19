const fs = require('fs');
const path = require('path');

// Simple local .env parser
function loadEnv() {
  const envPath = path.join(__dirname, '../.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split(/\r?\n/).forEach(line => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) return;
      const index = trimmed.indexOf('=');
      if (index > 0) {
        const key = trimmed.substring(0, index).trim();
        const value = trimmed.substring(index + 1).trim();
        process.env[key] = value;
      }
    });
  }
}

loadEnv();

const GITHUB_USERNAME = 'nicodolas';
let GH_TOKEN = process.env.GH_TOKEN;
if (GH_TOKEN) {
  const trimmed = GH_TOKEN.trim();
  if (trimmed.startsWith('ghp_') || trimmed.startsWith('github_pat_')) {
    GH_TOKEN = trimmed;
  } else {
    GH_TOKEN = null;
  }
}

async function githubFetch(url) {
  const headers = {
    'User-Agent': 'Neko-Workshop-Data-Pipeline',
  };
  if (GH_TOKEN) {
    headers['Authorization'] = `token ${GH_TOKEN}`;
  }

  let response = await fetch(url, { headers });
  if (response.status === 401 && GH_TOKEN) {
    console.warn(`[Pipeline] Token unauthorized (401) for URL: ${url}. Retrying without token...`);
    const cleanHeaders = { 'User-Agent': 'Neko-Workshop-Data-Pipeline' };
    response = await fetch(url, { headers: cleanHeaders });
  }

  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.status} ${response.statusText} for URL: ${url}`);
  }
  return response.json();
}

async function main() {
  console.log(`[Pipeline] Starting data fetch for GitHub user: ${GITHUB_USERNAME}...`);
  const dataDir = path.join(__dirname, '../src/data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  try {
    // 1. Fetch User Profile
    console.log('[Pipeline] Fetching profile...');
    const profile = await githubFetch(`https://api.github.com/users/${GITHUB_USERNAME}`);

    // 2. Fetch Repositories (up to 100)
    console.log('[Pipeline] Fetching repositories...');
    const repos = await githubFetch(`https://api.github.com/users/${GITHUB_USERNAME}/repos?per_page=100&sort=updated`);

    // 3. Fetch Recent Public Events
    console.log('[Pipeline] Fetching user activity events...');
    let events = [];
    try {
      events = await githubFetch(`https://api.github.com/users/${GITHUB_USERNAME}/events?per_page=100`);
    } catch (err) {
      console.warn('[Pipeline] Warning: Could not fetch user events, falling back to empty list.', err.message);
    }

    const rawData = {
      profile,
      repos,
      events,
      fetchedAt: new Date().toISOString()
    };

    const rawDataPath = path.join(dataDir, 'raw-github-data.json');
    fs.writeFileSync(rawDataPath, JSON.stringify(rawData, null, 2), 'utf8');
    console.log(`[Pipeline] Success! Saved raw data to ${rawDataPath}`);
  } catch (error) {
    console.error('[Pipeline] Error fetching data from GitHub:', error.message);
    
    // Check if we already have raw-github-data.json, keep it as fallback
    const rawDataPath = path.join(dataDir, 'raw-github-data.json');
    if (fs.existsSync(rawDataPath)) {
      console.log('[Pipeline] Using existing raw-github-data.json as fallback.');
      return;
    }

    // Otherwise write empty fallback data
    console.log('[Pipeline] Writing mock/empty fallback data...');
    const fallbackData = {
      profile: {
        login: GITHUB_USERNAME,
        name: "Nguyen Van Hieu",
        bio: "Developer",
        public_repos: 4,
        followers: 10,
        following: 10
      },
      repos: [],
      events: [],
      fetchedAt: new Date().toISOString(),
      isFallback: true
    };
    fs.writeFileSync(rawDataPath, JSON.stringify(fallbackData, null, 2), 'utf8');
  }
}

main();
