// index-withAi.js

require("dotenv").config();
const fs   = require("fs");
const path = require("path");

const { analyzePage }       = require("./src/analyzer");
const { calculateScores }   = require("./src/scorer");
const { extractCodeIssues } = require("./src/codeExtractor");
const { runAgent }          = require("./src/ai-agent/agent");

async function run() {
  const url = process.argv[2] || "https://www.apple.com/au/";
  console.log("Running analysis for:", url);

  try {
    // -- Step 1: Analyse page metrics --------------------------------------
    console.log("Step 1/4 - Analysing page metrics...");
    const rawData = await analyzePage(url);
    if (!rawData || !rawData.artifacts) {
      throw new Error("analyzePage returned no artifacts");
    }

    // -- Step 2: Calculate dimension scores --------------------------------
    console.log("Step 2/4 - Calculating scores...");
    const scoringResult = calculateScores(rawData.artifacts);

    const packedDetails = (scoringResult?.scores?.sections || []).map(section => {
      const sectionInsights = (scoringResult.insights || []).filter(
        item => item.section === section.category
      );
      return {
        category: section.category,
        score:    section.score,
        status:   section.status,
        insights: sectionInsights
      };
    });

    // -- Step 3: Extract concrete code issues ------------------------------
    console.log("Step 3/4 - Extracting code issues...");
    const codeExtractResult = await extractCodeIssues(url);

    // Group issues by category for convenient downstream consumption
    const codeIssuesByCategory = {};
    (codeExtractResult.issues || []).forEach(issue => {
      const cat = issue.category || "other";
      if (!codeIssuesByCategory[cat]) codeIssuesByCategory[cat] = [];
      codeIssuesByCategory[cat].push(issue);
    });

    // Severity summary counts
    const severitySummary = { critical: 0, serious: 0, moderate: 0, minor: 0 };
    (codeExtractResult.issues || []).forEach(issue => {
      if (issue.severity in severitySummary) severitySummary[issue.severity]++;
    });

    // -- Step 4: Run AI agent -----------------------------------------------
    console.log("Step 4/4 - Running AI agent...");
    const agentResult = await runAgent({
      type: "cognitive_accessibility_analysis",
      payload: {
        url,
        overallScore:  scoringResult.scores.overallScore,
        overallStatus: scoringResult.scores.overallStatus,
        details:       packedDetails,
        // Pass code issues so future AI skills can reference specific snippets
        codeIssues:    codeExtractResult.issues || []
      }
    });

    // -- Assemble final output JSON -----------------------------------------
    const finalData = {
      url,
      generatedAt:   new Date().toISOString(),
      overallScore:  scoringResult.scores.overallScore,
      overallStatus: scoringResult.scores.overallStatus,

      // Dimension-level scores and insights (unchanged shape from original)
      details: packedDetails,

      // Concrete code issues extracted from the live DOM
      codeIssues: {
        total:           codeExtractResult.issues.length,
        severitySummary,
        byCategory:      codeIssuesByCategory,
        all:             codeExtractResult.issues
      },

      // AI agent recommendations
      ai: agentResult
    };

    // -- Save to outputs/ ---------------------------------------------------
    const outputPath = path.join(__dirname, "outputs");
    if (!fs.existsSync(outputPath)) fs.mkdirSync(outputPath);

    const fileName = `analysis-${Date.now()}.json`;
    const fullPath = path.join(outputPath, fileName);
    fs.writeFileSync(fullPath, JSON.stringify(finalData, null, 2));

    console.log("Analysis complete.");
    console.log(
      `Code issues found: ${finalData.codeIssues.total}` +
      ` (critical: ${severitySummary.critical}, serious: ${severitySummary.serious})`
    );
    console.log("File saved to:", fullPath);

  } catch (err) {
    console.error("Error:", err.message);
    process.exit(1);
  }
}

run();
