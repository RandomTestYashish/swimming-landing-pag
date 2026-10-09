// Yashish — portfolio film. 1920×1080, 24 fps, 360 frames.
// Every frame is a pure function of its index: renderFrame(f) draws frame f.
// Timings and scene numbering follow docs/portfolio_storyboard.md, snapped to the
// 120 BPM score in film/music.py (1 beat = 12 frames, 1 eighth = 6 frames).

const W = 1920, H = 1080, FPS = 24, TOTAL = 360;

const C = {
  ink: '#050404', paper: '#FFF5F8', type: '#FBF3F7',
  coral: '#E4515A', amber: '#F19C50', plum: '#8E2350', lilac: '#C7A8FF',
  red: '#D6313C', sig: '#FF4A1C', blush: '#F7C6D9',
};
const FONT = '"Inter Display", "Inter", sans-serif';
const CAP = 0.727; // Inter cap height, em

const canvas = document.getElementById('film');
const ctx = canvas.getContext('2d');

// ---------------------------------------------------------------- utilities

const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const lerp = (a, b, t) => a + (b - a) * t;
const prog = (f, a, b) => clamp((f - a) / (b - a));
const expoOut = (t) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t));
const expoIn = (t) => (t <= 0 ? 0 : Math.pow(2, 10 * (t - 1)));
const TAU = Math.PI * 2;
const rad = (d) => (d * Math.PI) / 180;

function cubicBezier(x1, y1, x2, y2) {
  const bx = (t) => 3 * x1 * t * (1 - t) ** 2 + 3 * x2 * t * t * (1 - t) + t ** 3;
  const by = (t) => 3 * y1 * t * (1 - t) ** 2 + 3 * y2 * t * t * (1 - t) + t ** 3;
  return (x) => {
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    let lo = 0, hi = 1, t = x;
    for (let i = 0; i < 30; i++) {
      t = (lo + hi) / 2;
      if (bx(t) < x) lo = t; else hi = t;
    }
    return by(t);
  };
}
const inOut = cubicBezier(0.7, 0, 0.2, 1);

function rng(seed) {
  return () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function rgba(hex, a) {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
}

function makeCanvas(w, h) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  return c;
}

// Tracking per style guide: −3% at display sizes, −1.5% at small sizes.
function setFont(c, size, weight = 900) {
  c.font = `${weight} ${size}px ${FONT}`;
  const k = size >= 200 ? -0.03 : size <= 60 ? -0.015 : -0.025;
  c.letterSpacing = `${(k * size).toFixed(2)}px`;
}

function textWidth(c, s) {
  return c.measureText(s).width;
}

// Size at which `s` spans `width` px.
function fitSize(c, s, width, weight = 900) {
  setFont(c, 100, weight);
  return (100 * width) / textWidth(c, s);
}

// Glyph x-offsets (relative to word start) so letters can be drawn one by one.
function layout(c, word) {
  const xs = [];
  // Each glyph sits where the kerned run up to and including it ends, minus its own advance.
  for (let i = 0; i < word.length; i++) xs.push(textWidth(c, word.slice(0, i + 1)) - textWidth(c, word[i]));
  return { xs, width: textWidth(c, word) };
}

// Impact on a hard cut: scale jumps up by `amt` and settles over 5 frames.
const punch = (f, at, amt = 0.06) => (f < at ? 1 : 1 + amt * (1 - expoOut(prog(f, at, at + 5))));

function withScale(s, cx, cy, fn) {
  ctx.save();
  ctx.translate(cx, cy); ctx.scale(s, s); ctx.translate(-cx, -cy);
  fn();
  ctx.restore();
}

function blob(c, cx, cy, r, color, a) {
  const g = c.createRadialGradient(cx, cy, 0, cx, cy, r);
  g.addColorStop(0, rgba(color, a));
  g.addColorStop(1, rgba(color, 0));
  c.fillStyle = g;
  c.fillRect(cx - r, cy - r, r * 2, r * 2);
}

function monogram(c, cx, cy, r, rot = 0) {
  c.save();
  c.translate(cx, cy); c.rotate(rot);
  c.fillStyle = C.sig;
  c.beginPath(); c.arc(0, 0, r, 0, TAU); c.fill();
  setFont(c, r * 1.25, 900);
  c.fillStyle = '#FFFFFF';
  c.textAlign = 'center';
  c.fillText('Y', 0, r * 1.25 * CAP * 0.5);
  c.restore();
}

// ------------------------------------------------------------ shared fields

// Diagonal warm gradient with drifting glows — the stand-in for photography.
function gradientField(c, w, h, v, t) {
  const g = c.createLinearGradient(0, 0, w, h);
  g.addColorStop(0, v.a); g.addColorStop(1, v.b);
  c.fillStyle = g;
  c.fillRect(0, 0, w, h);
  const m = Math.max(w, h);
  blob(c, w * (0.72 + 0.08 * Math.sin(t * 1.3)), h * (0.22 + 0.06 * Math.cos(t * 1.1)), m * 0.55, v.glow, 0.55);
  blob(c, w * (0.15 + 0.05 * Math.cos(t)), h * (0.85 + 0.04 * Math.sin(t * 1.7)), m * 0.5, v.shade, 0.45);
}

