import {
  TILE_W,
  TILE_H,
  cols,
  rows,
  WALK_POSES,
  DIRECTION_STYLES,
  PLACEHOLDER_LOOK,
  TILE_TYPES,
  PLANT_STAGES,  
  TOOL_REACH_DISTANCE
} from "./constants.js";

import { world } from "./game.js";

const X = (c) => {
  c.b = c.beginPath;
  c.f = c.fill;
  c.s = c.stroke;
  c.m = c.moveTo;
  c.l = c.lineTo;
  c.t = c.translate;
};

export function isoToScreen(col, row, camera) {
  return {
    x: camera.x + (col - row) * (TILE_W / 2),
    y: camera.y + (col + row) * (TILE_H / 2)
  };
}

function drawLumber(c, item, camera) {
  X(c);
  const p = isoToScreen(item.col, item.row, camera);
  c.save();
  c.t(p.x, p.y - 10);
  c.fillStyle = "#8b6f47";
  c.rotate(0.78); // Math.PI / 4
  c.fillRect(-12, -3, 24, 6);
  c.strokeStyle = "#654321";
  c.lineWidth = 1;
  c.b(); c.m(-12, 0); c.l(12, 0); c.s();
  c.restore();
}

function drawTreeHealth(c, tile, col, row, camera) {
  if (!tile.hasTree || tile.treeHealth === 15) return;
  X(c);
  const p = isoToScreen(col, row, camera);
  c.save();
  c.t(p.x, p.y - 35);
  c.fillStyle = "rgba(0,0,0,.5)";
  c.fillRect(-12, 0, 24, 4);
  const hp = tile.treeHealth / 15;
  c.fillStyle = hp > .5 ? "#4caf50" : hp > .25 ? "#ffeb3b" : "#f44336";
  c.fillRect(-12, 0, 24 * hp, 4);
  c.strokeStyle = "#333";
  c.strokeRect(-12, 0, 24, 4);
  c.restore();
}

function drawWaterTile(c, col, row, camera) {
  X(c);
  const p = isoToScreen(col, row, camera);
  const wave = Math.sin(Date.now() / 500 + col * .5) * 2;
  c.b();
  c.m(p.x, p.y - TILE_H / 2 + wave);
  c.l(p.x + TILE_W / 2, p.y + wave);
  c.l(p.x, p.y + TILE_H / 2 + wave);
  c.l(p.x - TILE_W / 2, p.y + wave);
  c.closePath();
  c.fillStyle = "#2196f3";
  c.f();
  c.strokeStyle = "#1565c0";
  c.s();
  c.fillStyle = "rgba(100,181,246,.4)";
  c.fillRect(p.x - 8, p.y - 2 + wave, 16, 3);
}

function drawPlantOverlay(c, tile, col, row, camera) {
  if (!tile.planted) return;
  X(c);
  const p = isoToScreen(col, row, camera);
  if (tile.watered) {
    c.fillStyle = "#6ec5ff";
    c.b(); c.m(p.x + 4, p.y - 8); c.l(p.x + 9, p.y - 4); c.l(p.x + 3, p.y - 2); c.l(p.x - 2, p.y - 6);
    c.closePath(); c.f();
  }
  c.save();
  c.t(p.x, p.y - 8);
  if (tile.stage === PLANT_STAGES.SEED) {
    c.strokeStyle = "#46ce10"; c.lineWidth = 5;
    c.b(); c.m(0, 0); c.l(0, -6); c.s();
  } else if (tile.stage === PLANT_STAGES.SPROUT) {
    c.strokeStyle = "#24be34"; c.lineWidth = 3;
    c.b(); c.m(0, 0); c.l(-4, -8); c.m(0, 0); c.l(4, -8); c.s();
  } else if (tile.stage === PLANT_STAGES.CROP) {
    c.fillStyle = "#83ff60";
    c.b(); c.arc(0, -8, 6, 0, 7); c.f();
    c.fillStyle = "#d9b44a"; c.fillRect(-2, -2, 4, 6);
  }
  c.restore();
}

function drawTree(c, col, row, camera, img) {
  const p = isoToScreen(col, row, camera);
  c.drawImage(img, p.x - 32, p.y - 50, 64, 64);
}

