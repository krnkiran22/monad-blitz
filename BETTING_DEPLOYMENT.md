# 🎮 Koala Seasons - Blockchain Betting Multiplayer

Your Koala Seasons game now features **blockchain-powered betting** where players compete for real MONAD cryptocurrency!

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
# Edit .env with your private key (contract owner only for winner-bot)
```

### 3. Start Development

```bash
# Option A: Game + Server (no automated winners)
npm run start:all

# Option B: Full system (with automated winner declaration)
npm run start:full
```

## 📋 What's Included

### Smart Contract

- **Address**: `0x8469f356D3C1225e45D08bb7d58a51fD6d9EC12D`
- **Network**: Monad Testnet
- **Bet Amount**: 0.1 MONAD per player
- **Winner Takes**: 0.2 MONAD (full pot)

### Game Files

- `src/utils/Web3Manager.js` - Blockchain integration
- `src/scenes/RoomScene.js` - Wallet connection & game creation
- `src/scenes/GameScene.js` - Gameplay with pot display
- `src/scenes/GameOverScene.js` - Winner announcement & prize

### Server Files

- `server.js` - Multiplayer WebSocket server
- `winner-bot.js` - Automated winner declaration (optional)

### Documentation

- `WEB3_INTEGRATION_GUIDE.md` - Complete integration docs
- `.env.example` - Environment configuration template

## 🎯 How to Play

### For Players

#### Step 1: Connect Wallet

1. Click **MULTIPLAYER** from main menu
2. Click **CONNECT WALLET**
3. Approve MetaMask connection
4. Your wallet address appears at top

#### Step 2: Create or Join Game

**Host (Player 1):**

1. Click **CREATE GAME (0.1 MONAD)**
2. Confirm transaction in MetaMask
3. Note your:
   - Room ID (6 chars, e.g., "ABC123")
   - Game ID (number, e.g., "0")
4. Share both IDs with opponent

**Guest (Player 2):**

1. Click **JOIN GAME**
2. Enter: `RoomID,GameID` (e.g., "ABC123,0")
3. Confirm transaction in MetaMask
4. Game starts automatically

#### Step 3: Play & Win

- **Prize pot displayed**: 💰 0.2 MONAD at top
- **Compete**: Collect more leaves than opponent
- **Winner announced**: Results screen shows who won the pot
- **Prize sent**: Winner automatically receives 0.2 MONAD\*

\*Winner declaration requires contract owner signature (see deployment section)

## 🛠️ Deployment Options

### Option 1: Manual Winner Declaration (Simple)

**Best for**: Testing, small-scale games

1. Start servers:

   ```bash
   npm run start:all
   ```

2. After each game, contract owner manually calls:
   ```javascript
   // Using ethers.js or Web3.js
   await contract.declareWinner(gameId, winnerAddress);
   ```

**Pros**: Simple, no extra infrastructure
**Cons**: Requires manual action after each game

### Option 2: Automated Winner Bot (Recommended)

**Best for**: Production, automated operations

1. Configure `.env`:

   ```env
   MONAD_RPC_URL=https://testnet-rpc.monad.xyz
   OWNER_PRIVATE_KEY=your_private_key_here
   ```

2. Start full system:

   ```bash
   npm run start:full
   ```

3. Bot automatically:
   - Listens for game results
   - Calls `declareWinner()` on blockchain
   - Transfers prize to winner

**Pros**: Fully automated, scalable
**Cons**: Requires secure key management

### Option 3: Backend API (Production)

**Best for**: Production deployment, multiple games

1. Deploy separate backend server
2. Backend handles:

   - Game registration
   - Result verification
   - Winner declaration
   - Transaction monitoring

3. Frontend sends game results to API
4. API calls `declareWinner()` with owner key

**Pros**: Most secure, scalable, auditable
**Cons**: More complex setup

## 🔒 Security Setup

### For Testing (Local)

```bash
# .env
OWNER_PRIVATE_KEY=your_test_wallet_private_key
```

### For Production

**Option A: Hardware Wallet**

- Use Ledger/Trezor for contract owner
- Sign transactions manually
- Most secure

**Option B: Secure Server**

- Store key in secure environment (AWS KMS, etc.)
- Use IP whitelisting
- Implement rate limiting
- Enable monitoring & alerts

**Option C: Multi-Sig**

- Deploy multi-sig wallet as contract owner
- Require 2/3 signatures for winner declaration
- Prevents single point of failure

## 📊 Monitoring

### Check Game Status

```javascript
// In browser console or Node.js
import Web3Manager from "./src/utils/Web3Manager.js";

