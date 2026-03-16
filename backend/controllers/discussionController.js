const discussionService = require("../services/discussionService");
const { getIO } = require('../config/socket');

exports.getRooms = async (req, res) => {
    try {
        const userId = req.user.id;
        const rooms = await discussionService.getDiscussionRooms(userId);

        res.json({
        success: true,
        data: rooms
        });
    } catch (err) {
        res.status(500).json({
        success: false,
        message: err.message
        });
    }
    };

    exports.getMessages = async (req, res) => {
    try {
        const { roomId } = req.params;
        const messages = await discussionService.getRoomMessages(roomId);

        res.json({
        success: true,
        data: messages
        });
    } catch (err) {
        res.status(500).json({
        success: false,
        message: err.message
        });
    }
    };

    exports.sendMessage = async (req, res) => {
    try {
        const { room_id, message } = req.body;
        const userId = req.user.id;

        const messageId = await discussionService.sendMessage(userId, room_id, message);

        const io = getIO();
        const payload = {
        id: messageId,
        room_id,
        user_id: userId,
        message,
        created_at: new Date()
        };

        io.to(`room_${room_id}`).emit('newMessage', payload);

        res.json({
        success: true,
        data: payload
        });
    } catch (err) {
        res.status(400).json({
        success: false,
        message: err.message
        });
    }
    };

    exports.markAsRead = async (req, res) => {
    try {
        const roomId = req.params.roomId;
        const userId = req.user.id;

        await discussionService.markRoomAsRead(roomId, userId);

        res.json({
        success: true,
        message: "messages marked as read"
        });
    } catch (err) {
        res.status(500).json({
        success: false,
        message: err.message
        });
    }
};