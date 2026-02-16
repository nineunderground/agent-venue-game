# Agent Avenue - Digital Edition

A browser-based implementation of the Agent Avenue card game by Nerdlab Games, featuring human vs AI gameplay.

## About the Game

Agent Avenue is a 2-player bluffing and set-collection card game where spies race to catch each other by recruiting agents that move meeples around a board.

### Core Mechanics
- **"I Split, You Choose"**: On your turn, play 2 cards (one face-up, one face-down). Your opponent picks one to keep, you get the other.
- **Set Collection**: Agent cards provide movement icons based on how many copies you've collected (1st icon for 1 copy, 2nd for 2, 3rd for 3+).
- **Victory Conditions**: 
  - Catch your opponent's meeple
  - Collect 3 Codebreaker cards
  - Special card conditions
- **Loss Condition**: Collect 3 Daredevil cards

## How to Play

1. Open `index.html` in your browser
2. You play as the blue spy, AI plays as the red spy
3. On your turn:
   - Select 2 cards from your hand to play
   - Choose which one to play face-up
   - AI will pick one card, you get the other
   - Meeples move based on the recruited card's movement icons

## Installation

No installation needed! Just open `index.html` in any modern web browser.

```bash
# Or serve locally
python -m http.server 8000
# Then open http://localhost:8000
```

## Credits

- Original game design: **Nerdlab Games** - [nerdlab-games.com](https://nerdlab-games.com)
- Digital implementation: Created for personal/educational use

## License

This is a fan-made digital implementation. The original Agent Avenue card game is © Nerdlab Games. Please support the original creators by purchasing the physical game!
