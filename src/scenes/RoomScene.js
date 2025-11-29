import MultiplayerService from '../services/MultiplayerService.js';

export default class RoomScene extends Phaser.Scene {
    constructor() {
        super('RoomScene');
    }

    create() {
        const W = 1280;
        const H = 720;
        
        // Background
        this.cameras.main.setBackgroundColor('#87CEEB');
        
        // Title
        this.add.text(W / 2, 80, 'MULTIPLAYER MODE', {
            fontSize: '56px',
            fill: '#fff',
            stroke: '#000',
            strokeThickness: 8,
            fontStyle: 'bold',
            fontFamily: 'Arial'
        }).setOrigin(0.5);
        
        // Status text
        this.statusText = this.add.text(W / 2, 200, 'Connecting to server...', {
            fontSize: '32px',
            fill: '#fff',
            stroke: '#000',
            strokeThickness: 6,
            fontFamily: 'Arial'
        }).setOrigin(0.5);
        
        // Room ID display (hidden initially)
        this.roomIdText = this.add.text(W / 2, 280, '', {
            fontSize: '40px',
            fill: '#FFD700',
            stroke: '#000',
            strokeThickness: 6,
            fontStyle: 'bold',
            fontFamily: 'Arial'
        }).setOrigin(0.5).setVisible(false);
        
        // Waiting text (hidden initially)
        this.waitingText = this.add.text(W / 2, 360, '', {
            fontSize: '28px',
            fill: '#fff',
            stroke: '#000',
            strokeThickness: 5,
            fontFamily: 'Arial'
        }).setOrigin(0.5).setVisible(false);
        
        // Create Room Button
        this.createButton = this.createStyledButton(W / 2 - 200, 450, 'CREATE ROOM', () => {
            this.createRoom();
        });
        
        // Join Room Button
        this.joinButton = this.createStyledButton(W / 2 + 200, 450, 'JOIN ROOM', () => {
            this.showJoinInput();
        });
        
        // Input field (hidden initially)
        this.roomInputBg = this.add.rectangle(W / 2, 360, 400, 60, 0x333333)
            .setVisible(false);
        
        this.roomInputText = this.add.text(W / 2, 360, 'Enter Room ID...', {
            fontSize: '28px',
            fill: '#aaa',
            fontFamily: 'Arial'
        }).setOrigin(0.5).setVisible(false);
        
        // Back button
        this.backButton = this.createStyledButton(100, H - 80, 'BACK', () => {
            MultiplayerService.disconnect();
            this.scene.start('MenuScene');
        });
        
        // Connect to server
        this.connectToServer();
        
        // Setup input handling
        this.inputActive = false;
        this.roomInput = '';
        
        this.input.keyboard.on('keydown', (event) => {
            if (!this.inputActive) return;
            
            if (event.key === 'Enter' && this.roomInput.length > 0) {
                this.joinRoomWithId(this.roomInput);
            } else if (event.key === 'Backspace') {
                this.roomInput = this.roomInput.slice(0, -1);
                this.updateInputDisplay();
            } else if (event.key.length === 1 && this.roomInput.length < 6) {
                this.roomInput += event.key.toUpperCase();
                this.updateInputDisplay();
            }
        });
    }

    createStyledButton(x, y, text, callback) {
        const button = this.add.container(x, y);
        
        const bg = this.add.rectangle(0, 0, 280, 70, 0x4CAF50)
            .setStrokeStyle(4, 0x2E7D32);
        
        const label = this.add.text(0, 0, text, {
            fontSize: '28px',
            fill: '#fff',
            fontStyle: 'bold',
            fontFamily: 'Arial'
        }).setOrigin(0.5);
        
        button.add([bg, label]);
        button.setSize(280, 70);
        button.setInteractive();
        
        button.on('pointerover', () => {
            bg.setFillStyle(0x66BB6A);
            this.game.canvas.style.cursor = 'pointer';
        });
        
        button.on('pointerout', () => {
            bg.setFillStyle(0x4CAF50);
            this.game.canvas.style.cursor = 'default';
        });
        
        button.on('pointerdown', () => {
            bg.setFillStyle(0x388E3C);
        });
        
        button.on('pointerup', () => {
            bg.setFillStyle(0x66BB6A);
            callback();
        });
        
        return button;
    }

    async connectToServer() {
        try {
            await MultiplayerService.connect();
            this.statusText.setText('Connected! Choose an option:');
            
            // Setup multiplayer listeners
            this.setupMultiplayerListeners();
            
        } catch (error) {
            console.error('Connection failed:', error);
            this.statusText.setText('Connection failed. Check if server is running.');
            this.statusText.setColor('#ff0000');
            
            // Retry button
            const retryBtn = this.createStyledButton(640, 500, 'RETRY', () => {
                retryBtn.destroy();
                this.connectToServer();
            });
        }
    }

    setupMultiplayerListeners() {
        // Listen for opponent joining
        MultiplayerService.onOpponentJoined((data) => {
            this.waitingText.setText(`Player 2 joined! Starting game...`);
            
            // Start game after brief delay
            this.time.delayedCall(2000, () => {
                this.startMultiplayerGame();
            });
        });
        
        // Listen for game start signal
        MultiplayerService.onGameStart((data) => {
            this.startMultiplayerGame();
        });
    }

    async createRoom() {
        this.createButton.setVisible(false);
        this.joinButton.setVisible(false);
        this.statusText.setText('Creating room...');
        
        try {
            const data = await MultiplayerService.createRoom();
            
            this.roomIdText.setText(`Room ID: ${data.roomId}`);
            this.roomIdText.setVisible(true);
            
            this.waitingText.setText('Waiting for opponent to join...');
            this.waitingText.setVisible(true);
            
            this.statusText.setText('Share this Room ID with your friend!');
            
        } catch (error) {
            console.error('Failed to create room:', error);
            this.statusText.setText('Failed to create room. Try again.');
            this.createButton.setVisible(true);
            this.joinButton.setVisible(true);
        }
    }

    showJoinInput() {
        this.createButton.setVisible(false);
        this.joinButton.setVisible(false);
        
        this.roomInputBg.setVisible(true);
        this.roomInputText.setVisible(true);
        this.statusText.setText('Enter 6-digit Room ID and press ENTER');
        
        this.inputActive = true;
        this.roomInput = '';
    }

    updateInputDisplay() {
        if (this.roomInput.length > 0) {
            this.roomInputText.setText(this.roomInput);
            this.roomInputText.setColor('#fff');
        } else {
            this.roomInputText.setText('Enter Room ID...');
            this.roomInputText.setColor('#aaa');
        }
    }

    async joinRoomWithId(roomId) {
        this.inputActive = false;
        this.statusText.setText('Joining room...');
        
        try {
            await MultiplayerService.joinRoom(roomId);
            
            this.roomInputBg.setVisible(false);
            this.roomInputText.setVisible(false);
            
            this.waitingText.setText('Joined! Starting game...');
            this.waitingText.setVisible(true);
            
            // Start game after brief delay
            this.time.delayedCall(2000, () => {
                this.startMultiplayerGame();
            });
            
        } catch (error) {
            console.error('Failed to join room:', error);
            this.statusText.setText('Room not found or full. Try again.');
            this.roomInputBg.setVisible(false);
            this.roomInputText.setVisible(false);
            this.createButton.setVisible(true);
            this.joinButton.setVisible(true);
        }
    }

    startMultiplayerGame() {
        // Start game scene in multiplayer mode
        this.scene.start('GameScene', { 
            multiplayer: true,
            isHost: MultiplayerService.isHost
        });
    }
}
