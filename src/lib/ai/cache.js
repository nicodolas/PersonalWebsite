// src/lib/ai/cache.js
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const cacheFilePath = path.join(__dirname, "../../data/cache/ai-cache.json");

class AICache {
  constructor() {
    this.cache = {};
    this.load();
  }

  load() {
    try {
      const cacheDir = path.dirname(cacheFilePath);
      if (!fs.existsSync(cacheDir)) {
        fs.mkdirSync(cacheDir, { recursive: true });
      }
      if (fs.existsSync(cacheFilePath)) {
        this.cache = JSON.parse(fs.readFileSync(cacheFilePath, "utf8"));
      }
    } catch (error) {
      console.warn("[Cache] Warning: Failed to load AI cache file. Starting fresh.", error.message);
      this.cache = {};
    }
  }

  save() {
    try {
      fs.writeFileSync(cacheFilePath, JSON.stringify(this.cache, null, 2), "utf8");
    } catch (error) {
      console.error("[Cache] Error writing AI cache file:", error.message);
    }
  }

  computeHash(inputData, prompt, systemPrompt = "", model = "") {
    const serializedInput = typeof inputData === "string" ? inputData : JSON.stringify(inputData);
    const combined = [serializedInput, prompt, systemPrompt, model].join("|");
    return crypto.createHash("sha256").update(combined).digest("hex");
  }

  get(hashKey) {
    if (this.cache[hashKey]) {
      return this.cache[hashKey].output;
    }
    return null;
  }

  set(hashKey, output, metadata = {}) {
    this.cache[hashKey] = {
      output,
      timestamp: new Date().toISOString(),
      ...metadata
    };
    this.save();
  }
}

module.exports = { AICache: new AICache() };
