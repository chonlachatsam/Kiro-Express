// ============================================================
//  Game Rai — game.js
// ============================================================

const canvas = document.getElementById('gameCanvas');
const ctx    = canvas.getContext('2d');

// ── Centralized CONFIG object ───────────────────────────────
// แก้ค่าเกมทั้งหมดได้ที่นี่ที่เดียว
const CONFIG = {
  // Canvas
  width:        400,
  height:       600,
  groundHeight: 60,

  // Physics
  gravity:      0.14,
  jumpForce:   -3.8,
  maxFall:      5,

  // Pipe
  pipeSpeed:    1.6,
  pipeWidth:    60,
  pipeGap:      155,
  pipeInterval: 1700,  // ms ระหว่าง spawn

  // Ghosty
  ghostySize:   44,
  hitboxPad:    8,     // shrink hitbox ทุกด้าน

  // Colors
  colors: {
    sky:        ['#5BA4CF', '#87CEEB'],
    ground:     '#8B6914',
    grass:      '#5D8A3C',
    pipeBody:   '#4CAF50',
    pipeCap:    '#388E3C',
  },

  // Storage
  storageKey: 'flappyKiroHighScore',
};

// ── Derived values ──────────────────────────────────────────
const W        = CONFIG.width;
const H        = CONFIG.height;
const GROUND_Y = H - CONFIG.groundHeight;

// ── Assets ─────────────────────────────────────────────────
const ghostyImg     = new Image();
ghostyImg.src       = 'assets/ghosty.png';

const jumpSound      = new Audio('assets/jump.wav');
const gameOverSound  = new Audio('assets/game_over.wav');

function playSound(audio) {
  audio.currentTime = 0;
  audio.play().catch(() => {});
}

// ── State ───────────────────────────────────────────────────
const STATE = { START: 'START', PLAYING: 'PLAYING', OVER: 'OVER' };
let state = STATE.START;

// ── Score ───────────────────────────────────────────────────
let score     = 0;
let highScore = parseInt(localStorage.getItem(CONFIG.storageKey) || '0', 10);


// ── Clouds ──────────────────────────────────────────────────
const clouds = [];
(function initClouds() {
  for (let i = 0; i < 6; i++) {
    clouds.push({
      x:     Math.random() * W,
      y:     20 + Math.random() * (GROUND_Y * 0.55),
      w:     50 + Math.random() * 60,
      h:     22 + Math.random() * 18,
      speed: 0.3 + Math.random() * 0.35,
      alpha: 0.35 + Math.random() * 0.35,
    });
  }
})();

function updateClouds() {
  clouds.forEach(c => {
    c.x -= c.speed;
    if (c.x + c.w < 0) {
      c.x     = W + 10;
      c.y     = 20 + Math.random() * (GROUND_Y * 0.55);
      c.speed = 0.3 + Math.random() * 0.35;
      c.alpha = 0.35 + Math.random() * 0.35;
    }
  });
}

