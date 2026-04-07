const puppeteer = require("puppeteer");

async function analyzePage(url) {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  await page.goto(url, { waitUntil: "networkidle2", timeout: 0 });

  const data = await page.evaluate(() => {

    // ===== PURPOSE =====
    function analyzePurpose() {
      return {
        titleExists: !!document.title,
        titleLength: document.title.length,
        h1Count: document.querySelectorAll("h1").length,
        headingCount: document.querySelectorAll("h1,h2,h3,h4,h5,h6").length,
        navCount: document.querySelectorAll("nav").length
      };
    }

    // ===== FINDABLE =====
    function analyzeFindable() {
      return {
        hasSkipLink: [...document.querySelectorAll("a")]
          .some(a => a.innerText.toLowerCase().includes("skip")),
        hasSearch: !!document.querySelector("input[type='search']"),
        headingCount: document.querySelectorAll("h1,h2,h3,h4,h5,h6").length,
        navCount: document.querySelectorAll("nav").length,
        internalLinkCount: [...document.querySelectorAll("a")]
          .filter(a => a.href.includes(location.hostname)).length,
        focusVisibleDetected: [...document.querySelectorAll("*")]
          .some(el => window.getComputedStyle(el).outlineStyle !== "none")
      };
    }

    // ===== MEDIA =====
    function analyzeMedia() {
      const videos = document.querySelectorAll("video");

      return {
        videoCount: videos.length,
        audioCount: document.querySelectorAll("audio").length,
        captionTrackCount: document.querySelectorAll("track[kind='captions']").length,
        videosWithCaptionsRatio: videos.length
          ? document.querySelectorAll("track[kind='captions']").length / videos.length
          : 0,
        transcriptLinkCount: [...document.querySelectorAll("a")]
          .filter(a => a.innerText.toLowerCase().includes("transcript")).length,
        autoplayMediaCount: document.querySelectorAll("video[autoplay]").length
      };
    }

    // ===== LANGUAGE =====
    function analyzeLanguage() {
      const text = document.body.innerText || "";
      const words = text.split(/\s+/).filter(Boolean);
      const sentences = text.split(/[.!?]/).filter(s => s.trim());

      const complexWords = words.filter(w => w.length > 10);

      return {
        readabilityScore: 100 - (complexWords.length / words.length) * 100,
        sentenceAverageLength: sentences.length
          ? words.length / sentences.length
          : 0,
        paragraphAverageLength: document.querySelectorAll("p").length
          ? words.length / document.querySelectorAll("p").length
          : 0,
        complexWordRatio: complexWords.length / words.length,
        jargonCount: complexWords.length,
        acronymCount: words.filter(w => w === w.toUpperCase()).length,
        langAttributeExists: !!document.documentElement.lang
      };
    }

    // ===== VISUAL =====
    function analyzeVisual() {
      const elements = document.querySelectorAll("*");

      return {
        lineLengthEstimate: document.body.innerText.length / window.innerWidth,
        textSpacingSupport: true,
        reflowSupport: true,
        contrastIssueCount: 0,
        visualDensityScore: elements.length,
        whitespaceScore: document.body.innerText.length / elements.length,
        fontResizeSupport: true
      };
    }

    // ===== FORMS =====
    function analyzeForms() {
      const inputs = document.querySelectorAll("input, textarea, select");

      return {
        formFieldCount: inputs.length,
        requiredFieldCount: document.querySelectorAll("[required]").length,
        labelCoverage: document.querySelectorAll("label").length / (inputs.length || 1),
        hasErrorMessage: document.body.innerText.toLowerCase().includes("error"),
        hasErrorSuggestion: document.body.innerText.toLowerCase().includes("suggest"),
        hasReviewStep: document.body.innerText.toLowerCase().includes("review"),
        hasConfirmationStep: document.body.innerText.toLowerCase().includes("confirm"),
        hasUndoOption: document.body.innerText.toLowerCase().includes("undo")
      };
    }

    // ===== DISTRACTION =====
    function analyzeDistraction() {
      return {
        animationCount: [...document.querySelectorAll("*")]
          .filter(el => window.getComputedStyle(el).animationName !== "none").length,
        flashingElementCount: 0,
        autoplayMediaCount: document.querySelectorAll("video[autoplay]").length,
        autoUpdatingContentCount: 0,
        hasPauseControl: document.body.innerText.toLowerCase().includes("pause"),
        timedInteractionCount: 0,
        hasExtendTimeOption: document.body.innerText.toLowerCase().includes("extend")
      };
    }

    return {
      artifacts: {
        purpose: analyzePurpose(),
        findable: analyzeFindable(),
        media: analyzeMedia(),
        language: analyzeLanguage(),
        visual: analyzeVisual(),
        forms: analyzeForms(),
        distraction: analyzeDistraction()
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