// Get game details
const game = await Web3Manager.getGameDetails(gameId);
console.log({
  player1: game.player1,
  player2: game.player2,
  pot: game.totalPot,
  winner: game.winner,
  finalized: game.isFinalized,
});
```

### Check Wallet Balance

```javascript
const balance = await Web3Manager.getBalance();
console.log(`Balance: ${balance} MONAD`);
```

### View Active Games

```javascript
const waiting = await Web3Manager.getWaitingGames();
console.log("Games waiting for player 2:", waiting);
```

## 🐛 Troubleshooting

### MetaMask Issues

```
Error: "MetaMask not installed"
→ Install MetaMask browser extension

Error: "Wrong network"
→ Switch to Monad Testnet in MetaMask

Error: "Insufficient funds"
→ Get test MONAD from faucet (need 0.1 + gas)
```

### Transaction Failures

```
Error: "Transaction failed"
→ Check gas settings in MetaMask
→ Increase gas limit if needed
→ Ensure contract address is correct

Error: "Game already finalized"
→ Game already ended and winner paid
→ Create new game

Error: "Only owner can call this"
→ declareWinner() requires contract owner
→ Check OWNER_PRIVATE_KEY in .env
```

### Connection Issues

```
Error: "Server not found"
→ Check server is running: npm run server
→ Check server URL in Web3Manager.js

Error: "Room not found"
→ Verify Room ID is correct
→ Check if host left (room deleted)
```

## 📦 Production Deployment

### Deploy Frontend (Vercel/Netlify)

```bash
npm run build
# Upload dist/ folder to hosting
```

### Deploy Backend (Railway/Heroku)

```bash
# server.js and winner-bot.js
# Add buildpack: Node.js
# Set environment variables
```

### Update URLs

```javascript
// src/services/MultiplayerService.js
this.serverUrl = "https://your-server.railway.app";

// winner-bot.js
const MULTIPLAYER_SERVER_URL = "https://your-server.railway.app";
```

## 🎨 Customization

### Change Bet Amount

```javascript
// Web3Manager.js
const BET_AMOUNT = "0.5"; // Change from 0.1 to 0.5 MONAD

// RoomScene.js - update UI text
("Bet: 0.5 MONAD per player | Winner takes 1.0 MONAD!");
```

### Add Tournament Mode

1. Create bracket system in server.js
2. Track multiple game IDs
3. Progressive prize pools
4. Elimination rounds

### Add Leaderboard

1. Store results in database
2. Track player stats
3. Display top winners
4. Season rewards

## 📝 Contract Functions Reference

```solidity
// Player functions
createGame(betAmount) payable → returns gameId
joinGame(gameId) payable
getGame(gameId) view → returns game details
cancelGame(gameId) // If player 2 never joins

// Owner functions
declareWinner(gameId, winnerAddress)
transferOwnership(newOwner)
emergencyWithdraw() // Emergency only

// View functions
getWaitingGames() → returns gameId[]
getActiveGames() → returns gameId[]
```

## 🚀 Next Steps

1. **Test with Small Amounts**

   - Use test MONAD first
   - Verify all flows work
   - Test error cases

2. **Audit Smart Contract**

   - Get professional audit
   - Test with various scenarios
   - Check for vulnerabilities

3. **Scale Infrastructure**

   - Deploy robust backend
   - Add monitoring & alerts
   - Implement rate limiting

4. **Market the Game**

   - Create social media presence
   - Build community
   - Host tournaments

5. **Add Features**
   - NFT rewards
   - Staking mechanism
   - Variable bet amounts
   - Spectator mode

## 📞 Support

- Contract: `0x8469f356D3C1225e45D08bb7d58a51fD6d9EC12D`
- Transaction: `0xadc0f45053bf84c78c5c3c421d578fc3bd159357a0592a92ac6d864fb4733272`
- Network: Monad Testnet

For issues:

1. Check console logs (F12)
2. Verify MetaMask connection
3. Confirm server is running
4. Review transaction on block explorer

---

**Have fun and bet responsibly!** 🎮💰🐨
