// src/analyzer.js

const puppeteer = require("puppeteer");

async function analyzePage(url) {
  let browser;
  try {
    // Launch browser with basic sandbox safety
    browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    // Set a reasonable timeout and wait for network to settle
    await page.goto(url, { waitUntil: "networkidle2", timeout: 60000 });

    const artifacts = await page.evaluate(() => {

      /** 1. Language Complexity Analysis */
      function analyzeLanguage() {
        // Clone body to remove script/style tags so they don't pollute word counts
        const clone = document.body.cloneNode(true);
        const noise = clone.querySelectorAll('script, style, noscript');
        noise.forEach(el => el.remove());
        
        const text = clone.innerText || "";
        const words = text.split(/\s+/).filter(Boolean);
        const sentences = text.split(/[.!?]/).filter(s => s.trim());

        return {
          sentenceAverageLength: sentences.length ? words.length / sentences.length : 0,
          complexWordRatio: words.length ? words.filter(w => w.length > 10).length / words.length : 0
        };
      }

      /** 2. Visual Density Analysis */
      function analyzeVisual() {
        // Filter for visible elements only to get an accurate density score
        const elements = Array.from(document.querySelectorAll("*")).filter(el => {
          const style = window.getComputedStyle(el);
          return style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0';
        });

        return {
          visualDensityScore: elements.length,
          contrastIssueCount: 0 // placeholder for future expansion
        };
      }

      /** 3. Form Accessibility Analysis */
      function analyzeForms() {
        const inputs = document.querySelectorAll("input:not([type='hidden']), textarea, select");
        const labels = document.querySelectorAll("label");

        return {
          labelCoverage: inputs.length ? labels.length / inputs.length : 1
        };
      }

      /** 4. Media Content Analysis */
      function analyzeMedia() {
        const videos = document.querySelectorAll("video");

        if (videos.length === 0) {
          return {
            videosWithCaptionsRatio: null,
            autoplayMediaCount: 0
          };
        }

        const videosWithCaptions = [...videos].filter(v =>
         v.querySelector("track[kind='captions']")
        );

        return {
          videosWithCaptionsRatio:
          videosWithCaptions.length / videos.length,
          autoplayMediaCount: [...videos].filter(v => v.autoplay).length
        };
      }

      /** 5. Navigation Structure Analysis */
      function analyzeNavigation() {
        // Calculate max depth of nested lists to determine nav complexity
        const uls = document.querySelectorAll("ul");
        
        function getDepth(node) {
          let depth = 0;
          if (node.children) {
            for (let child of node.children) {
              depth = Math.max(depth, getDepth(child));
            }
          }
          return 1 + depth;
        }

        let maxDepth = 0;
        const topLevels = document.querySelectorAll("nav > ul, body > ul");
        topLevels.forEach(list => {
          maxDepth = Math.max(maxDepth, getDepth(list));
        });

        return {
          // Fallback to total count if no structured list found
          maxDepth: maxDepth || uls.length
        };
      }

      return {
        language: analyzeLanguage(),
        visual: analyzeVisual(),
        forms: analyzeForms(),
        media: analyzeMedia(),
        navigation: analyzeNavigation()
      };
    });

    return { url, artifacts };

  } catch (error) {
    console.error(`Analysis failed: ${error.message}`);
    return { url, error: error.message };
  } finally {
    // Ensure browser always closes to prevent memory leaks
    if (browser) await browser.close();
  }
}

module.exports = { analyzePage };
