# Visual & Audio Design Patterns

## Canvas Rendering Order (every frame)
1. drawBackground() - sky gradient
2. pipes.forEach(renderPipe) - pipes behind Ghosty
3. ghosty.render() - player sprite
4. drawGround() - ground strip
5. drawHUD() - score bar
6. Screen overlay (Start or Game Over) - drawn last

## Background
Sky gradient from CONFIG.colors.skyTop (#5BA4CF) to CONFIG.colors.skyBottom (#87CEEB)

## Pipe Rendering
Body color: CONFIG.colors.pipeBody (#4CAF50)
Cap color: CONFIG.colors.pipeCap (#388E3C)
Cap is wider than body by capOver (6px) on each side

## Ghosty Sprite
Render at (ghosty.x, ghosty.y) size CONFIG.ghostySize x CONFIG.ghostySize
Always check ghostyImg.complete && ghostyImg.naturalWidth > 0
Fallback: draw white circle if image not loaded

## Audio Pattern
Always reset before playing: audio.currentTime = 0
Always wrap: audio.play().catch(() => {})

## Typography
Title: bold 42px Arial, #FFD700
Game Over: bold 44px Arial, #FF5252
Score large: bold 26px Arial, #ffffff
HUD: bold 16px Arial, #ffffff
High score: 20px Arial, #FFD700
Instructions: 17-18px Arial, #cccccc
Always ctx.textAlign = center for overlays
Always reset ctx.shadowBlur = 0 after shadow use
