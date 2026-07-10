import Phaser from 'phaser';
import { createProceduralAssets } from './proceduralAssets';

class InvestigationScene extends Phaser.Scene {
  constructor() {
    super('InvestigationScene');
  }

  init(data) {
    this.socket = data.socket;
    this.playerId = data.playerId;
    this.suspects = data.suspects || [];
    this.onInteract = data.onInteract; // callback to react UI
    this.onRoomChange = data.onRoomChange; // callback to react UI
    this.remotePlayers = {};
    this.currentRoom = 'Hall';
  }

  create() {
    // Generate tileset and character sheets
    createProceduralAssets(this.game);

    // Mansion world bounds: 1250 x 800
    this.physics.world.setBounds(0, 0, 1250, 800);
    this.cameras.main.setBounds(0, 0, 1250, 800);

    // 1. Draw floor grids for rooms and hallways
    for (let x = 0; x < 1250; x += 32) {
      for (let y = 0; y < 800; y += 32) {
        this.add.image(x + 16, y + 16, 'tiles', 0);
      }
    }

    // Define room boundaries
    this.roomsConfig = [
      { name: 'Study', x: 50, y: 50, w: 300, h: 250 },
      { name: 'Library', x: 450, y: 50, w: 300, h: 250 },
      { name: 'Ballroom', x: 850, y: 50, w: 300, h: 250 },
      { name: 'Kitchen', x: 50, y: 450, w: 300, h: 250 },
      { name: 'Hall', x: 450, y: 450, w: 300, h: 250 },
      { name: 'Lounge', x: 850, y: 450, w: 300, h: 250 }
    ];

    // 2. Draw Room Compartment Walls (Static bodies)
    this.walls = this.physics.add.staticGroup();

    // Exterior borders
    for (let x = 16; x < 1250; x += 32) {
      this.walls.create(x, 16, 'tiles', 1);
      this.walls.create(x, 784, 'tiles', 1);
    }
    for (let y = 48; y < 784; y += 32) {
      this.walls.create(16, y, 'tiles', 1);
      this.walls.create(1234, y, 'tiles', 1);
    }

    // Build room borders with door openings
    this.roomsConfig.forEach(r => {
      // Draw top wall
      for (let wx = r.x; wx < r.x + r.w; wx += 32) {
        if (wx > r.x + r.w / 2 - 20 && wx < r.x + r.w / 2 + 20) continue; // Door opening
        this.walls.create(wx + 16, r.y, 'tiles', 1);
      }
      // Draw bottom wall
      for (let wx = r.x; wx < r.x + r.w; wx += 32) {
        if (wx > r.x + r.w / 2 - 20 && wx < r.x + r.w / 2 + 20) continue; // Door opening
        this.walls.create(wx + 16, r.y + r.h, 'tiles', 1);
      }
      // Draw left wall
      for (let wy = r.y; wy <= r.y + r.h; wy += 32) {
        this.walls.create(r.x, wy, 'tiles', 1);
      }
      // Draw right wall
      for (let wy = r.y; wy <= r.y + r.h; wy += 32) {
        this.walls.create(r.x + r.w, wy, 'tiles', 1);
      }

      // Add room label text
      this.add.text(r.x + r.w / 2, r.y + 30, r.name.toUpperCase(), {
        fontFamily: 'Georgia',
        fontSize: '14px',
        color: '#8B2500',
        align: 'center',
        fontStyle: 'bold'
      }).setOrigin(0.5);
    });

    // 3. Place Interactive Objects
    this.interactiveObjects = this.physics.add.staticGroup();

    // Study: Mahogany Desk
    const desk = this.interactiveObjects.create(200, 180, 'tiles', 2);
    desk.setScale(1.5, 1);
    desk.refreshBody();
    desk.objectName = 'Desk';

    // Library: Book pile / diary desk
    const bookshelf = this.interactiveObjects.create(600, 180, 'tiles', 2);
    bookshelf.objectName = 'Diary';

    // Hall: Victim's body outline (represented by a distinct tile)
    const body = this.interactiveObjects.create(600, 580, 'tiles', 1); // custom visual outline
    body.setTint(0xff3333); // Red outline
    body.objectName = 'Body';

    // Kitchen: prep counter
    const counter = this.interactiveObjects.create(200, 580, 'tiles', 2);
    counter.objectName = 'Kitchen Cabinet';

    // Lounge: fireplace hearth
    const hearth = this.interactiveObjects.create(1000, 580, 'tiles', 2);
    hearth.objectName = 'Fireplace';

    // 4. Create local player sprite
    const mySus = this.suspects.find(s => s.playerId === this.playerId) || {};
    const myRole = getRoleByOccupation(mySus.role || '');
    
    // Spawn in the Grand Hall center
    this.player = this.physics.add.sprite(600, 500, `char_${myRole}`, 0);
    this.player.setCollideWorldBounds(true);
    this.player.setBodySize(16, 20);
    this.player.setOffset(8, 8);
    this.player.roleName = myRole;

    // Local Nameplate
    this.player.nameText = this.add.text(600, 470, mySus.name || 'Poirot', {
      fontFamily: 'Courier New',
      fontSize: '11px',
      color: '#ffffff',
      backgroundColor: '#00000080',
      padding: { x: 4, y: 2 }
    }).setOrigin(0.5);

    // Collisions
    this.physics.add.collider(this.player, this.walls);
    this.physics.add.collider(this.player, this.interactiveObjects);

    // Set up camera follow
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.cameras.main.setZoom(1.3);

    // Animations setup (if not already registered in game registry)
    const roles = ['detective', 'conductor', 'doctor', 'heir', 'steward', 'investigator'];
    roles.forEach(role => {
      const directions = ['down', 'left', 'right', 'up'];
      directions.forEach((dir, row) => {
        if (!this.anims.exists(`idle_${role}_${dir}`)) {
          this.anims.create({
            key: `idle_${role}_${dir}`,
            frames: this.anims.generateFrameNumbers(`char_${role}`, { start: row * 4, end: row * 4 }),
            frameRate: 1,
            repeat: -1
          });
        }
        if (!this.anims.exists(`walk_${role}_${dir}`)) {
          this.anims.create({
            key: `walk_${role}_${dir}`,
            frames: this.anims.generateFrameNumbers(`char_${role}`, { start: row * 4, end: row * 4 + 3 }),
            frameRate: 8,
            repeat: -1
          });
        }
      });
    });

    // Keyboard configurations
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      right: Phaser.Input.Keyboard.KeyCodes.D,
      shift: Phaser.Input.Keyboard.KeyCodes.SHIFT,
      interact: Phaser.Input.Keyboard.KeyCodes.E
    });

    // Display overlay tip for E interaction
    this.interactionTip = this.add.text(600, 450, '', {
      fontFamily: 'Courier New',
      fontSize: '10px',
      color: '#FFD700',
      backgroundColor: '#000000B0',
      padding: { x: 5, y: 3 }
    }).setOrigin(0.5).setScrollFactor(0);
    this.interactionTip.setVisible(false);

    // Initial remote players draw
    this.updateSuspectsList(this.suspects);

    // Socket.IO event hooks
    this.socket.on('player-moved-2d', (data) => {
      this.handleRemotePlayerMove(data);
    });

    this.socket.on('player-moved', (data) => {
      // Traditional inspections coordinate sync fallback
      const rp = this.remotePlayers[data.playerId];
      if (rp) {
        teleportToRoom(rp, data.room);
      }
    });

    this.broadcastLocalPosition();
  }

  update() {
    if (!this.player) return;

    // Movement velocity calculations
    const isSprinting = this.wasd.shift.isDown;
    const speed = isSprinting ? 160 : 100;

    let vx = 0;
    let vy = 0;
    let dir = 'down';

    if (this.cursors.left.isDown || this.wasd.left.isDown) {
      vx = -speed;
      dir = 'left';
    } else if (this.cursors.right.isDown || this.wasd.right.isDown) {
      vx = speed;
      dir = 'right';
    }

    if (this.cursors.up.isDown || this.wasd.up.isDown) {
      vy = -speed;
      dir = 'up';
    } else if (this.cursors.down.isDown || this.wasd.down.isDown) {
      vy = speed;
      dir = 'down';
    }

    if (vx !== 0 && vy !== 0) {
      vx *= 0.7071;
      vy *= 0.7071;
    }

    this.player.setVelocity(vx, vy);

    // Set animation play status
    const isWalking = vx !== 0 || vy !== 0;
    const animState = isWalking ? 'walk' : 'idle';
    this.player.anims.play(`${animState}_${this.player.roleName}_${dir}`, true);

    // Sync local nameplate
    this.player.nameText.setPosition(this.player.x, this.player.y - 24);

    // Broadcast coords to server
    if (this.player.body.speed > 0 || this.lastSpeed > 0) {
      this.broadcastLocalPosition(dir, isWalking);
    }
    this.lastSpeed = this.player.body.speed;

    // Smooth movement for remote suspects
    Object.keys(this.remotePlayers).forEach(pid => {
      const rp = this.remotePlayers[pid];
      if (rp && rp.targetX !== undefined) {
        rp.x = Phaser.Math.Linear(rp.x, rp.targetX, 0.2);
        rp.y = Phaser.Math.Linear(rp.y, rp.targetY, 0.2);
        rp.nameText.setPosition(rp.x, rp.y - 24);
      }
    });

    // Check Room Bounds Crossing
    this.checkRoomCrossing();

    // Check Object Interaction Proximity
    this.checkInteractionProximity();
  }

  broadcastLocalPosition(dir = 'down', isWalking = false) {
    if (this.socket) {
      this.socket.emit('player-moved-2d', {
        x: this.player.x,
        y: this.player.y,
        vx: this.player.body.velocity.x,
        vy: this.player.body.velocity.y,
        anim: `${isWalking ? 'walk' : 'idle'}_${this.player.roleName}_${dir}`
      });
    }
  }

  checkRoomCrossing() {
    let currentRoomName = 'Hallways';
    this.roomsConfig.forEach(r => {
      if (
        this.player.x >= r.x &&
        this.player.x <= r.x + r.w &&
        this.player.y >= r.y &&
        this.player.y <= r.y + r.h
      ) {
        currentRoomName = r.name;
      }
    });

    if (currentRoomName !== this.currentRoom && currentRoomName !== 'Hallways') {
      this.currentRoom = currentRoomName;
      if (this.onRoomChange) {
        this.onRoomChange(currentRoomName);
      }
    }
  }

  checkInteractionProximity() {
    let closestObj = null;
    let minDist = 35; // Maximum interaction pixels

    this.interactiveObjects.getChildren().forEach(obj => {
      const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, obj.x, obj.y);
      if (dist < minDist) {
        minDist = dist;
        closestObj = obj;
      }
    });

    if (closestObj) {
      this.interactionTip.setText(`[E] SEARCH ${closestObj.objectName.toUpperCase()}`);
      // Position interaction tip above player character
      this.interactionTip.setPosition(400, 380); // Center bottom UI
      this.interactionTip.setVisible(true);

      // Listen to E key press
      if (Phaser.Input.Keyboard.JustDown(this.wasd.interact)) {
        if (this.onInteract) {
          this.onInteract(closestObj.objectName);
        }
      }
    } else {
      this.interactionTip.setVisible(false);
    }
  }

  updateSuspectsList(freshList) {
    freshList.forEach((s, idx) => {
      if (s.playerId === this.playerId) return;

      const rRole = getRoleByOccupation(s.role || '');
      let rp = this.remotePlayers[s.id];

      if (!rp) {
        const rx = 550 + Math.random() * 100;
        const ry = 480 + Math.random() * 100;
        rp = this.add.sprite(rx, ry, `char_${rRole}`, 0);
        rp.targetX = rx;
        rp.targetY = ry;
        rp.roleName = rRole;
        rp.nameText = this.add.text(rx, ry - 24, s.name, {
          fontFamily: 'Courier New',
          fontSize: '11px',
          color: '#ffffff',
          backgroundColor: '#00000080',
          padding: { x: 4, y: 2 }
        }).setOrigin(0.5);
        this.remotePlayers[s.id] = rp;
      }
    });
  }

  handleRemotePlayerMove(data) {
    // Find suspect matching either player id or custom model tag
    const matchingSus = this.suspects.find(s => s.playerId === data.playerId);
    if (matchingSus) {
      const rp = this.remotePlayers[matchingSus.id];
      if (rp) {
        rp.targetX = data.x;
        rp.targetY = data.y;
        if (data.anim) {
          rp.anims.play(data.anim, true);
        }
      }
    }
  }
}

