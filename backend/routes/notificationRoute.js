const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const Notification = require("../models/TeacherNotificationModel");


const { getStudentNotifications, getTeacherNotifications } = 
  require("../controllers/notificationController");

// Endpoint untuk mahasiswa
router.get("/students", auth, getStudentNotifications);

// Endpoint untuk dosen
router.get("/teacher", auth, getTeacherNotifications);
router.get("/teacher/all", auth, (req, res) => {
    Notification.getAll((err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(results);
    });
});

module.exports = router;