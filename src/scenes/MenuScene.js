export default class MenuScene extends Phaser.Scene {
    constructor() {
        super('MenuScene');
    }

    preload() {
        this.load.image('atlas01', 'assets/atlas01.png');
        this.load.image('atlas02', 'assets/atlas02.png');
    }

    create() {
        this.createSpritesFromAtlases();
        
        const bg = this.add.image(0, 0, 'background');
        bg.setOrigin(0, 0);
        bg.setScale(2);
        
        const ground = this.add.image(0, 720 - 77, 'ground_spring');
        ground.setOrigin(0, 0);
        ground.setScale(2);
        
        const titleLogo = this.add.image(640, 250, 'title_logo');
        titleLogo.setScale(1.2);
        
        const playButton = this.add.text(640, 500, 'PRESS SPACE TO START', {
            fontSize: '42px',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 8,
            fontStyle: 'bold'
        });
        playButton.setOrigin(0.5);
        
        this.tweens.add({
            targets: playButton,
            alpha: 0.3,
            duration: 800,
            yoyo: true,
            repeat: -1
        });
        
        const highScore = parseInt(localStorage.getItem('koalaHighScore') || '0');
        this.add.text(640, 580, `HIGH SCORE: ${highScore}`, {
            fontSize: '28px',
            fill: '#ffd700',
            stroke: '#000000',
            strokeThickness: 6
        }).setOrigin(0.5);
        
        this.add.text(640, 650, 'SPACE - Jump | ↓ - Dash', {
            fontSize: '24px',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);
        
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    }

    createSpritesFromAtlases() {
        const atlas01 = this.textures.get('atlas01').getSourceImage();
        const atlas02 = this.textures.get('atlas02').getSourceImage();
        
        const titleCanvas = document.createElement('canvas');
        titleCanvas.width = 512;
        titleCanvas.height = 348;
        const titleCtx = titleCanvas.getContext('2d');
        titleCtx.drawImage(atlas01, 2, 678, 512, 348, 0, 0, 512, 348);
        this.textures.addCanvas('title_logo', titleCanvas);
        
        const bgCanvas = document.createElement('canvas');
        bgCanvas.width = 640;
        bgCanvas.height = 360;
        const bgCtx = bgCanvas.getContext('2d');
        bgCtx.drawImage(atlas02, 2, 2, 640, 360, 0, 0, 640, 360);
        this.textures.addCanvas('background', bgCanvas);
        
        const groundCanvas = document.createElement('canvas');
        groundCanvas.width = 640;
        groundCanvas.height = 77;
        const groundCtx = groundCanvas.getContext('2d');
        groundCtx.drawImage(atlas02, 1146, 2, 640, 77, 0, 0, 640, 77);
        this.textures.addCanvas('ground_spring', groundCanvas);
    }

    update() {
        if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
            this.scene.start('GameScene');
        }
    }
}
