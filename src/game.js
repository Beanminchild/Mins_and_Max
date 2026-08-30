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
  spawnNewMin, 
  tryPickupLumber,
  tryTakeFromMin,
  tryCollectSoul,
  
} from "./interactions.js";
import { TOOL_TYPES, SHOPKEEPER_LOOK, SHOPKEEPER_COL, SHOPKEEPER_ROW, OTHER_BUILDING_COL, OTHER_BUILDING_ROW, TOOL_REACH_DISTANCE, TASKS, MERCHANT_TEMP_COL, MERCHANT_TEMP_ROW } from "./constants.js";

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
    wallet: world.wallet,
    stats: world.stats,
    currentTaskIndex: world.currentTaskIndex,
    dayNumber: world.dayNumber,
    daysLeft: DAYS_LEFT,
    seedInventory: world.seedInventory,
    waterCanFillAmount: world.waterCanFillAmount,
    axeUnlocked: world.axeUnlocked,
    minUnlocked: world.minUnlocked,
    barnBought: world.barnBought,
    selectedTool: world.selectedTool,
    cropsCollected: world.cropsCollected,
    bonusCropsCollected: world.bonusCropsCollected,
    lumberCollected: world.lumberCollected,
    fishCollected: world.fishCollected,
    soulsCollected: world.soulsCollected,
    tiles: world.tiles.map(row => row.map(t => ({
      type: t.type, planted: t.planted, watered: t.watered, growth: t.growth,
      growDuration: t.growDuration, stage: t.stage, variant: t.variant,
      hasTree: t.hasTree, treeHealth: t.treeHealth, lumber: t.lumber
    }))),
    souls: world.souls,
    gravestones: world.gravestones,
    lumber: world.lumber,
    mins: world.mins.map(m => ({ id:m.id, col:m.col, row:m.row, state:m.state, atHome:m.atHome, lineToken:m.lineToken, cropTL:m.cropTL, carryingFish:m.carryingFish, isWaterMin:m.isWaterMin })),
    
    minInventory: world.minInventory || 0,
    allTasksDone: world.allTasksDone || false,
    
    shopkeeper: { col: world.shopkeeper.col, row: world.shopkeeper.row }
  };
  localStorage.setItem(SAVE_KEY, JSON.stringify(data));
}

