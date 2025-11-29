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
        this.playerActive = true;
        this.bambooTimer = 0;
        this.bambooSpawnTime = 50;
        
        this.killer = 'fire';
        this.popupScores = [];
        
        // Parallax scrolling (C code lines 695-697)
        this.scrollFront = 0;
        this.scrollMiddle = 0;
        this.scrollBack = 0;
        this.scrollSpeed = 1.6;
        
        // Background music flag
        this.musicPlaying = false;
    }

    preload() {
        this.load.image('atlas01', 'assets/atlas01.png');
        this.load.image('atlas02', 'assets/atlas02.png');
        
        this.load.audio('jump', 'assets/jump.ogg');
        this.load.audio('eat_leaves', 'assets/eat_leaves.ogg');
        this.load.audio('dash', 'assets/dash.ogg');
        this.load.audio('dingo_die', 'assets/dingo_die.ogg');
        this.load.audio('snake_die', 'assets/snake_die.ogg');
    }

    create() {
        // Set camera bounds to allow rendering above screen (for branches)
        this.cameras.main.setBounds(0, -200, 1280, 920); // Allow 200px above, 200px below
        
        this.createSpritesFromAtlases();
        this.createBackground();
        this.createGround();
        
        // Create sounds with proper settings
        this.sounds = {
            jump: this.sound.add('jump', { volume: 0.3, loop: false }),
            eat: this.sound.add('eat_leaves', { volume: 0.3, loop: false }),
            dash: this.sound.add('dash', { volume: 0.3, loop: false }),
            dingoDie: this.sound.add('dingo_die', { volume: 0.4, loop: false }),
            snakeDie: this.sound.add('snake_die', { volume: 0.4, loop: false })
        };
        
        this.bambooData = [];
        this.bambooActive = [];
        this.bambooSprites = [];
        
        this.enemyData = [];
        this.enemyActive = [];
        this.enemyType = [];
        this.enemySprites = [];
        
        this.leafData = [];
        this.leafActive = [];
        this.leafSide = [];
        this.leafSprites = [];
        
        this.fireData = [];
        this.fireActive = [];
        this.fireSprites = [];
        this.fireOnFire = []; // Track if fire is climbing
        this.burntTreeSprites = []; // Burnt tree sprites for each fire
        this.fireFlameSprites = []; // Multiple flame sprites per fire (20 flames)
        
        this.particles = [];
        for (let i = 0; i < this.MAX_PARTICLES; i++) {
            this.particles.push({
                sprite: null,
                x: 0,
                y: 0,
                speed: 0,
                active: false
            });
        }
        
        for (let i = 0; i < this.MAX_BAMBOO; i++) {
            this.bambooData[i] = { x: 0, y: 0, width: 50, height: 720 };
            this.bambooActive[i] = false;
            this.bambooSprites[i] = null;
        }
        
        for (let i = 0; i < this.MAX_ENEMIES; i++) {
            this.enemyData[i] = { x: 0, y: 0, width: 50, height: 60 };
            this.enemyActive[i] = false;
            this.enemyType[i] = 'snake';
            this.enemySprites[i] = null;
        }
        
        for (let i = 0; i < this.MAX_LEAVES; i++) {
            this.leafData[i] = { x: 0, y: 0, width: 30, height: 30 };
            this.leafActive[i] = false;
            this.leafSide[i] = false;
            this.leafSprites[i] = null;
        }
        
        for (let i = 0; i < this.MAX_FIRE; i++) {
            this.fireData[i] = { x: 0, y: 720 - 30, width: 30, height: 128 }; // Start at bottom
            this.fireActive[i] = false;
            this.fireSprites[i] = null;
            this.fireOnFire[i] = false;
            this.burntTreeSprites[i] = null;
            this.fireFlameSprites[i] = []; // Array of 20 flame sprites
        }
        
        this.playerBounds = { x: 200, y: 400, width: 35, height: 60 };
        
        this.koalaSprite = this.add.sprite(this.playerBounds.x, this.playerBounds.y, 'koala_idle');
        this.koalaSprite.setOrigin(0, 0);
        this.koalaSprite.setScale(1.2);
        this.koalaSprite.setDepth(10);
        
        for (let i = 0; i < 6; i++) {
            this.bambooData[i].x = 150 + 200 * i;
            this.bambooData[i].y = 0;
            this.bambooActive[i] = true;
            
            this.bambooSprites[i] = this.add.image(this.bambooData[i].x, this.bambooData[i].y, 'bamboo');
            this.bambooSprites[i].setOrigin(0, 0);
            this.bambooSprites[i].setDepth(1);
            
            this.spawnLeavesOnBamboo(i);
        }
        
        this.createUI();
        
        // Apply initial seasonal colors (SPRING)
        this.updateSeasonVisuals();
        
        this.cursors = this.input.keyboard.createCursorKeys();
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        
        this.fireAnimFrame = 0;
        this.fireAnimTimer = 0;
    }

    createSpritesFromAtlases() {
        const atlas01 = this.textures.get('atlas01').getSourceImage();
        const atlas02 = this.textures.get('atlas02').getSourceImage();
        
        // Koala (100x100 from atlas)
        const koalaCanvas = document.createElement('canvas');
        koalaCanvas.width = 100;
        koalaCanvas.height = 100;
        const koalaCtx = koalaCanvas.getContext('2d');
        koalaCtx.drawImage(atlas01, 1025, 384, 100, 100, 0, 0, 100, 100);
        this.textures.addCanvas('koala_idle', koalaCanvas);
        
        const koalaJumpCanvas = document.createElement('canvas');
        koalaJumpCanvas.width = 100;
        koalaJumpCanvas.height = 100;
        const koalaJumpCtx = koalaJumpCanvas.getContext('2d');
        koalaJumpCtx.drawImage(atlas01, 1083, 1732, 100, 100, 0, 0, 100, 100);
        this.textures.addCanvas('koala_jump', koalaJumpCanvas);
        
        // Bamboo
        const bambooCanvas = document.createElement('canvas');
        bambooCanvas.width = 43;
        bambooCanvas.height = 720;
        const bambooCtx = bambooCanvas.getContext('2d');
        bambooCtx.drawImage(atlas02, 1788, 2, 43, 720, 0, 0, 43, 720);
        this.textures.addCanvas('bamboo', bambooCanvas);
        
        // Leaf (64x64) - NO scaling
        const leafCanvas = document.createElement('canvas');
        leafCanvas.width = 64;
        leafCanvas.height = 64;
        const leafCtx = leafCanvas.getContext('2d');
        leafCtx.drawImage(atlas01, 1857, 166, 64, 64, 0, 0, 64, 64);
        this.textures.addCanvas('leaf', leafCanvas);
        
        // Dingo (80x150) - smaller
        const dingoCanvas = document.createElement('canvas');
        dingoCanvas.width = 80;
        dingoCanvas.height = 150;
        const dingoCtx = dingoCanvas.getContext('2d');
        dingoCtx.drawImage(atlas01, 755, 1079, 80, 150, 0, 0, 80, 150);
        this.textures.addCanvas('dingo', dingoCanvas);
        
        // Snake (120x128) - smaller
        const snakeCanvas = document.createElement('canvas');
        snakeCanvas.width = 120;
        snakeCanvas.height = 128;
        const snakeCtx = snakeCanvas.getContext('2d');
        snakeCtx.drawImage(atlas01, 1025, 254, 120, 128, 0, 0, 120, 128);
        this.textures.addCanvas('snake', snakeCanvas);
        
        // Fire frames
        for (let i = 0; i < 4; i++) {
            const fireCanvas = document.createElement('canvas');
            fireCanvas.width = 64;
            fireCanvas.height = 128;
            const fireCtx = fireCanvas.getContext('2d');
            fireCtx.drawImage(atlas01, 516 + (i * 64), 930, 64, 128, 0, 0, 64, 128);
            this.textures.addCanvas(`fire_${i}`, fireCanvas);
        }
        
        // Burnt tree sprite (Rectangle){ 58, 1028, 43, 720 }
        const burntTreeCanvas = document.createElement('canvas');
        burntTreeCanvas.width = 43;
        burntTreeCanvas.height = 720;
        const burntTreeCtx = burntTreeCanvas.getContext('2d');
        burntTreeCtx.drawImage(atlas01, 58, 1028, 43, 720, 0, 0, 43, 720);
        this.textures.addCanvas('burnt_tree', burntTreeCanvas);
        
        // Season clock (exact from C)
        const clockBaseCanvas = document.createElement('canvas');
        clockBaseCanvas.width = 151;
        clockBaseCanvas.height = 150;
        const clockBaseCtx = clockBaseCanvas.getContext('2d');
        clockBaseCtx.drawImage(atlas01, 772, 1265, 151, 150, 0, 0, 151, 150);
        this.textures.addCanvas('clock_base', clockBaseCanvas);
        
        const clockDiscCanvas = document.createElement('canvas');
        clockDiscCanvas.width = 300;
        clockDiscCanvas.height = 303;
        const clockDiscCtx = clockDiscCanvas.getContext('2d');
        clockDiscCtx.drawImage(atlas01, 103, 1423, 300, 303, 0, 0, 300, 303);
        this.textures.addCanvas('clock_disc', clockDiscCanvas);
        
        // Leaf counter (gameplay_gui_leafcounter_base: 178x175)
        const leafCounterCanvas = document.createElement('canvas');
        leafCounterCanvas.width = 178;
        leafCounterCanvas.height = 175;
        const leafCounterCtx = leafCounterCanvas.getContext('2d');
        leafCounterCtx.drawImage(atlas01, 626, 1520, 178, 175, 0, 0, 178, 175);
        this.textures.addCanvas('leaf_counter_base', leafCounterCanvas);
        
        // Seasonal particles
        const iceCanvas = document.createElement('canvas');
        iceCanvas.width = 32;
        iceCanvas.height = 32;
        const iceCtx = iceCanvas.getContext('2d');
        iceCtx.drawImage(atlas02, 276, 766, 32, 32, 0, 0, 32, 32);
        this.textures.addCanvas('particle_ice', iceCanvas);
        
        const flowerCanvas = document.createElement('canvas');
        flowerCanvas.width = 32;
        flowerCanvas.height = 32;
        const flowerCtx = flowerCanvas.getContext('2d');
        flowerCtx.drawImage(atlas02, 808, 315, 32, 32, 0, 0, 32, 32);
        this.textures.addCanvas('particle_flower', flowerCanvas);
        
        const planetreeCanvas = document.createElement('canvas');
        planetreeCanvas.width = 32;
        planetreeCanvas.height = 32;
        const planetreeCtx = planetreeCanvas.getContext('2d');
        planetreeCtx.drawImage(atlas02, 538, 715, 32, 32, 0, 0, 32, 32);
        this.textures.addCanvas('particle_planetree', planetreeCanvas);
        
        // Grounds (all 4 seasons)
        ['spring', 'summer', 'fall', 'winter'].forEach((season, idx) => {
            const groundCanvas = document.createElement('canvas');
            groundCanvas.width = 640;
            groundCanvas.height = 77;
            const groundCtx = groundCanvas.getContext('2d');
            groundCtx.drawImage(atlas02, 1146, 2 + (idx * 79), 640, 77, 0, 0, 640, 77);
            this.textures.addCanvas(`ground_${season}`, groundCanvas);
        });
        
        // Background
        const bgCanvas = document.createElement('canvas');
        bgCanvas.width = 640;
        bgCanvas.height = 360;
        const bgCtx = bgCanvas.getContext('2d');
        bgCtx.drawImage(atlas02, 2, 2, 640, 360, 0, 0, 640, 360);
        this.textures.addCanvas('background', bgCanvas);
        
        // Background trees - ALL 3 LAYERS (from atlas02.h)
        const treeLayer1 = [
            { x: 1833, y: 353, w: 28, h: 335 },  // tree01_layer01
            { x: 690, y: 315, w: 26, h: 332 },   // tree02_layer01
            { x: 2028, y: 338, w: 15, h: 329 },  // tree03_layer01
            { x: 1860, y: 2, w: 38, h: 334 },    // tree04_layer01
            { x: 504, y: 364, w: 32, h: 349 },   // tree05_layer01
            { x: 1980, y: 2, w: 31, h: 334 },    // tree06_layer01
            { x: 606, y: 364, w: 25, h: 349 },   // tree07_layer01
            { x: 1896, y: 338, w: 32, h: 331 }   // tree08_layer01
        ];
        
        const treeLayer2 = [
            { x: 1998, y: 338, w: 28, h: 335 },  // tree01_layer02
            { x: 718, y: 315, w: 26, h: 332 },   // tree02_layer02
            { x: 774, y: 315, w: 15, h: 329 },   // tree03_layer02
            { x: 1900, y: 2, w: 38, h: 334 },    // tree04_layer02
            { x: 538, y: 364, w: 32, h: 349 },   // tree05_layer02
            { x: 2013, y: 2, w: 31, h: 334 },    // tree06_layer02
            { x: 633, y: 364, w: 25, h: 349 },   // tree07_layer02
            { x: 1930, y: 338, w: 32, h: 331 }   // tree08_layer02
        ];
        
        const treeLayer3 = [
            { x: 660, y: 315, w: 28, h: 335 },   // tree01_layer03
            { x: 746, y: 315, w: 26, h: 332 },   // tree02_layer03
            { x: 791, y: 315, w: 15, h: 329 },   // tree03_layer03
            { x: 1940, y: 2, w: 38, h: 334 },    // tree04_layer03
            { x: 572, y: 364, w: 32, h: 349 },   // tree05_layer03
            { x: 1863, y: 338, w: 31, h: 334 },  // tree06_layer03
            { x: 1833, y: 2, w: 25, h: 349 },    // tree07_layer03
            { x: 1964, y: 338, w: 32, h: 331 }   // tree08_layer03
        ];
        
        // Extract all tree layers
        for (let i = 0; i < 8; i++) {
            // Layer 1
            const coord1 = treeLayer1[i];
            const canvas1 = document.createElement('canvas');
            canvas1.width = coord1.w;
            canvas1.height = coord1.h;
            const ctx1 = canvas1.getContext('2d');
            ctx1.drawImage(atlas02, coord1.x, coord1.y, coord1.w, coord1.h, 0, 0, coord1.w, coord1.h);
            this.textures.addCanvas(`tree0${i+1}_layer1`, canvas1);
            
            // Layer 2
            const coord2 = treeLayer2[i];
            const canvas2 = document.createElement('canvas');
            canvas2.width = coord2.w;
            canvas2.height = coord2.h;
            const ctx2 = canvas2.getContext('2d');
            ctx2.drawImage(atlas02, coord2.x, coord2.y, coord2.w, coord2.h, 0, 0, coord2.w, coord2.h);
            this.textures.addCanvas(`tree0${i+1}_layer2`, canvas2);
            
            // Layer 3
            const coord3 = treeLayer3[i];
            const canvas3 = document.createElement('canvas');
            canvas3.width = coord3.w;
            canvas3.height = coord3.h;
            const ctx3 = canvas3.getContext('2d');
            ctx3.drawImage(atlas02, coord3.x, coord3.y, coord3.w, coord3.h, 0, 0, coord3.w, coord3.h);
            this.textures.addCanvas(`tree0${i+1}_layer3`, canvas3);
        }
        
        // Ground layers for parallax (gameplay_back_ground00-03)
        const groundCoords = [
            { x: 1146, y: 2, w: 640, h: 77 },    // ground00
            { x: 1146, y: 81, w: 640, h: 77 },   // ground01
            { x: 1146, y: 160, w: 640, h: 77 },  // ground02
            { x: 1146, y: 239, w: 640, h: 77 }   // ground03
        ];
        
        for (let i = 0; i < 4; i++) {
            const coord = groundCoords[i];
            const canvas = document.createElement('canvas');
            canvas.width = coord.w;
            canvas.height = coord.h;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(atlas02, coord.x, coord.y, coord.w, coord.h, 0, 0, coord.w, coord.h);
            this.textures.addCanvas(`ground_layer${i}`, canvas);
        }
    }

    createBackground() {
        // Static sky background
        this.bgSprites = [];
        for (let i = 0; i < 3; i++) {
            const bg = this.add.image(i * 640, 0, 'background');
            bg.setOrigin(0, 0);
            bg.setScale(2);
            bg.setDepth(-10);
            this.bgSprites.push(bg);
        }
        
        // LAYER 3 - Back layer (slowest - 50% speed)
        // CREATE 4 SCREENS for seamless pre-rendering (no visible pop-in!)
        this.treesLayer3 = [];
        this.groundLayer3 = [];
        const parallaxBackOffset = Phaser.Math.Between(10, 100);
        
        for (let screen = 0; screen < 4; screen++) {  // 4 screens!
            for (let i = 0; i < 8; i++) {
                const treeX = (screen * 1280) + parallaxBackOffset + (140 * i);
                
                // Create tree
                const tree = this.add.image(treeX, 67, `tree0${i+1}_layer3`);
                tree.setOrigin(0, 0);
                tree.setScale(2);
                tree.setDepth(-6);
                this.treesLayer3.push(tree);
                
                // NORMAL ground at TOP of THIS tree (fills space above)
                const groundTopNormal = this.add.image(treeX, -10, 'ground_layer3');
                groundTopNormal.setOrigin(0, 0);
                groundTopNormal.setScale(2);
                groundTopNormal.setDepth(-5);
                this.treesLayer3.push(groundTopNormal); // Add to trees array!
                
                // INVERTED ground at TOP of THIS tree (creates branches)
                const groundTopInverted = this.add.image(treeX, 144, 'ground_layer3');
                groundTopInverted.setOrigin(0, 1);
                groundTopInverted.setScale(2, -2);
                groundTopInverted.setDepth(-5);
                this.treesLayer3.push(groundTopInverted); // Add to trees array!
            }
        }
        
        // Bottom ground for layer 3 - CREATE 4 TILES (2 screens worth) for seamless wrapping
        for (let i = 0; i < 4; i++) {
            const ground = this.add.image(i * 1280, 469, 'ground_layer3');
            ground.setOrigin(0, 0);
            ground.setScale(2);
            ground.setDepth(-6);
            this.groundLayer3.push(ground);
        }
        
        // LAYER 2 - Middle layer (medium - 75% speed)
        // CREATE 4 SCREENS for seamless pre-rendering
        this.treesLayer2 = [];
        this.groundLayer2 = [];
        
        for (let screen = 0; screen < 4; screen++) {  // 4 screens!
            for (let i = 0; i < 8; i++) {
                const treeX = (screen * 1280) + (140 * i);
                
                // Create tree
                const tree = this.add.image(treeX, 67, `tree0${i+1}_layer2`);
                tree.setOrigin(0, 0);
                tree.setScale(2);
                tree.setDepth(-4);
                this.treesLayer2.push(tree);
                
                // NORMAL ground at TOP of THIS tree
                const groundTopNormal = this.add.image(treeX, -10, 'ground_layer2');
                groundTopNormal.setOrigin(0, 0);
                groundTopNormal.setScale(2);
                groundTopNormal.setDepth(-3);
                this.treesLayer2.push(groundTopNormal);
                
                // INVERTED ground at TOP of THIS tree
                const groundTopInverted = this.add.image(treeX, 144, 'ground_layer2');
                groundTopInverted.setOrigin(0, 1);
                groundTopInverted.setScale(2, -2);
                groundTopInverted.setDepth(-3);
                this.treesLayer2.push(groundTopInverted);
            }
        }
        
        // Bottom ground for layer 2 - CREATE 4 TILES for seamless wrapping
        for (let i = 0; i < 4; i++) {
            const ground = this.add.image(i * 1280, 509, 'ground_layer2');
            ground.setOrigin(0, 0);
            ground.setScale(2);
            ground.setDepth(-4);
            this.groundLayer2.push(ground);
        }
        
        // LAYER 1 - Front layer (fastest - 100% speed)
        // CREATE 4 SCREENS for seamless pre-rendering
        this.treesLayer1 = [];
        this.groundLayer1 = [];
        const parallaxFrontOffset = Phaser.Math.Between(100, 200);
        
        for (let screen = 0; screen < 4; screen++) {  // 4 screens!
            for (let i = 0; i < 8; i++) {
                const treeX = (screen * 1280) + parallaxFrontOffset + (140 * i);
                const y = (i === 2 || i === 5) ? 55 : 60;
                
                // Create tree
                const tree = this.add.image(treeX, y, `tree0${i+1}_layer1`);
                tree.setOrigin(0, 0);
                tree.setScale(2);
                tree.setDepth(-2);
                this.treesLayer1.push(tree);
                
                // NORMAL ground at TOP of THIS tree
                const groundTopNormal = this.add.image(treeX, -10, 'ground_layer1');
                groundTopNormal.setOrigin(0, 0);
                groundTopNormal.setScale(2);
                groundTopNormal.setDepth(-1);
                this.treesLayer1.push(groundTopNormal);
                
                // INVERTED ground at TOP of THIS tree
                const groundTopInverted = this.add.image(treeX, 144, 'ground_layer1');
                groundTopInverted.setOrigin(0, 1);
                groundTopInverted.setScale(2, -2);
                groundTopInverted.setDepth(-1);
                this.treesLayer1.push(groundTopInverted);
            }
        }
        
        // Bottom ground for layer 1 - CREATE 4 TILES for seamless wrapping
        for (let i = 0; i < 4; i++) {
            const ground = this.add.image(i * 1280, 559, 'ground_layer1');
            ground.setOrigin(0, 0);
            ground.setScale(2);
            ground.setDepth(-2);
            this.groundLayer1.push(ground);
        }
    }

    createGround() {
        // Main ground (closest/foreground)
        this.groundSprites = [];
        for (let i = 0; i < 5; i++) {
            const ground = this.add.image(i * 640, 720 - 77, 'ground_spring');
            ground.setOrigin(0, 0);
            ground.setDepth(5);
            this.groundSprites.push(ground);
        }
    }
    
    updateParallax() {
        // Update scroll positions (C code lines 695-697)
        this.scrollFront -= this.scrollSpeed;
        this.scrollMiddle -= this.scrollSpeed * 0.75;
        this.scrollBack -= this.scrollSpeed * 0.5;
        
        // Wrap around at 4 screens (5120px) for seamless infinite scrolling
        if (this.scrollFront <= -5120) this.scrollFront += 5120;
        if (this.scrollMiddle <= -5120) this.scrollMiddle += 5120;
        if (this.scrollBack <= -5120) this.scrollBack += 5120;
        
        // Update Layer 1 trees (front - fastest) - now 32 trees (4 screens × 8)
        this.treesLayer1.forEach((tree, i) => {
            const groupNum = Math.floor(i / 3); // Every 3 sprites is one tree group
            const spriteType = i % 3; // 0=tree, 1=normal ground, 2=inverted ground
            const screenNum = Math.floor(groupNum / 8);
            const treeNum = groupNum % 8;
            const baseX = (screenNum * 1280) + 150 + (140 * treeNum);
            tree.x = baseX + this.scrollFront;
            
            // Wrap individual sprites
            if (tree.x < -640) tree.x += 5120;
        });
        
        // Update Layer 2 trees (middle) - 32 trees
        this.treesLayer2.forEach((tree, i) => {
            const groupNum = Math.floor(i / 3);
            const screenNum = Math.floor(groupNum / 8);
            const treeNum = groupNum % 8;
            const baseX = (screenNum * 1280) + (140 * treeNum);
            tree.x = baseX + this.scrollMiddle;
            
            // Wrap individual sprites
            if (tree.x < -640) tree.x += 5120;
        });
        
        // Update Layer 3 trees (back - slowest) - 32 trees
        this.treesLayer3.forEach((tree, i) => {
            const groupNum = Math.floor(i / 3);
            const screenNum = Math.floor(groupNum / 8);
            const treeNum = groupNum % 8;
            const baseX = (screenNum * 1280) + 50 + (140 * treeNum);
            tree.x = baseX + this.scrollBack;
            
            // Wrap individual sprites
            if (tree.x < -640) tree.x += 5120;
        });
        
        // Update ground layers (each has 4 bottom ground sprites)
        this.groundLayer1.forEach((ground, i) => {
            ground.x = (i * 1280) + this.scrollFront;
            if (ground.x < -1280) ground.x += 5120;
        });
        
        this.groundLayer2.forEach((ground, i) => {
            ground.x = (i * 1280) + this.scrollMiddle;
            if (ground.x < -1280) ground.x += 5120;
        });
        
        this.groundLayer3.forEach((ground, i) => {
            ground.x = (i * 1280) + this.scrollBack;
            if (ground.x < -1280) ground.x += 5120;
        });
    }

    createUI() {
        // Score indicator with background circle (like original)
        const scoreBase = this.add.circle(90, 60, 55, 0x000000, 0.7);
        scoreBase.setStrokeStyle(4, 0x4a3728);
        scoreBase.setScrollFactor(0).setDepth(99);
        
        this.scoreText = this.add.text(90, 60, '0', {
            fontSize: '40px',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 6,
            fontStyle: 'bold',
            fontFamily: 'Arial'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(100);
        
        // Leaf counter with icon (exact from C)
        this.leafCounterBase = this.add.image(90, 160, 'leaf_counter_base');
        this.leafCounterBase.setScale(0.55);
        this.leafCounterBase.setScrollFactor(0).setDepth(99);
        
        this.leafText = this.add.text(90, 160, '0', {
            fontSize: '36px',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 6,
            fontStyle: 'bold',
            fontFamily: 'Arial'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(100);
        
        // Season clock (top right) - EXACT position from C
        this.seasonClock = this.add.image(1190, 90, 'clock_disc');
        this.seasonClock.setScale(0.45);
        this.seasonClock.setScrollFactor(0).setDepth(100);
        
        this.seasonClockBase = this.add.image(1190, 90, 'clock_base');
        this.seasonClockBase.setScale(0.5);
        this.seasonClockBase.setScrollFactor(0).setDepth(101);
        
        this.seasonText = this.add.text(1190, 165, 'SPRING', {
            fontSize: '26px',
            fill: '#81c784',
            stroke: '#000000',
            strokeThickness: 6,
            fontStyle: 'bold',
            fontFamily: 'Arial'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(100);
    }

    spawnLeavesOnBamboo(bambooIndex) {
        const maxLeaves = Math.floor(Math.random() * 3);
        
        for (let j = 0; j < maxLeaves; j++) {
            for (let k = 0; k < this.MAX_LEAVES; k++) {
                if (!this.leafActive[k]) {
                    const position = Math.floor(Math.random() * 5);
                    this.leafSide[k] = Math.random() > 0.5;
                    this.leafData[k].x = this.leafSide[k] ? this.bambooData[bambooIndex].x + 18 : this.bambooData[bambooIndex].x - 18;
                    this.leafData[k].y = 30 + (720 / 5) * position;
                    this.leafActive[k] = true;
                    
                    // Leaf NO EXTRA SCALING - use natural size
                    this.leafSprites[k] = this.add.image(this.leafData[k].x - 25, this.leafData[k].y - 15, 'leaf');
                    this.leafSprites[k].setOrigin(0, 0);
                    this.leafSprites[k].setScale(1.0);
                    this.leafSprites[k].setDepth(2);
                    
                    break;
                }
            }
        }
    }

    update() {
        if (!this.playerActive) return;
        
        // Update parallax scrolling for depth effect
        this.updateParallax();
        
        for (let i = 0; i < this.MAX_BAMBOO; i++) {
            if (this.bambooActive[i]) {
                this.bambooData[i].x -= this.speed;
                
                if (this.bambooSprites[i]) {
                    this.bambooSprites[i].x = this.bambooData[i].x;
                }
                
                if (this.bambooData[i].x < -100) {
                    this.bambooActive[i] = false;
                    if (this.bambooSprites[i]) {
                        this.bambooSprites[i].destroy();
                        this.bambooSprites[i] = null;
                    }
                }
            }
        }
        
        for (let i = 0; i < this.MAX_LEAVES; i++) {
            if (this.leafActive[i]) {
                let found = false;
                for (let j = 0; j < this.MAX_BAMBOO; j++) {
                    if (this.bambooActive[j]) {
                        const expectedX = this.leafSide[i] ? this.bambooData[j].x + 18 : this.bambooData[j].x - 18;
                        if (Math.abs(this.leafData[i].x - expectedX) < 50) {
                            this.leafData[i].x = expectedX;
                            found = true;
                            break;
                        }
                    }
                }
                
                if (this.leafSprites[i]) {
                    this.leafSprites[i].x = this.leafData[i].x - 25;
                }
                
                if (!found || this.leafData[i].x < -100) {
                    this.leafActive[i] = false;
                    if (this.leafSprites[i]) {
                        this.leafSprites[i].destroy();
                        this.leafSprites[i] = null;
                    }
                }
            }
        }
        
        for (let i = 0; i < this.MAX_ENEMIES; i++) {
            if (this.enemyActive[i]) {
                let found = false;
                for (let j = 0; j < this.MAX_BAMBOO; j++) {
                    if (this.bambooActive[j]) {
                        const expectedX = this.bambooData[j].x - 15;
                        if (Math.abs(this.enemyData[i].x - expectedX) < 50) {
                            this.enemyData[i].x = expectedX;
                            found = true;
                            break;
                        }
                    }
                }
                
                if (this.enemySprites[i]) {
                    if (this.enemyType[i] === 'dingo') {
                        this.enemySprites[i].x = this.enemyData[i].x - (this.enemyData[i].width / 2);
                        this.enemySprites[i].y = this.enemyData[i].y - (this.enemyData[i].height / 4);
                    } else {
                        this.enemySprites[i].x = this.enemyData[i].x - this.enemyData[i].width;
                        this.enemySprites[i].y = this.enemyData[i].y - (this.enemyData[i].height / 2);
                    }
                }
                
                if (!found || this.enemyData[i].x <= -this.enemyData[i].width) {
                    this.enemyActive[i] = false;
                    if (this.enemySprites[i]) {
                        this.enemySprites[i].destroy();
                        this.enemySprites[i] = null;
                    }
                }
            }
        }
        
        for (let i = 0; i < this.MAX_FIRE; i++) {
            if (this.fireActive[i]) {
                let found = false;
                for (let j = 0; j < this.MAX_BAMBOO; j++) {
                    if (this.bambooActive[j]) {
                        const expectedX = this.bambooData[j].x - 5;
                        if (Math.abs(this.fireData[i].x - expectedX) < 50) {
                            this.fireData[i].x = expectedX;
                            found = true;
                            break;
                        }
                    }
                }
                
                // Check if fire reached player's X position - start climbing!
                if (this.fireData[i].x <= this.playerBounds.x + this.playerBounds.width && !this.fireOnFire[i]) {
                    this.fireOnFire[i] = true;
                    // Show burnt tree when fire starts climbing
                    if (this.burntTreeSprites[i]) {
                        this.burntTreeSprites[i].setVisible(true);
                        this.burntTreeSprites[i].x = this.fireData[i].x + 5;
                    }
                }
                
                // Climb up the tree (C code: fire[i].y -= fireSpeed)
                if (this.fireOnFire[i] && this.fireData[i].y > -50) {
                    this.fireData[i].y -= 2; // Climb speed (fireSpeed from C code)
                }
                
                if (this.fireSprites[i]) {
                    this.fireSprites[i].x = this.fireData[i].x;
                    this.fireSprites[i].y = this.fireData[i].y;
                }
                
                // Update burnt tree to show progressive burning
                if (this.burntTreeSprites[i] && this.fireOnFire[i]) {
                    this.burntTreeSprites[i].x = this.fireData[i].x + 5;
                    // Crop burnt tree to only show burned portion up to fire position
                    const burnHeight = 720 - this.fireData[i].y;
                    this.burntTreeSprites[i].setCrop(0, Math.max(0, 720 - burnHeight), 43, burnHeight);
                }
                
                // Update multiple fire flames (C code: for j=0 to MAX_FIRE_FLAMES)
                const fireOffset = 5; // Horizontal offset for alternating flames
                for (let j = 0; j < 20; j++) {
                    if (this.fireFlameSprites[i][j]) {
                        // Show flame if fire has reached this height
                        // C code: if ((fire[i].y - 25 <= (j*43)) && fireActive[i])
                        if ((this.fireData[i].y - 25 <= (j * 43)) && this.fireOnFire[i]) {
                            this.fireFlameSprites[i][j].setVisible(true);
                            
                            // Alternate flames left/right (C code uses j%2)
                            if (j % 2 > 0) {
                                this.fireFlameSprites[i][j].x = this.fireData[i].x + fireOffset - 10;
                            } else {
                                this.fireFlameSprites[i][j].x = this.fireData[i].x - fireOffset;
                            }
                            
                            // Position at height (C code: 40*j)
                            this.fireFlameSprites[i][j].y = 40 * j;
                        } else {
                            this.fireFlameSprites[i][j].setVisible(false);
                        }
                    }
                }
                
                if (!found || this.fireData[i].x < -100) {
                    this.fireActive[i] = false;
                    this.fireOnFire[i] = false;
                    if (this.fireSprites[i]) {
                        this.fireSprites[i].destroy();
                        this.fireSprites[i] = null;
                    }
                    if (this.burntTreeSprites[i]) {
                        this.burntTreeSprites[i].destroy();
                        this.burntTreeSprites[i] = null;
                    }
                    // Destroy all flame sprites
                    if (this.fireFlameSprites[i]) {
                        for (let j = 0; j < this.fireFlameSprites[i].length; j++) {
                            if (this.fireFlameSprites[i][j]) {
                                this.fireFlameSprites[i][j].destroy();
                            }
                        }
                        this.fireFlameSprites[i] = [];
                    }
                }
            }
        }
        
        this.fireAnimTimer++;
        if (this.fireAnimTimer >= 10) {
            this.fireAnimFrame = (this.fireAnimFrame + 1) % 4;
            this.fireAnimTimer = 0;
            
            for (let i = 0; i < this.MAX_FIRE; i++) {
                if (this.fireActive[i] && this.fireSprites[i]) {
                    this.fireSprites[i].setTexture(`fire_${this.fireAnimFrame}`);
                }
                // Animate all flame sprites
                if (this.fireFlameSprites[i]) {
                    for (let j = 0; j < this.fireFlameSprites[i].length; j++) {
                        if (this.fireFlameSprites[i][j] && this.fireFlameSprites[i][j].visible) {
                            // Use different frames for variety (C code uses curFrame1, curFrame2, curFrame3)
                            const frameIndex = (this.fireAnimFrame + (j % 3)) % 4;
                            this.fireFlameSprites[i][j].setTexture(`fire_${frameIndex}`);
                        }
                    }
                }
            }
        }
        
        this.updateSeasonalParticles();
        
        for (let i = this.popupScores.length - 1; i >= 0; i--) {
            const popup = this.popupScores[i];
            popup.alpha -= 0.02;
            popup.y -= 3;
            popup.text.setAlpha(popup.alpha);
            popup.text.setPosition(popup.x, popup.y);
            
            if (popup.alpha <= 0) {
                popup.text.destroy();
                this.popupScores.splice(i, 1);
            }
        }
        
        this.bambooTimer++;
        if (this.bambooTimer >= this.bambooSpawnTime) {
            this.spawnBamboo();
            this.bambooTimer = 0;
            this.bambooSpawnTime = 35 + Math.floor(Math.random() * 51);
        }
        
        this.seasonTimer++;
        if (this.seasonTimer >= this.SEASON_DURATION) {
            this.seasonTimer = 0;
            this.currentSeason = (this.currentSeason + 1) % 4;
            if (this.currentSeason === 0) {
                this.seasonsCompleted++;
            }
            this.updateSeasonVisuals();
        }
        
        const progress = this.seasonTimer / this.SEASON_DURATION;
        this.clockRotation = progress * 90 + (this.currentSeason * 90);
        this.seasonClock.setAngle(this.clockRotation);
        
        this.updatePlayer();
        
        this.score += 0.1;
        this.scoreText.setText(Math.floor(this.score).toString());
        this.leafText.setText(this.currentLeaves.toString());
        
        if (this.playerBounds.y > 800) {
            this.gameOver();
        }
    }

    updateSeasonalParticles() {
        const seasonName = this.seasons[this.currentSeason];
        
        if (Math.random() < 0.08) {
            for (let i = 0; i < this.MAX_PARTICLES; i++) {
                if (!this.particles[i].active) {
                    this.particles[i].x = Math.random() * 1280;
                    this.particles[i].y = -20;
                    this.particles[i].speed = 1 + Math.random() * 2;
                    this.particles[i].active = true;
                    
                    let texture;
                    if (seasonName === 'WINTER') texture = 'particle_ice';
                    else if (seasonName === 'SPRING') texture = 'particle_flower';
                    else if (seasonName === 'FALL') texture = 'particle_planetree';
                    else continue;
                    
                    if (this.particles[i].sprite) {
                        this.particles[i].sprite.destroy();
                    }
                    
                    this.particles[i].sprite = this.add.image(this.particles[i].x, this.particles[i].y, texture);
                    this.particles[i].sprite.setScale(0.5 + Math.random() * 0.5);
                    this.particles[i].sprite.setDepth(0);
                    
                    break;
                }
            }
        }
        
        for (let i = 0; i < this.MAX_PARTICLES; i++) {
            if (this.particles[i].active) {
                this.particles[i].y += this.particles[i].speed;
                this.particles[i].x -= this.speed * 0.5;
                
                if (this.particles[i].sprite) {
                    this.particles[i].sprite.x = this.particles[i].x;
                    this.particles[i].sprite.y = this.particles[i].y;
                    this.particles[i].sprite.setAngle(this.particles[i].sprite.angle + 2);
                }
                
                if (this.particles[i].y > 720 || this.particles[i].x < -50) {
                    this.particles[i].active = false;
                    if (this.particles[i].sprite) {
                        this.particles[i].sprite.destroy();
                        this.particles[i].sprite = null;
                    }
                }
            }
        }
    }

    updateSeasonVisuals() {
        const seasonName = this.seasons[this.currentSeason];
        const colors = {
            'SPRING': '#81c784',
            'SUMMER': '#fdd835',
            'FALL': '#ff9800',
            'WINTER': '#64b5f6'
        };
        
        this.seasonText.setText(seasonName);
        this.seasonText.setColor(colors[seasonName]);
        
        const groundTexture = `ground_${seasonName.toLowerCase()}`;
        this.groundSprites.forEach(sprite => {
            sprite.setTexture(groundTexture);
        });
        
        // Apply seasonal color tint using exact C code colors with overlay blend
        const seasonColors = this.getSeasonColors(seasonName);
        
        // Tint background with color02
        const bgTint = Phaser.Display.Color.GetColor(
            seasonColors.color02.r,
            seasonColors.color02.g,
            seasonColors.color02.b
        );
        this.bgSprites.forEach(sprite => {
            sprite.setTint(bgTint);
        });
        
        // Tint all tree layers with color02
        const treeTint = Phaser.Display.Color.GetColor(
            seasonColors.color02.r,
            seasonColors.color02.g,
            seasonColors.color02.b
        );
        
        if (this.treesLayer1) this.treesLayer1.forEach(tree => tree.setTint(treeTint));
        if (this.treesLayer2) this.treesLayer2.forEach(tree => tree.setTint(treeTint));
        if (this.treesLayer3) this.treesLayer3.forEach(tree => tree.setTint(treeTint));
        
        // Tint ground layers with color01
        const groundTint = Phaser.Display.Color.GetColor(
            seasonColors.color01.r,
            seasonColors.color01.g,
            seasonColors.color01.b
        );
        
        if (this.groundLayer1) this.groundLayer1.forEach(ground => ground.setTint(groundTint));
        if (this.groundLayer2) this.groundLayer2.forEach(ground => ground.setTint(groundTint));
        if (this.groundLayer3) this.groundLayer3.forEach(ground => ground.setTint(groundTint));
        
        this.cameras.main.flash(1000);
    }
    
    // Get exact seasonal colors from C code (screen_gameplay.c lines 530-680)
    getSeasonColors(seasonName) {
        const colors = {
            'SPRING': {
                color00: { r: 196, g: 176, b: 49 },   // Yellow-green
                color01: { r: 178, g: 163, b: 67 },   // Olive
                color02: { r: 133, g: 143, b: 90 },   // Sage green
                color03: { r: 133, g: 156, b: 42 }    // Green
            },
            'SUMMER': {
                color00: { r: 129, g: 172, b: 86 },   // Light green
                color01: { r: 145, g: 165, b: 125 },  // Sage
                color02: { r: 161, g: 130, b: 73 },   // Tan/brown
                color03: { r: 198, g: 103, b: 51 }    // Rust
            },
            'FALL': {
                color00: { r: 242, g: 113, b: 62 },   // Orange
                color01: { r: 190, g: 135, b: 114 },  // Peach
                color02: { r: 144, g: 130, b: 101 },  // Muted brown
                color03: { r: 214, g: 133, b: 58 }    // Dark orange
            },
            'WINTER': {
                color00: { r: 130, g: 130, b: 181 },  // Cool grey-blue
                color01: { r: 145, g: 145, b: 166 },  // Grey
                color02: { r: 104, g: 142, b: 144 },  // Blue-grey
                color03: { r: 57, g: 140, b: 173 }    // Blue
            }
        };
        
        return colors[seasonName] || colors['SPRING'];
    }

    updatePlayer() {
        switch (this.state) {
            case 'GRABED':
                this.grabCounter++;
                this.koalaSprite.setTexture('koala_idle');
                
                for (let i = 0; i < this.MAX_BAMBOO; i++) {
                    if (this.bambooActive[i]) {
                        if (this.checkCollision(this.playerBounds, this.bambooData[i])) {
                            this.playerBounds.x = this.bambooData[i].x - 15;
                            
                            if (this.playerBounds.y < 520) {
                                this.playerBounds.y += 1;
                            }
                            break;
                        }
                    }
                }
                
                if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
                    this.state = 'JUMPING';
                    this.velocity = this.JUMP;
                    this.jumpSpeed = this.JUMP_SPEED;
                    this.grabCounter = 0;
                    
                    // Play jump sound
                    if (!this.sounds.jump.isPlaying) {
                        this.sounds.jump.play();
                    }
                }
                break;
                
            case 'JUMPING':
                this.koalaSprite.setTexture('koala_jump');
                
                this.playerBounds.x += this.jumpSpeed;
                this.velocity -= this.GRAVITY;
                this.playerBounds.y -= this.velocity;
                
                if (this.playerBounds.y < 50) {
                    this.playerBounds.y = 50;
                    this.velocity = 0;
                }
                
                for (let i = 0; i < this.MAX_BAMBOO; i++) {
                    if (this.bambooActive[i] && this.grabCounter >= 10) {
                        if (this.checkCollision(this.playerBounds, this.bambooData[i])) {
                            this.state = 'GRABED';
                            this.playerBounds.x = this.bambooData[i].x - 15;
                            this.velocity = 0;
                            this.jumpSpeed = 0;
                        }
                    }
                }
                
                this.grabCounter++;
                break;
        }
        
        this.koalaSprite.x = this.playerBounds.x - this.playerBounds.width;
        this.koalaSprite.y = this.playerBounds.y - 25;
        
        for (let i = 0; i < this.MAX_LEAVES; i++) {
            if (this.leafActive[i]) {
                if (this.checkCollision(this.playerBounds, this.leafData[i])) {
                    this.leafActive[i] = false;
                    if (this.leafSprites[i]) {
                        this.leafSprites[i].destroy();
                        this.leafSprites[i] = null;
                    }
                    this.currentLeaves++;
                    this.score += 10;
                    
                    // Play eat sound
                    if (!this.sounds.eat.isPlaying) {
                        this.sounds.eat.play();
                    }
                    
                    // Show popup
                    const popupText = this.add.text(this.leafData[i].x, this.leafData[i].y, '+1', {
                        fontSize: '32px',
                        fill: '#8BB300',
                        stroke: '#000',
                        strokeThickness: 5,
                        fontStyle: 'bold'
                    }).setDepth(50);
                    
                    this.popupScores.push({
                        text: popupText,
                        x: this.leafData[i].x,
                        y: this.leafData[i].y,
                        alpha: 1.0
                    });
                }
            }
        }
        
        for (let i = 0; i < this.MAX_ENEMIES; i++) {
            if (this.enemyActive[i]) {
                if (this.checkCollision(this.playerBounds, this.enemyData[i])) {
                    this.killer = this.enemyType[i];
                    
                    // Play death sound
                    if (this.killer === 'dingo' && !this.sounds.dingoDie.isPlaying) {
                        this.sounds.dingoDie.play();
                    } else if (this.killer === 'snake' && !this.sounds.snakeDie.isPlaying) {
                        this.sounds.snakeDie.play();
                    }
                    
                    this.gameOver();
                    return;
                }
            }
        }
        
        for (let i = 0; i < this.MAX_FIRE; i++) {
            if (this.fireActive[i]) {
                if (this.checkCollision(this.playerBounds, this.fireData[i])) {
                    this.killer = 'fire';
                    this.gameOver();
                    return;
                }
            }
        }
    }

    spawnBamboo() {
        for (let i = 0; i < this.MAX_BAMBOO; i++) {
            if (!this.bambooActive[i]) {
                this.bambooData[i].x = 1280;
                this.bambooData[i].y = 0;
                this.bambooActive[i] = true;
                
                this.bambooSprites[i] = this.add.image(this.bambooData[i].x, this.bambooData[i].y, 'bamboo');
                this.bambooSprites[i].setOrigin(0, 0);
                this.bambooSprites[i].setDepth(1);
                
                this.spawnLeavesOnBamboo(i);
                
                const seasonName = this.seasons[this.currentSeason];
                
                if (seasonName === 'SPRING') {
                    if (Math.random() * 100 <= this.DINGO_SPAWN_CHANCE) {
                        this.spawnEnemy('dingo', i);
                    }
                } else if (seasonName === 'SUMMER' || seasonName === 'FALL') {
                    if (Math.random() * 100 <= this.SNAKE_SPAWN_CHANCE) {
                        this.spawnEnemy('snake', i);
                    }
                    
                    if (seasonName === 'SUMMER' && Math.random() * 100 <= this.FIRE_SPAWN_CHANCE) {
                        this.spawnFire(i);
                    }
                }
                
                break;
            }
        }
    }

    spawnEnemy(type, bambooIndex) {
        for (let e = 0; e < this.MAX_ENEMIES; e++) {
            if (!this.enemyActive[e]) {
                this.enemyType[e] = type;
                
                let position;
                if (type === 'dingo') {
                    position = Math.floor(Math.random() * 3) + 1;
                    this.enemyData[e].width = 64;
                    this.enemyData[e].height = 90;
                } else {
                    position = Math.floor(Math.random() * 5);
                    this.enemyData[e].width = 50;
                    this.enemyData[e].height = 60;
                }
                
                this.enemyData[e].x = 1280 - 15;
                this.enemyData[e].y = 25 + (720 / 5) * position;
                this.enemyActive[e] = true;
                
                const offsetX = type === 'dingo' ? -32 : -50;
                const offsetY = type === 'dingo' ? -22 : -30;
                const scale = type === 'dingo' ? 1.0 : 0.9; // SMALLER!
                
                this.enemySprites[e] = this.add.image(
                    this.enemyData[e].x + offsetX,
                    this.enemyData[e].y + offsetY,
                    type
                );
                this.enemySprites[e].setOrigin(0, 0);
                this.enemySprites[e].setScale(scale);
                this.enemySprites[e].setDepth(2);
                
                break;
            }
        }
    }

    spawnFire(bambooIndex) {
        for (let f = 0; f < this.MAX_FIRE; f++) {
            if (!this.fireActive[f]) {
                this.fireData[f].x = 1280 - 5;
                this.fireData[f].y = 720 - 30; // Start at bottom
                this.fireActive[f] = true;
                this.fireOnFire[f] = false;
                
                // Create main fire sprite at bottom
                this.fireSprites[f] = this.add.image(this.fireData[f].x, 562, `fire_${this.fireAnimFrame}`);
                this.fireSprites[f].setOrigin(0, 0);
                this.fireSprites[f].setScale(0.7);
                this.fireSprites[f].setDepth(2);
                
                // Create 20 flame sprites for climbing (MAX_FIRE_FLAMES from C code)
                this.fireFlameSprites[f] = [];
                for (let j = 0; j < 20; j++) {
                    const flame = this.add.image(0, 0, `fire_${this.fireAnimFrame}`);
                    flame.setOrigin(0, 0);
                    flame.setScale(0.5);
                    flame.setDepth(2);
                    flame.setVisible(false); // Hidden initially
                    this.fireFlameSprites[f].push(flame);
                }
                
                // Create burnt tree sprite (initially invisible)
                this.burntTreeSprites[f] = this.add.image(this.fireData[f].x + 5, 0, 'burnt_tree');
                this.burntTreeSprites[f].setOrigin(0, 0);
                this.burntTreeSprites[f].setDepth(1);
                this.burntTreeSprites[f].setVisible(false);
                
                break;
            }
        }
    }

    checkCollision(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + rect1.width > rect2.x &&
               rect1.y < rect2.y + rect2.height &&
               rect1.y + rect1.height > rect2.y;
    }

    gameOver() {
        this.playerActive = false;
        
        // Stop all sounds
        this.sound.stopAll();
        
        if (this.score > this.highScore) {
            this.highScore = Math.floor(this.score);
            localStorage.setItem('koalaHighScore', this.highScore.toString());
        }
        
        this.scene.start('GameOverScene', {
            score: Math.floor(this.score),
            leaves: this.currentLeaves,
            seasons: this.seasonsCompleted,
            highScore: this.highScore,
            killer: this.killer,
            clockRotation: this.clockRotation
        });
    }
}
