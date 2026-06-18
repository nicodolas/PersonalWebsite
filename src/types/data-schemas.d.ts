export interface GeneratedWrapper<T> {
  version: number;
  generatedAt: string;
  data: T;
}

export interface Repository {
  id: string;
  name: string;
  description: string;
  description_vi?: string;
  language: string | null;
  stars: number;
  forks: number;
  size: number;
  url: string;
  created_at: string;
  updated_at: string;
  topics: string[];
}

// 1. timeline.json
export interface TimelineEra {
  year: number;
  title: string;
  title_vi: string;
  description: string;
  description_vi: string;
  commits: number;
  technologies: string[];
  repos: string[];
}
export interface TimelineData {
  eras: TimelineEra[];
}

// 2. brain.json
export interface BrainTopic {
  name: string;
  score: number; // 0-100 interest level
  level: "learning" | "proficient" | "mastered";
}
export interface BrainData {
  current_focus: string;
  current_focus_vi: string;
  learning_rate: number;
  active_hours: string;
  research_topics: string[];
  interests: BrainTopic[];
  ai_curiosity_summary: string;
  ai_curiosity_summary_vi: string;
}

// 3. workshop.json
export interface WorkshopProject {
  id: string;
  title: string;
  status: "researching" | "building" | "archived";
  progress: number; // 0-100
  commits_count: number;
  tech_stack: string[];
  description: string;
  description_vi?: string;
  github_url?: string;
  demo_url?: string;
}
export interface WorkshopData {
  projects: WorkshopProject[];
}

// 4. achievements.json
export interface Achievement {
  title: string;
  title_vi: string;
  date: string;
  icon: string;
  desc: string;
  desc_vi: string;
  url?: string;
}
export interface AchievementsData {
  achievements: Achievement[];
}

// 5. skill-tree.json
export interface SkillNode {
  id: string;
  label: string;
  label_vi: string;
  status: "locked" | "unlocked" | "mastered";
  children?: SkillNode[];
}
export interface SkillTreeData {
  trees: SkillNode[];
}

// 6. experiments.json
export interface Experiment {
  id: string;
  name: string;
  problem: string;
  problem_vi: string;
  approach: string;
  approach_vi: string;
  outcome: string;
  outcome_vi: string;
  lessons_learned: string[];
  lessons_learned_vi: string[];
  status: "active" | "success" | "failed";
}
export interface ExperimentsData {
  experiments: Experiment[];
}

// 7. graveyard.json
export interface GraveyardProject {
  id: string;
  name: string;
  date_archived: string;
  reason: string;
  reason_vi: string;
  lessons_learned: string;
  lessons_learned_vi: string;
  tech: string[];
}
export interface GraveyardData {
  projects: GraveyardProject[];
}

// 8. technologies.json
export interface TechCategory {
  name: string;
  items: string[];
}
export interface TechnologiesData {
  categories: TechCategory[];
}

// 9. changelog.json
export interface ChangelogRelease {
  version: string;
  date: string;
  monthName: string;
  monthNameVi: string;
  notes: string[];
}
export interface ChangelogData {
  releases: ChangelogRelease[];
}

// 10. repository-map.json (Galaxy Graph)
export interface GraphNode {
  id: string;
  description: string;
  description_vi: string;
  group: string;
  size: number;
  tech: string[];
  stars?: number;
  forks?: number;
  githubUrl?: string;
  isBackup?: boolean;
}
export interface GraphLink {
  source: string;
  target: string;
  label: string;
}
export interface RepositoryMapData {
  nodes: GraphNode[];
  links: GraphLink[];
}

// 11. timeline-summary.json
export interface TimelineSummaryData {
  total_commits: number;
  total_repos: number;
  active_years: number;
  ai_summary: string;
  ai_summary_vi: string;
}

// 12. experiment-insights.json
export interface ExperimentInsightsData {
  success_rate: number;
  failure_learnings: string[];
  failure_learnings_vi: string[];
  ai_insights: string;
  ai_insights_vi: string;
}

// 13. technology-trends.json
export interface TechTrend {
  language: string;
  repos_count: number;
  percentage: number;
  trend: "rising" | "stable" | "declining";
}
export interface TechnologyTrendsData {
  trends: TechTrend[];
}

// 14. technology-map.json
export interface TechNode {
  id: string;
  label: string;
  type: "language" | "framework" | "tool" | "ai";
  count: number;
}
export interface TechLink {
  source: string;
  target: string;
  weight: number;
}
export interface NexusInsights {
  connected_en: string;
  connected_vi: string;
  emerging_en: string;
  emerging_vi: string;
  fading_en: string;
  fading_vi: string;
  important_en: string;
  important_vi: string;
}
export interface TechnologyMapData {
  nodes: TechNode[];
  links: TechLink[];
  insights: NexusInsights;
}

// 15. interest-map.json
export interface InterestMapNode {
  id: string;
  label: string;
  type: "interest" | "technology" | "era" | "achievement" | "brain";
  score?: number;
  year?: number;
  icon?: string;
}
export interface InterestMapLink {
  source: string;
  target: string;
  weight: number;
}
export interface InterestMapData {
  nodes: InterestMapNode[];
  links: InterestMapLink[];
}

// 16. repository-network.json
export interface RepoNetworkNode {
  id: string;
  name: string;
  description_vi: string;
  group: string;
  size: number;
  tech: string[];
  era?: string;
  achievements?: string[];
  currentBrainConnection?: boolean;
}
export interface RepoNetworkLink {
  source: string;
  target: string;
  weight: number;
}
export interface RepositoryNetworkData {
  nodes: RepoNetworkNode[];
  links: RepoNetworkLink[];
}

// 17. knowledge-clusters.json
export interface KnowledgeCluster {
  id: string;
  label: string;
  label_vi: string;
  description: string;
  description_vi: string;
  technologies: string[];
  repositories: string[];
  eras?: number[];
  achievements?: string[];
}
export interface KnowledgeClustersData {
  clusters: KnowledgeCluster[];
}
