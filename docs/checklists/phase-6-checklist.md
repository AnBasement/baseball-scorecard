# ⚡ Phase 6 Checklist – Save & Load (Optional Early Feature)

**Goal:** Ensure scorecard state persists when refreshing the browser.

### ✅ Checklist

- [ ] Implement localStorage support
  - [ ] Save current state of all at-bat cells
  - [ ] Save totals per player and per team

- [ ] Load saved state on page load
  - [ ] Populate at-bat cells with saved hits
  - [ ] Restore diamond visualization for each cell
  - [ ] Update totals based on loaded data

- [ ] Test save/load functionality
  - [ ] Enter hits, refresh page, confirm state persists
  - [ ] Clear localStorage and confirm new session starts empty
