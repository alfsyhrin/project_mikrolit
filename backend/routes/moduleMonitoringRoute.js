const express = require('express');
const router = express.Router();
const auth = require("../middleware/authMiddleware");

const MonitoringController = require('../controllers/moduleMonitoringController');

router.get('/students', auth, MonitoringController.getStudentMonitoring);
router.get("/modules/dashboard", auth, MonitoringController.getDashboard);
router.get("/modules/:moduleId/completed-students", auth, MonitoringController.getCompletedStudents);

module.exports = router;