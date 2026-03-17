// ── Canvas setup ──────────────────────────────────────────────────
const wrap  = document.getElementById('canvas-wrap');
const cBg   = document.getElementById('c-bg');
const cDraw = document.getElementById('c-draw');
const cFx   = document.getElementById('c-fx');
const gBg   = cBg.getContext('2d');
const gD    = cDraw.getContext('2d');
const gFx   = cFx.getContext('2d');

let W = 0, H = 0;

function resize() {
  W = wrap.clientWidth;
  H = wrap.clientHeight;
  cBg.width = cDraw.width = cFx.width = W;
  cBg.height = cDraw.height = cFx.height = H;
  drawBg(lastR || 0);
}

// ── Background ────────────────────────────────────────────────────
function drawBg(r) {
  gBg.clearRect(0, 0, W, H);
  const cx = W / 2, cy = H / 2;

  // Ambient glow
  const grd = gBg.createRadialGradient(cx, cy, 0, cx, cy, Math.min(W, H) * .45);
  grd.addColorStop(0, 'rgba(196,170,120,.05)');
  grd.addColorStop(1, 'rgba(0,0,0,0)');
  gBg.fillStyle = grd;
  gBg.fillRect(0, 0, W, H);

  // Ideal circle ghost
  if (r) {
    gBg.save();
    gBg.setLineDash([3, 7]);
    gBg.strokeStyle = 'rgba(196,170,120,.18)';
    gBg.lineWidth = 1;
    gBg.beginPath();
    gBg.arc(cx, cy, r, 0, Math.PI * 2);
    gBg.stroke();
    gBg.restore();
  }

  // Fixed center dot
  gBg.save();
  gBg.beginPath();
  gBg.arc(cx, cy, 11, 0, Math.PI * 2);
  gBg.strokeStyle = 'rgba(196,170,120,.35)';
  gBg.lineWidth = 1;
  gBg.stroke();

  gBg.strokeStyle = 'rgba(196,170,120,.25)';
  gBg.lineWidth = .5;
  gBg.beginPath();
  gBg.moveTo(cx - 20, cy); gBg.lineTo(cx + 20, cy);
  gBg.moveTo(cx, cy - 20); gBg.lineTo(cx, cy + 20);
  gBg.stroke();

  gBg.beginPath();
  gBg.arc(cx, cy, 3, 0, Math.PI * 2);
  gBg.fillStyle = '#c4aa78';
  gBg.fill();
  gBg.restore();
}

// ── State ─────────────────────────────────────────────────────────
let pts = [], drawing = false, scored = false;
let bestScore = +localStorage.getItem('pCircle_best') || 0;
let hist = JSON.parse(localStorage.getItem('pCircle_hist') || '[]');
let lastR = 0;
let audioCtx = null;

// ── DOM refs ──────────────────────────────────────────────────────
const scoreBox   = document.getElementById('score-box');
const scoreNum   = document.getElementById('score-num');
const scoreGrade = document.getElementById('score-grade');
const subRound   = document.getElementById('sub-round');
const subCover   = document.getElementById('sub-cover');
const subClose   = document.getElementById('sub-close');
const hint       = document.getElementById('hint');
const retryHint  = document.getElementById('retry-hint');
const bestVal    = document.getElementById('best-val');
const histRow    = document.getElementById('history-row');
const cheatWarn  = document.getElementById('cheat-warn');

// ── UI helpers ────────────────────────────────────────────────────
function updateUI() {
  bestVal.textContent = bestScore > 0 ? bestScore + '%' : '—';
  histRow.innerHTML = '';
  hist.slice(-8).forEach(s => {
    const d = document.createElement('div');
    d.className = 'hdot';
    d.style.background = hue(s);
    d.title = s + '%';
    histRow.appendChild(d);
  });
}

function hue(s) {
  if (s >= 95) return '#ffd04a';
  if (s >= 85) return '#c4aa78';
  if (s >= 70) return '#6dbd95';
  if (s >= 55) return '#6a9abf';
  return '#666';
}

function hueToRgb(s) {
  if (s >= 95) return '255,208,74';
  if (s >= 85) return '196,170,120';
  if (s >= 70) return '109,189,149';
  if (s >= 55) return '106,154,191';
  return '102,102,102';
}

