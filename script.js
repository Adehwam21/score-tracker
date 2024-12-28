const playerList = [];
const previousStates = [];
const redoStates = [];


function loadFromStorage() {
    const storedPlayers = localStorage.getItem('playerList');
    const storedPreviousStates = localStorage.getItem('previousStates');
    const storedRedoStates = localStorage.getItem('redoStates');

    if (storedPlayers) {
        const parsedPlayers = JSON.parse(storedPlayers);
        playerList.push(...parsedPlayers);
    }

    if (storedPreviousStates) {
        const parsedPreviousStates = JSON.parse(storedPreviousStates);
        previousStates.push(...parsedPreviousStates);
    }

    if (storedRedoStates) {
        const parsedRedoStates = JSON.parse(storedRedoStates);
        redoStates.push(...parsedRedoStates);
    }

    renderPlayers();
}

// Save data to storage
function saveToStorage() {
    localStorage.setItem('playerList', JSON.stringify(playerList));
    localStorage.setItem('previousStates', JSON.stringify(previousStates));
    localStorage.setItem('redoStates', JSON.stringify(redoStates));
}

// Render players and update storage
function renderPlayers() {
    const playerTableBody = document.querySelector('#playerTable tbody');
    playerTableBody.innerHTML = '';

    // Sort players by score in descending order
    playerList.sort((a, b) => b.score - a.score);

    playerList.forEach(player => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${player.name}</td>
            <td>${player.score}</td>
            <td><input type="number" class="round-points" data-name="${player.name}" placeholder="Enter points"></td>
        `;
        playerTableBody.appendChild(row);
    });

    displayLoser();
    saveToStorage(); // Save changes to storage
}

function displayLoser() {
    const loserMessage = document.getElementById('loserMessage');
    const lastPlayer = playerList[playerList.length - 1];

    if (lastPlayer && lastPlayer.score <= 0) {
        loserMessage.textContent = `${lastPlayer.name} is the loser!`;
    } else {
        loserMessage.textContent = '';
    }
}

document.getElementById('addPlayer').addEventListener('click', () => {
    const playerName = document.getElementById('playerName').value.trim();
    const initialScore = parseInt(document.getElementById('initialScore').value, 10);

    if (playerName && !isNaN(initialScore) && playerList.length < 4) {
        playerList.push({ name: playerName, score: initialScore });
        renderPlayers();

        // Clear inputs
        document.getElementById('playerName').value = '';
        document.getElementById('initialScore').value = '50';
    } else {
        alert('You either entered an invalid name, or tried to exceed maximum players.');
    }
});

document.getElementById('updateScores').addEventListener('click', () => {
    // Save current state for undo
    previousStates.push(JSON.parse(JSON.stringify(playerList)));
    redoStates.length = 0; // Clear redo stack

    const roundPointsInputs = document.querySelectorAll('.round-points');
    roundPointsInputs.forEach(input => {
        const playerName = input.dataset.name;
        const roundPoints = parseInt(input.value, 10);

        if (!isNaN(roundPoints)) {
            const player = playerList.find(p => p.name === playerName);
            if (player) {
                player.score -= roundPoints;
            }
        }

        input.value = ''; // Clear input field
    });

    renderPlayers();
});

document.getElementById('undoScores').addEventListener('click', () => {
    if (previousStates.length > 0) {
        redoStates.push(JSON.parse(JSON.stringify(playerList)));
        const lastState = previousStates.pop();
        playerList.length = 0;
        playerList.push(...lastState);
        renderPlayers();
    } else {
        alert('No previous states to undo.');
    }
});

document.getElementById('redoScores').addEventListener('click', () => {
    if (redoStates.length > 0) {
        previousStates.push(JSON.parse(JSON.stringify(playerList)));
        const nextState = redoStates.pop();
        playerList.length = 0;
        playerList.push(...nextState);
        renderPlayers();
    } else {
        alert('No redo states available.');
    }
});

// Clear the board
document.getElementById('clearBoard').addEventListener('click', () => {
    playerList.length = 0;
    previousStates.length = 0;
    redoStates.length = 0;

    saveToStorage();
    renderPlayers();
});

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadFromStorage();
});