function loadGame() {
  const raw = localStorage.getItem(SAVE_KEY);
  if (!raw) return false;
  const d = JSON.parse(raw);
  Object.assign(world, {
    wallet: d.wallet, stats: d.stats, currentTaskIndex: d.currentTaskIndex,
    dayNumber: d.dayNumber, seedInventory: d.seedInventory, waterCanFillAmount: d.waterCanFillAmount,
    axeUnlocked: d.axeUnlocked, minUnlocked: d.minUnlocked, barnBought: d.barnBought,
    selectedTool: d.selectedTool, cropsCollected: d.cropsCollected, bonusCropsCollected: d.bonusCropsCollected,
    lumberCollected: d.lumberCollected, fishCollected: d.fishCollected, soulsCollected: d.soulsCollected,
    souls: d.souls, gravestones: d.gravestones, lumber: d.lumber,minInventory: d.minInventory || 0,
    allTasksDone: d.allTasksDone || false,
  });
  DAYS_LEFT = d.daysLeft;
  d.tiles.forEach((row, r) => row.forEach((t, c) => Object.assign(world.tiles[r][c], t)));
  world.mins.length = 0;
  d.mins.forEach(m => world.mins.push({
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
  world.shopkeeper.col = d.shopkeeper.col;
  world.shopkeeper.row = d.shopkeeper.row;
  return true;
}

function showSleepPrompt() {
  if (isModalOpen()) return;

  const buttons = [];

  if (world.currentTaskIndex >= 8) {
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
    title: "Go to bed for the night?",
    bodyHtml: "<p>This will end the current day.</p>",
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
      localStorage.removeItem(SAVE_KEY);
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
    bodyHtml: "<p>Private Equity Farming Sim</p>",
    buttons
  });
}

function showStory(index) {
  const blurbs = [
  "Max: To save the family farm, I have to pay off Grandpa’s loans?",
  "Emmie: Yep, or it becomes lux student apartments.",
  "Max: I can't farm that fast!",
  "Emmie: Use our new Min Tech! They're sub-agents that automate everything.",
  "Max: Is it still farming if I do nothing?",
  "Emmie: You're orchestrating! It's Agentic Farming! 10x productivity! This is our next unicorn!",
  "Max: Guess I have no choice."
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
    if (tool === "axe" && !world.axeUnlocked) return;
    if (tool === "min" && !world.minUnlocked) return;
    world.selectedTool = tool;
    syncHUD();
  },
  () => { if (world.shopOpen) closeShop(); }
);
const character = createCharacter();
const spriteBank = createSpriteBank();
const shopkeeper = createCharacter();
const shopkeeperSpriteBank = createSpriteBank(SHOPKEEPER_LOOK, { showPigtails: false, isUnicorn: true });
export const world = createWorld();
world.shopkeeper = shopkeeper;
if (world.stats.given < 1) {
  shopkeeper.col = MERCHANT_TEMP_COL;
  shopkeeper.row = MERCHANT_TEMP_ROW;
} else {
  shopkeeper.col = SHOPKEEPER_COL;
  shopkeeper.row = SHOPKEEPER_ROW;
}




if (!world.selectedTool) {
  world.selectedTool = TOOL_TYPES.MIN;
}

const { mins } = world;


canvas.style.cursor = "none";
let cursor = null;
let camera = { x: canvas.width / 2, y: 110 };
let lastFrameTime = performance.now();
let lastPhase = '';

function updateClock() {
  const hand = elHand;

  const progress = Math.min(Math.max(world.dayProgress || 0, 0), 1);
  const songPhase = progress < 0.2 ? 'dawn' : progress < 0.6 ? 'day' : progress < 0.8 ? 'dusk' : 'night';
  if (songPhase !== lastPhase) { playSong(songPhase); lastPhase = songPhase; }

  const angle = 180 + (progress * 180); // use numeric progress, not string
  hand.style.transform = `translate(0, -50%) rotate(${angle}deg)`;
}




function openShop() {
  world.shopOpen = true;  
  const shopButtons = [];
  const lumberHave = world.stats.lumberEver || 0;
  const barnLocked = world.barnBought || lumberHave < 50;
  shopButtons.push(
    `<button class="shop-button" data-buy="barn" ${barnLocked ? "disabled" : ""}>Barn — 3000g (${Math.min(lumberHave, 50)}/50 lumber)</button>`
  );
  
  shopButtons.push(`<button class="shop-button" data-buy="seeds">Seeds — 5g</button>`);
  shopButtons.push(`<button class="shop-button" data-buy="min">Min — 35g</button>`);
  showModal({
    title: "",
    bodyHtml: `
      <p style="margin:0 0 10px; font-size:12px; color:#aaa; font-style:italic;">
        Community Displacement Strategist & Director of Unrequested Improvement
      </p>
      <div class="shop-options">
        ${shopButtons.join("")}
      </div>
      <p class="shop-dialogue">"Ur fam owned this land 4 gens? Gr8 plaque 4 a bench!"</p>`,
    buttons: [{ label: "Leave", className: "modal-btn--close", onClick: closeShop }],
  });

  // Wire buy buttons after render
  document.querySelectorAll(".shop-button[data-buy]").forEach((btn) => {
    btn.onclick = () => buyShopItem(btn.dataset.buy);
  });
}

function closeShop() {
  world.shopOpen = false;
  closeModal();
}

function buyShopItem(item) {
  const priceMap = {
    seeds: 5,
    min: 35,
    barn: 3000,
   
  };

  const price = priceMap[item];
  if (!price || world.wallet < price) return;
  if (item === "barn" && (world.barnBought || (world.stats.lumberEver || 0) < 50)) return;

 
  if (item === "barn") {
    world.barnBought = true;
  }

  world.wallet -= price;

  if (item === "seeds") {
    world.selectedTool = "seeds";
    world.seedInventory = (world.seedInventory || 0) + 1;
  }

  if (item === "min") {
    world.selectedTool = "min";
    world.minInventory = (world.minInventory || 0) + 1;
    spawnNewMin(world.mins, world.dominion.col, world.dominion.row, "following");
    world.stats.minObtained++;
    world.minUnlocked = true;
  }

  closeShop();
}


function syncHUD() {
  const followingMins = mins.filter(m => m.state === "following" || m.state === "carrying" || m.state === "carrying_lumber" || m.state === "carrying_fish").length;
 
  document.querySelectorAll(".tool-slot").forEach((slot) => {
    const toolName = slot.dataset.tool;
    slot.classList.toggle("active", toolName === world.selectedTool);

    if (toolName === "axe") slot.textContent = world.axeUnlocked ? "(5) 🪓 Axe" : "Empty";
    else if (toolName === "min") slot.textContent = world.minUnlocked ? "(6) 🤖 Min" : "Empty";

    let txt = null;
    if (toolName === "min") txt = followingMins;
    if (toolName === "watering-can") txt = world.waterCanFillAmount;
    if (toolName === "seeds") txt = world.seedInventory || 0;

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

  elCrop.textContent = world.cropsCollected + world.bonusCropsCollected + world.lumberCollected;
  elDay.textContent = DAYS_LEFT;

  elFarm.textContent = "Max's Farm";
  elWallet.textContent = `${world.wallet}g`;
 
  updateClock();
  updateTaskHUD();
}


function updateTaskHUD() {
  const el = elTask;

  if (world.currentTaskIndex >= TASKS.length) {
    el.innerHTML = "<strong>WOO!</strong>";
    return;
  }

  const t = TASKS[world.currentTaskIndex];
  const prog = world.stats[t.stat] || 0;
  el.innerHTML = `<strong>Task:</strong> ${t.desc} (${Math.min(prog, t.target)}/${t.target})`;

  if (prog >= t.target) {
    world.currentTaskIndex++;
    sfx("success");
    if (world.currentTaskIndex >= TASKS.length && !world.allTasksDone) {
      world.allTasksDone = true;
      showModal({
        title: "Victory!",
        bodyHtml: "<p>You got the farm back from Unicorp!</p>",
        buttons: [{ label: "Thats pretty neat", className: "modal-btn--close" }]
      });
    }
  }
}


function handleToolAction() {
  if (world.dayEnded) return;

  if (world.selectedTool === "min") {
    throwMin(character, mins, world.box, cursor);
    sfx("throw");
  } 
  
    // Calculate distance between character and cursor for all other tools
  const dist = cursor ? Math.hypot(character.col - cursor.col, character.row - cursor.row) : Infinity;
  
  // If the cursor is too far away, stop the action
  if (dist > TOOL_REACH_DISTANCE) {    
    return;
  }
  
  if (world.selectedTool === "empty-hands") {
    if (!tryHarvestCrop(character, world)) {
      tryTakeFromMin(character, mins, world);
    }
  } else {
    useToolAtCursor(world, cursor);
  }
}

function endDay() {
  if (world.dayEnded) return;
  world.dayEnded = true; 

  const cropPayout = world.cropsCollected * 25 + world.bonusCropsCollected * 75;
  const lumberPayout = world.lumberCollected * 5;
  const totalPayout = cropPayout + lumberPayout;
  world.wallet += totalPayout;
  showModal({
    title: "Day Complete",
    bodyHtml: `<p>You collected <strong>${world.cropsCollected + world.bonusCropsCollected + world.lumberCollected}</strong> items.</p>
      <p>Payday: <strong>${totalPayout}g</strong> (Crops: ${cropPayout}g, Lumber: ${lumberPayout}g)</p>
      <p>Wallet: <strong>${world.wallet}g</strong></p>`,
    buttons: [{ label: "Start Next Day", className: "modal-btn--yes", onClick: startNextDay }]
  });
}

function startNextDay() {
  world.dayElapsedMs = 0;
  world.dayProgress = 0;
  world.dayEnded = false;
  world.cropsCollected = 0;
  world.bonusCropsCollected = 0;
  world.lumberCollected = 0;
  world.dayNumber += 1;

 

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
    if (tool === "axe" && !world.axeUnlocked) return;
    if (tool === "min" && !world.minUnlocked) return;
    world.selectedTool = tool;
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

  if (!isModalOpen() && !world.dayEnded) {   

    updateCharacterFromControls(character,keys,deltaMs, world);

    const distToHome = Math.hypot(character.col - (OTHER_BUILDING_COL + 0.5), character.row - (OTHER_BUILDING_ROW + 0.5));
    if (distToHome < 0.6) {
      showSleepPrompt();
    }

    // example: only start ticking after 3 tasks finished
  const TASKS_BEFORE_TIMER_STARTS = 8;   

  if (world.currentTaskIndex >= TASKS_BEFORE_TIMER_STARTS) {
  world.dayElapsedMs += deltaMs;
    }
  world.dayProgress = Math.min(world.dayElapsedMs / world.dayLengthMs, 1);

  if (world.dayProgress >= 1) {
    DAYS_LEFT--;
    endDay();
}
    updateWorld(world, deltaMs, character);
    updateMins(character, mins, world);
   
  if ( keys.has("Space")) {
    let interacted = tryInteractWithGravestone(character, world) ||
                    tryCatchFish(character, world) ||
                    tryPickupLumber(character, world) ||
                    
                    tryDepositToBox(character, world.box, world) ||
                    tryDepositToDominion(character, world.dominion, world) ||
                    
                    //tryInteractWithPond(character, world) ||
                    tryCollectSoul(character,world);

      if (!interacted && !world.shopOpen) {
      interacted = tryInteractWithShop(character, world);
      if (interacted && world.shopOpen) openShop(); // only open if shop is actually unlocked
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