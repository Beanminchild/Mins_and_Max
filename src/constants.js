export const cols = 48;
export const rows = 32;
export const TILE_W = 64;
export const TILE_H = 32;

export const moveStepSize = 0.25;
export const moveStepMs = 60;

export const BUTTON_REQUIRED_MIN = 3;
export const MIN_SPAWN_COUNT = 5;
export const MIN_INTERACTION_RADIUS = 1.2;
export const BUTTON_INTERACTION_RADIUS = 1.2;
export const HARVEST_RADIUS = 1.0;

export const THROW_TARGET_RADIUS = 2.4;
export const THROW_SUCCESS_BASE = 0.5;
export const THROW_SUCCESS_PER_DISTANCE = 0.08;
export const THROW_MAX_DISTANCE = 8;

export const BOX_COL = 6;
export const BOX_ROW = 14;
export const BOX_INTERACTION_RADIUS = 2.75;

export const DOMINION_COL = 38;
export const DOMINION_ROW = 16;
export const DOMINION_INTERACTION_RADIUS = 1.5;

export const WATER_POND_COL = 16;
export const WATER_POND_ROW = 15;
export const WATER_POND_INTERACTION_RADIUS = 1.5;

export const SHOP_BUILDING_COL = 17;
export const SHOP_BUILDING_ROW = 16;
export const OTHER_BUILDING_COL = 42;
export const OTHER_BUILDING_ROW = 3;

// Relocate the shopkeeper to be inside/at the door of the shop
export const SHOPKEEPER_COL = 1.3; 
export const SHOPKEEPER_ROW = 12;

export const WATER_CAN_MAX = 7;
export const REFILL_RATE_MS = 1400;

export const SEED_MAX = 99;

export const TOOL_TYPES = {
  HOE: "hoe",
  SEEDS: "seeds",
  WATERING_CAN: "watering-can",
  AXE: "axe",
  MIN: "min",
  HANDS: "empty-hands"
};

export const TILE_TYPES = {
  GRASS: "grass",
  DIRT: "dirt",
  STONE: "stone",
  SAND: "sand",
  WATER: "water"
};

export const PLANT_STAGES = {
  EMPTY: "empty",
  SEED: "seed",
  SPROUT: "sprout",
  CROP: "crop"
};

export const GROWTH_DURATION_MIN = 60000;
export const GROWTH_DURATION_MAX = 90000;

export const TREE_SWINGS_TO_FELL = 33;

// Tree cutting with cooperative mins
export const TREE_CUT_TIME_1_MIN = 30000;  // 30 seconds for 1 min
export const TREE_CUT_TIME_2_MIN = 15000;  // 15 seconds for 2 mins
export const TREE_CUT_TIME_3_MIN = 10000;  // 10 seconds for 3+ mins

// Lumber performance limits
export const MAX_LUMBER_ITEMS = 200;

export const INV_SQRT2 = 1 / Math.sqrt(2);

export const DIRECTION_VECTORS = [
  { dx: 1, dy: 0 },
  { dx: INV_SQRT2, dy: INV_SQRT2 },
  { dx: 0, dy: 1 },
  { dx: -INV_SQRT2, dy: INV_SQRT2 },
  { dx: -1, dy: 0 },
  { dx: -INV_SQRT2, dy: -INV_SQRT2 },
  { dx: 0, dy: -1 },
  { dx: INV_SQRT2, dy: -INV_SQRT2 }
];

export const WALK_POSES = [
  { armSwing: -7, legSwing: 8 },
  { armSwing: -3.5, legSwing: 4 },
  { armSwing: 0, legSwing: 0 },
  { armSwing: 3.5, legSwing: -4 },
  { armSwing: 7, legSwing: -8 }
];

export const DIRECTION_STYLES = [
  { bodyOffsetX: 0, bodyOffsetY: 0, headOffsetX: 0, headOffsetY: 0 },
  { bodyOffsetX: 2, bodyOffsetY: 1, headOffsetX: 1, headOffsetY: 0 },
  { bodyOffsetX: 0, bodyOffsetY: 2, headOffsetX: 0, headOffsetY: 1 },
  { bodyOffsetX: -2, bodyOffsetY: 1, headOffsetX: -1, headOffsetY: 0 },
  { bodyOffsetX: 0, bodyOffsetY: 0, headOffsetX: 0, headOffsetY: 0 },
  { bodyOffsetX: -2, bodyOffsetY: -1, headOffsetX: -1, headOffsetY: -1 },
  { bodyOffsetX: 0, bodyOffsetY: -2, headOffsetX: 0, headOffsetY: -1 },
  { bodyOffsetX: 2, bodyOffsetY: -1, headOffsetX: 1, headOffsetY: -1 }
];

export const PLACEHOLDER_LOOK = {
  hair: "#d95730",
  skin: "#f2c59c",
  coat: "#5b78d9",
  pants: "#263140",
  trim: "#f4d683",
  boots: "#1e2430",
  scarf: "#c95f5f"
};

export const SHOPKEEPER_LOOK = {
  hair: "#ffb7c5",   // Pink mane
  skin: "#ffffff",   // White unicorn body
  coat: "#222222",   // Black suit jacket
  pants: "#333333",  // Dark grey trousers
  trim: "#ffffff",   // White shirt collar
  boots: "#111111",  // Black hooves/shoes
  scarf: "#cc0000",  // Red power tie
  horn: "#ffd700"    // Gold horn
};

