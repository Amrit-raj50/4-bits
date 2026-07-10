/*
  proceduralAssets.js
  Generates pixel-art character sprite frames and tilesets dynamically on canvas.
  This avoids loading lag and network request failures.
*/

export function createProceduralAssets(gameInstance) {
  const scene = gameInstance.scene.scenes[0];
  if (!scene) return;

  const roles = [
    { name: 'detective', color: '#8B5A2B', accessory: 'fedora' },   // Brown fedora
    { name: 'conductor', color: '#A9A9A9', accessory: 'silver_hair' }, // Silver maestro
    { name: 'doctor', color: '#F0F8FF', accessory: 'stethoscope' },  // Clinical white/blue
    { name: 'heir', color: '#DAA520', accessory: 'crown' },        // Golden heir
    { name: 'steward', color: '#2F4F4F', accessory: 'bow_tie' },     // Formal butler
    { name: 'investigator', color: '#D01716', accessory: 'none' }   // Crimson default
  ];

  roles.forEach(role => {
    // Check if texture already exists to avoid re-creation errors
    if (scene.textures.exists(`char_${role.name}`)) return;

    const canvas = scene.textures.createCanvas(`char_${role.name}`, 128, 128);
    const ctx = canvas.getContext();

    // 4 rows (Down, Left, Right, Up) x 4 columns (walking frame steps)
    const dirs = ['down', 'left', 'right', 'up'];
    dirs.forEach((dir, row) => {
      for (let frame = 0; frame < 4; frame++) {
        const x = frame * 32;
        const y = row * 32;
        drawCharacter(ctx, x, y, role.color, role.accessory, dir, frame);
      }
    });
    canvas.refresh();
  });

  // Create Floor & Wall Tileset
  if (!scene.textures.exists('tiles')) {
    const tilesCanvas = scene.textures.createCanvas('tiles', 128, 64);
    const tilesCtx = tilesCanvas.getContext();
    drawFloorTile(tilesCtx, 0, 0);
    drawWallTile(tilesCtx, 32, 0);
    drawTableTile(tilesCtx, 64, 0);
    tilesCanvas.refresh();
  }
}

function drawCharacter(ctx, cx, cy, color, accessory, dir, frame) {
  // Clear the cell
  ctx.clearRect(cx, cy, 32, 32);

  // Setup styles
  ctx.fillStyle = color;
  ctx.strokeStyle = '#111111';
  ctx.lineWidth = 1.5;

  // Derive darker shade for backpack/shading
  const shadeColor = getShadeColor(color, -25);

  const headX = cx + 16;
  const headY = cy + 13;

  // 1. Draw Backpack (side/back depends on facing direction)
  ctx.fillStyle = shadeColor;
  if (dir === 'left') {
    ctx.beginPath();
    ctx.roundRect(cx + 18, headY - 4, 6, 12, 2);
    ctx.fill();
    ctx.stroke();
  } else if (dir === 'right') {
    ctx.beginPath();
    ctx.roundRect(cx + 8, headY - 4, 6, 12, 2);
    ctx.fill();
    ctx.stroke();
  } else if (dir === 'up') {
    ctx.beginPath();
    ctx.roundRect(cx + 9, headY - 4, 14, 11, 2);
    ctx.fill();
    ctx.stroke();
  }

  // 2. Draw Legs (Walking Animation)
  ctx.fillStyle = color;
  let legOffset = 0;
  if (frame === 2) legOffset = -3;
  if (frame === 3) legOffset = 3;

  // Left Leg
  ctx.beginPath();
  ctx.roundRect(cx + 11, cy + 22 + (legOffset < 0 ? -1 : 0), 4, 6, 1);
  ctx.fill();
  ctx.stroke();

  // Right Leg
  ctx.beginPath();
  ctx.roundRect(cx + 17, cy + 22 + (legOffset > 0 ? -1 : 0), 4, 6, 1);
  ctx.fill();
  ctx.stroke();

  // 3. Draw Main Body (Oval Crewmate shape)
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.roundRect(cx + 9, headY - 6, 14, 16, 5);
  ctx.fill();
  ctx.stroke();

  // 4. Draw Visor (only visible when not facing up)
  if (dir !== 'up') {
    ctx.fillStyle = '#ADD8E6'; // Light blue
    ctx.beginPath();
    if (dir === 'left') {
      ctx.roundRect(cx + 6, headY - 4, 8, 6, 2);
    } else if (dir === 'right') {
      ctx.roundRect(cx + 18, headY - 4, 8, 6, 2);
    } else {
      // Facing Down
      ctx.roundRect(cx + 10, headY - 4, 12, 6, 2);
    }
    ctx.fill();
    ctx.stroke();

    // Visor shine
    ctx.fillStyle = '#FFFFFF';
    if (dir === 'left') ctx.fillRect(cx + 7, headY - 3, 2, 2);
    else if (dir === 'right') ctx.fillRect(cx + 19, headY - 3, 2, 2);
    else ctx.fillRect(cx + 11, headY - 3, 3, 2);
  }

  // 5. Draw Occupation Accessory
  drawAccessory(ctx, cx, cy, dir, accessory);
}

