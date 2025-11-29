const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Store active rooms
const rooms = new Map();

// Helper function to generate 6-digit room ID
function generateRoomId() {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
}

io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    // Create a new room
    socket.on('createRoom', () => {
        const roomId = generateRoomId();
        
        rooms.set(roomId, {
            id: roomId,
            host: socket.id,
            guest: null,
            hostData: { score: 0, leaves: 0, died: false },
            guestData: { score: 0, leaves: 0, died: false },
            gameStarted: false,
            gameEnded: false
        });
        
        socket.join(roomId);
        socket.roomId = roomId;
        socket.isHost = true;
        
        console.log(`Room ${roomId} created by ${socket.id}`);
        
        socket.emit('roomCreated', { roomId });
    });

    // Join an existing room
    socket.on('joinRoom', ({ roomId }) => {
        const room = rooms.get(roomId);
        
        if (!room) {
            socket.emit('roomError', { message: 'Room not found' });
            return;
        }
        
        if (room.guest) {
            socket.emit('roomError', { message: 'Room is full' });
            return;
        }
        
        room.guest = socket.id;
        socket.join(roomId);
        socket.roomId = roomId;
        socket.isHost = false;
        
        console.log(`Player ${socket.id} joined room ${roomId}`);
        
        socket.emit('roomJoined', { roomId });
        
        // Notify host that opponent joined
        io.to(room.host).emit('opponentJoined', { playerId: socket.id });
        
        // Start game for both players
        room.gameStarted = true;
        io.to(roomId).emit('gameStart', { roomId });
    });

    // Update player score
    socket.on('updateScore', ({ roomId, playerId, score, leaves }) => {
        const room = rooms.get(roomId);
        if (!room) return;
        
        const isHost = playerId === room.host;
        
        if (isHost) {
            room.hostData.score = score;
            room.hostData.leaves = leaves;
            // Send to guest
            if (room.guest) {
                io.to(room.guest).emit('opponentScore', { score, leaves });
            }
        } else {
            room.guestData.score = score;
            room.guestData.leaves = leaves;
            // Send to host
            io.to(room.host).emit('opponentScore', { score, leaves });
        }
    });

    // Player died
    socket.on('playerDied', ({ roomId, playerId, score, leaves, killer }) => {
        const room = rooms.get(roomId);
        if (!room) return;
        
        const isHost = playerId === room.host;
        
        console.log(`Player ${playerId} died in room ${roomId}. Score: ${score}, Leaves: ${leaves}`);
        
        if (isHost) {
            room.hostData.score = score;
            room.hostData.leaves = leaves;
            room.hostData.died = true;
            room.hostData.killer = killer;
            
            // Notify guest
            if (room.guest) {
                io.to(room.guest).emit('opponentDied', { score, leaves, killer });
            }
        } else {
            room.guestData.score = score;
            room.guestData.leaves = leaves;
            room.guestData.died = true;
            room.guestData.killer = killer;
            
            // Notify host
            io.to(room.host).emit('opponentDied', { score, leaves, killer });
        }
        
        // Check if both players died - determine winner
        if (room.hostData.died && room.guestData.died && !room.gameEnded) {
            room.gameEnded = true;
            
            let winner;
            if (room.hostData.leaves > room.guestData.leaves) {
                winner = 'host';
            } else if (room.guestData.leaves > room.hostData.leaves) {
                winner = 'guest';
            } else {
                winner = 'tie';
            }
            
            console.log(`Game ended in room ${roomId}. Winner: ${winner}`);
            console.log(`Host leaves: ${room.hostData.leaves}, Guest leaves: ${room.guestData.leaves}`);
            
            // Send result to both players
            const result = {
                winner,
                hostData: room.hostData,
                guestData: room.guestData
            };
            
            io.to(roomId).emit('gameResult', result);
            
            // Clean up room after 30 seconds
            setTimeout(() => {
                rooms.delete(roomId);
                console.log(`Room ${roomId} deleted`);
            }, 30000);
        }
    });

    // Leave room
    socket.on('leaveRoom', ({ roomId }) => {
        const room = rooms.get(roomId);
        if (!room) return;
        
        socket.leave(roomId);
        
        // Notify other player
        if (socket.id === room.host && room.guest) {
            io.to(room.guest).emit('opponentLeft');
        } else if (socket.id === room.guest) {
            io.to(room.host).emit('opponentLeft');
        }
        
        // If host leaves, delete room
        if (socket.id === room.host) {
            rooms.delete(roomId);
            console.log(`Room ${roomId} deleted (host left)`);
        } else {
            room.guest = null;
        }
    });

    // Disconnect
    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
        
        // Find and clean up room
        if (socket.roomId) {
            const room = rooms.get(socket.roomId);
            if (room) {
                // Notify other player
                if (socket.id === room.host && room.guest) {
                    io.to(room.guest).emit('opponentLeft');
                    rooms.delete(socket.roomId);
                } else if (socket.id === room.guest) {
                    io.to(room.host).emit('opponentLeft');
                    room.guest = null;
                }
            }
        }
    });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    console.log(`🚀 Multiplayer server running on port ${PORT}`);
    console.log(`   Active rooms: ${rooms.size}`);
});

// Log active rooms every 30 seconds
setInterval(() => {
    console.log(`📊 Stats: ${rooms.size} active rooms, ${io.sockets.sockets.size} connected clients`);
}, 30000);
