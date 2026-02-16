// Agent Avenue - Main Game Logic

class AgentAvenueGame {
    constructor() {
        this.BOARD_SIZE = 15;
        this.PLAYER_START = 0;
        this.AI_START = 14;
        
        this.deck = [];
        this.playerHand = [];
        this.aiHand = [];
        this.playerRecruited = [];
        this.aiRecruited = [];
        this.playerPosition = this.PLAYER_START;
        this.aiPosition = this.AI_START;
        this.playerDiscardsLeft = 4;
        this.aiDiscardsLeft = 4;
        this.isPlayerTurn = true;
        this.selectedCards = [];
        this.faceUpCard = null;
        this.faceDownCard = null;
        this.gameOver = false;
        
        this.ai = new AIPlayer(this);
        
        this.initBoard();
        this.initGame();
        this.bindEvents();
    }

    initBoard() {
        const board = document.getElementById('board');
        board.innerHTML = '';
        
        for (let i = 0; i < this.BOARD_SIZE; i++) {
            const space = document.createElement('div');
            space.className = 'board-space';
            space.dataset.position = i;
            
            if (i === this.PLAYER_START) {
                space.classList.add('home-blue');
                space.textContent = '🏠';
            } else if (i === this.AI_START) {
                space.classList.add('home-red');
                space.textContent = '🏠';
            } else {
                space.textContent = i;
            }
            
            board.appendChild(space);
        }
        
        this.updateMeeplePositions();
    }

    initGame() {
        // Create and shuffle deck
        this.deck = shuffleDeck(createDeck());
        
        // Deal 4 cards to each player
        for (let i = 0; i < 4; i++) {
            this.playerHand.push(this.deck.pop());
            this.aiHand.push(this.deck.pop());
        }
        
        this.renderPlayerHand();
        this.renderAIHand();
        this.updateStatus();
        this.setMessage('Your turn! Select 2 cards with different names to play.');
    }

    bindEvents() {
        document.getElementById('confirm-play-btn').addEventListener('click', () => this.confirmPlay());
        document.getElementById('clear-play-btn').addEventListener('click', () => this.clearSelection());
        document.getElementById('restart-btn').addEventListener('click', () => this.restart());
    }

    renderPlayerHand() {
        const handEl = document.getElementById('player-hand');
        handEl.innerHTML = '';
        
        this.playerHand.forEach(card => {
            const cardEl = createCardElement(card);
            cardEl.addEventListener('click', () => this.selectCard(card));
            handEl.appendChild(cardEl);
        });
        
        this.updateCardSelectionState();
    }

    renderAIHand() {
        const handEl = document.getElementById('ai-hand');
        handEl.innerHTML = '';
        
        // Show card backs for AI hand
        for (let i = 0; i < this.aiHand.length; i++) {
            const cardEl = document.createElement('div');
            cardEl.className = 'card card-back';
            handEl.appendChild(cardEl);
        }
    }

    renderRecruited(collection, elementId) {
        const container = document.getElementById(elementId);
        container.innerHTML = '';
        
        collection.forEach(card => {
            const cardEl = createCardElement(card, { mini: true });
            container.appendChild(cardEl);
        });
    }

    selectCard(card) {
        if (!this.isPlayerTurn || this.gameOver) return;
        
        const index = this.selectedCards.findIndex(c => c.id === card.id);
        
        if (index >= 0) {
            // Deselect
            this.selectedCards.splice(index, 1);
        } else {
            // Check if we can select this card
            if (this.selectedCards.length >= 2) {
                this.setMessage('You can only select 2 cards. Click a selected card to deselect.');
                return;
            }
            
            // Check for different card names
            if (this.selectedCards.length === 1 && this.selectedCards[0].type === card.type) {
                this.setMessage('You must select 2 cards with different names!');
                return;
            }
            
            this.selectedCards.push(card);
        }
        
        this.updateCardSelectionState();
        this.updatePlayButtons();
    }

