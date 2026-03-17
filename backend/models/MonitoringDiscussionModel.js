const db = require("../config/db");

const MonitoringDiscussionModel = {
    async getDiscussionByUser(userId) {
        return new Promise((resolve,reject)=>{
            db.query(`
            SELECT
            ssd.module_id,
            ms.step_number,
            ms.step_title,
            ssd.discussion_point,
            ssd.created_at
            FROM student_step_discussions ssd
            JOIN module_steps ms
            ON ms.id = ssd.step_id
            WHERE ssd.user_id = ?
            ORDER BY ssd.created_at DESC`,
            [userId],
            (err, rows)=>{
                if (err) return reject(err);
                resolve(rows || []);
            });
        });
    }
};

module.exports = MonitoringDiscussionModel;