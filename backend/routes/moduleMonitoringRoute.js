const express = require('express');
const router = express.Router();

const MonitoringController = require('../controllers/moduleMonitoringController');

router.get('/students', MonitoringController.getStudentMonitoring);

module.exports = router;