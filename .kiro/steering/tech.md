# Tech Stack & Patterns

## Stack
- Vanilla HTML5 / CSS3 / JavaScript — no frameworks, no build step
- HTML5 Canvas API for all rendering
- Web Audio API (`HTMLAudioElement`) for sound
- `localStorage` for high score persistence
- `requestAnimationFrame` for the game loop

## Coding Patterns
- All tunable values live in a single `CONFIG` object at the top of `game.js`
- Never use magic numbers — always reference `CONFIG.*`
- Game state is managed by a `STATE` constant: `{ START, PLAYING, OVER }`
- Physics: apply gravity each frame, clamp with `Math.min(vy, CONFIG.maxFall)`
- Audio: always reset `currentTime = 0` before `.play()`, wrap in `.catch(() => {})`
- Collision: AABB overlap function — keep it pure and side-effect-free

## Naming Conventions
- Constants: `UPPER_SNAKE_CASE` (e.g. `GROUND_Y`)
- Config keys: `camelCase` inside `CONFIG` object
- Functions: `camelCase` verbs (e.g. `spawnPipe`, `drawHUD`, `triggerGameOver`)
- State values: `UPPER_SNAKE_CASE` strings (e.g. `STATE.PLAYING`)

## Performance
- Target 60 FPS via `requestAnimationFrame`
- Remove off-screen pipes immediately with `Array.filter`
- Avoid allocating objects inside the game loop — reuse where possible
