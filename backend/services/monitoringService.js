const MonitoringModel = require("../models/moduleMonitoringModel");
const DiscussionModel = require("../models/MonitoringDiscussionModel");

async function getStudentMonitoring() {
  const students = await MonitoringModel.getStudentMonitoring();

  for (const student of students) {
    const discussions = await DiscussionModel.getDiscussionByUser(student.user_id);
    student.discussion_points = discussions;
  }

  return students;
}

async function getModuleMonitoring() {
  const modules = await MonitoringModel.getModuleDashboard();

  return modules;
}

module.exports = {
  getStudentMonitoring,
  getModuleMonitoring
};