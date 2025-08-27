// Storage
const STORAGE_KEY = "scorecard_v1";

// Allowed hit values
const VALID_HITS = ["1B", "2B", "3B", "HR", "OUT"];

// Game state: 9 players × 9 innings
const gameState = Array.from({ length: 9 }, () => Array(9).fill(""));

// Default player names (10 because? catcher + DH?)
const playerNames = Array.from({ length: 10 }, (_, i) => `Player ${i + 1}`);

// Track outs per inning
const inningOuts = Array(9).fill(0);

// Track sequence of out cells per inning
const inningOutCells = Array.from({ length: 9 }, () => []);

// Function for recording outs
function recordOut(cell, inningIndex) {
    const svg = cell.querySelector("svg");
    if (!svg) return;

    // Only add if this cell is not already counted
    if (!inningOutCells[inningIndex].includes(cell)) {
        inningOutCells[inningIndex].push(cell);
    }

    // Update out numbers for all cells in sequence
    inningOutCells[inningIndex].forEach((outCell, idx) => {
        const circle = outCell.querySelector("circle");
        const text = outCell.querySelector(".outs-text");

        if (circle) circle.setAttribute("opacity", "1");
        if (text) {
        text.setAttribute("opacity", "1");
        text.textContent = String(idx + 1); // explicit string
        }
    });
}

// Remove a cell from out tracking if hit changes
function removeOut(cell, inningIndex) {
  const outs = inningOutCells[inningIndex];
  const index = outs.indexOf(cell);

  if (index !== -1) outs.splice(index, 1);

  // Recalculate out numbers for remaining cells
  outs.forEach((outCell, idx) => {
    const circle = outCell.querySelector("circle");
    const text = outCell.querySelector(".outs-text");

    if (circle) circle.setAttribute("opacity", "1");
    if (text) {
      text.setAttribute("opacity", "1");
      text.textContent = String(idx + 1);
    }
  });

  // Clear this cell’s indicator
  const circle = cell.querySelector("circle");
  const text = cell.querySelector(".outs-text");

  if (circle) circle.setAttribute("opacity", "0");
  if (text) {
    text.setAttribute("opacity", "0");
    text.textContent = "0";
  }
}

// Function highlighting the current cell
function highlightCurrentBatter(cell) {

    // Remove old highlight
    document.querySelectorAll(".current-batter").forEach(el => {
        el.classList.remove("current-batter");
    });
    
    // Add to the new active cell
    cell.classList.add("current-batter");
}

// Function highlighting current inning
function highlightCurrentInning(inningIndex) {

    // Remove old inning highlights
    document.querySelectorAll(".current-inning").forEach(el => {
        el.classList.remove("current-inning");
    });

    // Highlight header + all cells in this inning column
    document.querySelectorAll(`[data-inning="${inningIndex}"]`).forEach(cell => {
        cell.classList.add("current-inning");
    });
}

// Changes diamond based on input
function updateBases(svg, hit, cell, originalHitText = null) {
    // Only reset dynamic visuals (paths, polygon, outs)
    resetCellVisuals(svg, cell);

    const polygon = svg.querySelector("polygon");

    // Use originalHitText for persistent text if provided
    const textForNotation = originalHitText || hit;

    switch (hit) {
        case "1B":
            showPath(svg, [".path-home-first"]);
            addHitNotation(svg, textForNotation);
            break;
        case "2B":
            showPath(svg, [".path-home-first", ".path-first-second"]);
            addHitNotation(svg, textForNotation);
            break;
        case "3B":
            showPath(svg, [".path-home-first", ".path-first-second", ".path-second-third"]);
            addHitNotation(svg, textForNotation);
            break;
        case "HR":
            if (polygon) polygon.setAttribute("fill", "black");
            addHitNotation(svg, textForNotation);
            break;

        case "R":
            if (polygon) polygon.setAttribute("fill", "black");
            break;

        case "BB":
        case "HBP":
            showPath(svg, [".path-home-first"]);
            addHitNotation(svg, textForNotation); // smaller text handled inside addHitNotation
            break;

        case "E":
            showPath(svg, [".path-home-first"]);
            addHitText(svg, hit, { x: 25, y: 27, size: 20, weight: "bold", anchor: "middle" });
            break;

        case "K":
        case "LO":
        case "FO":
        case "GO":
            addHitText(svg, hit, { x: 25, y: 27, size: 20, weight: "bold", anchor: "middle" });
            if (!cell) break;

            const row = cell.closest("tr");
            const inningIndex = [...row.querySelectorAll(".at-bat")].indexOf(cell);
            recordOut(cell, inningIndex);
            cell.dataset.outRecorded = "true";
            break;
    }
}

