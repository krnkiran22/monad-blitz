/**
 * ParallaxSystem - 3-layer tree rendering with different scroll speeds
 * Matches C code DrawParallaxFront/Middle/Back functions
 * screen_gameplay.c lines 3257-3318
 */
export default class ParallaxSystem {
    constructor(scene) {
        this.scene = scene;
        
        // Scroll positions (matches C code)
        this.scrollFront = 0;
        this.scrollMiddle = 0;
        this.scrollBack = 0;
        
        // Scroll speeds (matches C code update logic lines 695-697)
        this.scrollSpeed = 1.6; // Base speed
        
        // Tree sprites (3 layers × 16 trees per layer = 48 trees total)
        this.treesLayer1 = [];
        this.treesLayer2 = [];
        this.treesLayer3 = [];
        
        // Ground sprites (3 layers)
        this.groundLayer1 = [];
        this.groundLayer2 = [];
        this.groundLayer3 = [];
        
        // Parallax offsets (randomized - matches C code)
        this.parallaxFrontOffset = 0;
        this.parallaxBackOffset = 0;
    }

    create() {
        // Random offsets (matches C code line 4035-4036)
        this.parallaxFrontOffset = Phaser.Math.Between(100, 200);
        this.parallaxBackOffset = Phaser.Math.Between(10, 100);
        
        this.createLayer1(); // Front layer (scrollFront)
        this.createLayer2(); // Middle layer (scrollMiddle at 0.75x speed)
        this.createLayer3(); // Back layer (scrollBack at 0.5x speed)
    }

    // Front layer - closest to camera (C code lines 3273-3296)
    createLayer1() {
        // 8 tree types × 2 screens = 16 trees
        const treeTypes = ['tree01', 'tree02', 'tree03', 'tree04', 'tree05', 'tree06', 'tree07', 'tree08'];
        
        for (let screen = 0; screen < 2; screen++) {
            for (let i = 0; i < 8; i++) {
                const treeKey = `${treeTypes[i]}_layer1`;
                const x = (screen * 1280) + this.parallaxFrontOffset + (140 * i);
                const y = (i === 2 || i === 5) ? 55 : 60; // Some trees at different heights
                
                const tree = this.scene.add.image(x, y, treeKey);
                tree.setOrigin(0, 0);
                tree.setScale(2);
                tree.setDepth(-1);
                this.treesLayer1.push(tree);
            }
        }
        
        // Ground for layer 1 (C code lines 3294-3296)
        for (let i = 0; i < 2; i++) {
            const ground = this.scene.add.image(i * 1280, 559, 'ground_layer1');
            ground.setOrigin(0, 0);
            ground.setScale(2);
            ground.setDepth(-1);
            this.groundLayer1.push(ground);
            
            // Mirror ground (top part - flipped)
            const groundTop = this.scene.add.image(i * 1280, -33, 'ground_layer1');
            groundTop.setOrigin(0, 0);
            groundTop.setScale(2, -2); // Flip vertically
            groundTop.setDepth(-1);
            this.groundLayer1.push(groundTop);
        }
    }

    // Middle layer - medium depth (C code lines 3301-3316)
    createLayer2() {
        const treeTypes = ['tree01', 'tree02', 'tree03', 'tree04', 'tree05', 'tree06', 'tree07', 'tree08'];
        
        for (let screen = 0; screen < 2; screen++) {
            for (let i = 0; i < 8; i++) {
                const treeKey = `${treeTypes[i]}_layer2`;
                const x = (screen * 1280) + (140 * i);
                const y = 67;
                
                const tree = this.scene.add.image(x, y, treeKey);
                tree.setOrigin(0, 0);
                tree.setScale(2);
                tree.setDepth(-2);
                this.treesLayer2.push(tree);
            }
        }
        
        // Ground for layer 2
        for (let i = 0; i < 2; i++) {
            const ground = this.scene.add.image(i * 1280, 509, 'ground_layer2');
            ground.setOrigin(0, 0);
            ground.setScale(2);
            ground.setDepth(-2);
            this.groundLayer2.push(ground);
            
            const groundTop = this.scene.add.image(i * 1280, 19, 'ground_layer2');
            groundTop.setOrigin(0, 0);
            groundTop.setScale(2, -2);
            groundTop.setDepth(-2);
            this.groundLayer2.push(groundTop);
        }
    }

