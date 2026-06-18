// src/lib/ai/openrouter.js
const { AIProvider } = require("./provider");

class OpenRouterProvider extends AIProvider {
  constructor() {
    super();
    this.apiKey = process.env.OPENROUTER_API_KEY || "";
    this.baseUrl = process.env.OPENROUTER_BASE_URL || "https://openrouter.ai/api/v1";
    this.model = process.env.OPENROUTER_MODEL || "google/gemini-2.5-flash";
  }

  async generateText(prompt, systemPrompt = "") {
    if (!this.apiKey) {
      console.warn("[AI] No OpenRouter API key found. Returning empty fallback response.");
      return "";
    }

    try {
      const messages = [];
      if (systemPrompt) {
        messages.push({ role: "system", content: systemPrompt });
      }
      messages.push({ role: "user", content: prompt });

      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://nekovibecoder.site",
          "X-OpenRouter-Title": "Neko Workshop"
        },
        body: JSON.stringify({
          model: this.model,
          messages: messages,
          temperature: 0.3
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`OpenRouter API Error: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();
      return data.choices?.[0]?.message?.content?.trim() || "";
    } catch (error) {
      console.error("[AI] Error calling OpenRouter:", error.message);
      throw error;
    }
  }
}

module.exports = { OpenRouterProvider };