const CARD_FILLS = {
  role:        { a: C.coral,   b: C.amber,   glow: C.lilac, shade: C.plum },
  strategy:    { a: '#B58CF0', b: C.coral,   glow: '#E9DBFF', shade: C.plum },
  experience:  { a: '#E86A4E', b: '#F7B45E', glow: '#FFE0B8', shade: C.coral },
  interaction: { a: C.coral,   b: '#B02545', glow: C.amber, shade: C.plum },
};

// Glossy pills and rings floating over a gradient — the hero "still life".
const HERO = {
  airtel: { a: C.coral, b: '#9E2148', glow: C.amber, shade: C.plum, shapes: [C.amber, C.lilac, C.plum, '#FF8A7A'], seed: 11 },
  wynk:   { a: '#A77BE8', b: C.plum, glow: C.blush, shade: '#3D1240', shapes: [C.coral, C.lilac, C.amber, '#F2B8FF'], seed: 23 },
  paytm:  { a: C.amber, b: C.coral, glow: '#FFE2B0', shade: C.plum, shapes: [C.plum, C.lilac, C.red, '#FFD08A'], seed: 37 },
};
const heroShapes = {};
for (const [k, v] of Object.entries(HERO)) {
  const r = rng(v.seed);
  heroShapes[k] = Array.from({ length: 18 }, (_, i) => ({
    kind: r() < 0.5 ? 'ring' : 'pill',
    x: i < 4 ? W / 2 + (r() - 0.5) * 420 : r() * W,
    y: i < 4 ? H * (0.15 + 0.25 * i) + r() * 80 : r() * H,
    size: 90 + r() * 220,
    rot: r() * TAU,
    spin: (r() - 0.5) * 0.5,
    drift: 20 + r() * 50,
    depth: r(),
    color: v.shapes[i % v.shapes.length],
  })).sort((p, q) => p.depth - q.depth);
}

function heroField(c, key, t) {
  const v = HERO[key];
  gradientField(c, W, H, v, t);
  for (const s of heroShapes[key]) {
    const x = s.x + Math.sin(t * 0.8 + s.rot) * s.drift;
    const y = s.y - t * s.drift * 0.9;
    const size = s.size * (0.6 + s.depth * 0.7);
    c.save();
    c.filter = s.depth < 0.35 ? `blur(${(8 * (0.35 - s.depth) / 0.35 + 2).toFixed(1)}px)` : 'none';
    c.globalAlpha = 0.55 + s.depth * 0.45;
    c.translate(x, y); c.rotate(s.rot + t * s.spin);
    c.shadowColor = rgba(C.ink, 0.35); c.shadowBlur = 40 * s.depth; c.shadowOffsetY = 18 * s.depth;
    if (s.kind === 'ring') {
      const g = c.createLinearGradient(-size, -size, size, size);
      g.addColorStop(0, '#FFFFFF'); g.addColorStop(0.35, s.color); g.addColorStop(1, rgba(C.ink, 0.9));
      c.strokeStyle = g; c.lineWidth = size * 0.28;
      c.beginPath(); c.arc(0, 0, size * 0.55, 0, TAU); c.stroke();
      c.shadowColor = 'transparent';
      c.strokeStyle = 'rgba(255,255,255,0.55)'; c.lineWidth = size * 0.04;
      c.beginPath(); c.arc(0, 0, size * 0.6, rad(200), rad(250)); c.stroke();
    } else {
      const lw = size * 1.3, lh = size * 0.42;
      const g = c.createLinearGradient(0, -lh / 2, 0, lh / 2);
      g.addColorStop(0, '#FFFFFF'); g.addColorStop(0.25, s.color); g.addColorStop(1, rgba(C.ink, 0.85));
      c.fillStyle = g;
      c.beginPath(); c.roundRect(-lw / 2, -lh / 2, lw, lh, lh / 2); c.fill();
      c.shadowColor = 'transparent';
      c.fillStyle = 'rgba(255,255,255,0.45)';
      c.beginPath(); c.roundRect(-lw / 2 + lh * 0.4, -lh * 0.36, lw - lh * 0.8, lh * 0.12, lh * 0.06); c.fill();
    }
    c.restore();
  }
}

// ------------------------------------------------------------------- cards

const cardBuf = makeCanvas(1200, 1200);
const yawBuf = makeCanvas(W, H), yawCtx = yawBuf.getContext('2d');
const cardCtx = cardBuf.getContext('2d');

// Paints a card into the shared buffer: rounded clip, fill, optional content, inner edge.
function paintCard(w, h, fill, content) {
  const c = cardCtx;
  c.setTransform(1, 0, 0, 1, 0, 0);
  c.clearRect(0, 0, cardBuf.width, cardBuf.height);
  c.save();
  c.beginPath(); c.roundRect(0, 0, w, h, Math.min(w, h) * 0.06); c.clip();
  fill(c, w, h);
  if (content) content(c, w, h);
  c.restore();
  c.strokeStyle = 'rgba(255,255,255,0.35)'; c.lineWidth = 1.5;
  c.beginPath(); c.roundRect(0.75, 0.75, w - 1.5, h - 1.5, Math.min(w, h) * 0.06); c.stroke();
}

