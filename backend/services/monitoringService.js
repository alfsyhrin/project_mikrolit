const MonitoringModel = require("../models/moduleMonitoringModel");

async function getStudentMonitoring() {
  const rows = await MonitoringModel.getStudentMonitoring();
  return rows;
}

module.exports = {
  getStudentMonitoring
};