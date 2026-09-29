// ============================================================
//  Game Rai — game.js
// ============================================================

const canvas = document.getElementById('gameCanvas');
const ctx    = canvas.getContext('2d');

// ── Centralized CONFIG ──────────────────────────────────────
const CONFIG = {
  width:        400,
  height:       600,
  groundHeight: 60,
  gravity:      0.14,
  jumpForce:   -3.8,
  maxFall:      5,
  pipeSpeed:    1.6,
  pipeWidth:    60,
  pipeGap:      155,
  pipeInterval: 1700,
  ghostySize:   44,
  hitboxPad:    8,
  colors: {
    skyTop:    '#3a8fc7',
    skyBottom: '#a8dff0',
    ground:    '#7a4f1e',
    grass:     '#4a9e3f',
    pipeBody:  '#3db848',
    pipeCap:   '#2d8c38',
    pipeShine: '#6ee87a',
  },
  storageKey: 'flappyKiroHighScore',
};

const W        = CONFIG.width;
const H        = CONFIG.height;
const GROUND_Y = H - CONFIG.groundHeight;

// ── Assets ──────────────────────────────────────────────────
const ghostyImg    = new Image(); ghostyImg.src = 'assets/ghosty.png';
const jumpSound    = new Audio('assets/jump.wav');
const gameOverSound = new Audio('assets/game_over.wav');

function playSound(audio) { audio.currentTime = 0; audio.play().catch(() => {}); }

// ── State ────────────────────────────────────────────────────
const STATE = { START: 'START', PLAYING: 'PLAYING', OVER: 'OVER' };
let state = STATE.START;
let score = 0;
let highScore = parseInt(localStorage.getItem(CONFIG.storageKey) || '0', 10);

// ── Clouds ───────────────────────────────────────────────────
const clouds = [];
(function initClouds() {
  for (let i = 0; i < 7; i++) {
    clouds.push({
      x:     Math.random() * W,
      y:     15 + Math.random() * (GROUND_Y * 0.45),
      w:     55 + Math.random() * 70,
      h:     24 + Math.random() * 20,
      speed: 0.2 + Math.random() * 0.3,
      alpha: 0.4 + Math.random() * 0.3,
      layer: Math.random() < 0.4 ? 0 : 1,
    });
  }
})();

function updateClouds() {
  clouds.forEach(c => {
    c.x -= c.speed;
    if (c.x + c.w < 0) {
      c.x = W + 20;
      c.y = 15 + Math.random() * (GROUND_Y * 0.45);
    }
  });
}

function drawClouds() {
  // back layer first
  [0,1].forEach(layer => {
    clouds.filter(c => c.layer === layer).forEach(c => {
      ctx.save();
      ctx.globalAlpha = c.alpha * (layer === 0 ? 0.6 : 1);
      ctx.fillStyle = '#ffffff';
      const rx = c.w / 2, ry = c.h / 2;
      ctx.beginPath();
      ctx.ellipse(c.x + rx * 0.45, c.y + ry * 0.7,  rx * 0.5,  ry * 0.65, 0, 0, Math.PI*2);
      ctx.ellipse(c.x + rx,        c.y + ry * 0.35,  rx * 0.68, ry * 0.9,  0, 0, Math.PI*2);
      ctx.ellipse(c.x + rx * 1.55, c.y + ry * 0.7,  rx * 0.5,  ry * 0.65, 0, 0, Math.PI*2);
      ctx.fill();
      // subtle shadow under cloud
      ctx.globalAlpha = c.alpha * 0.12 * (layer === 0 ? 0.5 : 1);
      ctx.fillStyle = '#4a8fc0';
      ctx.beginPath();
      ctx.ellipse(c.x + rx, c.y + ry * 0.85 + 10, rx * 0.75, ry * 0.25, 0, 0, Math.PI*2);
      ctx.fill();
      ctx.restore();
    });
  });
}

