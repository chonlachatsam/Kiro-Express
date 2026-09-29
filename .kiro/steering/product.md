# Product: Flappy Kiro

A Flappy Bird-inspired browser game featuring Ghosty, the Kiro mascot. Built as an introduction starter kit for the Kiro IDE.

## Core Gameplay
- Player controls Ghosty through an endless stream of pipes
- Space / Click / Tap triggers a jump
- Each pipe cleared earns one point
- Game ends on any collision (pipe, ceiling, or ground)
- High score persisted in localStorage under key `flappyKiroHighScore`

## Game States
| State | Description |
|-------|-------------|
| `START` | Title screen shown on first load |
| `PLAYING` | Active gameplay loop |
| `OVER` | Game-over screen; any input restarts |

## Assets
- `assets/ghosty.png` — player sprite
- `assets/jump.wav` — jump sound effect
- `assets/game_over.wav` — game over sound effect