    updateCardSelectionState() {
        const handEl = document.getElementById('player-hand');
        const cards = handEl.querySelectorAll('.card');
        
        cards.forEach(cardEl => {
            const cardId = parseInt(cardEl.dataset.cardId);
            const isSelected = this.selectedCards.some(c => c.id === cardId);
            
            cardEl.classList.toggle('selected', isSelected);
            
            // Disable cards of same type if one is selected
            if (this.selectedCards.length === 1 && !isSelected) {
                const cardType = cardEl.dataset.cardType;
                const isDisabled = this.selectedCards[0].type === cardType;
                cardEl.classList.toggle('disabled', isDisabled);
            } else {
                cardEl.classList.remove('disabled');
            }
        });
    }

    updatePlayButtons() {
        const confirmBtn = document.getElementById('confirm-play-btn');
        const clearBtn = document.getElementById('clear-play-btn');
        
        confirmBtn.disabled = this.selectedCards.length !== 2;
        clearBtn.disabled = this.selectedCards.length === 0;
    }

    confirmPlay() {
        if (this.selectedCards.length !== 2) return;
        
        // Show choice modal for face up card
        this.showFaceUpChoice();
    }

    showFaceUpChoice() {
        const modal = document.getElementById('choice-modal');
        const title = document.getElementById('choice-title');
        const description = document.getElementById('choice-description');
        const cardsContainer = document.getElementById('choice-cards');
        
        title.textContent = 'Choose Face-Up Card';
        description.textContent = 'Which card do you want to play face-up? (The other will be face-down)';
        cardsContainer.innerHTML = '';
        
        this.selectedCards.forEach(card => {
            const cardEl = createCardElement(card, { clickable: true });
            cardEl.addEventListener('click', () => this.selectFaceUpCard(card));
            cardsContainer.appendChild(cardEl);
        });
        
        modal.classList.remove('hidden');
    }

    selectFaceUpCard(card) {
        const otherCard = this.selectedCards.find(c => c.id !== card.id);
        
        this.faceUpCard = card;
        this.faceDownCard = otherCard;
        
        document.getElementById('choice-modal').classList.add('hidden');
        
        // Remove cards from hand
        this.playerHand = this.playerHand.filter(c => 
            c.id !== this.faceUpCard.id && c.id !== this.faceDownCard.id
        );
        
        // Draw new cards
        this.drawCards('player', 2);
        
        // Show played cards
        this.showPlayedCards();
        
        // AI chooses
        setTimeout(() => this.aiChooseCard(), 1000);
    }

    showPlayedCards() {
        const faceUpSlot = document.querySelector('#face-up-slot .slot-card');
        const faceDownSlot = document.querySelector('#face-down-slot .slot-card');
        
        faceUpSlot.innerHTML = '';
        faceDownSlot.innerHTML = '';
        
        faceUpSlot.appendChild(createCardElement(this.faceUpCard));
        
        const faceDownEl = createCardElement(this.faceDownCard, { faceDown: true });
        faceDownSlot.appendChild(faceDownEl);
        
        this.setMessage('AI is choosing a card...');
    }

    aiChooseCard() {
        const result = this.ai.chooseCard(this.faceUpCard, this.faceDownCard);
        const aiChoice = result.chosen;
        const playerGets = result.remaining;
        
        // Reveal face down card
        const faceDownSlot = document.querySelector('#face-down-slot .slot-card');
        faceDownSlot.innerHTML = '';
        faceDownSlot.appendChild(createCardElement(this.faceDownCard));
        
        // Show which card AI chose
        const chosenName = aiChoice.name;
        this.setMessage(`AI chose: ${chosenName}. You get: ${playerGets.name}`);
        
        // Add cards to collections
        this.aiRecruited.push(aiChoice);
        this.playerRecruited.push(playerGets);
        
        this.renderRecruited(this.aiRecruited, 'ai-recruited');
        this.renderRecruited(this.playerRecruited, 'player-recruited');
        
        // Move meeples
        setTimeout(() => {
            this.moveMeeples(aiChoice, playerGets);
        }, 1500);
    }