// Draws the buffered card centred at (cx, cy), with an optional yaw (fake 3D, vertical strips).
function placeCard(w, h, cx, cy, yawDeg = 0, alpha = 1, blur = 0) {
  ctx.save();
  ctx.globalAlpha = alpha;
  if (blur > 0.2) ctx.filter = `blur(${blur.toFixed(1)}px)`;
  if (Math.abs(yawDeg) < 0.01) {
    ctx.drawImage(cardBuf, 0, 0, w, h, cx - w / 2, cy - h / 2, w, h);
  } else {
    const th = rad(yawDeg), D = w * 2.2, N = 96;
    const proj = (u) => {
      const x3 = (u - 0.5) * w, z = x3 * Math.sin(th), s = D / (D + z);
      return { x: x3 * Math.cos(th) * s, s };
    };
    yawCtx.clearRect(0, 0, W, H);
    for (let i = 0; i < N; i++) {
      const a = proj(i / N), b = proj((i + 1) / N);
      const sh = h * a.s;
      yawCtx.drawImage(cardBuf, (i / N) * w, 0, w / N, h, cx + a.x, cy - sh / 2, b.x - a.x + 1, sh);
    }
    ctx.drawImage(yawBuf, 0, 0);
  }
  ctx.restore();
}

// --------------------------------------------------------- scene 01 Ignite

const DASH_COLORS = [C.coral, C.red, C.plum, C.lilac, C.amber, C.blush, C.ink, C.coral, C.red, C.blush];
const dashes = (() => {
  const r = rng(7);
  return Array.from({ length: 420 }, () => ({
    a: r() * TAU, u: r(), w: 8 + r() * 9, len: 0.6 + r() * 0.8,
    color: DASH_COLORS[Math.floor(r() * DASH_COLORS.length)],
  }));
})();

function scene01(f) {
  const discR = 0.12 * H, cx = W / 2, cy = H / 2;
  ctx.fillStyle = C.paper; ctx.fillRect(0, 0, W, H);

  // Iris flood: black grows out of the disc over 3 frames.
  if (f >= 10) {
    const r = lerp(discR, Math.hypot(cx, cy) + 10, prog(f, 9, 12));
    ctx.fillStyle = C.ink;
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, TAU); ctx.fill();
  }

  // Dashes: rush inward (hole closes), then stream outward and rotate.
  if (f >= 5) {
    const t = (f - 5) / FPS;
    const hole = f < 8 ? lerp(1150, 0, prog(f, 5, 8) ** 2) : 0;
    const rot = rad(6) * prog(f, 13, 23);
    const rMin = 115, rMax = 1250;
    for (const d of dashes) {
      const q = (d.u + t * 0.55) % 1;
      const r = rMin + (rMax - rMin) * q ** 1.6;
      if (r < hole) continue;
      const len = (18 + 120 * q) * d.len;
      const ang = d.a + rot;
      const ux = Math.cos(ang), uy = Math.sin(ang);
      const alpha = clamp(q * 8);
      ctx.lineCap = 'butt';
      ctx.strokeStyle = rgba(d.color, 0.25 * alpha); ctx.lineWidth = d.w * 1.3;
      ctx.beginPath(); ctx.moveTo(cx + ux * (r - len * 0.8), cy + uy * (r - len * 0.8)); ctx.lineTo(cx + ux * (r + len), cy + uy * (r + len)); ctx.stroke();
      ctx.strokeStyle = rgba(d.color, alpha); ctx.lineWidth = d.w;
      ctx.beginPath(); ctx.moveTo(cx + ux * r, cy + uy * r); ctx.lineTo(cx + ux * (r + len), cy + uy * (r + len)); ctx.stroke();
    }
  }

  if (f < 8) {
    monogram(ctx, cx, cy, 0.035 * H);
  } else {
    const r = f === 8 ? lerp(0.035 * H, discR, 0.6) : discR;
    ctx.fillStyle = C.ink;
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, TAU); ctx.fill();
    withScale(punch(f, 8, 0.12), cx, cy, () => {
      setFont(ctx, 80, 900);
      ctx.fillStyle = C.type; ctx.textAlign = 'center';
      ctx.fillText('Meet', cx, cy + 80 * CAP * 0.5);
    });
  }
}

// ------------------------------------------------------- scene 02 Identity

