const Notification = require("../models/NotificationModel");
const { getIO } = require("../config/socket");

const createNotification = async (data) => {

    const result = await Notification.create(data);

    const notification = {
        id: result.insertId,
        ...data,
        created_at: new Date()
    };

    const io = getIO();

    io.emit("Notification Created :", notification);

};

module.exports = {
    createNotification
};