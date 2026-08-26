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
  SHOP_BUILDING_COL,
  SHOP_BUILDING_ROW,
  OTHER_BUILDING_COL,
  OTHER_BUILDING_ROW,
  TREE_SWINGS_TO_FELL,
  TOOL_REACH_DISTANCE
} from "./constants.js";

import {
  world
} from "./game.js";


export function isoToScreen(col, row, camera) {
  return {
    x: camera.x + (col - row) * (TILE_W / 2),
    y: camera.y + (col + row) * (TILE_H / 2)
  };
}


function drawLumber(ctx, lumberItem, camera) {
  const p = isoToScreen(lumberItem.col, lumberItem.row, camera);
  
  ctx.save();
  ctx.translate(p.x, p.y - 10);

  // Wood log appearance
  ctx.fillStyle = "#8b6f47";
  ctx.rotate(Math.PI / 4);
  ctx.fillRect(-12, -3, 24, 6);
  
  // Wood grain texture
  ctx.strokeStyle = "#654321";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(-12, 0);
  ctx.lineTo(12, 0);
  ctx.stroke();

  ctx.restore();
}

function drawTreeHealth(ctx, tile, col, row, camera) {
  if (!tile.hasTree || tile.treeHealth === TREE_SWINGS_TO_FELL) return;

  const p = isoToScreen(col, row, camera);
  
  ctx.save();
  ctx.translate(p.x, p.y - 35);

  // Health bar background
  ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
  ctx.fillRect(-12, 0, 24, 4);

  // Health bar foreground (red -> yellow -> green)
  const healthPercent = tile.treeHealth / TREE_SWINGS_TO_FELL;
  ctx.fillStyle = healthPercent > 0.5 ? "#4caf50" : healthPercent > 0.25 ? "#ffeb3b" : "#f44336";
  ctx.fillRect(-12, 0, 24 * healthPercent, 4);

  // Border
  ctx.strokeStyle = "#333";
  ctx.lineWidth = 1;
  ctx.strokeRect(-12, 0, 24, 4);

  ctx.restore();
}


function drawWaterTile(ctx, col, row, camera) {
  const p = isoToScreen(col, row, camera);
  
  // Animated wave effect
  const time = Date.now() / 500;
  const waveShift = Math.sin(time + col * 0.5) * 2;

  ctx.beginPath();
  ctx.moveTo(p.x, p.y - TILE_H / 2 + waveShift);
  ctx.lineTo(p.x + TILE_W / 2, p.y + waveShift);
  ctx.lineTo(p.x, p.y + TILE_H / 2 + waveShift);
  ctx.lineTo(p.x - TILE_W / 2, p.y + waveShift);
  ctx.closePath();

  ctx.fillStyle = "#2196f3";
  ctx.fill();
  ctx.strokeStyle = "#1565c0";
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Water shimmer
  ctx.fillStyle = "rgba(100, 181, 246, 0.4)";
  ctx.fillRect(p.x - 8, p.y - 2 + waveShift, 16, 3);
}



function drawPlantOverlay(ctx, tile, col, row, camera) {
  if (!tile.planted) return;

  const p = isoToScreen(col, row, camera);

  if (tile.watered) {
    ctx.fillStyle = "#6ec5ff";
    ctx.beginPath();
    ctx.moveTo(p.x + 4, p.y - 8);
    ctx.lineTo(p.x + 9, p.y - 4);
    ctx.lineTo(p.x + 3, p.y - 2);
    ctx.lineTo(p.x - 2, p.y - 6);
    ctx.closePath();
    ctx.fill();
  }

  ctx.save();
  ctx.translate(p.x, p.y - 8);

  if (tile.stage === PLANT_STAGES.SEED) {
    ctx.strokeStyle = "#2f6b2f";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, -6);
    ctx.stroke();
  } else if (tile.stage === PLANT_STAGES.SPROUT) {
    ctx.strokeStyle = "#2f6b2f";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-4, -8);
    ctx.moveTo(0, 0);
    ctx.lineTo(4, -8);
    ctx.stroke();
  } else if (tile.stage === PLANT_STAGES.CROP) {
    ctx.fillStyle = "#4a8f3b";
    ctx.beginPath();
    ctx.arc(0, -8, 6, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#d9b44a";
    ctx.fillRect(-2, -2, 4, 6);
  }

  ctx.restore();
}

