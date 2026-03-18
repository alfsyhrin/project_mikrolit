const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");

const { getStudentNotifications, getTeacherNotifications } = 
  require("../controllers/notificationController");

// Endpoint untuk mahasiswa
router.get("/students", auth, getStudentNotifications);

// Endpoint untuk dosen
router.get("/teacher", auth, getTeacherNotifications);

module.exports = router;