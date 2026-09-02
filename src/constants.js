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
export const DOMINION_INTERACTION_RADIUS = 1.0;

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
export const FISH_VISIBLE_MS = 533;       // fish "out" for 1.5s
export const FISH_CATCH_RADIUS = .75;
export const FISH_SALE_PRICE = 175;

// Relocate the shopkeeper to be inside/at the door of the shop
export const SHOPKEEPER_COL = 18.5; 
export const SHOPKEEPER_ROW = 16.5;
export const WATER_CAN_MAX = 9;

export const SIGNPOST_INTERACTION_RADIUS = 1.5;

export const SIGNPOSTS = [
  { 
    col: 23, 
    row: 12, 
    title: "Old Sign", 
    text: "Rosebud Village: In these parts we use <b>Numbers</b> to select tools, <b>Click</b> to use selected tools and <b>[Space]</b> to interact with stuff were infront of! Its a big part of our culture!" 
  },
  { 
    col: 36, 
    row: 4, 
    title: "Notice", 
    text: "Deep water! Great for filling cans or letting your Mins have a soak." 
  },
  { 
    col: 17, 
    row: 17, 
    title: "Unicorp Min Guide", 
    text: " Min are powerful tech and can do a lot! We highly encourage experimentation in order to maximize productivity.", 
  },
  {
    col: 3, 
    row: 25, 
    title: "Fish <b>MIN</b>-y Game ©", 
    text: "Throw min at fish when it appears! The timing is tricky but u got it! Fish are sold instantly when depositied so if you ever need some quick cash, fish!" 
  }
];




export const TASKS = [
  { id: 'hoe',        desc: 'Hoe tiles',            stat: 0, target: 3 },
  { id: 'plant',      desc: 'Plant seeds',          stat: 1, target: 3 },
  { id: 'fillwater',  desc: 'Fill water',          stat: 10, target: 3 },
  { id: 'water',      desc: 'Water seeds',         stat: 2, target: 3 },
  { id: 'harvest',    desc: 'Harvest one crop',    stat: 3, target: 1 },
  { id: 'give',       desc: 'Give crop to Emmie',  stat: 4, target: 1 },
  { id: 'axe',        desc: 'Use Axe to cut tree', stat: 5, target: 1 },
  { id: 'gotoshop',   desc: 'Go to Unicorp HQ',    stat: 8, target: 1 },
  { id: 'firstcrops', desc: 'Deposit crops in box', stat: 9, target: 3 },
  { id: 'firstMin',   desc: 'Give Crop to Diamond?', stat: 6, target: 1 },
  { id: 'mC',         desc: 'Deposit crops using Min', stat: 9, target: 10 },
  { id: 'gpa',        desc: 'Visit Gpaps Grave',   stat: 12, target: 1 },
  { id: 'mC',         desc: 'Deposit crops',       stat: 9, target: 30 },
  { id: 'mF',         desc: 'Catch fish using min', stat: 7, target: 1 },
  { id: 'mC2',        desc: 'Deposit crops',       stat: 9, target: 60 },
  { id: 'c',          desc: 'Get Farmaxxing Cert', stat: 12, target: 1 },
  { id: 'complete',   desc: 'Buy Farm Back from Unicorp', stat: 13, target: 1 },
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

