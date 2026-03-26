const discussionService = require("../services/discussionService");
const { getIO } = require('../config/socket');
const eventBus = require("../events/eventBus");

exports.getRooms = async (req, res) => {
    try {
        const userId = req.user.id;
        console.log("🔍 getRooms called for userId:", userId);
        
        const rooms = await discussionService.getDiscussionRooms(userId);
        console.log("✅ Rooms fetched:", rooms.length, "rooms");
        console.log("📊 Rooms data:", JSON.stringify(rooms, null, 2));

        res.json({
            success: true,
            data: rooms
        });
    } catch (err) {
        console.error("❌ getRooms error:", err);
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

    exports.getMessages = async (req, res) => {
    try {
        const { roomId } = req.params;
        console.log("🔍 getMessages called for roomId:", roomId);
        
        const messages = await discussionService.getRoomMessages(roomId);
        console.log("✅ Messages fetched:", messages.length, "messages");
        console.log("📊 Messages data:", JSON.stringify(messages, null, 2));

        res.json({
            success: true,
            data: messages
        });
    } catch (err) {
        console.error("❌ getMessages error:", err);
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

            // ✅ BARU: Emit event untuk notifikasi dosen
            eventBus.emit("discussion_message_sent", {
                student_id: userId,
                room_id: room_id,
                module_id: null,  // Jika perlu dapat dari discussion room
                message: message,
                submitted_at: new Date()
            });

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