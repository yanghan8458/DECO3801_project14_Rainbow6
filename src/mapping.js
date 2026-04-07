// src/mapping.js

const mapping = {
  // ===== LANGUAGE =====
  sentenceAverageLength: {
    type: "range",
    ideal: 15,
    max: 30,
    weight: 1.5,
    problem: "Sentences are too long",
    suggestion: "Use shorter sentences or bullet points",
    wcag: "3.1.5 Reading Level",
    iso: "Efficiency"
  },

  complexWordRatio: {
    type: "lowerBetter",
    good: 0.1,
    bad: 0.3,
    weight: 1,
    problem: "Too many complex words",
    suggestion: "Simplify vocabulary",
    wcag: "3.1.3 Unusual Words",
    iso: "Effectiveness"
  },

  // ===== VISUAL =====
  visualDensityScore: {
    type: "range",
    ideal: 400,
    max: 1200,
    weight: 1.5,
    problem: "Page too visually dense",
    suggestion: "Reduce clutter and group content",
    wcag: "1.4.8 Visual Presentation",
    iso: "Efficiency"
  },

  contrastIssueCount: {
    type: "lowerBetter",
    good: 0,
    bad: 10,
    weight: 1.2,
    problem: "Contrast issues detected",
    suggestion: "Improve text/background contrast",
    wcag: "1.4 Contrast",
    iso: "Effectiveness"
  },

  // ===== FORMS =====
  labelCoverage: {
    type: "higherBetter",
    good: 0.9,
    bad: 0.3,
    weight: 1.5,
    problem: "Form inputs lack labels",
    suggestion: "Add labels to all inputs",
    wcag: "3.3.2 Labels or Instructions",
    iso: "Effectiveness"
  },

  // ===== MEDIA =====
  videosWithCaptionsRatio: {
    type: "higherBetter",
    good: 1,
    bad: 0,
    weight: 1.5,
    problem: "Videos lack captions",
    suggestion: "Add captions to all videos",
    wcag: "1.2.2 Captions",
    iso: "Effectiveness"
  },

  autoplayMediaCount: {
    type: "lowerBetter",
    good: 0,
    bad: 5,
    weight: 1.2,
    problem: "Too many autoplay media elements",
    suggestion: "Disable autoplay or add controls",
    wcag: "2.2.2 Pause, Stop, Hide",
    iso: "Satisfaction"
  },

  // ===== NAVIGATION =====
  maxDepth: {
    type: "lowerBetter",
    good: 2,
    bad: 5,
    weight: 1,
    problem: "Navigation too deep",
    suggestion: "Flatten navigation structure",
    wcag: "2.4 Navigable",
    iso: "Efficiency"
  }
};

module.exports = { mapping };
