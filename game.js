// ============================================================
//  Flappy Kiro — game.js
// ============================================================

const canvas = document.getElementById('gameCanvas');
const ctx    = canvas.getContext('2d');

// ── Constants ──────────────────────────────────────────────
const W             = canvas.width;   // 400
const H             = canvas.height;  // 600
const GROUND_H      = 60;
const GROUND_Y      = H - GROUND_H;

const GRAVITY       = 0.14;
const JUMP_FORCE    = -5.0;
const MAX_FALL      = 5;

const PIPE_SPEED    = 2.5;
const PIPE_W        = 60;
const PIPE_GAP      = 155;
const PIPE_INTERVAL = 1700; // ms

const GHOSTY_W      = 44;
const GHOSTY_H      = 44;
const HITBOX_PAD    = 8;    // shrink hitbox on each side

// ── Assets ─────────────────────────────────────────────────
const ghostyImg   = new Image();
ghostyImg.src     = 'assets/ghosty.png';

const jumpSound     = new Audio('assets/jump.wav');
const gameOverSound = new Audio('assets/game_over.wav');

function playSound(audio) {
  audio.currentTime = 0;
  audio.play().catch(() => {});
}

// ── State ───────────────────────────────────────────────────
const STATE = { START: 'START', PLAYING: 'PLAYING', OVER: 'OVER' };
let state = STATE.START;

// ── Score ───────────────────────────────────────────────────
let score     = 0;
let highScore = parseInt(localStorage.getItem('flappyKiroHighScore') || '0', 10);

// ── Ghosty ──────────────────────────────────────────────────
const ghosty = {
  x:  90,
  y:  H / 2 - GHOSTY_H / 2,
  vy: 0,

  reset() {
    this.y  = H / 2 - GHOSTY_H / 2;
    this.vy = 0;
  },

  jump() {
    this.vy = JUMP_FORCE;
    playSound(jumpSound);
  },

  update() {
    this.vy = Math.min(this.vy + GRAVITY, MAX_FALL);
    this.y += this.vy;
  },

  hitbox() {
    return {
      x: this.x + HITBOX_PAD,
      y: this.y + HITBOX_PAD,
      w: GHOSTY_W - HITBOX_PAD * 2,
      h: GHOSTY_H - HITBOX_PAD * 2,
    };
  },

  render() {
    if (ghostyImg.complete) {
      ctx.drawImage(ghostyImg, this.x, this.y, GHOSTY_W, GHOSTY_H);
    } else {
      // fallback circle if image not loaded
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(this.x + GHOSTY_W / 2, this.y + GHOSTY_H / 2, GHOSTY_W / 2, 0, Math.PI * 2);
      ctx.fill();
    }
  },
};

// ── Pipes ───────────────────────────────────────────────────
let pipes         = [];
let lastPipeTime  = 0;

function spawnPipe(now) {
  const minGapY = 120;
  const maxGapY = GROUND_Y - 120;
  const gapY    = Math.floor(Math.random() * (maxGapY - minGapY + 1)) + minGapY;
  pipes.push({ x: W, gapY, passed: false });
  lastPipeTime = now;
}

function updatePipes(now) {
  // spawn
  if (now - lastPipeTime > PIPE_INTERVAL) spawnPipe(now);

  pipes.forEach(p => { p.x -= PIPE_SPEED; });

  // score
  pipes.forEach(p => {
    if (!p.passed && p.x + PIPE_W < ghosty.x) {
      p.passed = true;
      score++;
      if (score > highScore) {
        highScore = score;
        localStorage.setItem('flappyKiroHighScore', highScore);
      }
    }
  });

  // cleanup
  pipes = pipes.filter(p => p.x + PIPE_W > 0);
}

function pipeHitboxTop(p)    { return { x: p.x, y: 0,                    w: PIPE_W, h: p.gapY - PIPE_GAP / 2 }; }
function pipeHitboxBottom(p) { return { x: p.x, y: p.gapY + PIPE_GAP / 2, w: PIPE_W, h: GROUND_Y - (p.gapY + PIPE_GAP / 2) }; }

function renderPipe(p) {
  const topH    = p.gapY - PIPE_GAP / 2;
  const botY    = p.gapY + PIPE_GAP / 2;
  const botH    = GROUND_Y - botY;
  const capH    = 20;
  const capOver = 6;

  // top pipe body
  ctx.fillStyle = '#4CAF50';
  ctx.fillRect(p.x, 0, PIPE_W, topH - capH);

  // top pipe cap
  ctx.fillStyle = '#388E3C';
  ctx.fillRect(p.x - capOver, topH - capH, PIPE_W + capOver * 2, capH);

  // bottom pipe body
  ctx.fillStyle = '#4CAF50';
  ctx.fillRect(p.x, botY + capH, PIPE_W, botH - capH);

  // bottom pipe cap
  ctx.fillStyle = '#388E3C';
  ctx.fillRect(p.x - capOver, botY, PIPE_W + capOver * 2, capH);
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

  // ceiling
  if (ghosty.y <= 0) return true;

  // ground
  if (ghosty.y + GHOSTY_H >= GROUND_Y) return true;

  // pipes
  for (const p of pipes) {
    if (overlaps(hb, pipeHitboxTop(p)) || overlaps(hb, pipeHitboxBottom(p))) return true;
  }
  return false;
}

