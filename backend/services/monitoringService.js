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

async function getCompletedStudents(moduleId){
  if (!moduleId) {
    throw new Error("Module ID is required");
  }

  const students = await MonitoringModel.getCompletedStudents(moduleId);
  const formatted = students.map(s => {
    return {
      ...s,
      duration_minutes: Math.floor(s.total_duration_seconds / 60),
    };
  });
  return formatted;
}

module.exports = {
  getStudentMonitoring,
  getModuleMonitoring,
  getCompletedStudents
};