// Helpers
function getRoleByOccupation(occ = "") {
  const o = occ.toLowerCase();
  if (o.includes("conductor") || o.includes("orchestra") || o.includes("music")) return "conductor";
  if (o.includes("doctor") || o.includes("medical")) return "doctor";
  if (o.includes("heir") || o.includes("aristocrat") || o.includes("wealthy") || o.includes("disinherited")) return "heir";
  if (o.includes("steward") || o.includes("butler") || o.includes("servant") || o.includes("secretary")) return "steward";
  return "detective";
}

function teleportToRoom(sprite, roomName) {
  const roomCoords = {
    'Study': { x: 200, y: 180 },
    'Library': { x: 600, y: 180 },
    'Ballroom': { x: 1000, y: 180 },
    'Kitchen': { x: 200, y: 580 },
    'Hall': { x: 600, y: 580 },
    'Lounge': { x: 1000, y: 580 }
  };
  const coords = roomCoords[roomName];
  if (coords) {
    sprite.targetX = coords.x + (Math.random() * 40 - 20);
    sprite.targetY = coords.y + (Math.random() * 40 - 20);
  }
}

export function initInvestigationGame(containerId, socket, playerId, suspects, onInteract, onRoomChange) {
  const config = {
    type: Phaser.AUTO,
    parent: containerId,
    width: '100%',
    height: '100%',
    physics: {
      default: 'arcade',
      arcade: {
        gravity: { y: 0 },
        debug: false
      }
    },
    scene: InvestigationScene
  };

  const game = new Phaser.Game(config);
  game.scene.start('InvestigationScene', { socket, playerId, suspects, onInteract, onRoomChange });
  return game;
}
