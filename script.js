// Storage key variable
const STORAGE_KEY = "scorecard_v1";

// Valid hit values
const validHits = ["1B", "2B", "3B", "HR", "OUT"];

// Empty gameState var to start
const gameState = [];

// Catch player names from input
const playerNames = Array.from({ length: 10 }, (_, i) => `Player ${i + 1}`);

// Initialize it for 9 players and 9 innings
for(let i = 0; i < 9; i++){
    gameState[i] = Array(9).fill("");
}

function updateBases(svg, hit) {
    // Reset all paths to dim
    svg.querySelectorAll("path").forEach(path => {
        path.setAttribute("opacity", "0.2");
    });

    if (hit === "1B") { 
        svg.querySelector(".path-home-first").setAttribute("opacity", "1");
    }
    if (hit === "2B") {
        svg.querySelector(".path-home-first").setAttribute("opacity", "1");
        svg.querySelector(".path-first-second").setAttribute("opacity", "1");
    }
    if (hit === "3B") {
        svg.querySelector(".path-home-first").setAttribute("opacity", "1");
        svg.querySelector(".path-first-second").setAttribute("opacity", "1");
        svg.querySelector(".path-second-third").setAttribute("opacity", "1");
    }
    if (hit === "HR") {
        svg.querySelectorAll("path").forEach(path => {
            path.setAttribute("opacity", "1");
        });
    }
}

function checkValidHit() {
    let input = prompt("Enter result (1B, 2B, 3B, HR, Out):");

    if (!input) return null;

    input = input.toUpperCase().trim();

    if (validHits.includes(input)) return input;
    
    alert("Invalid input. Please enter a valid input: " + validHits.join(", "));
    return null;
}

function updateTotals() {
    const rows = document.querySelectorAll("tbody tr"); // Select player rows
    const tfoot = document.querySelector("tfoot tr.team-hits"); // Select team total row
    const inningTotals = Array(9).fill(0);
    let teamTotal = 0;

    rows.forEach(row => {
        const atBats = row.querySelectorAll(".at-bat");
        let playerTotal = 0;

        atBats.forEach((cell, i) => {
            const hit = cell.dataset.hit;
            if (["1B", "2B", "3B", "HR"].includes(hit)) {
                playerTotal += 1;
                inningTotals[i] += 1;
            }
        });

        row.querySelector(".player-hits").textContent = playerTotal;
        teamTotal += playerTotal;
    });

    const inningCells = tfoot.querySelectorAll(".inning-total");
    inningCells.forEach((cell, i) => {
        cell.textContent = inningTotals[i];
    });

    tfoot.querySelector(".team-hits-total").textContent = teamTotal;
}

function updateGameState(playerIndex, inningIndex, hit){
    gameState[playerIndex][inningIndex] = hit;
}

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
                    const svg = cell.querySelector("svg");
                    if (svg) updateBases(svg, hit);
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

document.addEventListener("DOMContentLoaded", () => {
    const atBatCells = document.querySelectorAll(".at-bat");

    // Draw SVG diamond in all cells
    atBatCells.forEach(cell => {
        cell.innerHTML = `
            <svg width="50" height="50" viewBox="0 0 50 50">
                <polygon points="25,0 50,25 25,50 0,25"
                    fill="white" stroke="black" stroke-width="1"/>
                <path d="M25,50 L50,25" stroke="black" stroke-width="4" fill="none" class="path-home-first" opacity="0.2"/>
                <path d="M50,25 L25,0"  stroke="black" stroke-width="4" fill="none" class="path-first-second" opacity="0.2"/>
                <path d="M25,0 L0,25"   stroke="black" stroke-width="4" fill="none" class="path-second-third" opacity="0.2"/>
                <path d="M0,25 L25,50"  stroke="black" stroke-width="4" fill="none" class="path-third-home" opacity="0.2"/>
            </svg>
        `;
    });

    // Load saved state if any
    loadState();

    // Add click handlers for at-bats
    atBatCells.forEach(cell => {
        cell.addEventListener("click", () => {
            if (cell.dataset.hit) { // already has a hit recorded
                const overwrite = confirm("This cell already has a value. Do you want to overwrite it?");
                if (!overwrite) return; // stop further processing
            }

            const hit = checkValidHit();
            if (hit) {
                cell.dataset.hit = hit;
                const svg = cell.querySelector("svg");
                updateBases(svg, hit);

                const row = cell.closest("tr");
                const playerIndex = [...row.parentNode.children].indexOf(row);
                const inningIndex = [...row.querySelectorAll(".at-bat")].indexOf(cell);

                updateGameState(playerIndex, inningIndex, hit);
                updateTotals();
                saveState();
            }
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
                    if (svg) svg.querySelectorAll("path").forEach(path => path.setAttribute("opacity", "0.2"));
                });

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