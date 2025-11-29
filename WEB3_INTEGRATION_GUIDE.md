# Web3 Betting Integration Guide

## Overview

Your Koala Seasons multiplayer game now has blockchain betting integrated! Players can bet 0.1 MONAD and the winner takes the full 0.2 MONAD pot.

## Contract Information

- **Contract Address**: `0x8469f356D3C1225e45D08bb7d58a51fD6d9EC12D`
- **Transaction Hash**: `0xadc0f45053bf84c78c5c3c421d578fc3bd159357a0592a92ac6d864fb4733272`
- **Network**: Monad Testnet
- **Bet Amount**: 0.1 MONAD per player
- **Total Pot**: 0.2 MONAD

## How It Works

### Player 1 (Host) Flow:

1. Click **MULTIPLAYER** from main menu
2. Click **CONNECT WALLET** (MetaMask will prompt)
3. Wallet address appears at top
4. Click **CREATE GAME (0.1 MONAD)**
5. Confirm transaction in MetaMask (deposits 0.1 MONAD)
6. Room created with:
   - Room ID (6 characters for multiplayer server)
   - Blockchain Game ID (number for smart contract)
7. Share both IDs with Player 2
8. Wait for Player 2 to join

### Player 2 (Guest) Flow:

1. Click **MULTIPLAYER** from main menu
2. Click **CONNECT WALLET**
3. Click **JOIN GAME**
4. Enter: `ROOMID,GAMEID` (e.g., `ABC123,0`)
5. Confirm transaction in MetaMask (deposits 0.1 MONAD)
6. Game starts automatically

### During Game:

- Prize pot (0.2 MONAD) displayed at top center
- Real-time score sync between players
- Opponent info panel on right side
- Normal Koala Seasons gameplay

### After Game:

- Winner determined by leaf count (higher wins)
- Results screen shows:
  - Winner banner (green for win, red for loss, gold for tie)
  - Your leaves vs Opponent leaves
  - Leaf difference
  - **Prize notification**: "💰 You Won 0.2 MONAD!" or "😢 Opponent Won 0.2 MONAD"
- Winner automatically receives 0.2 MONAD (contract owner must call `declareWinner`)

## Smart Contract Functions

### For Players:

```solidity
// Create new game (Player 1)
function createGame(uint256 _betAmount) external payable returns (uint256)

// Join existing game (Player 2)
function joinGame(uint256 _gameId) external payable

// Get game details
function getGame(uint256 _gameId) external view returns (...)
```

### For Contract Owner:

```solidity
// Declare winner after game ends
function declareWinner(uint256 _gameId, address _winner) external

// Emergency functions
function cancelGame(uint256 _gameId) external
function emergencyWithdraw() external
```

## Architecture

### Web3Manager.js

Located: `src/utils/Web3Manager.js`

Key methods:

- `connectWallet()` - Connect to MetaMask
- `createGame()` - Create blockchain game + deposit 0.1 MONAD
- `joinGame(gameId)` - Join game + deposit 0.1 MONAD
- `declareWinner(gameId, winnerAddress)` - Award prize to winner
- `getGameDetails(gameId)` - Get game info
- `getBalance()` - Check wallet balance

### Modified Scenes:

#### RoomScene.js

- Added wallet connection UI
- Added "Connect Wallet" button
- Modified "Create Game" to create blockchain game
- Modified "Join Game" to accept Room ID + Game ID
- Shows bet amount and pot info
- Validates wallet connection before game actions

#### GameScene.js

- Accepts `web3GameId` and `betAmount` in init data
- Displays prize pot at top center (gold box)
- Shows "💰 PRIZE POT: 0.2 MONAD"
- Tracks Web3 game ID throughout gameplay
- Passes Web3 data to GameOverScene

#### GameOverScene.js