/* --- Helpers --- */

// Reset visuals and undo outs if necessary
function resetCellVisuals(svg, cell) {
    // Reset paths
    svg.querySelectorAll("path").forEach(path => path.setAttribute("opacity", "0.2"));

    // Reset outs indicator
    const outsCircle = svg.querySelector("circle");
    const outsText = svg.querySelector(".outs-text");
    if (outsCircle) outsCircle.setAttribute("opacity", "0");
    if (outsText) {
        outsText.setAttribute("opacity", "0");
        outsText.textContent = "0";
    }

    // Reset HR polygon fill
    const polygon = svg.querySelector("polygon");
    if (polygon) polygon.setAttribute("fill", "white");

    // Undo previous out if needed
    if (cell?.dataset.outRecorded === "true") {
        const row = cell.closest("tr");
        const inningIndex = [...row.querySelectorAll(".at-bat")].indexOf(cell);
        removeOut(cell, inningIndex);
        cell.dataset.outRecorded = "false";
    }
}

// Adds hit notation bottom right of diamond
function addHitNotation(svg, hit, originalHit = null) {
    // Use originalHit if provided, else hit
    const text = originalHit || hit;

    if (!svg.querySelector(".hit-text")) {
        const el = document.createElementNS("http://www.w3.org/2000/svg", "text");
        el.setAttribute("x", 68); 
        el.setAttribute("y", 48);
        el.setAttribute("font-size", 16);
        el.setAttribute("font-weight", "bold");
        el.setAttribute("text-anchor", "end");
        el.setAttribute("dominant-baseline", "middle");
        el.textContent = text;
        el.classList.add("hit-text");
        svg.appendChild(el);
    }
}


// Show one or more base paths
function showPath(svg, selectors) {
    selectors.forEach(sel => {
        const path = svg.querySelector(sel);
        if (path) path.setAttribute("opacity", "1");
    });
}

// Add text overlay to the cell (hit or out)
function addHitText(svg, text, { x, y, size, weight, anchor }) {
    const el = document.createElementNS("http://www.w3.org/2000/svg", "text");
    el.setAttribute("x", x);
    el.setAttribute("y", y);
    el.setAttribute("font-size", size);
    el.setAttribute("font-weight", weight || "normal");
    el.setAttribute("text-anchor", anchor || "middle");
    el.setAttribute("dominant-baseline", "middle");
    el.textContent = text;
    el.classList.add("hit-text");
    svg.appendChild(el);
}

// Valid input selections
const atBatOutcomes = ["1B", "2B", "3B", "HR", "BB", "K", "FO", "GO", "HBP", "E", "R"];