// ── Ghosty ───────────────────────────────────────────────────
const ghosty = {
  x: 90, y: H/2 - CONFIG.ghostySize/2, vy: 0,
  reset() { this.y = H/2 - CONFIG.ghostySize/2; this.vy = 0; },
  jump()   { this.vy = CONFIG.jumpForce; playSound(jumpSound); },
  update() { this.vy = Math.min(this.vy + CONFIG.gravity, CONFIG.maxFall); this.y += this.vy; },
  hitbox() {
    const p = CONFIG.hitboxPad;
    return { x: this.x+p, y: this.y+p, w: CONFIG.ghostySize-p*2, h: CONFIG.ghostySize-p*2 };
  },
  render() {
    // subtle shadow under ghosty
    ctx.save();
    ctx.globalAlpha = 0.18;
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.ellipse(this.x + CONFIG.ghostySize/2, this.y + CONFIG.ghostySize + 4, 14, 5, 0, 0, Math.PI*2);
    ctx.fill();
    ctx.restore();
    if (ghostyImg.complete && ghostyImg.naturalWidth > 0) {
      ctx.drawImage(ghostyImg, this.x, this.y, CONFIG.ghostySize, CONFIG.ghostySize);
    } else {
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(this.x + CONFIG.ghostySize/2, this.y + CONFIG.ghostySize/2, CONFIG.ghostySize/2, 0, Math.PI*2);
      ctx.fill();
    }
  },
};

// ── Pipes ────────────────────────────────────────────────────
let pipes = [], lastPipeTime = 0;

function spawnPipe(now) {
  const gapY = 120 + Math.floor(Math.random() * (GROUND_Y - 240));
  pipes.push({ x: W, gapY, passed: false });
  lastPipeTime = now;
}

function updatePipes(now) {
  if (now - lastPipeTime > CONFIG.pipeInterval) spawnPipe(now);
  pipes.forEach(p => { p.x -= CONFIG.pipeSpeed; });
  pipes.forEach(p => {
    if (!p.passed && p.x + CONFIG.pipeWidth < ghosty.x) {
      p.passed = true; score++;
      if (score > highScore) { highScore = score; localStorage.setItem(CONFIG.storageKey, highScore); }
    }
  });
  pipes = pipes.filter(p => p.x + CONFIG.pipeWidth > 0);
}

function pipeHitboxTop(p)    { return { x: p.x, y: 0, w: CONFIG.pipeWidth, h: p.gapY - CONFIG.pipeGap/2 }; }
function pipeHitboxBottom(p) { return { x: p.x, y: p.gapY + CONFIG.pipeGap/2, w: CONFIG.pipeWidth, h: GROUND_Y - (p.gapY + CONFIG.pipeGap/2) }; }

function renderPipe(p) {
  const topH  = p.gapY - CONFIG.pipeGap/2;
  const botY  = p.gapY + CONFIG.pipeGap/2;
  const botH  = GROUND_Y - botY;
  const capH  = 22, capOver = 7, pw = CONFIG.pipeWidth;

  function drawPipeSection(x, y, w, h) {
    // body gradient
    const g = ctx.createLinearGradient(x, 0, x+w, 0);
    g.addColorStop(0,    '#2a7a30');
    g.addColorStop(0.25, CONFIG.colors.pipeBody);
    g.addColorStop(0.55, CONFIG.colors.pipeShine);
    g.addColorStop(0.75, CONFIG.colors.pipeBody);
    g.addColorStop(1,    '#1e5e24');
    ctx.fillStyle = g;
    ctx.fillRect(x, y, w, h);
    // right shadow edge
    ctx.fillStyle = 'rgba(0,0,0,0.15)';
    ctx.fillRect(x+w-8, y, 8, h);
  }

  function drawCap(x, y, w, h) {
    const g = ctx.createLinearGradient(x, 0, x+w, 0);
    g.addColorStop(0,    '#1e5e24');
    g.addColorStop(0.2,  CONFIG.colors.pipeCap);
    g.addColorStop(0.5,  '#5dd468');
    g.addColorStop(0.8,  CONFIG.colors.pipeCap);
    g.addColorStop(1,    '#1a5220');
    ctx.fillStyle = g;
    // rounded cap
    const r = 4;
    ctx.beginPath();
    ctx.moveTo(x+r, y); ctx.lineTo(x+w-r, y);
    ctx.quadraticCurveTo(x+w, y, x+w, y+r);
    ctx.lineTo(x+w, y+h-r);
    ctx.quadraticCurveTo(x+w, y+h, x+w-r, y+h);
    ctx.lineTo(x+r, y+h);
    ctx.quadraticCurveTo(x, y+h, x, y+h-r);
    ctx.lineTo(x, y+r);
    ctx.quadraticCurveTo(x, y, x+r, y);
    ctx.closePath();
    ctx.fill();
    // cap shine
    ctx.fillStyle = 'rgba(255,255,255,0.15)';
    ctx.fillRect(x+6, y+3, w*0.35, h*0.4);
    // cap shadow bottom
    ctx.fillStyle = 'rgba(0,0,0,0.15)';
    ctx.fillRect(x, y+h-6, w, 6);
  }

  // top pipe
  if (topH - capH > 0) drawPipeSection(p.x, 0, pw, topH - capH);
  drawCap(p.x - capOver, topH - capH, pw + capOver*2, capH);

  // bottom pipe
  drawCap(p.x - capOver, botY, pw + capOver*2, capH);
  if (botH - capH > 0) drawPipeSection(p.x, botY + capH, pw, botH - capH);
}