- Displays Web3 prize information
- Shows "💰 You Won 0.2 MONAD!" for winners
- Shows "😢 Opponent Won 0.2 MONAD" for losers
- Blue prize box at bottom of results panel

## Setup & Testing

### 1. Install Dependencies

```bash
npm install ethers
```

### 2. Start Server

```bash
npm run server
```

### 3. Start Client

```bash
npm run dev
```

### 4. MetaMask Setup

- Install MetaMask browser extension
- Connect to Monad Testnet
- Get test MONAD from faucet
- Ensure you have at least 0.15 MONAD (0.1 for bet + gas)

### 5. Test Flow

1. Open game in two browser windows/tabs
2. Window 1: Connect wallet → Create Game
3. Copy Room ID and Game ID
4. Window 2: Connect wallet → Join Game → Enter "ROOMID,GAMEID"
5. Play game
6. Check winner gets prize notification

## Important Notes

### Winner Declaration

**Current Implementation**: The game UI shows who won, but the smart contract's `declareWinner()` function can only be called by the contract owner.

**Options**:

1. **Manual**: Contract owner manually calls `declareWinner(gameId, winnerAddress)` after checking results
2. **Backend Server**: Set up a backend that listens for game results and auto-calls `declareWinner()`
3. **Chainlink**: Use Chainlink Automation for decentralized winner declaration
4. **Multi-sig**: Use a multi-sig wallet where both players approve the winner

### Security Considerations

- Never share private keys
- Contract has been deployed but should be audited
- Test thoroughly with small amounts first
- Use timeouts for abandoned games
- Consider implementing dispute resolution

### Gas Costs

- Create Game: ~300,000 gas
- Join Game: ~300,000 gas
- Declare Winner: ~300,000 gas
- Total per game: ~0.0009 MONAD gas (varies by network)

### Error Handling

The game handles common errors:

- MetaMask not installed
- Wrong network
- Insufficient balance
- Transaction rejected
- Game ID not found
- Room full

## Troubleshooting

### "MetaMask not installed"

→ Install MetaMask browser extension

### "Failed to create game"

→ Check you have enough MONAD (0.1 + gas)
→ Check MetaMask is connected to Monad Testnet

### "Room not found"

→ Check Room ID is correct (case sensitive)
→ Check Game ID is a valid number

### "Transaction failed"

→ Check gas settings in MetaMask
→ Ensure contract address is correct
→ Verify you're on Monad Testnet

## Future Enhancements

1. **Automated Winner Declaration**

   - Backend server watching game results
   - Automatic `declareWinner()` calls

2. **Tournament Mode**

   - Multiple games with elimination rounds
   - Progressive prize pools

3. **Leaderboard**

   - Track all-time winners
   - Display total winnings

4. **Variable Bet Amounts**

   - Let players choose bet: 0.1, 0.5, 1.0 MONAD
   - Higher stakes, higher rewards

5. **NFT Rewards**

   - Mint NFTs for tournament winners
   - Collectible achievement badges

6. **Staking Mechanism**
   - Stake MONAD for boosted rewards
   - VIP multiplayer rooms

## Contract Verification

To verify on Monad block explorer:

1. Go to Monad explorer
2. Search for contract: `0x8469f356D3C1225e45D08bb7d58a51fD6d9EC12D`
3. Click "Verify & Publish"
4. Upload source code from your contract file
5. Set compiler version: v0.8.20
6. Enable optimization: Yes (200 runs)

## Support

For issues or questions:

- Check console logs (F12 in browser)
- Verify MetaMask connection
- Ensure server is running
- Check transaction history in MetaMask
- Test with small amounts first

## Contract Source Code

See the smart contract code in your original message. Key features:

- Escrow system with 2-player support
- Winner takes all prize distribution
- Game cancellation for player 1 if player 2 never joins
- Emergency withdraw for contract owner
- Events for tracking game lifecycle

Enjoy your blockchain-powered Koala Seasons multiplayer betting game! 🎮💰
