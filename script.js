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

// Function for recording outs
function recordOut(cell, inningIndex) {
    // Increment outs count
    inningOuts[inningIndex] = (inningOuts[inningIndex] || 0) + 1;

    const svg = cell.querySelector("svg");
    if (!svg) return;

    const circle = svg.querySelector("circle");
    const text = svg.querySelector(".outs-text");

    if (circle && text) {
        circle.setAttribute("opacity", "1");
        text.setAttribute("opacity", "1");
        text.textContent = inningOuts[inningIndex];
    }
}

// Changes diamond based on input
function updateBases(svg, hit, cell) {
    // Reset all paths and remove previous text
    svg.querySelectorAll("path").forEach(path => path.setAttribute("opacity", "0.2"));
    let text = svg.querySelector(".hit-text");
    if (text) text.remove();

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
            text = document.createElementNS("http://www.w3.org/2000/svg", "text");
            text.setAttribute("x", hit === "BB" ? "38" : "38");
            text.setAttribute("y", "45");
            text.setAttribute("font-size", "10");
            text.setAttribute("text-anchor", "start");
            text.setAttribute("dominant-baseline", "middle");
            text.textContent = hit;
            text.classList.add("hit-text");
            svg.appendChild(text);
            break;
        case "K":
        case "LO":
        case "FO":
        case "GO":
            const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
            text.setAttribute("x", "25");
            text.setAttribute("y", "27");
            text.setAttribute("font-size", "20");
            text.setAttribute("font-weight", "bold");
            text.setAttribute("text-anchor", "middle");
            text.setAttribute("dominant-baseline", "middle");
            text.textContent = hit;
            text.classList.add("hit-text");
            svg.appendChild(text);

            if (!cell) {
                console.warn("Cell not provided for out-type hit");
                break;
            }

            // Track outs per inning
            const row = cell.closest("tr");
            const inningIndex = [...row.querySelectorAll(".at-bat")].indexOf(cell);
            recordOut(cell, inningIndex);
            break;
    }
}

// Valid input selections
const atBatOutcomes = ["1B", "2B", "3B", "HR", "BB", "K", "FO", "GO", "HBP"];

// Popup that allows for selection of at-bat result
function createOutcomeDropdown(cell) {
    const select = document.createElement("select");
    select.innerHTML = `<option value="">-</option>` + 
        atBatOutcomes.map(hit => `<option value="${hit}">${hit}</option>`).join("");
    select.addEventListener("change", () => {
        const hit = select.value;
        if (hit) {
            cell.dataset.hit = hit;
            const svg = cell.querySelector("svg");
            updateBases(svg, hit, cell); // pass cell here

            const row = cell.closest("tr");
            const playerIndex = [...row.parentNode.children].indexOf(row);
            const inningIndex = [...row.querySelectorAll(".at-bat")].indexOf(cell);

            updateGameState(playerIndex, inningIndex, hit);
            updateTotals();
            saveState();
        }
    });
    cell.innerHTML = ""; // clear previous content
    cell.appendChild(select);
}

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
}

// Updating the gamestate
function updateGameState(playerIndex, inningIndex, hit){
    gameState[playerIndex][inningIndex] = hit;
}

// Allows for saving state of scorecard
function saveState() {
    try {
        const rows = Array.from(document.querySelectorAll("tbody tr"));

        // Collect hits per player per inning
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
        const inningTotals = Array.from(document.querySelectorAll("tfoot .inning-total"))
            .map(td => Number((td.textContent || "0").trim()) || 0);
        const teamTotal = Number((document.querySelector("tfoot .team-hits-total")?.textContent || "0").trim()) || 0;

        // Collect player names
        const playerNames = rows.map((row, i) => {
            const cell = row.querySelector(`#playerName-${i}`);
            return cell?.textContent?.trim() || `Player ${i + 1}`;
        });

        // Collect team name
        const teamName = document.querySelector(".teamNameInput")?.textContent?.trim() || "";

        const payload = {
            version: 1,
            timestamp: new Date().toISOString(),
            hits,
            totals: {
                playerTotals,
                inningTotals,
                teamTotal
            },
            playerNames,
            teamName
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
            }
        });
    }
}); 