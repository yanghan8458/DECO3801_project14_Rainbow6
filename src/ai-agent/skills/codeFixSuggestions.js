// src/ai-agent/skills/codeFixSuggestions.js
//
// AI skill: receives a list of codeIssues from codeExtractor and asks the
// local Ollama model to generate corrected HTML/CSS snippets for each issue.
//
// Follows the same contract as cognitiveAccessibilityPrompt.js so it can be
// dropped straight into the agent.js skills array.
//
// Registration (agent.js):
//   const codeFixSuggestions = require("./skills/codeFixSuggestions");
//   const skills = [ cognitiveAccessibilityAdvice, codeFixSuggestions ];
//
// Invocation via runAgent:
//   await runAgent({ type: "code_fix_request", payload: { url, codeIssues } });

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || "http://localhost:11434";
const OLLAMA_MODEL    = process.env.OLLAMA_MODEL    || "qwen2.5:7b-instruct";
const OLLAMA_ENABLED  = (process.env.OLLAMA_ENABLED || "true").toLowerCase() === "true";

function isOllamaEnabled() {
  return OLLAMA_ENABLED;
}

// -- Prompt builder ---------------------------------------------------------

function buildPrompt({ url, codeIssues }) {
  // Sort by severity and cap at 10 issues to keep the prompt compact
  const severityRank = { critical: 0, serious: 1, moderate: 2, minor: 3 };
  const topIssues = [...codeIssues]
    .sort((a, b) => (severityRank[a.severity] ?? 9) - (severityRank[b.severity] ?? 9))
    .slice(0, 10)
    .map(issue => ({
      ruleId:       issue.ruleId,
      wcag:         issue.wcag,
      severity:     issue.severity,
      description:  issue.description,
      snippet:      issue.snippet,
      selector:     issue.selector,
      suggestedFix: issue.fix
    }));

  return `
You are a web accessibility code expert. Below is a list of accessibility issues detected on a live website.

Website URL: ${url}
Issues provided: ${topIssues.length}

Issues (JSON):
${JSON.stringify(topIssues, null, 2)}

For each issue:
1. Provide a corrected HTML or CSS snippet that resolves the problem.
2. Write a one-sentence explanation of why this fix resolves the accessibility barrier.
3. Indicate whether the fix is a breaking change (true / false).

Return valid JSON only in this exact structure:
{
  "fixes": [
    {
      "ruleId": "string",
      "severity": "string",
      "originalSnippet": "string",
      "fixedSnippet": "string",
      "explanation": "string",
      "breakingChange": false
    }
  ]
}
`.trim();
}

// -- Safe JSON parser --------------------------------------------------------

function safeJsonParse(text) {
  if (!text || typeof text !== "string") return null;
  try {
    return JSON.parse(text);
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) return null;
    try { return JSON.parse(match[0]); } catch { return null; }
  }
}

// -- Main run function -------------------------------------------------------

async function run(input) {
  const { url, codeIssues } = input;

  if (!isOllamaEnabled()) {
    return {
      skill:     "code_fix_suggestions",
      enabled:   false,
      generated: false,
      fixes:     null,
      error:     "OLLAMA_ENABLED=false"
    };
  }

  if (!url || typeof url !== "string") {
    return {
      skill:     "code_fix_suggestions",
      enabled:   true,
      generated: false,
      fixes:     null,
      error:     "Missing or invalid url"
    };
  }

  if (!Array.isArray(codeIssues) || codeIssues.length === 0) {
    return {
      skill:     "code_fix_suggestions",
      enabled:   true,
      generated: false,
      fixes:     null,
      error:     "No code issues provided"
    };
  }

  const prompt = buildPrompt({ url, codeIssues });

  try {
    const response = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model:  OLLAMA_MODEL,
        stream: false,
        messages: [
          {
            role:    "system",
            content:
              "You are a web accessibility code expert. " +
              "You receive structured lists of HTML/CSS accessibility issues and must generate corrected code snippets. " +
              "Do not invent issues not present in the input. " +
              "Return valid JSON only."
          },
          {
            role:    "user",
            content: prompt
          }
        ]
      })
    });

    if (!response.ok) {
      const text = await response.text();
      return {
        skill:     "code_fix_suggestions",
        enabled:   true,
        generated: false,
        fixes:     null,
        error:     `Ollama request failed: HTTP ${response.status} ${text}`
      };
    }

    const data    = await response.json();
    const content = data?.message?.content || "";
    const parsed  = safeJsonParse(content);

    return {
      skill:     "code_fix_suggestions",
      enabled:   true,
      generated: Boolean(parsed),
      fixes:     parsed?.fixes ?? null,
      rawText:   content,
      error:     parsed ? null : "Model returned non-JSON output"
    };

  } catch (error) {
    return {
      skill:     "code_fix_suggestions",
      enabled:   true,
      generated: false,
      fixes:     null,
      error:     error.message
    };
  }
}

// -- Health / test helpers ---------------------------------------------------

async function checkOllamaHealth() {
  if (!isOllamaEnabled()) return { ok: false, reason: "OLLAMA_ENABLED=false" };
  try {
    const response = await fetch(`${OLLAMA_BASE_URL}/api/tags`);
    if (!response.ok) return { ok: false, reason: `HTTP ${response.status}` };
    const data = await response.json();
    return {
      ok:              true,
      modelConfigured: OLLAMA_MODEL,
      installedModels: (data.models || []).map(m => m.name)
    };
  } catch (error) {
    return { ok: false, reason: error.message };
  }
}

async function testOllamaChat() {
  if (!isOllamaEnabled()) return { ok: false, reason: "OLLAMA_ENABLED=false" };
  try {
    const response = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model:    OLLAMA_MODEL,
        stream:   false,
        messages: [{ role: "user", content: "Reply with the word OK only." }]
      })
    });
    if (!response.ok) {
      const text = await response.text();
      return { ok: false, reason: `HTTP ${response.status}: ${text}` };
    }
    const data = await response.json();
    return { ok: true, reply: data?.message?.content || "" };
  } catch (error) {
    return { ok: false, reason: error.message };
  }
}

// -- Export (matches agent.js skill contract) --------------------------------

module.exports = {
  name:        "code_fix_suggestions",
  description: "Generate corrected HTML/CSS code snippets for detected accessibility issues.",
  inputType:   "code_fix_request",
  run,
  checkOllamaHealth,
  testOllamaChat
};