function drawGravestone(c, g, camera) {
  const p = isoToScreen(g.col, g.row, camera);
  c.save();
  c.font = "24px Arial"; c.textAlign = "center";
  c.fillText("🪦", p.x, p.y - 12);
  c.restore();
}

let dominSpr;
function createCachedSprite(drawFn) {
  const s = document.createElement("canvas");
  s.width = s.height = 64;
  const g = s.getContext("2d");
  X(g);
  drawFn(g);
  return s;
}

export function drawBox(c, box, camera) {
  const p = isoToScreen(box.col, box.row, camera);
  c.save();
  c.font = "32px Arial"; c.textAlign = "center"; c.textBaseline = "middle";
  c.fillText("📦", p.x, p.y);
  c.restore();
}

export function drawDominion(c, dom, camera) {
  X(c);
  if (!dominSpr) dominSpr = createCachedSprite(g => {
    g.t(32, 32); g.fillStyle = "#455a64";
    g.b(); g.m(-25, 0); g.l(0, 12); g.l(25, 0); g.l(0, -12); g.f();
  });
  const p = isoToScreen(dom.col, dom.row, camera);
  c.drawImage(dominSpr, p.x - 32, p.y - 32);
  const bob = Math.sin(Date.now() / 500) * 5;
  c.save();
  c.t(p.x, p.y - 25 + bob);
  c.fillStyle = "#90a4ae";
  c.b(); c.m(0, -22); c.l(14, 0); c.l(0, 22); c.l(-14, 0); c.f();
  c.fillStyle = "#fff176";
  c.b(); c.arc(0, 0, 5, 0, 7); c.f();
  c.restore();
}

export function drawWaterPond(c, pond, camera) {
  if (!pond) return;
  X(c);
  const { col, row } = pond, sz = 2, pT = isoToScreen(col, row, camera), pR = isoToScreen(col+sz, row, camera), pB = isoToScreen(col+sz, row+sz, camera), pL = isoToScreen(col, row+sz, camera);
  c.save();
  c.b(); c.m(pT.x, pT.y - TILE_H / 2); c.l(pR.x + TILE_W / 2, pR.y); c.l(pB.x, pB.y + TILE_H / 2); c.l(pL.x - TILE_W / 2, pL.y);
  c.closePath(); c.fillStyle = "#1e88e5"; c.f();
  c.restore();
}