function drawAccessory(ctx, cx, cy, dir, accessory) {
  if (accessory === 'fedora') {
    ctx.fillStyle = '#5C4033'; // Dark brown
    ctx.strokeStyle = '#111111';
    ctx.lineWidth = 1;

    // Brim
    ctx.beginPath();
    ctx.roundRect(cx + 6, cy + 6, 20, 2, 1);
    ctx.fill();
    ctx.stroke();

    // Crown
    ctx.beginPath();
    ctx.roundRect(cx + 9, cy + 2, 14, 4, 1);
    ctx.fill();
    ctx.stroke();
  } 
  else if (accessory === 'crown') {
    ctx.fillStyle = '#FFD700'; // Gold
    ctx.strokeStyle = '#222';
    ctx.lineWidth = 1;

    ctx.beginPath();
    ctx.moveTo(cx + 10, cy + 7);
    ctx.lineTo(cx + 10, cy + 2);
    ctx.lineTo(cx + 13, cy + 5);
    ctx.lineTo(cx + 16, cy + 1); // Center tip
    ctx.lineTo(cx + 19, cy + 5);
    ctx.lineTo(cx + 22, cy + 2);
    ctx.lineTo(cx + 22, cy + 7);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  } 
  else if (accessory === 'stethoscope') {
    ctx.strokeStyle = '#E0F0FF';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(cx + 16, cy + 15, 4, 0, Math.PI);
    ctx.stroke();
  } 
  else if (accessory === 'silver_hair') {
    ctx.fillStyle = '#DCDCDC'; // Silver hair tuft
    ctx.strokeStyle = '#111';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(cx + 16, cy + 6, 5, Math.PI, 0);
    ctx.fill();
    ctx.stroke();
  } 
  else if (accessory === 'bow_tie') {
    if (dir !== 'up') {
      ctx.fillStyle = '#000000'; // Bow tie
      ctx.beginPath();
      ctx.moveTo(cx + 13, cy + 16);
      ctx.lineTo(cx + 19, cy + 18);
      ctx.lineTo(cx + 19, cy + 14);
      ctx.closePath();
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(cx + 19, cy + 16);
      ctx.lineTo(cx + 13, cy + 18);
      ctx.lineTo(cx + 13, cy + 14);
      ctx.closePath();
      ctx.fill();
    }
  }
}

// Helper to calculate darker shade
function getShadeColor(color, percent) {
  const num = parseInt(color.replace("#",""), 16),
        amt = Math.round(2.55 * percent),
        R = (num >> 16) + amt,
        G = (num >> 8 & 0x00FF) + amt,
        B = (num & 0x0000FF) + amt;
  return "#" + (0x1000000 + (R<255?R<0?0:R:255)*0x10000 + (G<255?G<0?0:G:255)*0x100 + (B<255?B<0?0:B:255)).toString(16).slice(1);
}

// Tile drawings
function drawFloorTile(ctx, x, y) {
  // Wood floor pattern
  ctx.fillStyle = '#1A1D20'; // Dark floor base
  ctx.fillRect(x, y, 32, 32);

  ctx.strokeStyle = '#282C30';
  ctx.lineWidth = 1;
  // Floorboard lines
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + 32, y);
  ctx.moveTo(x, y + 16);
  ctx.lineTo(x + 32, y + 16);
  // Staggered splits
  ctx.moveTo(x + 8, y);
  ctx.lineTo(x + 8, y + 16);
  ctx.moveTo(x + 24, y + 16);
  ctx.lineTo(x + 24, y + 32);
  ctx.stroke();
}

function drawWallTile(ctx, x, y) {
  // Wall brick pattern
  ctx.fillStyle = '#2F353B';
  ctx.fillRect(x, y, 32, 32);

  ctx.strokeStyle = '#434A52';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(x + 1, y + 1, 30, 30);

  ctx.fillStyle = '#1B1F23';
  ctx.fillRect(x + 1, y + 26, 30, 6); // Bottom shadow trim
}

function drawTableTile(ctx, x, y) {
  ctx.fillStyle = '#8B5A2B'; // Wood table texture
  ctx.fillRect(x, y, 32, 32);
  ctx.strokeStyle = '#5C4033';
  ctx.strokeRect(x, y, 32, 32);
}