function scene02(f) {
  const cx = W / 2, cy = H / 2;

  // Whisper: tiny lowercase name pushing in; letters drop from the left.
  if (f <= 35) {
    const s = lerp(1, 1.35, prog(f, 24, 35));
    withScale(s, cx, cy, () => {
      setFont(ctx, 32, 900);
      const word = 'yashish', L = layout(ctx, word);
      const drop = f >= 35 ? 2 : f >= 34 ? 1 : 0;
      ctx.fillStyle = C.type; ctx.textAlign = 'left';
      for (let i = drop; i < word.length; i++) ctx.fillText(word[i], cx - L.width / 2 + L.xs[i], cy + 32 * CAP * 0.5);
    });
    return;
  }

  // Stack: "Yashish" lands first (bottom-right), lines above type on at 1 char/frame.
  const S = Math.min(fitSize(ctx, 'Yashish', W * 0.9), H * 0.4);
  const step = 0.82 * S, margin = W * 0.02;
  const blockH = 2 * step + CAP * S + 0.22 * S;
  const b1 = cy - blockH / 2 + CAP * S;
  const lines = [
    { text: 'Hello,', x: margin, y: b1, align: 'left', start: 40 },
    { text: "I'm", x: margin, y: b1 + step, align: 'left', start: 46 },
    { text: 'Yashish', x: W - margin, y: b1 + 2 * step, align: 'right', start: 36 },
  ];
  const push = lerp(1, 1.02, prog(f, 49, 64)) * punch(f, 36, 0.08);
  const exitStart = [68, 66, 64]; // bottom line blurs first

  withScale(push, cx, cy, () => {
    setFont(ctx, S, 900);
    lines.forEach((ln, i) => {
      if (f < ln.start) return;
      const n = ln.start === 36 ? ln.text.length : Math.min(ln.text.length, f - ln.start + 1);
      const p = prog(f, exitStart[i], exitStart[i] + 7);
      if (p >= 1) return;
      ctx.save();
      if (p > 0) ctx.filter = `blur(${(36 * p).toFixed(1)}px)`;
      ctx.globalAlpha = (1 - p) ** 1.5;
      ctx.fillStyle = C.type; ctx.textAlign = ln.align;
      const shown = ln.text.slice(0, n);
      if (ln.align === 'right') ctx.fillText(shown, ln.x, ln.y);
      else ctx.fillText(shown, ln.x, ln.y);
      ctx.restore();
    });
  });
}

// ----------------------------------------------------------- scene 03 Role

const ROLE_SEQ = [
  { key: 'strategy', word: 'Strategy.', at: 90 },
  { key: 'experience', word: 'Experience.', at: 96 },
  { key: 'interaction', word: 'Interaction.', at: 102 },
];
const PORTRAIT_H = 0.76 * H, PORTRAIT_W = PORTRAIT_H * 9 / 16;

function cardWord(word, w) {
  return Math.min(110, fitSize(cardCtx, word, w * 0.86));
}

function paintRoleCard(key, w, h, f, opts = {}) {
  const t = f / FPS;
  paintCard(w, h, (c) => gradientField(c, w, h, CARD_FILLS[key], t), (c) => {
    c.fillStyle = C.type;
    if (key === 'role') {
      const lines = ['Lead', 'Product', 'Designer'];
      const size = fitSize(c, 'Designer', w * 0.82);
      setFont(c, size, 900);
      c.textAlign = 'left';
      let budget = opts.chars ?? Infinity;
      lines.forEach((ln, i) => {
        const n = Math.max(0, Math.min(ln.length, budget));
        budget -= ln.length;
        c.fillText(ln.slice(0, n), w * 0.1, h * 0.1 + size * CAP + i * size * 0.92);
      });
    } else if (!opts.noWord) {
      const word = ROLE_SEQ.find((r) => r.key === key).word;
      const size = cardWord(word, w);
      setFont(c, size, 900);
      c.textAlign = 'center';
      c.fillText(word, w / 2, h / 2 + size * CAP * 0.5);
    }
  });
}

function scene03(f) {
  const cx = W / 2, cy = H / 2;

  // Emerge from blur and grow.
  if (f < 90) {
    const ph = lerp(0.30 * H, PORTRAIT_H, expoOut(prog(f, 68, 80)));
    const pw = ph * 9 / 16;
    const chars = f < 78 ? 0 : (f - 78 + 1) * 2;
    paintRoleCard('role', pw, ph, f, { chars });
    placeCard(pw, ph, cx, cy, 0, prog(f, 67, 71), lerp(30, 0, prog(f, 68, 77)));
    return;
  }

  // Yaw swaps on the beat.
  for (let k = 0; k < ROLE_SEQ.length; k++) {
    const s = ROLE_SEQ[k].at, next = ROLE_SEQ[k + 1]?.at ?? Infinity;
    if (f >= next) continue;
    const p = inOut(prog(f, s, s + 6));
    const prevKey = k === 0 ? 'role' : ROLE_SEQ[k - 1].key;
    if (p < 1) {
      paintRoleCard(ROLE_SEQ[k].key, PORTRAIT_W, PORTRAIT_H, f);
      placeCard(PORTRAIT_W, PORTRAIT_H, cx + (1 - p) * W * 0.42, cy, -40 * (1 - p), Math.min(1, p * 2));
      paintRoleCard(prevKey, PORTRAIT_W, PORTRAIT_H, f);
      placeCard(PORTRAIT_W, PORTRAIT_H, cx - p * W * 0.42, cy, 40 * p, 1 - p * p);
      return;
    }
    if (k < ROLE_SEQ.length - 1 || f < 108) {
      paintRoleCard(ROLE_SEQ[k].key, PORTRAIT_W, PORTRAIT_H, f);
      placeCard(PORTRAIT_W, PORTRAIT_H, cx, cy);
      return;
    }
  }

  // Interaction: portrait → landscape, the word breaks out of the frame, then the group exits bottom-right.
  const m = expoOut(prog(f, 108, 114));
  const w = lerp(PORTRAIT_W, W * 0.62, m), h = lerp(PORTRAIT_H, W * 0.62 * 9 / 16, m);
  const e = expoIn(prog(f, 112, 119));
  const gs = lerp(1, 0.7, e);
  const gx = cx + e * W * 0.75, gy = cy + e * H * 0.7;
  const word = 'Interaction.';
  const startSize = cardWord(word, PORTRAIT_W);
  const size = lerp(startSize, 300, m);
  const wordY = lerp(cy + startSize * CAP * 0.5, cy - h / 2 + size * CAP * 0.15, m);

  paintRoleCard('interaction', w, h, f, { noWord: true });
  ctx.save();
  ctx.translate(gx, gy); ctx.scale(gs, gs); ctx.translate(-cx, -cy);
  placeCard(w, h, cx, cy);
  setFont(ctx, size, 900);
  ctx.fillStyle = C.type; ctx.textAlign = 'center';
  ctx.fillText(word, cx, wordY);
  ctx.restore();
}

