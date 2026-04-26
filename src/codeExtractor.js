// src/codeExtractor.js
//
// Extracts concrete "bad code" snippets from a live page via Puppeteer.
// Decoupled from analyzer.js: analyzer handles scoring metrics,
// codeExtractor handles raw DOM evidence for AI-driven fix suggestions.
//
// Usage:
//   const { extractCodeIssues } = require("./codeExtractor");
//   const codeIssues = await extractCodeIssues(url);
//
// Return shape:
//   {
//     url,
//     issues: [
//       {
//         ruleId,       // unique rule identifier
//         wcag,         // WCAG success criterion
//         severity,     // "critical" | "serious" | "moderate" | "minor"
//         category,     // dimension aligned with scorer sections
//         description,  // human-readable problem summary
//         snippet,      // outerHTML of the offending element (truncated to 500 chars)
//         selector,     // best-effort CSS selector path
//         fix           // plain-language fix direction for AI skill context
//       }
//     ]
//   }

const puppeteer = require("puppeteer");

async function extractCodeIssues(url) {
  let browser;
  try {
    browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "networkidle2", timeout: 60000 });

    const issues = await page.evaluate(() => {

      // -- Utilities ----------------------------------------------------------

      // Build a short CSS path (up to 3 ancestor levels)
      function cssPath(el) {
        if (!el || el === document.body) return "body";
        const parts = [];
        let node = el;
        for (let i = 0; i < 3 && node && node !== document.body; i++) {
          let seg = node.tagName.toLowerCase();
          if (node.id) { seg += `#${node.id}`; parts.unshift(seg); break; }
          if (node.className && typeof node.className === "string") {
            const cls = node.className.trim().split(/\s+/)[0];
            if (cls) seg += `.${cls}`;
          }
          parts.unshift(seg);
          node = node.parentElement;
        }
        return parts.join(" > ") || el.tagName.toLowerCase();
      }

      // Truncate outerHTML to keep JSON size manageable
      function snap(el) {
        const html = el.outerHTML || "";
        return html.length > 500 ? html.slice(0, 500) + "..." : html;
      }

      const found = [];

      // -- 1. CLEAR PURPOSE --------------------------------------------------

      // 1-A: img missing alt, or non-decorative img with empty alt
      document.querySelectorAll("img").forEach(img => {
        const alt  = img.getAttribute("alt");
        const role = img.getAttribute("role");
        const isDecorative = alt === "" && role !== "img";

        if (alt === null) {
          found.push({
            ruleId:      "img-missing-alt",
            wcag:        "1.1.1 Non-text Content",
            severity:    "critical",
            category:    "purpose",
            description: "img element is missing an alt attribute",
            snippet:     snap(img),
            selector:    cssPath(img),
            fix:         "Add a descriptive alt attribute. Use alt=\"\" only for purely decorative images."
          });
        } else if (!isDecorative && alt.trim().length < 2) {
          found.push({
            ruleId:      "img-empty-alt-non-decorative",
            wcag:        "1.1.1 Non-text Content",
            severity:    "serious",
            category:    "purpose",
            description: "Non-decorative img has an empty or too-short alt attribute",
            snippet:     snap(img),
            selector:    cssPath(img),
            fix:         "Provide meaningful alt text that conveys the image content or purpose."
          });
        }
      });

      // 1-B: H1 count anomaly
      const h1s = document.querySelectorAll("h1");
      if (h1s.length === 0) {
        found.push({
          ruleId:      "missing-h1",
          wcag:        "2.4.6 Headings and Labels",
          severity:    "serious",
          category:    "purpose",
          description: "Page has no H1 element",
          snippet:     "<!-- no <h1> detected -->",
          selector:    "body",
          fix:         "Add a single <h1> inside the main content area that describes the page topic."
        });
      } else if (h1s.length > 3) {
        h1s.forEach(h => {
          found.push({
            ruleId:      "multiple-h1",
            wcag:        "2.4.6 Headings and Labels",
            severity:    "moderate",
            category:    "purpose",
            description: `Page contains ${h1s.length} H1 elements (recommended: 1)`,
            snippet:     snap(h),
            selector:    cssPath(h),
            fix:         "Demote secondary headings to H2/H3 and keep only one H1 per page."
          });
        });
      }

      // 1-C: Heading level skips (e.g. H2 directly followed by H4)
      const headings = Array.from(document.querySelectorAll("h1,h2,h3,h4,h5,h6"));
      let prevLevel = 0;
      headings.forEach(h => {
        const level = parseInt(h.tagName[1]);
        if (prevLevel > 0 && level > prevLevel + 1) {
          found.push({
            ruleId:      "heading-level-skip",
            wcag:        "2.4.6 Headings and Labels",
            severity:    "moderate",
            category:    "purpose",
            description: `Heading level jumps from H${prevLevel} to H${level}`,
            snippet:     snap(h),
            selector:    cssPath(h),
            fix:         `Change this heading to H${prevLevel + 1} or insert the missing intermediate level.`
          });
        }
        prevLevel = level;
      });

      // 1-D: Form input missing associated label
      document.querySelectorAll("input:not([type='hidden']), textarea, select").forEach(input => {
        const hasLabel =
          input.closest("label") ||
          (input.id && document.querySelector(`label[for="${input.id}"]`)) ||
          input.getAttribute("aria-label") ||
          input.getAttribute("aria-labelledby");

        if (!hasLabel) {
          found.push({
            ruleId:      "input-missing-label",
            wcag:        "2.4.6 Headings and Labels",
            severity:    "critical",
            category:    "purpose",
            description: "Form control has no associated label",
            snippet:     snap(input),
            selector:    cssPath(input),
            fix:         "Associate a <label for=\"id\"> or add aria-label / aria-labelledby to this input."
          });
        }
      });

      // -- 2. FINDABLE -------------------------------------------------------

      // 2-A: Anchor with no accessible text
      document.querySelectorAll("a").forEach(a => {
        const text           = (a.innerText || "").trim();
        const ariaLabel      = a.getAttribute("aria-label");
        const ariaLabelledBy = a.getAttribute("aria-labelledby");
        const hasImgAlt      = a.querySelector("img[alt]");

        if (!text && !ariaLabel && !ariaLabelledBy && !hasImgAlt) {
          found.push({
            ruleId:      "link-empty",
            wcag:        "2.4.4 Link Purpose",
            severity:    "serious",
            category:    "findable",
            description: "Link has no visible text or accessible label; users cannot determine its purpose",
            snippet:     snap(a),
            selector:    cssPath(a),
            fix:         "Add descriptive link text or an aria-label that describes the link destination."
          });
        }
      });

      // 2-B: Generic link text ("click here", "more", etc.)
      const genericLinkPattern = /^(click here|here|more|read more|learn more)$/i;
      document.querySelectorAll("a").forEach(a => {
        const text = (a.innerText || "").trim();
        if (genericLinkPattern.test(text)) {
          found.push({
            ruleId:      "link-generic-text",
            wcag:        "2.4.4 Link Purpose",
            severity:    "moderate",
            category:    "findable",
            description: `Link text "${text}" is non-descriptive and meaningless out of context`,
            snippet:     snap(a),
            selector:    cssPath(a),
            fix:         "Replace with specific text that describes the destination, e.g. \"View 2024 Annual Report\"."
          });
        }
      });

      // -- 3. MEDIA ----------------------------------------------------------

      // 3-A: video missing caption track
      document.querySelectorAll("video").forEach(video => {
        const hasCaptions = video.querySelector("track[kind='captions'], track[kind='subtitles']");
        if (!hasCaptions) {
          found.push({
            ruleId:      "video-missing-captions",
            wcag:        "1.2.2 Captions",
            severity:    "critical",
            category:    "media",
            description: "Video element has no caption track",
            snippet:     snap(video),
            selector:    cssPath(video),
            fix:         "Add <track kind=\"captions\" src=\"captions.vtt\" srclang=\"en\" label=\"English\"> inside the <video>."
          });
        }
      });

      // 3-B: Autoplay media without muted + controls
      document.querySelectorAll("video[autoplay], audio[autoplay]").forEach(el => {
        const isMuted     = el.hasAttribute("muted");
        const hasControls = el.hasAttribute("controls");
        if (!isMuted || !hasControls) {
          found.push({
            ruleId:      "autoplay-without-control",
            wcag:        "2.2.2 Pause, Stop, Hide",
            severity:    "serious",
            category:    "media",
            description: "Media element uses autoplay without muted attribute or user controls",
            snippet:     snap(el),
            selector:    cssPath(el),
            fix:         "Add the muted attribute and keep controls, or remove autoplay entirely."
          });
        }
      });

      // -- 4. CLEAR LANGUAGE -------------------------------------------------

      // 4-A: html element missing lang attribute
      if (!document.documentElement.getAttribute("lang")) {
        const cls = document.documentElement.getAttribute("class");
        found.push({
          ruleId:      "html-missing-lang",
          wcag:        "3.1.1 Language of Page",
          severity:    "serious",
          category:    "language",
          description: "<html> element is missing the lang attribute",
          snippet:     `<html${cls ? ` class="${cls}"` : ""}>`,
          selector:    "html",
          fix:         "Add lang=\"en\" (or the appropriate BCP 47 tag) to the <html> element."
        });
      }

      // -- 5. VISUAL PRESENTATION --------------------------------------------

      // 5-A: Inline style removes focus outline
      document.querySelectorAll("[style]").forEach(el => {
        const style = el.getAttribute("style") || "";
        if (/outline\s*:\s*none|outline\s*:\s*0/i.test(style)) {
          found.push({
            ruleId:      "inline-outline-none",
            wcag:        "2.4.7 Focus Visible",
            severity:    "serious",
            category:    "visual",
            description: "Element removes focus outline via inline style (outline: none)",
            snippet:     snap(el),
            selector:    cssPath(el),
            fix:         "Remove outline:none. Provide a custom visible focus style using :focus-visible in CSS instead."
          });
        }
      });

      // 5-B: Inline style sets text-align: justify
      document.querySelectorAll("[style]").forEach(el => {
        const style = el.getAttribute("style") || "";
        if (/text-align\s*:\s*justify/i.test(style)) {
          found.push({
            ruleId:      "inline-text-justify",
            wcag:        "1.4.8 Visual Presentation",
            severity:    "moderate",
            category:    "visual",
            description: "Element uses text-align:justify via inline style, creating uneven word spacing (river effect)",
            snippet:     snap(el),
            selector:    cssPath(el),
            fix:         "Switch to text-align:left or text-align:start for better readability."
          });
        }
      });

      // -- 6. ASSISTANCE & SUPPORT -------------------------------------------

      // 6-A: button with no accessible name
      document.querySelectorAll("button").forEach(btn => {
        const text           = (btn.innerText || "").trim();
        const ariaLabel      = btn.getAttribute("aria-label");
        const ariaLabelledBy = btn.getAttribute("aria-labelledby");
        const hasImgAlt      = btn.querySelector("img[alt]");

        if (!text && !ariaLabel && !ariaLabelledBy && !hasImgAlt) {
          found.push({
            ruleId:      "button-empty",
            wcag:        "4.1.2 Name, Role, Value",
            severity:    "critical",
            category:    "assistance",
            description: "Button element has no accessible name",
            snippet:     snap(btn),
            selector:    cssPath(btn),
            fix:         "Add visible button text or an aria-label that describes the button action."
          });
        }
      });

      // 6-B: input[type=submit] missing or generic value
      document.querySelectorAll("input[type='submit'], input[type='button']").forEach(input => {
        const val        = (input.value || "").trim();
        const genericVal = /^(submit|button|go|ok|yes)$/i;

        if (!val) {
          found.push({
            ruleId:      "submit-missing-label",
            wcag:        "4.1.2 Name, Role, Value",
            severity:    "serious",
            category:    "assistance",
            description: "Submit button has no value attribute",
            snippet:     snap(input),
            selector:    cssPath(input),
            fix:         "Set a descriptive value attribute, e.g. value=\"Send contact form\"."
          });
        } else if (genericVal.test(val)) {
          found.push({
            ruleId:      "submit-generic-label",
            wcag:        "4.1.2 Name, Role, Value",
            severity:    "minor",
            category:    "assistance",
            description: `Submit button value="${val}" is too generic and may confuse users when multiple forms exist on the page`,
            snippet:     snap(input),
            selector:    cssPath(input),
            fix:         "Use a more specific value, e.g. value=\"Place order\" or value=\"Create account\"."
          });
        }
      });

      // 6-C: form inputs not linked to error/hint text via ARIA
      document.querySelectorAll("form").forEach(form => {
        const inputs = form.querySelectorAll("input:not([type='hidden']), textarea, select");
        const hasAriaLinked = Array.from(inputs).some(i =>
          i.hasAttribute("aria-describedby") || i.hasAttribute("aria-errormessage")
        );

        if (inputs.length > 0 && !hasAriaLinked) {
          found.push({
            ruleId:      "form-no-aria-validation",
            wcag:        "3.3.1 Error Identification",
            severity:    "moderate",
            category:    "assistance",
            description: "Form inputs are not linked to error or hint text via ARIA",
            snippet:     snap(form),
            selector:    cssPath(form),
            fix:         "Give each error message container a unique id and add aria-describedby=\"that-id\" to the corresponding input."
          });
        }
      });

      // -- 7. DISTRACTION ----------------------------------------------------

      // 7-A: Deprecated moving elements (<marquee>, <blink>)
      document.querySelectorAll("marquee, blink").forEach(el => {
        found.push({
          ruleId:      "deprecated-moving-element",
          wcag:        "2.2.2 Pause, Stop, Hide",
          severity:    "critical",
          category:    "distraction",
          description: `Deprecated <${el.tagName.toLowerCase()}> element produces unstoppable moving content`,
          snippet:     snap(el),
          selector:    cssPath(el),
          fix:         `Remove <${el.tagName.toLowerCase()}>. Use a CSS animation with a pause/stop control instead.`
        });
      });

      // 7-B: GIF images (potential infinite-loop distraction)
      document.querySelectorAll("img[src]").forEach(img => {
        if (/\.gif(\?.*)?$/i.test(img.getAttribute("src"))) {
          found.push({
            ruleId:      "gif-image",
            wcag:        "2.2.2 Pause, Stop, Hide",
            severity:    "moderate",
            category:    "distraction",
            description: "GIF image detected; may loop indefinitely and distract users",
            snippet:     snap(img),
            selector:    cssPath(img),
            fix:         "Replace with a static image or a CSS animation that respects prefers-reduced-motion."
          });
        }
      });

      return found;
    });

    return { url, issues };

  } catch (error) {
    console.error(`Code extraction failed: ${error.message}`);
    return { url, issues: [], error: error.message };
  } finally {
    if (browser) await browser.close();
  }
}

module.exports = { extractCodeIssues };