function buildSpriteFrame(dir, frame, look, opts = {}) {
  const { showPigtails = true, isUnicorn = false } = opts;
  const s = document.createElement("canvas"); s.width = s.height = 64;
  const g = s.getContext("2d"); X(g);
  const pose = WALK_POSES[frame], style = DIRECTION_STYLES[dir];
  const bx = 32 + style.bodyOffsetX, by = 35 + style.bodyOffsetY, hx = 32 + style.headOffsetX, hy = 20 + style.headOffsetY;
  
  const drawEllipse = (x, y, r1, r2, color) => { g.fillStyle = color; g.b(); g.ellipse(x, y, r1, r2, 0, 0, 7); g.f(); };
  const drawPt = (x, y, fr) => { 
    g.fillStyle = look.hair; g.b(); g.ellipse(x, y + pose.legSwing * .5, 5, 7, fr ? .2 : -.2, 0, 7); g.f(); 
    g.fillStyle = "#f4d683"; g.fillRect(x - 3, y - 1 + pose.legSwing * .5, 6, 2); g.fillRect(x - 1, y - 3 + pose.legSwing * .5, 2, 6);
  };

  g.fillStyle = "rgba(0,0,0,.15)"; g.b(); g.ellipse(32, 52, 12, 6, 0, 0, 7); g.f();
  g.strokeStyle = look.pants; g.lineWidth = 5; g.lineCap = "round";
  g.b(); g.m(bx - 3, by + 5); g.l(bx - 5 + pose.legSwing, by + 16); g.m(bx + 3, by + 5); g.l(bx + 5 - pose.legSwing, by + 16); g.s();
  
  g.strokeStyle = isUnicorn ? look.coat : "#4a65bd"; g.lineWidth = 4.5;
  g.b(); g.m(bx, by - 5); g.l(bx - 8 + pose.armSwing, by + 4); g.m(bx, by - 5); g.l(bx + 8 - pose.armSwing, by + 4); g.s();

  const bGrad = g.createRadialGradient(bx - 3, by - 3, 2, bx, by, 12);
  bGrad.addColorStop(0, isUnicorn ? "#444" : "#7a95eb"); bGrad.addColorStop(1, look.coat);
  drawEllipse(bx, by, 9, 11, bGrad);

  if (isUnicorn) { g.fillStyle = "#fff"; g.b(); g.m(bx, by - 8); g.l(bx - 4, by - 10); g.l(bx + 4, by - 10); g.f(); g.fillStyle = look.scarf || "#c00"; g.fillRect(bx - 1, by - 9, 2, 7); }

  const hGrad = g.createRadialGradient(hx - 2, hy - 2, 2, hx, hy, 10);
  hGrad.addColorStop(0, isUnicorn ? "#fff" : "#ffe0c2"); hGrad.addColorStop(1, look.skin);
  drawEllipse(hx, hy, 8.5, 8.5, hGrad);

  if (isUnicorn) { g.fillStyle = "#fd0"; g.b(); g.m(hx - 2, hy - 7); g.l(hx, hy - 22); g.l(hx + 2, hy - 7); g.f(); }

  g.fillStyle = look.hair; g.b(); g.arc(hx, hy - 1, 9, 3.14, 0); g.f();
  if (!isUnicorn && showPigtails) {
    if (dir >= 1 && dir <= 3) {
      g.b(); g.m(hx - 9, hy - 1); g.quadraticCurveTo(hx - 5, hy + 4, hx, hy - 1); g.quadraticCurveTo(hx + 5, hy + 4, hx + 9, hy - 1); g.f();
      drawPt(hx - 10, hy + 2, 0); drawPt(hx + 10, hy + 2, 1);
    } else if (dir > 4) { drawPt(hx - 9, hy + 2, 0); drawPt(hx + 9, hy + 2, 1); }
    else if (dir === 0) drawPt(hx - 2, hy + 2, 0);
    else if (dir === 4) drawPt(hx + 2, hy + 2, 1);
  }

  g.fillStyle = "#333";
  const eyeX = [0, 4, 2, -6, 0, 0, 0, 0][dir] || 0;
  if (dir > 0 && dir < 4) { g.fillRect(hx - 4 + eyeX, hy + 1, 2, 2); g.fillRect(hx + 2 + eyeX, hy + 1, 2, 2); }
  return s;
}



export function createSpriteBank(look = PLACEHOLDER_LOOK, opts = {}) {
  return Array.from({length:8}, (_, dir) => [buildSpriteFrame(dir, 0, look, opts), buildSpriteFrame(dir, 1, look, opts)]);
}

export function drawCharacter(c, char, bank, camera) {
  X(c);
  const p = isoToScreen(char.col, char.row, camera), spr = bank[char.dir][char.walkFrame % 2];
  c.drawImage(spr, p.x - 32, p.y - 58, 64, 64);
  if (char.held) {
    c.save(); c.t(p.x, p.y - 50);
    if (char.held === "crop") {
      c.fillStyle = "#83ff60"; c.b(); c.arc(0, -8, 6, 0, 7); c.f();
      c.fillStyle = "#d9b44a"; c.fillRect(-2, -2, 4, 6);
    } else if (char.held === "lumber") {
      c.fillStyle = "#8b6f47"; c.rotate(0.78); c.fillRect(-10, -2, 20, 4);
    } else if (char.held === "fish") c.fillText('🐠', 0, 0);
    c.restore();
  }
}

const minC = {};
export function drawMin(c, min, camera, minSprites) {
  X(c);
  const p = isoToScreen(min.col, min.row, camera);
  const key = (min.isRainbowMin ? "r" : min.isWaterMin ? "w" : "n") + min.state;
  if (!minC[key]) {
    const s = document.createElement("canvas"); s.width = s.height = 32;
    const g = s.getContext("2d"); X(g);
    if (min.isRainbowMin) {
      const gr = g.createLinearGradient(8, 8, 24, 24);
      ["#f33", "#f70", "#3f9", "#0af", "#f1e"].forEach((cl, i) => gr.addColorStop(i / 4, cl));
      g.fillStyle = gr; g.b(); g.arc(16, 16, 8, 0, 7); g.f();
      g.fillStyle = "#321"; g.fillRect(13, 15, 6, 2);
    } else {
      g.drawImage(minSprites[min.state] || minSprites.loose, 0, 0);
      if (min.isWaterMin) {
        g.globalCompositeOperation = "source-atop"; g.fillStyle = "rgba(30,144,255,.55)"; g.fillRect(0, 0, 32, 32);
      }
    }
    minC[key] = s;
  }
  c.drawImage(minC[key], p.x - 16, p.y - 22);
}