    moveMeeples(aiCard, playerCard) {
        // Calculate movements
        const aiCount = countCardType(this.aiRecruited, aiCard.type);
        const playerCount = countCardType(this.playerRecruited, playerCard.type);
        
        const aiMovement = getMovementValue(aiCard, aiCount);
        const playerMovement = getMovementValue(playerCard, playerCount);
        
        // Move AI (towards player, so subtract)
        const newAiPos = Math.max(0, Math.min(this.BOARD_SIZE - 1, this.aiPosition - aiMovement));
        
        // Move player (towards AI, so add)
        const newPlayerPos = Math.max(0, Math.min(this.BOARD_SIZE - 1, this.playerPosition + playerMovement));
        
        this.setMessage(`AI moves ${aiMovement} (${aiCard.name}). You move ${playerMovement} (${playerCard.name}).`);
        
        this.aiPosition = newAiPos;
        this.playerPosition = newPlayerPos;
        
        this.updateMeeplePositions();
        
        // Check win conditions
        setTimeout(() => {
            if (!this.checkWinConditions()) {
                this.clearPlayArea();
                this.startAITurn();
            }
        }, 1000);
    }

    updateMeeplePositions() {
        const board = document.getElementById('board');
        const playerMeeple = document.getElementById('player-meeple');
        const aiMeeple = document.getElementById('ai-meeple');
        
        const spaces = board.querySelectorAll('.board-space');
        
        const playerSpace = spaces[this.playerPosition];
        const aiSpace = spaces[this.aiPosition];
        
        const playerRect = playerSpace.getBoundingClientRect();
        const aiRect = aiSpace.getBoundingClientRect();
        const boardRect = board.getBoundingClientRect();
        
        playerMeeple.style.left = (playerRect.left - boardRect.left + playerRect.width/2 - 15) + 'px';
        playerMeeple.style.top = (playerRect.top - boardRect.top - 45) + 'px';
        
        aiMeeple.style.left = (aiRect.left - boardRect.left + aiRect.width/2 - 15) + 'px';
        aiMeeple.style.top = (aiRect.top - boardRect.top + aiRect.height + 5) + 'px';
    }

    checkWinConditions() {
        // Check if player caught AI
        if (this.playerPosition >= this.aiPosition) {
            this.endGame('You caught the enemy spy! You WIN! 🎉');
            return true;
        }
        
        // Check if AI caught player
        if (this.aiPosition <= this.playerPosition) {
            this.endGame('The enemy spy caught you! You LOSE! 😢');
            return true;
        }
        
        // Check Codebreakers
        const playerCodebreakers = countCardType(this.playerRecruited, 'CODEBREAKER');
        const aiCodebreakers = countCardType(this.aiRecruited, 'CODEBREAKER');
        
        if (playerCodebreakers >= 3) {
            this.endGame('You collected 3 Codebreakers! You WIN! 🎉');
            return true;
        }
        
        if (aiCodebreakers >= 3) {
            this.endGame('AI collected 3 Codebreakers! You LOSE! 😢');
            return true;
        }
        
        // Check Daredevils
        const playerDaredevils = countCardType(this.playerRecruited, 'DAREDEVIL');
        const aiDaredevils = countCardType(this.aiRecruited, 'DAREDEVIL');
        
        if (playerDaredevils >= 3) {
            this.endGame('You collected 3 Daredevils! You LOSE! 😢');
            return true;
        }
        
        if (aiDaredevils >= 3) {
            this.endGame('AI collected 3 Daredevils! You WIN! 🎉');
            return true;
        }
        
        // Check deck empty
        if (this.deck.length === 0 && (this.playerHand.length < 2 || this.aiHand.length < 2)) {
            // Determine winner by distance
            const playerDist = this.aiPosition - this.playerPosition;
            if (playerDist <= 0) {
                this.endGame('Deck empty - You are closer! You WIN! 🎉');
            } else {
                this.endGame('Deck empty - AI is closer! You LOSE! 😢');
            }
            return true;
        }
        
        return false;
    }

