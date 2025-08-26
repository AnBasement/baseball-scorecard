// Storage key variable
const STORAGE_KEY = "scorecard_v1";

// Valid hit values
const validHits = ["1B", "2B", "3B", "HR", "OUT"];

// Empty gameState var to start
const gameState = [];

// Catch player names from input
const playerNames = Array.from({ length: 10 }, (_, i) => `Player ${i + 1}`);

// Tracking outs per inning
const inningOuts = Array(9).fill(0);

// Initialize it for 9 players and 9 innings
for(let i = 0; i < 9; i++){
    gameState[i] = Array(9).fill("");
}

// Track the sequence of outs per inning
const inningOutCells = Array(9).fill(null).map(() => []);

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
        const outSvg = outCell.querySelector("svg");
        const circle = outSvg.querySelector("circle");
        const text = outSvg.querySelector(".outs-text");

        if (circle) circle.setAttribute("opacity", "1");
        if (text) {
            text.setAttribute("opacity", "1");
            text.textContent = idx + 1; // 1-based
        }
    });
}

// Remove a cell from out tracking if hit changes
function removeOut(cell, inningIndex) {
    const index = inningOutCells[inningIndex].indexOf(cell);
    if (index !== -1) {
        inningOutCells[inningIndex].splice(index, 1); // remove it
    }

    // Recalculate out numbers for remaining cells
    inningOutCells[inningIndex].forEach((outCell, idx) => {
        const svg = outCell.querySelector("svg");
        const circle = svg.querySelector("circle");
        const text = svg.querySelector(".outs-text");

        if (circle) circle.setAttribute("opacity", "1");
        if (text) {
            text.setAttribute("opacity", "1");
            text.textContent = idx + 1;
        }
    });

    // Hide this cell's outs indicator
    const svg = cell.querySelector("svg");
    if (svg) {
        const circle = svg.querySelector("circle");
        const text = svg.querySelector(".outs-text");
        if (circle) circle.setAttribute("opacity", "0");
        if (text) {
            text.setAttribute("opacity", "0");
            text.textContent = "0";
        }
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
function updateBases(svg, hit, cell) {
    // Reset all paths and remove previous text
    svg.querySelectorAll("path").forEach(path => path.setAttribute("opacity", "0.2"));
    const prevText = svg.querySelector(".hit-text");
    if (prevText) prevText.remove();

    // Reset outs indicator
    const outsCircle = svg.querySelector("circle");
    const outsText = svg.querySelector(".outs-text");
    if (outsCircle) outsCircle.setAttribute("opacity", "0");
    if (outsText) {
        outsText.setAttribute("opacity", "0");
        outsText.textContent = "0";
    }

    // Undo previous out if any
    if (cell.dataset.outRecorded === "true") {
        const row = cell.closest("tr");
        const inningIndex = [...row.querySelectorAll(".at-bat")].indexOf(cell);
        removeOut(cell, inningIndex);
        cell.dataset.outRecorded = "false";
    }

    switch(hit) {
        case "1B":
            svg.querySelector(".path-home-first").setAttribute("opacity", "1");
            break;
        case "2B":
            svg.querySelector(".path-home-first").setAttribute("opacity", "1");
            svg.querySelector(".path-first-second").setAttribute("opacity", "1");
            break;
        case "3B":
            svg.querySelector(".path-home-first").setAttribute("opacity", "1");
            svg.querySelector(".path-first-second").setAttribute("opacity", "1");
            svg.querySelector(".path-second-third").setAttribute("opacity", "1");
            break;
        case "HR":
            const polygon = svg.querySelector("polygon");
            polygon.setAttribute("fill", "black");
            break;
        case "BB":
        case "HBP":
            svg.querySelector(".path-home-first").setAttribute("opacity", "1");
            const textBB = document.createElementNS("http://www.w3.org/2000/svg", "text");
            textBB.setAttribute("x", "38");
            textBB.setAttribute("y", "45");
            textBB.setAttribute("font-size", "10");
            textBB.setAttribute("text-anchor", "start");
            textBB.setAttribute("dominant-baseline", "middle");
            textBB.textContent = hit;
            textBB.classList.add("hit-text");
            svg.appendChild(textBB);
            break;
        case "E":
            svg.querySelector(".path-home-first").setAttribute("opacity", "1");
            const errorText = document.createElementNS("http://www.w3.org/2000/svg", "text");
            errorText.setAttribute("x", "25");
            errorText.setAttribute("y", "27");
            errorText.setAttribute("font-size", "20");
            errorText.setAttribute("font-weight", "bold");
            errorText.setAttribute("text-anchor", "middle");
            errorText.setAttribute("dominant-baseline", "middle");
            errorText.textContent = hit;
            errorText.classList.add("hit-text");
            svg.appendChild(errorText);
            break;
        case "K":
        case "LO":
        case "FO":
        case "GO":
            const textOut = document.createElementNS("http://www.w3.org/2000/svg", "text");
            textOut.setAttribute("x", "25");
            textOut.setAttribute("y", "27");
            textOut.setAttribute("font-size", "20");
            textOut.setAttribute("font-weight", "bold");
            textOut.setAttribute("text-anchor", "middle");
            textOut.setAttribute("dominant-baseline", "middle");
            textOut.textContent = hit;
            textOut.classList.add("hit-text");
            svg.appendChild(textOut);

            if (!cell) {
                console.warn("Cell not provided for out-type hit");
                break;
            }

            // Track outs per inning
            const row = cell.closest("tr");
            const inningIndex = [...row.querySelectorAll(".at-bat")].indexOf(cell);
            recordOut(cell, inningIndex);

            // Mark that this cell contributed to the out counter
            cell.dataset.outRecorded = "true";
            break;
    }
}

// Valid input selections
const atBatOutcomes = ["1B", "2B", "3B", "HR", "BB", "K", "FO", "GO", "HBP", "E"];

// Popup that allows for selection of at-bat result
document.getElementById("modalOk").addEventListener("click", () => {
    if (!currentCell) return;
    const select = document.getElementById("outcomeSelect");
    const hit = select.value;

    const row = currentCell.closest("tr");
    const playerIndex = [...row.parentNode.children].indexOf(row);
    const inningIndex = [...row.querySelectorAll(".at-bat")].indexOf(currentCell);

    if (!hit) {
        // Clear the at-bat cell
        currentCell.dataset.hit = "";

        const svg = currentCell.querySelector("svg");
        if (svg) {
            // Reset polygon fill
            const polygon = svg.querySelector("polygon");
            if (polygon) polygon.setAttribute("fill", "white");

            // Reset all paths
            svg.querySelectorAll("path").forEach(path => path.setAttribute("opacity", "0.2"));

            // Remove any hit text
            const text = svg.querySelector(".hit-text");
            if (text) text.remove();

            // Reset outs circle and text
            const circle = svg.querySelector("circle");
            const outsText = svg.querySelector(".outs-text");
            if (circle) circle.setAttribute("opacity", "0");
            if (outsText) {
                outsText.setAttribute("opacity", "0");
                outsText.textContent = "0";
            }

            // Remove this cell from out tracking if it was recorded
            if (currentCell.dataset.outRecorded === "true") {
                removeOut(currentCell, inningIndex);
                currentCell.dataset.outRecorded = "false";
            }
        }
    } else {
        // Normal behavior if a hit is selected
        currentCell.dataset.hit = hit;
        const svg = currentCell.querySelector("svg");
        updateBases(svg, hit, currentCell);
    }

    // Update game state, totals, and highlights
    updateGameState(playerIndex, inningIndex, hit);
    updateTotals();
    saveState();
    highlightCurrentBatter(currentCell);
    highlightCurrentInning(inningIndex);

    hideModal();
});

// Updates the totals for hits and runs
function updateTotals() {
    const rows = document.querySelectorAll("tbody tr"); // Select player rows
    const tfoot = document.querySelector("tfoot"); // footer element

    // Updating hits total
    const inningHitTotals = Array(9).fill(0);
    let teamHitTotal = 0;

    rows.forEach(row => {
        const atBats = row.querySelectorAll(".at-bat");
        let playerHitTotal = 0;

        atBats.forEach((cell, i) => {
            const hit = cell.dataset.hit;
            if (["1B", "2B", "3B", "HR"].includes(hit)) {
                playerHitTotal += 1;
                inningHitTotals[i] += 1;
            }
        });

        row.querySelector(".player-hits").textContent = playerHitTotal;
        teamHitTotal += playerHitTotal;
    });

    const inningHitCells = tfoot.querySelectorAll(".team-hits .inning-total");
    inningHitCells.forEach((cell, i) => {
        cell.textContent = inningHitTotals[i];
    });

    tfoot.querySelector(".team-hits-total").textContent = teamHitTotal;

    // Updating runs total
    const inningRunTotals = Array(9).fill(0);
    let teamRunTotal = 0;

    rows.forEach(row => {
        const atBats = row.querySelectorAll(".at-bat");
        atBats.forEach((cell, i) => {
            if (cell.dataset.hit === "HR") {
                inningRunTotals[i] += 1;
                teamRunTotal += 1;
            }
        });
    });

    const inningRunCells = tfoot.querySelectorAll(".team-runs .inning-run-total");
    inningRunCells.forEach((cell, i) => {
        cell.textContent = inningRunTotals[i];
    });

    tfoot.querySelector(".team-runs-total").textContent = teamRunTotal;

    // Updating errors total
    const inningErrorTotals = Array(9).fill(0);
    let teamErrorTotal = 0;

    rows.forEach(row => {
        const atBats = row.querySelectorAll(".at-bat");
        atBats.forEach((cell, i) => {
            if (cell.dataset.hit === "E") {
                inningErrorTotals[i] += 1;
                teamErrorTotal += 1;
            }
        });
    });

    const inningErrorCells = tfoot.querySelectorAll(".team-errors .inning-error-total");
    inningErrorCells.forEach((cell, i) => {
        cell.textContent = inningErrorTotals[i];
    });

    tfoot.querySelector(".team-errors-total").textContent = teamErrorTotal;
}

// Updating the gamestate
function updateGameState(playerIndex, inningIndex, hit){
    gameState[playerIndex][inningIndex] = hit;
}

// Allows for saving state of scorecard
function saveState() {
    try {
        const rows = Array.from(document.querySelectorAll("tbody tr"));

        // Collect hits/errors per player per inning
        const hits = rows.map(row => {
            const cells = Array.from(row.querySelectorAll(".at-bat"));
            return cells.map(cell => cell.dataset.hit || "");
        });

        // Ensure totals are up-to-date
        updateTotals();

        // Collect totals
        const playerTotals = rows.map(row =>
            Number((row.querySelector(".player-hits")?.textContent || "0").trim()) || 0
        );
        const inningHitTotals = Array.from(document.querySelectorAll("tfoot .team-hits .inning-total"))
            .map(td => Number((td.textContent || "0").trim()) || 0);
        const teamHitTotal = Number((document.querySelector("tfoot .team-hits-total")?.textContent || "0").trim()) || 0;

        const inningRunTotals = Array.from(document.querySelectorAll("tfoot .team-runs .inning-run-total"))
            .map(td => Number((td.textContent || "0").trim()) || 0);
        const teamRunTotal = Number((document.querySelector("tfoot .team-runs-total")?.textContent || "0").trim()) || 0;

        const inningErrorTotals = Array.from(document.querySelectorAll("tfoot .team-errors .inning-error-total"))
            .map(td => Number((td.textContent || "0").trim()) || 0);
        const teamErrorTotal = Number((document.querySelector("tfoot .team-errors-total")?.textContent || "0").trim()) || 0;

        // Collect player names
        const playerNames = rows.map((row, i) => {
            const cell = row.querySelector(`#playerName-${i}`);
            return cell?.textContent?.trim() || `Player ${i + 1}`;
        });

        // Collect team name
        const teamName = document.querySelector(".teamNameInput")?.textContent?.trim() || "";

        // Collect current batter and inning highlights
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

// Allows for loading scorecard from last session
function loadState() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (!saved) return;

        const payload = JSON.parse(saved);
        const hits = payload.hits || [];

        const rows = document.querySelectorAll("tbody tr");

        // Restore hits and diamond visualization
        rows.forEach((row, playerIndex) => {
            const cells = row.querySelectorAll(".at-bat");
            cells.forEach((cell, inningIndex) => {
                const hit = hits[playerIndex]?.[inningIndex] || "";
                if (hit) {
                    cell.dataset.hit = hit;   
                    updateBases(cell.querySelector("svg"), hit, cell);
                }
            });
        });

        // Restore player names
        rows.forEach((row, i) => {
            const cell = row.querySelector(`#playerName-${i}`);
            if (cell) cell.textContent = payload.playerNames?.[i] || `Player ${i + 1}`;
        });

        // Restore team name
        const teamInput = document.querySelector(".teamNameInput");
        if (teamInput) teamInput.textContent = payload.teamName || "";

        // Update totals after restoring hits
        updateTotals();

        // Restore errors totals in footer
        if (payload.totals?.inningErrorTotals) {
            const inningErrorCells = document.querySelectorAll("tfoot .team-errors .inning-error-total");
            inningErrorCells.forEach((cell, i) => {
                cell.textContent = payload.totals.inningErrorTotals[i] || 0;
            });
        }
        if (payload.totals?.teamErrorTotal !== undefined) {
            const teamErrorCell = document.querySelector("tfoot .team-errors-total");
            if (teamErrorCell) teamErrorCell.textContent = payload.totals.teamErrorTotal;
        }

        // Restore current batter highlight
        if (payload.lastBatter) {
            const batterRow = rows[payload.lastBatter.playerIndex];
            const batterCell = batterRow.querySelectorAll(".at-bat")[payload.lastBatter.inningIndex];
            if (batterCell) {
                currentCell = batterCell;
                batterCell.classList.add("current-batter");
            }
        }

        // Restore current inning highlight
        if (payload.lastInning !== null) {
            highlightCurrentInning(payload.lastInning);
        }

    } catch (err) {
        console.error("Failed to load scorecard state:", err);
    }
}


let currentCell = null;

function showModal(cell) {
    currentCell = cell;
    const modal = document.getElementById("atBatModal");
    const overlay = document.getElementById("modalOverlay");
    const select = document.getElementById("outcomeSelect");

    // Preselect previous value if any
    select.value = cell.dataset.hit || "";

    modal.style.display = "block";
    overlay.style.display = "block";
    select.focus();
}

function hideModal() {
    const modal = document.getElementById("atBatModal");
    const overlay = document.getElementById("modalOverlay");
    modal.style.display = "none";
    overlay.style.display = "none";
    currentCell = null;
}

// Handle modal buttons
document.getElementById("modalOk").addEventListener("click", () => {
    if (!currentCell) return;
    const select = document.getElementById("outcomeSelect");
    const hit = select.value;
    if (hit) {
        currentCell.dataset.hit = hit;  
        const svg = currentCell.querySelector("svg");
        updateBases(svg, hit, currentCell);

        const row = currentCell.closest("tr");
        const playerIndex = [...row.parentNode.children].indexOf(row);
        const inningIndex = [...row.querySelectorAll(".at-bat")].indexOf(currentCell);

        updateGameState(playerIndex, inningIndex, hit);
        updateTotals();
        saveState();
        highlightCurrentBatter(currentCell);
        highlightCurrentInning(currentCell.dataset.inning);

        hideModal();
    }
});

document.getElementById("modalCancel").addEventListener("click", hideModal);
document.getElementById("modalOverlay").addEventListener("click", hideModal);


document.addEventListener("DOMContentLoaded", () => {
    const atBatCells = document.querySelectorAll(".at-bat");

    atBatCells.forEach(cell => {
        cell.innerHTML = `
            <svg width="70" height="50" viewBox="0 0 70 50">
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

        // Attach click to show modal instead
        cell.addEventListener("click", () => {
            showModal(cell);
        });
    });

    // Load saved state after dropdowns are implemented
    loadState();

    // Add click handlers for at-bats
    atBatCells.forEach(cell => {
        cell.addEventListener("click", () => {
            showModal(cell);
        });
    }); 

// Add listeners for player names
document.querySelectorAll(".player-name").forEach(cell => {
    cell.addEventListener("input", () => {
        if (!cell.textContent.trim()) {
            cell.classList.add("invalid");
        } else {
            cell.classList.remove("invalid");
        }
        saveState();
    });
});

// Add listener for team name
const teamNameInput = document.querySelector(".teamNameInput");
if (teamNameInput) {
    teamNameInput.addEventListener("input", () => {
        if (!teamNameInput.textContent.trim()) {
            teamNameInput.classList.add("invalid");
        } else {
            teamNameInput.classList.remove("invalid");
        }
        saveState();
    });
}


    // Reset/clear button functionality
    const resetButton = document.getElementById("resetScorecard");
    if (resetButton) {
        resetButton.addEventListener("click", () => {
            if (confirm("Are you sure you want to reset the scorecard?")) {
                localStorage.removeItem(STORAGE_KEY);

                // Clear all at-bat cells
                document.querySelectorAll(".at-bat").forEach(cell => {
                    cell.dataset.hit = "";

                    const svg = cell.querySelector("svg");
                    if (svg) {
                        // Reset polygon fill
                        const polygon = svg.querySelector("polygon");
                        if (polygon) polygon.setAttribute("fill", "white");

                        // Reset all paths
                        svg.querySelectorAll("path").forEach(path => path.setAttribute("opacity", "0.2"));

                        // Remove any hit text
                        const text = svg.querySelector(".hit-text");
                        if (text) text.remove();

                        // Reset outs circle and text
                        const outsCircle = svg.querySelector("circle");
                        const outsText = svg.querySelector(".outs-text");
                        if (outsCircle) outsCircle.setAttribute("opacity", "0");
                        if (outsText) {
                            outsText.setAttribute("opacity", "0");
                            outsText.textContent = "0";
                        }
                    }
                });

                // Reset inning outs counter
                inningOuts.fill(0);

                // Reset player names
                document.querySelectorAll(".player-name").forEach((cell, i) => {
                    cell.textContent = `Player ${i + 1}`;
                    cell.classList.remove("invalid");
                });

                // Reset team name
                const teamInput = document.querySelector(".teamNameInput");
                if (teamInput) {
                    teamInput.textContent = "";
                    teamInput.classList.remove("invalid");
                }

                // Reset totals
                updateTotals();

                // Remove all highlights
                document.querySelectorAll(".current-batter, .current-inning").forEach(el => {
                    el.classList.remove("current-batter", "current-inning");
                });
            }
        });
    }
}); 