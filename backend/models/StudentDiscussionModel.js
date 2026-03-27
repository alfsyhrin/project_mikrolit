const db = require("../config/db");

const StudentDiscussionModel = {
    async insertDiscussion(userId, moduleId, stepId, point) {
    return new Promise((resolve, reject) => {
        // Cek apakah sudah ada
        db.query(`
            SELECT id FROM student_step_discussions
            WHERE user_id = ? AND module_id = ? AND step_id = ?
            `, 
            [userId, moduleId, stepId], (err, result) => {
                if (err) return reject(err);

                if (result.length > 0) {
                    // Sudah ada, UPDATE
                    db.query(`
                        UPDATE student_step_discussions
                        SET discussion_point = ?, created_at = NOW()
                        WHERE user_id = ? AND module_id = ? AND step_id = ?
                        `,
                        [point, userId, moduleId, stepId], (err2, result2) => {
                            if (err2) return reject(err2);
                            resolve(result2.affectedRows);
                        });
                } else {
                    // Belum ada, INSERT
                    db.query(`
                        INSERT INTO student_step_discussions
                        (user_id, module_id, step_id, discussion_point)
                        VALUES (?, ?, ?, ?)
                        `,
                        [userId, moduleId, stepId, point], (err2, result2) => {
                            if (err2) return reject(err2);
                            resolve(result2.insertId);
                        });
                }
            });
    });
}
};

module.exports = StudentDiscussionModel;