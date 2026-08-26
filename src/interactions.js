import {    
  MIN_INTERACTION_RADIUS,  
  DIRECTION_VECTORS,  
  THROW_MAX_DISTANCE,
  cols,
  rows,
  TOOL_TYPES,
  TILE_TYPES,
  PLANT_STAGES,
  GROWTH_DURATION_MIN,
  GROWTH_DURATION_MAX, 
  BOX_INTERACTION_RADIUS,  
  DOMINION_INTERACTION_RADIUS,
  WATER_CAN_MAX,
  BOX_COL,
  BOX_ROW,  
  WATER_POND_COL,
  WATER_POND_ROW,  
  SHOPKEEPER_COL,
  SHOPKEEPER_ROW,
  TASKS,  
  TREE_SWINGS_TO_FELL,
  TREE_CUT_TIME_1_MIN,
  TREE_CUT_TIME_2_MIN,
  TREE_CUT_TIME_3_MIN,
  MAX_LUMBER_ITEMS,
  FISH_RIPPLE_SPAWN_MS,
  FISH_RIPPLE_RAMP_MS,
  FISH_VISIBLE_MS,
  FISH_CATCH_RADIUS,
  FISH_SALE_PRICE,
  POND_MIN_SOAK_MS
} from "./constants.js";

import { showModal } from "./modal.js";

import { sfx } from "./sound.js";







export function createBox() {
  return {
    col: BOX_COL,
    row: BOX_ROW
  };
}

export function createDominion() {
  return {
    col: 38,
    row: 16
  };
}

function createTreeSprite() {
  const sprite = document.createElement("canvas");
  sprite.width = 64;
  sprite.height = 64;
  const g = sprite.getContext("2d");

  g.translate(32, 32);
  
  // Trunk
  g.fillStyle = "#654321";
  g.fillRect(-4, 8, 8, 16);
  
  // Foliage (tree top)
  g.fillStyle = "#2d5a2d";
  g.beginPath();
  g.arc(0, 0, 14, 0, Math.PI * 2);
  g.fill();

  // Lighter shade for depth
  g.fillStyle = "#3d6a3d";
  g.beginPath();
  g.arc(-3, 2, 10, 0, Math.PI * 2);
  g.fill();

  return sprite;
}

function createGravestoneSprite() {
  const sprite = document.createElement("canvas");
  sprite.width = 32;
  sprite.height = 48;
  const g = sprite.getContext("2d");

  g.translate(16, 24);

  // Gravestone base
  g.fillStyle = "#505050";
  g.fillRect(-6, 0, 12, 4);

  // Gravestone slab
  g.fillStyle = "#707070";
  g.beginPath();
  g.moveTo(-8, -2);
  g.lineTo(8, -2);
  g.lineTo(6, -18);
  g.lineTo(-6, -18);
  g.closePath();
  g.fill();

  // Gravestone outline
  g.strokeStyle = "#505050";
  g.lineWidth = 1;
  g.stroke();

  // Creepy cross or marking
  g.strokeStyle = "#888888";
  g.lineWidth = 1.5;
  g.beginPath();
  g.moveTo(0, -16);
  g.lineTo(0, -6);
  g.moveTo(-3, -11);
  g.lineTo(3, -11);
  g.stroke();

  return sprite;
}