// ── Collision ────────────────────────────────────────────────
function overlaps(a, b) {
  return a.x < b.x+b.w && a.x+a.w > b.x && a.y < b.y+b.h && a.y+a.h > b.y;
}
function checkCollision() {
  const hb = ghosty.hitbox();
  if (ghosty.y <= 0) return true;
  if (ghosty.y + CONFIG.ghostySize >= GROUND_Y) return true;
  for (const p of pipes)
    if (overlaps(hb, pipeHitboxTop(p)) || overlaps(hb, pipeHitboxBottom(p))) return true;
  return false;
}

// ── Background ───────────────────────────────────────────────
function drawBackground() {
  const sky = ctx.createLinearGradient(0, 0, 0, GROUND_Y);
  sky.addColorStop(0,   CONFIG.colors.skyTop);
  sky.addColorStop(0.6, CONFIG.colors.skyBottom);
  sky.addColorStop(1,   '#d4f0fa');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, GROUND_Y);
}

// ── Ground ───────────────────────────────────────────────────
function drawGround() {
  // dirt gradient
  const dg = ctx.createLinearGradient(0, GROUND_Y, 0, H);
  dg.addColorStop(0, '#9b6a2f');
  dg.addColorStop(1, '#5a3a10');
  ctx.fillStyle = dg;
  ctx.fillRect(0, GROUND_Y, W, CONFIG.groundHeight);

  // grass strip with gradient
  const gg = ctx.createLinearGradient(0, GROUND_Y, 0, GROUND_Y+14);
  gg.addColorStop(0, '#5ecf4a');
  gg.addColorStop(1, '#3a9e2f');
  ctx.fillStyle = gg;
  ctx.fillRect(0, GROUND_Y, W, 14);

  // grass highlight
  ctx.fillStyle = 'rgba(255,255,255,0.12)';
  ctx.fillRect(0, GROUND_Y, W, 4);
}

// ── HUD ──────────────────────────────────────────────────────
function drawHUD() {
  const barY = H - CONFIG.groundHeight + 12;
  // frosted glass bar
  const bg = ctx.createLinearGradient(0, barY, 0, barY+32);
  bg.addColorStop(0, 'rgba(0,0,0,0.5)');
  bg.addColorStop(1, 'rgba(0,0,0,0.25)');
  ctx.fillStyle = bg;
  ctx.fillRect(0, barY, W, 32);
  // top highlight line
  ctx.fillStyle = 'rgba(255,255,255,0.1)';
  ctx.fillRect(0, barY, W, 2);

  ctx.textAlign    = 'center';
  ctx.font         = 'bold 15px Arial';
  // text shadow
  ctx.fillStyle    = 'rgba(0,0,0,0.5)';
  ctx.fillText('Score: ' + score + '  |  Best: ' + highScore, W/2+1, barY+22);
  ctx.fillStyle    = '#ffffff';
  ctx.fillText('Score: ' + score + '  |  Best: ' + highScore, W/2, barY+21);
}

// ── Play Button ──────────────────────────────────────────────
const playBtn = { x: W/2, y: 0, r: 38 };

