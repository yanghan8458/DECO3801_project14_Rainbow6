const express = require("express");
const cors = require("cors");
const { analyzePage } = require("./src/analyzer");
const { calculateScores } = require("./src/scorer");

// setup express server
const app = express();
const port = 3000;

// allow frontend to fetch data without block
app.use(cors());
// let us read body from post request
app.use(express.json());

// the main api route
app.post("/api/analyze", async (req, res) => {
  // get url from frontend guys
  const targetUrl = req.body.url;

  if (!targetUrl) {
    console.log("error: missing url");
    return res.status(400).json({ error: "please send a url" });
  }

  console.log("starting analysis for:", targetUrl, "... wait a bit");

  try {
    // step 1: run puppeteer scraper
    const rawData = await analyzePage(targetUrl);

    if (!rawData.artifacts) {
      return res.status(500).json({ error: "scraper failed to get data" });
    }

    // step 2: pass raw data to scorer
    const scoringResult = calculateScores(rawData.artifacts);

    // step 3: pack the data so frontend can use it directly
    // mapping insights into their specific sections
    const packedDetails = scoringResult.scores.sections.map(section => {
      
      // find insights only for this specific category
      const sectionInsights = scoringResult.insights.filter(
        item => item.section === section.category
      );

      return {
        category: section.category,
        score: section.score,
        status: section.status,
        insights: sectionInsights // bundle them here!
      };
    });

    // step 4: build the final beautiful json
    const finalData = {
      url: targetUrl,
      overallScore: scoringResult.scores.overallScore,
      overallStatus: scoringResult.scores.overallStatus,
      details: packedDetails
    };

    console.log("all good! sending json straight back to frontend");
    
    // send response via network, NO fs.writeFile needed anymore!
    res.json(finalData);

  } catch (err) {
    console.log("server crashed:", err.message);
    res.status(500).json({ error: "something went wrong on server side" });
  }
});

// start server
app.listen(port, () => {
  console.log(`server is up and running on http://localhost:${port}`);
});