function drawTree(ctx, col, row, camera, treeSprite) {
  const p = isoToScreen(col, row, camera);
  ctx.drawImage(treeSprite, p.x - 32, p.y - 50, 64, 64);
}

function drawGravestone(ctx, gravestone, camera, gravestoneSprite) {
  const p = isoToScreen(gravestone.col, gravestone.row, camera);
  ctx.drawImage(gravestoneSprite, p.x - 16, p.y - 24, 32, 48);
}

let boxSprite, dominionSprite;

function createCachedSprite(drawFn) {
  const s = document.createElement("canvas");
  s.width = 64; s.height = 64;
  drawFn(s.getContext("2d"));
  return s;
}

export function drawBox(ctx, box, camera) {
  if (!boxSprite) boxSprite = createCachedSprite(g => {
    g.translate(32, 32);
    g.fillStyle = "#4e342e"; g.beginPath(); g.moveTo(-20, 0); g.lineTo(0, 10); g.lineTo(0, 25); g.lineTo(-20, 15); g.fill();
    g.fillStyle = "#3e2723"; g.beginPath(); g.moveTo(20, 0); g.lineTo(0, 10); g.lineTo(0, 25); g.lineTo(20, 15); g.fill();
    g.fillStyle = "#5d4037"; g.beginPath(); g.moveTo(0, -10); g.lineTo(20, 0); g.lineTo(0, 10); g.lineTo(-20, 0); g.closePath(); g.fill();
  });
  const p = isoToScreen(box.col, box.row, camera);
  ctx.drawImage(boxSprite, p.x - 32, p.y - 32);
}

