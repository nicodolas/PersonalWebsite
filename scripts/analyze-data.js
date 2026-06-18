const fs = require('fs');
const path = require('path');

const rawDataPath = path.join(__dirname, '../src/data/raw-github-data.json');
const projectsBackupPath = path.join(__dirname, '../src/data/projects-backup.json');
const outputDir = path.join(__dirname, '../src/data');

function readJsonFile(filePath, defaultValue = {}) {
  try {
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    }
  } catch (err) {
    console.error(`Error reading ${filePath}:`, err.message);
  }
  return defaultValue;
}

function writeJsonFile(filePath, data) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    console.log(`[Analyzer] Generated: ${path.basename(filePath)}`);
  } catch (err) {
    console.error(`Error writing ${filePath}:`, err.message);
  }
}

function main() {
  console.log('[Analyzer] Starting data analysis...');
  
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const raw = readJsonFile(rawDataPath, null);
  if (!raw) {
    console.error('[Analyzer] Raw GitHub data not found! Please run fetch-github-data.js first.');
    process.exit(1);
  }

  const backupProjects = readJsonFile(projectsBackupPath, []);
  const repos = raw.repos || [];
  const events = raw.events || [];

  // 1. ANALYZE GALAXY GRAPH (galaxy.json)
  const galaxyNodes = [];
  const galaxyLinks = [];
  const processedRepoNames = new Set();

  // Add backup projects as nodes first to preserve their tags and data
  backupProjects.forEach(proj => {
    const id = proj.title || proj.id;
    processedRepoNames.add(id.toLowerCase());
    galaxyNodes.push({
      id,
      description: proj.description_en,
      description_vi: proj.description_vi,
      group: proj.tech[0] || 'Frontend',
      size: 15,
      tech: proj.tech,
      isBackup: true
    });
  });

  // Add GitHub repos as nodes
  repos.forEach(repo => {
    if (processedRepoNames.has(repo.name.toLowerCase())) {
      // Merge stars/forks into existing node
      const existing = galaxyNodes.find(n => n.id.toLowerCase() === repo.name.toLowerCase());
      if (existing) {
        existing.stars = repo.stargazers_count;
        existing.forks = repo.forks_count;
        existing.size = 15 + Math.min(repo.stargazers_count * 2, 20);
        existing.githubUrl = repo.html_url;
      }
      return;
    }

    const group = repo.language || 'Others';
    galaxyNodes.push({
      id: repo.name,
      description: repo.description || 'No description available.',
      description_vi: repo.description || 'Chưa có mô tả.',
      group,
      stars: repo.stargazers_count,
      forks: repo.forks_count,
      size: 10 + Math.min(repo.stargazers_count * 2, 20),
      tech: repo.language ? [repo.language] : [],
      githubUrl: repo.html_url
    });
  });

  // Create links between nodes sharing technologies or languages
  for (let i = 0; i < galaxyNodes.length; i++) {
    for (let j = i + 1; j < galaxyNodes.length; j++) {
      const nodeA = galaxyNodes[i];
      const nodeB = galaxyNodes[j];
      const sharedTech = nodeA.tech.filter(t => nodeB.tech.includes(t));
      if (sharedTech.length > 0) {
        galaxyLinks.push({
          source: nodeA.id,
          target: nodeB.id,
          label: `Both use ${sharedTech[0]}`
        });
      } else if (nodeA.group === nodeB.group) {
        galaxyLinks.push({
          source: nodeA.id,
          target: nodeB.id,
          label: `Same group: ${nodeA.group}`
        });
      }
    }
  }
  writeJsonFile(path.join(outputDir, 'galaxy.json'), { nodes: galaxyNodes, links: galaxyLinks });


  // 2. ANALYZE TIMELINE ERAS (timeline.json) - FULLY DYNAMIC FROM GITHUB
  const yearsMap = {};

  repos.forEach(repo => {
    const year = new Date(repo.created_at).getFullYear();
    if (year) {
      if (!yearsMap[year]) {
        yearsMap[year] = {
          repos: [],
          technologies: new Set(),
          totalSize: 0,
        };
      }
      yearsMap[year].repos.push(repo.name);
      if (repo.language) {
        yearsMap[year].technologies.add(repo.language);
      }
      yearsMap[year].totalSize += (repo.size || 0);
    }
  });

  backupProjects.forEach(proj => {
    const year = parseInt(proj.year, 10);
    if (year) {
      if (!yearsMap[year]) {
        yearsMap[year] = {
          repos: [],
          technologies: new Set(),
          totalSize: 0,
        };
      }
      const title = proj.title || proj.id;
      if (!yearsMap[year].repos.includes(title)) {
        yearsMap[year].repos.push(title);
      }
      proj.tech.forEach(t => yearsMap[year].technologies.add(t));
    }
  });

  const dynamicEras = Object.keys(yearsMap).map(yr => {
    const year = parseInt(yr, 10);
    const data = yearsMap[yr];
    
    // Dynamic commit estimations based on repository size & repository count
    const commits = Math.max(50, Math.floor(data.repos.length * 35 + data.totalSize / 6));

    // Structured metadata for Vietnam/English timeline eras matching his career path
    let title = "Innovation & Engineering Era";
    let title_vi = `Kỷ Nguyên Sáng Tạo & Phát Triển ${year}`;
    let description = `Focusing on software development and technology integration in ${year}.`;
    let description_vi = `Tập trung vào hoạt động phát triển phần mềm và ứng dụng công nghệ trong năm ${year}.`;

    if (year === 2023) {
      title = "Foundation & Algorithms Era";
      title_vi = "Kỷ Nguyên Nền Tảng & Giải Thuật";
      description = "Getting started with core computer science concepts, operating systems, and algorithmic thinking.";
      description_vi = "Bắt đầu hành trình với các khái niệm cốt lõi của khoa học máy tính, hệ điều hành và tư duy giải thuật.";
    } else if (year === 2024) {
      title = "Web Engineering & Scripting Era";
      title_vi = "Kỷ Nguyên Kỹ Nghệ Web & Scripting";
      description = "Transitioning to web environments, building front-end templates, and exploring game scripting languages.";
      description_vi = "Chuyển dịch sang môi trường web, xây dựng các giao diện mẫu và khám phá ngôn ngữ lập trình kịch bản game.";
    } else if (year === 2025) {
      title = "Full-Stack, IoT & AI Integration Era";
      title_vi = "Kỷ Nguyên Full-Stack, IoT & Tích Hợp AI";
      description = "Developing comprehensive web applications, integrating IoT security systems, and deploying machine learning/AI models.";
      description_vi = "Phát triển các ứng dụng web toàn diện, tích hợp hệ thống bảo mật IoT và triển khai các mô hình học máy/AI.";
    } else if (year === 2026) {
      title = "Agentic AI & Advanced Systems Era";
      title_vi = "Kỷ Nguyên AI Tác Nhân & Hệ Thống Cao Cấp";
      description = "Mastering advanced web engineering, workflow automation, and agentic systems built with Next.js 15/16 and n8n.";
      description_vi = "Làm chủ kỹ nghệ web nâng cao, tự động hóa quy trình và hệ thống AI tác nhân sử dụng Next.js 15/16 và n8n.";
    }

    return {
      year,
      title,
      title_vi,
      description,
      description_vi,
      commits,
      technologies: Array.from(data.technologies),
      repos: data.repos
    };
  }).sort((a, b) => b.year - a.year);

  writeJsonFile(path.join(outputDir, 'timeline.json'), { eras: dynamicEras });


  // 3. ANALYZE DEVELOPER DNA (dna.json)
  const languageCounts = {};
  let totalReposCount = repos.length || 1;
  let builderScore = 80;
  let automatorScore = 75;
  let researcherScore = 70;
  let designerScore = 60;

  repos.forEach(repo => {
    if (repo.language) {
      languageCounts[repo.language] = (languageCounts[repo.language] || 0) + 1;
    }
    const topics = repo.topics || [];
    topics.forEach(topic => {
      const t = topic.toLowerCase();
      if (['automation', 'n8n', 'workflow', 'ci', 'cd', 'actions', 'docker'].some(k => t.includes(k))) {
        automatorScore += 3;
      }
      if (['react', 'next', 'express', 'node', 'laravel', 'sql', 'postgres', 'db'].some(k => t.includes(k))) {
        builderScore += 2;
      }
      if (['ai', 'agent', 'rag', 'llm', 'nlp', 'research', 'learning'].some(k => t.includes(k))) {
        researcherScore += 3;
      }
      if (['css', 'design', 'ui', 'ux', 'gsap', 'animation', 'three', 'motion'].some(k => t.includes(k))) {
        designerScore += 4;
      }
    });
  });

  // Include backup projects tech stack in DNA calculations
  backupProjects.forEach(proj => {
    proj.tech.forEach(tech => {
      const t = tech.toLowerCase();
      languageCounts[tech] = (languageCounts[tech] || 0) + 2;
      if (['next', 'react', 'node', 'express', 'postgresql', 'prisma'].some(k => t.includes(k))) {
        builderScore += 4;
      }
      if (['n8n', 'etl', 'pipeline'].some(k => t.includes(k))) {
        automatorScore += 5;
      }
      if (['ai', 'prediction'].some(k => t.includes(k))) {
        researcherScore += 4;
      }
      if (['three', 'r3f', 'design', 'ui'].some(k => t.includes(k))) {
        designerScore += 5;
      }
    });
  });

  // Normalize scores to max 98
  const traits = [
    { name: "Builder", score: Math.min(98, builderScore) },
    { name: "Automator", score: Math.min(98, automatorScore) },
    { name: "Researcher", score: Math.min(98, researcherScore) },
    { name: "Designer", score: Math.min(98, designerScore) }
  ];

  // Favorite languages sorted
  const favoriteLanguages = Object.keys(languageCounts).sort((a, b) => languageCounts[b] - languageCounts[a]).slice(0, 5);

  writeJsonFile(path.join(outputDir, 'dna.json'), {
    traits,
    favorite_languages: favoriteLanguages.length > 0 ? favoriteLanguages : ["JavaScript", "TypeScript", "Python", "SQL"],
    most_active_hour: "02:00 AM (UTC)",
    favorite_topic: "Agentic Workflows"
  });


  // 4. ANALYZE ACHIEVEMENTS (achievements.json) - DYNAMIC FROM REPOS & PROFILE
  const profileBackupPath = path.join(__dirname, '../src/data/profile-backup.json');
  const profileData = readJsonFile(profileBackupPath, {});

  let firstRepoDate = "2023-12-18";
  let firstRepoName = "RR";
  if (repos.length > 0) {
    const sortedRepos = [...repos].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    firstRepoDate = sortedRepos[0].created_at.split('T')[0];
    firstRepoName = sortedRepos[0].name;
  }

  const achievements = [
    { 
      title: "First Repository", 
      title_vi: "Kho Lưu Trữ Đầu Tiên", 
      date: firstRepoDate, 
      icon: "🎉", 
      desc: `Created first repository (${firstRepoName}) on GitHub`, 
      desc_vi: `Khởi tạo repo đầu tiên (${firstRepoName}) trên GitHub` 
    }
  ];

  if (profileData.certificates && Array.isArray(profileData.certificates)) {
    profileData.certificates.forEach(cert => {
      let date = "2024-08-15";
      let icon = "🤖";
      if (cert.name.toLowerCase().includes("english") || cert.name.toLowerCase().includes("cefr")) {
        date = "2025-06-01";
        icon = "🎓";
      }
      achievements.push({
        title: cert.name,
        title_vi: cert.name,
        date: date,
        icon: icon,
        desc: `Earned certification: ${cert.name}`,
        desc_vi: `Đạt chứng nhận: ${cert.name}`,
        url: cert.url
      });
    });
  }

  achievements.push(
    { title: "1000 Commits Milestone", title_vi: "Cột Mốc 1000 Commits", date: "2025-05-01", icon: "🚀", desc: "Pushed over 1,000 commits across repositories", desc_vi: "Đẩy hơn 1,000 commits trên toàn hệ thống" },
    { title: "3D Graphics Integration", title_vi: "Tích Hợp Đồ Họa 3D", date: "2025-10-12", icon: "🔮", desc: "Successfully integrated Three.js/R3F in a live web portfolio", desc_vi: "Tích hợp thành công Three.js/R3F vào portfolio web thực tế" }
  );

  // Add dynamically based on stars/repos
  const starCount = repos.reduce((sum, r) => sum + r.stargazers_count, 0);
  if (starCount > 0) {
    achievements.push({
      title: "Stargazer Target",
      title_vi: "Điểm Sáng Vũ Trụ",
      date: new Date().toISOString().split('T')[0],
      icon: "⭐",
      desc: `Earned stars from the community (Total: ${starCount})`,
      desc_vi: `Đạt được ngôi sao từ cộng đồng (Tổng cộng: ${starCount})`
    });
  }
  if (repos.length >= 10) {
    achievements.push({
      title: "Repository Collector",
      title_vi: "Bộ Sưu Tập Đồ Đồ Đồ",
      date: new Date().toISOString().split('T')[0],
      icon: "📦",
      desc: "Created more than 10 repositories on GitHub",
      desc_vi: "Xây dựng hơn 10 dự án mã nguồn trên GitHub"
    });
  }

  writeJsonFile(path.join(outputDir, 'achievements.json'), { achievements });


  // 5. ANALYZE CHANGELOG (changelog.json)
  const monthlyChanges = {};
  
  // Extract commits from events history if available
  events.forEach(event => {
    if (event.type === 'PushEvent' && event.payload && event.payload.commits) {
      const date = new Date(event.created_at);
      const monthStr = date.toLocaleString('en-US', { month: 'long', year: 'numeric' });
      const monthStrVi = date.toLocaleString('vi-VN', { month: 'long', year: 'numeric' });
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!monthlyChanges[key]) {
        monthlyChanges[key] = {
          date: key + "-01",
          monthName: monthStr,
          monthNameVi: monthStrVi,
          notes: []
        };
      }
      
      event.payload.commits.forEach(commit => {
        const msg = commit.message.split('\n')[0];
        // Clean messages and format
        if (msg.toLowerCase().startsWith('feat') || msg.toLowerCase().startsWith('fix') || msg.toLowerCase().startsWith('docs')) {
          monthlyChanges[key].notes.push(`+ ${msg}`);
        }
      });
    }
  });

  // Convert to array and sort
  let releases = Object.keys(monthlyChanges).map(k => ({
    version: `v${k.replace('-', '.')}`,
    date: monthlyChanges[k].date,
    monthName: monthlyChanges[k].monthName,
    monthNameVi: monthlyChanges[k].monthNameVi,
    notes: [...new Set(monthlyChanges[k].notes)].slice(0, 5) // unique and capped at 5
  })).sort((a, b) => b.date.localeCompare(a.date));

  // Fallback releases if empty
  if (releases.length === 0) {
    releases = [
      {
        version: "v2026.06",
        date: "2026-06-01",
        monthName: "June 2026",
        monthNameVi: "Tháng 6 năm 2026",
        notes: [
          "+ Refactored personal portfolio to Next.js 15 and GSAP",
          "+ Configured automated GitHub Actions workflows for data fetching",
          "+ Integrated dynamic project galaxy and terminal commands"
        ]
      },
      {
        version: "v2026.05",
        date: "2026-05-01",
        monthName: "May 2026",
        monthNameVi: "Tháng 5 năm 2026",
        notes: [
          "+ Researched AI agent tools and Model Context Protocol (MCP)",
          "+ Updated n8n integration schemas for ReviewLecturers_HUIT"
        ]
      }
    ];
  }

  writeJsonFile(path.join(outputDir, 'changelog.json'), { releases });
  console.log('[Analyzer] Data analysis completed successfully!');
}

main();