function createMinSprite(state) {
  const sprite = document.createElement("canvas");
  sprite.width = 32;
  sprite.height = 32;
  const g = sprite.getContext("2d");

  g.translate(16, 16);

  const isFollowing = state === "following" || state === "carrying" || state === "carrying_lumber" || state === "carrying_fish";
  g.fillStyle = isFollowing ? "#f7c873" : "#8c5b2b";
  
  if (state === "going_to_box" || state === "returning_to_dominion") {
    g.fillStyle = "#2ee88b";
  }

  if (state === "tree_cutting") {
    g.fillStyle = "#5a6b3a"; // Darker color for working
  }

  g.beginPath();
  g.arc(0, 0, 8, 0, Math.PI * 2);
  g.fill();

  if (state === "carrying" || state === "returning_to_dominion") {
    g.fillStyle = "#d9b44a";
    g.beginPath();
    g.arc(0, -12, 5, 0, Math.PI * 2);
    g.fill();
  }

  if (state === "carrying_lumber") {
    g.fillStyle = "#8b6f47";
    g.save();
    g.rotate(Math.PI / 4);
    g.fillRect(-10, -2, 20, 4);
    g.restore();
  }

    if (state === "carrying_fish") {
    g.fillStyle = "#ffd54f";
    g.beginPath();
    g.ellipse(0, -12, 6, 3, 0, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = "#ff8f00";
    g.beginPath();
    g.moveTo(5, -12); g.lineTo(9, -14); g.lineTo(9, -10); g.closePath(); g.fill();
  }

  if (state === "tree_cutting") {
    // Show tool
    g.strokeStyle = "#d4a574";
    g.lineWidth = 2;
    g.beginPath();
    g.moveTo(-5, -5);
    g.lineTo(5, 5);
    g.stroke();
  }

  g.fillStyle = "#3a210f";
  g.fillRect(-3, -1, 6, 2);

  return sprite;
  
}


export function updateFish(world, deltaMs) {
  // spawn
  world.fishSpawnTimer += deltaMs;
  if (world.fishSpawnTimer >= FISH_RIPPLE_SPAWN_MS) {
    world.fishSpawnTimer = 0;
    const waterTiles = [];
    for (let r=0; r<rows; r++) for (let c=0; c<cols; c++)
      if (world.tiles[r][c].type === TILE_TYPES.WATER) waterTiles.push({c,r});
    if (waterTiles.length) {
      const t = waterTiles[Math.floor(Math.random()*waterTiles.length)];
      world.fishEvents.push({ col:t.c, row:t.r, phase:'ripple', timer:0, speed:1 });
    }
  }
  // advance
  for (let i=world.fishEvents.length-1; i>=0; i--) {
    const f = world.fishEvents[i];
    f.timer += deltaMs;
    if (f.phase === 'ripple') {
      f.speed = 1 + (f.timer / FISH_RIPPLE_RAMP_MS) * 6; // accelerates
      if (f.timer >= FISH_RIPPLE_RAMP_MS) { f.phase='fish'; f.timer=0; }
    } else if (f.phase === 'fish' && f.timer >= FISH_VISIBLE_MS) {
      world.fishEvents.splice(i,1); // fish gone
    }
  }
}

export function createWorld() {

   
   const mins = [];

  // Grandpas Graveyard (randomized positions)
  const gravestones = [
     { col: 2 + Math.random() * 8,
      row: 1 + Math.random() * 6,
      id: 0}   
  ];

   // Mirror grave position into the other three quadrants
  const g = gravestones[0];
  const souls = [
    { col: 21 + g.col, row: g.row, collected: false, revealed: false, id: "tr" },
    { col: g.col,     row: 18 + g.row, collected: false, revealed: false, id: "bl" },
    { col: 21 + g.col, row: 18 + g.row, collected: false, revealed: false, id: "br" }
  ];


  // Generate lumber items in forest for variety
  const lumber = [];

const tiles = Array.from({ length: rows }, (_, row) =>
  Array.from({ length: cols }, (_, col) => {
    // Stone paths defining quadrants
    const squareWidth = 6;
    const squareHeight = 64;
    const squareColStart = 15;
    const squareRowStart = 0;
    const isTownSquare = col >= squareColStart && col < squareColStart + squareWidth && 
                         row >= squareRowStart && row < squareRowStart + squareHeight;

    const walkwayRowStart = 15;
    const walkwayRowEnd = 17;
    const isWalkway = (col >= 0 && col < cols) && row >= walkwayRowStart && row <= walkwayRowEnd || (col >= 18 && col < 20) && row == 20 && row <= 32;
    
    const isStone = isTownSquare || isWalkway;

    // Define quadrant boundaries (adjusted for stone paths)
    const topLeftQuadrant = col < 15 && row < 15;
    const topRightQuadrant = col >= 21 && row < 15;
    const bottomLeftQuadrant = col < 15 && row >= 18;
    const bottomRightQuadrant = col >= 21 && row >= 18;

    // Determine tile type based on quadrant
    let tileType = TILE_TYPES.GRASS;

    if (isStone) {
      tileType = TILE_TYPES.STONE;
    } else if (bottomLeftQuadrant) {
      // Beach & Ocean quadrant
      const distFromBottom = rows - row;
      if (distFromBottom <= 3) {
        tileType = TILE_TYPES.WATER;
      } else if (distFromBottom <= 6) {
        tileType = TILE_TYPES.SAND;
      } else {
        tileType = TILE_TYPES.GRASS;
      }
    } else if (bottomRightQuadrant) {
      // Forest quadrant
      tileType = TILE_TYPES.GRASS;
    } else if (topLeftQuadrant) {
      // Creepy grass quadrant
      tileType = TILE_TYPES.GRASS;
    }

    return {
      
      type: tileType,
      planted: false,
      watered: false,
      growth: 0,
      
      
      growDuration: GROWTH_DURATION_MIN + Math.random() * (GROWTH_DURATION_MAX - GROWTH_DURATION_MIN),
      stage: PLANT_STAGES.EMPTY,
      variant: topLeftQuadrant ? "decay" : null,
        hasTree: (bottomRightQuadrant && col % 2 === 0 && row % 2 === 0) || 
               (topRightQuadrant && (col === 21 || col === cols - 1 || row === 0 || row === 14)),

      treeHealth: TREE_SWINGS_TO_FELL, // 10 swings to fell
      lumber: false // Becomes true when tree is felled
    };
  })
);

  // Create sprite cache
  const treeSprite = createTreeSprite();
  const gravestoneSprite = createGravestoneSprite();
  const minSprites = {
    loose: createMinSprite("loose"),
    following: createMinSprite("following"),
    carrying: createMinSprite("carrying"),
    carrying_lumber: createMinSprite("carrying_lumber"),
    carrying_fish: createMinSprite("carrying_fish"),
    going_to_box: createMinSprite("going_to_box"),
    returning_to_dominion: createMinSprite("returning_to_dominion"),
    thrown: createMinSprite("loose"),
    tree_cutting: createMinSprite("tree_cutting")
  };

  return {
    box: createBox(),
    dominion: createDominion(),
    stats: { hoed: 0, planted: 0, watered: 0, harvested: 0, given: 0, treesChopped : 0, minObtained: 0, fishCaught: 0, visitedShop: 0, cropsCollected: 0 , filledWater: 0},
    axeUnlocked: false,
    minUnlocked: false,
    currentTaskIndex: 0,    
    pond: { col: WATER_POND_COL, row: WATER_POND_ROW },
    shopOpen: false,
    mins,
    tiles,
    gravestones,
    souls,
    soulsCollected: 0,
    lumber,
    treeSprite,
    gravestoneSprite,
    minSprites,
    selectedTool: TOOL_TYPES.HANDS,
    cropsCollected: 0,
    lumberCollected: 0,
    fishEvents: [],
    fishSpawnTimer: 0,
    fishCollected: 0,
    waterCanFillAmount: 0,
    seedsCollected: 0,
    filledWater: 0,
    isRefillingWater: false,
    refillTimer: 0,
    seedInventory: 5,   

    dayLengthMs: 5 * 60 * 1000,
    dayElapsedMs: 0,
    dayProgress: 0,
    dayNumber: 1,
    wallet: 25,
    
  };
}

// ... existing functions ...

export function tryInteractWithShop(character, world) {
  if (!world.shopkeeper) return false;

  const distance = Math.hypot(character.col - world.shopkeeper.col, character.row - world.shopkeeper.row);
  if (distance > 1.6) return false;

  

  const giveIndex = TASKS.findIndex(t => t.id === 'give');
if (world.currentTaskIndex <= giveIndex && world.stats.given < 1) {
  if (character.held === 'crop') {
    character.held = null;
    world.stats.given++;
    world.axeUnlocked = true;
    world.shopkeeper.col = SHOPKEEPER_COL;
    world.shopkeeper.row = SHOPKEEPER_ROW;
    showModal({
      title: "Unicorn Merchant",
      bodyHtml: "<p>Good Max. Apple don't fall far from tree — pity gramps croaked, coulda doubled da ROI. Axe's yours. Unicorp HQ's mid-farm, fair-ish prices. WELCOME TO THE FAMILY.</p>",
      buttons: [{ label: "I H8 U.", className: "modal-btn--close" }]
    });
  } else {
    showModal({
      title: "Unicorn Merchant",
      bodyHtml: "<p>Prove u'll hit KPIs: grow a crop, hand it over. If it good, ur hired and will get family heirloom back as an Onboarding bonus!</p>",
      buttons: [{ label: "Wow. So generous.", className: "modal-btn--close" }]
    });
  }
  return true;
}

  world.stats.visitedShop = 1;
  world.shopOpen = true;
  return true;
}

export function tryInteractWithGravestone(character, world) {
  if (!world.gravestones) return false;

  for (let gravestone of world.gravestones) {
    const distance = Math.hypot(character.col - gravestone.col, character.row - gravestone.row);
    if (distance <= 1.5) {
      showGravestoneMessage(gravestone);
      return true;
    }
  }
  return false;
}

function showGravestoneMessage(gravestone) {
  showModal({
    title: "The Grave says:",
    bodyHtml: `<p>Here lies Max's Grandpa Sr.</p><p>(Luxury condos + a Chillis! coming soon)</p><p>"Seek thee soul piece 3: A mirror of where I would lie in grass, beach, and trees.</p>`,
    buttons: [{ label: "Close", className: "modal-btn--close" }],
  });
}

function moveToward(min, targetCol, targetRow, speed = 0.12) {
  const dx = targetCol - min.col;
  const dy = targetRow - min.row;
  const distance = Math.hypot(dx, dy);

  if (distance > 0.01) {
    const step = Math.min(speed, distance);
    min.col += (dx / distance) * step;
    min.row += (dy / distance) * step;
  }
}

function settleMin(min) {

  
  
  min.state = "following";
  min.target = null;
  min.targetTile = null;
  min.throwOrigin = null;
  min.throwDistance = 0;
  min.landed = true;
  min.isDelivering = false;
  min.lineToken = Date.now(); //min return to back of line to prevent fish grifting 
  
}

export function spawnNewMin(mins, col, row, initialState = "loose") {
  const newMin = {
    id: Date.now() + Math.random(),
    col: col,
    row: row,
    state: initialState,
    atHome:true,
    lineToken: Date.now(),
    followIndex: 0,
    target: null,
    targetTile: null,
    throwOrigin: null,
    throwDistance: 0,
    landed: false,
    isDelivering: false,
    carryingLumberForDelivery: false,
    cuttingTimer: 0,
    cuttingTreeCol: null,
    cuttingTreeRow: null
  };
  mins.push(newMin);
  return newMin;
}

export function updateMins(character, mins, world) {
  const { box, dominion } = world;

  // === PERF: precompute tree-cutter counts ONCE (was O(n^2) filter per min) ===
  const cutterCounts = {};
  for (const m of mins) {
    if (m.state === "tree_cutting") {
      const key = m.cuttingTreeCol + "," + m.cuttingTreeRow;
      cutterCounts[key] = (cutterCounts[key] || 0) + 1;
    }
  }

  // 1. Sort followers so that those carrying crops/lumber are at the front of the line
  const followers = mins.filter((min) => min.state === "following" || min.state === "carrying" || min.state === "carrying_lumber" || min.state === "carrying_fish");
  followers.sort((a, b) => {
    const aCarrying = a.state === "carrying" || a.state === "carrying_lumber" || a.state === "carrying_fish" ? 1 : 0;
    const bCarrying = b.state === "carrying" || b.state === "carrying_lumber" || b.state === "carrying_fish" ? 1 : 0;
    if (aCarrying !== bCarrying) return bCarrying - aCarrying; // carriers front
    return (a.lineToken || 0) - (b.lineToken || 0); // older tokens front, new ones back
  });

  followers.forEach((min, index) => {
    const vector = DIRECTION_VECTORS[character.dir] || { dx: 0, dy: 0 };
    const offsetAmount = 0.7 + index * 0.25;

    const targetCol = character.col - vector.dx * offsetAmount;
    const targetRow = character.row - vector.dy * offsetAmount;

    moveToward(min, targetCol, targetRow, 0.12);

    // === PERF: squared distance instead of Math.hypot ===
    const dxHome = min.col - targetCol;
    const dyHome = min.row - targetRow;
    if (dxHome * dxHome + dyHome * dyHome < 0.15 * 0.15) {
      min.atHome = true;
    }
  });

  // --- Lumber Cleanup (performance fix) ---
  if (world.lumber && world.lumber.length > MAX_LUMBER_ITEMS) {
    world.lumber.splice(0, world.lumber.length - MAX_LUMBER_ITEMS);
  }

  mins.forEach((min) => {
    // --- Auto-pickup lumber when thrown min lands ---
    if (min.landed && world.lumber && world.lumber.length > 0) {
      for (let i = world.lumber.length - 1; i >= 0; i--) {
        const lumberItem = world.lumber[i];
        const distToLumber = Math.hypot(min.col - lumberItem.col, min.row - lumberItem.row);
        if (distToLumber < 0.3) {
          min.state = "carrying_lumber";
          min.carryingLumberForDelivery = false;
          world.lumber.splice(i, 1);
          min.landed = false;
          return;
        }
      }
    }

    if (min.state === "in_pond") {
      min.soakTimer -= 16; // matches existing tick used for cuttingTimer
      if (min.soakTimer <= 0) {
        min.state = "following";
        min.isWaterMin = true;
        min.lineToken = Date.now();
      }
      return;
    }

    // --- NEW: Tree Cutting Cooperation ---
    if (min.state === "tree_cutting") {
      const tCol = min.cuttingTreeCol;
      const tRow = min.cuttingTreeRow;
      const tile = world.tiles[tRow]?.[tCol];

      if (!tile || !tile.hasTree) {
        min.state = "loose";
        min.cuttingTimer = 0;
        min.cuttingTreeCol = null;
        min.cuttingTreeRow = null;
        return;
      }

      moveToward(min, tCol + 0.5, tRow + 0.5, 0.12);

      // === PERF: use precomputed count instead of mins.filter(...) ===
      const totalCutters = cutterCounts[tCol + "," + tRow] || 1;
      let cutTime;
      if (totalCutters === 1) cutTime = TREE_CUT_TIME_1_MIN;
      else if (totalCutters === 2) cutTime = TREE_CUT_TIME_2_MIN;
      else cutTime = TREE_CUT_TIME_3_MIN;

      min.cuttingTimer += 16;
      if (min.cuttingTimer >= cutTime) {
        tile.hasTree = false;
        tile.lumber = true;

        if (world.lumber.length < MAX_LUMBER_ITEMS) {
          world.lumber.push({
            col: tCol + 0.5,
            row: tRow + 0.5,
            id: Date.now() + Math.random()
          });
        }
        world.stats.treesChopped++;
        min.state = "carrying_lumber";
        const pushDist = 2;
        const angle = Math.atan2(min.row - (tRow + 0.5), min.col - (tCol + 0.5));
        min.col = (tCol + 0.5) + Math.cos(angle) * pushDist;
        min.row = (tRow + 0.5) + Math.sin(angle) * pushDist;
        min.cuttingTimer = 0;
        min.cuttingTreeCol = null;
        min.cuttingTreeRow = null;
        min.landed = false;

        mins.forEach(m => {
          if (m.state === "tree_cutting" && m.cuttingTreeCol === tCol && m.cuttingTreeRow === tRow && m.id !== min.id) {
            m.state = "loose";
            m.cuttingTimer = 0;
            m.cuttingTreeCol = null;
            m.cuttingTreeRow = null;
            const pushDist = 1.5;
            const angle = Math.atan2(m.row - (tRow + 0.5), m.col - (tCol + 0.5));
            m.col = (tCol + 0.5) + Math.cos(angle) * pushDist;
            m.row = (tRow + 0.5) + Math.sin(angle) * pushDist;
          }
        });
      }
    }

    // --- Dominion Automation Logic ---
    if (min.state === "thrown") {
      const dx = min.col - dominion.col;
      const dy = min.row - dominion.row;
      if (dx * dx + dy * dy < 1.5 * 1.5 && world.cropsCollected > 0 && world.selectedTool === "min") {
        min.state = "going_to_box";
      }
    }

    if (min.state === "going_to_box") {
      moveToward(min, box.col, box.row, 0.14);
      const dx = min.col - box.col;
      const dy = min.row - box.row;
      if (dx * dx + dy * dy < 0.2 * 0.2) {
        if (world.cropsCollected > 0) {
          world.cropsCollected--;
          min.state = "returning_to_dominion";
        } else {
          min.state = "loose";
        }
      }
    }

    if (min.state === "returning_to_dominion") {
      moveToward(min, dominion.col, dominion.row, 0.14);
      const dx = min.col - dominion.col;
      const dy = min.row - dominion.row;
      if (dx * dx + dy * dy < 0.2 * 0.2) {
        spawnNewMin(mins, dominion.col, dominion.row, "following");
        min.state = "following";
        min.lineToken = Date.now();
      }
    }

    // --- Standard Actions ---
    if (min.state === "thrown") {
      const target = min.isDelivering 
        ? { col: world.box.col, row: world.box.row }
        : (min.target || { col: character.col, row: character.row });

      moveToward(min, target.col, target.row, 0.14);

      if (min.throwOrigin && !min.isDelivering) {
        min.throwDistance = Math.hypot(
          min.col - min.throwOrigin.col,
          min.row - min.throwOrigin.row
        );
      }

      const dxT = min.col - target.col;
      const dyT = min.row - target.row;
      const reachedTarget = (dxT * dxT + dyT * dyT) <= 0.18 * 0.18;

      if (min.isDelivering && reachedTarget) {
        if (min.carryingLumberForDelivery) {
          world.lumberCollected += 1;
        } else if (min.state === "carrying_fish" || min.carryingFish) {
          world.wallet += FISH_SALE_PRICE;
          world.fishCollected += 1;
          min.carryingFish = false;
        } else {
          world.cropsCollected += 1;
          world.stats.cropsCollected++;
        }      
        min.state = "following";
        min.isDelivering = false;
        min.lineToken = Date.now();
        return;
      }      

      if (reachedTarget || (!min.isDelivering && (min.throwDistance ?? 0) >= THROW_MAX_DISTANCE)) {
        const tCol = Math.floor(target.col);
        const tRow = Math.floor(target.row);
        const tile = world.tiles[tRow]?.[tCol];

        const activeFish = world.fishEvents.find(f => f.phase==='fish' && f.col===tCol && f.row===tRow);
        if (!min.isDelivering && activeFish) {
          world.fishEvents = world.fishEvents.filter(f=>f!==activeFish);
          min.state = 'carrying_fish';
          min.carryingFish = true;
          min.landed = false;
          return;
        }

        if (!min.isDelivering && tile && tile.planted) {
          if (min.isWaterMin && !tile.watered) tile.watered = true;
          min.state = "harvesting";
          min.targetTile = { col: tCol, row: tRow };
          min.col = tCol + 0.5;
          min.row = tRow + 0.5;
        } else if (!min.isDelivering && tile && tile.hasTree) {
          min.state = "tree_cutting";
          min.cuttingTreeCol = tCol;
          min.cuttingTreeRow = tRow;
          min.cuttingTimer = 0;
        } else if (!min.isDelivering) {
          const pond = world.pond;
          if (pond && tCol >= pond.col && tCol < pond.col + 2 && tRow >= pond.row && tRow < pond.row + 2) {
            min.state = "in_pond";
            min.soakTimer = POND_MIN_SOAK_MS;
            min.col = pond.col + 1;
            min.row = pond.row + 1;
          } else {
            settleMin(min);
          }
        }
      }
    }

    if (min.state === "harvesting") {
      const tile = world.tiles[min.targetTile.row][min.targetTile.col];
      if (tile.stage === PLANT_STAGES.CROP) {
        tile.planted = false;
        tile.watered = false;
        tile.growth = 0;
        tile.stage = PLANT_STAGES.EMPTY;
        tile.type = TILE_TYPES.DIRT;
        min.state = "carrying";
        min.targetTile = null;
      }
    }
  });
}

export function tryDepositToBox(character, box, world) {
  if (!character.held) return false;

    if (Math.hypot(character.col - box.col, character.row - box.row) <= BOX_INTERACTION_RADIUS) {
    if (character.held === "fish") {
      world.wallet += FISH_SALE_PRICE;
      world.fishCollected += 1;
    } else {
      world[`${character.held === "lumber" ? "lumber" : "crops"}Collected`] += 1;
      if (character.held === "crop") world.stats.cropsCollected++;
    }
    character.held = null;
    return true;
  }
  return false;
}

export function tryDepositToDominion(character, dominion, world) {
  if (character.held !== "crop") return false;

  if (Math.hypot(character.col - dominion.col, character.row - dominion.row) <= DOMINION_INTERACTION_RADIUS) {
    character.held = null;
    spawnNewMin(world.mins, dominion.col, dominion.row, "loose");
    return true;
  }
  return false;
}

export function tryCatchFish(character, world) {
  if (character.held) return false;
  for (const f of world.fishEvents) {
    if (f.phase !== 'fish') continue;
    if (Math.hypot(character.col - (f.col + 0.5), character.row - (f.row + 0.5)) <= FISH_CATCH_RADIUS) {
      character.held = 'fish';
      world.fishEvents = world.fishEvents.filter(x => x !== f);
      return true;
    }
  }
  return false;
}

export function tryHarvestCrop(character, world) {
  if (character.held) return false;

  const c = Math.floor(character.col), r = Math.floor(character.row);
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      const tile = world.tiles[r + dy]?.[c + dx];
      if (tile && tile.stage === PLANT_STAGES.CROP) {
        tile.planted = false;
        tile.watered = false;
        tile.growth = 0;
        tile.stage = PLANT_STAGES.EMPTY;
        tile.type = TILE_TYPES.DIRT;
        character.held = "crop";
        world.stats.harvested++;
        sfx('pick');
        return true;
      }
    }
  }
  return false;
}