// ----------------------------------------------------- scene 04 Philosophy

const PHIL = [
  { word: 'Making', at: 120 },
  { word: 'complexity', at: 132 },
  { word: 'feel', at: 144 },
  { word: 'simple.', at: 156 },
];
const PHIL_SIZE = 300;

// For each word after the first: which letters carry over from the previous word, and when the rest blink.
const philPlan = (() => {
  const r = rng(99);
  return PHIL.map((cur, k) => {
    if (k === 0) return null;
    const prev = PHIL[k - 1].word, next = cur.word;
    const used = new Set();
    const from = [...next].map((ch) => {
      for (let i = 0; i < prev.length; i++) {
        if (!used.has(i) && prev[i].toLowerCase() === ch.toLowerCase() && /[a-z]/i.test(ch)) { used.add(i); return i; }
      }
      return -1;
    });
    return {
      from,
      kept: used,
      vanish: [...prev].map(() => Math.floor(r() * 3)),
      appear: [...next].map(() => Math.floor(r() * 3)),
    };
  });
})();

function scene04(f) {
  const cx = W / 2, cy = H / 2;
  let k = PHIL.length - 1;
  while (f < PHIL[k].at) k--;
  setFont(ctx, PHIL_SIZE, 900);
  const base = cy + PHIL_SIZE * CAP * 0.5;
  const cur = PHIL[k], L = layout(ctx, cur.word), x0 = cx - L.width / 2;
  const grow = cur.word === 'simple.' ? lerp(1, 1.15, expoOut(prog(f, 162, 172))) : 1;
  const color = f <= 121 || (cur.word === 'simple.' && f >= 162) ? C.sig : C.type;
  const local = f - cur.at;
  ctx.textAlign = 'left';

  withScale(grow * punch(f, cur.at, 0.08), cx, cy, () => {
    ctx.fillStyle = color;
    const plan = philPlan[k];
    if (!plan || local >= 3) {
      for (let i = 0; i < cur.word.length; i++) ctx.fillText(cur.word[i], x0 + L.xs[i], base);
      return;
    }
    // Scramble: outgoing letters blink out, incoming snap in, shared letters glide.
    const prev = PHIL[k - 1].word, P = layout(ctx, prev), px0 = cx - P.width / 2;
    for (let i = 0; i < prev.length; i++) {
      if (plan.kept.has(i) || local >= plan.vanish[i]) continue;
      ctx.fillText(prev[i], px0 + P.xs[i], base);
    }
    const g = expoOut(prog(local, -1, 2));
    for (let i = 0; i < cur.word.length; i++) {
      const j = plan.from[i];
      if (j >= 0) ctx.fillText(cur.word[i], lerp(px0 + P.xs[j], x0 + L.xs[i], g), base);
      else if (local >= plan.appear[i]) ctx.fillText(cur.word[i], x0 + L.xs[i], base);
    }
  });
}

// ----------------------------------------------------- scene 05 Experience

const heroA = makeCanvas(W, H), heroACtx = heroA.getContext('2d');
const heroB = makeCanvas(W, H), heroBCtx = heroB.getContext('2d');

function coverInto(img, x, y, w, h, radius) {
  ctx.save();
  ctx.beginPath(); ctx.roundRect(x, y, w, h, radius); ctx.clip();
  const s = Math.max(w / W, h / H);
  ctx.drawImage(img, x + w / 2 - (W * s) / 2, y + h / 2 - (H * s) / 2, W * s, H * s);
  ctx.restore();
}

function edge(x, y, w, h, radius) {
  ctx.strokeStyle = 'rgba(255,255,255,0.35)'; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.roundRect(x, y, w, h, radius); ctx.stroke();
}

