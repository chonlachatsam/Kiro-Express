# Implementation Plan: Flappy Kiro

## Overview

สร้างเกม Flappy Kiro โดยใช้ vanilla HTML5 Canvas และ JavaScript แบบ incremental — เริ่มจาก scaffold จนถึง game loop เต็มรูปแบบ ไม่มี build step เปิด `index.html` แล้วเล่นได้เลย

## Tasks

- [ ] 1. Set up project scaffold
  - สร้าง `index.html` พร้อม `<canvas>` ขนาด 400×600, link `style.css` และ `game.js`
  - สร้าง `style.css` จัด canvas ให้อยู่กึ่งกลางหน้าจอ พร้อม background สีเข้ม
  - _Requirements: 1.1, 9.4_

- [ ] 2. Define game constants and state machine
  - [ ] 2.1 ประกาศ constants ทั้งหมดใน `game.js` (GRAVITY, JUMP_FORCE, MAX_FALL_SPEED, PIPE_SPEED, PIPE_WIDTH, PIPE_GAP, PIPE_INTERVAL, GHOSTY_SIZE, HITBOX_SHRINK)
    - _Requirements: 2.4, 2.5, 3.1, 3.3_
  - [ ] 2.2 ประกาศ state machine: `START`, `PLAYING`, `GAMEOVER` และ GameSession object
    - _Requirements: 6.1, 7.1_

- [ ] 3. Implement Ghosty physics and rendering
  - [ ] 3.1 สร้าง `Ghosty` class: constructor, โหลด `assets/ghosty.png`, กำหนด x=90, y=center
    - _Requirements: 1.3, 2.1_
  - [ ] 3.2 implement `ghosty.update()` — ใช้ gravity สะสม velocity และ clamp ที่ MAX_FALL_SPEED แล้วอัปเดต y
    - _Requirements: 2.4, 2.5_
  - [ ]* 3.3 Write property test for gravity accumulation (Property 1)
    - **Property 1: Gravity accumulates each frame**
    - **Validates: Requirements 2.4**
  - [ ]* 3.4 Write property test for terminal velocity (Property 2)
    - **Property 2: Terminal velocity is enforced**
    - **Validates: Requirements 2.5**
  - [ ] 3.5 implement `ghosty.jump()` — set `vy = JUMP_FORCE`
    - _Requirements: 2.1, 2.2, 2.3_
  - [ ] 3.6 implement `ghosty.render(ctx)` — `drawImage` sprite ที่ตำแหน่ง (x, y) ขนาด GHOSTY_SIZE
    - _Requirements: 1.3_
  - [ ] 3.7 implement `ghosty.hitbox()` — คำนวณ AABB ที่หดเข้า HITBOX_SHRINK (20%) ทุกด้าน
    - _Requirements: 4.5_
  - [ ]* 3.8 Write property test for hitbox containment (Property 5)
    - **Property 5: Hitbox is contained within sprite**
    - **Validates: Requirements 4.5**

- [ ] 4. Implement Pipe scrolling and spawning
  - [ ] 4.1 สร้าง `Pipe` class: constructor รับ `x` และ `gapY`, กำหนด `passed = false`
    - _Requirements: 3.2_
  - [ ] 4.2 implement `pipe.update()` — `x -= PIPE_SPEED` ทุก frame
    - _Requirements: 3.1_
  - [ ]* 4.3 Write property test for pipe scroll speed (Property 3)
    - **Property 3: Pipe scrolls at constant speed**
    - **Validates: Requirements 3.1**
  - [ ] 4.4 implement `pipe.render(ctx)` — วาด top pipe และ bottom pipe สีเขียว #4CAF50 ขอบ #388E3C
    - _Requirements: 1.4, 3.5_
  - [ ] 4.5 implement `pipe.hitboxTop()` และ `pipe.hitboxBottom()` — AABB ของท่อบนและท่อล่าง
    - _Requirements: 4.1_
  - [ ] 4.6 implement `pipe.isOffScreen()` — คืน true เมื่อ `x + PIPE_WIDTH < 0`
    - _Requirements: 3.4_
  - [ ] 4.7 implement `spawnPipeIfNeeded()` — สร้าง Pipe ใหม่ทุก PIPE_INTERVAL ms โดย gapY สุ่มในช่วงปลอดภัย
    - _Requirements: 3.2, 3.3_
  - [ ]* 4.8 Write property test for pipe gap invariant (Property 4)
    - **Property 4: Pipe gap invariant**
    - **Validates: Requirements 3.3**

- [ ] 5. Checkpoint — ตรวจสอบว่า Ghosty และ Pipe render ถูกต้อง
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 6. Implement collision detection and Game Over
  - [ ] 6.1 implement `overlaps(a, b)` — AABB overlap function
    - _Requirements: 4.1_
  - [ ] 6.2 ตรวจ `ghosty.hitbox()` กับ `pipe.hitboxTop()` และ `pipe.hitboxBottom()` ทุก pipe; trigger `triggerGameOver()`
    - _Requirements: 4.1_
  - [ ] 6.3 ตรวจ Ghosty ตกพื้น (`y + GHOSTY_SIZE >= groundY`) และชนเพดาน (`y <= 0`); trigger `triggerGameOver()`
    - _Requirements: 4.2, 4.3_
  - [ ] 6.4 implement `triggerGameOver()` — หยุด loop, เล่น `game_over.wav`, set state `GAMEOVER`
    - _Requirements: 4.4_