// Updates the totals for hits, runs, and errors
function updateTotals() {
    const rows = document.querySelectorAll("tbody tr"); // player rows
    const tfoot = document.querySelector("tfoot");      // footer

    // Initialize totals arrays
    const inningHitTotals = Array(9).fill(0);
    const inningRunTotals = Array(9).fill(0);
    const inningErrorTotals = Array(9).fill(0);
    let teamHitTotal = 0;
    let teamRunTotal = 0;
    let teamErrorTotal = 0;

    rows.forEach(row => {
        const atBats = row.querySelectorAll(".at-bat");
        let playerHitTotal = 0;
        let playerRunTotal = 0;

        atBats.forEach((cell, i) => {
            const hit = cell.dataset.hit;
            const originalHit = cell.dataset.originalHit;

            // Hits — count only original hits
            if (["1B", "2B", "3B", "HR"].includes(originalHit)) {
                playerHitTotal += 1;
                inningHitTotals[i] += 1;
            }

            // Runs — increments runs counter but nothing else
            if (["HR", "R", "HBP+R", "BB+R"].includes(hit)) {
                playerRunTotal += 1;
                inningRunTotals[i] += 1;
                teamRunTotal += 1;
            }

            // Errors
            if (hit === "E") {
                inningErrorTotals[i] += 1;
                teamErrorTotal += 1;
            }
        });

        const hitsCell = row.querySelector(".player-hits");
        if (hitsCell) hitsCell.textContent = playerHitTotal;

        const runsCell = row.querySelector(".player-runs");
        if (runsCell) runsCell.textContent = playerRunTotal;
        teamHitTotal += playerHitTotal;
    });

    // Update DOM totals
    tfoot.querySelectorAll(".team-hits .inning-total").forEach((cell, i) => cell.textContent = inningHitTotals[i]);
    tfoot.querySelector(".team-hits-total").textContent = teamHitTotal;

    tfoot.querySelectorAll(".team-runs .inning-run-total").forEach((cell, i) => cell.textContent = inningRunTotals[i]);
    tfoot.querySelector(".team-runs-total").textContent = teamRunTotal;

    tfoot.querySelectorAll(".team-errors .inning-error-total").forEach((cell, i) => cell.textContent = inningErrorTotals[i]);
    tfoot.querySelector(".team-errors-total").textContent = teamErrorTotal;
}

// Updating the gamestate
function updateGameState(playerIndex, inningIndex, hit){
    gameState[playerIndex][inningIndex] = hit;
}

// Helper to safely parse number from a cell
function getNum(td) {
    return Number((td?.textContent || "0").trim()) || 0;
}

// Helper to map totals from selector
function mapTotals(selector) {
    return Array.from(document.querySelectorAll(selector)).map(getNum);
}

