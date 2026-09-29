# Design Document — Flappy Kiro

## Overview

Flappy Kiro เป็นเกมบนเบราว์เซอร์ที่ใช้ HTML5 Canvas วาดเกม Vanilla JavaScript ควบคุม Game Loop และ Physics ทั้งหมด ไม่มี external dependencies ไม่ต้อง build — เปิด `index.html` แล้วเล่นได้เลย

ผู้เล่นควบคุม Ghosty (ผี) ให้บินผ่านท่อสีเขียวที่เลื่อนมาจากขวา กด Space / Click / Tap เพื่อกระโดด ชนท่อหรือพื้นแล้วจบเกม คะแนนสูงสุดเก็บไว้ใน `localStorage`

---

## Architecture

### Game States

```
START ──(space/click)──► PLAYING ──(collision)──► GAMEOVER
  ▲                                                    │
  └────────────────(space/click)──────────────────────┘
```

| State      | Description                                  |
|------------|----------------------------------------------|
| `START`    | แสดง title screen รอผู้เล่นเริ่ม            |
| `PLAYING`  | game loop ทำงาน, pipe เลื่อน, score เพิ่ม  |
| `GAMEOVER` | หยุด loop, แสดง score, รอ restart           |

### File Structure

```
kiro/
├── index.html        # entry point — canvas element + script tag
├── style.css         # centering canvas, page background
├── game.js           # game logic ทั้งหมด
└── assets/
    ├── ghosty.png    # Ghosty sprite
    ├── jump.wav      # jump sound effect
    └── game_over.wav # game over sound effect
```

### Constants

```js
const CANVAS_WIDTH   = 400;
const CANVAS_HEIGHT  = 600;
const GRAVITY        = 0.4;
const JUMP_FORCE     = -8;
const MAX_FALL_SPEED = 10;
const PIPE_SPEED     = 2.5;
const PIPE_WIDTH     = 60;
const PIPE_GAP       = 150;
const PIPE_INTERVAL  = 1800;   // ms between pipe spawns
const GHOSTY_SIZE    = 40;
const HITBOX_SHRINK  = 0.2;    // 20% shrink per side
```

### Game Loop (requestAnimationFrame)

```
gameLoop()
  ├── update()
  │     ├── ghosty.update()
  │     ├── pipes.forEach(p => p.update())
  │     ├── spawnPipeIfNeeded()
  │     ├── checkCollision()  → trigger GAMEOVER
  │     ├── checkScore()      → score++
  │     └── cleanupPipes()    → remove off-screen pipes
  └── render()
        ├── drawBackground()  #87CEEB sky blue
        ├── pipes.forEach(p => p.render())
        ├── ghosty.render()
        ├── drawGround()      #8B4513, height 40px
        └── drawHUD()         current score + high score
```

---

## Components and Interfaces

### Ghosty

Manages the player character's position, velocity, rendering, and hitbox.

```js
class Ghosty {
  constructor(x, y)

  // Apply gravity each frame, clamp to MAX_FALL_SPEED, advance y position
  update(): void

  // Set vy = JUMP_FORCE; play jump.wav
  jump(): void

  // Draw ghosty.png sprite at (x, y) with size GHOSTY_SIZE × GHOSTY_SIZE
  render(ctx: CanvasRenderingContext2D): void

  // Return AABB reduced by HITBOX_SHRINK (20%) on every side
  hitbox(): { x: number, y: number, w: number, h: number }
}
```

**State:**
| Field | Type   | Description                         |
|-------|--------|-------------------------------------|
| `x`   | number | Fixed horizontal position (90px)    |
| `y`   | number | Vertical position, changes each frame |
| `vy`  | number | Vertical velocity (pixels/frame)    |

---

### Pipe

Represents one pipe pair (top + bottom). Created with a random gap position.

```js
class Pipe {
  constructor(x: number, gapY: number)

  // Move left by PIPE_SPEED each frame
  update(): void

  // Draw top pipe (from y=0 down to gapY) and bottom pipe (from gapY+PIPE_GAP down)
  // Color: #4CAF50 fill, #388E3C border
  render(ctx: CanvasRenderingContext2D): void

  // True when pipe has scrolled entirely off the left edge
  isOffScreen(): boolean

  // AABB for the top pipe section
  hitboxTop(): { x, y, w, h }

  // AABB for the bottom pipe section
  hitboxBottom(): { x, y, w, h }
}
```

**State:**
| Field    | Type    | Description                                |
|----------|---------|--------------------------------------------|
| `x`      | number  | Left edge of the pipe pair                 |
| `gapY`   | number  | Y coordinate of the top of the gap         |
| `passed` | boolean | True after Ghosty has passed this pipe pair |

---

### AudioManager

Wraps HTMLAudioElement to handle autoplay policy gracefully.

