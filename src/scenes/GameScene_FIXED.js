import AudioManager from '../managers/AudioManager.js';
import ColorTinting from '../managers/ColorTinting.js';

export default class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
    }

    init() {
        this.JUMP = 15;
        this.JUMP_SPEED = 6;
        this.GRAVITY = 0.5;
        
        this.MAX_BAMBOO = 20;
        this.MAX_ENEMIES = 20;
        this.MAX_LEAVES = 50;
        this.MAX_FIRE = 20;
        this.MAX_PARTICLES = 32;
        
        this.SNAKE_SPAWN_CHANCE = 15;
        this.DINGO_SPAWN_CHANCE = 15;
        this.FIRE_SPAWN_CHANCE = 20;
        
        this.SEASON_DURATION = 1200;
        this.seasons = ['SPRING', 'SUMMER', 'FALL', 'WINTER'];
        this.currentSeason = 0;
        this.seasonTimer = 0;
        this.seasonsCompleted = 0;
        this.clockRotation = 0;
        
        this.state = 'GRABED';
        this.velocity = 0;
        this.jumpSpeed = 0;
        this.grabCounter = 10;
        
        this.score = 0;
        this.currentLeaves = 0;
        this.highScore = parseInt(localStorage.getItem('koalaHighScore') || '0');
        
        this.speed = 4;
        this.speedMod = 1.2;
        this.playerActive = true;
        this.bambooTimer = 0;
        this.bambooSpawnTime = 50;
        
        this.killer = 'fire';
        this.popupScores = [];
        
        // Parallax scroll positions
        this.scrollFront = 0;
        this.scrollMiddle = 0;
        this.scrollBack = 0;
        this.scrollSpeed = 1.6;
    }

    preload() {
        this.load.image('atlas01', 'assets/atlas01.png');
        this.load.image('atlas02', 'assets/atlas02.png');
        
        // Initialize AudioManager
        this.audioManager = new AudioManager(this);
        this.audioManager.preload();
    }

    create() {
        // Initialize color tinting system
        this.colorTinting = new ColorTinting();
        this.colorTinting.initializeForSeason('SPRING');
        
        // Create sprites first
        this.createSpritesFromAtlases();
        
        // Create background with parallax
        this.createParallaxBackground();
        
        // Initialize audio
        this.audioManager.create();
        
        // ... rest of initialization (bamboo, enemies, etc.)
        this.initializeGameObjects();
        this.createUI();
        
        this.cursors = this.input.keyboard.createCursorKeys();
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        
        this.fireAnimFrame = 0;
        this.fireAnimTimer = 0;
    }

    createParallaxBackground() {
        // Sky background (static)
        this.bgSprites = [];
        for (let i = 0; i < 3; i++) {
            const bg = this.add.image(i * 640, 0, 'background');
            bg.setOrigin(0, 0);
            bg.setScale(2);
            bg.setDepth(-10);
            this.bgSprites.push(bg);
        }
        
        // LAYER 3 - Back (slowest - 50% speed)
        this.treesLayer3 = [];
        this.groundLayer3 = [];
        const parallaxBackOffset = Phaser.Math.Between(10, 100);
        
        for (let screen = 0; screen < 2; screen++) {
            for (let i = 0; i < 8; i++) {
                const tree = this.add.image(
                    (screen * 1280) + parallaxBackOffset + (140 * i),
                    67,
                    `tree0${i+1}_layer3`
                );
                tree.setOrigin(0, 0);
                tree.setScale(2);
                tree.setDepth(-6);
                this.treesLayer3.push(tree);
            }
        }
        
        // Ground layer 3
        for (let i = 0; i < 2; i++) {
            const ground = this.add.image(i * 1280, 469, 'ground_layer3');
            ground.setOrigin(0, 0);
            ground.setScale(2);
            ground.setDepth(-6);
            this.groundLayer3.push(ground);
        }
        
        // LAYER 2 - Middle (medium - 75% speed)
        this.treesLayer2 = [];
        this.groundLayer2 = [];
        
        for (let screen = 0; screen < 2; screen++) {
            for (let i = 0; i < 8; i++) {
                const tree = this.add.image(
                    (screen * 1280) + (140 * i),
                    67,
                    `tree0${i+1}_layer2`
                );
                tree.setOrigin(0, 0);
                tree.setScale(2);
                tree.setDepth(-4);
                this.treesLayer2.push(tree);
            }
        }
        
        // Ground layer 2
        for (let i = 0; i < 2; i++) {
            const ground = this.add.image(i * 1280, 509, 'ground_layer2');
            ground.setOrigin(0, 0);
            ground.setScale(2);
            ground.setDepth(-4);
            this.groundLayer2.push(ground);
        }
        
        // LAYER 1 - Front (fastest - 100% speed)
        this.treesLayer1 = [];
        this.groundLayer1 = [];
        const parallaxFrontOffset = Phaser.Math.Between(100, 200);
        
        for (let screen = 0; screen < 2; screen++) {
            for (let i = 0; i < 8; i++) {
                const y = (i === 2 || i === 5) ? 55 : 60;
                const tree = this.add.image(
                    (screen * 1280) + parallaxFrontOffset + (140 * i),
                    y,
                    `tree0${i+1}_layer1`
                );
                tree.setOrigin(0, 0);
                tree.setScale(2);
                tree.setDepth(-2);
                this.treesLayer1.push(tree);
            }
        }
        
        // Ground layer 1
        for (let i = 0; i < 2; i++) {
            const ground = this.add.image(i * 1280, 559, 'ground_layer1');
            ground.setOrigin(0, 0);
            ground.setScale(2);
            ground.setDepth(-2);
            this.groundLayer1.push(ground);
        }
        
        // Main ground (closest)
        this.groundSprites = [];
        for (let i = 0; i < 5; i++) {
            const ground = this.add.image(i * 640, 720 - 77, 'ground_spring');
            ground.setOrigin(0, 0);
            ground.setDepth(5);
            this.groundSprites.push(ground);
        }
        
        // Apply initial tinting
        this.applySeasonalTinting();
    }

    applySeasonalTinting() {
        const tint2 = this.colorTinting.getTint(2);
        const tint1 = this.colorTinting.getTint(1);
        
        // Apply to all tree layers
        this.treesLayer1.forEach(tree => tree.setTint(tint2));
        this.treesLayer2.forEach(tree => tree.setTint(tint2));
        this.treesLayer3.forEach(tree => tree.setTint(tint2));
        
        // Apply to ground layers
        this.groundLayer1.forEach(ground => ground.setTint(tint1));
        this.groundLayer2.forEach(ground => ground.setTint(tint1));
        this.groundLayer3.forEach(ground => ground.setTint(tint1));
        
        // Apply to background
        const bgTint = this.colorTinting.getTint(2);
        this.bgSprites.forEach(bg => bg.setTint(bgTint));
    }

    updateParallax() {
        // Update scroll positions (C code lines 695-697)
        this.scrollFront -= this.scrollSpeed * this.speedMod;
        this.scrollMiddle -= this.scrollSpeed * this.speedMod * 0.75;
        this.scrollBack -= this.scrollSpeed * this.speedMod * 0.5;
        
        // Wrap around
        if (this.scrollFront <= -1280) this.scrollFront = 0;
        if (this.scrollMiddle <= -1280) this.scrollMiddle = 0;
        if (this.scrollBack <= -1280) this.scrollBack = 0;
        
        // Update tree positions - Layer 1
        this.treesLayer1.forEach((tree, i) => {
            const screenNum = Math.floor(i / 8);
            const treeNum = i % 8;
            const baseX = (screenNum * 1280) + 100 + (140 * treeNum);
            tree.x = baseX + this.scrollFront;
        });
        
        // Update tree positions - Layer 2
        this.treesLayer2.forEach((tree, i) => {
            const screenNum = Math.floor(i / 8);
            const treeNum = i % 8;
            const baseX = (screenNum * 1280) + (140 * treeNum);
            tree.x = baseX + this.scrollMiddle;
        });
        
        // Update tree positions - Layer 3
        this.treesLayer3.forEach((tree, i) => {
            const screenNum = Math.floor(i / 8);
            const treeNum = i % 8;
            const baseX = (screenNum * 1280) + 50 + (140 * treeNum);
            tree.x = baseX + this.scrollBack;
        });
        
        // Update ground positions
        this.groundLayer1.forEach((ground, i) => {
            ground.x = (i * 1280) + this.scrollFront;
        });
        
        this.groundLayer2.forEach((ground, i) => {
            ground.x = (i * 1280) + this.scrollMiddle;
        });
        
        this.groundLayer3.forEach((ground, i) => {
            ground.x = (i * 1280) + this.scrollBack;
        });
    }

    update() {
        if (!this.playerActive) return;
        
        // Update parallax scrolling
        this.updateParallax();
        
        // Update color tinting (smooth transitions)
        this.colorTinting.update();
        
        // Update audio manager
        this.audioManager.update();
        
        // ... rest of game update logic
        this.updateGameObjects();
        this.updatePlayer();
        
        this.score += 0.1;
        this.scoreText.setText(Math.floor(this.score).toString());
        this.leafText.setText(this.currentLeaves.toString());
    }

    // Placeholder methods - will be filled from existing GameScene
    createSpritesFromAtlases() {
        // Extract all sprites (COPY from existing GameScene.js lines 172-331)
    }
    
    initializeGameObjects() {
        // Initialize bamboo, enemies, leaves, etc (COPY from existing)
    }
    
    createUI() {
        // Create UI elements (COPY from existing)
    }
    
    updateGameObjects() {
        // Update bamboo, enemies, leaves (COPY from existing)
    }
    
    updatePlayer() {
        // Update player logic (COPY from existing)
    }
}