function heroLines(lines, size, cx, cy, clip) {
  ctx.save();
  if (clip) { ctx.beginPath(); ctx.roundRect(...clip); ctx.clip(); }
  setFont(ctx, size, 900);
  ctx.fillStyle = C.type; ctx.textAlign = 'center';
  const step = size * 0.86;
  const b1 = cy - ((lines.length - 1) * step) / 2 + size * CAP * 0.5;
  lines.forEach((ln, i) => ctx.fillText(ln, cx, b1 + i * step));
  ctx.restore();
}

function scene05(f) {
  const cx = W / 2, cy = H / 2, t = f / FPS;
  const cw = PORTRAIT_W, ch = PORTRAIT_H, cr = cw * 0.06;

  // Airtel Digital: full-bleed hero, then zoom out into a card.
  if (f < 204) {
    heroField(heroACtx, 'airtel', t);
    const p = expoOut(prog(f, 198, 204));
    const push = lerp(1, 1.03, prog(f, 180, 198)) * punch(f, 180, 0.05);
    const w = lerp(W, cw, p), h = lerp(H, ch, p), x = cx - w / 2, y = cy - h / 2;
    withScale(push, cx, cy, () => {
      coverInto(heroA, x, y, w, h, lerp(0, cr, p));
      if (p > 0) edge(x, y, w, h, lerp(0, cr, p));
      const big = 380, small = fitSize(ctx, 'Digital', cw * 0.84);
      heroLines(['Airtel', 'Digital'], lerp(big, small, p), cx, cy, [x, y, w, h, lerp(0, cr, p)]);
    });
    return;
  }

  // Wynk Music: the card holds the field, the name flanks it.
  const push = (f < 222 ? lerp(1, 1.02, prog(f, 204, 222)) : 1.02) * punch(f, 204, 0.05);
  const slide = inOut(prog(f, 222, 228));
  heroField(heroACtx, 'wynk', t);

  if (f >= 225) {
    heroField(heroBCtx, 'paytm', t);
    const bgPush = lerp(1, 1.025, prog(f, 225, 239));
    withScale(bgPush, cx, cy, () => ctx.drawImage(heroB, 0, 0));
  }

  const dx = -slide * W * 0.62;
  withScale(push, cx, cy, () => {
    const x = cx - cw / 2 + dx, y = cy - ch / 2;
    if (slide < 1) {
      coverInto(heroA, x, y, cw, ch, cr);
      edge(x, y, cw, ch, cr);
      setFont(ctx, 120, 900);
      ctx.fillStyle = C.type;
      const base = cy + 120 * CAP * 0.5, gap = W * 0.035;
      ctx.textAlign = 'right'; ctx.fillText('Wynk', x - gap, base);
      if (f >= 206) { ctx.textAlign = 'left'; ctx.fillText('Music', x + cw + gap, base); }
    }
  });

  // Paytm: a new card slides in over its own field.
  if (f >= 222) {
    const x = cx - cw / 2 + (1 - slide) * W * 0.62, y = cy - ch / 2;
    const hold = lerp(1, 1.02, prog(f, 228, 239)) * punch(f, 228, 0.04);
    withScale(hold, cx, cy, () => {
      ctx.save();
      ctx.shadowColor = rgba(C.ink, 0.45); ctx.shadowBlur = 60; ctx.shadowOffsetY = 24;
      ctx.fillStyle = C.ink;
      ctx.beginPath(); ctx.roundRect(x, y, cw, ch, cr); ctx.fill();
      ctx.restore();
      ctx.save();
      ctx.beginPath(); ctx.roundRect(x, y, cw, ch, cr); ctx.clip();
      ctx.translate(x, y + ch * 0.58);
      gradientField(ctx, cw, ch * 0.42, { a: C.coral, b: C.amber, glow: C.blush, shade: C.plum }, t);
      ctx.restore();
      edge(x, y, cw, ch, cr);
      const size = fitSize(ctx, 'Paytm', cw * 0.78);
      setFont(ctx, size, 900);
      ctx.fillStyle = C.type; ctx.textAlign = 'center';
      ctx.fillText('Paytm', x + cw / 2, y + ch * 0.29 + size * CAP * 0.5);
    });
  }
}

// ---------------------------------------------------------- scene 06 Craft

const CRAFT = [
  { lines: ['Product', 'thinking'], at: 240, state: 'petals' },
  { lines: ['Interaction'], at: 252, state: 'circles' },
  { lines: ['Visual', 'storytelling'], at: 264, state: 'pills' },
  { lines: ['Motion'], at: 276, state: 'iris' },
];

function rays(cx, cy, n, rot, color, a, width) {
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < n; i++) {
    const ang = rot + (i / n) * TAU;
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, 1300);
    g.addColorStop(0, rgba(color, 0)); g.addColorStop(0.25, rgba(color, a)); g.addColorStop(1, rgba(color, a * 0.4));
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, 1300, ang - rad(width / 2), ang + rad(width / 2)); ctx.closePath(); ctx.fill();
  }
  ctx.restore();
}