export function tryTakeFromMin(character, mins) {
  if (character.held) return false;

  for (const min of mins) {
    if (min.state !== "carrying" && min.state !== "carrying_lumber" && min.state !== "carrying_fish") continue;

    if (Math.hypot(min.col - character.col, min.row - character.row) <= MIN_INTERACTION_RADIUS) {
      character.held = min.state === "carrying" ? "crop" : (min.state === "carrying_fish" ? "fish" : "lumber");
      if (character.held === "crop") world.stats.harvested++;
      min.state = "following";
      return true;
    }
  }
  return false;
}

export function tryCollectMin(character, mins, world) {
  for (const min of mins) {
    if (min.state !== "loose") continue;

    const distance = Math.hypot(min.col - character.col, min.row - character.row);

    if (distance <= MIN_INTERACTION_RADIUS) {
      min.state = "following";
      min.target = null;
      min.landed = false;
      min.throwDistance = 0;
      min.throwOrigin = null;
      min.lineToken = Date.now(); // Ensure min goes to back of line
      world.stats.minObtained++;
      sfx('pick');
      world.minUnlocked = true;
      return min;
    }
  }
  return null;
}


export function throwMin(character, mins, box, cursor = null) {
  // Respect line order: carriers front, then followers sorted by lineToken (front = lowest)
  const lineMins = mins.filter((min) =>
    min.state === "carrying" || min.state === "carrying_lumber" || min.state === "carrying_fish" ||
    (min.state === "following" && min.atHome)
  );
  lineMins.sort((a, b) => {
    const aCarrying = a.state === "carrying" || a.state === "carrying_lumber" || a.state === "carrying_fish" ? 1 : 0;
    const bCarrying = b.state === "carrying" || b.state === "carrying_lumber" || b.state === "carrying_fish" ? 1 : 0;
    if (aCarrying !== bCarrying) return bCarrying - aCarrying; // carriers first
    return (a.lineToken || 0) - (b.lineToken || 0); // front of line first
  });

  // Pick frontmost carrier, else frontmost follower (i.e. first min in line)
  const availableMin = lineMins.find((min) => min.state === "carrying" || min.state === "carrying_lumber" || min.state === "carrying_fish") ||
                       lineMins.find((min) => min.state === "following");

  if (!availableMin) return null; 


  availableMin.throwOrigin = { col: character.col, row: character.row };
  availableMin.throwDistance = 0;
  availableMin.landed = false;

  // Carrying items (crops or lumber) go to box
  if (availableMin.state === "carrying" || availableMin.state === "carrying_lumber" || availableMin.state === "carrying_fish")     {    
  
  if (availableMin.state === "carrying_lumber") {
    availableMin.carryingLumberForDelivery = true;
  }
  if (availableMin.state === "carrying" || availableMin.state === "carrying_fish") {
    availableMin.isDelivering = true;
  }


    availableMin.atHome = false;
    availableMin.state = "thrown";
    availableMin.isDelivering = true;
    availableMin.target = { col: box.col, row: box.row };
    return availableMin;  

  }

  // Following mins go to cursor or button
  availableMin.isDelivering = false;
  availableMin.carryingLumberForDelivery = false;
  const target = cursor
    ? { col: cursor.col, row: cursor.row }
    : { col: character.col, row: character.row };

  const dx = target.col - character.col;
  const dy = target.row - character.row;
  const distance = Math.hypot(dx, dy);
  const clampedDistance = Math.min(distance, THROW_MAX_DISTANCE);

  availableMin.target = {
    col: character.col + (dx / Math.max(distance, 0.0001)) * clampedDistance,
    row: character.row + (dy / Math.max(distance, 0.0001)) * clampedDistance
  };
  availableMin.atHome = false;
  availableMin.state = "thrown";

  return availableMin;
}

