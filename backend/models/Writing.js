// backend/models/Writing.js
const db = require("../config/db");

const Writing = {

  createTask: (data, callback) => {
    const sql = `
      INSERT INTO writing_tasks (module_id, unit_id, instructions, attachment_url, deadline)
      VALUES (?, ?, ?, ?, ?)
    `;
    db.query(sql, [
      data.module_id,
      data.unit_id,
      data.instructions,
      data.attachment_url,
      data.deadline
    ], callback);
  },

  getTasksByModule: (moduleId, callback) => {
    db.query(
      "SELECT * FROM writing_tasks WHERE module_id = ?",
      [moduleId],
      callback
    );
  },

  getAllTasks: (callback) => {
    db.query(`
      SELECT wt.*, m.title AS module_title
      FROM writing_tasks wt
      LEFT JOIN modules m ON wt.module_id = m.id
      ORDER BY wt.id DESC
    `, callback);
  },

  getTasksForMahasiswa: (studentId, callback) => {
      db.query(`
        SELECT wt.*, 
          CASE WHEN ws.id IS NOT NULL THEN 'sudah dikumpulkan' ELSE 'belum dikumpulkan' END AS status
        FROM writing_tasks wt
        LEFT JOIN writing_submissions ws
          ON ws.task_id = wt.id AND ws.student_id = ?
        ORDER BY wt.id DESC
      `, [studentId], callback);
  },

  submitWriting: (data, callback) => {
    const sql = `
      INSERT INTO writing_submissions (task_id, student_id, file_url, answer_text)
      VALUES (?, ?, ?, ?)
    `;
    db.query(sql, [
      data.task_id,
      data.student_id,
      data.file_url,
      data.answer_text
    ], callback);
  },

  getSubmissions: (taskId, callback) => {
    db.query(`
      SELECT ws.*, u.name AS student_name
      FROM writing_submissions ws
      JOIN users u ON ws.student_id = u.id
      WHERE ws.task_id = ?
    `, [taskId], callback);
  },

  gradeSubmission: (data, callback) => {
    db.query(`
      UPDATE writing_submissions
      SET score = ?, feedback = ?
      WHERE id = ?
    `, [data.score, data.feedback, data.id], callback);
  }
};

module.exports = Writing;