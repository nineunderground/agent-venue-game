// AI Logic for Agent Avenue

class AIPlayer {
    constructor(game) {
        this.game = game;
    }

    // AI chooses which card to take from the two played cards
    chooseCard(faceUpCard, faceDownCard) {
        const aiCollection = this.game.aiRecruited;
        const playerCollection = this.game.playerRecruited;
        
        // Evaluate both cards
        const faceUpScore = this.evaluateCard(faceUpCard, aiCollection, playerCollection);
        const faceDownScore = this.evaluateCard(faceDownCard, aiCollection, playerCollection);
        
        // Add some randomness for unpredictability
        const randomFactor = (Math.random() - 0.5) * 2;
        
        // Choose the card with higher score (with slight randomness)
        if (faceUpScore + randomFactor > faceDownScore) {
            return { chosen: faceUpCard, remaining: faceDownCard };
        } else {
            return { chosen: faceDownCard, remaining: faceUpCard };
        }
    }

    // Evaluate how good a card is for the AI to take
    evaluateCard(card, aiCollection, playerCollection) {
        let score = 0;
        
        const aiCount = countCardType(aiCollection, card.type);
        const playerCount = countCardType(playerCollection, card.type);
        
        // Codebreaker evaluation
        if (card.type === 'CODEBREAKER') {
            // Very valuable if we have 2 already (winning move)
            if (aiCount === 2) score += 100;
            // Good to deny player if they have 2
            else if (playerCount === 2) score += 80;
            // Generally good to collect
            else score += 20 + aiCount * 10;
        }
        
        // Daredevil evaluation - usually want to avoid
        else if (card.type === 'DAREDEVIL') {
            // Terrible if we have 2 already (losing move)
            if (aiCount === 2) score -= 100;
            // Bad to take
            else score -= 15 - aiCount * 5;
            // But good to give to player if they have 2
            if (playerCount === 2) score -= 50; // Don't take it, let player have it
        }
        
        // Movement evaluation based on catching opponent
        else {
            const movement = getMovementValue(card, aiCount + 1);
            const distanceToPlayer = this.game.getDistanceToOpponent('ai');
            
            // Good if movement helps catch player
            if (movement > 0 && movement <= distanceToPlayer + 3) {
                score += 15 + (distanceToPlayer - Math.abs(distanceToPlayer - movement)) * 2;
            }
            
            // Saboteur can be tricky
            if (card.type === 'SABOTEUR' && movement < 0) {
                score -= 10; // Backward movement usually bad
            }
            
            // Sentinel for defense when player is close
            if (card.type === 'SENTINEL') {
                const playerDistToAi = this.game.getDistanceToOpponent('player');
                if (playerDistToAi <= 5) {
                    score += 10; // Defensive value
                }
            }
            
            // Courier for fast movement
            if (card.type === 'COURIER') {
                score += 5;
            }
        }
        
        return score;
    }

    // AI plays its turn - selects 2 cards and decides face up/down
    playTurn() {
        const hand = this.game.aiHand;
        
        if (hand.length < 2) {
            return null;
        }
        
        // Get unique card types in hand
        const cardsByType = {};
        hand.forEach(card => {
            if (!cardsByType[card.type]) {
                cardsByType[card.type] = [];
            }
            cardsByType[card.type].push(card);
        });
        
        const uniqueTypes = Object.keys(cardsByType);
        
        // Need at least 2 different card types
        if (uniqueTypes.length < 2) {
            // If all same type, can't play (shouldn't happen with proper deck)
            return null;
        }
        
        // Select 2 cards of different types
        let selectedCards = [];
        
        // Strategy: pick cards based on what we want to offer/hide
        const rankedTypes = uniqueTypes.sort((a, b) => {
            return this.getTypeDesirability(b) - this.getTypeDesirability(a);
        });
        
        // Pick from top 2 different types
        selectedCards.push(cardsByType[rankedTypes[0]][0]);
        selectedCards.push(cardsByType[rankedTypes[1]][0]);
        
        // Decide which to show face up (show the one we DON'T want player to take)
        const card1Desirability = this.evaluateCardForPlayer(selectedCards[0]);
        const card2Desirability = this.evaluateCardForPlayer(selectedCards[1]);
        
        let faceUpCard, faceDownCard;
        
        // Show the less desirable card face-up to tempt player
        // But add bluffing - sometimes show the good card
        const bluffChance = Math.random();
        
        if (bluffChance < 0.3) {
            // Bluff - show the better card
            if (card1Desirability > card2Desirability) {
                faceUpCard = selectedCards[0];
                faceDownCard = selectedCards[1];
            } else {
                faceUpCard = selectedCards[1];
                faceDownCard = selectedCards[0];
            }
        } else {
            // Normal - hide the better card
            if (card1Desirability > card2Desirability) {
                faceUpCard = selectedCards[1];
                faceDownCard = selectedCards[0];
            } else {
                faceUpCard = selectedCards[0];
                faceDownCard = selectedCards[1];
            }
        }
        
        return { faceUpCard, faceDownCard };
    }

    // How desirable is this card type for AI generally
    getTypeDesirability(type) {
        const aiCount = countCardType(this.game.aiRecruited, type);
        
        switch (type) {
            case 'CODEBREAKER':
                return 30 + aiCount * 20;
            case 'DAREDEVIL':
                return -20 - aiCount * 30;
            case 'COURIER':
                return 15;
            case 'DOUBLE_AGENT':
                return 10;
            case 'SABOTEUR':
                return 5;
            case 'SENTINEL':
                return 8;
            default:
                return 0;
        }
    }

    // How desirable would this card be for the player
    evaluateCardForPlayer(card) {
        const playerCollection = this.game.playerRecruited;
        const playerCount = countCardType(playerCollection, card.type);
        
        if (card.type === 'CODEBREAKER') {
            return 30 + playerCount * 25;
        }
        if (card.type === 'DAREDEVIL') {
            return -30 - playerCount * 25;
        }
        
        // Movement value for chasing AI
        const movement = getMovementValue(card, playerCount + 1);
        return 10 + movement * 2;
    }
}