// ── Render helpers ──────────────────────────────────────────
function drawBackground() {
  // sky gradient
  const sky = ctx.createLinearGradient(0, 0, 0, GROUND_Y);
  sky.addColorStop(0, '#5BA4CF');
  sky.addColorStop(1, '#87CEEB');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, GROUND_Y);
}

function drawGround() {
  ctx.fillStyle = '#8B6914';
  ctx.fillRect(0, GROUND_Y, W, GROUND_H);
  ctx.fillStyle = '#5D8A3C';
  ctx.fillRect(0, GROUND_Y, W, 12);
}

function drawHUD() {
  ctx.fillStyle    = 'rgba(0,0,0,0.35)';
  ctx.fillRect(0, H - GROUND_H + 14, W, 28);
  ctx.fillStyle    = '#fff';
  ctx.font         = 'bold 16px Arial';
  ctx.textAlign    = 'center';
  ctx.fillText('Score: ' + score + '  |  Best: ' + highScore, W / 2, H - GROUND_H + 32);
}

function drawStartScreen() {
  // dim overlay
  ctx.fillStyle = 'rgba(0,0,0,0.45)';
  ctx.fillRect(0, 0, W, H);

  ctx.textAlign = 'center';

  // title
  ctx.font      = 'bold 42px Arial';
  ctx.fillStyle = '#FFD700';
  ctx.shadowColor = '#000'; ctx.shadowBlur = 8;
  ctx.fillText('Flappy Kiro', W / 2, H / 2 - 90);
  ctx.shadowBlur = 0;

  // ghosty preview
  ctx.drawImage(ghostyImg, W / 2 - GHOSTY_W / 2, H / 2 - 40, GHOSTY_W, GHOSTY_H);

  // instruction
  ctx.font      = '18px Arial';
  ctx.fillStyle = '#fff';
  ctx.fillText('Press  Space  or  Click  to  Start', W / 2, H / 2 + 55);

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

  ctx.font      = 'bold 44px Arial';
  ctx.fillStyle = '#FF5252';
  ctx.shadowColor = '#000'; ctx.shadowBlur = 8;
  ctx.fillText('Game Over', W / 2, H / 2 - 70);
  ctx.shadowBlur = 0;

  ctx.font      = 'bold 26px Arial';
  ctx.fillStyle = '#fff';
  ctx.fillText('Score: ' + score, W / 2, H / 2 - 20);

  ctx.font      = '20px Arial';
  ctx.fillStyle = '#FFD700';
  ctx.fillText('Best: ' + highScore, W / 2, H / 2 + 18);

  ctx.font      = '17px Arial';
  ctx.fillStyle = '#ccc';
  ctx.fillText('Press  Space  or  Click  to  Retry', W / 2, H / 2 + 65);
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
  if (state === STATE.START) {
    startGame();
  } else if (state === STATE.PLAYING) {
    ghosty.jump();
  } else if (state === STATE.OVER) {
    startGame();
  }
}

// ── Input listeners ──────────────────────────────────────────
document.addEventListener('keydown', e => {
  if (e.code === 'Space' || e.code === 'ArrowUp') {
    e.preventDefault();
    handleInput();
  }
});
canvas.addEventListener('click',      () => handleInput());
canvas.addEventListener('touchstart', e => { e.preventDefault(); handleInput(); }, { passive: false });

// ── Main loop ────────────────────────────────────────────────
function loop(now) {
  // ── update ──
  if (state === STATE.PLAYING) {
    ghosty.update();
    updatePipes(now);
    if (checkCollision()) triggerGameOver();
  }

  // ── render ──
  drawBackground();
  pipes.forEach(renderPipe);
  ghosty.render();
  drawGround();

  if (state === STATE.PLAYING || state === STATE.OVER) drawHUD();
  if (state === STATE.START)  drawStartScreen();
  if (state === STATE.OVER)   drawGameOverScreen();

  requestAnimationFrame(loop);
}

// ── Boot ─────────────────────────────────────────────────────
ghostyImg.onload = () => requestAnimationFrame(loop);
ghostyImg.onerror = () => requestAnimationFrame(loop); // fallback if image fails


