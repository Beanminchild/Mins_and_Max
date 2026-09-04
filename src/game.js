import { setupInput } from "./input.js";
import { createCharacter, updateCharacterFromControls, updateCamera } from "./character.js";
import { createSpriteBank, drawScene } from "./render.js";
import {
  createWorld,
  throwMin,
  tryCollectMin,  
  updateMins,
  updateWorld,
  useToolAtCursor,
  tryHarvestCrop, 
  tryCatchFish, 
  tryDepositToBox,
  tryDepositToDominion,  
  tryInteractWithShop,
  tryInteractWithGravestone,
  tryInteractWithSign,
  spawnNewMin, 
  tryPickupLumber,
  tryTakeFromMin,
  tryCollectSoul,
  
} from "./interactions.js";
import { TOOL_TYPES, SHOPKEEPER_LOOK, SHOPKEEPER_COL, SHOPKEEPER_ROW, OTHER_BUILDING_COL, OTHER_BUILDING_ROW, TOOL_REACH_DISTANCE, TASKS, WATER_POND_COL, WATER_POND_ROW } from "./constants.js";

import { 
  showModal, 
  isModalOpen, 
  closeModal 
} from "./modal.js";

import {
  playSong,
  sfx
} from "./sound.js"


let DAYS_LEFT = 15;

const $ = i => document.getElementById(i);
const elWallet = $("wallet-amount"), elCrop = $("crop-count"), elFarm = $("farm-name"),
      elTask = $("task-list"), elHand = $("clock-hand"), elDay = $("days-left");


const SAVE_KEY = "minsMaxSave";

// ---- Save / Load ----
function saveGame() {
  const data = {
    w: world.w,
    s: world.s,
    x: world.x,
    n: world.n,
    daysLeft: DAYS_LEFT,
    I: world.I,
    a: world.a,
    u: world.u,
    v: world.v,
    r: world.r,
    h: world.h,
    e: world.e,
    c: world.c,
    b: world.b,
    l: world.l,
    f: world.f,
    k: world.k,
    t: world.t.map(row => row.map(t => ({
      type: t.type, planted: t.planted, watered: t.watered, growth: t.growth,
      growDuration: t.growDuration, stage: t.stage, variant: t.variant,
      hasTree: t.hasTree, treeHealth: t.treeHealth, lumber: t.lumber
    }))),
    q: world.q,
    g: world.g,
    o: world.o,
    m: world.m.map(m => ({ id:m.id, col:m.col, row:m.row, state:m.state, atHome:m.atHome, lineToken:m.lineToken, cropTL:m.cropTL, carryingFish:m.carryingFish, isWaterMin:m.isWaterMin, isRainbowMin:m.isRainbowMin })),
    
    X: world.X || 0,
    A: world.A || false,
    
    K: { col: world.K.col, row: world.K.row }
  };
  localStorage.setItem("minsMaxSave", JSON.stringify(data));
}

function loadGame() {
  const raw = localStorage.getItem("minsMaxSave");
  if (!raw) return false;
  const d = JSON.parse(raw);
  Object.assign(world, {
    w: d.w, s: d.s, x: d.x,
    n: d.n, I: d.I, a: d.a,
    u: d.u, v: d.v, r: d.r,
    e: d.e, c: d.c, b: d.b,
    l: d.l, h: d.h, f: d.f, k: d.k,
    q: d.q, g: d.g, o: d.o, X: d.X || 0,
    A: d.A || false,
  });
  DAYS_LEFT = d.daysLeft;
  d.t.forEach((row, r) => row.forEach((t, c) => Object.assign(world.t[r][c], t)));
  world.m.length = 0;
  d.m.forEach(m => world.m.push({
    ...m,
    target: null,
    targetTile: null,
    throwOrigin: null,
    throwDistance: 0,
    landed: false,
    isDelivering: false,
    cuttingTimer: 0,
    cuttingTreeCol: null,
    cuttingTreeRow: null
  }));
  world.K.col = d.K.col;
  world.K.row = d.K.row;
  return true;
}

function showSleepPrompt() {
  if (isModalOpen()) return;

  const buttons = [];

  if (world.x >= 8) {
    buttons.push({
      label: "Yes (Sleep)",
      className: "modal-btn--yes",
      onClick: () => {
        endDay();
        DAYS_LEFT--;
      }
    });
  }

  buttons.push({
    label: "No",
    className: "modal-btn--no",
    onClick: () => {
      closeModal();
      character.col += 1;          
    },
  });

  showModal({
    title: "Go to bed?",
    bodyHtml: "<p>This will end the day.</p>",
    buttons: buttons,
  });
}

