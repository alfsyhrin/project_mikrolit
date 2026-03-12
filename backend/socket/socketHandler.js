// socket/socketHandler.js
const { setIO } = require('../config/socket');

module.exports = (io) => {
    // register io instance so `getIO` can access it
    setIO(io);
    // User join room
    io.on('connection', (socket) => {
        console.log('User connected:', socket.id);

        // Join room
        socket.on('joinRoom', (data) => {
            socket.join(data.roomId);
            socket.userId = data.userId;
            console.log(`User ${data.userId} joined room ${data.roomId}`);
        });

        // Kirim pesan
        socket.on('sendMessage', (data) => {
            // Simpan ke DB
            const MessageModel = require('../models/MessageModel');
            MessageModel.create(data, (err, message) => {
                if (!err) {
                    // Broadcast ke semua member room
                    io.to(data.roomId).emit('newMessage', message);
                }
            });
        });

        socket.on('disconnect', () => {
            console.log('User disconnected:', socket.id);
        });
    });
};
