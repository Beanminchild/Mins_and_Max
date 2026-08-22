import {  
  MIN_SPAWN_COUNT,
  MIN_INTERACTION_RADIUS,  
  DIRECTION_VECTORS,
  THROW_TARGET_RADIUS,
  THROW_SUCCESS_BASE,
  THROW_SUCCESS_PER_DISTANCE,
  THROW_MAX_DISTANCE,
  cols,
  rows,
  TOOL_TYPES,
  TILE_TYPES,
  PLANT_STAGES,
  GROWTH_DURATION_MIN,
  GROWTH_DURATION_MAX,
  BOX_COL,
  BOX_ROW,
  BOX_INTERACTION_RADIUS,
  DOMINION_COL,
  DOMINION_ROW,
  DOMINION_INTERACTION_RADIUS,
  WATER_CAN_MAX,
  REFILL_RATE_MS,
  WATER_POND_COL,
  WATER_POND_ROW,
  WATER_POND_INTERACTION_RADIUS,
  SHOPKEEPER_COL,
  SHOPKEEPER_ROW,
  SEED_MAX,
  TREE_SWINGS_TO_FELL,
  TREE_CUT_TIME_1_MIN,
  TREE_CUT_TIME_2_MIN,
  TREE_CUT_TIME_3_MIN,
  MAX_LUMBER_ITEMS
} from "./constants.js";

import { showModal } from "./modal.js";

let waterCanFillAmount = 5;

