const db = require("../config/db");

const Writing = {
    createTask: (data, callback) => {
        const sql = `
            INSERT INTO writing_tasks (module_id, instructions, attachment_url, deadline)
            VALUES (?, ?, ?, ?)
        `;
        db.query(sql, [data.module_id, data.instructions, data.attachment_url, data.deadline], callback);
    },

    getTaskByModule: (moduleId, callback) => {
        db.query(`SELECT * FROM writing_tasks WHERE module_id = ?`, [moduleId], callback);
    },

    submitWriting: (data, callback) => {
        const sql = `
            INSERT INTO writing_submissions (task_id, student_id, file_url, answer_text)
            VALUES (?, ?, ?, ?)
        `;
        db.query(sql, [data.task_id, data.student_id, data.file_url, data.answer_text], callback);
    },

    getSubmissions: (taskId, callback) => {
        db.query(
            `SELECT ws.*, u.name AS student_name 
             FROM writing_submissions ws 
             JOIN users u ON ws.student_id = u.id
             WHERE ws.task_id = ?`,
            [taskId],
            callback
        );
    },

    gradeSubmission: (data, callback) => {
        db.query(
            `UPDATE writing_submissions SET score=?, feedback=? WHERE id=?`,
            [data.score, data.feedback, data.id],
            callback
        );
    }
};

module.exports = Writing;