function showStartMenu() {
  const hasSave = !!localStorage.getItem(SAVE_KEY);
  const buttons = [];

  if (hasSave) {
    buttons.push({
      label: "Continue",
      className: "modal-btn--yes",
      onClick: () => {
        loadGame();
        closeModal();
        syncHUD();
      }
    });
  }

  buttons.push({
    label: "New Game",
    className: hasSave ? "modal-btn--no" : "modal-btn--yes",
    onClick: () => {
      localStorage.removeItem("minsMaxSave");
      closeModal();
    }
  });

  buttons.push({
    label: "Story",
    className: "modal-btn--no",
    onClick: () => showStory(0) // Start at the first page
  });

  showModal({
    title: "Mins & Max Vs UniCorp",
    bodyHtml: "",
    buttons
  });
}

function showStory(index) {
  const blurbs = [
  "Max: To save the farm, I have to pay off Grandpa’s loans?",
  "Emmie: Yep.",
  "Max: I can't farm that fast!",
  "Emmie: Use our new Min Tech! Theyre sub-agents that automate everything.",
  "Max: Is it farming if I do nothing?",
  "Emmie: You're orchestrating! It's Agentic Farming! 10x productivity! This is our next unicorn!",
  
];

  const buttons = [];
  
  // Back button logic
  if (index === 0) {
    buttons.push({ label: "Menu", className: "modal-btn--no", onClick: showStartMenu });
  } else {
    buttons.push({ label: "Back", className: "modal-btn--no", onClick: () => showStory(index - 1) });
  }

  // Next/Finish button logic
  if (index < blurbs.length - 1) {
    buttons.push({ label: "Next", className: "modal-btn--yes", onClick: () => showStory(index + 1) });
  } else {
    buttons.push({ label: "Let's Go!", className: "modal-btn--yes", onClick: showStartMenu });
  }

  showModal({
    title: `The Story (${index + 1}/${blurbs.length})`,
    bodyHtml: `<p>${blurbs[index]}</p>`,
    buttons
  });
}


  
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const keys = setupInput(new Set(),
  (code) => {
    const map = { Digit1:"empty-hands", Digit2:"hoe", Digit3:"seeds", Digit4:"watering-can", Digit5:"axe", Digit6:"min" };
    const tool = map[code];
    if (!tool) return;
    if (tool === "axe" && !world.u) return;
    if (tool === "min" && !world.v) return;
    world.e = tool;
    syncHUD();
  },
  () => { if (world.S) closeShop(); }
);
const character = createCharacter();
const spriteBank = createSpriteBank();
const shopkeeper = createCharacter();
const shopkeeperSpriteBank = createSpriteBank(SHOPKEEPER_LOOK, { showPigtails: false, isUnicorn: true });
export const world = createWorld();
world.K = shopkeeper;
if (world.s[4] < 1) {
  shopkeeper.col = WATER_POND_COL+3;
  shopkeeper.row = WATER_POND_ROW+2;
} else {
  shopkeeper.col = SHOPKEEPER_COL;
  shopkeeper.row = SHOPKEEPER_ROW;
}




if (!world.e) {
  world.e = TOOL_TYPES.MIN;
}

const { m: mins } = world;


canvas.style.cursor = "none";
let cursor = null;
let camera = { x: canvas.width / 2, y: 110 };
let lastFrameTime = performance.now();
let lastPhase = '';

function updateClock() {
  const hand = elHand;

  const progress = Math.min(Math.max(world.p || 0, 0), 1);
  const songPhase = progress < 0.2 ? 'dawn' : progress < 0.6 ? 'day' : progress < 0.8 ? 'dusk' : 'night';
  if (songPhase !== lastPhase) { playSong(songPhase); lastPhase = songPhase; }

  const angle = 180 + (progress * 180); // use numeric progress, not string
  hand.style.transform = `translate(0, -50%) rotate(${angle}deg)`;
}




