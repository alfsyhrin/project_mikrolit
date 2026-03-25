const db = require("../config/db");

const MonitoringDiscussionModel = {
    // Single user
    async getDiscussionByUser(userId) {
        return new Promise((resolve, reject) => {
            db.query(`
            SELECT
                ssd.id,
                ssd.module_id,
                ssd.user_id,
                ssd.step_id,
                COALESCE(ms.step_number, 'DELETED') AS step_number,
                COALESCE(ms.step_title, 'Step Not Found') AS step_title,
                ssd.discussion_point,
                ssd.created_at
            FROM student_step_discussions ssd
            LEFT JOIN module_steps ms ON ms.id = ssd.step_id
            WHERE ssd.user_id = ?
            ORDER BY ssd.created_at DESC`,
            [userId],
            (err, rows) => {
                if (err) return reject(err);
                resolve(rows || []);
            });
        });
    },

    // Batch fetch untuk semua users
    async getAllDiscussions() {
        return new Promise((resolve, reject) => {
            db.query(`
            SELECT
                ssd.id,
                ssd.user_id,
                ssd.module_id,
                ssd.step_id,
                COALESCE(ms.step_number, 'DELETED') AS step_number,
                COALESCE(ms.step_title, 'Step Not Found') AS step_title,
                ssd.discussion_point,
                ssd.created_at
            FROM student_step_discussions ssd
            LEFT JOIN module_steps ms ON ms.id = ssd.step_id
            ORDER BY ssd.user_id, ssd.created_at DESC`,
            (err, rows) => {
                if (err) return reject(err);
                resolve(rows || []);
            });
        });
    }
};

module.exports = MonitoringDiscussionModel;