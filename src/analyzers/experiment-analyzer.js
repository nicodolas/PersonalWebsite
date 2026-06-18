// src/analyzers/experiment-analyzer.js
const { BaseAnalyzer } = require("./base-analyzer");
const { SYSTEM_PROMPTS, PROMPT_TEMPLATES } = require("../lib/ai/prompts");
const fs = require("fs");
const path = require("path");

class ExperimentAnalyzer extends BaseAnalyzer {
  constructor() {
    super("Experiment Analyzer", "experiments.json");
  }

  async analyze(raw, backupProjects) {
    const repos = raw.repos || [];
    const experiments = [];

    // Map backup projects to experiment objects
    backupProjects.forEach(proj => {
      const id = proj.id;
      let status = "success";
      
      experiments.push({
        id,
        name: proj.title,
        problem: proj.description_en,
        problem_vi: proj.description_vi,
        approach: `Built using ${proj.tech.slice(0, 4).join(", ")}.`,
        approach_vi: `Xây dựng bằng ${proj.tech.slice(0, 4).join(", ")}.`,
        outcome: `Successfully deployed and online at: ${proj.links.demo}`,
        outcome_vi: `Triển khai thành công trực tuyến tại: ${proj.links.demo}`,
        lessons_learned: proj.highlights_en || [
          "Gained experience with full-stack frameworks",
          "Improved database schemas design"
        ],
        lessons_learned_vi: proj.highlights_vi || [
          "Tích lũy kinh nghiệm thiết kế full-stack",
          "Tối ưu hóa thiết kế cơ sở dữ liệu"
        ],
        status
      });
    });

    // Add selected experimental repos from GitHub
    const targetExperimentalRepos = repos.filter(repo => {
      const name = repo.name.toLowerCase();
      return ["ai-smoke-detect", "kmeans", "ziwei", "nifi", "chatbot", "myroom", "security"].some(k => name.includes(k))
        && !experiments.some(e => e.id.toLowerCase() === repo.name.toLowerCase());
    });

    for (const repo of targetExperimentalRepos) {
      let problem = `Need to explore ${repo.name} development.`;
      let problem_vi = `Nhu cầu thử nghiệm phát triển ${repo.name}.`;
      let approach = `Creating a workspace using ${repo.language || "code"}.`;
      let approach_vi = `Khởi tạo không gian phát triển sử dụng ${repo.language || "mã nguồn"}.`;
      let outcome = "Repository created and pushed to GitHub.";
      let outcome_vi = "Kho lưu trữ đã được khởi tạo và đẩy lên GitHub.";
      let lessons_learned = ["Explored development environment setup", "Practiced version control workflows"];
      let lessons_learned_vi = ["Tìm hiểu thiết lập môi trường phát triển", "Thực hành quy trình quản lý phiên bản"];
      let status = "success";

      if (repo.name.toLowerCase().includes("failed") || repo.name.toLowerCase().includes("test-abandoned")) {
        status = "failed";
      } else if (new Date() - new Date(repo.updated_at) < (30 * 24 * 60 * 60 * 1000)) {
        status = "active";
      }

      // Query AI if available to extract richer problem/approach/outcome
      if (process.env.OPENROUTER_API_KEY) {
        const langList = repo.language ? [repo.language] : [];
        const prompt = PROMPT_TEMPLATES.EXPERIMENT_DETAILS(repo.name, repo.description, langList, repo.topics || []);
        try {
          const aiResponse = await this.askAI(prompt, SYSTEM_PROMPTS.EXPERIMENT, `${repo.name}-${repo.description}`);
          const parsed = this.parseJsonFromAI(aiResponse);
          if (parsed.problem_en) {
            problem = parsed.problem_en;
            problem_vi = parsed.problem_vi;
            approach = parsed.approach_en;
            approach_vi = parsed.approach_vi;
            outcome = parsed.outcome_en;
            outcome_vi = parsed.outcome_vi;
            lessons_learned = parsed.lessons_en;
            lessons_learned_vi = parsed.lessons_vi;
          }
        } catch (err) {
          // fallback to defaults
        }
      }

      experiments.push({
        id: repo.name,
        name: repo.name,
        problem,
        problem_vi,
        approach,
        approach_vi,
        outcome,
        outcome_vi,
        lessons_learned,
        lessons_learned_vi,
        status
      });
    }

    // Write primary experiments.json
    this.writeJson({ experiments });

    // Calculate insights and write to experiment-insights.json
    const totalExps = experiments.length || 1;
    const successExps = experiments.filter(e => e.status === "success").length;
    const successRate = parseFloat(((successExps / totalExps) * 100).toFixed(1));

    const allLessons = [];
    const allLessonsVi = [];
    experiments.forEach(e => {
      e.lessons_learned.forEach(l => allLessons.push(l));
      e.lessons_learned_vi.forEach(l => allLessonsVi.push(l));
    });

    let aiInsights = "Experiments show strong capabilities in Next.js, full-stack, n8n automation, and AI integrations.";
    let aiInsightsVi = "Các bài thử nghiệm cho thấy thế mạnh trong lập trình Next.js, full-stack, tự động hóa n8n và tích hợp AI.";

    if (process.env.OPENROUTER_API_KEY && experiments.length > 0) {
      const summaryPrompt = `
Analyze the developer's experiment outcomes:
${JSON.stringify(experiments.map(e => ({ name: e.name, status: e.status, lessons: e.lessons_learned })))}
Write a brief, professional summary of their technical experimental growth.
Output strictly JSON:
{
  "insights_en": "Your English insights here",
  "insights_vi": "Your Vietnamese insights here"
}
`;
      try {
        const response = await this.askAI(summaryPrompt, SYSTEM_PROMPTS.EXPERIMENT, `insights-${totalExps}`);
        const parsed = this.parseJsonFromAI(response);
        if (parsed.insights_en && parsed.insights_vi) {
          aiInsights = parsed.insights_en;
          aiInsightsVi = parsed.insights_vi;
        }
      } catch (err) {
        // fallback
      }
    }

    const insightsData = {
      success_rate: successRate,
      failure_learnings: [...new Set(allLessons)].slice(0, 5),
      failure_learnings_vi: [...new Set(allLessonsVi)].slice(0, 5),
      ai_insights: aiInsights,
      ai_insights_vi: aiInsightsVi
    };

    const insightsPath = path.join(__dirname, "../data/generated/experiment-insights.json");
    const wrappedInsights = {
      version: 1,
      generatedAt: new Date().toISOString(),
      data: insightsData
    };
    fs.writeFileSync(insightsPath, JSON.stringify(wrappedInsights, null, 2), "utf8");
    console.log("[ExperimentAnalyzer] Successfully wrote: experiment-insights.json");

    return { experiments, insights: insightsData };
  }
}

module.exports = { ExperimentAnalyzer };
