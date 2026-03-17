const db = require("../config/db");

const StudentDiscussionModel = {
    async insertDiscussion(userId, moduleId, stepId, point) {
        return new Promise((resolve, reject) => {
            db.query(`
                INSERT INTO student_step_discussions
                (user_id,module_id,step_id,discussion_point)
                VALUES (?,?,?,?)
                `, 
                [userId, moduleId, stepId, point], (err, result) => {
                    if (err) return reject(err);
                        resolve(result.insertId);
                    });
        });
    }
};

module.exports = StudentDiscussionModel;