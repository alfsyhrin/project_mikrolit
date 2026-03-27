const Notification = require("../models/NotificationModel");
const TeacherNotification = require("../models/TeacherNotificationModel");

// Untuk mahasiswa
exports.getStudentNotifications = (req, res) => {
  Notification.getAll((err, rows) => {
    if (err) {
      console.error("Error fetching notifications:", err);
      return res.status(500).json({ 
        success: false,
        error: "Gagal mengambil notifikasi" 
      });
    }
    res.json({
      success: true,
      data: rows
    });
  });
};

// Untuk dosen - lihat semua notifikasi aktivitas mahasiswa
exports.getTeacherNotifications = (req, res) => {
  TeacherNotification.getAll((err, rows) => {
    if (err) {
      console.error("Error fetching teacher notifications:", err);
      return res.status(500).json({ 
        success: false,
        error: "Gagal mengambil notifikasi" 
      });
    }
    res.json({
      success: true,
      data: rows
    });
  });
};