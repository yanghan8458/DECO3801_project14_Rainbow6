const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || "http://localhost:11434";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "qwen2.5:7b-instruct";
const OLLAMA_ENABLED = (process.env.OLLAMA_ENABLED || "true").toLowerCase() === "true";

function isOllamaEnabled() {
  return OLLAMA_ENABLED;
}

async function checkOllamaHealth() {
  if (!isOllamaEnabled()) {
    return {
      ok: false,
      reason: "OLLAMA_ENABLED=false"
    };
  }

  try {
    const response = await fetch(`${OLLAMA_BASE_URL}/api/tags`, {
      method: "GET"
    });

    if (!response.ok) {
      return {
        ok: false,
        reason: `HTTP ${response.status}`
      };
    }

    const data = await response.json();
    const models = Array.isArray(data.models) ? data.models : [];

    return {
      ok: true,
      modelConfigured: OLLAMA_MODEL,
      installedModels: models.map(model => model.name)
    };
  } catch (error) {
    return {
      ok: false,
      reason: error.message
    };
  }
}

async function testOllamaChat() {
  if (!isOllamaEnabled()) {
    return {
      ok: false,
      reason: "OLLAMA_ENABLED=false"
    };
  }

  try {
    const response = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        stream: false,
        messages: [
          {
            role: "user",
            content: "Reply with the word OK only."
          }
        ]
      })
    });

    if (!response.ok) {
      const text = await response.text();

      return {
        ok: false,
        reason: `HTTP ${response.status}: ${text}`
      };
    }

    const data = await response.json();

    return {
      ok: true,
      reply: data?.message?.content || ""
    };
  } catch (error) {
    return {
      ok: false,
      reason: error.message
    };
  }
}

async function run(input) {
  const { url, overallScore, overallStatus, details } = input;

  if (!isOllamaEnabled()) {
    return {
      skill: "cognitive_accessibility_advice",
      enabled: false,
      generated: false,
      advice: null,
      error: "OLLAMA_ENABLED=false"
    };
  }

  if (!url || typeof url !== "string") {
    return {
      skill: "cognitive_accessibility_advice",
      enabled: true,
      generated: false,
      advice: null,
      error: "Missing or invalid url"
    };
  }

  if (!Array.isArray(details)) {
    return {
      skill: "cognitive_accessibility_advice",
      enabled: true,
      generated: false,
      advice: null,
      error: "Missing or invalid details array"
    };
  }

  const prompt = buildPrompt({
    url,
    overallScore,
    overallStatus,
    details
  });

  try {
    const response = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        stream: false,
        messages: [
          {
            role: "system",
            content:
              "You are a cognitive accessibility expert. " +
              "You receive structured website analysis results and must generate concise, practical recommendations. " +
              "Do not invent issues that are not present in the input. " +
              "Focus on cognitive load, readability, layout clarity, navigation simplicity, and actionable improvements. " +
              "Return valid JSON only."
          },
          {
            role: "user",
            content: prompt
          }
        ]
      })
    });

    if (!response.ok) {
      const text = await response.text();

      return {
        skill: "cognitive_accessibility_advice",
        enabled: true,
        generated: false,
        advice: null,
        error: `Ollama request failed: HTTP ${response.status} ${text}`
      };
    }

    const data = await response.json();
    const content = data?.message?.content || "";
    const parsed = safeJsonParse(content);

    return {
      skill: "cognitive_accessibility_advice",
      enabled: true,
      generated: Boolean(parsed),
      advice: parsed,
      rawText: content,
      error: parsed ? null : "Model returned non-JSON output"
    };
  } catch (error) {
    return {
      skill: "cognitive_accessibility_advice",
      enabled: true,
      generated: false,
      advice: null,
      error: error.message
    };
  }
}

function buildPrompt({ url, overallScore, overallStatus, details }) {
  const compactDetails = details.map(section => ({
    category: section.category,
    score: section.score,
    status: section.status,
    insights: Array.isArray(section.insights)
      ? section.insights.slice(0, 5).map(item => ({
          title: item.title || "",
          message: item.message || "",
          severity: item.severity || ""
        }))
      : []
  }));

  return `
Analyse the following structured cognitive accessibility result.

Website URL: ${url}
Overall score: ${overallScore}
Overall status: ${overallStatus}

Section details:
${JSON.stringify(compactDetails, null, 2)}

Tasks:
1. Write a short summary in 2-3 sentences.
2. Identify the top 3 most important problems.
3. Provide 3 to 5 practical recommendations.
4. For each recommendation, explain why it helps reduce cognitive load or improve comprehension.
5. Keep the language simple and useful.

Return valid JSON only in this exact structure:
{
  "summary": "string",
  "topProblems": ["string", "string", "string"],
  "recommendations": [
    {
      "title": "string",
      "action": "string",
      "reason": "string",
      "priority": "high|medium|low"
    }
  ]
}
`.trim();
}

function safeJsonParse(text) {
  if (!text || typeof text !== "string") return null;

  try {
    return JSON.parse(text);
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) return null;

    try {
      return JSON.parse(match[0]);
    } catch {
      return null;
    }
  }
}

module.exports = {
  name: "cognitive_accessibility_advice",
  description:
    "Generate cognitive accessibility recommendations from structured website analysis results.",
  inputType: "cognitive_accessibility_analysis",
  run,
  checkOllamaHealth,
  testOllamaChat
};
