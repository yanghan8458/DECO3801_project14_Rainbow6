// src/analyzer.js

const puppeteer = require("puppeteer");

async function analyzePage(url) {
  let browser;
  try {
    browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "networkidle2", timeout: 60000 });

    const artifacts = await page.evaluate(() => {

      /** 1. Clear Purpose Analysis */
      function analyzePurpose() {
        const title = document.title || "";
        const h1s = document.querySelectorAll("h1");
        const headings = document.querySelectorAll("h1, h2, h3, h4, h5, h6");

        // 2.4.2 Page Titled
        const titleWords = title.trim().split(/\s+/).filter(Boolean);
        const genericPatterns = /^(home|index|untitled|welcome|page)$/i;
        const pageTitleMeaningfulScore = (() => {
          if (!title.trim()) return 0;
          if (titleWords.length < 2) return 30;
          if (genericPatterns.test(title.trim())) return 40;
          if (titleWords.length >= 3 && (title.includes("|") || title.includes("-") || title.includes(":"))) return 100;
          if (titleWords.length >= 2) return 80;
          return 60;
        })();

        // 2.4.6 Headings and Labels
        const headingArr = Array.from(headings);
        const meaningfulHeadings = headingArr.filter(h => {
          const text = (h.innerText || h.textContent || "").trim();
          return text.split(/\s+/).filter(Boolean).length >= 2 && text.length > 4;
        });
        const headingMeaningfulScore = headingArr.length
          ? Math.round((meaningfulHeadings.length / headingArr.length) * 100)
          : 100;

        const allLabels = Array.from(document.querySelectorAll("label"));
        const labelCount = allLabels.length;

        const inputs = Array.from(document.querySelectorAll(
          "input:not([type='hidden']), textarea, select"
        ));
        const labeledInputs = inputs.filter(input => {
          if (input.closest("label")) return true;
          const id = input.id;
          if (id && document.querySelector(`label[for="${id}"]`)) return true;
          if (input.getAttribute("aria-label")) return true;
          if (input.getAttribute("aria-labelledby")) return true;
          return false;
        });
        const inputWithLabelRatio = inputs.length
          ? labeledInputs.length / inputs.length
          : 1;

        const meaningfulLabels = allLabels.filter(l => {
          const text = (l.innerText || l.textContent || "").trim().replace(/\*/g, "").trim();
          return text.length >= 2;
        });
        const labelMeaningfulScore = labelCount
          ? Math.round((meaningfulLabels.length / labelCount) * 100)
          : 100;

        return {
          titleExists: title.trim().length > 0,
          titleLength: title.trim().length,
          pageTitleMeaningfulScore,
          h1Count: h1s.length,
          headingCount: headings.length,
          headingMeaningfulScore,
          labelCount,
          inputWithLabelRatio,
          labelMeaningfulScore
        };
      }

      /** 2. Findable Analysis */
      function analyzeFindable() {
        const allLinks = Array.from(document.querySelectorAll("a[href]"));

        // 2.4.1 Bypass Blocks
        const hasSkipLink = allLinks.some(a =>
          /^#(main|content|skip|primary|maincontent)/i.test(a.getAttribute("href"))
        );
        const hasMainLandmark = !!document.querySelector("main, [role='main']");

        // 2.4.5 Multiple Ways
        const hasSearch =
          !!document.querySelector("input[type='search']") ||
          !!document.querySelector("[role='search']") ||
          !!document.querySelector("form[role='search']");

        const navCount = document.querySelectorAll("nav").length;

        const internalLinkCount = allLinks.filter(a => {
          const href = a.getAttribute("href") || "";
          return href.startsWith("/") || href.startsWith("#") ||
            href.startsWith(window.location.origin);
        }).length;

        const hasBreadcrumb =
          !!document.querySelector("[aria-label*='breadcrumb' i], [class*='breadcrumb' i], [itemtype*='BreadcrumbList']");

        // 2.4.7 Focus Visible
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
          hasMainLandmark,
          hasSearch,
          navCount,
          internalLinkCount,
          hasBreadcrumb,
          focusVisibleDetected
        };
      }

      /** 3. Media Analysis */
      function analyzeMedia() {
        const videos = Array.from(document.querySelectorAll("video"));
        const audios = Array.from(document.querySelectorAll("audio"));

        // 1.2.2 Captions
        const captionTrackCount = videos.reduce((count, v) => {
          return count + v.querySelectorAll("track[kind='captions']").length;
        }, 0);

        const videosWithCaptionsRatio = videos.length
          ? videos.filter(v => v.querySelector("track[kind='captions']")).length / videos.length
          : null;

        // 1.2.3 Audio Description
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
        const clone = document.body.cloneNode(true);
        clone.querySelectorAll("script, style, noscript").forEach(el => el.remove());

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
        // 1.4.8 Visual Presentation
        const elements = Array.from(document.querySelectorAll("*")).filter(el => {
          const style = window.getComputedStyle(el);
          return (
            style.display !== "none" &&
            style.visibility !== "hidden" &&
            style.opacity !== "0"
          );
        });

        const paragraphs = Array.from(document.querySelectorAll("p"));
        const lineLengthEstimate = paragraphs.length
          ? paragraphs.reduce((sum, p) => {
              const w = p.getBoundingClientRect().width;
              const fs = parseFloat(window.getComputedStyle(p).fontSize) || 16;
              return sum + w / (fs * 0.5);
            }, 0) / paragraphs.length
          : 0;

        let fontResizeSupport = false;
        try {
          for (const sheet of Array.from(document.styleSheets)) {
            try {
              for (const rule of Array.from(sheet.cssRules || [])) {
                if (rule.style && rule.style.fontSize && rule.style.fontSize.includes("em")) {
                  fontResizeSupport = true;
                }
              }
            } catch (_) { /* cross-origin sheet, skip */ }
          }
        } catch (_) { /* styleSheets access denied */ }

        return {
          lineLengthEstimate,
          contrastIssueCount: 0, // placeholder for future expansion
          visualDensityScore: elements.length,
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

        // 3.3.3 Error Suggestion
        const hasErrorMessage =
          !!document.querySelector("[role='alert'], [aria-live='assertive'], .error, .error-message, [aria-invalid='true']");

        return {
          formFieldCount: inputs.length,
          labelCoverage: inputs.length ? labels.length / inputs.length : 1,
          hasErrorMessage,
          requiredFieldCount: requiredFields.length
        };
      }

      /** 7. Distraction Analysis */
      function analyzeDistraction() {
        // 2.2.2 Pause, Stop, Hide
        const allElements = Array.from(document.querySelectorAll("*"));
        const animationCount = allElements.filter(el => {
          const style = window.getComputedStyle(el);
          return (
            (style.animationName && style.animationName !== "none") ||
            (style.transitionDuration && style.transitionDuration !== "0s")
          );
        }).length;

        const videos = Array.from(document.querySelectorAll("video"));
        const audios = Array.from(document.querySelectorAll("audio"));
        const autoplayMediaCount = [
          ...videos.filter(v => v.autoplay),
          ...audios.filter(a => a.autoplay)
        ].length;

        const metaRefresh = document.querySelector("meta[http-equiv='refresh']");
        const autoUpdatingContentCount =
          (metaRefresh ? 1 : 0) +
          document.querySelectorAll("[aria-live='polite'], [aria-live='assertive']").length;

        const hasPauseControl =
          !!document.querySelector(
            "button[aria-label*='pause' i], button[aria-label*='stop' i], button.pause, button.stop, [role='button'][aria-label*='pause' i]"
          );

        return {
          animationCount,
          autoplayMediaCount,
          autoUpdatingContentCount,
          hasPauseControl
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
    if (browser) await browser.close();
  }
}

module.exports = { analyzePage };
