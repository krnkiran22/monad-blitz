import { io } from 'socket.io-client';

class MultiplayerService {
    constructor() {
        this.socket = null;
        this.roomId = null;
        this.playerId = null;
        this.isHost = false;
        this.opponentData = null;
        this.connected = false;
        
        // Use localhost for development, can be changed to production URL
        this.serverUrl = 'http://localhost:3001';
    }

    connect() {
        return new Promise((resolve, reject) => {
            if (this.connected) {
                resolve();
                return;
            }

            this.socket = io(this.serverUrl, {
                reconnection: true,
                reconnectionDelay: 1000,
                reconnectionAttempts: 5
            });

            this.socket.on('connect', () => {
                console.log('Connected to multiplayer server');
                this.connected = true;
                this.playerId = this.socket.id;
                resolve();
            });

            this.socket.on('connect_error', (error) => {
                console.error('Connection error:', error);
                reject(error);
            });

            this.socket.on('disconnect', () => {
                console.log('Disconnected from server');
                this.connected = false;
            });
        });
    }

    createRoom() {
        return new Promise((resolve) => {
            this.socket.emit('createRoom');
            
            this.socket.once('roomCreated', (data) => {
                this.roomId = data.roomId;
                this.isHost = true;
                console.log('Room created:', this.roomId);
                resolve(data);
            });
        });
    }

    joinRoom(roomId) {
        return new Promise((resolve, reject) => {
            this.socket.emit('joinRoom', { roomId });
            
            this.socket.once('roomJoined', (data) => {
                this.roomId = roomId;
                this.isHost = false;
                console.log('Joined room:', this.roomId);
                resolve(data);
            });

            this.socket.once('roomError', (error) => {
                console.error('Room error:', error);
                reject(error);
            });
        });
    }

    onOpponentJoined(callback) {
        this.socket.on('opponentJoined', (data) => {
            console.log('Opponent joined:', data);
            callback(data);
        });
    }

    onGameStart(callback) {
        this.socket.on('gameStart', (data) => {
            console.log('Game starting:', data);
            callback(data);
        });
    }

    updateScore(score, leaves) {
        if (!this.roomId) return;
        
        this.socket.emit('updateScore', {
            roomId: this.roomId,
            playerId: this.playerId,
            score: score,
            leaves: leaves
        });
    }

    onOpponentScoreUpdate(callback) {
        this.socket.on('opponentScore', (data) => {
            this.opponentData = data;
            callback(data);
        });
    }

    playerDied(finalScore, finalLeaves, killer) {
        if (!this.roomId) return;
        
        this.socket.emit('playerDied', {
            roomId: this.roomId,
            playerId: this.playerId,
            score: finalScore,
            leaves: finalLeaves,
            killer: killer
        });
    }

    onOpponentDied(callback) {
        this.socket.on('opponentDied', (data) => {
            console.log('Opponent died:', data);
            callback(data);
        });
    }

    onGameResult(callback) {
        this.socket.on('gameResult', (data) => {
            console.log('Game result:', data);
            callback(data);
        });
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
            this.connected = false;
            this.roomId = null;
            this.playerId = null;
            this.isHost = false;
            this.opponentData = null;
        }
    }

    leaveRoom() {
        if (this.roomId && this.socket) {
            this.socket.emit('leaveRoom', { roomId: this.roomId });
            this.roomId = null;
            this.isHost = false;
            this.opponentData = null;
        }
    }
}

// Export singleton instance
export default new MultiplayerService();