function clampTileValue(value, max) {
  return Math.max(0, Math.min(max - 1, Math.floor(value)));
}

export function useToolAtCursor(world, cursor, character) {
  if (!cursor) return false;
  
  const col = clampTileValue(cursor.col, cols);
  const row = clampTileValue(cursor.row, rows);
  
  const tile = world.tiles[row][col];
  if (!tile) return false;


  // Define buried soul at this tile BEFORE using it
  const buriedSoul = world.souls.find(s => !s.revealed && !s.collected && Math.floor(s.col) === col && Math.floor(s.row) === row);

  // Prevent interactions on stone tiles
  if (tile.type === TILE_TYPES.STONE) return false;

  // Prevent interactions on sand and water tiles
  if (tile.type === TILE_TYPES.SAND || tile.type === TILE_TYPES.WATER && world.selectedTool !== TOOL_TYPES.WATERING_CAN){

    if (!buriedSoul) return false;
  } 

  if (world.selectedTool === TOOL_TYPES.HOE) {
    // Prevent hoe on tiles with trees
    if (tile.variant === "decay" && world.soulsCollected < 3) return false;
    if (tile.hasTree) return false;
    sfx('chop');
    
    tile.type = TILE_TYPES.DIRT;
    tile.planted = false;
    tile.watered = false;
    tile.growth = 0;
    tile.stage = PLANT_STAGES.EMPTY;
    if (buriedSoul) buriedSoul.revealed = true; // dig up!
    world.stats.hoed++;
    return true;
  }

  if (world.selectedTool === TOOL_TYPES.SEEDS) {
    if (tile.type === TILE_TYPES.DIRT && !tile.planted && world.seedInventory > 0) {
      tile.planted = true;
      tile.watered = false;
      tile.growth = 0;
      tile.growDuration = GROWTH_DURATION_MIN + Math.random() * (GROWTH_DURATION_MAX - GROWTH_DURATION_MIN);
      tile.stage = PLANT_STAGES.SEED;
      world.seedInventory -= 1;
      world.stats.planted++;
      sfx('chop');
      return true;
      
    }
    return false;
  }

  if (world.selectedTool === TOOL_TYPES.WATERING_CAN) {
    // Refill can if clicking on the pond (assuming 3x3 pond)
    const isPondTile = col >= WATER_POND_COL && col < WATER_POND_COL + 3 &&
                       row >= WATER_POND_ROW && row < WATER_POND_ROW + 3;
    if (isPondTile && world.waterCanFillAmount < WATER_CAN_MAX) {
      world.waterCanFillAmount += 1;
      world.stats.filledWater++;
      sfx('water');
      return true;
    }

    if (tile.planted && !tile.watered && world.waterCanFillAmount > 0) {
      tile.watered = true;
      world.waterCanFillAmount -= 1;
      world.stats.watered++;
      sfx('water');
      return true;
    }   
    return false;
  }
  

  if (world.selectedTool === TOOL_TYPES.AXE) {
    // Only can axe tiles with trees
    if (!tile.hasTree) return false;

    // Decrement tree health
    tile.treeHealth -= 1;
    sfx('chop');

    // If tree is felled
    if (tile.treeHealth <= 0) {
      tile.hasTree = false;
      tile.lumber = true;
      // Add lumber object to world.lumber array
      world.lumber.push({
        col: col + 0.5,
        row: row + 0.5,
        id: Date.now() + Math.random()
      });
      world.stats.treesChopped++;
      return true;
    }

    return true; // Swing counted even if not fully felled
  }

  return false;
}