    // Back layer - farthest from camera (C code - similar to layer1/2)
    createLayer3() {
        const treeTypes = ['tree01', 'tree02', 'tree03', 'tree04', 'tree05', 'tree06', 'tree07', 'tree08'];
        
        for (let screen = 0; screen < 2; screen++) {
            for (let i = 0; i < 8; i++) {
                const treeKey = `${treeTypes[i]}_layer3`;
                const x = (screen * 1280) + this.parallaxBackOffset + (140 * i);
                const y = 67;
                
                const tree = this.scene.add.image(x, y, treeKey);
                tree.setOrigin(0, 0);
                tree.setScale(2);
                tree.setDepth(-3);
                this.treesLayer3.push(tree);
            }
        }
        
        // Ground for layer 3
        for (let i = 0; i < 2; i++) {
            const ground = this.scene.add.image(i * 1280, 469, 'ground_layer3');
            ground.setOrigin(0, 0);
            ground.setScale(2);
            ground.setDepth(-3);
            this.groundLayer3.push(ground);
            
            const groundTop = this.scene.add.image(i * 1280, 67, 'ground_layer3');
            groundTop.setOrigin(0, 0);
            groundTop.setScale(2, -2);
            groundTop.setDepth(-3);
            this.groundLayer3.push(groundTop);
        }
    }

    // Update parallax (C code lines 695-707)
    update(speedMod) {
        // Update scroll positions (matches C code)
        this.scrollFront -= this.scrollSpeed * speedMod;
        this.scrollMiddle -= (this.scrollSpeed * speedMod * 0.75); // 75% speed
        this.scrollBack -= (this.scrollSpeed * speedMod * 0.5);    // 50% speed
        
        // Wrap around (matches C code lines 705-707)
        if (this.scrollFront <= -1280) this.scrollFront = 0;
        if (this.scrollMiddle <= -1280) this.scrollMiddle = 0;
        if (this.scrollBack <= -1280) this.scrollBack = 0;
        
        // Update tree positions
        this.treesLayer1.forEach((tree, i) => {
            const baseX = (Math.floor(i / 8) * 1280) + this.parallaxFrontOffset + (140 * (i % 8));
            tree.x = baseX + this.scrollFront;
        });
        
        this.treesLayer2.forEach((tree, i) => {
            const baseX = (Math.floor(i / 8) * 1280) + (140 * (i % 8));
            tree.x = baseX + this.scrollMiddle;
        });
        
        this.treesLayer3.forEach((tree, i) => {
            const baseX = (Math.floor(i / 8) * 1280) + this.parallaxBackOffset + (140 * (i % 8));
            tree.x = baseX + this.scrollBack;
        });
        
        // Update ground positions
        this.groundLayer1.forEach((ground, i) => {
            const baseX = Math.floor(i / 2) * 1280;
            ground.x = baseX + this.scrollFront;
        });
        
        this.groundLayer2.forEach((ground, i) => {
            const baseX = Math.floor(i / 2) * 1280;
            ground.x = baseX + this.scrollMiddle;
        });
        
        this.groundLayer3.forEach((ground, i) => {
            const baseX = Math.floor(i / 2) * 1280;
            ground.x = baseX + this.scrollBack;
        });
    }

    // Apply color tinting to all layers (C code uses color00, color01, color02, color03)
    applyTinting(colorTinting) {
        // Layer 1 trees use color02, ground uses color01
        const tint2 = colorTinting.getTint(2);
        const tint1 = colorTinting.getTint(1);
        const tint0 = colorTinting.getTint(0);
        
        this.treesLayer1.forEach(tree => tree.setTint(tint2));
        this.treesLayer2.forEach(tree => tree.setTint(tint2));
        this.treesLayer3.forEach(tree => tree.setTint(tint2));
        
        this.groundLayer1.forEach(ground => ground.setTint(tint1));
        this.groundLayer2.forEach(ground => ground.setTint(tint1));
        this.groundLayer3.forEach(ground => ground.setTint(tint1));
    }

    setScrollSpeed(speed) {
        this.scrollSpeed = speed;
    }
}