```js
const AudioManager = {
  // Load audio files; call after first user interaction to unlock autoplay
  init(): void,

  // Play jump.wav; reset currentTime before playing
  playJump(): void,

  // Play game_over.wav; reset currentTime before playing
  playGameOver(): void,
}
```

---

### GameState Controller

Top-level functions in `game.js` that manage game flow.

| Function             | Description                                              |
|----------------------|----------------------------------------------------------|
| `initGame()`         | Reset Ghosty, Pipes, Score; set state to `START`         |
| `startGame()`        | Transition from `START` or `GAMEOVER` → `PLAYING`; call ghosty.jump() |
| `gameLoop(dt)`       | Main RAF loop: update + render when state is `PLAYING`   |
| `triggerGameOver()`  | Stop loop, play game_over.wav, update high score, set state to `GAMEOVER` |
| `resetGame()`        | Re-run `initGame()` then `startGame()`                   |

---

### Input Handler

Listens for player input and routes to the correct action.

```js
document.addEventListener('keydown', (e) => {
  if (e.code === 'Space' || e.code === 'ArrowUp') handleInput();
});
canvas.addEventListener('click', handleInput);
canvas.addEventListener('touchstart', handleInput);

function handleInput() {
  if (state === 'START' || state === 'GAMEOVER') startGame();
  else if (state === 'PLAYING') ghosty.jump();
}
```

---

## Data Models

### GhostyState

```ts
interface GhostyState {
  x: number;   // fixed at 90 — never changes during play
  y: number;   // current vertical position
  vy: number;  // vertical velocity (pixels per frame); negative = upward
}
```

### PipeState

```ts
interface PipeState {
  x: number;      // left edge position; decrements by PIPE_SPEED each frame
  gapY: number;   // top-of-gap Y; random in range [80, CANVAS_HEIGHT - PIPE_GAP - 80]
  passed: boolean; // set to true once ghosty.x > x + PIPE_WIDTH
}
```

### GameSession

```ts
interface GameSession {
  state: 'START' | 'PLAYING' | 'GAMEOVER';
  score: number;       // current round score; resets to 0 each restart
  highScore: number;   // best score across all sessions; persisted in localStorage
  pipes: PipeState[];  // active pipe pairs currently on canvas
  lastPipeTime: number; // timestamp of last pipe spawn (ms)
}
```

### localStorage Schema

| Key                   | Type   | Description                          |
|-----------------------|--------|--------------------------------------|
| `flappyKiroHighScore` | string | Serialized integer; parsed with `parseInt()` on load |

---

## Physics

Every frame while state is `PLAYING`:

```
vy += GRAVITY                       // accumulate gravity
vy  = Math.min(vy, MAX_FALL_SPEED)  // clamp terminal velocity
y  += vy                            // advance position
```

On jump:

```
vy = JUMP_FORCE  // override current velocity (including during fall)
```

---

## Collision Detection (AABB)

Axis-Aligned Bounding Box overlap test:

```js
function overlaps(a, b) {
  return a.x < b.x + b.w &&
         a.x + a.w > b.x &&
         a.y < b.y + b.h &&
         a.y + a.h > b.y;
}
```

Collision triggers `triggerGameOver()` when:
1. `overlaps(ghosty.hitbox(), pipe.hitboxTop())` for any pipe
2. `overlaps(ghosty.hitbox(), pipe.hitboxBottom())` for any pipe
3. `ghosty.y + GHOSTY_SIZE >= groundY` (ground collision)
4. `ghosty.y <= 0` (ceiling collision)

---

## Score System

- Score increments by 1 when `ghosty.x > pipe.x + PIPE_WIDTH && !pipe.passed`
- `pipe.passed` is set to `true` immediately to prevent double-counting
- High score updated: `highScore = Math.max(highScore, score)`
- Persisted: `localStorage.setItem('flappyKiroHighScore', highScore)`
- Loaded on init: `highScore = parseInt(localStorage.getItem('flappyKiroHighScore') || '0')`

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Gravity accumulates each frame

*For any* Ghosty with velocity `vy` below `MAX_FALL_SPEED`, after one call to `ghosty.update()`, the new velocity shall equal `vy + GRAVITY`.

**Validates: Requirements 2.4**

---

### Property 2: Terminal velocity is enforced

*For any* Ghosty velocity `vy` (no matter how large), after calling `ghosty.update()`, the resulting `vy` shall never exceed `MAX_FALL_SPEED`.

**Validates: Requirements 2.5**

---

### Property 3: Pipe scrolls at constant speed

*For any* Pipe at position `x`, after one call to `pipe.update()`, the new `x` shall equal `old_x - PIPE_SPEED`.

**Validates: Requirements 3.1**

---

### Property 4: Pipe gap invariant

*For any* generated Pipe, the vertical distance between the bottom of the top section and the top of the bottom section shall always be exactly `PIPE_GAP` (≥ 150px).

**Validates: Requirements 3.3**

---

### Property 5: Hitbox is contained within sprite

