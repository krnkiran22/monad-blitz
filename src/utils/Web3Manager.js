import { ethers } from 'ethers';

// Contract configuration
const CONTRACT_ADDRESS = '0x8469f356D3C1225e45D08bb7d58a51fD6d9EC12D';
const BET_AMOUNT = '0.1'; // 0.1 MONAD

// Contract ABI
const CONTRACT_ABI = [
    "function createGame(uint256 _betAmount) external payable returns (uint256)",
    "function joinGame(uint256 _gameId) external payable",
    "function declareWinner(uint256 _gameId, address _winner) external",
    "function getGame(uint256 _gameId) external view returns (address player1, address player2, uint256 betAmount, uint256 totalPot, address winner, bool isActive, bool isFinalized)",
    "function getWaitingGames() external view returns (uint256[] memory)",
    "function getActiveGames() external view returns (uint256[] memory)",
    "function cancelGame(uint256 _gameId) external",
    "event GameCreated(uint256 indexed gameId, address indexed player1, uint256 betAmount)",
    "event PlayerJoined(uint256 indexed gameId, address indexed player2, uint256 betAmount)",
    "event WinnerDeclared(uint256 indexed gameId, address indexed winner, uint256 prize)"
];

class Web3Manager {
    constructor() {
        this.provider = null;
        this.signer = null;
        this.contract = null;
        this.userAddress = null;
        this.currentGameId = null;
    }