function drawPlayButton(cy) {
  playBtn.y = cy;
  const r = playBtn.r;
  ctx.save();

  // outer glow
  const glow = ctx.createRadialGradient(W/2, cy, r*0.3, W/2, cy, r*1.6);
  glow.addColorStop(0, 'rgba(100,220,120,0.35)');
  glow.addColorStop(1, 'rgba(100,220,120,0)');
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(W/2, cy, r*1.6, 0, Math.PI*2);
  ctx.fill();

  // button circle gradient
  const cg = ctx.createRadialGradient(W/2-8, cy-8, 4, W/2, cy, r);
  cg.addColorStop(0, '#ffffff');
  cg.addColorStop(0.4, '#f0f8f0');
  cg.addColorStop(1, '#d0ecd0');
  ctx.beginPath();
  ctx.arc(W/2, cy, r, 0, Math.PI*2);
  ctx.fillStyle = cg;
  ctx.shadowColor = 'rgba(0,0,0,0.4)';
  ctx.shadowBlur  = 16;
  ctx.shadowOffsetY = 4;
  ctx.fill();
  ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;

  // inner ring
  ctx.beginPath();
  ctx.arc(W/2, cy, r-4, 0, Math.PI*2);
  ctx.strokeStyle = 'rgba(60,180,80,0.3)';
  ctx.lineWidth = 2;
  ctx.stroke();

  // play triangle with gradient
  const tg = ctx.createLinearGradient(W/2-14, cy-18, W/2+22, cy);
  tg.addColorStop(0, '#4cd860');
  tg.addColorStop(1, '#2a9e3a');
  ctx.beginPath();
  ctx.moveTo(W/2 - 12, cy - 17);
  ctx.lineTo(W/2 - 12, cy + 17);
  ctx.lineTo(W/2 + 22, cy);
  ctx.closePath();
  ctx.fillStyle = tg;
  ctx.shadowColor = 'rgba(0,100,0,0.3)';
  ctx.shadowBlur = 4;
  ctx.fill();
  ctx.shadowBlur = 0;

  // triangle highlight
  ctx.beginPath();
  ctx.moveTo(W/2 - 12, cy - 17);
  ctx.lineTo(W/2 - 12, cy - 2);
  ctx.lineTo(W/2 + 10, cy - 4);
  ctx.closePath();
  ctx.fillStyle = 'rgba(255,255,255,0.3)';
  ctx.fill();

  ctx.restore();
}

function isOnPlayButton(mx, my) {
  const dx = mx - playBtn.x, dy = my - playBtn.y;
  return Math.sqrt(dx*dx + dy*dy) <= playBtn.r + 12;
}

// ── Start Screen ─────────────────────────────────────────────
function drawStartScreen() {
  // dark vignette
  const vg = ctx.createRadialGradient(W/2, H/2, 80, W/2, H/2, 320);
  vg.addColorStop(0, 'rgba(0,0,0,0)');
  vg.addColorStop(1, 'rgba(0,0,30,0.7)');
  ctx.fillStyle = vg;
  ctx.fillRect(0, 0, W, H);

  ctx.textAlign = 'center';

  // title shadow
  ctx.font        = 'bold 46px Arial';
  ctx.fillStyle   = 'rgba(0,0,0,0.5)';
  ctx.fillText('Game Rai', W/2+2, H/2 - 108);

  // title with gradient
  const tg = ctx.createLinearGradient(0, H/2-140, 0, H/2-100);
  tg.addColorStop(0, '#fff176');
  tg.addColorStop(1, '#ffa000');
  ctx.fillStyle   = tg;
  ctx.shadowColor = 'rgba(255,160,0,0.6)';
  ctx.shadowBlur  = 18;
  ctx.fillText('Game Rai', W/2, H/2 - 110);
  ctx.shadowBlur  = 0;

  // ghosty with glow
  ctx.save();
  ctx.shadowColor = 'rgba(255,255,255,0.6)';
  ctx.shadowBlur  = 20;
  ctx.drawImage(ghostyImg, W/2 - CONFIG.ghostySize/2, H/2 - 38, CONFIG.ghostySize, CONFIG.ghostySize);
  ctx.shadowBlur  = 0;
  ctx.restore();

  drawPlayButton(H/2 + 68);

  if (highScore > 0) {
    ctx.font      = 'bold 14px Arial';
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.fillText('BEST: ' + highScore, W/2+1, H/2 + 126);
    ctx.font      = 'bold 14px Arial';
    ctx.fillStyle = '#FFD700';
    ctx.fillText('BEST: ' + highScore, W/2, H/2 + 125);
  }
}

