const db = require("../config/db");

const Progress = {
    startUnit: (data, callback) => {
        const sql = `
            INSERT INTO progress (student_id, module_id, unit_id, status)
            VALUES (?, ?, ?, 'in_progress')
            ON DUPLICATE KEY UPDATE status='in_progress'
        `;
        db.query(sql, [data.student_id, data.module_id, data.unit_id], callback);
    },

    completeUnit: (data, callback) => {
        const sql = `
            INSERT INTO progress (student_id, module_id, unit_id, status)
            VALUES (?, ?, ?, 'completed')
            ON DUPLICATE KEY UPDATE status='completed'
        `;
        db.query(sql, [data.student_id, data.module_id, data.unit_id], callback);
    },

    getProgressByModule: (moduleId, callback) => {
        const sql = `
            SELECT p.*, u.name AS student_name 
            FROM progress p
            JOIN users u ON p.student_id = u.id
            WHERE module_id = ?
        `;
        db.query(sql, [moduleId], callback);
    }
};

module.exports = Progress;