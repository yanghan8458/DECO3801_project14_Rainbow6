# DECO3801_project14_RainbowSix
Ranbowsix code base for project14, HTML exract, mapping and score.

## First update<br>
- index.js: input and output setting<br>
- src/analyzer.js: analysis the url, exract each features use for futer work<br>
- output/: jason vision output

## Second update<br>
- src/scorer.js: calculate cognitive accessibility scores (0-100) based on analyzer data, and map issues to WCAG and ISO 9241-11 standards.<br>
- index.js: updated to connect the scorer. Now it outputs a frontend-friendly JSON with status (good/warning/poor) and actionable insights.<br>


## Appendix<br>
Puppeteer Web Page Analyzer - 

Puppeteer Web Page Analyzer

A web page automation analysis tool built with Puppeteer (headless browser), designed to extract HTML elements, perform basic statistics (briefly mentioned), and generate structured analysis reports.

Core Function

Automatically open web pages → extract HTML elements → perform basic data statistics (details omitted) → generate structured web page analysis reports.

Technical Foundation

- Puppeteer (headless browser): For simulating browser behavior and accessing web pages.

- Native JavaScript: For DOM operations, element extraction and basic statistics (no third-party libraries required).

Analysis Process

The entire analysis process is divided into 3 key steps:

1. Launch Headless Browser

The tool launches Puppeteer in headless mode (runs in the background without a visible window), creates a new browser page, navigates to the target URL, and waits for network requests to stabilize before starting analysis.

2. Core: HTML Extraction & Analysis (page.evaluate)

The page.evaluate() method runs code directly in the browser's web environment, enabling DOM operations and information extraction (similar to developer tools).

2.1 Basic Element Extraction (extractElements)

Uses CSS selectors to capture core page elements, including headings (h1-h6), paragraphs, links, buttons, and image sources.

2.2 DOM Structure Extraction (extractDOM)

Recursively traverses HTML nodes, records tag names and child elements, with limits: maximum depth of 5 levels and up to 10 child elements per node (to avoid excessive resource consumption).

2.3 10-Dimensional Web Page Analysis

The analysis is split into 10 independent modules (statistical details omitted), covering key dimensions of web page quality:

- Language Analysis: Related to text content statistics

- Layout Analysis: Related to page element quantity statistics

- Navigation Analysis: Related to page menu structure statistics

- Visual Hierarchy: Related to page heading structure statistics

- Interaction Analysis: Related to page interactive element statistics

- Animation Analysis: Related to page animated element statistics

- Spacing Analysis: Related to page paragraph layout statistics

- Consistency Analysis: Related to page button style statistics

- Form Analysis: Related to page form element statistics

- Error Prevention: Related to page form validation and error prompt statistics

3. Close Browser & Return Results

After analysis, the browser is closed to release resources. The tool returns a structured JSON object containing the target URL, extracted element data, and 10-dimensional analysis report.

Output

Structured JSON data, which can be used for web page quality detection, UI analysis, and SEO inspection.
