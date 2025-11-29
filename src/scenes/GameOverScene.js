export default class GameOverScene extends Phaser.Scene {
    constructor() {
        super('GameOverScene');
    }

    init(data) {
        this.finalScore = data.score || 0;
        this.seasons = data.seasons || 0;
        this.leavesCollected = data.leaves || 0;
        this.killCount = data.kills || 0;
        this.killer = data.killer || 0; // 0=fire, 1=snake, 2=dingo, 3=owl, 4=natural, 5=bee, 6=eagle
        this.killHistory = data.killHistory || [];
        this.initSeason = data.initSeason || 0;
        this.currentSeason = data.currentSeason || 0;
        this.initYear = data.initYear || 2025;
        
        // Multiplayer data
        this.isMultiplayer = data.multiplayer || false;
        this.winner = data.winner || 'tie'; // 'you', 'opponent', 'tie'
        this.opponentScore = data.opponentScore || 0;
        this.opponentLeaves = data.opponentLeaves || 0;
    }

    create() {
        this.cameras.main.setBackgroundColor('#b0a797');
        
        this.framesCounter = -10;
        this.endingState = 'DELAY';
        this.currentScore = 0;
        this.seasonsCounter = 0;
        this.currentLeavesEnding = 0;
        this.framesKillsCounter = 0;
        this.activeKills = [];
        
        const seasonRotations = [225, 135, 45, 315]; // SUMMER, AUTUMN, WINTER, SPRING
        this.initRotation = seasonRotations[this.initSeason];
        this.clockRotation = this.initRotation;
        const yearsElapsed = Math.floor(this.seasons / 4);
        this.finalRotation = seasonRotations[this.currentSeason] + (360 * yearsElapsed);
        
        const seasonNames = ['SUMMER', 'AUTUMN', 'WINTER', 'SPRING'];
        this.initMonthText = seasonNames[this.initSeason];
        this.finalMonthText = seasonNames[this.currentSeason];
        this.finalYears = this.initYear + yearsElapsed;
        
        this.extractSprites();
        this.createUI();
        this.createLeafParticles();
    }

    extractSprites() {
        // Get atlas images
        const atlas01 = this.textures.get('atlas01').getSourceImage();
        const atlas02 = this.textures.get('atlas02').getSourceImage();
        
        // Background from atlas02
        const bgRect = { x: 260, y: 1028, w: 256, h: 256 };
        if (!this.textures.exists('ending_background')) {
            const canvas = document.createElement('canvas');
            canvas.width = bgRect.w;
            canvas.height = bgRect.h;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(atlas02, bgRect.x, bgRect.y, bgRect.w, bgRect.h, 0, 0, bgRect.w, bgRect.h);
            this.textures.addCanvas('ending_background', canvas);
        }
        
        // All other sprites from atlas01
        const sprites = {
            'ending_button_replay': { x: 974, y: 1403, w: 123, h: 123 },
            'ending_button_share': { x: 954, y: 1528, w: 123, h: 123 },
            'ending_button_shop': { x: 958, y: 1653, w: 123, h: 123 },
            'ending_button_trophy': { x: 1479, y: 386, w: 123, h: 123 },
            'ending_plate_frame': { x: 2, y: 2, w: 1052, h: 250 },
            'ending_paint_back': { x: 765, y: 254, w: 258, h: 305 },
            'ending_paint_frame': { x: 103, y: 1028, w: 334, h: 393 },
            'ending_paint_koalafire': { x: 771, y: 643, w: 219, h: 216 },
            'ending_paint_koalasnake': { x: 774, y: 861, w: 219, h: 216 },
            'ending_paint_koaladingo': { x: 439, y: 1278, w: 219, h: 216 },
            'ending_paint_koalaowl': { x: 661, y: 1790, w: 100, h: 81 },
            'ending_paint_koalageneric': { x: 516, y: 678, w: 253, h: 250 },
            'ending_paint_koalabee': { x: 439, y: 1060, w: 219, h: 216 },
            'ending_paint_koalaeagle': { x: 405, y: 1496, w: 219, h: 216 },
            'ending_score_frame': { x: 419, y: 1714, w: 119, h: 123 },
            'ending_score_frameback': { x: 540, y: 1714, w: 119, h: 123 },
            'ending_score_seasonicon': { x: 925, y: 1265, w: 135, h: 136 },
            'ending_score_seasonneedle': { x: 2032, y: 2, w: 12, h: 45 },
            'ending_score_leavesicon': { x: 1387, y: 254, w: 135, h: 130 },
            'ending_score_enemyicon': { x: 661, y: 1697, w: 113, h: 91 },
            'ending_score_planksmall': { x: 1583, y: 116, w: 389, h: 48 },
            'ending_score_planklarge': { x: 1056, y: 132, w: 525, h: 48 },
            'ending_plate_headsnake': { x: 65, y: 1968, w: 46, h: 67 },
            'ending_plate_headdingo': { x: 1481, y: 182, w: 56, h: 70 },
            'ending_plate_headowl': { x: 226, y: 1885, w: 68, h: 52 },
            'ending_plate_headbee': { x: 1318, y: 516, w: 62, h: 60 },
            'ending_plate_headeagle': { x: 1974, y: 116, w: 39, h: 48 },
            'particle_ecualyptusleaf': { x: 1989, y: 200, w: 32, h: 32 }
        };
        
        for (const [key, rect] of Object.entries(sprites)) {
            if (!this.textures.exists(key)) {
                const canvas = document.createElement('canvas');
                canvas.width = rect.w;
                canvas.height = rect.h;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(atlas01, rect.x, rect.y, rect.w, rect.h, 0, 0, rect.w, rect.h);
                this.textures.addCanvas(key, canvas);
            }
        }
    }

    createUI() {
        const W = 1280;
        const H = 720;
        
        // Tiled background (5x3 grid)
        for (let y = 0; y < 3; y++) {
            for (let x = 0; x < 5; x++) {
                this.add.image(x * 256, y * 256, 'ending_background').setOrigin(0, 0);
            }
        }
        
        // Main plate frame at bottom
        this.add.image(W * 0.042, H * 0.606, 'ending_plate_frame').setOrigin(0, 0);
        
        // Paint background and frame
        this.add.image(W * 0.133, H * 0.097, 'ending_paint_back').setOrigin(0, 0);
        
        // Death painting based on killer
        const paintings = {
            'fire': { key: 'ending_paint_koalafire', x: W * 0.145, y: H * 0.171 },
            'snake': { key: 'ending_paint_koalasnake', x: W * 0.145, y: H * 0.171 },
            'dingo': { key: 'ending_paint_koaladingo', x: W * 0.145, y: H * 0.171 },
            'owl': { key: 'ending_paint_koalaowl', x: W * 0.2, y: H * 0.3 },
            'natural': { key: 'ending_paint_koalageneric', x: W * 0.133, y: H * 0.171 },
            'bee': { key: 'ending_paint_koalabee', x: W * 0.145, y: H * 0.171 },
            'eagle': { key: 'ending_paint_koalaeagle', x: W * 0.145, y: H * 0.171 },
            'offscreen': { key: 'ending_paint_koalageneric', x: W * 0.133, y: H * 0.171 }
        };
        const painting = paintings[this.killer] || paintings['natural'];
        this.add.image(painting.x, painting.y, painting.key).setOrigin(0, 0);
        
        this.add.image(W * 0.102, H * 0.035, 'ending_paint_frame').setOrigin(0, 0);
        
        // Score planks
        this.add.image(W * 0.521, H * 0.163, 'ending_score_planksmall').setOrigin(0, 0);
        this.add.image(W * 0.415, H * 0.303, 'ending_score_planklarge').setOrigin(0, 0);
        this.add.image(W * 0.521, H * 0.440, 'ending_score_planksmall').setOrigin(0, 0);
        
        // Season clock
        this.add.image(W * 0.529, H * 0.096, 'ending_score_seasonicon').setOrigin(0, 0);
        this.seasonNeedle = this.add.image(W * 0.579 + 6, H * 0.189 + 6, 'ending_score_seasonneedle');
        this.seasonNeedle.setOrigin(0.5, 0.9);
        this.seasonNeedle.setAngle(this.clockRotation);
        this.add.image(W * 0.535, H * 0.11, 'ending_score_frame').setOrigin(0, 0);
        
        // Leaves
        this.add.image(W * 0.430, H * 0.246, 'ending_score_frameback').setOrigin(0, 0);
        this.add.image(W * 0.429, H * 0.244, 'ending_score_frame').setOrigin(0, 0);
        this.add.image(W * 0.421, H * 0.228, 'ending_score_leavesicon').setOrigin(0, 0);
        
        // Enemy kills
        this.add.image(W * 0.536, H * 0.383, 'ending_score_frameback').setOrigin(0, 0);
        this.add.image(W * 0.535, H * 0.383, 'ending_score_frame').setOrigin(0, 0);
        this.add.image(W * 0.538, H * 0.414, 'ending_score_enemyicon').setOrigin(0, 0);
        
        // Buttons
        this.replayButton = this.add.image(W * 0.871, H * 0.096, 'ending_button_replay').setOrigin(0, 0).setInteractive();
        this.replayButton.on('pointerdown', () => this.replay());
        this.replayButton.on('pointerover', () => this.replayButton.setTint(0xFFD700));
        this.replayButton.on('pointerout', () => this.replayButton.clearTint());
        
        this.add.image(W * 0.871, H * 0.303, 'ending_button_shop').setOrigin(0, 0);
        this.add.image(W * 0.871, H * 0.513, 'ending_button_trophy').setOrigin(0, 0);
        this.add.image(W * 0.871, H * 0.719, 'ending_button_share').setOrigin(0, 0);
        
        // Text displays
        this.seasonsText = this.add.text(W * 0.73, H * 0.14, '000', {
            fontSize: '48px', fill: '#fff', fontFamily: 'Arial', fontStyle: 'bold'
        });
        
        this.leavesText = this.add.text(W * 0.73, H * 0.29, '000', {
            fontSize: '48px', fill: '#fff', fontFamily: 'Arial', fontStyle: 'bold'
        });
        
        this.scoreText = this.add.text(W * 0.715, H * 0.426, '0000', {
            fontSize: '48px', fill: '#fff', fontFamily: 'Arial', fontStyle: 'bold'
        });
        
        this.add.text(W * 0.1, H * 0.7, 
            `${this.initMonthText} ${this.initYear} - ${this.finalMonthText} ${this.finalYears}`, {
            fontSize: '24px', fill: '#fff', fontFamily: 'Arial'
        });
        
        // Death messages
        const messages = {
            'fire': ['Kissed by fire'],
            'snake': ['Digested alive by a', 'big snake'],
            'dingo': ['A dingo took your life'],
            'owl': ['Turned into a pretty', 'owl pellet'],
            'natural': ['LIFE KILLED YOU'],
            'bee': ['You turn out to be', 'allergic to bee sting'],
            'eagle': ['KOALA IS DEAD :('],
            'offscreen': ['Fell off the edge', 'of the world']
        };
        
        const msg = messages[this.killer] || messages['natural'];
        this.add.text(W * 0.13, H * 0.78, msg[0], {
            fontSize: '24px', fill: '#fff', fontFamily: 'Arial'
        });
        if (msg[1]) {
            this.add.text(W * 0.13, H * 0.83, msg[1], {
                fontSize: '24px', fill: '#fff', fontFamily: 'Arial'
            });
        }
        
        // Multiplayer result display
        if (this.isMultiplayer) {
            // Winner banner at top with proper styling
            let winnerText = '';
            let winnerColor = '#FFD700';
            let bannerBg = 0xFFD700;
            
            if (this.winner === 'you') {
                winnerText = '🏆 YOU WON! 🏆';
                winnerColor = '#FFFFFF';
                bannerBg = 0x4CAF50;
            } else if (this.winner === 'opponent') {
                winnerText = '😢 YOU LOST 😢';
                winnerColor = '#FFFFFF';
                bannerBg = 0xF44336;
            } else {
                winnerText = "🤝 IT'S A TIE! 🤝";
                winnerColor = '#4a3728';
                bannerBg = 0xFFD700;
            }
            
            // Banner background plank
            const bannerPlank = this.add.image(W * 0.585, H * 0.07, 'ending_score_planklarge');
            bannerPlank.setOrigin(0, 0);
            bannerPlank.setTint(bannerBg);
            
            this.add.text(W * 0.845, H * 0.095, winnerText, {
                fontSize: '42px',
                fill: winnerColor,
                stroke: '#000',
                strokeThickness: 8,
                fontStyle: 'bold',
                fontFamily: 'Arial'
            }).setOrigin(0.5);
            
            // Multiplayer results panel with wooden plank background
            const resultsPlank = this.add.image(W * 0.53, H * 0.52, 'ending_score_planklarge');
            resultsPlank.setOrigin(0, 0);
            resultsPlank.setScale(1.0, 1.8);
            
            this.add.text(W * 0.79, H * 0.53, 'MULTIPLAYER RESULTS', {
                fontSize: '26px',
                fill: '#FFD700',
                stroke: '#000',
                strokeThickness: 5,
                fontStyle: 'bold',
                fontFamily: 'Arial'
            }).setOrigin(0.5);
            
            // Your score with icon
            const yourLeafIcon = this.add.image(W * 0.65, H * 0.60, 'ending_score_leavesicon');
            yourLeafIcon.setScale(0.25);
            
            this.add.text(W * 0.73, H * 0.60, `Your Leaves: ${this.leavesCollected}`, {
                fontSize: '28px',
                fill: '#8BB300',
                stroke: '#000',
                strokeThickness: 5,
                fontStyle: 'bold',
                fontFamily: 'Arial'
            }).setOrigin(0, 0.5);
            
            // Opponent score with icon
            const oppLeafIcon = this.add.image(W * 0.65, H * 0.68, 'ending_score_leavesicon');
            oppLeafIcon.setScale(0.25);
            oppLeafIcon.setTint(0xFF6B6B);
            
            this.add.text(W * 0.73, H * 0.68, `Opponent Leaves: ${this.opponentLeaves}`, {
                fontSize: '28px',
                fill: '#FF6B6B',
                stroke: '#000',
                strokeThickness: 5,
                fontStyle: 'bold',
                fontFamily: 'Arial'
            }).setOrigin(0, 0.5);
            
            // Difference with visual separator
            const diff = Math.abs(this.leavesCollected - this.opponentLeaves);
            if (diff > 0) {
                // Separator line
                const separator = this.add.graphics();
                separator.lineStyle(3, 0x4a3728, 1);
                separator.lineBetween(W * 0.66, H * 0.74, W * 0.92, H * 0.74);
                
                this.add.text(W * 0.79, H * 0.80, `Difference: ${diff} leaves`, {
                    fontSize: '24px',
                    fill: '#FFD700',
                    stroke: '#000',
                    strokeThickness: 4,
                    fontStyle: 'bold',
                    fontFamily: 'Arial'
                }).setOrigin(0.5);
            }
        }
    }

    createLeafParticles() {
        this.leafParticles = [];
        for (let i = 0; i < 20; i++) {
            const particle = this.add.image(0, 0, 'particle_ecualyptusleaf');
            particle.setVisible(false).setScale(0.5);
            this.leafParticles.push({
                sprite: particle, vx: 0, vy: 0, alpha: 1, active: false
            });
        }
    }

    update() {
        this.framesCounter++;
        
        switch (this.endingState) {
            case 'DELAY':
                if (this.framesCounter >= 10) {
                    this.endingState = 'SEASONS';
                    this.framesCounter = 0;
                }
                break;
                
            case 'SEASONS':
                if (this.seasons > 0) {
                    const progress = Math.min(this.framesCounter / 90, 1);
                    this.seasonsCounter = Math.floor(this.seasons * progress);
                    this.clockRotation = this.initRotation - (this.finalRotation - this.initRotation) * progress;
                    this.seasonNeedle.setAngle(this.clockRotation);
                    this.seasonsText.setText(String(this.seasonsCounter).padStart(3, '0'));
                    
                    if (this.framesCounter >= 90) {
                        this.endingState = 'LEAVES';
                        this.framesCounter = 0;
                    }
                } else this.endingState = 'LEAVES';
                break;
                
            case 'LEAVES':
                if (this.leavesCollected > 0) {
                    if (this.framesCounter % 4 === 0 && this.currentLeavesEnding < this.leavesCollected) {
                        this.currentLeavesEnding++;
                        this.leavesText.setText(String(this.currentLeavesEnding).padStart(3, '0'));
                        
                        for (let particle of this.leafParticles) {
                            if (!particle.active) {
                                particle.sprite.setPosition(1280 * 0.46, 720 * 0.32).setVisible(true);
                                particle.vx = Phaser.Math.Between(-5, 5);
                                particle.vy = Phaser.Math.Between(-5, 5);
                                particle.alpha = 1;
                                particle.active = true;
                                break;
                            }
                        }
                    }
                    
                    if (this.currentLeavesEnding >= this.leavesCollected) {
                        this.endingState = 'KILLS';
                        this.framesCounter = 0;
                    }
                } else this.endingState = 'KILLS';
                break;
                
            case 'KILLS':
                if (this.killCount > 0) {
                    const progress = Math.min(this.framesCounter / 90, 1);
                    this.currentScore = Math.floor(this.finalScore * progress);
                    this.scoreText.setText(String(this.currentScore).padStart(4, '0'));
                    
                    this.framesKillsCounter++;
                    if (this.framesKillsCounter >= 15 && this.activeKills.length < this.killHistory.length) {
                        this.showNextKillIcon();
                        this.framesKillsCounter = 0;
                    }
                    
                    if (this.framesCounter >= 90) this.endingState = 'REPLAY';
                } else this.endingState = 'REPLAY';
                break;
        }
        
        for (let particle of this.leafParticles) {
            if (particle.active) {
                particle.sprite.x += particle.vx;
                particle.sprite.y += particle.vy;
                particle.sprite.angle += 6;
                particle.alpha -= 0.03;
                
                if (particle.alpha <= 0) {
                    particle.active = false;
                    particle.sprite.setVisible(false);
                } else {
                    particle.sprite.setAlpha(particle.alpha);
                }
            }
        }
    }

    showNextKillIcon() {
        const index = this.activeKills.length;
        if (index >= this.killHistory.length) return;
        
        const iconKeys = ['', 'ending_plate_headsnake', 'ending_plate_headdingo', 
                          'ending_plate_headowl', 'ending_plate_headbee', 'ending_plate_headeagle'];
        
        const iconKey = iconKeys[this.killHistory[index]];
        if (!iconKey) return;
        
        const x = 1280 * 0.448 + (46 * (index % 10));
        const y = 720 * 0.682 + (40 * Math.floor(index / 10));
        
        const icon = this.add.image(x, y, iconKey).setOrigin(0, 0);
        this.activeKills.push(icon);
    }

    replay() {
        this.scene.start('GameScene');
    }
}