// Saves the current scorecard state to localStorage
function saveState() {
    try {
        const rows = Array.from(document.querySelectorAll("tbody tr"));

        // Collect hits/errors per player per inning
        const hits = rows.map(row =>
            Array.from(row.querySelectorAll(".at-bat")).map(cell => ({
                hit: cell.dataset.hit || "",
                originalHit: cell.dataset.originalHit || ""
            }))
        );

        // Ensure totals are up-to-date
        updateTotals();

        // Player totals
        const playerTotals = rows.map(row => getNum(row.querySelector(".player-hits")));

        // Team totals
        const inningHitTotals = mapTotals("tfoot .team-hits .inning-total");
        const teamHitTotal = getNum(document.querySelector("tfoot .team-hits-total"));

        const inningRunTotals = mapTotals("tfoot .team-runs .inning-run-total");
        const teamRunTotal = getNum(document.querySelector("tfoot .team-runs-total"));

        const inningErrorTotals = mapTotals("tfoot .team-errors .inning-error-total");
        const teamErrorTotal = getNum(document.querySelector("tfoot .team-errors-total"));

        // Player names
        const playerNames = rows.map((row, i) =>
            row.querySelector(`#playerName-${i}`)?.textContent?.trim() || `Player ${i + 1}`
        );

        // Team name
        const teamName = document.querySelector(".teamNameInput")?.textContent?.trim() || "";

        // Current batter and inning highlights
        let lastBatter = null;
        let lastInning = null;
        if (currentCell) {
            const row = currentCell.closest("tr");
            const playerIndex = [...row.parentNode.children].indexOf(row);
            const inningIndex = [...row.querySelectorAll(".at-bat")].indexOf(currentCell);
            lastBatter = { playerIndex, inningIndex };
            lastInning = inningIndex;
        }

        const payload = {
            version: 1,
            timestamp: new Date().toISOString(),
            hits,
            totals: {
                playerTotals,
                inningHitTotals,
                teamHitTotal,
                inningRunTotals,
                teamRunTotal,
                inningErrorTotals,
                teamErrorTotal
            },
            playerNames,
            teamName,
            lastBatter,
            lastInning
        };

        localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch (err) {
        console.error("Failed to save scorecard state:", err);
    }
}

// Loads scorecard state from localStorage
function loadState() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (!saved) return;

        const payload = JSON.parse(saved);
        const hits = payload.hits || [];
        const rows = Array.from(document.querySelectorAll("tbody tr"));

        // Restore hits and diamond graphics
        rows.forEach((row, playerIndex) => {
            const cells = Array.from(row.querySelectorAll(".at-bat"));
            cells.forEach((cell, inningIndex) => {
                const hitData = hits[playerIndex]?.[inningIndex] || { hit: "", originalHit: "" };
                const hit = hitData.hit;
                if (!hit) return;

                // Restore current hit
                cell.dataset.hit = hit;

                // Restore original hit (bottom-right notation)
                if (!cell.dataset.originalHit) {
                    cell.dataset.originalHit = hitData.originalHit || hit;
                }

                const svg = cell.querySelector("svg");
                if (!svg) return;

                // Add persistent notation using originalHit
                addHitNotation(svg, hit, cell.dataset.originalHit);

                // Restore polygon fill for HR and run-type hits
                if (["HR", "R"].includes(hit)) {
                    const polygon = svg.querySelector("polygon");
                    if (polygon) polygon.setAttribute("fill", "black");
                }

                // Restore base paths for hits that require them
                const hitPaths = {
                    "1B": [".path-home-first"],
                    "2B": [".path-home-first", ".path-first-second"],
                    "3B": [".path-home-first", ".path-first-second", ".path-second-third"],
                    "BB": [".path-home-first"],
                    "HBP": [".path-home-first"]
                };

                if (hitPaths[hit]) showPath(svg, hitPaths[hit]);
            });
        });

        // Restore player names
        rows.forEach((row, i) => {
            const nameCell = row.querySelector(`#playerName-${i}`);
            if (nameCell) nameCell.textContent = payload.playerNames?.[i] || `Player ${i + 1}`;
        });

        // Restore team name
        const teamInput = document.querySelector(".teamNameInput");
        if (teamInput) teamInput.textContent = payload.teamName || "";

        // Update totals
        updateTotals();

        // Restore error totals in footer if present
        const errorTotals = payload.totals?.inningErrorTotals || [];
        const inningErrorCells = document.querySelectorAll("tfoot .team-errors .inning-error-total");
        inningErrorCells.forEach((cell, i) => cell.textContent = errorTotals[i] || 0);

        const teamErrorCell = document.querySelector("tfoot .team-errors-total");
        if (teamErrorCell && payload.totals?.teamErrorTotal !== undefined) {
            teamErrorCell.textContent = payload.totals.teamErrorTotal;
        }

        // Restore current batter highlight
        if (payload.lastBatter) {
            const batterRow = rows[payload.lastBatter.playerIndex];
            const batterCell = batterRow?.querySelectorAll(".at-bat")[payload.lastBatter.inningIndex];
            if (batterCell) {
                currentCell = batterCell;
                batterCell.classList.add("current-batter");
            }
        }

        // Restore current inning highlight
        if (payload.lastInning !== null && payload.lastInning !== undefined) {
            highlightCurrentInning(payload.lastInning);
        }

    } catch (err) {
        console.error("Failed to load scorecard state:", err);
    }
}

let currentCell = null;

