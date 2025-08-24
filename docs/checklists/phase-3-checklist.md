# ⚡ Phase 3 Checklist – Add Interactive Cells

**Goal:** Make each cell interactive so you can record hits.

### ✅ Checklist

- [ ] Give each at-bat cell a class, e.g., "atbat"

- [ ] Add JavaScript for interaction
  - [ ] Select all cells with document.querySelectorAll(".atbat")
  - [ ] Attach onclick event to each cell
  - [ ] On click, open a small menu (prompt at first) to enter hit: 1B, 2B, 3B, HR

- [ ] Display the entered hit in the cell
  - [ ] Text appears correctly after selection
  - [ ] Test different hit types

- [ ] Add basic validation
  - [ ] Prevent empty or invalid inputs
  - [ ] Optional: confirm before overwriting existing entry

- [ ] Test interactivity
  - [ ] Click several cells and enter hits
  - [ ] Ensure correct hit displays in each cell
