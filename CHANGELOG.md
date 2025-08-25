# Changelog

This file details all changes made to the project and serves as a simple way for me to remember what happened when. It is formatted based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

---

## [0.5.0] - 25-08-2025
### Added
- Counter system for hits
  - Player hits are now recorded in the right-most column
  - Bottom row shows team hits per inning
  - Bottom right cell shows team hits total

### Changed
- `updateTotals()` now runs after every at-bat input
- Added "0" to Hits column and team hits row in index.html for cleaner look

---

## [0.0.4] - 25-08-2025
### Added
- SVG diamond inside each at-bat cell
- Base path segments between bases
- Dynamic highlighting of paths based on input:
  - 1B → home→first
  - 2B → home→first→second
  - 3B → home→first→second→third
  - HR → all four segments
- Overwrite confirmation for already filled cells

### Changed
- Changed "Runs" to "Hits" in the table and removed at-bat class

### Fixed
- Input validation properly checks "Out" now

---

## [0.0.3] - 25-08-2025
### Added
- Made cells interactible through clicking
  - User can click a cell and input a type of hit (currently only 1B, 2B, 3B, HR or Out)
  - Input validation to ensure correct inputs
  - Warns user if attempting to overwrite a cell

---

## [0.0.2] – 24-08-2025
### Added
- Table layout for scorecard completed
  - Header row: innings 1–9 + "Runs"
  - 10 rows: 1 column for player names, 9 for innings, 1 for total runs
- Temporary CSS styling for table:
  - Cell borders
  - Fixed width & height for cells
  - Alternate cell shading, temporary for readability
- Placeholder player names added (Player 1 through Player 9)
- Verified table renders correctly in browser

---

## [0.0.1] – 24-08-2025
### Added
- Structure project folder with the initial files index.html, style.css, script.js
- Linked CSS and JS in index.html and added placeholder text
- Verified everything loads correctly in browser