export function tryCollectSoul(character, world) {
  for (const soul of world.souls) {
    if (soul.collected || !soul.revealed) continue; // must be dug up first
    if (Math.hypot(character.col - soul.col, character.row - soul.row) <= 1.5) {
      soul.collected = true;
      world.soulsCollected++;
      sfx('pick');
      if (world.soulsCollected === 3) {
        showModal({
          title: "Souls Restored",
          bodyHtml: `<p>Max! Its me!, dead but chill 💀 abt it fr. You farmed like a sigma. Hoe the purple soil - crops there sell for DOUBLE. Unicorp can't stop ya. Chillis droppin' soon, property values MOON 📈. luv u!</p>`,
          buttons: [{ label: "Lit", className: "modal-btn--close" }]
        });
      }
      return true;
    }
  }
  return false;
}

// New function: pickup lumber like crops
export function tryPickupLumber(character, world) {
  if (character.held) return false;

  const c = Math.floor(character.col);
  const r = Math.floor(character.row);

  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      const checkCol = c + dx;
      const checkRow = r + dy;
      
      // Check if there's lumber at this tile
      for (let i = 0; i < world.lumber.length; i++) {
        const lumberItem = world.lumber[i];
        if (Math.floor(lumberItem.col) === checkCol && Math.floor(lumberItem.row) === checkRow) {
          character.held = "lumber";
          world.lumber.splice(i, 1);
          return true;
        }
      }
    }
  }
  return false;
}

export function updateWorld(world, deltaMs, character) {
  // 1. Handle Crop Growth (only scan if something is actually growing)
  let growing = false;
  for (let row = 0; row < rows && !growing; row++) {
    for (let col = 0; col < cols; col++) {
      const t = world.tiles[row][col];
      if (t.planted && t.watered && t.stage !== PLANT_STAGES.CROP) { growing = true; break; }
    }
  }
  if (growing) {
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const tile = world.tiles[row][col];
        if (!tile.planted || !tile.watered || tile.stage === PLANT_STAGES.CROP) continue;
        
        tile.growth += deltaMs;
        if (tile.growth >= tile.growDuration) {
          tile.stage = PLANT_STAGES.CROP;
        } else if (tile.growth >= tile.growDuration * 0.6) {
          tile.stage = PLANT_STAGES.SPROUT;
        } else {
          tile.stage = PLANT_STAGES.SEED;
        }
      }
    }
  }

  updateFish(world, deltaMs);

}