// ── Game Over Screen ─────────────────────────────────────────
function drawGameOverScreen() {
  const vg = ctx.createRadialGradient(W/2, H/2, 60, W/2, H/2, 320);
  vg.addColorStop(0, 'rgba(80,0,0,0.3)');
  vg.addColorStop(1, 'rgba(0,0,0,0.72)');
  ctx.fillStyle = vg;
  ctx.fillRect(0, 0, W, H);

  ctx.textAlign = 'center';

  // card background
  ctx.save();
  ctx.fillStyle = 'rgba(255,255,255,0.07)';
  ctx.beginPath();
  const cr = 18;
  const cx = W/2 - 130, cy = H/2 - 100, cw = 260, ch = 190;
  ctx.moveTo(cx+cr, cy); ctx.lineTo(cx+cw-cr, cy);
  ctx.quadraticCurveTo(cx+cw, cy, cx+cw, cy+cr);
  ctx.lineTo(cx+cw, cy+ch-cr);
  ctx.quadraticCurveTo(cx+cw, cy+ch, cx+cw-cr, cy+ch);
  ctx.lineTo(cx+cr, cy+ch);
  ctx.quadraticCurveTo(cx, cy+ch, cx, cy+ch-cr);
  ctx.lineTo(cx, cy+cr);
  ctx.quadraticCurveTo(cx, cy, cx+cr, cy);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.15)';
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.restore();

  // Game Over text
  ctx.font        = 'bold 42px Arial';
  ctx.fillStyle   = 'rgba(0,0,0,0.5)';
  ctx.fillText('Game Over', W/2+2, H/2 - 58);
  const rg = ctx.createLinearGradient(0, H/2-80, 0, H/2-50);
  rg.addColorStop(0, '#ff6b6b');
  rg.addColorStop(1, '#c0392b');
  ctx.fillStyle   = rg;
  ctx.shadowColor = 'rgba(255,0,0,0.4)';
  ctx.shadowBlur  = 14;
  ctx.fillText('Game Over', W/2, H/2 - 60);
  ctx.shadowBlur  = 0;

  // score
  ctx.font      = 'bold 28px Arial';
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  ctx.fillText('Score: ' + score, W/2+1, H/2 - 14);
  ctx.fillStyle = '#ffffff';
  ctx.fillText('Score: ' + score, W/2, H/2 - 15);

  // best
  ctx.font      = 'bold 18px Arial';
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.fillText('Best: ' + highScore, W/2+1, H/2 + 17);
  ctx.fillStyle = '#FFD700';
  ctx.shadowColor = 'rgba(255,200,0,0.5)';
  ctx.shadowBlur  = 8;
  ctx.fillText('Best: ' + highScore, W/2, H/2 + 16);
  ctx.shadowBlur  = 0;

  drawPlayButton(H/2 + 82);
}

// ── Game control ─────────────────────────────────────────────
function startGame() {
  score = 0; pipes = []; lastPipeTime = 0;
  ghosty.reset(); ghosty.jump();
  state = STATE.PLAYING;
}

function triggerGameOver() { playSound(gameOverSound); state = STATE.OVER; }

function handleInput() {
  if (state === STATE.START)        startGame();
  else if (state === STATE.PLAYING) ghosty.jump();
  else if (state === STATE.OVER)    startGame();
}

// ── Input ────────────────────────────────────────────────────
document.addEventListener('keydown', e => {
  if (e.code === 'Space' || e.code === 'ArrowUp') { e.preventDefault(); handleInput(); }
});

canvas.addEventListener('click', e => {
  if (state === STATE.PLAYING) { ghosty.jump(); return; }
  const rect = canvas.getBoundingClientRect();
  const mx = (e.clientX - rect.left) * (W / rect.width);
  const my = (e.clientY - rect.top)  * (H / rect.height);
  if (isOnPlayButton(mx, my)) handleInput();
});

canvas.addEventListener('touchstart', e => {
  e.preventDefault();
  if (state === STATE.PLAYING) { ghosty.jump(); return; }
  const t = e.touches[0];
  const rect = canvas.getBoundingClientRect();
  const mx = (t.clientX - rect.left) * (W / rect.width);
  const my = (t.clientY - rect.top)  * (H / rect.height);
  if (isOnPlayButton(mx, my)) handleInput();
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

ghostyImg.onload  = () => requestAnimationFrame(loop);
ghostyImg.onerror = () => requestAnimationFrame(loop);
