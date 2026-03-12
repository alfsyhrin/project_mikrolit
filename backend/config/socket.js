let io;

const initSocket = (server) => {

    const { Server } = require("socket.io");

    io = new Server(server, {
        cors: {
            origin: "*"
        }
    });

    io.on("connection", (socket) => {

        console.log("Client connected:", socket.id);

    });

};

const getIO = () => {

    if (!io) {
        throw new Error("Socket.io belum diinisialisasi");
    }

    return io;

};

const setIO = (ioInstance) => {
    io = ioInstance;
};

module.exports = {
    initSocket,
    getIO,
    setIO
};