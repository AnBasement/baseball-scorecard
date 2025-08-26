# Changelog

This file details all changes made to the project and serves as a simple way for me to remember what happened when. It is formatted based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

---

## [0.2.3] - 26-08-2025
### Added
- Added defensive errors as an at-bat option.
  - Inning and game totals are counted in the table footer.
- Added an option to clear a cell if incorrect option was selected.

### Changed
- Changed the footer from 'H' and 'R' to 'Hits' and 'Runs' for now.

### Fixed
- Previously if an out was recorded by mistake and changed to something else, the out counter persisted unless page was refreshed. This has been fixed.
- Also changed the outs counter to change dynamically, so if a previous out is changed to a not-out, the consecutive outs will decrease by 1.

---

## [0.2.2] - 26-08-2025
### Added
- Added an 'outs' tracker which increments whenever an out is selected in a cell.
  - Is independent per inning, so counter always starts at 1 for the first out.
  - Currently caps out at 3.
- Highlighting active (last changed) cell and active inning column.
  - Persists through a reload

---

## [0.2.1] - 26-08-2025
### Added
- Row for counting team and inning runs
  - Currently only counting HRs as runs as baserunner progression is currently not implemented

### Changed
- Slightly altered table, marking distinction between SUMS footer and main table body.

---

## [0.2.0] - 26-08-2025
### Added
- Interactive at-bat cells with dropdown/context menu for outcome selection:
  - `1B, 2B, 3B, HR, BB, K, FO, GO, HBP`
- Diamond visualization updates per outcome
  - HR fills the entire diamond
  - BB/HBP displayed bottom-right of diamond
  - K, LO, FO, GO centered in diamond
- Automatic calculation of hit totals (currently only counting 1B, 2B, 3B, HR)

---

## [0.1.0] - 26-08-2025
### Added
- Player and team names can now be added to column 1

### Changed
- Updated CSS for a more dynamic table with some coloring
- README updated

---

## [0.0.6] - 26-08-2025
### Added
- LocalStorage support to save and load across browser refresh

### Changed
- Reorganized the ordering in script.js

---

## [0.0.5] - 25-08-2025
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
