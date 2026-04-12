# DECO3801_project14_RainbowSix
Ranbowsix code base for project14, HTML exract, mapping and score.

## First update<br>
- **index.js**: input and output setting<br>
- **src/analyzer.js**: analysis the url, exract each features use for futer work<br>
- **output/**: jason vision output

## Second update<br>
- **src/scorer.js**: calculate cognitive accessibility scores (0-100) based on analyzer data, and map issues to WCAG and ISO 9241-11 standards.<br>
- **index.js**: updated to connect the scorer. Now it outputs a frontend-friendly JSON with status (good/warning/poor) and actionable insights.<br>

## Third Update<br>
- **index.js**: Added File System (`fs`) integration. Reports are now automatically timestamped and saved as `analysis-YYYY-MM-DD...json`.
- **src/analyzer.js**: 
    - **Media Intelligence**: Added specific logic to detect `<track>` captions in videos and identify autoplay behaviors.
    - **DOM Sanitization**: Implemented cloning and noise removal (scripts/styles) for accurate text metrics.
- **src/mapping.js**: Formalized the dictionary for all 5 dimensions, including weights, WCAG 2.2 success criteria, and ISO 9241 standards.
- **src/scorer.js**: Refined the `scoreMetric` function to handle three logic types: `lowerBetter`, `higherBetter`, and `range`. Added `generateInsights` to filter critical issues.

## Fourth Update (Latest)
- **server.js**: Added a new Express server to act as a bridge between the backend analyzer and the frontend UI.
  - **API Endpoint**: Exposed a `POST /api/analyze` route that accepts a URL.
  - **No Local Storage**: Shifted away from `fs.writeFile`. The server now processes the data entirely in-memory and returns the JSON directly over the network, ensuring a seamless, wait-free experience for the frontend.
  - **Data Packaging**: Bundled the raw `insights` array directly into their corresponding `scores.sections` cards. The frontend team can now render the UI directly without writing complex array-matching logic.

---
## Installation & Usage
### 1.Install dependencies:
 `npm install puppeteer express cors`
### 2. Run the local test (Save to file):
 `node index.js https://example.com`
 ### 3. Run the Backend API Server (For Frontend UI):
 `node server.js` 
 *(Server will run on http://localhost:3000)*

---
## Appendix: Technical Documentation

This appendix provides a deep dive into the architecture, scoring logic, and data extraction methodology used in the **RainbowSix** analyzer.


### 1. System Architecture & Pipeline
The application follows a strictly decoupled architecture, separating data collection from evaluation logic.

1.  **Orchestrator (`index.js` / `server.js`)**: Handles CLI arguments or API requests, manages the asynchronous flow, and formats results.
2.  **Data Collector (`src/analyzer.js`)**: A Puppeteer-based engine extract DOM properties in the website. Convert raw DOM data into structured “Artifacts”.
3.  **Knowledge Base (`src/mapping.js`)**: A dictionary defining thresholds, weights, and regulatory mappings (WCAG/ISO).
4.  **Scoring Engine (`src/scorer.js`)**: A stateless module that transforms raw data into normalized scores.

### 2. Advanced Extraction Methodology

#### 2.1 DOM Sanitization
To prevent "noise" (e.g., JavaScript code, CSS rules) from inflating word counts or complexity ratios, the analyzer performs a **Clone-and-Strip** operation:
* The `document.body` is cloned into a virtual fragment.
* `<script>`, `<style>`, and `<noscript>` tags are purged.
* Only the remaining `innerText` is passed to the NLP (Natural Language Processing) logic.

#### 2.2 Visibility Awareness
Unlike basic scrapers, this tool uses `window.getComputedStyle` to ensure that only elements actually rendered on the screen (where `display !== 'none'`) contribute to the **Visual Density Score**.


### 3. Scoring Mathematics & Heuristics

The system employs a **Weighted Normalization** algorithm to ensure that critical issues (like missing form labels) impact the overall score more heavily than minor issues.

#### 3.1 The Weighted Average Formula
For each section (Language, Visual, etc.), the score is calculated as:

$$Score_{section} = \frac{\sum_{i=1}^{n} (S_i \times W_i)}{\sum_{i=1}^{n} W_i}$$

* **$S_i$**: The normalized score (0-100) of a specific metric.
* **$W_i$**: The assigned weight from `mapping.js`.

#### 3.2 Normalized Metric Types
| Logic Type | Mathematical Description | Example |
| :--- | :--- | :--- |
| **Lower Better** | $100 \times (1 - \frac{value - good}{bad - good})$ | `complexWordRatio` |
| **Higher Better** | $100 \times (\frac{value - bad}{good - bad})$ | `labelCoverage` |
| **Range Optimal** | $100 \times (1 - \frac{value - ideal}{max - ideal})$ | `visualDensityScore` |

### 4. Regulatory & Standards Mapping (WCAG 2.2 & ISO 9241-11)

The RainbowSix analyzer is fully aligned with **WCAG 2.2** (published Oct 2023), with a specific focus on **Cognitive Accessibility** and **User Interaction Efficiency**.

#### 4.1 WCAG 2.2 Success Criteria Mapping
Each metric is evaluated against the latest success criteria to ensure compliance for users with cognitive, motor, or sensory impairments.

| Principle | Metric | WCAG 2.2 Criteria | Cognitive Impact & Meaning |
| :--- | :--- | :--- | :--- |
| **Perceivable** | `contrastIssueCount`, `videosWithCaptionsRatio` | 1.4.3 Contrast / 1.2.2 Captions | **Ensuring Information Reception**: If contrast is low or captions are missing, users with visual or hearing impairments cannot "receive" the content. Ensures content is identifiable regardless of sensory ability. |
| **Operable** | `visualDensityScore`, `autoplayMediaCount` | 2.5.8 Target Size / 2.2.2 Pause, Stop, Hide | **Reducing Distraction & Mismatched Interaction**: Crowded layouts (2.5.8) lead to accidental clicks for users with limited motor skills. Autoplay content distracts users with ADHD or cognitive disabilities and can trigger seizures. Help prevents accidental clicks and reduces distractions/seizure risks. |
| **Understandable** | `sentenceAverageLength`, `complexWordRatio`, `labelCoverage` | 3.1.5 Reading Level / 3.3.8 Accessible Authentication | **Lowering Cognitive Load**: Long sentences and jargon cause mental fatigue. SC 3.3.8 (New in 2.2) requires that users are not forced into "cognitive function tests" (like complex puzzles) to authenticate or submit forms. Help reduces mental fatigue; ensures users don't need "cognitive function tests" to use the site. |
| **Robust** | `maxDepth` | 2.4.8 Location / 2.4.5 Multiple Ways | **Preventing Navigational Lostness**: Ensures site structures are predictable. If nesting is too deep, users on screen readers or mobile devices may become completely disoriented within the site architecture.|

#### 4.2 ISO 9241-11 Usability Pillars
We translate technical artifacts into the three pillars of the ISO 9241-11 quality model:

* **Effectiveness (Success Rate)**: Can the user achieve their goal?
    * *Mapped Metrics*: `labelCoverage`, `complexWordRatio`. 
    * *Focus*: Clear instructions and simplified vocabulary prevent task abandonment.
* **Efficiency (Resource Expenditure)**: How much mental/physical effort is required?
    * *Mapped Metrics*: `sentenceAverageLength`, `maxDepth`, `visualDensityScore`. 
    * *Focus*: Reducing reading time, minimizing navigation clicks, and optimizing visual search speed.
* **Satisfaction (User Comfort)**: Is the experience free from discomfort?
    * *Mapped Metrics*: `autoplayMediaCount`. 
    * *Focus*: Giving users control over their environment to prevent anxiety and sensory overload.

### 5. Technical Note on WCAG 2.2 Implementation
The analyzer specifically addresses the **Cognitive Load** aspect of WCAG 2.2. By evaluating `complexWordRatio` and `sentenceAverageLength`, the tool directly supports **SC 3.3.8 (Accessible Authentication)** by ensuring that the language used in help text and labels does not create an unnecessary "cognitive function test" for the user.
