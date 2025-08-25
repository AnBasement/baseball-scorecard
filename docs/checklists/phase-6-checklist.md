# ⚡ Phase 6 Checklist – Save & Load (Optional Early Feature)

**Goal:** Ensure scorecard state persists when refreshing the browser.

### ✅ Checklist

- [x] Implement localStorage support
  - [x] Save current state of all at-bat cells
  - [x] Save totals per player and per team

- [x] Load saved state on page load
  - [x] Populate at-bat cells with saved hits
  - [x] Restore diamond visualization for each cell
  - [x] Update totals based on loaded data

- [x] Test save/load functionality
  - [x] Enter hits, refresh page, confirm state persists
  - [x] Clear localStorage and confirm new session starts empty
