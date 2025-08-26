# ⚾ Interactive Baseball Scorecard  

This roadmap was created by AI to serve as a guide of sorts. It might very well be changed, with items removed or added, as I progress on the project.

---

## 🚀 Roadmap  

### 🔹 Phase 1: Project Setup  
**Goal:** A working project folder you can open in a browser.  
- Create project folder `baseball-scorecard/`.  
  - Files: `index.html`, `style.css`, `script.js`.  
- Link CSS and JS in `index.html`:  

    <link rel="stylesheet" href="style.css">  
    <script src="script.js" defer></script>  

- Test:  
  - Add text in `index.html`.  
  - Change background in CSS.  
  - Log something in JS and confirm it shows in browser DevTools.  

✅ When all 3 work, setup is complete.  

---

### 🔹 Phase 2: Build the Scorecard Grid  
**Goal:** A table layout resembling a scorecard.  
- Add a `<table>` in HTML.  
  - Header row: innings 1–9 + “Total”.  
  - 10 rows: 1 column for player names, 9 for innings, 1 for total.  
- Style with CSS:  
  - Borders, fixed cell width/height.  
  - Alternate row shading for readability.  
- Test:  
  - Does the table show up neatly?  
  - Do you see 9 innings × 9 players?  

✅ Skeleton scorecard ready.  

---

### 🔹 Phase 3: Add Interactive Cells  
**Goal:** Each cell can record a hit.  
- Give each cell a `class="atbat"`.  
- In JS:  
  - Select all cells with `document.querySelectorAll(".atbat")`.  
  - Attach an `onclick` event.  
  - On click, open a small menu (e.g., a `prompt` at first).  
- Test:  
  - Clicking a cell pops up `"Enter hit: 1B, 2B, 3B, HR"`.  
  - The cell displays your choice.  

✅ Scorecard records hits.  

---

### 🔹 Phase 4: Add Diamond Visualization  
**Goal:** Show a mini baseball diamond in each cell.  
- Add an SVG diamond (a square rotated 45°) inside each cell.  
- Four smaller shapes represent bases.  
- In JS, when recording a hit:  
  - Fill bases according to the hit.  
    - `1B` → first base filled.  
    - `2B` → first + second filled.  
    - `HR` → all bases filled.  
- Test:  
  - Record each hit type and confirm bases highlight correctly.  

✅ Each at-bat cell resembles a real scorecard box.  

---

### 🔹 Phase 5: Totals & Validation  
**Goal:** Keep track of totals across innings.  
- After recording a hit, update team’s total runs in the “Total” column.  
- Prevent overwriting without confirmation.  
- Test:  
  - Enter multiple hits → totals update.  
  - Overwriting prompts for confirmation.  

✅ Scorecard calculates totals like a real one.  

---

### 🔹 Phase 6: Save & Load (Optional Early Feature)  
**Goal:** Don’t lose progress when refreshing.  
- Use `localStorage` to save current scorecard state.  
- On page load, reload state into the grid.  
- Test:  
  - Record a few hits.  
  - Refresh page → state persists.  

✅ Basic persistence achieved.  

---

### 🔹 Phase 7: First Release (v0.1.0)  
Focus on delivering the first functional version of the scorecard.  
This release should allow users to:  
- Enter and save hits per at-bat.  
- View totals per player, per inning, and per team.  
- Input and save player lineup names.  
- Input and save the team name.  
- Refresh the page without losing data (state persistence).  

✅ A minimal but fully working digital scorecard, ready for release as **v0.1.0**.  

---