function grade(s) {
  if (s >= 99) return '¡perfecto!';
  if (s >= 95) return 'extraordinario';
  if (s >= 90) return 'excelente';
  if (s >= 80) return 'muy bien';
  if (s >= 70) return 'bien';
  if (s >= 60) return 'regular';
  if (s >= 45) return 'inténtalo de nuevo';
  return 'sigue practicando';
}

function animNum(target, dur) {
  const t0 = performance.now();
  function tick(now) {
    const t = Math.min(1, (now - t0) / dur);
    const ease = 1 - Math.pow(1 - t, 3);
    scoreNum.textContent = Math.round(ease * target) + '%';
    if (t < 1) requestAnimationFrame(tick);
    else scoreNum.textContent = target + '%';
  }
  requestAnimationFrame(tick);
}

updateUI();

// ── Drawing ───────────────────────────────────────────────────────
function pos(e) {
  const r = cDraw.getBoundingClientRect();
  const src = e.touches ? e.touches[0] : e;
  return { x: src.clientX - r.left, y: src.clientY - r.top };
}

function onDown(e) {
  e.preventDefault();
  if (scored) { clearAll(); return; }
  drawing = true; scored = false;
  const p = pos(e); p.t = performance.now();
  pts = [p];
  gD.clearRect(0, 0, W, H);
  hint.style.opacity = '0';
  scoreBox.style.opacity = '0';
  scoreBox.classList.remove('on', 'celebrate');
  cheatWarn.classList.remove('on');
}

function onMove(e) {
  if (!drawing) return;
  e.preventDefault();
  const p = pos(e); p.t = performance.now();
  pts.push(p);
  renderLive();
}

function onUp(e) {
  if (!drawing) return;
  drawing = false;
  gFx.clearRect(0, 0, W, H);
  if (pts.length < 30) {
    gD.clearRect(0, 0, W, H);
    drawBg(0);
    hint.style.opacity = '1';
    return;
  }
  evaluate();
}

// ── Math helpers ──────────────────────────────────────────────────
function getLiveMath() {
  const cx = W / 2, cy = H / 2;
  const radii = pts.map(p => Math.hypot(p.x - cx, p.y - cy));
  const rMean = radii.reduce((a, b) => a + b, 0) / radii.length;
  return { cx, cy, rMean, radii };
}

function lerpRgb(a, b, t) {
  return [
    Math.round(a[0] + (b[0] - a[0]) * t),
    Math.round(a[1] + (b[1] - a[1]) * t),
    Math.round(a[2] + (b[2] - a[2]) * t)
  ];
}

function liveSegColor(r, rMean) {
  if (rMean < 1) return [232, 220, 196];
  const dev = Math.abs(r - rMean) / rMean;
  if (dev < 0.04) return [80, 210, 120];
  if (dev < 0.10) return lerpRgb([80, 210, 120], [230, 200, 60], (dev - 0.04) / 0.06);
  if (dev < 0.20) return lerpRgb([230, 200, 60], [230, 70, 60], (dev - 0.10) / 0.10);
  return [230, 70, 60];
}

// ── Anti-cheat ────────────────────────────────────────────────────
const MIN_RADIUS_RATIO = 0.13;
const SLOW_PX_PER_MS  = 0.18;
const SLOW_PENALTY    = 0.45;
const TINY_PENALTY    = 0.30;

function getMinRadius() { return Math.min(W, H) * MIN_RADIUS_RATIO; }

function speedStats() {
  let totalDist = 0, totalTime = 0, slowSegs = 0;
  for (let i = 1; i < pts.length; i++) {
    const dx = pts[i].x - pts[i-1].x, dy = pts[i].y - pts[i-1].y;
    const dt = Math.max(0.1, pts[i].t - pts[i-1].t);
    const d = Math.hypot(dx, dy);
    const spd = d / dt;
    totalDist += d; totalTime += dt;
    if (spd < SLOW_PX_PER_MS && d > 1) slowSegs++;
  }
  const avgSpeed = totalTime > 0 ? totalDist / totalTime : 999;
  const slowRatio = pts.length > 1 ? slowSegs / (pts.length - 1) : 0;
  return { avgSpeed, slowRatio };
}

function cheatMessages(rMean, slowRatio) {
  const msgs = [];
  if (rMean < getMinRadius()) msgs.push('¡demasiado cerca del centro!');
  if (slowRatio > 0.25) msgs.push('¡vas demasiado lento!');
  return msgs;
}