function petal(cx, cy, ang, r, rx, ry, c0, c1) {
  ctx.save();
  ctx.translate(cx + Math.cos(ang) * r, cy + Math.sin(ang) * r); ctx.rotate(ang);
  const g = ctx.createLinearGradient(-rx, 0, rx, 0);
  g.addColorStop(0, c0); g.addColorStop(1, c1);
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.ellipse(0, 0, rx, ry, 0, 0, TAU); ctx.fill();
  ctx.restore();
}

function pill(cx, cy, ang, r, len, wid, c0, c1) {
  ctx.save();
  ctx.translate(cx + Math.cos(ang) * r, cy + Math.sin(ang) * r); ctx.rotate(ang);
  const g = ctx.createLinearGradient(-len / 2, 0, len / 2, 0);
  g.addColorStop(0, c0); g.addColorStop(1, c1);
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.roundRect(-len / 2, -wid / 2, len, wid, wid / 2); ctx.fill();
  ctx.restore();
}

function disc(cx, cy, r, inner = C.ink, outer = C.ink) {
  const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
  g.addColorStop(0, inner); g.addColorStop(1, outer);
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, TAU); ctx.fill();
}

function scene06(f) {
  const cx = W / 2, cy = H / 2;
  let k = CRAFT.length - 1;
  while (f < CRAFT[k].at) k--;
  const cur = CRAFT[k];
  const local = f - cur.at;
  const isLast = cur.state === 'iris';
  const rot = isLast
    ? rad(((276 - 240) / FPS) * 20) + rad(40) * expoOut(prog(f, 276, 299))
    : rad(((f - 240) / FPS) * 20);
  const pop = lerp(1.12, 1, expoOut(prog(local, 0, 5))) * 1.18;
  const breathe = isLast ? 1 : lerp(0.97, 1.03, local / 13);
  let textR = 170, size = 62;

  ctx.fillStyle = C.ink; ctx.fillRect(0, 0, W, H);
  blob(ctx, cx, cy, 900, C.plum, 0.55);

  withScale(pop * breathe, cx, cy, () => {
    if (cur.state === 'petals') {
      rays(cx, cy, 10, rot * 0.5, C.lilac, 0.32, 7);
      for (let i = 0; i < 16; i++) petal(cx, cy, rot + ((i + 0.5) / 16) * TAU, 300, 120, 56, C.plum, '#B8264A');
      for (let i = 0; i < 16; i++) petal(cx, cy, rot + (i / 16) * TAU, 380, 170, 80, C.red, '#FF6A5A');
      disc(cx, cy, 245, '#2A0816', '#5A1430');
      for (let i = 0; i < 14; i++) {
        const a = -rot * 1.5 + (i / 14) * TAU;
        const x = cx + Math.cos(a) * 205, y = cy + Math.sin(a) * 205;
        const g = ctx.createLinearGradient(x - 22, y - 22, x + 22, y + 22);
        g.addColorStop(0, C.blush); g.addColorStop(1, C.lilac);
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, 24, 0, TAU); ctx.fill();
      }
      disc(cx, cy, 172);
    } else if (cur.state === 'circles') {
      disc(cx, cy, 700, '#3A0F25', rgba(C.ink, 0));
      for (let i = 0; i < 12; i++) {
        const a = rot + (i / 12) * TAU;
        const x = cx + Math.cos(a) * 470, y = cy + Math.sin(a) * 470;
        ctx.fillStyle = rgba(C.amber, 0.95);
        ctx.beginPath(); ctx.arc(x + Math.cos(a) * 26, y + Math.sin(a) * 26, 140, 0, TAU); ctx.fill();
        const g = ctx.createLinearGradient(x - 140, y - 140, x + 140, y + 140);
        g.addColorStop(0, '#FF9BB5'); g.addColorStop(1, C.lilac);
        ctx.fillStyle = g; ctx.globalAlpha = 0.95;
        ctx.beginPath(); ctx.arc(x, y, 140, 0, TAU); ctx.fill();
        ctx.globalAlpha = 1;
      }
      for (let i = 0; i < 16; i++) petal(cx, cy, -rot + (i / 16) * TAU, 310, 90, 34, '#3A0F25', C.plum);
      disc(cx, cy, 240, '#1A0610', C.ink);
      textR = 240;
    } else if (cur.state === 'pills') {
      rays(cx, cy, 12, -rot * 0.4, C.amber, 0.22, 9);
      for (let i = 0; i < 20; i++) pill(cx, cy, rot + (i / 20) * TAU, 400, 210, 66, C.coral, C.amber);
      ctx.save();
      ctx.shadowColor = C.lilac; ctx.shadowBlur = 50;
      ctx.strokeStyle = C.lilac; ctx.lineWidth = 34;
      ctx.beginPath(); ctx.arc(cx, cy, 240, 0, TAU); ctx.stroke();
      ctx.restore();
      disc(cx, cy, 222);
      textR = 222; size = 54;
    } else {
      rays(cx, cy, 8, rot * 0.3, C.lilac, 0.18, 10);
      for (let i = 0; i < 16; i++) pill(cx, cy, rot + (i / 16) * TAU, 360, 150, 70, '#FF7A3D', C.coral);
      ctx.save();
      ctx.shadowColor = C.lilac; ctx.shadowBlur = 70;
      disc(cx, cy, 268, '#F3EAFF', C.lilac);
      ctx.restore();
      disc(cx, cy, 192);
      textR = 192; size = 76;
      // The highlight orbits the rim and settles — the word "Motion", literally moving.
      const a = rad(-120) + TAU * expoOut(prog(f, 276, 299));
      const hx = cx + Math.cos(a) * 150, hy = cy + Math.sin(a) * 150;
      const g = ctx.createRadialGradient(hx, hy, 0, hx, hy, 22);
      g.addColorStop(0, 'rgba(255,255,255,0.95)'); g.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(hx, hy, 22, 0, TAU); ctx.fill();
    }

    setFont(ctx, size, 900);
    ctx.fillStyle = C.type; ctx.textAlign = 'center';
    const step = size * 0.95;
    const b1 = cy - ((cur.lines.length - 1) * step) / 2 + size * CAP * 0.5;
    cur.lines.forEach((ln, i) => ctx.fillText(ln, cx, b1 + i * step));
    void textR;
  });
}

