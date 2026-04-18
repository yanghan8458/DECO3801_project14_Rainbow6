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

      /** 1. Clear Purpose Analysis */
      function analyzePurpose() {
        const title = document.title || "";
        const h1s = document.querySelectorAll("h1");
        const headings = document.querySelectorAll("h1, h2, h3, h4, h5, h6");
        const navs = document.querySelectorAll("nav");

        return {
          titleExists: title.trim().length > 0,
          titleLength: title.trim().length,
          h1Count: h1s.length,
          headingCount: headings.length,
          navCount: navs.length
        };
      }

      /** 2. Findable Analysis */
      function analyzeFindable() {
        // Check for skip links (href="#main", "#content", etc.)
        const allLinks = Array.from(document.querySelectorAll("a[href]"));
        const hasSkipLink = allLinks.some(a =>
          /^#(main|content|skip|primary|maincontent)/i.test(a.getAttribute("href"))
        );

        // Check for search input
        const hasSearch =
          !!document.querySelector("input[type='search']") ||
          !!document.querySelector("[role='search']") ||
          !!document.querySelector("form[role='search']");

        const headings = document.querySelectorAll("h1, h2, h3, h4, h5, h6");
        const navs = document.querySelectorAll("nav");

        // Count internal links (same-origin or relative)
        const internalLinkCount = allLinks.filter(a => {
          const href = a.getAttribute("href") || "";
          return href.startsWith("/") || href.startsWith("#") ||
            href.startsWith(window.location.origin);
        }).length;

        // Focus visible: check if any element has a non-none outline on :focus
        // Approximated by checking stylesheet rules for :focus outline
        let focusVisibleDetected = false;
        try {
          for (const sheet of Array.from(document.styleSheets)) {
            try {
              for (const rule of Array.from(sheet.cssRules || [])) {
                if (
                  rule.selectorText &&
                  rule.selectorText.includes(":focus") &&
                  rule.style &&
                  rule.style.outline !== "none" &&
                  rule.style.outline !== "0"
                ) {
                  focusVisibleDetected = true;
                }
              }
            } catch (_) { /* cross-origin sheet, skip */ }
          }
        } catch (_) { /* styleSheets access denied, skip */ }

        return {
          hasSkipLink,
          hasSearch,
          headingCount: headings.length,
          navCount: navs.length,
          internalLinkCount,
          focusVisibleDetected
        };
      }

      /** 3. Media Analysis */
      function analyzeMedia() {
        const videos = Array.from(document.querySelectorAll("video"));
        const audios = Array.from(document.querySelectorAll("audio"));

        const captionTrackCount = videos.reduce((count, v) => {
          return count + v.querySelectorAll("track[kind='captions']").length;
        }, 0);

        const videosWithCaptionsRatio = videos.length
          ? videos.filter(v => v.querySelector("track[kind='captions']")).length / videos.length
          : null;

        // Transcript links: look for links near media containing "transcript"
        const allLinks = Array.from(document.querySelectorAll("a"));
        const transcriptLinkCount = allLinks.filter(a =>
          /transcript/i.test(a.textContent) || /transcript/i.test(a.getAttribute("href") || "")
        ).length;

        const autoplayMediaCount = [
          ...videos.filter(v => v.autoplay),
          ...audios.filter(a => a.autoplay)
        ].length;

        return {
          videoCount: videos.length,
          audioCount: audios.length,
          captionTrackCount,
          videosWithCaptionsRatio,
          transcriptLinkCount,
          autoplayMediaCount
        };
      }

      /** 4. Clear Language Analysis */
      function analyzeLanguage() {
        // Clone body to remove script/style tags so they don't pollute word counts
        const clone = document.body.cloneNode(true);
        const noise = clone.querySelectorAll("script, style, noscript");
        noise.forEach(el => el.remove());

        const text = clone.innerText || "";
        const words = text.split(/\s+/).filter(Boolean);
        const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
        const paragraphs = Array.from(document.querySelectorAll("p")).filter(
          p => p.innerText && p.innerText.trim().length > 0
        );

        const sentenceAverageLength = sentences.length
          ? words.length / sentences.length
          : 0;

        const paragraphAverageLength = paragraphs.length
          ? paragraphs.reduce((sum, p) => {
              return sum + (p.innerText.split(/\s+/).filter(Boolean).length);
            }, 0) / paragraphs.length
          : 0;

        const complexWordRatio = words.length
          ? words.filter(w => w.length > 10).length / words.length
          : 0;

        // Flesch-Kincaid readability approximation
        // FK Grade = 0.39 * (words/sentences) + 11.8 * (syllables/words) - 15.59
        function countSyllables(word) {
          word = word.toLowerCase().replace(/[^a-z]/g, "");
          if (!word) return 0;
          const vowelGroups = word.match(/[aeiouy]+/g);
          let count = vowelGroups ? vowelGroups.length : 1;
          if (word.endsWith("e") && count > 1) count--;
          return Math.max(1, count);
        }
        const totalSyllables = words.reduce((sum, w) => sum + countSyllables(w), 0);
        const fkGrade = sentences.length && words.length
          ? 0.39 * (words.length / sentences.length) +
            11.8 * (totalSyllables / words.length) - 15.59
          : 0;
        // Convert FK grade to a 0–100 readability score (lower grade = higher score)
        const readabilityScore = Math.max(0, Math.min(100, Math.round(100 - fkGrade * 5)));

        const langAttributeExists = !!document.documentElement.getAttribute("lang");

        return {
          readabilityScore,
          sentenceAverageLength,
          paragraphAverageLength,
          complexWordRatio,
          langAttributeExists
        };
      }

      /** 5. Visual Presentation Analysis */
      function analyzeVisual() {
        // Filter for visible elements only to get an accurate density score
        const elements = Array.from(document.querySelectorAll("*")).filter(el => {
          const style = window.getComputedStyle(el);
          return (
            style.display !== "none" &&
            style.visibility !== "hidden" &&
            style.opacity !== "0"
          );
        });

        // Estimate line length: average ch width of paragraph elements
        const paragraphs = Array.from(document.querySelectorAll("p"));
        const lineLengthEstimate = paragraphs.length
          ? paragraphs.reduce((sum, p) => {
              const w = p.getBoundingClientRect().width;
              const fs = parseFloat(window.getComputedStyle(p).fontSize) || 16;
              return sum + w / (fs * 0.5); // rough char estimate
            }, 0) / paragraphs.length
          : 0;

        // Text spacing support: check if any style sets letter-spacing / line-height
        let textSpacingSupport = false;
        let fontResizeSupport = false;
        try {
          for (const sheet of Array.from(document.styleSheets)) {
            try {
              for (const rule of Array.from(sheet.cssRules || [])) {
                if (rule.style) {
                  if (rule.style.letterSpacing || rule.style.lineHeight) {
                    textSpacingSupport = true;
                  }
                  if (rule.style.fontSize && rule.style.fontSize.includes("em")) {
                    fontResizeSupport = true;
                  }
                }
              }
            } catch (_) { /* cross-origin sheet, skip */ }
          }
        } catch (_) { /* styleSheets access denied */ }

        // Reflow support: check viewport meta for width=device-width
        const viewportMeta = document.querySelector("meta[name='viewport']");
        const reflowSupport = viewportMeta
          ? /width=device-width/i.test(viewportMeta.getAttribute("content") || "")
          : false;

        // Whitespace score: ratio of empty/whitespace-only text nodes (rough proxy)
        const allParas = document.querySelectorAll("p, li, td, th");
        const whitespaceScore = allParas.length
          ? Math.min(
              100,
              Math.round(
                (Array.from(allParas).filter(el => {
                  const style = window.getComputedStyle(el);
                  const lh = parseFloat(style.lineHeight);
                  const fs = parseFloat(style.fontSize);
                  return lh / fs >= 1.4;
                }).length /
                  allParas.length) *
                  100
              )
            )
          : 100;

        return {
          lineLengthEstimate,
          textSpacingSupport,
          reflowSupport,
          contrastIssueCount: 0, // placeholder for future expansion
          visualDensityScore: elements.length,
          whitespaceScore,
          fontResizeSupport
        };
      }

      /** 6. Assistance & Support Analysis */
      function analyzeAssistance() {
        const inputs = document.querySelectorAll(
          "input:not([type='hidden']), textarea, select"
        );
        const labels = document.querySelectorAll("label");
        const requiredFields = document.querySelectorAll(
          "input[required], textarea[required], select[required]"
        );

        // Error message: look for ARIA live regions or common error class patterns
        const hasErrorMessage =
          !!document.querySelector("[role='alert'], [aria-live='assertive'], .error, .error-message, [aria-invalid='true']");

        // Error suggestion: look for helper text or description linked via aria-describedby
        const hasErrorSuggestion =
          !!document.querySelector("[aria-describedby], .field-hint, .helper-text, .error-suggestion");

        // Review step: look for a step/review/summary page pattern
        const bodyText = (document.body.innerText || "").toLowerCase();
        const hasReviewStep =
          /review|confirm your|check your|summary/i.test(bodyText);

        // Confirmation step: thank-you or success messaging
        const hasConfirmationStep =
          /thank you|submission received|successfully submitted|order confirmed/i.test(bodyText);

        // Undo option: look for undo/cancel/go back controls
        const hasUndoOption =
          !!document.querySelector("[aria-label*='undo' i], button.undo, a.cancel") ||
          /undo|cancel|go back/i.test(bodyText);

        return {
          formFieldCount: inputs.length,
          requiredFieldCount: requiredFields.length,
          labelCoverage: inputs.length ? labels.length / inputs.length : 1,
          hasErrorMessage,
          hasErrorSuggestion,
          hasReviewStep,
          hasConfirmationStep,
          hasUndoOption
        };
      }

      /** 7. Distraction Analysis */
      function analyzeDistraction() {
        // Animated / moving elements: CSS animations and transitions
        const allElements = Array.from(document.querySelectorAll("*"));
        const animationCount = allElements.filter(el => {
          const style = window.getComputedStyle(el);
          return (
            style.animationName && style.animationName !== "none" ||
            (style.transitionDuration && style.transitionDuration !== "0s")
          );
        }).length;

        // Flashing: elements with very fast animation (< 333ms = > 3Hz)
        const flashingElementCount = allElements.filter(el => {
          const style = window.getComputedStyle(el);
          const dur = parseFloat(style.animationDuration);
          return !isNaN(dur) && dur > 0 && dur < 0.334;
        }).length;

        // Auto-updating: look for meta refresh or JS-driven countdowns
        const metaRefresh = document.querySelector("meta[http-equiv='refresh']");
        const autoUpdatingContentCount =
          (metaRefresh ? 1 : 0) +
          document.querySelectorAll("[aria-live='polite'], [aria-live='assertive']").length;

        // Videos/audio with autoplay (shared with media section, kept here for distraction scoring)
        const videos = Array.from(document.querySelectorAll("video"));
        const audios = Array.from(document.querySelectorAll("audio"));
        const autoplayMediaCount = [
          ...videos.filter(v => v.autoplay),
          ...audios.filter(a => a.autoplay)
        ].length;

        // Pause control: look for pause/stop/hide buttons near animated content
        const hasPauseControl =
          !!document.querySelector(
            "button[aria-label*='pause' i], button[aria-label*='stop' i], button.pause, button.stop, [role='button'][aria-label*='pause' i]"
          );

        // Timed interactions: session timeout warnings, countdown timers
        const bodyText = (document.body.innerText || "").toLowerCase();
        const timedInteractionCount = (
          (document.querySelectorAll("[data-countdown], .countdown, .timer").length) +
          (/session.*expire|time.*limit|time.*remaining/i.test(bodyText) ? 1 : 0)
        );

        // Option to extend time
        const hasExtendTimeOption =
          /extend.*time|more time|need more time|session.*extend/i.test(bodyText) ||
          !!document.querySelector("[aria-label*='extend' i]");

        return {
          animationCount,
          flashingElementCount,
          autoplayMediaCount,
          autoUpdatingContentCount,
          hasPauseControl,
          timedInteractionCount,
          hasExtendTimeOption
        };
      }

      return {
        purpose: analyzePurpose(),
        findable: analyzeFindable(),
        media: analyzeMedia(),
        language: analyzeLanguage(),
        visual: analyzeVisual(),
        assistance: analyzeAssistance(),
        distraction: analyzeDistraction()
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