// ── Render ────────────────────────────────────────────────────────
function renderLive() {
  gD.clearRect(0, 0, W, H);
  if (pts.length < 2) return;
  const { cx, cy, rMean, radii } = getLiveMath();

  gD.save();
  gD.lineCap = 'round'; gD.lineJoin = 'round';
  for (let i = 1; i < pts.length; i++) {
    const p = pts[i-1], q = pts[i];
    const [r, g, b] = liveSegColor(radii[i], rMean);
    gD.beginPath();
    gD.lineWidth = 6;
    gD.strokeStyle = `rgba(${r},${g},${b},0.92)`;
    gD.moveTo(p.x, p.y); gD.lineTo(q.x, q.y);
    gD.stroke();
  }
  gD.restore();

  if (pts.length > 20 && rMean > 10) {
    const { avgSpeed, slowRatio } = speedStats();
    const warns = cheatMessages(rMean, slowRatio);
    if (warns.length) {
      cheatWarn.innerHTML = warns.join('<br>');
      cheatWarn.classList.add('on');
    } else {
      cheatWarn.classList.remove('on');
    }

    const variance = radii.reduce((a, r) => a + (r - rMean) ** 2, 0) / radii.length;
    const cv = Math.sqrt(variance) / rMean;
    const roundness = Math.max(0, Math.min(100, 100 - cv * 195));
    const BUCKETS = 60; const covered = new Set();
    pts.forEach(p => {
      const a = Math.atan2(p.y - cy, p.x - cx);
      covered.add(Math.floor(((a + Math.PI) / (Math.PI * 2)) * BUCKETS));
    });
    const coverage = (covered.size / BUCKETS) * 100;
    let live = Math.max(1, Math.min(100, Math.round(roundness * .65 + coverage * .35)));
    if (rMean < getMinRadius()) live = Math.round(live * TINY_PENALTY);
    if (slowRatio > 0.25) live = Math.round(live * SLOW_PENALTY);
    const col = liveSegColor(rMean * (1 - (Math.sqrt(variance) / rMean) * .5), rMean);
    showLiveScore(live, col);
  }
}

function showLiveScore(val, rgb) {
  scoreNum.textContent = val + '%';
  scoreNum.style.color = `rgb(${rgb[0]},${rgb[1]},${rgb[2]})`;
  scoreBox.style.opacity = '1';
  scoreGrade.textContent = '';
  subRound.textContent = '';
  subCover.textContent = '';
  subClose.textContent = '';
}

function renderStroke(colorOverride, alphaOverride) {
  gD.clearRect(0, 0, W, H);
  if (pts.length < 2) return;
  const col = colorOverride || '232,220,196';
  gD.save();
  gD.lineCap = 'round'; gD.lineJoin = 'round';
  for (let i = 1; i < pts.length; i++) {
    const p = pts[i-1], q = pts[i];
    const a = alphaOverride !== undefined ? alphaOverride : 0.82;
    gD.beginPath();
    gD.lineWidth = 6;
    gD.strokeStyle = `rgba(${col},${a})`;
    gD.moveTo(p.x, p.y); gD.lineTo(q.x, q.y);
    gD.stroke();
  }
  gD.restore();
}

// ── Scoring ───────────────────────────────────────────────────────
function evaluate() {
  const cx = W / 2, cy = H / 2;
  const radii = pts.map(p => Math.hypot(p.x - cx, p.y - cy));
  const rMean = radii.reduce((a, b) => a + b, 0) / radii.length;

  if (rMean < 15) {
    hint.style.opacity = '1';
    gD.clearRect(0, 0, W, H);
    drawBg(0);
    return;
  }

  const variance = radii.reduce((a, r) => a + (r - rMean) ** 2, 0) / radii.length;
  const cv = Math.sqrt(variance) / rMean;
  const roundness = Math.max(0, Math.min(100, Math.round(100 - cv * 195)));

  const BUCKETS = 60;
  const covered = new Set();
  pts.forEach(p => {
    const ang = Math.atan2(p.y - cy, p.x - cx);
    covered.add(Math.floor(((ang + Math.PI) / (2 * Math.PI)) * BUCKETS));
  });
  const coverage = Math.round((covered.size / BUCKETS) * 100);

  const gapDist = Math.hypot(pts[pts.length-1].x - pts[0].x, pts[pts.length-1].y - pts[0].y);
  const closure = Math.max(0, Math.min(100, Math.round(100 - (gapDist / rMean) * 90)));

  let raw = Math.round(roundness * .55 + coverage * .30 + closure * .15);

  const { avgSpeed, slowRatio } = speedStats();
  const tooSmall = rMean < getMinRadius();
  const tooSlow  = slowRatio > 0.25;
  if (tooSmall) raw = Math.round(raw * TINY_PENALTY);
  if (tooSlow)  raw = Math.round(raw * SLOW_PENALTY);
  const score = Math.max(1, Math.min(100, raw));

  if (score > bestScore && !tooSmall && !tooSlow) {
    bestScore = score;
    localStorage.setItem('pCircle_best', bestScore);
  }
  hist.push(score);
  if (hist.length > 20) hist.shift();
  localStorage.setItem('pCircle_hist', JSON.stringify(hist));
  updateUI();

  lastR = rMean;
  cheatWarn.classList.remove('on');
  showResult(score, roundness, coverage, closure, rMean, tooSmall, tooSlow);
}

