# Flappy Kiro Domain Patterns

## Game State Machine
START --(input)--> PLAYING --(collision)--> OVER --(input)--> START

Always check state before processing input or updating physics.

## handleInput() Pattern
  if (state === STATE.START)       startGame();
  else if (state === STATE.PLAYING) ghosty.jump();
  else if (state === STATE.OVER)    startGame();

## startGame() Pattern
Reset all game variables:
  score = 0; pipes = []; lastPipeTime = 0;
  ghosty.reset(); ghosty.jump(); state = STATE.PLAYING;

## Score System
- Increment by exactly 1 when: ghosty.x > pipe.x + CONFIG.pipeWidth && !pipe.passed
- Set pipe.passed = true immediately to prevent double-counting
- highScore = Math.max(highScore, score)

## High Score Persistence
Save: localStorage.setItem(CONFIG.storageKey, highScore)
Load: parseInt(localStorage.getItem(CONFIG.storageKey) || 0, 10)
Always wrap in try/catch for private mode compatibility.

## Difficulty Progression
Currently fixed. If adding progression:
- Increase CONFIG.pipeSpeed gradually
- Decrease CONFIG.pipeInterval to spawn faster
- Never reduce CONFIG.pipeGap below 120px

## Input Events (bind all three for cross-device)
- keydown: Space or ArrowUp, always e.preventDefault()
- click on canvas
- touchstart on canvas with passive: false and e.preventDefault()
