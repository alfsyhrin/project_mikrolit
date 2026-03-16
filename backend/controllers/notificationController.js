const Notification = require("../models/NotificationModel");

exports.getNotifications = (req, res) => {
    Notification.getAll((err, rows) => {
        if (err) {
            console.error("Error fetching notifications:", err);
            return res.status(500).json({ error: "Gagal mengambil notifikasi" });
        }
        console.log("DEBUG notifications rows:", rows);
        res.json(rows);
    });
};