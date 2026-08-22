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
  tryDepositToBox,
  tryDepositToDominion,
  tryInteractWithPond,
  tryInteractWithShop,
  tryInteractWithGravestone,
  spawnNewMin, 
  tryPickupLumber,
  tryTakeFromMin,
} from "./interactions.js";
import { TOOL_TYPES, SHOPKEEPER_LOOK, SHOPKEEPER_COL, SHOPKEEPER_ROW, OTHER_BUILDING_COL, OTHER_BUILDING_ROW, TOOL_REACH_DISTANCE } from "./constants.js";

import { showModal, isModalOpen, closeModal } from "./modal.js";


function showSleepPrompt() {
  if (isModalOpen()) return;
  showModal({
    title: "Go to bed for the night?",
    bodyHtml: "<p>This will end the current day.</p>",
    buttons: [
      { label: "Yes (Sleep)", className: "modal-btn--yes", onClick: endDay },
      {
        label: "No",
        className: "modal-btn--no",
        onClick: () => {
          character.col += 1;          
        },
      },
    ],
  });
}

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const keys = setupInput();
const character = createCharacter();
const spriteBank = createSpriteBank();
const shopkeeper = createCharacter();
shopkeeper.col = SHOPKEEPER_COL;
shopkeeper.row = SHOPKEEPER_ROW;
const shopkeeperSpriteBank = createSpriteBank(SHOPKEEPER_LOOK, { showPigtails: false, isUnicorn: true });
export const world = createWorld();
world.shopkeeper = shopkeeper;

if (!world.selectedTool) {
  world.selectedTool = TOOL_TYPES.MIN;
}

const { mins } = world;

const resultsScreen = document.getElementById("results-screen");
const resultsCollected = document.getElementById("results-collected");
const resultsPayout = document.getElementById("results-payout");
const resultsWallet = document.getElementById("results-wallet");
const nextDayButton = document.getElementById("next-day-button");
const shopOverlay = document.getElementById("shop-overlay");

canvas.style.cursor = "none";
let cursor = null;
let camera = { x: canvas.width / 2, y: 110 };
let lastFrameTime = performance.now();

function updateClock() {
  const hand = document.getElementById("clock-hand");
  if (!hand) return;

  const phase = Math.min(Math.max(world.dayProgress || 0, 0), 1);
  const angle = 180 + (phase * 180);

  hand.style.transform = `translate(0, -50%) rotate(${angle}deg)`;
}


