// Agent Avenue Card Definitions
// Movement values: [1 copy, 2 copies, 3+ copies]

const CARD_TYPES = {
    CODEBREAKER: {
        name: 'Codebreaker',
        icon: '🔓',
        movement: [1, 2, 3],
        count: 6,
        cssClass: 'codebreaker',
        description: 'Collect 3 to win!'
    },
    DAREDEVIL: {
        name: 'Daredevil',
        icon: '💀',
        movement: [3, 4, 5],
        count: 6,
        cssClass: 'daredevil',
        description: 'Collect 3 and you lose!'
    },
    SENTINEL: {
        name: 'Sentinel',
        icon: '🛡️',
        movement: [0, 1, 2],
        count: 6,
        cssClass: 'sentinel',
        description: 'Defensive positioning'
    },
    COURIER: {
        name: 'Courier',
        icon: '📨',
        movement: [2, 3, 4],
        count: 6,
        cssClass: 'courier',
        description: 'Fast movement'
    },
    SABOTEUR: {
        name: 'Saboteur',
        icon: '💣',
        movement: [1, -1, -2],
        count: 6,
        cssClass: 'saboteur',
        description: 'Can move backwards!'
    },
    DOUBLE_AGENT: {
        name: 'Double Agent',
        icon: '🎭',
        movement: [2, 2, 2],
        count: 8,
        cssClass: 'double-agent',
        description: 'Consistent movement'
    }
};

// Create a full deck
function createDeck() {
    const deck = [];
    let cardId = 0;
    
    for (const [type, config] of Object.entries(CARD_TYPES)) {
        for (let i = 0; i < config.count; i++) {
            deck.push({
                id: cardId++,
                type: type,
                name: config.name,
                icon: config.icon,
                movement: [...config.movement],
                cssClass: config.cssClass,
                description: config.description
            });
        }
    }
    
    return deck;
}

// Shuffle array using Fisher-Yates
function shuffleDeck(deck) {
    const shuffled = [...deck];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

// Create card HTML element
function createCardElement(card, options = {}) {
    const { mini = false, faceDown = false, clickable = false } = options;
    
    const cardEl = document.createElement('div');
    cardEl.className = `card ${card.cssClass}`;
    if (mini) cardEl.classList.add('mini-card');
    if (faceDown) cardEl.classList.add('card-back');
    if (clickable) cardEl.classList.add('clickable');
    cardEl.dataset.cardId = card.id;
    cardEl.dataset.cardType = card.type;
    
    if (!faceDown) {
        cardEl.innerHTML = `
            <div class="card-name">${card.name}</div>
            <div class="card-icon">${card.icon}</div>
            <div class="card-movement">
                <span>${card.movement[0]}</span>
                <span>${card.movement[1]}</span>
                <span>${card.movement[2]}</span>
            </div>
        `;
    }
    
    return cardEl;
}

// Get movement value based on collection count
function getMovementValue(card, collectionCount) {
    const index = Math.min(collectionCount, 3) - 1;
    return index >= 0 ? card.movement[index] : card.movement[0];
}

// Count cards of a type in collection
function countCardType(collection, cardType) {
    return collection.filter(c => c.type === cardType).length;
}
