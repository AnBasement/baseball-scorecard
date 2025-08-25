// Creates variable atBatCell for all at-bat cells
const atBatCells = document.querySelectorAll(".at-bat")

// Valid hit values
const validHits = ["1B", "2B", "3B", "HR", "Out"]

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
            cell.textContent = hit;
            updateGameState(playerIndex, inningIndex, hit);
        }
    });
});

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
