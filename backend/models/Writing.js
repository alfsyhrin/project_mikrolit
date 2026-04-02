// backend/models/Writing.js
const db = require("../config/db");

function pad(num) {
  return String(num).padStart(2, "0");
}

function formatDateToSQL(date) {
  if (!date) return null;

  const d = date instanceof Date ? date : new Date(date);
  if (isNaN(d.getTime())) return null;

  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

function normalizeDatetimeInput(value) {
  if (!value) return null;

  const str = String(value).trim();

  // format SQL biasa: 2026-04-03 21:14 atau 2026-04-03 21:14:00
  if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}(:\d{2})?$/.test(str)) {
    return str.length === 16 ? `${str}:00` : str;
  }

  // format datetime-local: 2026-04-03T21:14 atau 2026-04-03T21:14:00
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?$/.test(str)) {
    const normalized = str.replace("T", " ");
    return normalized.length === 16 ? `${normalized}:00` : normalized;
  }

  // fallback untuk ISO/UTC
  const d = new Date(str);
  if (isNaN(d.getTime())) return null;

  return formatDateToSQL(d);
}

function getCurrentWITDateTime() {
  const now = new Date();

  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jayapura",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false
  }).formatToParts(now);

  const map = {};
  for (const part of parts) {
    if (part.type !== "literal") {
      map[part.type] = part.value;
    }
  }

  return `${map.year}-${map.month}-${map.day} ${map.hour}:${map.minute}:${map.second}`;
}

const Writing = {

  createTask: (data, callback) => {
    const sql = `
      INSERT INTO writing_tasks (module_id, unit_id, task_title, instructions, attachment_url, deadline)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    const normalizedDeadline = normalizeDatetimeInput(data.deadline);

    db.query(sql, [
      data.module_id,
      data.unit_id,
      data.task_title,
      data.instructions,
      data.attachment_url,
      normalizedDeadline
    ], callback);
  },

  updateTask: (id, data, callback) => {
    const sql = `
      UPDATE writing_tasks
      SET module_id = ?, unit_id = ?, task_title = ?, instructions = ?, attachment_url = ?, deadline = ?
      WHERE id = ?
    `;

    const normalizedDeadline = normalizeDatetimeInput(data.deadline);

    db.query(sql, [
      data.module_id,
      data.unit_id,
      data.task_title,
      data.instructions,
      data.attachment_url,
      normalizedDeadline,
      id
    ], callback);
  },

  deleteTask: (id, callback) => {
      db.query("SET FOREIGN_KEY_CHECKS = 0;", (err) => {
          if (err) return callback(err);
          
          db.query("DELETE FROM writing_tasks WHERE id = ?", [id], (err, result) => {
              // Re-enable foreign key checks
              db.query("SET FOREIGN_KEY_CHECKS = 1;", () => {
                  callback(err, result);
              });
          });
      });
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
      SELECT wt.id, wt.unit_id, wt.module_id, wt.task_title, wt.instructions, wt.attachment_url, DATE_FORMAT(wt.deadline, '%Y-%m-%d %H:%i:%s') AS deadline, m.title AS module_title
      FROM writing_tasks wt
      LEFT JOIN modules m ON wt.module_id = m.id
      ORDER BY wt.id DESC
    `, callback);
  },

  getTasksForMahasiswa: (studentId, callback) => {
    db.query(`
      SELECT 
        wt.id,
        wt.unit_id,
        wt.module_id,
        m.title AS module_title,
        wt.task_title,
        wt.instructions,
        wt.attachment_url,
        DATE_FORMAT(wt.deadline, '%Y-%m-%d %H:%i:%s') AS deadline,
        CASE 
          WHEN ws.id IS NOT NULL THEN 'sudah dikumpulkan'
          ELSE 'belum dikumpulkan'
        END AS status,
        DATE_FORMAT(ws.submitted_at, '%Y-%m-%d %H:%i:%s') AS submitted_at
      FROM writing_tasks wt
      LEFT JOIN modules m
        ON wt.module_id = m.id
      LEFT JOIN writing_submissions ws
        ON ws.task_id = wt.id AND ws.student_id = ?
      ORDER BY wt.id DESC
    `, [studentId], callback);
  },

  submitWriting: (data, callback) => {
    const sql = `
      INSERT INTO writing_submissions (task_id, student_id, file_url, answer_text, submitted_at)
      VALUES (?, ?, ?, ?, ?)
    `;

    const submittedAt = getCurrentWITDateTime();

    db.query(sql, [
      data.task_id,
      data.student_id,
      data.file_url,
      data.answer_text,
      submittedAt
    ], callback);
  },


  getSubmissions: (taskId, callback) => {
    db.query(`
      SELECT ws.id, ws.task_id, ws.student_id, ws.file_url, ws.answer_text,
             DATE_FORMAT(ws.submitted_at, '%Y-%m-%d %H:%i:%s') AS submitted_at,
             ws.score, ws.feedback,
             u.name AS student_name,
             u.nidn AS student_npm,
             m.title AS module_title
      FROM writing_submissions ws
      LEFT JOIN users u ON ws.student_id = u.id
      LEFT JOIN writing_tasks wt ON ws.task_id = wt.id
      LEFT JOIN modules m ON wt.module_id = m.id
      WHERE ws.task_id = ?
    `, [taskId], callback);
  },

  gradeSubmission: (data, callback) => {
    db.query(`
      UPDATE writing_submissions
      SET score = ?, feedback = ?
      WHERE id = ?
    `, [data.score, data.feedback, data.id], callback);
  },

  getTaskById: (taskId, callback) => {
    db.query(`
      SELECT 
        id,
        module_id,
        unit_id,
        task_title,
        instructions,
        attachment_url,
        DATE_FORMAT(deadline, '%Y-%m-%d %H:%i:%s') AS deadline
      FROM writing_tasks
      WHERE id = ?
    `, [taskId], (err, rows) => {
      if (err) return callback(err);
      callback(null, rows && rows[0] ? rows[0] : null);
    });
  }
};

module.exports = Writing;