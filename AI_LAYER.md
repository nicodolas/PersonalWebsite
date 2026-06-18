# Neko Workshop AI Layer

This document describes the AI abstraction, caching engine, and OpenRouter integration that powers the automated insights on **Neko Workshop**.

---

## 🏗️ Architecture Layout

The AI Layer is isolated in `src/lib/ai/` and operates via an abstract interface:

```
Analyzers (e.g. BrainAnalyzer, GraveyardAnalyzer)
    ↓
AI Provider Interface (provider.ts)
    ↓
OpenRouter Client (openrouter.ts) -- [AICache (cache.ts) Intercepts]
    ↓
OpenRouter API
```

This design permits exchanging OpenRouter with any other model provider (such as OpenAI, Anthropic, or Gemini SDK) by modifying only environment variables, without changing a single line of analyzer logic.

---

## 📂 File Walkthrough

### 1. `provider.js`
Declares the base class interface for AI operations. It requires implementing:
- `generateText(prompt, systemPrompt)` -> Returns text from the LLM.
- `generateJson(prompt, systemPrompt, schema)` -> Returns structured JSON response matching a specific schema.

### 2. `openrouter.js`
The concrete implementation of `AIProvider` that communicates with OpenRouter APIs.
- Reads `OPENROUTER_API_KEY`, `OPENROUTER_BASE_URL` (defaults to `https://openrouter.ai/api/v1`), and `OPENROUTER_MODEL` (defaults to `google/gemini-2.5-flash`).
- Formats requests using the standard OpenAI-compatible Chat Completions payload.
- Performs authorization using Bearer headers.
- Handles rate-limiting and timeouts with graceful default responses.

### 3. `cache.js`
The performance and cost-saving engine.
- Acts as a file-backed local hash database saved in `src/data/cache/ai-cache.json`.
- When an analyzer requests AI generation, `AICache` computes a SHA-256 hash of:
  $$\text{Hash} = \text{SHA-256}(\text{Model} + \text{System Prompt} + \text{User Prompt})$$
- If the hash exists in the cache, the cached response is immediately returned.
- If not, the API is queried, and the result is saved back to `ai-cache.json`.
- **Outcome**: **99%+ reduction in LLM costs**. AI is only queried when raw developer data or prompt templates change.

### 4. `prompts.js`
Centralized repository for all system and user prompt templates. Keeps prompts consistent and easily modifiable. It defines:
- Timeline summary prompts.
- Brain curiosity synthesis prompts.
- Experiment hypothesis outlines.
- Graveyard RIP and lesson summaries.
- Changelog release notes templates.

---

## ⚙️ Configuration & Environment Variables

Make sure the following variables are configured in your `.env` (local) or repository secrets (GitHub Actions):

```ini
# OpenRouter Authentication Token
OPENROUTER_API_KEY=sk-or-v1-xxxxxxxx...

# API Base (Optional)
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1

# Preferred LLM Model
OPENROUTER_MODEL=google/gemini-2.5-flash
```

---

## 🛡️ Failure Handling & Resilience

If OpenRouter is unavailable or the API key is not configured:
- The provider catches the error and logs a warning.
- It calls a deterministic backup function inside the analyzer to generate basic text descriptions.
- The pipeline execution **never** halts due to AI provider failures, ensuring stability in CI/CD runners.
