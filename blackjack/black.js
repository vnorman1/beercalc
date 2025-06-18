// Blackjack Game Logic
let gameState = {
    playerCards: [],
    dealerCards: [],
    deck: [],
    playerScore: 0,
    dealerScore: 0,
    gameInProgress: false,
    currentBet: 0,
    balance: 0,
    totalLost: 0,
    gamesPlayed: 0,
    gamesWon: 0,
    gamesLost: 0
};

// Card suits and values
const suits = ['♠', '♥', '♦', '♣'];
const values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

// Initialize game
function initGame() {
    // Get net salary from localStorage or URL parameters
    const netSalary = getNetSalary();
    
    if (netSalary) {
        gameState.balance = netSalary;
        updateDisplay();
    } else {
        // Default balance if no salary data
        gameState.balance = 300000;
        updateDisplay();
        showNoSalaryMessage();
    }
    
    loadStats();
    updateStatsDisplay();
}

// Get net salary from localStorage or URL parameters
function getNetSalary() {
    // Try localStorage first
    const storedSalary = localStorage.getItem('netSalary');
    if (storedSalary) {
        return parseInt(storedSalary);
    }
    
    // Try URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const urlSalary = urlParams.get('net');
    if (urlSalary) {
        return parseInt(urlSalary);
    }
    
    return null;
}

// Show message when no salary data is available
function showNoSalaryMessage() {
    const header = document.querySelector('header');
    const notice = document.createElement('div');
    notice.className = 'bg-yellow-100 border-l-4 border-yellow-500 p-4 mx-auto max-w-4xl mt-4';
    notice.innerHTML = `
        <div class="text-center">
            <p class="text-yellow-800 font-medium">
                ⚠️ Nettó fizetés adat nem található
            </p>
            <p class="text-yellow-700 text-sm mt-1">
                Alapértelmezett egyenleg: 300.000 Ft
            </p>
            <a href="../index.html" class="text-blue-600 hover:text-blue-800 underline text-sm">
                Számítsa ki a fizetését →
            </a>
        </div>
    `;
    header.appendChild(notice);
}

// Create and shuffle deck
function createDeck() {
    const deck = [];
    for (let suit of suits) {
        for (let value of values) {
            deck.push({ suit, value });
        }
    }
    return shuffleDeck(deck);
}

// Shuffle deck
function shuffleDeck(deck) {
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    return deck;
}

// Get card value for scoring
function getCardValue(card) {
    if (card.value === 'A') return 11;
    if (['J', 'Q', 'K'].includes(card.value)) return 10;
    return parseInt(card.value);
}

// Calculate hand score
function calculateScore(cards) {
    let score = 0;
    let aces = 0;
    
    for (let card of cards) {
        if (card.value === 'A') {
            aces++;
            score += 11;
        } else if (['J', 'Q', 'K'].includes(card.value)) {
            score += 10;
        } else {
            score += parseInt(card.value);
        }
    }
    
    // Adjust for aces
    while (score > 21 && aces > 0) {
        score -= 10;
        aces--;
    }
    
    return score;
}

// Create card element
function createCardElement(card, isHidden = false) {
    const cardElement = document.createElement('div');
    cardElement.className = `card ${['♥', '♦'].includes(card.suit) ? 'red' : 'black'}`;
    
    if (isHidden) {
        cardElement.className += ' card-back';
        cardElement.innerHTML = `
            <div>🂠</div>
            <div style="transform: rotate(180deg);">🂠</div>
        `;
    } else {
        cardElement.innerHTML = `
            <div>${card.value}</div>
            <div style="text-align: center; font-size: 20px;">${card.suit}</div>
            <div style="transform: rotate(180deg);">${card.value}</div>
        `;
    }
    
    return cardElement;
}

// Set bet amount
function setBet(amount) {
    if (amount === 'all') {
        gameState.currentBet = gameState.balance;
    } else {
        if (amount > gameState.balance) {
            alert('Nincs elég pénze ehhez a téthez!');
            return;
        }
        gameState.currentBet = amount;
    }
    
    updateDisplay();
    document.getElementById('startGameBtn').disabled = false;
    
    // Add visual feedback
    document.querySelectorAll('.bet-button').forEach(btn => {
        btn.classList.remove('bg-green-200', 'border-green-500');
        btn.classList.add('bg-gray-100');
    });
    
    if (amount !== 'all') {
        event.target.classList.remove('bg-gray-100');
        event.target.classList.add('bg-green-200', 'border-green-500');
    }
}

