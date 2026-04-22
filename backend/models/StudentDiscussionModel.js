const db = require("../config/db");

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

const StudentDiscussionModel = {
async insertDiscussion(userId, moduleId, stepId, point) {
    return new Promise((resolve, reject) => {
        // Cek apakah sudah ada
        db.query(`
            SELECT id FROM student_step_discussions
            WHERE user_id = ? AND module_id = ? AND step_id = ?
        `, [userId, moduleId, stepId], (err, result) => {
            if (err) return reject(err);

            const createdAt = getCurrentWITDateTime();  // Ambil waktu yang sudah disesuaikan dengan zona waktu.

            if (result.length > 0) {
                // Sudah ada, UPDATE
                db.query(`
                    UPDATE student_step_discussions
                    SET discussion_point = ?, created_at = ?
                    WHERE user_id = ? AND module_id = ? AND step_id = ?
                `, [point, createdAt, userId, moduleId, stepId], (err2, result2) => {
                    if (err2) return reject(err2);
                    resolve(result2.affectedRows);
                });
            } else {
                // Belum ada, INSERT
                db.query(`
                    INSERT INTO student_step_discussions
                    (user_id, module_id, step_id, discussion_point, created_at)
                    VALUES (?, ?, ?, ?, ?)
                `, [userId, moduleId, stepId, point, createdAt], (err2, result2) => {
                    if (err2) return reject(err2);
                    resolve(result2.insertId);
                });
            }
        });
    });
}
};

module.exports = StudentDiscussionModel;