function drawClouds() {
  clouds.forEach(c => {
    ctx.save();
    ctx.globalAlpha = c.alpha;
    ctx.fillStyle   = '#ffffff';
    // draw fluffy cloud with 3 overlapping ellipses
    const rx = c.w / 2;
    const ry = c.h / 2;
    ctx.beginPath();
    ctx.ellipse(c.x + rx * 0.5, c.y + ry * 0.6, rx * 0.55, ry * 0.7, 0, 0, Math.PI * 2);
    ctx.ellipse(c.x + rx,       c.y + ry * 0.4, rx * 0.65, ry * 0.85, 0, 0, Math.PI * 2);
    ctx.ellipse(c.x + rx * 1.5, c.y + ry * 0.6, rx * 0.55, ry * 0.7, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });
}
// ── Ghosty ──────────────────────────────────────────────────
const ghosty = {
  x:  90,
  y:  H / 2 - CONFIG.ghostySize / 2,
  vy: 0,

  reset() {
    this.y  = H / 2 - CONFIG.ghostySize / 2;
    this.vy = 0;
  },

  jump() {
    this.vy = CONFIG.jumpForce;
    playSound(jumpSound);
  },

  update() {
    this.vy = Math.min(this.vy + CONFIG.gravity, CONFIG.maxFall);
    this.y += this.vy;
  },

  hitbox() {
    return {
      x: this.x + CONFIG.hitboxPad,
      y: this.y + CONFIG.hitboxPad,
      w: CONFIG.ghostySize - CONFIG.hitboxPad * 2,
      h: CONFIG.ghostySize - CONFIG.hitboxPad * 2,
    };
  },

  render() {
    if (ghostyImg.complete && ghostyImg.naturalWidth > 0) {
      ctx.drawImage(ghostyImg, this.x, this.y, CONFIG.ghostySize, CONFIG.ghostySize);
    } else {
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(this.x + CONFIG.ghostySize / 2, this.y + CONFIG.ghostySize / 2, CONFIG.ghostySize / 2, 0, Math.PI * 2);
      ctx.fill();
    }
  },
};

// ── Pipes ───────────────────────────────────────────────────
let pipes        = [];
let lastPipeTime = 0;

function spawnPipe(now) {
  const minGapY = 120;
  const maxGapY = GROUND_Y - 120;
  const gapY    = Math.floor(Math.random() * (maxGapY - minGapY + 1)) + minGapY;
  pipes.push({ x: W, gapY, passed: false });
  lastPipeTime = now;
}

function updatePipes(now) {
  if (now - lastPipeTime > CONFIG.pipeInterval) spawnPipe(now);

  pipes.forEach(p => { p.x -= CONFIG.pipeSpeed; });

  pipes.forEach(p => {
    if (!p.passed && p.x + CONFIG.pipeWidth < ghosty.x) {
      p.passed = true;
      score++;
      if (score > highScore) {
        highScore = score;
        localStorage.setItem(CONFIG.storageKey, highScore);
      }
    }
  });

  pipes = pipes.filter(p => p.x + CONFIG.pipeWidth > 0);
}

function pipeHitboxTop(p)    { return { x: p.x, y: 0,                           w: CONFIG.pipeWidth, h: p.gapY - CONFIG.pipeGap / 2 }; }
function pipeHitboxBottom(p) { return { x: p.x, y: p.gapY + CONFIG.pipeGap / 2, w: CONFIG.pipeWidth, h: GROUND_Y - (p.gapY + CONFIG.pipeGap / 2) }; }

function renderPipe(p) {
  const topH    = p.gapY - CONFIG.pipeGap / 2;
  const botY    = p.gapY + CONFIG.pipeGap / 2;
  const botH    = GROUND_Y - botY;
  const capH    = 20;
  const capOver = 6;

  ctx.fillStyle = CONFIG.colors.pipeBody;
  ctx.fillRect(p.x, 0, CONFIG.pipeWidth, topH - capH);

  ctx.fillStyle = CONFIG.colors.pipeCap;
  ctx.fillRect(p.x - capOver, topH - capH, CONFIG.pipeWidth + capOver * 2, capH);

  ctx.fillStyle = CONFIG.colors.pipeBody;
  ctx.fillRect(p.x, botY + capH, CONFIG.pipeWidth, botH - capH);

  ctx.fillStyle = CONFIG.colors.pipeCap;
  ctx.fillRect(p.x - capOver, botY, CONFIG.pipeWidth + capOver * 2, capH);
}

// ── Collision ───────────────────────────────────────────────
function overlaps(a, b) {
  return a.x < b.x + b.w &&
         a.x + a.w > b.x &&
         a.y < b.y + b.h &&
         a.y + a.h > b.y;
}

function checkCollision() {
  const hb = ghosty.hitbox();
  if (ghosty.y <= 0) return true;
  if (ghosty.y + CONFIG.ghostySize >= GROUND_Y) return true;
  for (const p of pipes) {
    if (overlaps(hb, pipeHitboxTop(p)) || overlaps(hb, pipeHitboxBottom(p))) return true;
  }
  return false;
}

// ── Render helpers ──────────────────────────────────────────
function drawBackground() {
  const sky = ctx.createLinearGradient(0, 0, 0, GROUND_Y);
  sky.addColorStop(0, CONFIG.colors.sky[0]);
  sky.addColorStop(1, CONFIG.colors.sky[1]);
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, GROUND_Y);
}

function drawGround() {
  ctx.fillStyle = CONFIG.colors.ground;
  ctx.fillRect(0, GROUND_Y, W, CONFIG.groundHeight);
  ctx.fillStyle = CONFIG.colors.grass;
  ctx.fillRect(0, GROUND_Y, W, 12);
}

function drawHUD() {
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  ctx.fillRect(0, H - CONFIG.groundHeight + 14, W, 28);
  ctx.fillStyle = '#fff';
  ctx.font      = 'bold 16px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('Score: ' + score + '  |  Best: ' + highScore, W / 2, H - CONFIG.groundHeight + 32);
}

// ── Play Button ─────────────────────────────────────────────
const playBtn = { x: W / 2, y: 0, r: 36 }; // r = radius, y set dynamically when drawn

function drawPlayButton(cy) {
  playBtn.y = cy;
  const r = playBtn.r;

  // outer circle
  ctx.save();
  ctx.beginPath();
  ctx.arc(W / 2, cy, r, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255,255,255,0.92)';
  ctx.shadowColor = '#000';
  ctx.shadowBlur  = 12;
  ctx.fill();
  ctx.shadowBlur  = 0;

  // play triangle (rounded feel via lineTo)
  const tx = W / 2 - 10;
  const ty = cy;
  ctx.beginPath();
  ctx.moveTo(tx - 10, ty - 16);
  ctx.lineTo(tx - 10, ty + 16);
  ctx.lineTo(tx + 20, ty);
  ctx.closePath();
  ctx.fillStyle = '#4CAF50';
  ctx.fill();
  ctx.restore();
}

