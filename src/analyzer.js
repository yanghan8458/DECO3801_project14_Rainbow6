const puppeteer = require("puppeteer");

async function analyzePage(url) {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  await page.goto(url, { waitUntil: "networkidle2", timeout: 0 });

  const data = await page.evaluate(() => {

    // ===== Basic element extraction =====
    function extractElements() {
      return {
        headings: [...document.querySelectorAll("h1,h2,h3,h4,h5,h6")]
          .map(el => el.innerText.trim())
          .filter(Boolean),

        paragraphs: [...document.querySelectorAll("p")]
          .map(el => el.innerText.trim())
          .filter(Boolean),

        links: [...document.querySelectorAll("a")]
          .map(el => el.href),

        buttons: [...document.querySelectorAll("button")]
          .map(el => el.innerText.trim()),

        images: [...document.querySelectorAll("img")]
          .map(el => el.src)
      };
    }

    // ===== DOM Structure =====
    function extractDOM(node, depth = 0) {
      if (!node || depth > 5) return null;

      return {
        tag: node.tagName,
        children: [...node.children].slice(0, 10).map(child =>
          extractDOM(child, depth + 1)
        )
      };
    }

    // ==============================
    //     Each alalyzer module
    // ==============================

    function analyzeLanguage() {
      const text = document.body.innerText || "";
      const words = text.split(/\s+/).filter(Boolean);
      const sentences = text.split(/[.!?]/).filter(s => s.trim());

      return {
        wordCount: words.length,
        sentenceCount: sentences.length,
        avgSentenceLength: sentences.length
          ? words.length / sentences.length
          : 0
      };
    }

    function analyzeLayout() {
      const elements = document.querySelectorAll("*");

      return {
        totalElements: elements.length
      };
    }

    function analyzeNavigation() {
      const navMenus = document.querySelectorAll("nav, ul, ol").length;

      const navDepth = Math.max(
        ...Array.from(document.querySelectorAll("ul")).map(ul => ul.children.length),
        0
      );

      return {
        menuCount: navMenus,
        maxDepth: navDepth
      };
    }

    function analyzeVisualHierarchy() {
      const headings = [...document.querySelectorAll("h1,h2,h3,h4,h5,h6")];

      const levels = headings.map(h =>
        parseInt(h.tagName.substring(1))
      );

      return {
        headingCount: headings.length,
        hierarchyRange: levels.length
          ? Math.max(...levels) - Math.min(...levels)
          : 0
      };
    }

    function analyzeInteraction() {
      const links = document.querySelectorAll("a").length;
      const buttons = document.querySelectorAll("button").length;

      return {
        linkCount: links,
        buttonCount: buttons,
        interactionLoad: links + buttons
      };
    }

    function analyzeAnimation() {
      const elements = [...document.querySelectorAll("*")];

      const animationCount = elements.filter(el => {
        const style = window.getComputedStyle(el);
        return style.animationName !== "none" ||
               style.transitionDuration !== "0s";
      }).length;

      return {
        animationCount
      };
    }

    function analyzeSpacing() {
      const paragraphs = [...document.querySelectorAll("p")];
      const text = document.body.innerText || "";
      const words = text.split(/\s+/).filter(Boolean);

      return {
        paragraphCount: paragraphs.length,
        avgParagraphLength: paragraphs.length
          ? words.length / paragraphs.length
          : 0
      };
    }

    function analyzeConsistency() {
      const buttons = [...document.querySelectorAll("button")];
      const classes = buttons.map(btn => btn.className);

      return {
        uniqueButtonStyles: new Set(classes).size
      };
    }

    function analyzeForms() {
      const inputs = document.querySelectorAll("input, textarea, select");

      return {
        fieldCount: inputs.length
      };
    }

    function analyzeErrorPrevention() {
      const text = document.body.innerText.toLowerCase();

      return {
        requiredFields: document.querySelectorAll("[required]").length,
        hasErrorMessage: text.includes("error")
      };
    }

    // ===== Final output (Artifacts structure) =====
    return {
      elements: extractElements(),
      domTree: extractDOM(document.body),

      analysis: {
        language: analyzeLanguage(),
        layout: analyzeLayout(),
        navigation: analyzeNavigation(),
        visualHierarchy: analyzeVisualHierarchy(),
        interaction: analyzeInteraction(),
        animation: analyzeAnimation(),
        spacing: analyzeSpacing(),
        consistency: analyzeConsistency(),
        forms: analyzeForms(),
        errorPrevention: analyzeErrorPrevention()
      }
    };
  });

  await browser.close();

  return {
    url,
    ...data
  };
}

module.exports = { analyzePage };
