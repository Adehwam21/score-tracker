const playerList = [];
const previousStates = [];
const redoStates = [];

// Load from storage
function loadFromStorage() {
    const storedPlayers = localStorage.getItem('maxScorePlayerList');
    const storedPreviousStates = localStorage.getItem('maxScorePreviousStates');
    const storedRedoStates = localStorage.getItem('maxScoreRedoStates');

    if (storedPlayers) {
        playerList.push(...JSON.parse(storedPlayers));
    }

    if (storedPreviousStates) {
        previousStates.push(...JSON.parse(storedPreviousStates));
    }

    if (storedRedoStates) {
        redoStates.push(...JSON.parse(storedRedoStates));
    }

    renderPlayers();
}

// Save to storage
function saveToStorage() {
    localStorage.setItem('maxScorePlayerList', JSON.stringify(playerList));
    localStorage.setItem('maxScorePreviousStates', JSON.stringify(previousStates));
    localStorage.setItem('maxScoreRedoStates', JSON.stringify(redoStates));
}

// Render players and check for winner
function renderPlayers() {
    const playerTableBody = document.querySelector('#playerTable tbody');
    playerTableBody.innerHTML = '';

    playerList.forEach(player => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${player.name}</td>
            <td>${player.score}</td>
            <td><input type="number" class="round-points" data-name="${player.name}" placeholder="Enter points"></td>
        `;
        playerTableBody.appendChild(row);
    });

    checkWinner();
    saveToStorage();
}

// Check if any player has reached or exceeded the target score
function checkWinner() {
    const winnerMessage = document.getElementById('winnerMessage');
    const targetScore = parseInt(document.getElementById('targetScore').value, 10);

    const winner = playerList.find(player => player.score >= targetScore);

    if (winner) {
        winnerMessage.textContent = `${winner.name} has won!`;
    } else {
        winnerMessage.textContent = '';
    }
}

document.getElementById('addPlayer').addEventListener('click', () => {
    const playerName = document.getElementById('playerName').value.trim();

    if (playerName && playerList.length < 4) {
        playerList.push({ name: playerName, score: 0 });
        renderPlayers();

        document.getElementById('playerName').value = '';
    } else {
        alert('Invalid name or maximum players reached.');
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
                player.score += roundPoints;
            }
        }

        input.value = '';
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