function isOnPlayButton(mx, my) {
  const dx = mx - playBtn.x;
  const dy = my - playBtn.y;
  return Math.sqrt(dx * dx + dy * dy) <= playBtn.r + 10;
}
function drawStartScreen() {
  ctx.fillStyle = 'rgba(0,0,0,0.45)';
  ctx.fillRect(0, 0, W, H);
  ctx.textAlign = 'center';

  ctx.font        = 'bold 42px Arial';
  ctx.fillStyle   = '#FFD700';
  ctx.shadowColor = '#000';
  ctx.shadowBlur  = 8;
  ctx.fillText('Game Rai', W / 2, H / 2 - 90);
  ctx.shadowBlur  = 0;

  ctx.drawImage(ghostyImg, W / 2 - CONFIG.ghostySize / 2, H / 2 - 40, CONFIG.ghostySize, CONFIG.ghostySize);

  drawPlayButton(H / 2 + 60);

  if (highScore > 0) {
    ctx.font      = '16px Arial';
    ctx.fillStyle = '#FFD700';
    ctx.fillText('Best: ' + highScore, W / 2, H / 2 + 85);
  }
}

function drawGameOverScreen() {
  ctx.fillStyle = 'rgba(0,0,0,0.55)';
  ctx.fillRect(0, 0, W, H);
  ctx.textAlign = 'center';

  ctx.font        = 'bold 44px Arial';
  ctx.fillStyle   = '#FF5252';
  ctx.shadowColor = '#000';
  ctx.shadowBlur  = 8;
  ctx.fillText('Game Over', W / 2, H / 2 - 70);
  ctx.shadowBlur  = 0;

  ctx.font      = 'bold 26px Arial';
  ctx.fillStyle = '#fff';
  ctx.fillText('Score: ' + score, W / 2, H / 2 - 20);

  ctx.font      = '20px Arial';
  ctx.fillStyle = '#FFD700';
  ctx.fillText('Best: ' + highScore, W / 2, H / 2 + 18);

  drawPlayButton(H / 2 + 80);
}

// ── Game control ─────────────────────────────────────────────
function startGame() {
  score        = 0;
  pipes        = [];
  lastPipeTime = 0;
  ghosty.reset();
  ghosty.jump();
  state = STATE.PLAYING;
}

function triggerGameOver() {
  playSound(gameOverSound);
  state = STATE.OVER;
}

function handleInput() {
  if (state === STATE.START)   startGame();
  else if (state === STATE.PLAYING) ghosty.jump();
  else if (state === STATE.OVER)    startGame();
}

// ── Input listeners ──────────────────────────────────────────
document.addEventListener('keydown', e => {
  if (e.code === 'Space' || e.code === 'ArrowUp') {
    e.preventDefault();
    handleInput();
  }
});
canvas.addEventListener('click', e => {
  if (state === STATE.PLAYING) {
    ghosty.jump();
  } else {
    const rect = canvas.getBoundingClientRect();
    const scaleX = W / rect.width;
    const scaleY = H / rect.height;
    const mx = (e.clientX - rect.left) * scaleX;
    const my = (e.clientY - rect.top)  * scaleY;
    if (isOnPlayButton(mx, my)) handleInput();
  }
});
canvas.addEventListener('touchstart', e => {
  e.preventDefault();
  if (state === STATE.PLAYING) {
    ghosty.jump();
  } else {
    const t    = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    const scaleX = W / rect.width;
    const scaleY = H / rect.height;
    const mx = (t.clientX - rect.left) * scaleX;
    const my = (t.clientY - rect.top)  * scaleY;
    if (isOnPlayButton(mx, my)) handleInput();
  }
}, { passive: false });

// ── Main loop ────────────────────────────────────────────────
function loop(now) {
  if (state === STATE.PLAYING) {
    updateClouds();
    ghosty.update();
    updatePipes(now);
    if (checkCollision()) triggerGameOver();
  }

  drawBackground();
  drawClouds();
  pipes.forEach(renderPipe);
  ghosty.render();
  drawGround();

  if (state === STATE.PLAYING || state === STATE.OVER) drawHUD();
  if (state === STATE.START) drawStartScreen();
  if (state === STATE.OVER)  drawGameOverScreen();

  requestAnimationFrame(loop);
}

// ── Boot ─────────────────────────────────────────────────────
ghostyImg.onload  = () => requestAnimationFrame(loop);
ghostyImg.onerror = () => requestAnimationFrame(loop);