// Set custom bet
function setCustomBet() {
    const customBetInput = document.getElementById('customBet');
    const amount = parseInt(customBetInput.value);
    
    if (!amount || amount <= 0) {
        alert('Kérjük, adjon meg egy érvényes tétet!');
        return;
    }
    
    if (amount > gameState.balance) {
        alert('Nincs elég pénze ehhez a téthez!');
        return;
    }
    
    gameState.currentBet = amount;
    updateDisplay();
    document.getElementById('startGameBtn').disabled = false;
    customBetInput.value = '';
}

// Start new game
function startGame() {
    if (gameState.currentBet <= 0) {
        alert('Kérjük, válasszon tétet!');
        return;
    }
    
    // Initialize game
    gameState.deck = createDeck();
    gameState.playerCards = [];
    gameState.dealerCards = [];
    gameState.gameInProgress = true;
    
    // Deal initial cards
    gameState.playerCards.push(gameState.deck.pop());
    gameState.dealerCards.push(gameState.deck.pop());
    gameState.playerCards.push(gameState.deck.pop());
    gameState.dealerCards.push(gameState.deck.pop());
    
    // Calculate scores
    gameState.playerScore = calculateScore(gameState.playerCards);
    gameState.dealerScore = calculateScore([gameState.dealerCards[0]]); // Only first card visible
    
    // Update display
    displayCards();
    updateScores();
    
    // Show game area
    document.getElementById('bettingSection').style.display = 'none';
    document.getElementById('gameArea').style.display = 'block';
    
    // Check for blackjack
    if (gameState.playerScore === 21) {
        setTimeout(() => {
            checkForBlackjack();
        }, 1000);
    } else {
        enableGameControls();
    }
}

// Check for blackjack
function checkForBlackjack() {
    const dealerScore = calculateScore(gameState.dealerCards);
    
    if (gameState.playerScore === 21 && dealerScore === 21) {
        endGame('tie', 'Mindketten blackjack! Döntetlen');
    } else if (gameState.playerScore === 21) {
        endGame('win', 'Blackjack! Ön nyert!');
    } else if (dealerScore === 21) {
        endGame('lose', 'Az osztó blackjack-et kapott!');
    }
}

// Player hits
function hit() {
    if (!gameState.gameInProgress) return;
    
    gameState.playerCards.push(gameState.deck.pop());
    gameState.playerScore = calculateScore(gameState.playerCards);
    
    displayCards();
    updateScores();
    
    if (gameState.playerScore > 21) {
        endGame('lose', 'Túlment! Vesztett!');
    } else if (gameState.playerScore === 21) {
        stand(); // Auto-stand on 21
    }
}

// Player stands
function stand() {
    if (!gameState.gameInProgress) return;
    
    disableGameControls();
    
    // Dealer plays
    setTimeout(() => {
        dealerPlay();
    }, 1000);
}

// Dealer plays
function dealerPlay() {
    // First reveal the hidden card
    gameState.gameInProgress = false; // This will make displayCards show all dealer cards
    gameState.dealerScore = calculateScore(gameState.dealerCards);
    displayCards(); // Show dealer's hidden card
    updateScores();
    
    const dealerTurn = () => {
        if (gameState.dealerScore < 17) {
            setTimeout(() => {
                gameState.dealerCards.push(gameState.deck.pop());
                gameState.dealerScore = calculateScore(gameState.dealerCards);
                displayCards();
                updateScores();
                dealerTurn();
            }, 1000);
        } else {
            // Determine winner
            setTimeout(() => {
                determineWinner();
            }, 1000);
        }
    };
    
    dealerTurn();
}

// Determine winner
function determineWinner() {
    if (gameState.dealerScore > 21) {
        endGame('win', 'Az osztó túlment! Ön nyert!');
    } else if (gameState.playerScore > gameState.dealerScore) {
        endGame('win', 'Ön nyert!');
    } else if (gameState.playerScore < gameState.dealerScore) {
        endGame('lose', 'Az osztó nyert!');
    } else {
        endGame('tie', 'Döntetlen!');
    }
}

