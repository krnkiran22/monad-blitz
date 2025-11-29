# Koala Seasons - Multiplayer Mode

## 🎮 How to Play Multiplayer

### Setup Instructions

1. **Start the WebSocket Server**

   ```bash
   npm run server
   ```

   The server will start on port 3001.

2. **Start the Game**
   In a new terminal:

   ```bash
   npm run dev
   ```

   The game will start on port 5173 (or another available port).

3. **Or Start Both Together**
   ```bash
   npm start:all
   ```

### Playing Multiplayer

1. **Main Menu**

   - Click "MULTIPLAYER" button

2. **Create or Join Room**

   - **Player 1 (Host)**: Click "CREATE ROOM"

     - Share the 6-digit Room ID with your friend
     - Wait for Player 2 to join

   - **Player 2 (Guest)**: Click "JOIN ROOM"
     - Enter the 6-digit Room ID
     - Press ENTER to join

3. **Gameplay**

   - Both players compete simultaneously
   - Real-time score and leaves tracking
   - See opponent's status in top-right corner
   - Collect leaves to win!

4. **Game End**
   - **If you die first**: Wait for opponent to finish
   - **If opponent dies first**: Keep playing to maximize your score
   - **Winner determined by**: Number of leaves collected
   - **Tiebreaker**: If leaves are equal, it's a tie!

### How to Win

The player who collects **MORE LEAVES** wins the game!

Example:

- Player 1: 20 leaves → Winner! 🏆
- Player 2: 19 leaves → Lost

### Game Rules

1. Keep jumping between trees (don't stay still too long!)
2. Collect as many leaves as possible
3. Avoid enemies (snakes, dingos, fire)
4. Compare leaf scores when both players die
5. The player with more leaves wins!

## Technical Details

### Architecture

```
Client (Browser) ←→ Socket.IO ←→ Server (Node.js)
     ↓                                   ↓
  Phaser Game                      Room Management
  Score Tracking                   Score Sync
  Real-time Updates                Winner Calculation
```

### Server Events

- `createRoom` - Create new game room
- `joinRoom` - Join existing room
- `updateScore` - Send score updates
- `playerDied` - Notify when player dies
- `gameResult` - Receive winner announcement

### Client Components

1. **RoomScene.js** - Room creation/joining UI
2. **MultiplayerService.js** - WebSocket communication
3. **GameScene.js** - Game logic with multiplayer support
4. **GameOverScene.js** - Winner/loser display

## Deployment

### Local Network Play

For playing on local network:

1. Find your local IP: `ipconfig` (Windows) or `ifconfig` (Mac/Linux)
2. Update `serverUrl` in `src/services/MultiplayerService.js`:
   ```javascript
   this.serverUrl = "http://YOUR_LOCAL_IP:3001";
   ```
3. Start server on host machine
4. Other players connect to host's IP

### Production Deployment

For online play:

1. Deploy server to cloud (Heroku, Railway, etc.)
2. Update `serverUrl` to production URL
3. Ensure CORS is properly configured
4. Deploy client to Vercel/Netlify

## Troubleshooting

**Server not connecting?**

- Check if server is running on port 3001
- Verify firewall settings
- Check browser console for errors

**Room not found?**

- Ensure Room ID is correct (case-sensitive)
- Room may have expired (30s after game ends)
- Create a new room instead

**Opponent not updating?**

- Check internet connection
- Server may have disconnected
- Refresh page and rejoin

## Features

✅ Real-time multiplayer
✅ Room-based matchmaking
✅ Live score tracking
✅ Waiting screen when one player dies
✅ Winner determination based on leaves collected
✅ Clean UI with opponent status display
✅ Automatic room cleanup

Enjoy playing Koala Seasons with friends! 🐨🌿
