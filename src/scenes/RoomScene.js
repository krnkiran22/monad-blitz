import MultiplayerService from '../services/MultiplayerService.js';
import Web3Manager from '../utils/Web3Manager.js';

export default class RoomScene extends Phaser.Scene {
    constructor() {
        super('RoomScene');
        this.walletConnected = false;
        this.web3GameId = null;
    }

    create() {
        const W = 1280;
        const H = 720;
        
        // Background
        this.cameras.main.setBackgroundColor('#87CEEB');
        
        // Title
        this.add.text(W / 2, 60, 'MULTIPLAYER MODE', {
            fontSize: '48px',
            fill: '#fff',
            stroke: '#000',
            strokeThickness: 8,
            fontStyle: 'bold',
            fontFamily: 'Arial'
        }).setOrigin(0.5);

        // Wallet status
        this.walletStatusText = this.add.text(W / 2, 130, 'Wallet: Not Connected', {
            fontSize: '24px',
            fill: '#ffaaaa',
            stroke: '#000',
            strokeThickness: 4,
            fontFamily: 'Arial'
        }).setOrigin(0.5);

        // Connect Wallet Button
        this.connectWalletButton = this.createStyledButton(W / 2, 180, 'CONNECT WALLET', () => {
            this.connectWallet();
        }, 0x2196F3, 0x1976D2);
        
        // Status text
        this.statusText = this.add.text(W / 2, 250, 'Connecting to server...', {
            fontSize: '28px',
            fill: '#fff',
            stroke: '#000',
            strokeThickness: 5,
            fontFamily: 'Arial'
        }).setOrigin(0.5);
        
        // Bet info
        this.betInfoText = this.add.text(W / 2, 320, 'Bet: 0.1 MONAD per player | Winner takes 0.2 MONAD!', {
            fontSize: '24px',
            fill: '#FFD700',
            stroke: '#000',
            strokeThickness: 4,
            fontStyle: 'bold',
            fontFamily: 'Arial'
        }).setOrigin(0.5);

        // Room ID display (hidden initially)
        this.roomIdText = this.add.text(W / 2, 370, '', {
            fontSize: '36px',
            fill: '#FFD700',
            stroke: '#000',
            strokeThickness: 6,
            fontStyle: 'bold',
            fontFamily: 'Arial'
        }).setOrigin(0.5).setVisible(false);
        
        // Game ID display (hidden initially)
        this.gameIdText = this.add.text(W / 2, 420, '', {
            fontSize: '24px',
            fill: '#fff',
            stroke: '#000',
            strokeThickness: 4,
            fontFamily: 'Arial'
        }).setOrigin(0.5).setVisible(false);
        
        // Waiting text (hidden initially)
        this.waitingText = this.add.text(W / 2, 470, '', {
            fontSize: '26px',
            fill: '#fff',
            stroke: '#000',
            strokeThickness: 5,
            fontFamily: 'Arial'
        }).setOrigin(0.5).setVisible(false);
        
        // Create Game Button (0.1 MONAD)
        this.createButton = this.createStyledButton(W / 2 - 220, 540, 'CREATE GAME\n(0.1 MONAD)', () => {
            this.createGame();
        }, 0x4CAF50, 0x2E7D32);
        this.createButton.setVisible(false); // Hidden until wallet connected
        
        // Join Game Button
        this.joinButton = this.createStyledButton(W / 2 + 220, 540, 'JOIN GAME', () => {
            this.showJoinInput();
        }, 0xFF9800, 0xF57C00);
        this.joinButton.setVisible(false); // Hidden until wallet connected
        
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

    createStyledButton(x, y, text, callback, color = 0x4CAF50, darkColor = 0x2E7D32) {
        const button = this.add.container(x, y);
        
        const isMultiline = text.includes('\n');
        const width = 300;
        const height = isMultiline ? 90 : 70;
        
        const bg = this.add.rectangle(0, 0, width, height, color)
            .setStrokeStyle(4, darkColor);
        
        const label = this.add.text(0, 0, text, {
            fontSize: isMultiline ? '24px' : '26px',
            fill: '#fff',
            fontStyle: 'bold',
            fontFamily: 'Arial',
            align: 'center'
        }).setOrigin(0.5);
        
        button.add([bg, label]);
        button.setSize(width, height);
        button.setInteractive();
        
        const hoverColor = color + 0x222222;
        const pressColor = color - 0x111111;
        
        button.on('pointerover', () => {
            bg.setFillStyle(hoverColor);
            this.game.canvas.style.cursor = 'pointer';
        });
        
        button.on('pointerout', () => {
            bg.setFillStyle(color);
            this.game.canvas.style.cursor = 'default';
        });
        
        button.on('pointerdown', () => {
            bg.setFillStyle(pressColor);
        });
        
        button.on('pointerup', () => {
            bg.setFillStyle(hoverColor);
            callback();
        });
        
        return button;
    }

    async connectWallet() {
        this.statusText.setText('Connecting to MetaMask...');
        
        const result = await Web3Manager.connectWallet();
        
        if (result.success) {
            this.walletConnected = true;
            this.walletStatusText.setText(`Wallet: ${result.shortAddress}`);
            this.walletStatusText.setColor('#aaffaa');
            this.connectWalletButton.setVisible(false);
            
            // Show game buttons
            this.createButton.setVisible(true);
            this.joinButton.setVisible(true);
            
            this.statusText.setText('Wallet connected! Choose an option:');
        } else {
            this.statusText.setText(`Failed: ${result.error}`);
            this.statusText.setColor('#ff0000');
        }
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

    async createGame() {
        if (!this.walletConnected) {
            this.statusText.setText('Please connect wallet first!');
            this.statusText.setColor('#ff0000');
            return;
        }

        this.createButton.setVisible(false);
        this.joinButton.setVisible(false);
        this.statusText.setText('Creating blockchain game... (Confirm in MetaMask)');
        
        try {
            // Create Web3 game (deposits 0.1 MONAD)
            const web3Result = await Web3Manager.createGame();
            
            if (!web3Result.success) {
                throw new Error(web3Result.error);
            }

            this.web3GameId = web3Result.gameId;
            this.gameIdText.setText(`Blockchain Game ID: ${this.web3GameId}`);
            this.gameIdText.setVisible(true);

            this.statusText.setText('Game created! Creating room...');
            
            // Create multiplayer room
            const roomData = await MultiplayerService.createRoom();
            
            this.roomIdText.setText(`Room ID: ${roomData.roomId}`);
            this.roomIdText.setVisible(true);
            
            this.waitingText.setText('Waiting for opponent to join and deposit 0.1 MONAD...');
            this.waitingText.setVisible(true);
            
            this.statusText.setText('✓ 0.1 MONAD deposited! Share Room ID!');
            this.statusText.setColor('#00ff00');
            
            // Store game ID for later
            Web3Manager.setCurrentGameId(this.web3GameId);
            
        } catch (error) {
            console.error('Failed to create game:', error);
            this.statusText.setText(`Failed: ${error.message || 'Try again'}`);
            this.statusText.setColor('#ff0000');
            this.createButton.setVisible(true);
            this.joinButton.setVisible(true);
        }
    }

    showJoinInput() {
        if (!this.walletConnected) {
            this.statusText.setText('Please connect wallet first!');
            this.statusText.setColor('#ff0000');
            return;
        }

        this.createButton.setVisible(false);
        this.joinButton.setVisible(false);
        
        this.roomInputBg.setVisible(true);
        this.roomInputText.setVisible(true);
        this.statusText.setText('Enter Room ID (6 chars) and Game ID (number), press ENTER');
        
        this.inputActive = true;
        this.roomInput = '';
    }

    updateInputDisplay() {
        if (this.roomInput.length > 0) {
            this.roomInputText.setText(this.roomInput);
            this.roomInputText.setColor('#fff');
        } else {
            this.roomInputText.setText('RoomID,GameID (e.g., ABC123,0)');
            this.roomInputText.setColor('#aaa');
        }
    }

    async joinRoomWithId(input) {
        this.inputActive = false;
        
        // Parse input: roomId,gameId
        const parts = input.split(',');
        if (parts.length !== 2) {
            this.statusText.setText('Format: RoomID,GameID (e.g., ABC123,0)');
            this.statusText.setColor('#ff0000');
            this.inputActive = true;
            return;
        }

        const roomId = parts[0].trim();
        const gameId = parseInt(parts[1].trim());

        if (isNaN(gameId)) {
            this.statusText.setText('Invalid Game ID! Must be a number');
            this.statusText.setColor('#ff0000');
            this.inputActive = true;
            return;
        }

        this.statusText.setText('Joining blockchain game... (Confirm in MetaMask)');
        this.statusText.setColor('#ffffff');
        
        try {
            // Join Web3 game (deposits 0.1 MONAD)
            const web3Result = await Web3Manager.joinGame(gameId);
            
            if (!web3Result.success) {
                throw new Error(web3Result.error);
            }

            this.web3GameId = gameId;
            Web3Manager.setCurrentGameId(gameId);

            this.statusText.setText('Joined blockchain game! Joining room...');
            
            // Join multiplayer room
            await MultiplayerService.joinRoom(roomId);
            
            this.roomInputBg.setVisible(false);
            this.roomInputText.setVisible(false);
            
            this.waitingText.setText('✓ 0.1 MONAD deposited! Starting game...');
            this.waitingText.setVisible(true);
            this.statusText.setText('Both players ready! Pot: 0.2 MONAD');
            this.statusText.setColor('#00ff00');
            
            // Start game after brief delay
            this.time.delayedCall(2000, () => {
                this.startMultiplayerGame();
            });
            
        } catch (error) {
            console.error('Failed to join game:', error);
            this.statusText.setText(`Failed: ${error.message || 'Try again'}`);
            this.statusText.setColor('#ff0000');
            this.roomInputBg.setVisible(false);
            this.roomInputText.setVisible(false);
            this.createButton.setVisible(true);
            this.joinButton.setVisible(true);
        }
    }

    startMultiplayerGame() {
        // Start game scene in multiplayer mode with Web3 game ID
        this.scene.start('GameScene', { 
            multiplayer: true,
            isHost: MultiplayerService.isHost,
            web3GameId: this.web3GameId,
            betAmount: '0.1'
        });
    }
}
