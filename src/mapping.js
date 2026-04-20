// mapping.js

const mapping = {

  // ===== 1. CLEAR PURPOSE =====

  // 2.4.2 Page Titled
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

  pageTitleMeaningfulScore: {
    type: "higherBetter",
    good: 80,
    bad: 0,
    weight: 1.5,
    problem: "Page title is not descriptive enough",
    suggestion: "Use a specific, meaningful title that describes the page content (e.g. 'Checkout – My Store' not 'Home')",
    wcag: "2.4.2 Page Titled",
    iso: "Effectiveness"
  },

  // 2.4.6 Headings and Labels
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

  headingMeaningfulScore: {
    type: "higherBetter",
    good: 80,
    bad: 0,
    weight: 1.2,
    problem: "Headings are not descriptive enough",
    suggestion: "Use meaningful heading text that summarises the section content",
    wcag: "2.4.6 Headings and Labels",
    iso: "Effectiveness"
  },

  labelCount: {
    type: "info",
    weight: 0,
    problem: "",
    suggestion: "",
    wcag: "2.4.6 Headings and Labels",
    iso: "Effectiveness"
  },

  inputWithLabelRatio: {
    type: "higherBetter",
    good: 1,
    bad: 0.3,
    weight: 1.5,
    problem: "Form inputs are missing associated labels",
    suggestion: "Associate every input with a <label> using for/id, aria-label, or aria-labelledby",
    wcag: "2.4.6 Headings and Labels",
    iso: "Effectiveness"
  },

  labelMeaningfulScore: {
    type: "higherBetter",
    good: 90,
    bad: 20,
    weight: 1.2,
    problem: "Labels are not descriptive enough",
    suggestion: "Use clear, descriptive label text rather than placeholders or symbols alone",
    wcag: "2.4.6 Headings and Labels",
    iso: "Effectiveness"
  },


  // ===== 2. FINDABLE =====

  // 2.4.1 Bypass Blocks
  hasSkipLink: {
    type: "boolean",
    good: true,
    weight: 1.5,
    problem: "No skip link detected",
    suggestion: "Add a 'Skip to main content' link at the top of the page",
    wcag: "2.4.1 Bypass Blocks",
    iso: "Efficiency"
  },

  skipLinkWorks: {
    type: "boolean",
    good: true,
    weight: 2,
    problem: "Skip link is broken (target ID not found on page)",
    suggestion: "Ensure the href of the skip link matches an actual ID on the main content element",
    wcag: "2.4.1 Bypass Blocks",
    iso: "Effectiveness"
  },

  hasMainLandmark: {
    type: "boolean",
    good: true,
    weight: 1.5,
    problem: "No <main> landmark detected",
    suggestion: "Add a <main> element or role='main' to identify the primary content area",
    wcag: "2.4.1 Bypass Blocks",
    iso: "Efficiency"
  },

  // 2.4.5 Multiple Ways
  hasSearch: {
    type: "boolean",
    good: true,
    weight: 1.2,
    problem: "No search functionality detected",
    suggestion: "Add a search input or site search to help users locate content",
    wcag: "2.4.5 Multiple Ways",
    iso: "Efficiency"
  },

  navCount: {
    type: "range",
    ideal: 1,
    max: 4,
    weight: 1,
    problem: "No navigation landmark or too many nav regions",
    suggestion: "Use one primary <nav> element for consistent navigation",
    wcag: "2.4.5 Multiple Ways",
    iso: "Efficiency"
  },

  avgLinksPerNav: {
    type: "range",
    ideal: 7,
    max: 30,
    weight: 1.5,
    problem: "Navigation menus contain too many links (Cognitive Overload)",
    suggestion: "Group navigation links into smaller chunks (7-10 items max) to prevent decision fatigue",
    wcag: "2.4.5 Multiple Ways",
    iso: "Efficiency"
  },

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

  hasBreadcrumb: {
    type: "boolean",
    good: true,
    weight: 1,
    problem: "No breadcrumb navigation detected",
    suggestion: "Add breadcrumb navigation to help users understand their location within the site",
    wcag: "2.4.5 Multiple Ways",
    iso: "Efficiency"
  },

  // 2.4.7 Focus Visible
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

  // 1.2.1 Audio-only and Video-only
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

  // 1.2.2 Captions
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

  // 1.2.3 Audio Description
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
    wcag: "1.2.3 Audio Description",
    iso: "Satisfaction"
  },

  mediaAlternativeCoverage: {
    type: "higherBetter",
    good: 1, // 100% coverage is best
    bad: 0.2,
    weight: 1.5,
    problem: "Not enough text alternatives (transcripts) for media content",
    suggestion: "Provide text transcripts for all audio and video content to meet WCAG 1.2.1",
    wcag: "1.2.1 Audio-only and Video-only",
    iso: "Effectiveness"
  },

  mediaWithControlsRatio: {
    type: "higherBetter",
    good: 1,
    bad: 0.5,
    weight: 2, // Heavy weight because missing controls is super annoying!
    problem: "Media players are missing playback controls (play/pause/volume)",
    suggestion: "Always include the 'controls' attribute in <audio> and <video> tags",
    wcag: "2.1.1 Keyboard / 2.2.2 Pause, Stop, Hide",
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

  // 1.4.8 Visual Presentation
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

  contrastIssueCount: {
    type: "lowerBetter",
    good: 0,
    bad: 10,
    weight: 1.2,
    problem: "Contrast issues detected",
    suggestion: "Improve text/background contrast",
    wcag: "1.4.8 Visual Presentation",
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

  fontResizeSupport: {
    type: "boolean",
    good: true,
    weight: 1.2,
    problem: "Font sizes may not use relative units (em/rem)",
    suggestion: "Use em or rem units for font sizes to support browser zoom",
    wcag: "1.4.8 Visual Presentation",
    iso: "Effectiveness"
  },

  textJustifyCount: {
    type: "lowerBetter",
    good: 0,
    bad: 3,
    weight: 1.5,
    problem: "Text is justified (aligned to both margins), causing 'rivers of white space'",
    suggestion: "Use left-aligned text (or right-aligned for RTL languages) to help users with dyslexia track lines",
    wcag: "1.4.8 Visual Presentation",
    iso: "Effectiveness"
  },

  lineSpacingIssueCount: {
    type: "lowerBetter",
    good: 0,
    bad: 5,
    weight: 1.5,
    problem: "Line spacing (leading) is too tight",
    suggestion: "Ensure line height is at least 1.5 times the font size for better readability",
    wcag: "1.4.12 Text Spacing",
    iso: "Satisfaction"
  },


  // ===== 6. ASSISTANCE & SUPPORT =====

  // 3.3.2 Labels or Instructions
  formFieldCount: {
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

  // 3.3.3 Error Suggestion
  hasErrorMessage: {
    type: "boolean",
    good: true,
    weight: 1.5,
    problem: "No error message pattern detected",
    suggestion: "Add ARIA live regions or visible error messages for form validation",
    wcag: "3.3.3 Error Suggestion",
    iso: "Effectiveness"
  },

  // 3.3.4 Error Prevention
  requiredFieldCount: {
    type: "lowerBetter",
    good: 0,
    bad: 10,
    weight: 1,
    problem: "Too many required fields may overwhelm users",
    suggestion: "Minimise required fields and clearly mark which are mandatory",
    wcag: "3.3.4 Error Prevention",
    iso: "Effectiveness"
  },


  // ===== 7. DISTRACTION =====

  // 2.2.2 Pause, Stop, Hide
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
  }
};

module.exports = { mapping };
