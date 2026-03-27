const MonitoringModel = require("../models/moduleMonitoringModel");
const DiscussionModel = require("../models/MonitoringDiscussionModel");

async function getStudentMonitoring() {
  const students = await MonitoringModel.getStudentMonitoring();

  // Fetch ALL discussions sekali (batch) bukan per-user loop
  const allDiscussions = await DiscussionModel.getAllDiscussions();
  
  // Map discussions by user_id
  const discussionMap = {};
  for (const disc of allDiscussions) {
    if (!discussionMap[disc.user_id]) {
      discussionMap[disc.user_id] = [];
    }
    discussionMap[disc.user_id].push({
      module_id: disc.module_id,
      step_number: disc.step_number,
      step_title: disc.step_title,
      discussion_point: disc.discussion_point,
      created_at: disc.created_at
    });
  }

  // Attach discussions ke students
  for (const student of students) {
    student.discussion_points = discussionMap[student.user_id] || [];
  }

  return students;
}

async function getModuleMonitoring() {
  const modules = await MonitoringModel.getModuleDashboard();
  return modules;
}

async function getCompletedStudents(moduleId) {
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