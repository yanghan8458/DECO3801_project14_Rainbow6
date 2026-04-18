// mapping.js

const mapping = {

  // ===== 1. CLEAR PURPOSE =====
  titleExists: {
    type: "boolean",
    good: true,
    weight: 2,
    problem: "Page has no title",
    suggestion: "Add a descriptive <title> tag to the page",
    wcag: "2.4.2 Page Titled",
    iso: "Effectiveness"
  },

  titleLength: {
    type: "range",
    ideal: 30,
    max: 70,
    weight: 1,
    problem: "Page title is too short or missing",
    suggestion: "Use a descriptive title between 10–70 characters",
    wcag: "2.4.2 Page Titled",
    iso: "Effectiveness"
  },

  h1Count: {
    type: "range",
    ideal: 1,
    max: 3,
    weight: 1.5,
    problem: "Page has no H1 or too many H1s",
    suggestion: "Use exactly one H1 to define the main page topic",
    wcag: "2.4.6 Headings and Labels",
    iso: "Effectiveness"
  },

  headingCount: {
    type: "range",
    ideal: 5,
    max: 30,
    weight: 1,
    problem: "Too few or too many headings",
    suggestion: "Use headings to structure content clearly",
    wcag: "2.4.6 Headings and Labels",
    iso: "Efficiency"
  },

  navCount: {
    type: "range",
    ideal: 1,
    max: 4,
    weight: 1,
    problem: "No navigation landmark or too many nav regions",
    suggestion: "Use one primary <nav> element for consistent navigation",
    wcag: "3.2.3 Consistent Navigation",
    iso: "Efficiency"
  },


  // ===== 2. FINDABLE =====
  hasSkipLink: {
    type: "boolean",
    good: true,
    weight: 1.5,
    problem: "No skip link detected",
    suggestion: "Add a 'Skip to main content' link at the top of the page",
    wcag: "2.4.1 Bypass Blocks",
    iso: "Efficiency"
  },

  hasSearch: {
    type: "boolean",
    good: true,
    weight: 1.2,
    problem: "No search functionality detected",
    suggestion: "Add a search input or site search to help users locate content",
    wcag: "2.4.5 Multiple Ways",
    iso: "Efficiency"
  },

  // headingCount already defined in purpose section above

  // navCount already defined in purpose section above

  internalLinkCount: {
    type: "range",
    ideal: 10,
    max: 150,
    weight: 1,
    problem: "Too few or too many internal links",
    suggestion: "Provide meaningful internal links to aid navigation",
    wcag: "2.4.5 Multiple Ways",
    iso: "Efficiency"
  },

  focusVisibleDetected: {
    type: "boolean",
    good: true,
    weight: 1.5,
    problem: "No visible focus indicator detected in stylesheets",
    suggestion: "Ensure all focusable elements have a visible :focus outline",
    wcag: "2.4.7 Focus Visible",
    iso: "Effectiveness"
  },


  // ===== 3. MEDIA =====
  videoCount: {
    type: "info",
    weight: 0,
    problem: "",
    suggestion: "",
    wcag: "1.2.1 Audio-only and Video-only",
    iso: "Effectiveness"
  },

  audioCount: {
    type: "info",
    weight: 0,
    problem: "",
    suggestion: "",
    wcag: "1.2.1 Audio-only and Video-only",
    iso: "Effectiveness"
  },

  captionTrackCount: {
    type: "info",
    weight: 0,
    problem: "",
    suggestion: "",
    wcag: "1.2.2 Captions",
    iso: "Effectiveness"
  },

  videosWithCaptionsRatio: {
    type: "higherBetter",
    good: 1,
    bad: 0,
    weight: 1.5,
    problem: "Videos lack captions",
    suggestion: "Add captions to all videos",
    wcag: "1.2.2 Captions",
    iso: "Effectiveness"
  },

  transcriptLinkCount: {
    type: "higherBetter",
    good: 1,
    bad: 0,
    weight: 1,
    problem: "No transcript links found for audio/video content",
    suggestion: "Provide text transcripts linked near each media element",
    wcag: "1.2.3 Audio Description",
    iso: "Effectiveness"
  },

  autoplayMediaCount: {
    type: "lowerBetter",
    good: 0,
    bad: 5,
    weight: 1.2,
    problem: "Too many autoplay media elements",
    suggestion: "Disable autoplay or add user controls",
    wcag: "2.2.2 Pause, Stop, Hide",
    iso: "Satisfaction"
  },


  // ===== 4. CLEAR LANGUAGE =====
  readabilityScore: {
    type: "higherBetter",
    good: 70,
    bad: 30,
    weight: 2,
    problem: "Content readability is too low",
    suggestion: "Simplify sentence structure and vocabulary for a general audience",
    wcag: "3.1.5 Reading Level",
    iso: "Effectiveness"
  },

  sentenceAverageLength: {
    type: "range",
    ideal: 15,
    max: 30,
    weight: 1.5,
    problem: "Sentences are too long",
    suggestion: "Use shorter sentences or bullet points",
    wcag: "3.1.5 Reading Level",
    iso: "Efficiency"
  },

  paragraphAverageLength: {
    type: "range",
    ideal: 50,
    max: 150,
    weight: 1,
    problem: "Paragraphs are too long",
    suggestion: "Break long paragraphs into shorter, focused chunks",
    wcag: "3.1.5 Reading Level",
    iso: "Efficiency"
  },

  complexWordRatio: {
    type: "lowerBetter",
    good: 0.1,
    bad: 0.3,
    weight: 1,
    problem: "Too many complex words",
    suggestion: "Simplify vocabulary or provide definitions for technical terms",
    wcag: "3.1.3 Unusual Words",
    iso: "Effectiveness"
  },

  langAttributeExists: {
    type: "boolean",
    good: true,
    weight: 1.5,
    problem: "Missing lang attribute on <html> element",
    suggestion: "Add a lang attribute to the <html> tag (e.g. lang='en')",
    wcag: "3.1.2 Language of Parts",
    iso: "Effectiveness"
  },


  // ===== 5. VISUAL PRESENTATION =====
  lineLengthEstimate: {
    type: "range",
    ideal: 66,
    max: 100,
    weight: 1,
    problem: "Line length may be too wide for comfortable reading",
    suggestion: "Keep line length to approximately 60–80 characters",
    wcag: "1.4.8 Visual Presentation",
    iso: "Satisfaction"
  },

  textSpacingSupport: {
    type: "boolean",
    good: true,
    weight: 1.2,
    problem: "No text spacing (letter-spacing / line-height) detected in styles",
    suggestion: "Ensure styles allow adequate letter-spacing and line-height",
    wcag: "1.4.12 Text Spacing",
    iso: "Effectiveness"
  },

  reflowSupport: {
    type: "boolean",
    good: true,
    weight: 1.5,
    problem: "Page may not support reflow at 320px width",
    suggestion: "Add a responsive viewport meta tag with width=device-width",
    wcag: "1.4.10 Reflow",
    iso: "Effectiveness"
  },

  contrastIssueCount: {
    type: "lowerBetter",
    good: 0,
    bad: 10,
    weight: 1.2,
    problem: "Contrast issues detected",
    suggestion: "Improve text/background contrast",
    wcag: "1.4 Contrast",
    iso: "Effectiveness"
  },

  visualDensityScore: {
    type: "range",
    ideal: 400,
    max: 1200,
    weight: 1.5,
    problem: "Page too visually dense",
    suggestion: "Reduce clutter and group related content",
    wcag: "1.4.8 Visual Presentation",
    iso: "Efficiency"
  },

  whitespaceScore: {
    type: "higherBetter",
    good: 80,
    bad: 30,
    weight: 1,
    problem: "Insufficient whitespace / line-height in text blocks",
    suggestion: "Increase line-height to at least 1.5× font-size in paragraphs",
    wcag: "1.4.8 Visual Presentation",
    iso: "Satisfaction"
  },

  fontResizeSupport: {
    type: "boolean",
    good: true,
    weight: 1.2,
    problem: "Font sizes may not use relative units (em/rem)",
    suggestion: "Use em or rem units for font sizes to support browser zoom",
    wcag: "1.4.8 Visual Presentation",
    iso: "Effectiveness"
  },


  // ===== 6. ASSISTANCE & SUPPORT =====
  formFieldCount: {
    type: "info",
    weight: 0,
    problem: "",
    suggestion: "",
    wcag: "3.3.2 Labels or Instructions",
    iso: "Effectiveness"
  },

  requiredFieldCount: {
    type: "info",
    weight: 0,
    problem: "",
    suggestion: "",
    wcag: "3.3.2 Labels or Instructions",
    iso: "Effectiveness"
  },

  labelCoverage: {
    type: "higherBetter",
    good: 0.9,
    bad: 0.3,
    weight: 1.5,
    problem: "Form inputs lack labels",
    suggestion: "Add visible <label> elements or aria-label to all form inputs",
    wcag: "3.3.2 Labels or Instructions",
    iso: "Effectiveness"
  },

  hasErrorMessage: {
    type: "boolean",
    good: true,
    weight: 1.5,
    problem: "No error message pattern detected",
    suggestion: "Add ARIA live regions or visible error messages for form validation",
    wcag: "3.3.1 Error Identification",
    iso: "Effectiveness"
  },

  hasErrorSuggestion: {
    type: "boolean",
    good: true,
    weight: 1.2,
    problem: "No error suggestion pattern detected",
    suggestion: "Provide descriptive suggestions (aria-describedby or helper text) when inputs fail",
    wcag: "3.3.3 Error Suggestion",
    iso: "Effectiveness"
  },

  hasReviewStep: {
    type: "boolean",
    good: true,
    weight: 1,
    problem: "No review/summary step detected before submission",
    suggestion: "Add a review step so users can check their input before submitting",
    wcag: "3.3.4 Error Prevention",
    iso: "Effectiveness"
  },

  hasConfirmationStep: {
    type: "boolean",
    good: true,
    weight: 1,
    problem: "No confirmation message detected after submission",
    suggestion: "Show a confirmation message after successful form submission",
    wcag: "3.3.4 Error Prevention",
    iso: "Satisfaction"
  },

  hasUndoOption: {
    type: "boolean",
    good: true,
    weight: 1,
    problem: "No undo or cancel option detected",
    suggestion: "Provide undo, cancel, or 'go back' options where possible",
    wcag: "3.3.4 Error Prevention",
    iso: "Satisfaction"
  },


  // ===== 7. DISTRACTION =====
  animationCount: {
    type: "lowerBetter",
    good: 5,
    bad: 30,
    weight: 1.2,
    problem: "High number of animated elements detected",
    suggestion: "Reduce animations or respect prefers-reduced-motion media query",
    wcag: "2.2.2 Pause, Stop, Hide",
    iso: "Satisfaction"
  },

  flashingElementCount: {
    type: "lowerBetter",
    good: 0,
    bad: 3,
    weight: 2,
    problem: "Potentially flashing elements detected (>3Hz)",
    suggestion: "Remove or slow down animations that flash more than 3 times per second",
    wcag: "2.3.1 Three Flashes or Below Threshold",
    iso: "Safety"
  },

  // autoplayMediaCount already defined in media section above

  autoUpdatingContentCount: {
    type: "lowerBetter",
    good: 0,
    bad: 5,
    weight: 1.2,
    problem: "Auto-updating content detected without user control",
    suggestion: "Allow users to pause, stop, or control auto-updating content",
    wcag: "2.2.2 Pause, Stop, Hide",
    iso: "Satisfaction"
  },

  hasPauseControl: {
    type: "boolean",
    good: true,
    weight: 1.5,
    problem: "No pause or stop control found for animated/moving content",
    suggestion: "Add pause/stop/hide controls near any moving or auto-playing content",
    wcag: "2.2.2 Pause, Stop, Hide",
    iso: "Satisfaction"
  },

  timedInteractionCount: {
    type: "lowerBetter",
    good: 0,
    bad: 3,
    weight: 1.2,
    problem: "Timed interactions or session countdowns detected",
    suggestion: "Allow users to turn off or adjust any time limits",
    wcag: "2.2.1 Timing Adjustable",
    iso: "Effectiveness"
  },

  hasExtendTimeOption: {
    type: "boolean",
    good: true,
    weight: 1,
    problem: "No option to extend session or time limit found",
    suggestion: "Provide a mechanism to extend time limits with a simple action",
    wcag: "2.2.1 Timing Adjustable",
    iso: "Effectiveness"
  }
};

module.exports = { mapping };
