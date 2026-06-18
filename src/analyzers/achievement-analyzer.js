// src/analyzers/achievement-analyzer.js
const { BaseAnalyzer } = require("./base-analyzer");
const path = require("path");

class AchievementAnalyzer extends BaseAnalyzer {
  constructor() {
    super("Achievement Analyzer", "achievements.json");
  }

  async analyze(raw, backupProjects, profileBackup) {
    const repos = raw.repos || [];
    
    // Dynamic determination of the first repository
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

    // Load certificates dynamically from profile backup
    if (profileBackup && profileBackup.certificates && Array.isArray(profileBackup.certificates)) {
      profileBackup.certificates.forEach(cert => {
        let date = "2024-08-15"; // fallback
        let icon = "🤖";
        if (cert.name.toLowerCase().includes("english") || cert.name.toLowerCase().includes("cefr")) {
          date = "2025-06-01";
          icon = "🎓";
        }
        achievements.push({
          title: cert.name,
          title_vi: cert.name,
          date,
          icon,
          desc: `Earned certification: ${cert.name}`,
          desc_vi: `Đạt chứng nhận: ${cert.name}`,
          url: cert.url
        });
      });
    }

    // Commits milestone
    achievements.push(
      {
        title: "1000 Commits Milestone",
        title_vi: "Cột Mốc 1000 Commits",
        date: "2025-05-01",
        icon: "🚀",
        desc: "Pushed over 1,000 commits across repositories",
        desc_vi: "Đẩy hơn 1,000 commits trên toàn hệ thống"
      },
      {
        title: "3D Graphics Integration",
        title_vi: "Tích Hợp Đồ Họa 3D",
        date: "2025-10-12",
        icon: "🔮",
        desc: "Successfully integrated Three.js/R3F in a live web portfolio",
        desc_vi: "Tích hợp thành công Three.js/R3F vào portfolio web thực tế"
      }
    );

    // Stargazer Target (stars count)
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

    // Repository Collector
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

    this.writeJson({ achievements });
    return achievements;
  }
}

module.exports = { AchievementAnalyzer };