document.addEventListener("DOMContentLoaded", () => {
    
    // --- Initialize at-bat cells ---
    const atBatCells = document.querySelectorAll(".at-bat");
    atBatCells.forEach(cell => {
        // Add SVG for diamond/outs
        cell.innerHTML = `
            <svg width="70" height="55" viewBox="0 0 70 55">
                <polygon points="25,0 50,25 25,50 0,25"
                    fill="white" stroke="black" stroke-width="1"/>
                <path d="M25,50 L50,25" stroke="black" stroke-width="4" fill="none" class="path-home-first" opacity="0.2"/>
                <path d="M50,25 L25,0"  stroke="black" stroke-width="4" fill="none" class="path-first-second" opacity="0.2"/>
                <path d="M25,0 L0,25"   stroke="black" stroke-width="4" fill="none" class="path-second-third" opacity="0.2"/>
                <path d="M0,25 L25,50"  stroke="black" stroke-width="4" fill="none" class="path-third-home" opacity="0.2"/>
                <circle cx="61" cy="8" r="7" fill="none" stroke="red" stroke-width="2" opacity="0"/>
                <text x="61" y="9" font-size="8" font-weight="bold" text-anchor="middle" dominant-baseline="middle" fill="red" class="outs-text" opacity="0">0</text>
            </svg>
        `;
        cell.addEventListener("click", () => showModal(cell));
    });

    // --- Modal functions ---
    const modal = document.getElementById("atBatModal");
    const overlay = document.getElementById("modalOverlay");
    const select = document.getElementById("outcomeSelect");
    const modalOk = document.getElementById("modalOk");
    const modalCancel = document.getElementById("modalCancel");

    function showModal(cell) {
        currentCell = cell;
        select.value = cell.dataset.hit || "";
        modal.style.display = overlay.style.display = "block";
        select.focus();
    }

    function hideModal() {
        modal.style.display = overlay.style.display = "none";
        currentCell = null;
    }

    // --- Modal button handlers ---
    modalOk.addEventListener("click", () => {
        if (!currentCell) return;

        const hit = select.value;
        currentCell.dataset.hit = hit;

        // Save original hit only if not already set
        if (!currentCell.dataset.originalHit) {
            currentCell.dataset.originalHit = hit;
        }

        const svg = currentCell.querySelector("svg");
        if (svg) resetCellVisuals(svg, currentCell); 
        if (svg) updateBases(svg, hit, currentCell, currentCell.dataset.originalHit);

        const row = currentCell.closest("tr");
        const playerIndex = [...row.parentNode.children].indexOf(row);
        const inningIndex = [...row.querySelectorAll(".at-bat")].indexOf(currentCell);

        updateGameState(playerIndex, inningIndex, hit);
        updateTotals();
        saveState();
        highlightCurrentBatter(currentCell);
        highlightCurrentInning(inningIndex);
        hideModal();
    });



    [modalCancel, overlay].forEach(el => el.addEventListener("click", hideModal));

    // --- Player name input ---
    document.querySelectorAll(".player-name").forEach(cell => {
        cell.addEventListener("input", () => {
            cell.classList.toggle("invalid", !cell.textContent.trim());
            saveState();
        });
    });

    // --- Team name input ---
    const teamNameInput = document.querySelector(".teamNameInput");
    if (teamNameInput) {
        teamNameInput.addEventListener("input", () => {
            teamNameInput.classList.toggle("invalid", !teamNameInput.textContent.trim());
            saveState();
        });
    }

    // --- Reset button ---
    const resetButton = document.getElementById("resetScorecard");
    if (resetButton) {
        resetButton.addEventListener("click", () => {
            if (!confirm("Are you sure you want to reset the scorecard?")) return;

            localStorage.removeItem(STORAGE_KEY);
            currentCell = null;

            atBatCells.forEach(cell => {
                cell.dataset.hit = "";
                cell.removeAttribute("data-out-recorded");
                const svg = cell.querySelector("svg");
                if (!svg) return;
                svg.querySelector("polygon")?.setAttribute("fill", "white");
                svg.querySelectorAll("path").forEach(path => path.setAttribute("opacity", "0.2"));
                svg.querySelector(".hit-text")?.remove();
                const outsCircle = svg.querySelector("circle");
                const outsText = svg.querySelector(".outs-text");
                if (outsCircle) outsCircle.setAttribute("opacity", "0");
                if (outsText) {
                    outsText.setAttribute("opacity", "0");
                    outsText.textContent = "0";
                }
            });

            inningOutCells.forEach(arr => arr.length = 0);
            inningOuts.fill(0);

            document.querySelectorAll(".player-name").forEach((cell, i) => {
                cell.textContent = `Player ${i + 1}`;
                cell.classList.remove("invalid");
            });

            if (teamNameInput) {
                teamNameInput.textContent = "";
                teamNameInput.classList.remove("invalid");
            }

            updateTotals();
            document.querySelectorAll(".current-batter, .current-inning").forEach(el => {
                el.classList.remove("current-batter", "current-inning");
            });

            saveState();
        });
    }

    // --- Load previous state ---
    loadState();
});