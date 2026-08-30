export const cols = 48;
export const rows = 32;
export const TILE_W = 64;
export const TILE_H = 32;

export const moveStepSize = 0.33;
export const moveStepMs = 60;



export const MIN_INTERACTION_RADIUS = 1.2;


export let   TOOL_REACH_DISTANCE = 3.5;



export const THROW_MAX_DISTANCE = 8;

export const BOX_COL = 18;
export const BOX_ROW = 14;
export const BOX_INTERACTION_RADIUS = 2.75;

export const DOMINION_COL = 38;
export const DOMINION_ROW = 16;
export const DOMINION_INTERACTION_RADIUS = 1.5;

export const WATER_POND_COL = 35;
export const WATER_POND_ROW = 3;




export const POND_MIN_SOAK_MS = 2 * 60 * 1000; // 2 minutes real time in pond


export const SHOP_BUILDING_COL = 18;
export const SHOP_BUILDING_ROW = 16;
export const OTHER_BUILDING_COL = 42;
export const OTHER_BUILDING_ROW = 3;

// src/constants.js (suggested additions)
export const FISH_RIPPLE_SPAWN_MS = 9000;   // new ripple every ~4s
export const FISH_RIPPLE_RAMP_MS = 4500;    // time ripple takes to speed up
export const FISH_VISIBLE_MS = 400;       // fish "out" for 1.5s
export const FISH_CATCH_RADIUS = .75;
export const FISH_SALE_PRICE = 150;

// Relocate the shopkeeper to be inside/at the door of the shop
export const SHOPKEEPER_COL = 18.5; 
export const SHOPKEEPER_ROW = 16.5;
export const MERCHANT_TEMP_COL = 30;
export const MERCHANT_TEMP_ROW = 5;

export const WATER_CAN_MAX = 9;

export const TASKS = [
  { id: 'hoe',     desc: 'Hoe tiles',      stat: 'hoed',      target: 3 },
  { id: 'plant',   desc: 'Plant seeds',    stat: 'planted',   target: 3 },
  { id: 'fillwater', desc: 'Fill water can in Pond', stat: 'filledWater', target: 3 },
  { id: 'water',   desc: 'Water seeds',    stat: 'watered',   target: 3 },
  { id: 'harvest', desc: 'Harvest one crop',    stat: 'harvested', target: 1 },
  { id: 'give',    desc: 'Give crop to Emmie', stat: 'given',  target: 1 },
  { id: 'axe',     desc: 'Use Axe to cut tree', stat: 'treesChopped', target: 1 },
  { id:'gotoshop', desc: 'Talk to Emmie @ Unicorp local HQ', stat: 'visitedShop', target: 1 },
  { id: 'firstcrops', desc: 'Deposit crops in box', stat: 'cropsCollected', target: 3},
  { id: 'firstMin', desc: 'Buy your first Min!',  stat: 'minObtained', target: 1 },
   { id: 'minCrops', desc: 'Deposit crops using min', stat: 'cropsCollected', target: 8},

];

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

export const GROWTH_DURATION_MIN = 7000;
export const GROWTH_DURATION_MAX = 9000;

export const TREE_SWINGS_TO_FELL = 22;

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