// End game
function endGame(result, message) {
    gameState.gameInProgress = false;
    gameState.gamesPlayed++;
    
    let winAmount = 0;
    let resultColor = '';
    
    if (result === 'win') {
        winAmount = gameState.currentBet;
        gameState.balance += winAmount;
        gameState.gamesWon++;
        resultColor = 'border-green-500 bg-green-50';
    } else if (result === 'lose') {
        winAmount = -gameState.currentBet;
        gameState.balance -= gameState.currentBet;
        gameState.totalLost += gameState.currentBet;
        gameState.gamesLost++;
        resultColor = 'border-red-500 bg-red-50';
        
        // Show motivational message if lost significant amount
        if (gameState.totalLost >= gameState.balance * 0.3) {
            showMotivationalMessage();
        }
    } else {
        resultColor = 'border-yellow-500 bg-yellow-50';
    }
    
    // Display result
    const resultBox = document.getElementById('resultBox');
    const resultText = document.getElementById('resultText');
    const resultAmount = document.getElementById('resultAmount');
    
    resultBox.className = `p-6 rounded-lg border-4 ${resultColor}`;
    resultText.textContent = message;
    
    if (result === 'win') {
        resultAmount.textContent = `+${formatCurrency(winAmount)} nyeremény!`;
        resultAmount.className = 'text-lg text-green-600 font-bold';
    } else if (result === 'lose') {
        resultAmount.textContent = `${formatCurrency(winAmount)} veszteség`;
        resultAmount.className = 'text-lg text-red-600 font-bold';
    } else {
        resultAmount.textContent = 'Tét visszaadva';
        resultAmount.className = 'text-lg text-yellow-600 font-bold';
    }
    
    // Show result with animation
    const gameResult = document.getElementById('gameResult');
    gameResult.style.opacity = '1';
    gameResult.classList.add('fade-in');
    
    // Update displays
    updateDisplay();
    updateStatsDisplay();
    saveStats();
    
    // Check if player is out of money
    if (gameState.balance < 1000) {
        setTimeout(() => {
            showGameOverMessage();
        }, 2000);
    }
}

// Show motivational message
function showMotivationalMessage() {
    const motivationalMsg = document.getElementById('motivationalMsg');
    motivationalMsg.style.display = 'block';
    motivationalMsg.classList.add('fade-in', 'pulse-animation');
    
    setTimeout(() => {
        motivationalMsg.classList.remove('pulse-animation');
    }, 3000);
}

// Show game over message
function showGameOverMessage() {
    const gameResult = document.getElementById('gameResult');
    const resultBox = document.getElementById('resultBox');
    
    resultBox.className = 'p-6 rounded-lg border-4 border-red-500 bg-red-50 shake';
    resultBox.innerHTML = `
        <div class="text-2xl font-bold mb-2 text-red-800">🎰 Game Over!</div>
        <div class="text-lg text-red-700 mb-4">Elfogyott a pénze!</div>
        <div class="text-sm text-red-600 mb-4">
            Összes veszteség: ${formatCurrency(gameState.totalLost)}
        </div>
        <button onclick="restartWithNewSalary()" 
                class="mt-4 bg-blue-600 text-white py-3 px-8 font-semibold text-lg hover:bg-blue-700 transition-colors duration-200 uppercase tracking-wide">
            Új fizetés betöltése
        </button>
    `;
}

// Restart with new salary
function restartWithNewSalary() {
    window.location.href = '../index.html';
}

// Start new game
function newGame() {
    // Reset game state
    gameState.currentBet = 0;
    gameState.gameInProgress = false;
    
    // Hide game area and show betting section
    document.getElementById('gameArea').style.display = 'none';
    document.getElementById('bettingSection').style.display = 'block';
    document.getElementById('gameResult').style.opacity = '0';
    document.getElementById('startGameBtn').disabled = true;
    
    // Hide motivational message
    document.getElementById('motivationalMsg').style.display = 'none';
    
    // Clear cards
    document.getElementById('playerCards').innerHTML = '';
    document.getElementById('dealerCards').innerHTML = '';
    
    updateDisplay();
}

