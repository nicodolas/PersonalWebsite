// src/analyzers/timeline-analyzer.js
const { BaseAnalyzer } = require("./base-analyzer");
const { SYSTEM_PROMPTS, PROMPT_TEMPLATES } = require("../lib/ai/prompts");
const fs = require("fs");
const path = require("path");

class TimelineAnalyzer extends BaseAnalyzer {
  constructor() {
    super("Timeline Analyzer", "timeline.json");
  }

  async analyze(raw, backupProjects) {
    const repos = raw.repos || [];
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

    // 1. Process Timeline Eras
    const eras = [];
    const activeYears = Object.keys(yearsMap).map(Number).sort((a, b) => b - a);

    for (const year of activeYears) {
      const data = yearsMap[year];
      const commits = Math.max(50, Math.floor(data.repos.length * 35 + data.totalSize / 6));
      const techList = Array.from(data.technologies);

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

      // Fetch AI summary if OpenRouter API is set up, otherwise use defaults
      let aiSummary = { summary_en: description, summary_vi: description_vi };
      if (process.env.OPENROUTER_API_KEY) {
        const prompt = PROMPT_TEMPLATES.TIMELINE_ERA(year, data.repos, techList);
        try {
          const aiResponse = await this.askAI(prompt, SYSTEM_PROMPTS.TIMELINE, `${year}-${techList.join(",")}`);
          const parsed = this.parseJsonFromAI(aiResponse);
          if (parsed.summary_en && parsed.summary_vi) {
            aiSummary = { summary_en: parsed.summary_en, summary_vi: parsed.summary_vi };
          }
        } catch (err) {
          console.warn(`[TimelineAnalyzer] AI generation failed for year ${year}, using static templates.`, err.message);
        }
      }

      eras.push({
        year,
        title,
        title_vi,
        description: aiSummary.summary_en,
        description_vi: aiSummary.summary_vi,
        commits,
        technologies: techList,
        repos: data.repos
      });
    }

    // Write primary timeline.json
    this.writeJson({ eras });

    // 2. Process & write timeline-summary.json
    const totalCommits = eras.reduce((sum, e) => sum + e.commits, 0);
    const totalRepos = repos.length + backupProjects.length;
    let aiSummaryText = "A journey of constant technical growth and open-source experiments.";
    let aiSummaryTextVi = "Hành trình phát triển kỹ thuật liên tục và thử nghiệm nguồn mở.";

    if (process.env.OPENROUTER_API_KEY) {
      const summaryPrompt = `
Synthesize the developer's journey across these active eras:
${JSON.stringify(eras.map(e => ({ year: e.year, title: e.title, tech: e.technologies })))}
Write a single high-level summary paragraph describing the developer's technical trajectory.
Output strictly JSON:
{
  "summary_en": "Paragraph in English",
  "summary_vi": "Paragraph in Vietnamese"
}
`;
      try {
        const response = await this.askAI(summaryPrompt, SYSTEM_PROMPTS.TIMELINE, `journey-summary-${totalRepos}`);
        const parsed = this.parseJsonFromAI(response);
        if (parsed.summary_en && parsed.summary_vi) {
          aiSummaryText = parsed.summary_en;
          aiSummaryTextVi = parsed.summary_vi;
        }
      } catch (err) {
        // fallback
      }
    }

    const summaryData = {
      total_commits: totalCommits,
      total_repos: totalRepos,
      active_years: activeYears.length,
      ai_summary: aiSummaryText,
      ai_summary_vi: aiSummaryTextVi
    };

    const summaryPath = path.join(__dirname, "../data/generated/timeline-summary.json");
    const wrappedSummary = {
      version: 1,
      generatedAt: new Date().toISOString(),
      data: summaryData
    };
    fs.writeFileSync(summaryPath, JSON.stringify(wrappedSummary, null, 2), "utf8");
    console.log("[TimelineAnalyzer] Successfully wrote: timeline-summary.json");

    return { eras, summary: summaryData };
  }
}

module.exports = { TimelineAnalyzer };