export function drawDominion(ctx, dominion, camera) {
  if (!dominionSprite) dominionSprite = createCachedSprite(g => {
    g.translate(32, 32);
    g.fillStyle = "#455a64"; g.beginPath(); g.moveTo(-25, 0); g.lineTo(0, 12); g.lineTo(25, 0); g.lineTo(0, -12); g.fill();
  });
  const p = isoToScreen(dominion.col, dominion.row, camera);
  ctx.drawImage(dominionSprite, p.x - 32, p.y - 32);

  const bob = Math.sin(Date.now() / 500) * 5;
  ctx.save();
  ctx.translate(p.x, p.y - 25 + bob);
  ctx.fillStyle = "#90a4ae";
  ctx.beginPath(); ctx.moveTo(0, -22); ctx.lineTo(14, 0); ctx.lineTo(0, 22); ctx.lineTo(-14, 0); ctx.fill();
  ctx.fillStyle = "#fff176";
  ctx.beginPath(); ctx.arc(0, 0, 5, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

export function drawWaterPond(ctx, pond, camera) {
  if (!pond) return;
  const c = pond.col;
  const r = pond.row;
  const size = 2.0;

  const time = Date.now() / 1000;

  ctx.save();
  
  // Base Water Layer
  const pTop = isoToScreen(c, r, camera);
  const pRight = isoToScreen(c + size, r, camera);
  const pBottom = isoToScreen(c + size, r + size, camera);
  const pLeft = isoToScreen(c, r + size, camera);

  ctx.beginPath();
  ctx.moveTo(pTop.x, pTop.y - TILE_H / 2);
  ctx.lineTo(pRight.x + TILE_W / 2, pRight.y);
  ctx.lineTo(pBottom.x, pBottom.y + TILE_H / 2);
  ctx.lineTo(pLeft.x - TILE_W / 2, pLeft.y);
  ctx.closePath();
  ctx.fillStyle = "#1e88e5";
  ctx.fill();

  // Moving "Squiggly" Ripple Effect
  for (let i = 0; i < 3; i++) {
    const shiftX = Math.sin(time + i) * 5;
    const shiftY = Math.cos(time * 0.8 + i) * 3;
    
    ctx.beginPath();
    ctx.moveTo(pTop.x + shiftX, pTop.y - TILE_H / 2 + shiftY);
    ctx.lineTo(pRight.x + TILE_W / 2 - shiftX, pRight.y + shiftY);
    ctx.lineTo(pBottom.x - shiftX, pBottom.y + TILE_H / 2 - shiftY);
    ctx.lineTo(pLeft.x - TILE_W / 2 + shiftX, pLeft.y - shiftY);
    ctx.closePath();
    
    ctx.fillStyle = i % 2 === 0 ? "rgba(100, 181, 246, 0.4)" : "rgba(13, 71, 161, 0.3)";
    ctx.fill();
  }

  // White "Specular" Ripples
  ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
  ctx.lineWidth = 2;
  for (let j = 0; j < 2; j++) {
    const rx = pTop.x + Math.sin(time + j * 2) * 20;
    const ry = pTop.y + 20 + j * 10;
    ctx.beginPath();
    ctx.moveTo(rx - 15, ry);
    ctx.quadraticCurveTo(rx, ry + Math.sin(time * 2) * 5, rx + 15, ry);
    ctx.stroke();
  }

  ctx.restore();
}

function buildSpriteFrame(directionIndex, frameIndex, look = PLACEHOLDER_LOOK, options = {}) {
  const { showPigtails = true, isUnicorn = false } = options;
  const sprite = document.createElement("canvas");
  sprite.width = 64;
  sprite.height = 64;
  const g = sprite.getContext("2d");

  const walkPose = WALK_POSES[frameIndex];
  const style = DIRECTION_STYLES[directionIndex];

  g.fillStyle = "rgba(0,0,0,0.15)";
  g.beginPath();
  g.ellipse(32, 52, 12, 6, 0, 0, Math.PI * 2);
  g.fill();

  const bx = 32 + style.bodyOffsetX;
  const by = 35 + style.bodyOffsetY;
  const hx = 32 + style.headOffsetX;
  const hy = 20 + style.headOffsetY;

  g.fillStyle = look.hair;
  const ptBounce = walkPose.legSwing * 0.5;
  
  function drawPigtail(x, y, isFront) {
    g.beginPath();
    g.ellipse(x, y + ptBounce, 5, 7, isFront ? 0.2 : -0.2, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = "#f4d683";
    g.fillRect(x - 3, y - 1 + ptBounce, 6, 2);
    g.fillRect(x - 1, y - 3 + ptBounce, 2, 6);
    g.fillStyle = look.hair;
  }

  if (!isUnicorn && showPigtails && (directionIndex === 6 || directionIndex === 5 || directionIndex === 7)) {
    drawPigtail(hx - 9, hy + 2, false);
    drawPigtail(hx + 9, hy + 2, true);
  }

  g.strokeStyle = look.pants;
  g.lineWidth = 5;
  g.lineCap = "round";
  g.beginPath();
  g.moveTo(bx - 3, by + 5);
  g.lineTo(bx - 5 + walkPose.legSwing, by + 16);
  g.moveTo(bx + 3, by + 5);
  g.lineTo(bx + 5 - walkPose.legSwing, by + 16);
  g.stroke();

  const bodyGrad = g.createRadialGradient(bx - 3, by - 3, 2, bx, by, 12);
  bodyGrad.addColorStop(0, isUnicorn ? "#444" : "#7a95eb");
  bodyGrad.addColorStop(1, look.coat);
  g.fillStyle = bodyGrad;
  g.beginPath();
  g.ellipse(bx, by, 9, 11, 0, 0, Math.PI * 2);
  g.fill();

  // BUSINESS SUIT DETAILS for Unicorn
  if (isUnicorn) {
    g.fillStyle = "#ffffff";
    g.beginPath();
    g.moveTo(bx, by - 8);
    g.lineTo(bx - 4, by - 10);
    g.lineTo(bx + 4, by - 10);
    g.closePath();
    g.fill();

    g.fillStyle = look.scarf || "#cc0000";
    g.fillRect(bx - 1, by - 9, 2, 7);
  }

  const headGrad = g.createRadialGradient(hx - 2, hy - 2, 2, hx, hy, 10);
  headGrad.addColorStop(0, isUnicorn ? "#fff" : "#ffe0c2");
  headGrad.addColorStop(1, look.skin);
  g.fillStyle = headGrad;
  g.beginPath();
  g.arc(hx, hy, 8.5, 0, Math.PI * 2);
  g.fill();

  // UNICORN HORN
  if (isUnicorn) {
    g.fillStyle = "#ffd700";
    g.beginPath();
    g.moveTo(hx - 2, hy - 7);
    g.lineTo(hx, hy - 22);
    g.lineTo(hx + 2, hy - 7);
    g.fill();
  }

  g.fillStyle = look.hair;
  g.beginPath();
  g.arc(hx, hy - 1, 9, Math.PI, 0);
  g.fill();
  
  if (!isUnicorn && directionIndex >= 1 && directionIndex <= 3) { 
    g.beginPath();
    g.moveTo(hx - 9, hy - 1);
    g.quadraticCurveTo(hx - 5, hy + 4, hx, hy - 1);
    g.quadraticCurveTo(hx + 5, hy + 4, hx + 9, hy - 1);
    g.fill();
  }

  if (!isUnicorn && showPigtails) {
    if (directionIndex >= 1 && directionIndex <= 3) {
      drawPigtail(hx - 10, hy + 2, false);
      drawPigtail(hx + 10, hy + 2, true);
    } else if (directionIndex === 0) {
      drawPigtail(hx - 2, hy + 2, false);
    } else if (directionIndex === 4) {
      drawPigtail(hx + 2, hy + 2, true);
    }
  }

  g.fillStyle = "#333";
  const eyeY = hy + 1;
  if (directionIndex === 2) {
    g.fillRect(hx - 4, eyeY, 2, 2); g.fillRect(hx + 2, eyeY, 2, 2);
  } else if (directionIndex === 1) {
    g.fillRect(hx - 1, eyeY, 2, 2); g.fillRect(hx + 4, eyeY, 2, 2);
  } else if (directionIndex === 3) {
    g.fillRect(hx - 6, eyeY, 2, 2); g.fillRect(hx - 1, eyeY, 2, 2);
  } else if (directionIndex === 0) {
    g.fillRect(hx + 4, eyeY, 2, 2);
  } else if (directionIndex === 4) {
    g.fillRect(hx - 6, eyeY, 2, 2);
  }

  g.strokeStyle = isUnicorn ? look.coat : "#4a65bd";
  g.lineWidth = 4.5;
  g.beginPath();
  const armAngle = walkPose.armSwing * 0.1;
  g.moveTo(bx, by - 5);
  g.lineTo(bx - 8 + walkPose.armSwing, by + 4);
  g.moveTo(bx, by - 5);
  g.lineTo(bx + 8 - walkPose.armSwing, by + 4);
  g.stroke();

  return sprite;
}

export function createSpriteBank(look = PLACEHOLDER_LOOK, options = {}) {
  const bank = [];
  for (let dir = 0; dir < 8; dir++) {
    const frames = [];
    for (let frame = 0; frame < 2; frame++) {
      frames.push(buildSpriteFrame(dir, frame, look, options));
    }
    bank.push(frames);
  }
  return bank;
}

export function drawCharacter(ctx, character, spriteBank, camera) {
  const p = isoToScreen(character.col, character.row, camera);
  const frameIndex = character.walkFrame % 2;
  const sprite = spriteBank[character.dir][frameIndex];
  ctx.drawImage(sprite, p.x - 32, p.y - 58, 64, 64);

  if (character.held) {
    ctx.save();
    ctx.translate(p.x, p.y - 50); 
    if (character.held === "crop") {
      ctx.fillStyle = "#4a8f3b";
      ctx.beginPath();
      ctx.arc(0, -8, 6, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#d9b44a";
      ctx.fillRect(-2, -2, 4, 6);
    } else if (character.held === "lumber") {
      ctx.fillStyle = "#8b6f47";
      ctx.rotate(Math.PI / 4);
      ctx.fillRect(-10, -2, 20, 4);
    } else if (character.held === "fish") {
      ctx.fillStyle = "#ffd54f";
      ctx.beginPath();
      ctx.ellipse(0, -6, 7, 4, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
}



export function drawMin(ctx, min, camera, minSprites) {
  const p = isoToScreen(min.col, min.row, camera);
  const sprite = minSprites[min.state] || minSprites.loose;
  ctx.drawImage(sprite, p.x - 16, p.y - 22, 32, 32);
  if (min.isWaterMin) {
    ctx.fillStyle = "rgba(30, 144, 255, 0.6)";
    ctx.fillRect(p.x - 16, p.y - 22, 32, 32);
  }
} 

export function drawCursor(ctx, cursor, camera, character) {
  if (!cursor) return;

  const p = isoToScreen(cursor.col, cursor.row, camera);

   // Calculate distance for visual feedback
  const dist = Math.hypot(character.col - cursor.col, character.row - cursor.row);
  const inRange = dist <= TOOL_REACH_DISTANCE;
  const inRangeMin = dist - 3.75 <= TOOL_REACH_DISTANCE;

  ctx.save();
  ctx.translate(p.x, p.y - 6);

  ctx.strokeStyle =  inRange || world.selectedTool === "min" && inRangeMin ? "#ffffff" : "#ff4444";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(0, 0, 7, 0, Math.PI * 2);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(-5, 0);
  ctx.lineTo(5, 0);
  ctx.moveTo(0, -5);
  ctx.lineTo(0, 5);
  ctx.stroke();

  ctx.restore();
}

export function getTimeTint(progress) {
  const p = Math.min(1, Math.max(0, progress ?? 0));

  // Dawn (0% - 20%)
  if (p < 0.2) {
    return { r: 255, g: 240, b: 180, a: 0.15 };
  }
  // Full Day (20% - 60%) - Clear/No tint
  if (p < 0.6) {
    return { r: 255, g: 255, b: 255, a: 0 };
  }
  // Dusk (60% - 80%)
  if (p < 0.8) {
    return { r: 255, g: 130, b: 80, a: 0.4 };
  }
  // Night (80% - 100%)
  return { r: 40, g: 40, b: 120, a: 0.5 };
}

export function drawBuilding(ctx, col, row, camera, isShop, character) {
  const p = isoToScreen(col, row, camera);
  
  // Logic to "enter": make building transparent if character is inside the tile
  const dist = Math.hypot(character.col - (col + 0.5), character.row - (row + 0.5));
  const isInside = dist < 1.0;

  ctx.save();
  if (isInside) ctx.globalAlpha = 0.4; // Transparency effect

  ctx.translate(p.x, p.y);

  // Walls
  ctx.fillStyle = isShop ? "#8d6e63" : "#5d4037";
  // Left Wall
  ctx.beginPath();
  ctx.moveTo(0, 16); ctx.lineTo(-32, 0); ctx.lineTo(-32, -45); ctx.lineTo(0, -29);
  ctx.fill();
  // Right Wall
  ctx.fillStyle = isShop ? "#6d4c41" : "#4e342e";
  ctx.beginPath();
  ctx.moveTo(0, 16); ctx.lineTo(32, 0); ctx.lineTo(32, -45); ctx.lineTo(0, -29);
  ctx.fill();

  // Roof
   // Door (drawn before roof/head so they sit above)
  ctx.fillStyle = "#212121";
  ctx.beginPath();
  ctx.moveTo(12, 10); ctx.lineTo(24, 4); ctx.lineTo(24, -16); ctx.lineTo(12, -10);
  ctx.fill();

    if (isShop) {
    // Flat office roof — fills entire wall top (no see-through gap)
    ctx.fillStyle = "#4e5a6b";
    ctx.beginPath();
    ctx.moveTo(-32, -45); ctx.lineTo(0, -29); ctx.lineTo(32, -45); ctx.lineTo(32, -52); ctx.lineTo(-32, -52);
    ctx.closePath(); ctx.fill();
    // Unicorn head on top
    ctx.save();
    ctx.translate(0, -52);
    ctx.fillStyle = "#fff";
    ctx.beginPath(); ctx.arc(0, -14, 11, 0, 7); ctx.fill();
    ctx.fillStyle = "#ffd700";
    ctx.beginPath(); ctx.moveTo(-2, -22); ctx.lineTo(0, -40); ctx.lineTo(2, -22); ctx.fill();
    ctx.fillStyle = "#222";
    ctx.beginPath(); ctx.arc(4, -14, 2, 0, 7); ctx.fill();
    ctx.fillStyle = "#ffb7c5";
    ctx.beginPath(); ctx.moveTo(-10, -18); ctx.lineTo(-14, -30); ctx.lineTo(-6, -20); ctx.fill();
    ctx.restore();

        // Animated rainbow smog from roof
    const t = Date.now() / 400;
    for (let i = 0; i < 5; i++) {
      const ph = t + i * 1.3;
      const sx = ((i - 2) * 10) + Math.sin(ph) * 4;
      const sy = -54 - ((ph * 8) % 40);
      const rad = 5 + Math.sin(ph * 1.7) * 2;
      ctx.fillStyle = `hsla(${(ph * 60) % 360},80%,65%,0.35)`;
      ctx.beginPath();
      ctx.arc(sx, sy, rad, 0, 7);
      ctx.fill();
    }
  } else {
    // Pitched red roof for other building
    ctx.fillStyle = "#ec0404";
    ctx.beginPath();
    ctx.moveTo(-32, -45); ctx.lineTo(0, -70); ctx.lineTo(32, -45); ctx.lineTo(0, -29);
    ctx.fill();
  }

  ctx.restore();
} 

const tileOrder = [];
for (let r = 0; r < rows; r++) {
  for (let c = 0; c < cols; c++) {
    tileOrder.push([c, r]);
  }
}
tileOrder.sort((a, b) => (a[0] + a[1]) - (b[0] + b[1]));

const tileSprites = {};

function getTileSprite(type, shade, variant) {
  const key = `${type}-${shade}-${variant}`;
  if (tileSprites[key]) return tileSprites[key];

  const s = document.createElement("canvas");
  s.width = TILE_W; s.height = TILE_H;
  const g = s.getContext("2d");
  g.translate(TILE_W / 2, TILE_H / 2);

  g.beginPath();
  g.moveTo(0, -TILE_H / 2); g.lineTo(TILE_W / 2, 0); g.lineTo(0, TILE_H / 2); g.lineTo(-TILE_W / 2, 0);
  g.closePath();

  if (type === TILE_TYPES.DIRT) {
    g.fillStyle = "#8b5a2b"; g.fill();
    g.strokeStyle = "#6a421f";
  } else if (type === TILE_TYPES.STONE) {
    g.fillStyle = "#9e9e9e"; g.fill();
    g.strokeStyle = "#616161";
  } else if (type === TILE_TYPES.SAND) {
    const sandColors = ["#d4af8f", "#e5c4a0", "#d4a574"];
    g.fillStyle = sandColors[shade]; g.fill();
    g.strokeStyle = "#b8956a";
  } else if (variant === "decay") {
    const decayedColors = ["#6a4f7e", "#7b5a8f", "#5a3f6d"];
    g.fillStyle = decayedColors[shade]; g.fill();
    g.strokeStyle = "#3a2a4a";
  } else {
    const grassColors = ["#5a8737", "#6da145", "#547e30"];
    g.fillStyle = grassColors[shade]; g.fill();
    g.strokeStyle = "#29451f";
  }
  g.lineWidth = 1.25;
  g.stroke();

  tileSprites[key] = s;
  return s;
}

export function drawScene(ctx, canvas, character, spriteBank, camera, mins, cursor, world, shopkeeper, shopkeeperSpriteBank) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (const [c, r] of tileOrder) {
    const tile = world.tiles[r][c];
    const p = isoToScreen(c, r, camera);
    const shade = (c + r) % 3;

    if (tile.type === TILE_TYPES.WATER) {
      drawWaterTile(ctx, c, r, camera);
    } else {
      ctx.drawImage(getTileSprite(tile.type, shade, tile.variant), p.x - TILE_W / 2, p.y - TILE_H / 2);
    }

    if (tile.hasTree) {
      drawTree(ctx, c, r, camera, world.treeSprite);
      drawTreeHealth(ctx, tile, c, r, camera);
    }

    drawPlantOverlay(ctx, tile, c, r, camera);
  }  

 
  for (const soul of world.souls) {
    if (soul.collected || !soul.revealed) continue; // hidden until hoed
    const p = isoToScreen(soul.col, soul.row, camera);
    ctx.save();
    ctx.translate(p.x, p.y - 12);
    const pulse = 1 + Math.sin(Date.now() / 200) * 0.2;
    ctx.scale(pulse, pulse);
    ctx.fillStyle = "rgba(170, 80, 255, 0.85)";
    ctx.beginPath();
    ctx.arc(0, 0, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
    ctx.beginPath();
    ctx.arc(0, -2, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    }

  // Draw fish ripples / fish
  for (const f of world.fishEvents) {
    const p = isoToScreen(f.col + 0.5, f.row + 0.5, camera);
    if (f.phase === 'ripple') {
      const rad = (Date.now() / f.speed) % 22;
      ctx.strokeStyle = 'rgba(255,255,255,0.6)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(p.x, p.y, rad, rad / 2, 0, 0, Math.PI * 2);
      ctx.stroke();
    } else if (f.phase === 'fish') {
      ctx.fillStyle = '#ffd54f';
      ctx.beginPath();
      ctx.ellipse(p.x, p.y - 6, 7, 4, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ff8f00';
      ctx.beginPath();
      ctx.moveTo(p.x + 6, p.y - 6);
      ctx.lineTo(p.x + 11, p.y - 9);
      ctx.lineTo(p.x + 11, p.y - 3);
      ctx.closePath();
      ctx.fill();
    }
  }


  // Draw lumber items on ground
  if (world.lumber) {
    for (const lumberItem of world.lumber) {
      drawLumber(ctx, lumberItem, camera);
    }
  }

  // Time cycle tint over world
  const tint = getTimeTint(world.dayProgress || 0);
  if (tint.a > 0) {
    ctx.save();
    if (world.dayProgress > 0.6) {
        ctx.globalCompositeOperation = 'multiply';
    }
    ctx.fillStyle = `rgba(${tint.r}, ${tint.g}, ${tint.b}, ${tint.a})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
  }

  drawBox(ctx, world.box, camera);
  drawDominion(ctx, world.dominion, camera);
  drawWaterPond(ctx, world.pond, camera);


  // Shopkeeper drawn with their bank
  drawCharacter(ctx, shopkeeper, shopkeeperSpriteBank, camera);
   
  drawBuilding(ctx, SHOP_BUILDING_COL, SHOP_BUILDING_ROW, camera, true, character);
  drawBuilding(ctx, OTHER_BUILDING_COL, OTHER_BUILDING_ROW, camera, false, character);

  // Draw gravestones
  if (world.gravestones) {
    for (const gravestone of world.gravestones) {
      drawGravestone(ctx, gravestone, camera, world.gravestoneSprite);
    }
  }

  for (const min of mins) {
    if (min.state !== "delivered") {
      drawMin(ctx, min, camera, world.minSprites);
    }
  }

  drawCursor(ctx, cursor, camera, character);
  drawCharacter(ctx, character, spriteBank, camera);
}