function openShop() {
  world.shopOpen = true;
  showModal({
    title: "Unicorn Merchant",
    bodyHtml: `
      <div class="shop-options">
        <button class="shop-button" data-buy="seeds">Seeds — 5g</button>
        <button class="shop-button" data-buy="min">Min — 35g</button>
      </div>
      <p class="shop-dialogue">"Spend wisely, farmer!"</p>`,
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
    min: 35
  };

  const price = priceMap[item];
  if (!price || world.wallet < price) return;

  world.wallet -= price;

  if (item === "seeds") {
    world.selectedTool = "seeds";
    world.seedInventory = (world.seedInventory || 0) + 1;
  }

  if (item === "min") {
    world.selectedTool = "min";
    world.minInventory = (world.minInventory || 0) + 1;
    spawnNewMin(world.mins, world.dominion.col, world.dominion.row, "following");
  }

  
  syncHUD();
}

function syncHUD() {
  const followingMins = mins.filter(m => m.state === "following" || m.state === "carrying").length;

  document.querySelectorAll(".tool-slot").forEach((slot) => {
    const toolName = slot.dataset.tool;
    const isSelected = toolName === world.selectedTool;
    slot.classList.toggle("active", isSelected);

    if (toolName === "min") {
      let countBadge = slot.querySelector(".item-count");
      if (!countBadge) {
        countBadge = document.createElement("span");
        countBadge.className = "item-count";
        Object.assign(countBadge.style, {
          position: 'absolute',
          bottom: '2px',
          right: '2px',
          background: 'rgba(0,0,0,0.6)',
          color: 'white',
          padding: '0 4px',
          borderRadius: '4px',
          fontSize: '10px',
          pointerEvents: 'none'
        });
        slot.style.position = 'relative';
        slot.appendChild(countBadge);
      }
      countBadge.textContent = followingMins;
    }

    if (toolName === "watering-can") {
      let countBadge = slot.querySelector(".item-count");
      if (!countBadge) {
        countBadge = document.createElement("span");
        countBadge.className = "item-count";
        Object.assign(countBadge.style, {
          position: 'absolute',
          bottom: '2px',
          right: '2px',
          background: 'rgba(0,0,0,0.6)',
          color: 'white',
          padding: '0 4px',
          borderRadius: '4px',
          fontSize: '10px',
          pointerEvents: 'none'
        });
        slot.style.position = 'relative';
        slot.appendChild(countBadge);
      }
      countBadge.textContent = world.waterCanFillAmount;
    }
    if (toolName === "seeds") {
      let countBadge = slot.querySelector(".item-count");
      if (!countBadge) {
        countBadge = document.createElement("span");
        countBadge.className = "item-count";
        Object.assign(countBadge.style, {
          position: 'absolute',
          bottom: '2px',
          right: '2px',
          background: 'rgba(0,0,0,0.6)',
          color: 'white',
          padding: '0 4px',
          borderRadius: '4px',
          fontSize: '10px',
          pointerEvents: 'none'
        });
        slot.style.position = 'relative';
        slot.appendChild(countBadge);
      }
      countBadge.textContent = world.seedInventory || 0;
    }
  });

  const countDisplay = document.getElementById("crop-count");
  if (countDisplay) {
    countDisplay.textContent = world.cropsCollected + world.lumberCollected;
  }


   
  const farmDisplay = document.getElementById("farm-name");
  if (farmDisplay) {
    farmDisplay.textContent = "Zachs Farm";
    
  }

  const walletDisplay = document.getElementById("wallet-amount");
  if (walletDisplay) {
    walletDisplay.textContent = `${world.wallet}g`;
  }

  updateClock();
}

function handleToolAction() {
  if (world.dayEnded) return;

  if (world.selectedTool === "min") {
    throwMin(character, mins, world.box, cursor);
  } 
  
    // Calculate distance between character and cursor for all other tools
  const dist = cursor ? Math.hypot(character.col - cursor.col, character.row - cursor.row) : Infinity;
  
  // If the cursor is too far away, stop the action
  if (dist > TOOL_REACH_DISTANCE) {    
    return;
  }
  
  if (world.selectedTool === "empty-hands") {
    if (!tryHarvestCrop(character, world)) {
      tryTakeFromMin(character, mins);
    }
  } else {
    useToolAtCursor(world, cursor);
  }
}

function endDay() {
  if (world.dayEnded) return;

  world.dayEnded = true;
  const cropPayout = world.cropsCollected * 25;
  const lumberPayout = world.lumberCollected * 5;
  const totalPayout = cropPayout + lumberPayout;
  
  world.wallet += totalPayout;

  if (resultsCollected) resultsCollected.textContent = String(world.cropsCollected + world.lumberCollected);
  if (resultsPayout) resultsPayout.textContent = `${totalPayout}g (Crops: ${cropPayout}g, Lumber: ${lumberPayout}g)`;
  if (resultsWallet) resultsWallet.textContent = `${world.wallet}g`;

  if (resultsScreen) resultsScreen.classList.remove("hidden");
  syncHUD();
}

function startNextDay() {
  world.dayElapsedMs = 0;
  world.dayProgress = 0;
  world.dayEnded = false;
  world.cropsCollected = 0;
  world.lumberCollected = 0;
  world.dayNumber += 1;

  character.col = OTHER_BUILDING_COL + 1.75;
  character.row = OTHER_BUILDING_ROW + 1.75;
  character.dir = 2;  

  if (resultsScreen) resultsScreen.classList.add("hidden");
  syncHUD();
}

document.querySelectorAll(".tool-slot").forEach((slot) => {
  slot.addEventListener("click", (e) => {
    e.stopPropagation();
    world.selectedTool = slot.dataset.tool;
    syncHUD();
  });
});



document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && world.shopOpen) {
    closeShop();
    return;
  }
  const map = {
    Digit1: "hoe",
    Digit2: "seeds",
    Digit3: "watering-can",
    Digit4: "axe",
    Digit5: "min",
    Digit6: "empty-hands"
  };

  const tool = map[event.code];
  if (tool) {
    world.selectedTool = tool;
    syncHUD();
  }
});

if (nextDayButton) {
  nextDayButton.addEventListener("click", startNextDay);
}

syncHUD();

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

    world.dayElapsedMs += deltaMs;
    world.dayProgress = Math.min(world.dayElapsedMs / world.dayLengthMs, 1);

    if (world.dayProgress >= 1) {
      endDay();
    }
    updateWorld(world, deltaMs, character);
    updateMins(character, mins, world);
  if (keys.has("KeyE") || keys.has("Space")) {
    let interacted = tryInteractWithGravestone(character, world) ||
                    tryPickupLumber(character, world) ||
                    tryDepositToBox(character, world.box, world) ||
                    tryDepositToDominion(character, world.dominion, world, mins) ||
                    tryInteractWithPond(character, world);

    if (!interacted && !world.shopOpen) {
      interacted = tryInteractWithShop(character, world);
      if (interacted) openShop();
    }

    if (!interacted) {
      if (!tryCollectMin(character, mins)) {        
          if (!tryHarvestCrop(character, world)) {
            tryTakeFromMin(character, mins);
          }        
      }
    }

    keys.delete("KeyE");
    keys.delete("Space");
  }

    if (keys.has("KeyF")) {
      handleToolAction();
      keys.delete("KeyF");
    }
  }

  syncHUD();
  camera = updateCamera(canvas, character);
  drawScene(ctx, canvas, character, spriteBank, camera, mins, cursor, world, shopkeeper, shopkeeperSpriteBank);

  requestAnimationFrame(loop);
}

drawScene(ctx, canvas, character, spriteBank, camera, mins, cursor, world, shopkeeper, shopkeeperSpriteBank);
requestAnimationFrame(loop);