- [ ] 7. Implement score system
  - [ ] 7.1 ตรวจ `pipe.passed` และเพิ่ม score ทีละ 1 เมื่อ Ghosty ผ่าน pipe (set `pipe.passed = true`)
    - _Requirements: 5.1_
  - [ ]* 7.2 Write property test for score increment (Property 6)
    - **Property 6: Score increments by exactly one per pipe**
    - **Validates: Requirements 5.1**
  - [ ] 7.3 implement `cleanupPipes()` — ลบ pipe ที่ `isOffScreen()` ออกจาก array
    - _Requirements: 3.4_
  - [ ]* 7.4 Write property test for off-screen pipe cleanup (Property 9)
    - **Property 9: Off-screen pipes are removed**
    - **Validates: Requirements 3.4**
  - [ ] 7.5 อัปเดต `highScore = Math.max(highScore, score)` และ save ลง localStorage key `flappyKiroHighScore`
    - _Requirements: 5.4, 5.5_
  - [ ] 7.6 โหลด `highScore` จาก localStorage เมื่อ `initGame()`; handle `NaN` ด้วย `|| 0` และ wrap ด้วย try/catch
    - _Requirements: 5.6_
  - [ ]* 7.7 Write property test for high score invariant (Property 7)
    - **Property 7: High score never falls below current score**
    - **Validates: Requirements 5.4**
  - [ ]* 7.8 Write property test for localStorage round-trip (Property 8)
    - **Property 8: High score localStorage round-trip**
    - **Validates: Requirements 5.5, 5.6**
  - [ ] 7.9 วาด HUD บน canvas — "Score: X | High: Y" ระหว่างเล่น
    - _Requirements: 5.2, 5.3_

- [ ] 8. Implement Start Screen and Game Over Screen
  - [ ] 8.1 implement `drawStartScreen(ctx)` — วาดชื่อเกม, Ghosty sprite, high score, และ "Press Space or Click to Start"
    - _Requirements: 6.2, 6.3, 6.4, 6.5_
  - [ ] 8.2 implement `drawGameOverScreen(ctx)` — วาด "Game Over", final score, updated high score, และ "Press Space or Click to Restart"
    - _Requirements: 7.2, 7.3, 7.4, 7.5_

- [ ] 9. Implement audio system
  - [ ] 9.1 implement `AudioManager.init()` — สร้าง `Audio` objects สำหรับ `jump.wav` และ `game_over.wav`
    - _Requirements: 8.1, 8.2_
  - [ ] 9.2 implement `AudioManager.playJump()` — reset `currentTime` แล้ว `play().catch(() => {})`, เรียกใน `ghosty.jump()`
    - _Requirements: 8.1, 8.3, 8.4_
  - [ ] 9.3 implement `AudioManager.playGameOver()` — reset `currentTime` แล้ว `play().catch(() => {})`, เรียกใน `triggerGameOver()`
    - _Requirements: 8.2, 8.3, 8.4_

- [ ] 10. Implement input handling
  - [ ] 10.1 ผูก `keydown` (Space, ArrowUp) กับ `handleInput()`
    - _Requirements: 2.1, 6.6, 7.6_
  - [ ] 10.2 ผูก `click` และ `touchstart` บน canvas กับ `handleInput()`
    - _Requirements: 2.2, 2.3, 6.6, 7.6_
  - [ ] 10.3 implement `handleInput()` — ถ้า `START` หรือ `GAMEOVER` เรียก `startGame()`; ถ้า `PLAYING` เรียก `ghosty.jump()`
    - _Requirements: 2.6, 7.6_

- [ ] 11. Wire game loop and state controller
  - [ ] 11.1 implement `initGame()` — reset Ghosty, Pipes, Score; set state `START`; โหลด highScore
    - _Requirements: 6.1_
  - [ ] 11.2 implement `startGame()` — transition state → `PLAYING`; เรียก `ghosty.jump()`
    - _Requirements: 2.6_
  - [ ] 11.3 implement `gameLoop(timestamp)` ด้วย `requestAnimationFrame` — เรียก `update()` และ `render()` ตาม state
    - _Requirements: 1.6_
  - [ ] 11.4 implement `update()` — เรียก `ghosty.update()`, pipe updates, spawn, collision, score, cleanup ตามลำดับ
    - _Requirements: 1.6_
  - [ ] 11.5 implement `render()` — วาด background (#87CEEB), pipes, ghosty, ground (#8B4513), HUD หรือ screen ตาม state
    - _Requirements: 1.2, 1.5_
  - [ ] 11.6 เรียก `initGame()` และ start `requestAnimationFrame` loop เมื่อ script โหลด
    - _Requirements: 6.1, 9.1_

- [ ] 12. Final checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks ที่มี `*` เป็น optional สามารถข้ามได้สำหรับ MVP ที่เร็วขึ้น
- Property tests ใช้ **fast-check** (JavaScript PBT library) รัน minimum 100 iterations ต่อ property
- Unit tests และ property tests ใช้ **Vitest** กับ `jsdom` environment
- แต่ละ task อ้างอิง requirements เฉพาะเพื่อ traceability
- Checkpoints ช่วย validate การทำงานแบบ incremental

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["2.1", "2.2"] },
    { "id": 1, "tasks": ["3.1", "4.1"] },
    { "id": 2, "tasks": ["3.2", "3.5", "3.6", "3.7", "4.2", "4.4", "4.5", "4.6", "4.7"] },
    { "id": 3, "tasks": ["3.3", "3.4", "3.8", "4.3", "4.8", "6.1"] },
    { "id": 4, "tasks": ["6.2", "6.3", "6.4", "7.1", "7.3", "7.5", "7.6", "7.9"] },
    { "id": 5, "tasks": ["7.2", "7.4", "7.7", "7.8", "8.1", "8.2", "9.1"] },
    { "id": 6, "tasks": ["9.2", "9.3", "10.1", "10.2", "10.3"] },
    { "id": 7, "tasks": ["11.1", "11.2", "11.3", "11.4", "11.5", "11.6"] }
  ]
}
```