    startAITurn() {
        this.isPlayerTurn = false;
        this.selectedCards = [];
        
        document.getElementById('turn-indicator').textContent = "AI's Turn";
        document.getElementById('turn-indicator').classList.add('ai-turn');
        
        this.setMessage("AI is playing...");
        this.renderPlayerHand();
        
        setTimeout(() => this.aiPlayTurn(), 1500);
    }

    aiPlayTurn() {
        const play = this.ai.playTurn();
        
        if (!play) {
            this.setMessage("AI can't play - game ending");
            this.checkWinConditions();
            return;
        }
        
        this.faceUpCard = play.faceUpCard;
        this.faceDownCard = play.faceDownCard;
        
        // Remove cards from AI hand
        this.aiHand = this.aiHand.filter(c => 
            c.id !== this.faceUpCard.id && c.id !== this.faceDownCard.id
        );
        
        // Draw new cards for AI
        this.drawCards('ai', 2);
        this.renderAIHand();
        
        // Show played cards
        this.showPlayedCards();
        
        this.setMessage(`AI played: ${this.faceUpCard.name} (face-up) and one hidden card. Choose one to take!`);
        
        // Let player choose
        setTimeout(() => this.playerChooseCard(), 1000);
    }

    playerChooseCard() {
        const modal = document.getElementById('choice-modal');
        const title = document.getElementById('choice-title');
        const description = document.getElementById('choice-description');
        const cardsContainer = document.getElementById('choice-cards');
        
        title.textContent = 'Choose Your Card';
        description.textContent = 'Pick one card to add to your collection:';
        cardsContainer.innerHTML = '';
        
        // Face up card
        const faceUpEl = createCardElement(this.faceUpCard, { clickable: true });
        faceUpEl.addEventListener('click', () => this.selectRecruitCard(this.faceUpCard));
        cardsContainer.appendChild(faceUpEl);
        
        // Face down card (show it now)
        const faceDownEl = createCardElement(this.faceDownCard, { clickable: true });
        faceDownEl.addEventListener('click', () => this.selectRecruitCard(this.faceDownCard));
        cardsContainer.appendChild(faceDownEl);
        
        // Also reveal on board
        const faceDownSlot = document.querySelector('#face-down-slot .slot-card');
        faceDownSlot.innerHTML = '';
        faceDownSlot.appendChild(createCardElement(this.faceDownCard));
        
        modal.classList.remove('hidden');
    }

    selectRecruitCard(playerChoice) {
        const aiGets = playerChoice.id === this.faceUpCard.id ? this.faceDownCard : this.faceUpCard;
        
        document.getElementById('choice-modal').classList.add('hidden');
        
        this.setMessage(`You took: ${playerChoice.name}. AI gets: ${aiGets.name}`);
        
        // Add to collections
        this.playerRecruited.push(playerChoice);
        this.aiRecruited.push(aiGets);
        
        this.renderRecruited(this.aiRecruited, 'ai-recruited');
        this.renderRecruited(this.playerRecruited, 'player-recruited');
        
        // Move meeples (player first since it's AI's turn)
        setTimeout(() => {
            this.moveMeeplesAITurn(playerChoice, aiGets);
        }, 1000);
    }

    moveMeeplesAITurn(playerCard, aiCard) {
        const aiCount = countCardType(this.aiRecruited, aiCard.type);
        const playerCount = countCardType(this.playerRecruited, playerCard.type);
        
        const aiMovement = getMovementValue(aiCard, aiCount);
        const playerMovement = getMovementValue(playerCard, playerCount);
        
        const newAiPos = Math.max(0, Math.min(this.BOARD_SIZE - 1, this.aiPosition - aiMovement));
        const newPlayerPos = Math.max(0, Math.min(this.BOARD_SIZE - 1, this.playerPosition + playerMovement));
        
        this.setMessage(`You move ${playerMovement} (${playerCard.name}). AI moves ${aiMovement} (${aiCard.name}).`);
        
        this.aiPosition = newAiPos;
        this.playerPosition = newPlayerPos;
        
        this.updateMeeplePositions();
        
        setTimeout(() => {
            if (!this.checkWinConditions()) {
                this.clearPlayArea();
                this.startPlayerTurn();
            }
        }, 1000);
    }