    /**
     * Connect to MetaMask wallet
     */
    async connectWallet() {
        try {
            if (!window.ethereum) {
                throw new Error('MetaMask is not installed. Please install MetaMask to play with crypto.');
            }

            // Request account access
            await window.ethereum.request({ method: 'eth_requestAccounts' });

            // Create provider and signer
            this.provider = new ethers.BrowserProvider(window.ethereum);
            this.signer = await this.provider.getSigner();
            this.userAddress = await this.signer.getAddress();

            // Initialize contract
            this.contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, this.signer);

            // Check network (Monad Testnet)
            const network = await this.provider.getNetwork();
            console.log('Connected to network:', network.chainId);

            return {
                success: true,
                address: this.userAddress,
                shortAddress: `${this.userAddress.slice(0, 6)}...${this.userAddress.slice(-4)}`
            };
        } catch (error) {
            console.error('Wallet connection error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Check if wallet is connected
     */
    isConnected() {
        return this.userAddress !== null;
    }

    /**
     * Get user's wallet balance in MONAD
     */
    async getBalance() {
        try {
            if (!this.provider || !this.userAddress) {
                throw new Error('Wallet not connected');
            }

            const balance = await this.provider.getBalance(this.userAddress);
            return ethers.formatEther(balance);
        } catch (error) {
            console.error('Error getting balance:', error);
            return '0';
        }
    }

    /**
     * Check if user has enough balance (0.1 MONAD + gas)
     */
    async hasEnoughBalance() {
        try {
            const balance = await this.getBalance();
            const balanceNum = parseFloat(balance);
            console.log('Current balance:', balanceNum, 'MONAD');
            // Need 0.1 MONAD + small buffer for gas (0.005-0.01 typical)
            // Lowered threshold to 0.105 MONAD to be less strict
            const hasEnough = balanceNum >= 0.105;
            console.log('Has enough balance?', hasEnough, '(need >= 0.105 MONAD)');
            return hasEnough;
        } catch (error) {
            console.error('Error checking balance:', error);
            return false;
        }
    }

    /**
     * Estimate gas for creating game
     */
    async estimateCreateGameGas() {
        try {
            if (!this.contract) return '0.01';
            
            const betAmountWei = ethers.parseEther(BET_AMOUNT);
            const gasEstimate = await this.contract.createGame.estimateGas(betAmountWei, {
                value: betAmountWei
            });
            
            const feeData = await this.provider.getFeeData();
            const gasCost = gasEstimate * (feeData.gasPrice || feeData.maxFeePerGas);
            
            return ethers.formatEther(gasCost);
        } catch (error) {
            console.error('Error estimating gas:', error);
            return '0.01'; // Default estimate
        }
    }

    /**
     * Create a new game with 0.1 MONAD bet
     */
    async createGame() {
        try {
            if (!this.contract) {
                throw new Error('Contract not initialized. Please connect wallet first.');
            }

            // Check balance with detailed logging
            const balance = await this.getBalance();
            const balanceNum = parseFloat(balance);
            console.log('Creating game - Current balance:', balanceNum, 'MONAD');
            
            if (balanceNum < 0.105) {
                throw new Error(`Insufficient MONAD balance. You have ${balanceNum.toFixed(4)} MONAD but need at least 0.105 MONAD (0.1 for bet + gas)`);
            }

            const betAmountWei = ethers.parseEther(BET_AMOUNT);

            console.log('Creating game with bet amount:', BET_AMOUNT, 'MONAD (native token)');

            // Call createGame function
            const tx = await this.contract.createGame(betAmountWei, {
                value: betAmountWei,
                gasLimit: 300000
            });

            console.log('Transaction sent:', tx.hash);

            // Wait for transaction confirmation
            const receipt = await tx.wait();
            console.log('Transaction confirmed:', receipt);

            // Extract gameId from events
            const gameCreatedEvent = receipt.logs.find(log => {
                try {
                    const parsed = this.contract.interface.parseLog(log);
                    return parsed && parsed.name === 'GameCreated';
                } catch {
                    return false;
                }
            });

            if (gameCreatedEvent) {
                const parsed = this.contract.interface.parseLog(gameCreatedEvent);
                this.currentGameId = Number(parsed.args.gameId);
                console.log('Game created with ID:', this.currentGameId);

                return {
                    success: true,
                    gameId: this.currentGameId,
                    txHash: tx.hash
                };
            }

            throw new Error('Could not extract gameId from transaction');
        } catch (error) {
            console.error('Error creating game:', error);
            return {
                success: false,
                error: error.message || 'Failed to create game'
            };
        }
    }

    /**
     * Join an existing game
     */
    async joinGame(gameId) {
        try {
            if (!this.contract) {
                throw new Error('Contract not initialized. Please connect wallet first.');
            }

            // Check balance with detailed logging
            const balance = await this.getBalance();
            const balanceNum = parseFloat(balance);
            console.log('Joining game - Current balance:', balanceNum, 'MONAD');
            
            if (balanceNum < 0.105) {
                throw new Error(`Insufficient MONAD balance. You have ${balanceNum.toFixed(4)} MONAD but need at least 0.105 MONAD (0.1 for bet + gas)`);
            }

            // Get game details first
            const gameDetails = await this.contract.getGame(gameId);
            const betAmountWei = gameDetails.betAmount;

            console.log('Joining game', gameId, 'with bet amount:', ethers.formatEther(betAmountWei), 'MONAD (native token)');

            // Call joinGame function
            const tx = await this.contract.joinGame(gameId, {
                value: betAmountWei,
                gasLimit: 300000
            });

            console.log('Transaction sent:', tx.hash);

            // Wait for confirmation
            const receipt = await tx.wait();
            console.log('Transaction confirmed:', receipt);

            this.currentGameId = gameId;

            return {
                success: true,
                gameId: gameId,
                txHash: tx.hash
            };
        } catch (error) {
            console.error('Error joining game:', error);
            return {
                success: false,
                error: error.message || 'Failed to join game'
            };
        }
    }

    /**
     * Declare winner and transfer prize
     */
    async declareWinner(gameId, winnerAddress) {
        try {
            if (!this.contract) {
                throw new Error('Contract not initialized');
            }

            console.log('Declaring winner for game', gameId, ':', winnerAddress);

            // Call declareWinner function (only contract owner can call this)
            const tx = await this.contract.declareWinner(gameId, winnerAddress, {
                gasLimit: 300000
            });

            console.log('Transaction sent:', tx.hash);

            // Wait for confirmation
            const receipt = await tx.wait();
            console.log('Transaction confirmed:', receipt);

            return {
                success: true,
                txHash: tx.hash
            };
        } catch (error) {
            console.error('Error declaring winner:', error);
            return {
                success: false,
                error: error.message || 'Failed to declare winner'
            };
        }
    }

    /**
     * Get game details
     */
    async getGameDetails(gameId) {
        try {
            if (!this.contract) {
                throw new Error('Contract not initialized');
            }

            const game = await this.contract.getGame(gameId);

            return {
                player1: game[0],
                player2: game[1],
                betAmount: ethers.formatEther(game[2]),
                totalPot: ethers.formatEther(game[3]),
                winner: game[4],
                isActive: game[5],
                isFinalized: game[6]
            };
        } catch (error) {
            console.error('Error getting game details:', error);
            return null;
        }
    }

    /**
     * Get all games waiting for player 2
     */
    async getWaitingGames() {
        try {
            if (!this.contract) {
                throw new Error('Contract not initialized');
            }

            const gameIds = await this.contract.getWaitingGames();
            return gameIds.map(id => Number(id));
        } catch (error) {
            console.error('Error getting waiting games:', error);
            return [];
        }
    }

    /**
     * Cancel game and get refund (only if player 2 hasn't joined)
     */
    async cancelGame(gameId) {
        try {
            if (!this.contract) {
                throw new Error('Contract not initialized');
            }

            console.log('Cancelling game', gameId);

            const tx = await this.contract.cancelGame(gameId, {
                gasLimit: 200000
            });

            console.log('Transaction sent:', tx.hash);

            const receipt = await tx.wait();
            console.log('Transaction confirmed:', receipt);

            return {
                success: true,
                txHash: tx.hash
            };
        } catch (error) {
            console.error('Error cancelling game:', error);
            return {
                success: false,
                error: error.message || 'Failed to cancel game'
            };
        }
    }

    /**
     * Listen for contract events
     */
    listenToEvents(onGameCreated, onPlayerJoined, onWinnerDeclared) {
        if (!this.contract) return;

        // Listen for GameCreated events
        this.contract.on('GameCreated', (gameId, player1, betAmount, event) => {
            console.log('GameCreated event:', { gameId: Number(gameId), player1, betAmount });
            if (onGameCreated) onGameCreated(Number(gameId), player1, betAmount);
        });

        // Listen for PlayerJoined events
        this.contract.on('PlayerJoined', (gameId, player2, betAmount, event) => {
            console.log('PlayerJoined event:', { gameId: Number(gameId), player2, betAmount });
            if (onPlayerJoined) onPlayerJoined(Number(gameId), player2, betAmount);
        });

        // Listen for WinnerDeclared events
        this.contract.on('WinnerDeclared', (gameId, winner, prize, event) => {
            console.log('WinnerDeclared event:', { gameId: Number(gameId), winner, prize });
            if (onWinnerDeclared) onWinnerDeclared(Number(gameId), winner, prize);
        });
    }

    /**
     * Stop listening to events
     */
    stopListening() {
        if (this.contract) {
            this.contract.removeAllListeners();
        }
    }

    /**
     * Get current game ID
     */
    getCurrentGameId() {
        return this.currentGameId;
    }

    /**
     * Set current game ID
     */
    setCurrentGameId(gameId) {
        this.currentGameId = gameId;
    }

    /**
     * Get contract address
     */
    getContractAddress() {
        return CONTRACT_ADDRESS;
    }

    /**
     * Get bet amount
     */
    getBetAmount() {
        return BET_AMOUNT;
    }
}

// Export singleton instance
export default new Web3Manager();