// ── Show result ───────────────────────────────────────────────────
function showResult(score, round, cov, cl, r, tooSmall, tooSlow) {
  scored = true;
  const cx = W / 2, cy = H / 2;

  renderStroke(hueToRgb(score), .82);
  drawBg(r);

  subRound.textContent = round + '%';
  subCover.textContent = cov + '%';
  subClose.textContent = cl + '%';

  if (tooSmall && tooSlow) scoreGrade.textContent = '¡trampa doble!';
  else if (tooSmall)       scoreGrade.textContent = '¡muy cerca del centro! penalizado';
  else if (tooSlow)        scoreGrade.textContent = '¡demasiado lento! penalizado';
  else                     scoreGrade.textContent = grade(score);

  scoreNum.style.color = (tooSmall || tooSlow) ? '#e85555' : hue(score);
  scoreBox.style.opacity = '1';
  scoreBox.classList.add('on');

  animNum(score, 800);

  const cheat = tooSmall || tooSlow;

  if (score >= 90 && !cheat) {
    triggerCelebration(cx, cy, r, score);
  } else if (score >= 80 && !cheat) {
    spawnParticles(cx, cy, score);
  }

  playTone(score);
  setTimeout(() => { retryHint.classList.add('on'); }, score >= 90 ? 1800 : 700);
}

function clearAll() {
  scored = false; lastR = 0;
  scoreBox.classList.remove('on', 'celebrate');
  scoreBox.style.opacity = '0';
  retryHint.classList.remove('on');
  cheatWarn.classList.remove('on');
  gD.clearRect(0, 0, W, H);
  gFx.clearRect(0, 0, W, H);
  rings = [];
  drawBg(0);
  hint.style.opacity = '1';
  pts = [];
}

// ── Celebration (90%+) ────────────────────────────────────────────
let rings = [];
let celebId = null;

function triggerCelebration(cx, cy, r, score) {
  // 1) CSS pop on score number
  setTimeout(() => {
    scoreBox.classList.add('celebrate');
  }, 200);

  // 2) Expanding shockwave rings from the circle
  rings = [];
  const colors = score >= 99
    ? ['255,230,80', '255,200,50', '255,255,150']
    : ['196,170,120', '109,189,149', '255,208,74'];

  for (let i = 0; i < 4; i++) {
    rings.push({
      cx, cy,
      r: r,
      maxR: r + 180 + i * 40,
      col: colors[i % colors.length],
      delay: i * 120,
      startTime: performance.now() + i * 120,
      dur: 1000
    });
  }

  // 3) Big burst of particles from the circle perimeter
  spawnPerimeterParticles(cx, cy, r, score);

  if (!celebId) loopCelebration();
}

function spawnPerimeterParticles(cx, cy, r, score) {
  const n = score >= 95 ? 90 : 60;
  for (let i = 0; i < n; i++) {
    const ang = (i / n) * Math.PI * 2;
    const jitter = (Math.random() - .5) * .3;
    const launchAng = ang + jitter;
    const spd = Math.random() * 4 + 2;
    parts.push({
      x: cx + Math.cos(ang) * r,
      y: cy + Math.sin(ang) * r,
      vx: Math.cos(launchAng) * spd,
      vy: Math.sin(launchAng) * spd,
      life: 1,
      decay: .008 + Math.random() * .008,
      size: Math.random() * 3 + 1,
      col: hue(score)
    });
  }
  if (!animId) loopParticles();
}

