# Project Structure

## File Layout
```
KiroExpress/
├── index.html          # Entry point — canvas + script link
├── style.css           # Page layout, canvas centering
├── game.js             # All game logic
├── game-config.json    # Physics/color parameters reference
├── assets/
│   ├── ghosty.png      # Player sprite
│   ├── jump.wav        # Jump sound
│   └── game_over.wav   # Game over sound
├── img/
│   └── example-ui.png  # UI reference screenshot
└── .kiro/
    ├── specs/flappy-kiro-game/
    │   ├── requirements.md
    │   ├── design.md
    │   └── tasks.md
    └── steering/
        ├── product.md
        ├── tech.md
        ├── structure.md
        ├── game-mechanics.md
        ├── visual-design.md
        └── flappy-kiro-domain.md
```

## Principles
- Single-file game logic — everything in `game.js`
- No external dependencies or npm packages
- Open `index.html` directly in browser to play — no server required
- All asset paths are relative (e.g. `assets/ghosty.png`)
