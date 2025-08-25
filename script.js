// Creates variable atBatCell for all at-bat cells
const atBatCells = document.querySelectorAll(".at-bat")

// Draw SVG diamond into at-bat cells
atBatCells.forEach(cell => {
    cell.innerHTML = `
        <svg width="50" height="50" viewBox="0 0 50 50">
        <!-- Diamond outline -->
        <polygon points="25,0 50,25 25,50 0,25"
                fill="white" stroke="black" stroke-width="1"/>

        <!-- Base paths -->
        <path d="M25,50 L50,25" stroke="black" stroke-width="4" fill="none" class="path-home-first" opacity="0.2"/>
        <path d="M50,25 L25,0"  stroke="black" stroke-width="4" fill="none" class="path-first-second" opacity="0.2"/>
        <path d="M25,0 L0,25"   stroke="black" stroke-width="4" fill="none" class="path-second-third" opacity="0.2"/>
        <path d="M0,25 L25,50"  stroke="black" stroke-width="4" fill="none" class="path-third-home" opacity="0.2"/>
        </svg>
    `;
});

// Draw paths on diamond according to hit recorded
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

// Valid hit values
const validHits = ["1B", "2B", "3B", "HR", "OUT"]

// Checking for valid input
function checkValidHit() {
    let input = prompt("Enter result (1B, 2B, 3B, HR, Out):");

    if (!input) {
        return null; // Cancel input if user presses "Cancel" or inputs nothing
    }

    input = input.toUpperCase().trim();

    if (validHits.includes(input)) {
        return input;
    } else {
        alert("Invalid input. Please enter a valid input: " + validHits.join(", "));
        return null;
    }
}

// Adds EventListener on click for an at-bat cell prompting user to enter type of hit
atBatCells.forEach(cell => {
    cell.addEventListener("click", () => {
        if (cell.textContent.trim() !== "") {
            
            const overwrite = confirm("This cell already has a value. Do you want to overwrite it?"); // Warns user if they try to fill an already filled cell
            if (!overwrite) {
                return; 
            }
        }

        const hit = checkValidHit(); 
        if (hit) {
            cell.dataset.hit = hit;            // store the hit
            const svg = cell.querySelector("svg");
            updateBases(svg, hit);
            
            const row = cell.closest("tr");
            const playerIndex = [...row.parentNode.children].indexOf(row);
            const inningIndex = [...row.querySelectorAll(".at-bat")].indexOf(cell);

            updateGameState(playerIndex, inningIndex, hit);
            updateTotals();
        }
    });
});

function updateTotals() {
    const rows = document.querySelectorAll("tbody tr"); // Select player rows
    const tfoot = document.querySelector("tfoot tr.team-hits"); // Select team total row
    const inningTotals = Array(9).fill(0); // Create an array for each inning
    
    let teamTotal = 0; // Keep track of team hits
    
    // Loop through every player row
    rows.forEach(row => {
        const atBats = row.querySelectorAll(".at-bat"); // Get at-bat cells for given player
        let playerTotal = 0; // Counter for given player
        
        atBats.forEach((cell, i) => {
            const hit = cell.dataset.hit;
            
            if (["1B", "2B", "3B", "HR"].includes(hit)) {
                playerTotal += 1;     // increment player total
                inningTotals[i] += 1; // increment inning total for that inning
            }
        });
        
        row.querySelector(".player-hits").textContent = playerTotal; // Write player's total to row
        
        teamTotal += playerTotal; // Add player total to team total
    });
    
    // Update inning totals in team row
    const inningCells = tfoot.querySelectorAll(".inning-total");
    inningCells.forEach((cell, i) => {
        cell.textContent = inningTotals[i];
    });
    
    // Update the team grand total in the footer
    tfoot.querySelector(".team-hits-total").textContent = teamTotal;
}

// Empty gameState var to start
const gameState = [];

// Initialize it for 9 players and 9 innings
for(let i = 0; i < 9; i++){
    gameState[i] = Array(9).fill("");
}

// Update state when user inputs a hit
function updateGameState(playerIndex, inningIndex, hit){
    gameState[playerIndex][inningIndex] = hit;
}