    startPlayerTurn() {
        this.isPlayerTurn = true;
        this.selectedCards = [];
        
        document.getElementById('turn-indicator').textContent = "Your Turn";
        document.getElementById('turn-indicator').classList.remove('ai-turn');
        
        this.setMessage('Your turn! Select 2 cards with different names to play.');
        this.renderPlayerHand();
        this.updatePlayButtons();
    }

    clearPlayArea() {
        const faceUpSlot = document.querySelector('#face-up-slot .slot-card');
        const faceDownSlot = document.querySelector('#face-down-slot .slot-card');
        
        faceUpSlot.innerHTML = '';
        faceDownSlot.innerHTML = '';
        
        this.faceUpCard = null;
        this.faceDownCard = null;
    }

    clearSelection() {
        this.selectedCards = [];
        this.updateCardSelectionState();
        this.updatePlayButtons();
    }

    drawCards(player, count) {
        const hand = player === 'player' ? this.playerHand : this.aiHand;
        
        for (let i = 0; i < count && this.deck.length > 0; i++) {
            hand.push(this.deck.pop());
        }
        
        this.updateStatus();
    }

    getDistanceToOpponent(from) {
        if (from === 'player') {
            return this.aiPosition - this.playerPosition;
        } else {
            return this.aiPosition - this.playerPosition;
        }
    }

    setMessage(msg) {
        document.getElementById('game-message').textContent = msg;
    }

    updateStatus() {
        document.getElementById('deck-count').textContent = this.deck.length;
        document.getElementById('discard-count').textContent = this.playerDiscardsLeft;
    }

    endGame(message) {
        this.gameOver = true;
        
        const modal = document.getElementById('gameover-modal');
        const title = document.getElementById('gameover-title');
        const msg = document.getElementById('gameover-message');
        
        title.textContent = message.includes('WIN') ? '🎉 Victory!' : '😢 Defeat';
        msg.textContent = message;
        
        modal.classList.remove('hidden');
    }

    restart() {
        // Reset all state
        this.deck = [];
        this.playerHand = [];
        this.aiHand = [];
        this.playerRecruited = [];
        this.aiRecruited = [];
        this.playerPosition = this.PLAYER_START;
        this.aiPosition = this.AI_START;
        this.playerDiscardsLeft = 4;
        this.aiDiscardsLeft = 4;
        this.isPlayerTurn = true;
        this.selectedCards = [];
        this.faceUpCard = null;
        this.faceDownCard = null;
        this.gameOver = false;
        
        // Hide modal
        document.getElementById('gameover-modal').classList.add('hidden');
        
        // Clear UI
        this.clearPlayArea();
        document.getElementById('player-recruited').innerHTML = '';
        document.getElementById('ai-recruited').innerHTML = '';
        
        // Reset turn indicator
        document.getElementById('turn-indicator').textContent = "Your Turn";
        document.getElementById('turn-indicator').classList.remove('ai-turn');
        
        // Reinitialize
        this.initBoard();
        this.initGame();
    }
}

// Rules modal functions
function showRules() {
    document.getElementById('rules-modal').classList.remove('hidden');
}

function closeRules() {
    document.getElementById('rules-modal').classList.add('hidden');
}

// Click outside modal to close
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal') && !e.target.id.includes('choice') && !e.target.id.includes('gameover')) {
        e.target.classList.add('hidden');
    }
});

// Window resize handler for meeple positions
window.addEventListener('resize', () => {
    if (window.game) {
        window.game.updateMeeplePositions();
    }
});

// Initialize game
window.game = new AgentAvenueGame();
