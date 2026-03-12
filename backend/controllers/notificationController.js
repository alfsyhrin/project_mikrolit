const Notification = require("../models/NotificationModel");

exports.getNotifications = async (req, res) => {

    try {

        const notifications = await Notification.getAll();

        res.json({
            success: true,
            data: notifications
        });

    } catch (error) {

        res.status(500).json({
            message: "Gagal mengambil notifikasi"
        });

    }

};