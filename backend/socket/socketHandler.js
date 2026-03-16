const { setIO } = require('../config/socket');

module.exports = (io) => {

    setIO(io);

    io.on('connection', (socket) => {

        console.log('User connected:', socket.id);

        // Join room
        socket.on('joinRoom', (data) => {

            const roomId = `room_${data.roomId}`;

            socket.join(roomId);
            socket.userId = data.userId;

            console.log(`User ${data.userId} joined ${roomId}`);

        });

        // Leave room
        socket.on('leaveRoom', (data) => {

            const roomId = `room_${data.roomId}`;

            socket.leave(roomId);

            console.log(`User ${data.userId} left ${roomId}`);

        });

        socket.on('disconnect', () => {
            console.log('User disconnected:', socket.id);
        });

    });

};