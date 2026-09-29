# Game Mechanics & Physics Patterns

## Physics Constants (from CONFIG)
- CONFIG.gravity added to vy every frame (default 0.14)
- CONFIG.jumpForce negative value set on vy when jumping (default -5.0)
- CONFIG.maxFall maximum downward velocity (default 5)

## Ghosty Movement Pattern
Every frame while PLAYING:
  ghosty.vy = Math.min(ghosty.vy + CONFIG.gravity, CONFIG.maxFall);
  ghosty.y += ghosty.vy;

On jump input:
  ghosty.vy = CONFIG.jumpForce; // override, do NOT accumulate

## Pipe Scrolling Pattern
Every frame: pipe.x -= CONFIG.pipeSpeed
Spawn new pipe when: now - lastPipeTime > CONFIG.pipeInterval
Remove off-screen: pipes = pipes.filter(p => p.x + CONFIG.pipeWidth > 0)

## Collision Detection (AABB)
Keep pure, no side effects:
  function overlaps(a, b) {
    return a.x < b.x + b.w && a.x + a.w > b.x &&
           a.y < b.y + b.h && a.y + a.h > b.y;
  }

Check order: ceiling (y<=0), ground (y+size>=GROUND_Y), pipes

## Hitbox Pattern
Shrink by CONFIG.hitboxPad on all sides:
  { x: x+pad, y: y+pad, w: size-pad*2, h: size-pad*2 }

## Pipe Gap Rules
- Top pipe ends at: gapY - CONFIG.pipeGap/2
- Bottom pipe starts at: gapY + CONFIG.pipeGap/2
- Safe gapY range: 120 to GROUND_Y - 120
