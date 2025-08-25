# ⚡ Phase 4 Checklist – Add Diamond Visualization

**Goal:** Show a mini baseball diamond in each at-bat cell.

### ✅ Checklist

- [x] Add an SVG diamond (square rotated 45°) inside each at-bat cell
  - [x] Draw path segments for each base path:
    - [x] Home → 1st
    - [x] 1st → 2nd
    - [x] 2nd → 3rd
    - [x] 3rd → Home

- [x] Update JavaScript to highlight base paths dynamically
  - [x] 1B → Home → 1st
  - [x] 2B → Home → 1st → 2nd
  - [x] 3B → Home → 1st → 2nd → 3rd
  - [x] HR → All four segments highlighted (complete diamond)

- [x] Test visualization
  - [x] Enter each hit type in different cells
  - [x] Confirm the correct base paths highlight
  - [x] Confirm previous hits do not interfere with new ones
  - [x] Confirm clearing/replacing input resets segments correctly