export function drawCursor(c, cur, cam, char) {
  if (!cur) return;
  X(c);
  const p = isoToScreen(cur.col, cur.row, cam), dst = Math.hypot(char.col - cur.col, char.row - cur.row);
  const ok = dst <= TOOL_REACH_DISTANCE || (world.e === "min" && dst - 3.75 <= TOOL_REACH_DISTANCE);
  c.save(); c.t(p.x, p.y - 6);
  c.strokeStyle = ok ? "#fff" : "#f44"; c.lineWidth = 2;
  c.b(); c.arc(0, 0, 7, 0, 7); c.s();
  const glyphs = { "empty-hands": "+", hoe: "🪏", seeds: "🌱", "watering-can": "💧", axe: "🪓", min: "-" };
  c.fillStyle = c.strokeStyle; c.font = "bold 14px Arial"; c.textAlign = "center"; c.textBaseline = "middle";
  c.fillText(glyphs[world.e] || "?", 0, 0);
  c.restore();
}

export function getTimeTint(p) {
  if (p < .2) return { r: 255, g: 240, b: 180, a: .15 };
  if (p < .6) return { r: 255, g: 255, b: 255, a: 0 };
  if (p < .8) return { r: 255, g: 130, b: 80, a: .4 };
  return { r: 40, g: 40, b: 120, a: .5 };
}

export function drawBuilding(c, col, row, camera, shop, char) {
  X(c);
  const p = isoToScreen(col, row, camera), inside = Math.hypot(char.col - (col + .5), char.row - (row + .5)) < 1;
  c.save(); c.globalAlpha = inside ? .4 : 1; c.t(p.x, p.y);
  c.fillStyle = shop ? "#8d6e63" : "#5d4037";
  c.b(); c.m(0, 16); c.l(-32, 0); c.l(-32, -45); c.l(0, -29); c.f();
  c.fillStyle = shop ? "#6d4c41" : "#4e342e";
  c.b(); c.m(0, 16); c.l(32, 0); c.l(32, -45); c.l(0, -29); c.f();
  c.fillStyle = "#212121"; c.b(); c.m(12, 10); c.l(24, 4); c.l(24, -16); c.l(12, -10); c.f();
  if (shop) {
    c.fillStyle = "#4e5a6b"; c.b(); c.m(-32, -45); c.l(0, -29); c.l(32, -45); c.l(32, -52); c.l(-32, -52); c.closePath(); c.f();
    c.save(); c.t(0, -52); c.fillStyle = "#fff"; c.b(); c.arc(0, -14, 11, 0, 7); c.f();
    c.fillStyle = "#fd0"; c.b(); c.m(-2, -22); c.l(0, -40); c.l(2, -22); c.f();
    c.fillStyle = "#222"; c.b(); c.arc(4, -14, 2, 0, 7); c.f();
    c.fillStyle = "#fbc"; c.b(); c.m(-10, -18); c.l(-14, -30); c.l(-6, -20); c.f();
    c.restore();
    const t = Date.now() / 400;
    for (let i = 0; i < 5; i++) {
      const ph = t + i * 1.3, sx = ((i - 2) * 10) + Math.sin(ph) * 4, sy = -54 - ((ph * 8) % 40), rad = 5 + Math.sin(ph * 1.7) * 2;
      c.fillStyle = `hsla(${(ph * 60) % 360},80%,65%,.35)`;
      c.b(); c.arc(sx, sy, rad, 0, 7); c.f();
    }
  } else {
    c.fillStyle = "#ec0404"; c.b(); c.m(-32, -45); c.l(0, -70); c.l(32, -45); c.l(0, -29); c.f();
  }
  c.restore();
}

const tileOrder = [];
for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) tileOrder.push([c, r]);
tileOrder.sort((a, b) => (a[0] + a[1]) - (b[0] + b[1]));

