import Phaser from 'phaser';
import { createProceduralAssets } from './proceduralAssets';

class LobbyScene extends Phaser.Scene {
  constructor() {
    super('LobbyScene');
  }

  init(data) {
    this.socket = data.socket;
    this.playerId = data.playerId;
    this.initialPlayers = data.players || [];
    this.remotePlayers = {};
  }

  create() {
    // Generate the procedural assets
    createProceduralAssets(this.game);

    // Setup bounds
    this.physics.world.setBounds(0, 0, 800, 450);
    this.cameras.main.setBounds(0, 0, 800, 450);

    // 1. Draw floor grid
    const floorTileSize = 32;
    for (let x = 0; x < 800; x += floorTileSize) {
      for (let y = 0; y < 450; y += floorTileSize) {
        this.add.image(x + 16, y + 16, 'tiles', 0);
      }
    }

    // 2. Draw surrounding walls
    this.walls = this.physics.add.staticGroup();
    // Top and Bottom walls
    for (let x = 16; x < 800; x += 32) {
      this.walls.create(x, 16, 'tiles', 1);
      this.walls.create(x, 434, 'tiles', 1);
    }
    // Left and Right walls
    for (let y = 48; y < 432; y += 32) {
      this.walls.create(16, y, 'tiles', 1);
      this.walls.create(784, y, 'tiles', 1);
    }

    // 3. Central Cafeteria Table (Among Us style)
    this.table = this.physics.add.staticSprite(400, 225, 'tiles', 2);
    this.table.setScale(3, 2); // Make it a large meeting table
    this.table.refreshBody();

    // 4. Set up animations for each character color/role
    const roles = ['detective', 'conductor', 'doctor', 'heir', 'steward', 'investigator'];
    roles.forEach(role => {
      const directions = ['down', 'left', 'right', 'up'];
      directions.forEach((dir, row) => {
        // Idle
        this.anims.create({
          key: `idle_${role}_${dir}`,
          frames: this.anims.generateFrameNumbers(`char_${role}`, { start: row * 4, end: row * 4 }),
          frameRate: 1,
          repeat: -1
        });
        // Walk
        this.anims.create({
          key: `walk_${role}_${dir}`,
          frames: this.anims.generateFrameNumbers(`char_${role}`, { start: row * 4, end: row * 4 + 3 }),
          frameRate: 8,
          repeat: -1
        });
      });
    });

    // 5. Create local player sprite
    const meData = this.initialPlayers.find(p => p.playerId === this.playerId) || {};
    const myRole = getRoleByIndex(this.initialPlayers.findIndex(p => p.playerId === this.playerId));
    const startX = 100 + Math.random() * 200;
    const startY = 150 + Math.random() * 150;

    this.player = this.physics.add.sprite(startX, startY, `char_${myRole}`, 0);
    this.player.setCollideWorldBounds(true);
    this.player.setBodySize(16, 20);
    this.player.setOffset(8, 8);
    this.player.roleName = myRole;

    // Add local nameplate
    this.player.nameText = this.add.text(startX, startY - 24, meData.name || 'Poirot', {
      fontFamily: 'Courier New',
      fontSize: '11px',
      color: '#ffffff',
      backgroundColor: '#00000080',
      padding: { x: 4, y: 2 }
    }).setOrigin(0.5);

    // Collisions
    this.physics.add.collider(this.player, this.walls);
    this.physics.add.collider(this.player, this.table);

    // Keyboard bindings
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      right: Phaser.Input.Keyboard.KeyCodes.D,
      shift: Phaser.Input.Keyboard.KeyCodes.SHIFT
    });

    // Spawn existing remote players
    this.updatePlayersList(this.initialPlayers);

    // Register Socket listeners
    this.socket.on('player-moved-2d', (data) => {
      this.handleRemotePlayerMove(data);
    });

    this.socket.on('room-updated', (room) => {
      this.updatePlayersList(room.players || []);
    });

    this.socket.on('player-joined', () => {
      this.fetchFreshPlayers();
    });

    this.socket.on('player-left', () => {
      this.fetchFreshPlayers();
    });

    // Initial socket location push
    this.broadcastLocalPosition();
  }

  update() {
    if (!this.player) return;

    // Handle movement speeds
    const isSprinting = this.wasd.shift.isDown;
    const speed = isSprinting ? 180 : 110;

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

    // Diagonal speed normalization
    if (vx !== 0 && vy !== 0) {
      vx *= 0.7071;
      vy *= 0.7071;
    }

    this.player.setVelocity(vx, vy);

    // Set animation states
    const isWalking = vx !== 0 || vy !== 0;
    const animState = isWalking ? 'walk' : 'idle';
    this.player.anims.play(`${animState}_${this.player.roleName}_${dir}`, true);

    // Position local nameplate
    this.player.nameText.setPosition(this.player.x, this.player.y - 24);

    // Broadcast position updates
    if (this.player.body.speed > 0 || this.lastSpeed > 0) {
      this.broadcastLocalPosition(dir, isWalking);
    }
    this.lastSpeed = this.player.body.speed;

    // Interpolate remote players positions smoothly
    Object.keys(this.remotePlayers).forEach(pid => {
      const rp = this.remotePlayers[pid];
      if (rp && rp.targetX !== undefined) {
        // Move towards target smoothly
        rp.x = Phaser.Math.Linear(rp.x, rp.targetX, 0.2);
        rp.y = Phaser.Math.Linear(rp.y, rp.targetY, 0.2);
        rp.nameText.setPosition(rp.x, rp.y - 24);
      }
    });
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

  async fetchFreshPlayers() {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || window.location.origin}/api/games/${this.socket.auth.roomCode}/players`);
      if (res.ok) {
        const body = await res.json();
        this.updatePlayersList(body.data?.players || []);
      }
    } catch (err) {
      console.error('Failed to fetch players list:', err);
    }
  }

  updatePlayersList(freshList) {
    // 1. Remove players that left
    Object.keys(this.remotePlayers).forEach(pid => {
      if (!freshList.some(p => p.playerId === pid)) {
        this.remotePlayers[pid].nameText.destroy();
        this.remotePlayers[pid].destroy();
        delete this.remotePlayers[pid];
      }
    });

    // 2. Add or update remote player objects
    freshList.forEach((p, idx) => {
      if (p.playerId === this.playerId) return;

      const rRole = getRoleByIndex(idx);
      let rp = this.remotePlayers[p.playerId];

      if (!rp) {
        const rx = 100 + Math.random() * 200;
        const ry = 150 + Math.random() * 150;
        rp = this.add.sprite(rx, ry, `char_${rRole}`, 0);
        rp.targetX = rx;
        rp.targetY = ry;
        rp.roleName = rRole;
        rp.nameText = this.add.text(rx, ry - 24, p.name, {
          fontFamily: 'Courier New',
          fontSize: '11px',
          color: p.isReady ? '#66FF66' : '#ffffff',
          backgroundColor: '#00000080',
          padding: { x: 4, y: 2 }
        }).setOrigin(0.5);
        this.remotePlayers[p.playerId] = rp;
      } else {
        // Update name text color based on ready status
        rp.nameText.setColor(p.isReady ? '#66FF66' : '#ffffff');
      }
    });
  }

  handleRemotePlayerMove(data) {
    const rp = this.remotePlayers[data.playerId];
    if (rp) {
      rp.targetX = data.x;
      rp.targetY = data.y;
      if (data.anim) {
        rp.anims.play(data.anim, true);
      }
    }
  }
}

// Helpers
function getRoleByIndex(index) {
  const roles = ['detective', 'conductor', 'doctor', 'heir', 'steward', 'investigator'];
  return roles[index % roles.length];
}

export function initLobbyGame(containerId, socket, playerId, players) {
  const config = {
    type: Phaser.AUTO,
    parent: containerId,
    width: 800,
    height: 450,
    physics: {
      default: 'arcade',
      arcade: {
        gravity: { y: 0 },
        debug: false
      }
    },
    scene: LobbyScene
  };

  const game = new Phaser.Game(config);
  
  // Launch with context
  game.scene.start('LobbyScene', { socket, playerId, players });
  return game;
}