function loopCelebration() {
  const now = performance.now();
  gFx.clearRect(0, 0, W, H);

  // Draw rings
  rings = rings.filter(ring => now - ring.startTime < ring.dur);
  rings.forEach(ring => {
    const elapsed = Math.max(0, now - ring.startTime);
    const t = elapsed / ring.dur;
    const ease = 1 - Math.pow(1 - t, 2);
    const curR = ring.r + (ring.maxR - ring.r) * ease;
    const alpha = Math.max(0, (1 - t) * 0.6);

    gFx.save();
    gFx.beginPath();
    gFx.arc(ring.cx, ring.cy, curR, 0, Math.PI * 2);
    gFx.strokeStyle = `rgba(${ring.col},${alpha})`;
    gFx.lineWidth = 3 * (1 - t) + 0.5;
    gFx.stroke();
    gFx.restore();
  });

  // Draw particles on same frame
  parts = parts.filter(p => p.life > 0);
  parts.forEach(p => {
    p.x += p.vx; p.y += p.vy;
    p.vy += .07; p.vx *= .98;
    p.life -= p.decay;
    gFx.globalAlpha = Math.max(0, p.life);
    gFx.fillStyle = p.col;
    gFx.beginPath();
    gFx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    gFx.fill();
  });
  gFx.globalAlpha = 1;

  if (rings.length > 0 || parts.length > 0) {
    celebId = requestAnimationFrame(loopCelebration);
  } else {
    celebId = null;
    animId = null;
    gFx.clearRect(0, 0, W, H);
  }
}

// ── Particles (80–89%) ────────────────────────────────────────────
let parts = [], animId = null;

function spawnParticles(cx, cy, score) {
  const n = 35;
  const col = hue(score);
  for (let i = 0; i < n; i++) {
    const ang = Math.random() * Math.PI * 2;
    const spd = Math.random() * 3.5 + .8;
    parts.push({
      x: cx, y: cy,
      vx: Math.cos(ang) * spd,
      vy: Math.sin(ang) * spd - 1.2,
      life: 1, decay: .013 + Math.random() * .008,
      size: Math.random() * 2.4 + .6, col
    });
  }
  if (!animId) loopParticles();
}

function loopParticles() {
  gFx.clearRect(0, 0, W, H);
  parts = parts.filter(p => p.life > 0);
  parts.forEach(p => {
    p.x += p.vx; p.y += p.vy; p.vy += .09; p.vx *= .98; p.life -= p.decay;
    gFx.globalAlpha = Math.max(0, p.life);
    gFx.fillStyle = p.col;
    gFx.beginPath();
    gFx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    gFx.fill();
  });
  gFx.globalAlpha = 1;
  if (parts.length > 0) animId = requestAnimationFrame(loopParticles);
  else { animId = null; gFx.clearRect(0, 0, W, H); }
}

// ── Sound ─────────────────────────────────────────────────────────
function playTone(score) {
  try {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const ac = audioCtx;
    const now = ac.currentTime;
    const f = 180 + score * 5.5;

    function tone(freq, start, dur, vol) {
      const o = ac.createOscillator();
      const g = ac.createGain();
      o.connect(g); g.connect(ac.destination);
      o.type = 'sine'; o.frequency.value = freq;
      g.gain.setValueAtTime(vol, start);
      g.gain.exponentialRampToValueAtTime(.001, start + dur);
      o.start(start); o.stop(start + dur);
    }

    tone(f,        now,       .6,  .22);
    tone(f * 1.25, now + .12, .5,  .12);
    if (score >= 90) {
      tone(f * 1.5,  now + .3,  .4,  .10);
      tone(f * 2,    now + .5,  .35, .07);
      tone(f * 2.5,  now + .8,  .3,  .05);
    }
    if (score >= 98) {
      tone(f * 3,    now + 1.1, .3,  .06);
      tone(f * 4,    now + 1.4, .25, .04);
    }
  } catch(e) {}
}

// ── Events ────────────────────────────────────────────────────────
cDraw.addEventListener('mousedown', onDown);
cDraw.addEventListener('mousemove', onMove);
window.addEventListener('mouseup',  onUp);
cDraw.addEventListener('touchstart', onDown, { passive: false });
cDraw.addEventListener('touchmove',  onMove, { passive: false });
cDraw.addEventListener('touchend',   onUp,   { passive: false });
window.addEventListener('resize', resize);

resize();
