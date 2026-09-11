import { cols, rows, moveStepSize, moveStepMs, TILE_TYPES } from "./constants.js";

export const createCharacter = () => ({
  col: 43.75, row: 5.75, dir: 2, walkFrame: 0, stepCounter: 0, held: null
});

const clamp = (c) => {
  c.col = Math.max(0, Math.min(cols - 1, c.col));
  c.row = Math.max(0, Math.min(rows - 1, c.row));
};


export function updateCharacterFromControls(c, keys, deltaMs, world) {
  const dx = (keys.has("KeyD")|0) - (keys.has("KeyA")|0),
        dy = (keys.has("KeyS")|0) - (keys.has("KeyW")|0);

  if (dx | dy) {
    c.stepCounter += deltaMs;
    while (c.stepCounter >= moveStepMs) {
      // Map keyboard input to direction index (0-7)
      const dir = [5, 6, 7, 4, c.dir, 0, 3, 2, 1][(dy + 1) * 3 + (dx + 1)];
      
      // Inline vector math: [Right, DownRight, Down, DownLeft, Left, UpLeft, Up, UpRight]
      // Using .7 as a compact approximation for 1/sqrt(2)
      const vx = [1, .7, 0, -.7, -1, -.7, 0, .7][dir];
      const vy = [0, .7, 1, .7, 0, -.7, -1, -.7][dir];

      const nc = c.col + vx * moveStepSize;
      const nr = c.row + vy * moveStepSize;
      const t = world.t[nr|0]?.[nc|0];

      // Collision check (Water or Trees)
      if (!(t && (t.type === TILE_TYPES.WATER || t.hasTree))) {
        c.col = nc;
        c.row = nr;
      }
      
      clamp(c);
      c.dir = dir;
      c.walkFrame = (c.walkFrame + 1) % 2;
      c.stepCounter -= moveStepMs;
    }
  } else c.walkFrame = 0;
}


export const updateCamera = (canvas, c) => ({
  x: canvas.width / 2 - (c.col - c.row) * 32,
  y: canvas.height / 2 - (c.col + c.row) * 16
});