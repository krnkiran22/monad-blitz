// Backend server for automated winner declaration
// This server listens to the multiplayer server and declares winners on blockchain

import { ethers } from 'ethers';
import io from 'socket.io-client';
import dotenv from 'dotenv';

dotenv.config();

// Configuration
const CONTRACT_ADDRESS = '0x8469f356D3C1225e45D08bb7d58a51fD6d9EC12D';
const MULTIPLAYER_SERVER_URL = 'http://localhost:3001';

// Contract ABI (only functions we need)
const CONTRACT_ABI = [
    "function declareWinner(uint256 _gameId, address _winner) external",
    "function getGame(uint256 _gameId) external view returns (address player1, address player2, uint256 betAmount, uint256 totalPot, address winner, bool isActive, bool isFinalized)"
];

class WinnerDeclarationBot {
    constructor() {
        this.provider = null;
        this.wallet = null;
        this.contract = null;
        this.socket = null;
        this.gameRegistry = new Map(); // Map web3GameId to players
    }

    async initialize() {
        console.log('🤖 Initializing Winner Declaration Bot...');

        // Setup provider (Monad Testnet RPC)
        const RPC_URL = process.env.MONAD_RPC_URL || 'YOUR_MONAD_RPC_URL';
        this.provider = new ethers.JsonRpcProvider(RPC_URL);

        // Setup wallet (contract owner's private key)
        const PRIVATE_KEY = process.env.OWNER_PRIVATE_KEY;
        if (!PRIVATE_KEY) {
            throw new Error('OWNER_PRIVATE_KEY not found in .env file');
        }

        this.wallet = new ethers.Wallet(PRIVATE_KEY, this.provider);
        console.log('✓ Wallet connected:', this.wallet.address);

        // Setup contract
        this.contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, this.wallet);
        console.log('✓ Contract connected:', CONTRACT_ADDRESS);

        // Connect to multiplayer server
        this.connectToMultiplayerServer();
    }

    connectToMultiplayerServer() {
        console.log('🔌 Connecting to multiplayer server...');

        this.socket = io(MULTIPLAYER_SERVER_URL);

        this.socket.on('connect', () => {
            console.log('✓ Connected to multiplayer server');
        });

        this.socket.on('disconnect', () => {
            console.log('❌ Disconnected from multiplayer server');
        });

        // Listen for game results
        this.socket.on('gameResult', async (data) => {
            console.log('\n📊 Game Result Received:', data);
            await this.handleGameResult(data);
        });

        this.socket.on('error', (error) => {
            console.error('Socket error:', error);
        });
    }

    async handleGameResult(data) {
        const { roomId, winner, hostData, guestData } = data;

        // Extract web3GameId from room metadata (you'll need to pass this through)
        const web3GameId = this.gameRegistry.get(roomId);

        if (web3GameId === undefined) {
            console.log('⚠️  No Web3 game ID found for room:', roomId);
            return;
        }

        // Determine winner address
        let winnerAddress;
        if (winner === 'host') {
            winnerAddress = hostData.walletAddress; // You'll need to pass wallet addresses through
        } else if (winner === 'guest') {
            winnerAddress = guestData.walletAddress;
        } else {
            console.log('⚠️  Tie game - no winner to declare');
            return;
        }

        if (!winnerAddress) {
            console.log('⚠️  Winner address not found');
            return;
        }

        // Verify game exists and is active
        try {
            const gameDetails = await this.contract.getGame(web3GameId);
            
            if (gameDetails.isFinalized) {
                console.log('⚠️  Game already finalized');
                return;
            }

            if (!gameDetails.isActive) {
                console.log('⚠️  Game is not active');
                return;
            }

            // Declare winner on blockchain
            console.log(`\n🏆 Declaring winner for Game ${web3GameId}...`);
            console.log(`   Winner: ${winnerAddress}`);
            console.log(`   Prize: ${ethers.formatEther(gameDetails.totalPot)} MONAD`);

            const tx = await this.contract.declareWinner(web3GameId, winnerAddress, {
                gasLimit: 300000
            });

            console.log('📤 Transaction sent:', tx.hash);

            const receipt = await tx.wait();
            console.log('✅ Winner declared! Block:', receipt.blockNumber);
            console.log(`💰 ${ethers.formatEther(gameDetails.totalPot)} MONAD sent to ${winnerAddress}`);

        } catch (error) {
            console.error('❌ Error declaring winner:', error.message);
        }
    }

    // Method to register a game (call this when game is created)
    registerGame(roomId, web3GameId, player1Address, player2Address) {
        this.gameRegistry.set(roomId, {
            web3GameId,
            player1Address,
            player2Address
        });
        console.log(`📝 Registered game: Room ${roomId} → Web3 Game ${web3GameId}`);
    }

    async start() {
        try {
            await this.initialize();
            console.log('\n✅ Winner Declaration Bot is running!');
            console.log('   Listening for game results...\n');
        } catch (error) {
            console.error('❌ Failed to start bot:', error);
            process.exit(1);
        }
    }
}

// Start the bot
const bot = new WinnerDeclarationBot();
bot.start();

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('\n\n👋 Shutting down Winner Declaration Bot...');
    if (bot.socket) {
        bot.socket.disconnect();
    }
    process.exit(0);
});