function openShop() {
  world.S = true;  
  const shopButtons = [];
  const lumberHave = world.s[11] || 0;
  const barnLocked = world.r || lumberHave < 50;
  shopButtons.push(
    `<button class="shop-button" data-buy="barn" ${barnLocked ? "disabled" : ""}>Unicorp Farm-maxxing Cert — 3000g (${Math.min(lumberHave, 50)}/50 lumber)</button>`
  );

   // New buttons appear only if barn is bought
  if (world.r) {
    shopButtons.push(`<button class="shop-button" data-buy="farm">Buy Farm Back — 100000g</button>`);
    shopButtons.push(`<button class="shop-button" data-buy="rainbow_min">Unicorn Min — 500g</button>`);
    shopButtons.push(`<button class="shop-button" data-buy="rainbow_min">Rainbow Min — 5000g</button>`);
    shopButtons.push(`<button class="shop-button" data-buy="big_hoe">Big Hoe — 5000g</button>`);
  }
  
  
  shopButtons.push(`<button class="shop-button" data-buy="seeds">Seeds — 5g</button>`);
  shopButtons.push(`<button class="shop-button" data-buy="min">Min — 45g</button>`);
  showModal({
    title: "Emmie",
    bodyHtml: `
      <p style="margin:0 0 10px; font-size:12px; color:#aaa; font-style:italic;">
        Community Displacement Strategist & Director of Unrequested Improvement
      </p>
      <div class="shop-options">
        ${shopButtons.join("")}
      </div>
      <p class="shop-dialogue">"${DAYS_LEFT} days left to pay & ${17-world.x} tasks left to do"</p>`,
    buttons: [{ label: "bye", className: "modal-btn--close", onClick: closeShop }],
  });

  // Wire buy buttons after render
  document.querySelectorAll(".shop-button[data-buy]").forEach((btn) => {
    btn.onclick = () => buyShopItem(btn.dataset.buy);
  });
}

function closeShop() {
  world.S = false;
  closeModal();
}

function buyShopItem(item) {
  const priceMap = {
    seeds: 5,
    min: 35,
    barn: 3000,
    farm: 100000,
    rainbow_min: 5,
    big_hoe: 5
   
  };

  const price = priceMap[item];
  if (!price || world.w < price) return;
  if (item === "barn" && (world.r || (world.s[11] || 0) < 50)) return;

 
  if (item === "barn") {
    world.r = true;
    world.s[25]++;
  }

  world.w -= price;

  if (item === "seeds") {
    world.e = "seeds";
    world.I = (world.I || 0) + 1;
    sfx("pick");
  } else if (item === "min") {
    world.e = "min";
    world.X = (world.X || 0) + 1;
    spawnNewMin(world.m, world.y.col, world.y.row, "following");
    world.s[6]++;
    world.v = true;
    sfx("pick");
  } else if (item === "farm") {
    world.s[13]++;
    elFarm.textContent = "Max's Farm";
    sfx("success");
  } else if (item === "big_hoe") {
    world.h = true;
    sfx("success");
  } else if (item === "rainbow_min") {
    const m = spawnNewMin(world.m, world.y.col, world.y.row, "following");
    m.isRainbowMin = true;
    m.isWaterMin = true;
    world.s[6]++;
    sfx("success");
  }
}


function syncHUD() {
  const followingMins = mins.filter(m => m.state === "following" || m.state === "carrying" || m.state === "carrying_lumber" || m.state === "carrying_fish").length;
 
  document.querySelectorAll(".tool-slot").forEach((slot) => {
    const toolName = slot.dataset.tool;
    slot.classList.toggle("active", toolName === world.e);

    if (toolName === "axe") slot.textContent = world.u ? "🪓 Axe" : "Empty";
    if (toolName === "hoe") slot.textContent = world.h ? "⛏️ Big Hoe" : "⛏️ Hoe";
    else if (toolName === "min") slot.textContent = world.v ? "🤖 Min" : "Empty";

    let txt = null;
    if (toolName === "min") txt = followingMins;
    if (toolName === "watering-can") txt = world.a;
    if (toolName === "seeds") txt = world.I || 0;

    let b = slot.querySelector(".item-count");
    if (txt !== null) {
      if (!b) {
        b = document.createElement("span");
        b.className = "item-count";
        slot.style.position = "relative";
        slot.appendChild(b);
      }
      b.textContent = txt;
    } else if (b) {
      b.remove();
    }
  });

  elCrop.textContent = world.c + world.b + world.l;
  elDay.textContent = DAYS_LEFT;

  
  elWallet.textContent = `${world.w}g`;
 
  updateClock();
  updateTaskHUD();
}


function updateTaskHUD() {
  const el = elTask;

  if (world.x >= TASKS.length) {
    el.innerHTML = "<strong>WOO!</strong>";
    return;
  }

  const t = TASKS[world.x];
  const prog = world.s[t.stat] || 0;
  el.innerHTML = `${t.desc} (${Math.min(prog, t.target)}/${t.target})`;

  if (prog >= t.target) {
    world.x++;
    sfx("success");
    if (world.x >= TASKS.length && !world.A) {
      world.A = true;
      showModal({
        title: "Victory!",
        bodyHtml: "<p>You got the farm back!</p>",
        buttons: [{ label: "Thats pretty neat", className: "modal-btn--close" }]
      });
    }
  }
}


