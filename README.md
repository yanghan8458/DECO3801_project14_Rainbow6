# DECO3801_project14_RainbowSix
Ranbowsix code base for project14

## First update<br>
- index.js: input and output setting<br>
- src/analyzer.js: analysis the url, exract each features use for futer work<br>
- output/: jason vision output

## Second update<br>
- src/scorer.js: calculate cognitive accessibility scores (0-100) based on analyzer data, and map issues to WCAG and ISO 9241-11 standards.<br>
- index.js: updated to connect the scorer. Now it outputs a frontend-friendly JSON with status (good/warning/poor) and actionable insights.<br>