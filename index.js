const { analyzePage } = require("./src/analyzer");
const { calculateScores } = require("./src/scorer");
const { runLighthouseWithPlugin } = require("./lighthouse");

const fs = require("fs").promises;

const url = process.argv[2];

if (!url) {
  console.log("❌ Please provide a URL");
  process.exit(1);
}

analyzePage(url).then(async (result) => {

  const lhr = await runLighthouseWithPlugin(url);

  result.lighthouse = {
      categories: lhr.categories,
      audits: lhr.audits,
    };

  const lhroutput = JSON.stringify(result, null, 2);
  
  if (!result.artifacts) {
    console.error("❌ No artifacts returned");
    process.exit(1);
  }

  const scoring = calculateScores(result.artifacts);

  const finalOutput = {
    url,
    ...scoring, // Include scores + insights
    artifacts: result.artifacts
  };

  const output = JSON.stringify(finalOutput, null, 2);

  console.log(output);
  console.log(lhroutput);

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const filename = `analysis-${timestamp}.json`;

  await fs.writeFile(filename, output, "utf8");

  console.log(`✅ Saved to ${filename}`);

}).catch(err => {
  console.error("❌ Error:", err.message);
});