function handleToolAction() {
  if (world.E) return;

  if (world.e === "min") {
    throwMin(character, mins, world.z, cursor);
    sfx("throw");
  } 
  
    // Calculate distance between character and cursor for all other tools
  const dist = cursor ? Math.hypot(character.col - cursor.col, character.row - cursor.row) : Infinity;
  
  // If the cursor is too far away, stop the action
  if (dist > TOOL_REACH_DISTANCE) {    
    return;
  }
  
  if (world.e === "empty-hands") {
    if (!tryHarvestCrop(character, world)) {
      tryTakeFromMin(character, mins, world);
    }
    syncHUD();
  } else {
    useToolAtCursor(world, cursor);
    syncHUD();
  }
}

function endDay() {
  if (world.E) return;
  world.E = true; 

  const cropPayout = world.c * 25 + world.b * 75;
  const lumberPayout = world.l * 5;
  const totalPayout = cropPayout + lumberPayout;
  world.w += totalPayout;
  showModal({
    title: "Day Complete",
    bodyHtml: `<p>You collected <strong>${world.c + world.b + world.l}</strong> items.</p>
      <p>Payday: <strong>${totalPayout}g</strong> (Crops: ${cropPayout}g, Lumber: ${lumberPayout}g)</p>
      <p>Wallet: <strong>${world.w}g</strong></p>`,
    buttons: [{ label: "Start Next Day", className: "modal-btn--yes", onClick: startNextDay }]
  });
}

function startNextDay() {
  world.d = 0;
  world.p = 0;
  world.E = false;
  world.c = 0;
  world.b = 0;
  world.l = 0;
  world.n += 1;

 

  character.col = OTHER_BUILDING_COL + 1.75;
  character.row = OTHER_BUILDING_ROW + 1.75;
  character.dir = 2;  
  saveGame();
  syncHUD();
}

document.querySelectorAll(".tool-slot").forEach((slot) => {
  slot.addEventListener("click", (e) => {
    e.stopPropagation();
    const tool = slot.dataset.tool;
    if (tool === "axe" && !world.u) return;
    if (tool === "min" && !world.v) return;
    world.e = tool;
    syncHUD();
  });
});




syncHUD();
showStartMenu();


function updateCursorPosition(event) {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  const worldX = (event.clientX - rect.left) * scaleX;
  const worldY = (event.clientY - rect.top) * scaleY;
  const screenX = worldX - camera.x;
  const screenY = worldY - camera.y;

  cursor = {
    col: screenX / 64 + screenY / 32,
    row: screenY / 32 - screenX / 64
  };
}

canvas.addEventListener("mousemove", updateCursorPosition);
canvas.addEventListener("click", () => {
  handleToolAction();
});

function loop(timestamp) {
  const deltaMs = Math.min(timestamp - lastFrameTime, 32);
  lastFrameTime = timestamp; 

  if (!isModalOpen() && !world.E) {   

    updateCharacterFromControls(character,keys,deltaMs, world);

    const distToHome = Math.hypot(character.col - (OTHER_BUILDING_COL + 0.5), character.row - (OTHER_BUILDING_ROW + 0.5));
    if (distToHome < 0.6) {
      showSleepPrompt();
    }

    // example: only start ticking after 3 tasks finished
  const TASKS_BEFORE_TIMER_STARTS = 10;   

  if (world.x >= TASKS_BEFORE_TIMER_STARTS) {
  world.d += deltaMs;
  elFarm.textContent = "Unicorp Farm";
    }
  world.p = Math.min(world.d / world.D, 1);

  if (world.p >= 1) {
    DAYS_LEFT--;
    endDay();
}
    updateWorld(world, deltaMs, character);
    updateMins(character, mins, world);
   
  if ( keys.has("Space")) {
    let interacted = tryInteractWithGravestone(character, world) ||
                    tryCatchFish(character, world) ||
                    tryPickupLumber(character, world) ||
                    tryInteractWithSign(character.col, character.row)  ||                    
                    tryDepositToBox(character, world.z, world) ||
                    tryDepositToDominion(character, world.y, world) ||
                    
                    //tryInteractWithPond(character, world) ||
                    tryCollectSoul(character,world);

      if (!interacted && !world.S) {
      interacted = tryInteractWithShop(character, world);
      if (interacted && world.S) openShop(); // only open if shop is actually unlocked
    }

    if (!interacted) {
      if (!tryCollectMin(character, mins, world)) {        
          if (!tryHarvestCrop(character, world)) {
            tryTakeFromMin(character, mins, world);
          }        
      }
    }

    
    keys.delete("Space");
  }

  
  }

  syncHUD();
  camera = updateCamera(canvas, character);
  drawScene(ctx, canvas, character, spriteBank, camera, mins, cursor, world, shopkeeper, shopkeeperSpriteBank);

  requestAnimationFrame(loop);
}


requestAnimationFrame(loop);