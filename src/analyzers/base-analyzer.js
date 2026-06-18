// src/analyzers/base-analyzer.js
const fs = require("fs");
const path = require("path");
const { OpenRouterProvider } = require("../lib/ai/openrouter");
const { AICache } = require("../lib/ai/cache");

class BaseAnalyzer {
  constructor(name, outputFile) {
    this.name = name;
    this.outputFile = outputFile;
    this.outputPath = path.join(__dirname, "../data/generated", outputFile);
    this.ai = new OpenRouterProvider();
    this.cache = AICache;
  }

  readJson(filePath, defaultValue = {}) {
    try {
      if (fs.existsSync(filePath)) {
        return JSON.parse(fs.readFileSync(filePath, "utf8"));
      }
    } catch (err) {
      console.error(`[BaseAnalyzer] Error reading ${filePath}:`, err.message);
    }
    return defaultValue;
  }

  wrapJson(data, version = 1) {
    return {
      version: version,
      generatedAt: new Date().toISOString(),
      data: data
    };
  }

  writeJson(data) {
    try {
      const dir = path.dirname(this.outputPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      const wrapped = this.wrapJson(data);
      fs.writeFileSync(this.outputPath, JSON.stringify(wrapped, null, 2), "utf8");
      console.log(`[Analyzer - ${this.name}] Successfully wrote: ${this.outputFile}`);
    } catch (err) {
      console.error(`[BaseAnalyzer - ${this.name}] Error writing:`, err.message);
    }
  }

  writeCustomJson(filename, data) {
    try {
      const customPath = path.join(path.dirname(this.outputPath), filename);
      const dir = path.dirname(customPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      const wrapped = this.wrapJson(data);
      fs.writeFileSync(customPath, JSON.stringify(wrapped, null, 2), "utf8");
      console.log(`[Analyzer - ${this.name}] Successfully wrote custom file: ${filename}`);
    } catch (err) {
      console.error(`[BaseAnalyzer - ${this.name}] Error writing custom file ${filename}:`, err.message);
    }
  }

  // AI assistant helper with built-in hash caching
  async askAI(prompt, systemPrompt = "", inputHashSource = "") {
    const hashKey = this.cache.computeHash(inputHashSource, prompt, systemPrompt, this.ai.model);
    const cachedResponse = this.cache.get(hashKey);

    if (cachedResponse) {
      // Cache hit!
      return cachedResponse;
    }

    // Cache miss: call OpenRouter
    console.log(`[AI - ${this.name}] Cache miss. Fetching from OpenRouter for key: ${hashKey.substring(0, 8)}...`);
    const aiText = await this.ai.generateText(prompt, systemPrompt);

    if (aiText) {
      this.cache.set(hashKey, aiText, { analyzer: this.name });
    }
    return aiText;
  }

  // Parse JSON from AI response block (markdown blocks like ```json ... ```)
  parseJsonFromAI(aiText, fallback = {}) {
    if (!aiText) return fallback;
    try {
      let cleaned = aiText.trim();
      if (cleaned.startsWith("```")) {
        cleaned = cleaned.replace(/^```json/, "").replace(/```$/, "").trim();
      }
      return JSON.parse(cleaned);
    } catch (err) {
      console.error(`[BaseAnalyzer] Error parsing JSON response from AI:`, err.message);
      return fallback;
    }
  }

  async analyze(raw, backupProjects, profileBackup) {
    throw new Error("analyze() must be implemented by subclass");
  }
}

module.exports = { BaseAnalyzer };