export function createBox() {
  return {
    col: 6,
    row: 14
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

  const isFollowing = state === "following" || state === "carrying" || state === "carrying_lumber";
  g.fillStyle = isFollowing ? "#f7c873" : "#8c5b2b";
  
  if (state === "going_to_box" || state === "returning_to_dominion") {
    g.fillStyle = "#64b5f6";
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

export function createWorld() {
  const mins = Array.from({ length: MIN_SPAWN_COUNT }, (_, index) => ({
    id: index + 1,
    col: 15 + (index % 3) * 2,
    row: 15 + Math.floor(index / 3) * 2,
    state: "loose",
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
  }));

  // Grandpas Graveyard (randomized positions)
  const gravestones = [
     { col: 2 + Math.random() * 8,
      row: 1 + Math.random() * 6,
      id: 0}   
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
    going_to_box: createMinSprite("going_to_box"),
    returning_to_dominion: createMinSprite("returning_to_dominion"),
    thrown: createMinSprite("loose"),
    tree_cutting: createMinSprite("tree_cutting")
  };

  return {
    box: createBox(),
    dominion: createDominion(),
    pond: { col: WATER_POND_COL, row: WATER_POND_ROW },
    shopOpen: false,
    mins,
    tiles,
    gravestones,
    lumber,
    treeSprite,
    gravestoneSprite,
    minSprites,
    selectedTool: TOOL_TYPES.HOE,
    cropsCollected: 0,
    lumberCollected: 0,
    waterCanFillAmount: 5,
    seedsCollected: 0,
    isRefillingWater: false,
    refillTimer: 0,
    seedInventory: 0,
    minInventory: 0,

    dayLengthMs: 5 * 60 * 1000,
    dayElapsedMs: 0,
    dayProgress: 0,
    dayNumber: 1,
    wallet: 25,
    dayEnded: false
  };
}

// ... existing functions ...

export function tryInteractWithShop(character, world) {
  if (!world.shopkeeper) return false;

  const distance = Math.hypot(character.col - world.shopkeeper.col, character.row - world.shopkeeper.row);
  if (distance <= 1.6) {
    world.shopOpen = true;
    return true;
  }

  return false;
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
    bodyHtml: `
      <p style="font-size:18px;line-height:1.6;">
        Here lies Max's Grandpa...<br><br>
        <strong>Full Name: Max's Grandpa Sr.</strong>
      </p>
      <hr style="border:1px solid #5d4037;margin:20px 0;">
      <p style="font-size:14px;color:#6d4c41;">
        Coming soon: <strong>A new luxury highrise apartment</strong><br>and a <strong>Chillies!</strong>
      </p>`,
    buttons: [{ label: "Close", className: "modal-btn--close" }],
  });
}

// Logic to check if player can start refilling
export function tryInteractWithPond(character, world) {
  if (world.selectedTool !== TOOL_TYPES.WATERING_CAN) return false;
  if (world.waterCanFillAmount >= WATER_CAN_MAX) return false;

  // Pond center (for a 3x3 pond starting at COL, ROW)
  const pondCenterX = WATER_POND_COL + 1; 
  const pondCenterY = WATER_POND_ROW + 1;
  const distance = Math.hypot(character.col - pondCenterX, character.row - pondCenterY);

  // Interaction check (radius + pond half-width)
  if (distance <= WATER_POND_INTERACTION_RADIUS + 2) {
    world.isRefillingWater = true;
    return true;
  }
  return false;
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
  
}

export function spawnNewMin(mins, col, row, initialState = "loose") {
  const newMin = {
    id: Date.now() + Math.random(),
    col: col,
    row: row,
    state: initialState,
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

  // 1. Sort followers so that those carrying crops/lumber are at the front of the line
  const followers = mins.filter((min) => min.state === "following" || min.state === "carrying" || min.state === "carrying_lumber");
  followers.sort((a, b) => {
    // Carrying items (crops and lumber) come first
    const aCarrying = a.state === "carrying" || a.state === "carrying_lumber" ? 1 : 0;
    const bCarrying = b.state === "carrying" || b.state === "carrying_lumber" ? 1 : 0;
    return bCarrying - aCarrying;
  });

  followers.forEach((min, index) => {
    const vector = DIRECTION_VECTORS[character.dir] || { dx: 0, dy: 0 };
    const offsetAmount = 0.7 + index * 0.25;

    const targetCol = character.col - vector.dx * offsetAmount;
    const targetRow = character.row - vector.dy * offsetAmount;

    moveToward(min, targetCol, targetRow, 0.12);
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
          // Pick up lumber
          min.state = "carrying_lumber";
          min.carryingLumberForDelivery = false; // First throw - return to character
          world.lumber.splice(i, 1);
          min.landed = false;
          return;
        }
      }
    }

    // --- NEW: Tree Cutting Cooperation ---
    if (min.state === "tree_cutting") {
      const tCol = min.cuttingTreeCol;
      const tRow = min.cuttingTreeRow;
      const tile = world.tiles[tRow]?.[tCol];

      if (!tile || !tile.hasTree) {
        // Tree no longer exists or was felled, stop cutting
        min.state = "loose";
        min.cuttingTimer = 0;
        min.cuttingTreeCol = null;
        min.cuttingTreeRow = null;
        return;
      }

      // Move toward tree
      moveToward(min, tCol + 0.5, tRow + 0.5, 0.12);

      // Count other mins also cutting this tree
      const otherCutters = mins.filter(m => 
        m.state === "tree_cutting" && 
        m.cuttingTreeCol === tCol && 
        m.cuttingTreeRow === tRow
      ).length;

      const totalCutters = otherCutters + 1; // Include self
      let cutTime;
      if (totalCutters === 1) cutTime = TREE_CUT_TIME_1_MIN;
      else if (totalCutters === 2) cutTime = TREE_CUT_TIME_2_MIN;
      else cutTime = TREE_CUT_TIME_3_MIN;

      min.cuttingTimer += 16; // Approximate frame time
      if (min.cuttingTimer >= cutTime) {
        // Tree is felled!
        tile.hasTree = false;
        tile.lumber = true;

        // Add lumber to world
        if (world.lumber.length < MAX_LUMBER_ITEMS) {
          world.lumber.push({
            col: tCol + 0.5,
            row: tRow + 0.5,
            id: Date.now() + Math.random()
          });
        }

        // One min carries lumber (will follow player like crops)
        min.state = "carrying_lumber";
        // Push min away from tree to prevent getting stuck
        const pushDist = 2;
        const angle = Math.atan2(min.row - (tRow + 0.5), min.col - (tCol + 0.5));
        min.col = (tCol + 0.5) + Math.cos(angle) * pushDist;
        min.row = (tRow + 0.5) + Math.sin(angle) * pushDist;
        min.cuttingTimer = 0;
        min.cuttingTreeCol = null;
        min.cuttingTreeRow = null;
        min.landed = false;

        // Other mins stop cutting, go loose, and push away from tree
        mins.forEach(m => {
          if (m.state === "tree_cutting" && m.cuttingTreeCol === tCol && m.cuttingTreeRow === tRow && m.id !== min.id) {
            m.state = "loose";
            m.cuttingTimer = 0;
            m.cuttingTreeCol = null;
            m.cuttingTreeRow = null;
            // Push away from tree
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
      const distToDominion = Math.hypot(min.col - dominion.col, min.row - dominion.row);
      if (distToDominion < 1.5 && world.cropsCollected > 0 && world.selectedTool === "min") {
        min.state = "going_to_box";
      }
    }

    if (min.state === "going_to_box") {
      moveToward(min, box.col, box.row, 0.14);
      if (Math.hypot(min.col - box.col, min.row - box.row) < 0.2) {
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
      if (Math.hypot(min.col - dominion.col, min.row - dominion.row) < 0.2) {
        spawnNewMin(mins, dominion.col, dominion.row, "following");
        min.state = "following";
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

      const distanceToTarget = Math.hypot(min.col - target.col, min.row - target.row);
      const reachedTarget = distanceToTarget <= 0.18;

    if (min.isDelivering && reachedTarget) {
      console.log("min.state:", min.state);
      if (min.carryingLumberForDelivery) {
        console.log("Min delivered a lumber to the box!");
        world.lumberCollected += 1;
        
      }
      else{
        console.log("Min delivered crops to box")
        world.cropsCollected += 1;
      }    
      min.state = "following";
      min.isDelivering = false;
      return;
    }      

      if (reachedTarget || (!min.isDelivering && (min.throwDistance ?? 0) >= THROW_MAX_DISTANCE)) {
        const tCol = Math.floor(target.col);
        const tRow = Math.floor(target.row);
        const tile = world.tiles[tRow]?.[tCol];

        if (!min.isDelivering && tile && tile.planted) {
          min.state = "harvesting";
          min.targetTile = { col: tCol, row: tRow };
          min.col = tCol + 0.5;
          min.row = tRow + 0.5;
        } else if (!min.isDelivering && tile && tile.hasTree) {
          // NEW: Start cutting tree
          min.state = "tree_cutting";
          min.cuttingTreeCol = tCol;
          min.cuttingTreeRow = tRow;
          min.cuttingTimer = 0;
        } else if (!min.isDelivering) {
          settleMin(min);

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
    world[`${character.held === "lumber" ? "lumber" : "crops"}Collected`] += 1;
    
    character.held = null;
    return true;
  }
  return false;
}

export function tryDepositToDominion(character, dominion, world, mins) {
  if (character.held !== "crop") return false;

  if (Math.hypot(character.col - dominion.col, character.row - dominion.row) <= DOMINION_INTERACTION_RADIUS) {
    character.held = null;
    spawnNewMin(mins, dominion.col, dominion.row, "loose");
    return true;
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
        return true;
      }
    }
  }
  return false;
}

export function tryTakeFromMin(character, mins) {
  if (character.held) return false;

  for (const min of mins) {
    if (min.state !== "carrying" && min.state !== "carrying_lumber") continue;

    if (Math.hypot(min.col - character.col, min.row - character.row) <= MIN_INTERACTION_RADIUS) {
      character.held = min.state === "carrying" ? "crop" : "lumber";
      min.state = "following";
      return true;
    }
  }
  return false;
}

export function tryCollectMin(character, mins) {
  for (const min of mins) {
    if (min.state !== "loose") continue;

    const distance = Math.hypot(min.col - character.col, min.row - character.row);

    if (distance <= MIN_INTERACTION_RADIUS) {
      min.state = "following";
      min.target = null;
      min.landed = false;
      min.throwDistance = 0;
      min.throwOrigin = null;
      return min;
    }
  }
  return null;
}


export function throwMin(character, mins, box, cursor = null) {
  // Prioritize mins: first carrying (crops/lumber), then following
  const availableMin = mins.find((min) => min.state === "carrying" || min.state === "carrying_lumber") ||
                       mins.find((min) => min.state === "following");
  
  if (!availableMin) return null;

  availableMin.throwOrigin = { col: character.col, row: character.row };
  availableMin.throwDistance = 0;
  availableMin.landed = false;

  // Carrying items (crops or lumber) go to box
  if (availableMin.state === "carrying" || availableMin.state === "carrying_lumber") {    
  
  if (availableMin.state === "carrying_lumber"){   
    availableMin.carryingLumberForDelivery = true;    
    console.log("is lumber bein registered", availableMin.carryingLumberForDelivery)
  }
  if ( availableMin.state === "carrying"){
     availableMin.isDelivering = "true";
     console.log("somehow is delivering", availableMin.isDelivering)

  }
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
  availableMin.state = "thrown";

  return availableMin;
}

function clampTileValue(value, max) {
  return Math.max(0, Math.min(max - 1, Math.floor(value)));
}

export function useToolAtCursor(world, cursor) {
  if (!cursor) return false;
  const col = clampTileValue(cursor.col, cols);
  const row = clampTileValue(cursor.row, rows);
  const tile = world.tiles[row][col];
  if (!tile) return false;

  // Prevent interactions on stone tiles
  if (tile.type === TILE_TYPES.STONE) return false;

  // Prevent interactions on sand and water tiles
  if (tile.type === TILE_TYPES.SAND || tile.type === TILE_TYPES.WATER) return false;

  if (world.selectedTool === TOOL_TYPES.HOE) {
    // Prevent hoe on tiles with trees
    if (tile.hasTree) return false;
    
    tile.type = TILE_TYPES.DIRT;
    tile.planted = false;
    tile.watered = false;
    tile.growth = 0;
    tile.stage = PLANT_STAGES.EMPTY;
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
      return true;
    }
    return false;
  }

  if (world.selectedTool === TOOL_TYPES.WATERING_CAN) {
    if (tile.planted && !tile.watered && world.waterCanFillAmount > 0) {
      tile.watered = true;
      world.waterCanFillAmount -= 1;
      return true;
    }
    return false;
  }
  

  if (world.selectedTool === TOOL_TYPES.AXE) {
    // Only can axe tiles with trees
    if (!tile.hasTree) return false;

    // Decrement tree health
    tile.treeHealth -= 1;

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
      return true;
    }

    return true; // Swing counted even if not fully felled
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
  // 1. Handle Crop Growth
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

  // 2. Handle Water Refill Logic (Moved outside the loops)
  if (world.isRefillingWater && character) {
    const pondCenterX = WATER_POND_COL + 1.5;
    const pondCenterY = WATER_POND_ROW + 1.5;
    const distance = Math.hypot(character.col - pondCenterX, character.row - pondCenterY);

    // Stop refilling if player moves away or switches tools
    if (distance > WATER_POND_INTERACTION_RADIUS + 2 || world.selectedTool !== TOOL_TYPES.WATERING_CAN) {
      world.isRefillingWater = false;
      world.refillTimer = 0;
    } else {
      world.refillTimer += deltaMs;
      if (world.refillTimer >= REFILL_RATE_MS) {
        if (world.waterCanFillAmount < WATER_CAN_MAX) {
          world.waterCanFillAmount++;
          world.refillTimer = 0;
        } else {
          world.isRefillingWater = false;
          world.refillTimer = 0;
        }
      }
    }
  }
}