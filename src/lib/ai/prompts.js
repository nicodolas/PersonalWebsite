// src/lib/ai/prompts.js

const SYSTEM_PROMPTS = {
  TIMELINE: "You are a professional software engineering biographer. Summarize the developer's growth and technological evolution in a specific year.",
  BRAIN: "You are a cognitive analysis agent. Analyze a developer's repository history and topics to describe their current technical curiosity, focus, and emerging learning trends.",
  EXPERIMENT: "You are a scientific lab assistant. Summarize a software repository as an experiment: state the main problem it solves, the approach taken, the outcome, and lessons learned.",
  CHANGELOG: "You are a release manager. Group raw developer commit messages and summarize them into a neat, monthly release notes layout.",
  NEXUS: "You are a software graph analytics agent. You analyze repository networks, technology maps, and interests to synthesize emerging and fading trends, what is highly connected, and what is becoming important."
};

const PROMPT_TEMPLATES = {
  TIMELINE_ERA: (year, repos, tech) => `
Analyze the developer's work in the year ${year}.
List of projects developed: ${repos.join(", ")}.
Technologies used: ${tech.join(", ")}.

Provide a short, inspiring narrative summarizing this era's growth in both:
1. English (approx. 2-3 sentences)
2. Vietnamese (approx. 2-3 sentences)

Return the output strictly in JSON format as follows:
{
  "summary_en": "Your English summary here.",
  "summary_vi": "Your Vietnamese summary here."
}
`,

  BRAIN_CURIOSITY: (recentRepos, recentTech) => `
Analyze the developer's recent focus.
Recently active repositories: ${JSON.stringify(recentRepos)}.
Recent technologies and languages: ${recentTech.join(", ")}.

Describe the developer's current technical curiosity, focus area, and emerging trends.
Provide:
1. English summary (1-2 sentences)
2. Vietnamese summary (1-2 sentences)

Return the output strictly in JSON format as follows:
{
  "current_focus_en": "Short description of focus in English",
  "current_focus_vi": "Short description of focus in Vietnamese",
  "summary_en": "AI curiosity summary in English",
  "summary_vi": "AI curiosity summary in Vietnamese"
}
`,

  EXPERIMENT_DETAILS: (repoName, description, languages, topics) => `
Analyze the repository "${repoName}".
Description: ${description || "No description provided."}.
Languages used: ${languages.join(", ")}.
Topics: ${topics.join(", ")}.

Explain this project as a software experiment. Describe:
1. The Problem it tries to solve.
2. The Approach/Architecture taken.
3. The Outcome/Result.
4. Three key lessons learned.

Provide the answers in both English and Vietnamese.
Return the output strictly in JSON format as follows:
{
  "problem_en": "English problem",
  "problem_vi": "Vietnamese problem",
  "approach_en": "English approach",
  "approach_vi": "Vietnamese approach",
  "outcome_en": "English outcome",
  "outcome_vi": "Vietnamese outcome",
  "lessons_en": ["Lesson 1", "Lesson 2", "Lesson 3"],
  "lessons_vi": ["Bài học 1", "Bài học 2", "Bài học 3"]
}
`,

  NEXUS_INSIGHTS: (repos, techs, interests) => `
Analyze the developer's technical ecosystem graph relationships.
Repositories: ${JSON.stringify(repos)}.
Technologies co-occurrence: ${JSON.stringify(techs)}.
Brain interests: ${JSON.stringify(interests)}.

Provide a professional analysis (in both English and Vietnamese) explaining:
1. What is connected (the core clusters and connections)?
2. What is emerging (technologies or topics rising in activity)?
3. What is fading (technologies or topics dropping or archived)?
4. What is becoming important (emerging areas with high developer attention)?

Return the output strictly in JSON format as follows:
{
  "connected_en": "Explanation of core connections in English",
  "connected_vi": "Giải thích kết nối cốt lõi bằng tiếng Việt",
  "emerging_en": "Explanation of what is emerging in English",
  "emerging_vi": "Giải thích hướng đang phát triển bằng tiếng Việt",
  "fading_en": "Explanation of what is fading in English",
  "fading_vi": "Giải thích công nghệ/dự án đang phai nhạt bằng tiếng Việt",
  "important_en": "Explanation of what is becoming important in English",
  "important_vi": "Giải thích nội dung đang trở nên quan trọng bằng tiếng Việt"
}
`
};

module.exports = { SYSTEM_PROMPTS, PROMPT_TEMPLATES };
