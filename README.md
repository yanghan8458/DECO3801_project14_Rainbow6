# DECO3801_project14_RainbowSix
Ranbowsix code base for project14, HTML exract, mapping and score.

## First update<br>
- **index.js**: input and output setting<br>
- **src/analyzer.js**: analysis the url, exract each features use for futer work<br>
- **output/**: jason vision output

## Second update<br>
- **src/scorer.js**: calculate cognitive accessibility scores (0-100) based on analyzer data, and map issues to WCAG and ISO 9241-11 standards.<br>
- **index.js**: updated to connect the scorer. Now it outputs a frontend-friendly JSON with status (good/warning/poor) and actionable insights.<br>

## Third Update (Latest)
- **index.js**: Added File System (`fs`) integration. Reports are now automatically timestamped and saved as `analysis-YYYY-MM-DD...json`.
- **src/analyzer.js**: 
    - **Media Intelligence**: Added specific logic to detect `<track>` captions in videos and identify autoplay behaviors.
    - **DOM Sanitization**: Implemented cloning and noise removal (scripts/styles) for accurate text metrics.
- **src/mapping.js**: Formalized the dictionary for all 5 dimensions, including weights, WCAG 2.1 success criteria, and ISO 9241 standards.
- **src/scorer.js**: Refined the `scoreMetric` function to handle three logic types: `lowerBetter`, `higherBetter`, and `range`. Added `generateInsights` to filter critical issues.

---
## 🛠 Installation & Usage
### 1.Install dependencies:
 `npm install puppeteer`
### 2.Run the analyzer:
 `node index.js [https://example.com](https://example.com)`

---
# 📖 Appendix: Technical Documentation

This appendix provides a deep dive into the architecture, scoring logic, and data extraction methodology used in the **RainbowSix** analyzer.

---

## 1. System Architecture & Pipeline
The application follows a strictly decoupled architecture, separating data collection from evaluation logic.

[Image of web scraping and data analysis pipeline architecture]

1.  **Orchestrator (`index.js`)**: Handles CLI arguments, manages the asynchronous flow, and persists results to the file system.
2.  **Data Collector (`src/analyzer.js`)**: A Puppeteer-based engine that interfaces with the Chromium V8 engine to extract DOM properties.
3.  **Knowledge Base (`src/mapping.js`)**: A dictionary defining thresholds, weights, and regulatory mappings (WCAG/ISO).
4.  **Scoring Engine (`src/scorer.js`)**: A stateless module that transforms raw data into normalized scores.

---

## 2. Advanced Extraction Methodology

### 2.1 DOM Sanitization
To prevent "noise" (e.g., JavaScript code, CSS rules) from inflating word counts or complexity ratios, the analyzer performs a **Clone-and-Strip** operation:
* The `document.body` is cloned into a virtual fragment.
* `<script>`, `<style>`, and `<noscript>` tags are purged.
* Only the remaining `innerText` is passed to the NLP (Natural Language Processing) logic.

### 2.2 Visibility Awareness
Unlike basic scrapers, this tool uses `window.getComputedStyle` to ensure that only elements actually rendered on the screen (where `display !== 'none'`) contribute to the **Visual Density Score**.

---

## 3. Scoring Mathematics & Heuristics

The system employs a **Weighted Normalization** algorithm to ensure that critical issues (like missing form labels) impact the overall score more heavily than minor issues.

### 3.1 The Weighted Average Formula
For each section (Language, Visual, etc.), the score is calculated as:

$$Score_{section} = \frac{\sum_{i=1}^{n} (S_i \times W_i)}{\sum_{i=1}^{n} W_i}$$

* **$S_i$**: The normalized score (0-100) of a specific metric.
*