*For any* Ghosty position `(x, y)`, the computed `hitbox()` shall be fully contained within the sprite bounding box and have dimensions equal to `GHOSTY_SIZE * (1 - 2 * HITBOX_SHRINK)` on each axis.

**Validates: Requirements 4.5**

---

### Property 6: Score increments by exactly one per pipe

*For any* score value `s`, when Ghosty passes a pipe pair, the resulting score shall equal `s + 1` — never `s + 2` or more, and never `s` (no double-count).

**Validates: Requirements 5.1**

---

### Property 7: High score never falls below current score

*For any* game session, at every point during play `highScore >= score`. After game over, `highScore` shall be updated to `Math.max(highScore, score)`.

**Validates: Requirements 5.4**

---

### Property 8: High score localStorage round-trip

*For any* integer high score value `h`, after calling the save routine, reading `localStorage.getItem('flappyKiroHighScore')` and parsing it with `parseInt()` shall return `h`.

**Validates: Requirements 5.5, 5.6**

---

### Property 9: Off-screen pipes are removed

*For any* pipe array after `cleanupPipes()` is called, no element in the resulting array shall satisfy `pipe.x + PIPE_WIDTH < 0`.

**Validates: Requirements 3.4**

---

## Error Handling

| Scenario | Handling |
|---|---|
| `ghosty.png` fails to load | `Image.onerror` sets a fallback: draw a white rectangle in place of the sprite. Game continues. |
| `jump.wav` / `game_over.wav` fails to load | `audio.play()` is wrapped in `.catch(() => {})` — failure is silent, game continues without sound. |
| Autoplay policy blocks audio | Audio is only triggered after the first user interaction (`space` / `click` / `tap`), which satisfies browser autoplay requirements. |
| `localStorage` unavailable (private mode / quota exceeded) | `setItem` / `getItem` calls are wrapped in `try/catch`; game falls back to in-memory `highScore = 0`. |
| `parseInt` returns `NaN` on corrupt localStorage value | `parseInt(value) || 0` ensures `highScore` defaults to 0. |

---

## Testing Strategy

### Approach

This project is a small vanilla JS game with no build step. Testing uses plain browser-runnable scripts or a lightweight runner such as **Vitest** (configured with `jsdom` environment) so tests can import `game.js` directly without a browser.

### Unit Tests (example-based)

Focus on concrete, deterministic behaviors:

- Canvas dimensions are 400 × 600 after `initGame()`
- After `ghosty.jump()`, `vy === JUMP_FORCE`
- After `startGame()`, game state is `'PLAYING'`
- After `triggerGameOver()`, game state is `'GAMEOVER'` and `highScore >= score`
- `localStorage` key `flappyKiroHighScore` is written on game over
- `highScore` is read from `localStorage` on `initGame()`

### Property-Based Tests

Uses **fast-check** (JavaScript PBT library, zero runtime dependencies).
Each test runs a minimum of **100 iterations**.

| Test | Property | Tag |
|---|---|---|
| Gravity accumulation | For any `vy < MAX_FALL_SPEED`, `update()` sets `vy_new = vy + GRAVITY` | Feature: flappy-kiro-game, Property 1: Gravity accumulates each frame |
| Terminal velocity | For any `vy`, after `update()`, `vy <= MAX_FALL_SPEED` | Feature: flappy-kiro-game, Property 2: Terminal velocity is enforced |
| Pipe scroll | For any `pipe.x`, after `update()`, `pipe.x === old_x - PIPE_SPEED` | Feature: flappy-kiro-game, Property 3: Pipe scrolls at constant speed |
| Pipe gap | For any generated `gapY`, `PIPE_GAP` distance is maintained | Feature: flappy-kiro-game, Property 4: Pipe gap invariant |
| Hitbox containment | For any `(x, y)`, hitbox stays within sprite bounds | Feature: flappy-kiro-game, Property 5: Hitbox is contained within sprite |
| Score increment | For any score `s`, passing a pipe yields `s + 1` | Feature: flappy-kiro-game, Property 6: Score increments by exactly one per pipe |
| High score invariant | For any `(score, highScore)`, `highScore >= score` always | Feature: flappy-kiro-game, Property 7: High score never falls below current score |
| localStorage round-trip | For any integer `h`, save then load returns `h` | Feature: flappy-kiro-game, Property 8: High score localStorage round-trip |
| Pipe cleanup | After `cleanupPipes()`, no pipe has `x + PIPE_WIDTH < 0` | Feature: flappy-kiro-game, Property 9: Off-screen pipes are removed |

### Integration / Manual Tests

These behaviors require a browser and are verified manually:

- Sound effects play on jump and game over (after first interaction)
- Game runs via `file://` protocol with no console errors
- Touch / tap input works on mobile viewport
- Canvas is centered at 400 px and above viewport widths
- Ghosty sprite renders correctly from `assets/ghosty.png`