// ------------------------------------------------------ scene 07 Signature

function scene07(f) {
  const cx = W / 2, cy = H / 2;

  if (f < 324) {
    ctx.fillStyle = C.ink; ctx.fillRect(0, 0, W, H);
    const s = lerp(1, 0.95, prog(f, 312, 323)) * punch(f, 300, 0.05);
    withScale(s, cx, cy, () => {
      const size = 124;
      setFont(ctx, size, 900);
      ctx.fillStyle = C.type; ctx.textAlign = 'left';
      const l1 = 'Designing', l2a = "what's", l2b = ' next.';
      const w1 = textWidth(ctx, l1), w2 = textWidth(ctx, l2a + l2b), wa = textWidth(ctx, l2a);
      const step = size * 0.98, b1 = cy - step / 2 + size * CAP * 0.5;
      if (f >= 300) ctx.fillText(l1, cx - w1 / 2, b1);
      if (f >= 306) ctx.fillText(l2a, cx - w2 / 2, b1 + step);
      if (f >= 312) ctx.fillText(l2b, cx - w2 / 2 + wa, b1 + step);
    });
    return;
  }

  // End card: wordmark, monogram rolls in and docks, title types on, short hold.
  // Loop-out (f346–359): the title types off, the wordmark drops its letters and the monogram
  // glides back to centre at its opening size, so frame 359 flows straight into frame 0.
  ctx.fillStyle = C.paper; ctx.fillRect(0, 0, W, H);
  const size = 156, r = size * CAP * 0.56, gap = size * 0.2;
  setFont(ctx, size, 900);
  const word = 'Yashish', L = layout(ctx, word), ww = L.width;
  const p = expoOut(prog(f, 330, 342));
  const left = lerp(cx - ww / 2, cx - (ww + gap + 2 * r) / 2, p);
  const base = cy + size * CAP * 0.5 - 30;
  const markY = base - size * CAP * 0.5;
  const drop = Math.floor(prog(f, 348, 354) * word.length);

  withScale(punch(f, 324, 0.06), cx, cy, () => {
    ctx.fillStyle = C.sig; ctx.textAlign = 'left';
    for (let i = drop; i < word.length; i++) ctx.fillText(word[i], left + L.xs[i], base);

    if (f >= 336) {
      const sub = 'Lead Product Designer';
      const on = prog(f, 335, 341), off = prog(f, 346, 349);
      const n = Math.round(sub.length * on * (1 - off));
      setFont(ctx, 46, 700);
      ctx.fillStyle = rgba(C.ink, 0.72); ctx.textAlign = 'left';
      const sw = textWidth(ctx, sub);
      ctx.fillText(sub.slice(0, n), cx - sw / 2, base + 104);
    }
  });

  if (f >= 330) {
    const dock = cx - (ww + gap + 2 * r) / 2 + ww + gap + r;
    const q = inOut(prog(f, 352, 360));
    const mx = lerp(lerp(W + r * 2, dock, p), cx, q);
    monogram(ctx, mx, lerp(markY, cy, q), lerp(r, 0.035 * H, q), -TAU * (1 - p) - TAU * q);
  }
}

// -------------------------------------------------------------- timeline

function renderFrame(f) {
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.filter = 'none'; ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
  ctx.fillStyle = C.ink; ctx.fillRect(0, 0, W, H);
  if (f <= 23) scene01(f);
  if (f >= 24 && f <= 75) scene02(f);
  if (f >= 68 && f <= 119) scene03(f);
  if (f >= 120 && f <= 179) scene04(f);
  if (f >= 180 && f <= 239) scene05(f);
  if (f >= 240 && f <= 299) scene06(f);
  if (f >= 300) scene07(f);
  ctx.restore();
}

window.renderFrame = renderFrame;
window.FPS = FPS;
window.TOTAL = TOTAL;