// Display cards
function displayCards() {
    const playerCardsDiv = document.getElementById('playerCards');
    const dealerCardsDiv = document.getElementById('dealerCards');
    
    // Clear existing cards
    playerCardsDiv.innerHTML = '';
    dealerCardsDiv.innerHTML = '';
    
    // Display player cards
    gameState.playerCards.forEach(card => {
        const cardElement = createCardElement(card);
        cardElement.classList.add('fade-in');
        playerCardsDiv.appendChild(cardElement);
    });
    
    // Display dealer cards
    gameState.dealerCards.forEach((card, index) => {
        // Only hide the second card if game is still in progress
        const isHidden = index === 1 && gameState.gameInProgress;
        const cardElement = createCardElement(card, isHidden);
        cardElement.classList.add('fade-in');
        dealerCardsDiv.appendChild(cardElement);
    });
}

// Update scores
function updateScores() {
    document.getElementById('playerScore').textContent = gameState.playerScore;
    
    if (gameState.gameInProgress) {
        document.getElementById('dealerScore').textContent = calculateScore([gameState.dealerCards[0]]);
    } else {
        document.getElementById('dealerScore').textContent = gameState.dealerScore;
    }
}

// Enable game controls
function enableGameControls() {
    document.getElementById('hitBtn').disabled = false;
    document.getElementById('standBtn').disabled = false;
}

// Disable game controls
function disableGameControls() {
    document.getElementById('hitBtn').disabled = true;
    document.getElementById('standBtn').disabled = true;
}

// Update display
function updateDisplay() {
    document.getElementById('currentBalance').textContent = formatCurrency(gameState.balance);
    document.getElementById('currentBet').textContent = formatCurrency(gameState.currentBet);
    document.getElementById('totalLost').textContent = formatCurrency(gameState.totalLost);
}

// Update stats display
function updateStatsDisplay() {
    document.getElementById('gamesPlayed').textContent = gameState.gamesPlayed;
    document.getElementById('gamesWon').textContent = gameState.gamesWon;
    document.getElementById('gamesLost').textContent = gameState.gamesLost;
    
    const winRate = gameState.gamesPlayed > 0 ? 
        ((gameState.gamesWon / gameState.gamesPlayed) * 100).toFixed(1) : 0;
    document.getElementById('winRate').textContent = winRate + '%';
}

// Format currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('hu-HU', {
        style: 'currency',
        currency: 'HUF',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
}

// Save stats to localStorage
function saveStats() {
    const stats = {
        gamesPlayed: gameState.gamesPlayed,
        gamesWon: gameState.gamesWon,
        gamesLost: gameState.gamesLost,
        totalLost: gameState.totalLost
    };
    localStorage.setItem('blackjackStats', JSON.stringify(stats));
}

// Load stats from localStorage
function loadStats() {
    const savedStats = localStorage.getItem('blackjackStats');
    if (savedStats) {
        const stats = JSON.parse(savedStats);
        gameState.gamesPlayed = stats.gamesPlayed || 0;
        gameState.gamesWon = stats.gamesWon || 0;
        gameState.gamesLost = stats.gamesLost || 0;
        gameState.totalLost = stats.totalLost || 0;
    }
}

// Reset statistics
function resetStats() {
    if (confirm('Biztosan törli a statisztikákat?')) {
        gameState.gamesPlayed = 0;
        gameState.gamesWon = 0;
        gameState.gamesLost = 0;
        gameState.totalLost = 0;
        
        updateStatsDisplay();
        saveStats();
        
        alert('Statisztikák törölve!');
    }
}

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', function() {
    initGame();
    
    // Add keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        if (gameState.gameInProgress) {
            if (e.key === 'h' || e.key === 'H') {
                hit();
            } else if (e.key === 's' || e.key === 'S') {
                stand();
            }
        }
    });
    
    // Add visual feedback for betting buttons
    document.querySelectorAll('.bet-button').forEach(button => {
        button.addEventListener('mouseenter', function() {
            if (!this.classList.contains('bg-green-200')) {
                this.classList.add('transform', 'scale-105');
            }
        });
        
        button.addEventListener('mouseleave', function() {
            this.classList.remove('transform', 'scale-105');
        });
    });
});

// Add function to save net salary to localStorage (to be called from main calculator)
function saveNetSalary(netSalary) {
    localStorage.setItem('netSalary', netSalary);
}

// Export function for use in main calculator
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { saveNetSalary };
}
