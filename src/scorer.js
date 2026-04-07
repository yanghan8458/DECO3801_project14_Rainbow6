// src/scorer.js

const { mapping } = require("./mapping");

// ===== metric scoring =====
function scoreMetric(value, config) {
  if (value === null || value === undefined) return null;

  // lower is better
  if (config.type === "lowerBetter") {
    if (value <= config.good) return 100;
    if (value >= config.bad) return 0;

    return 100 * (1 - (value - config.good) / (config.bad - config.good));
  }

  // higher is better
  if (config.type === "higherBetter") {
    if (value >= config.good) return 100;
    if (value <= config.bad) return 0;

    return 100 * ((value - config.bad) / (config.good - config.bad));
  }

  // range optimal
  if (config.type === "range") {
    if (value <= config.ideal) return 100;
    if (value >= config.max) return 0;

    return 100 * (1 - (value - config.ideal) / (config.max - config.ideal));
  }

  return 100;
}

// ===== section scoring =====
function scoreSection(metrics) {
  let total = 0;
  let weightSum = 0;

  for (const key in metrics) {
    const config = mapping[key];
    if (!config) continue;

    const score = scoreMetric(metrics[key], config);
    if (score === null) continue;

    const weight = config.weight || 1;

    total += score * weight;
    weightSum += weight;
  }

  return weightSum ? Math.round(total / weightSum) : 100;
}

// ===== insights =====
function generateInsights(artifacts) {
  const insights = [];

  for (const section in artifacts) {
    const metrics = artifacts[section];

    if (!metrics) continue;

    for (const key in metrics) {
      const config = mapping[key];
      if (!config) continue;

      const value = metrics[key];
      const score = scoreMetric(value, config);

      if (score !== null && score < 60) {
        insights.push({
          section,
          metric: key,
          value,
          problem: config.problem,
          suggestion: config.suggestion,
          mapping: {
            wcag: config.wcag,
            iso: config.iso
          }
        });
      }
    }
  }

  return insights;
}

// ===== main scoring =====
function calculateScores(artifacts) {
  const sections = [];
  let total = 0;

  for (const section in artifacts) {
    const score = scoreSection(artifacts[section]);

    sections.push({
      category: section,
      score,
      status: score >= 80 ? "good" : score >= 60 ? "warning" : "poor"
    });

    total += score;
  }

  const overallScore = Math.round(total / sections.length);

  return {
    scores: {
      overallScore,
      overallStatus:
        overallScore >= 80
          ? "good"
          : overallScore >= 60
          ? "warning"
          : "poor",
      sections
    },
    insights: generateInsights(artifacts)
  };
}

module.exports = { calculateScores };