const tileSprs = {};
function getTileSprite(type, shade, variant) {
  const key = `${type}-${shade}-${variant}`;
  if (tileSprs[key]) return tileSprs[key];
  const s = document.createElement("canvas"); s.width = TILE_W; s.height = TILE_H;
  const g = s.getContext("2d"); X(g); g.t(TILE_W / 2, TILE_H / 2);
  g.beginPath(); g.m(0, -TILE_H / 2); g.l(TILE_W / 2, 0); g.l(0, TILE_H / 2); g.l(-TILE_W / 2, 0); g.closePath();
  if (type === TILE_TYPES.DIRT) { g.fillStyle = "#8b5a2b"; g.fill(); g.strokeStyle = "#6a421f"; }
  else if (type === TILE_TYPES.STONE) { g.fillStyle = "#9e9e9e"; g.fill(); g.strokeStyle = "#616161"; }
  else if (type === TILE_TYPES.SAND) { g.fillStyle = ["#d4af8f", "#e5c4a0", "#d4a574"][shade]; g.fill(); g.strokeStyle = "#b8956a"; }
  else if (variant === "decay") { g.fillStyle = ["#6a4f7e", "#7b5a8f", "#5a3f6d"][shade]; g.fill(); g.strokeStyle = "#3a2a4a"; }
  else { g.fillStyle = ["#5a8737", "#6da145", "#547e30"][shade]; g.fill(); g.strokeStyle = "#29451f"; }
  g.lineWidth = 1.25; g.s();
  tileSprs[key] = s; return s;
}

export function drawScene(c, canvas, character, bank, camera, mins, cursor, world, shopkeeper, shopBank) {
  X(c);
  c.clearRect(0, 0, canvas.width, canvas.height);
  for (const [col, row] of tileOrder) {
    const tile = world.t[row][col], p = isoToScreen(col, row, camera);
    if (tile.type === TILE_TYPES.WATER) drawWaterTile(c, col, row, camera);
    else c.drawImage(getTileSprite(tile.type, (col + row) % 3, tile.variant), p.x - TILE_W / 2, p.y - TILE_H / 2);
    if (tile.hasTree) { drawTree(c, col, row, camera, world.T); drawTreeHealth(c, tile, col, row, camera); }
    drawPlantOverlay(c, tile, col, row, camera);
  }
  for (const s of world.q) {
    if (!s.collected && s.revealed) {
      const p = isoToScreen(s.col, s.row, camera); c.save(); c.t(p.x, p.y - 12);
      const pulse = 1 + Math.sin(Date.now() / 200) * .2; c.scale(pulse, pulse);
      c.fillStyle = "rgba(170,80,255,.85)"; c.b(); c.arc(0, 0, 6, 0, 7); c.f();
      c.fillStyle = "rgba(255,255,255,.9)"; c.b(); c.arc(0, -2, 2, 0, 7); c.f(); c.restore();
    }
  }
  for (const f of world.F) {
    const p = isoToScreen(f.col + .5, f.row + .5, camera);
    if (f.phase === 'ripple') {
      const r = (Date.now() / f.speed) % 22; c.strokeStyle = 'rgba(255,255,255,.6)'; c.lineWidth = 2;
      c.b(); c.ellipse(p.x, p.y, r, r / 2, 0, 0, 7); c.s();
    } else if (f.phase === 'fish') { c.font = '24px Arial'; c.textAlign = 'center'; c.fillText('🐠', p.x, p.y - 6); }
  }
  if (world.o) for (const l of world.o) drawLumber(c, l, camera);
  const tint = getTimeTint(world.p || 0);
  if (tint.a > 0) {
    c.save(); if (world.p > .6) c.globalCompositeOperation = 'multiply';
    c.fillStyle = `rgba(${tint.r},${tint.g},${tint.b},${tint.a})`; c.fillRect(0, 0, canvas.width, canvas.height); c.restore();
  }
  drawBox(c, world.z, camera); drawDominion(c, world.y, camera); drawWaterPond(c, world.j, camera);
  drawCharacter(c, shopkeeper, shopBank, camera);
  drawBuilding(c, 18, 16, camera, true, character); drawBuilding(c, 42, 3, camera, false, character);
  if (world.g?.length) drawGravestone(c, world.g[0], camera);
  for (const m of mins) if (m.state !== "delivered") drawMin(c, m, camera, world.M);
  drawCursor(c, cursor, camera, character); drawCharacter(c, character, bank, camera);
}