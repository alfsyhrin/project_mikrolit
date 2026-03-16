const db = require("../config/db");

const StudentLearningModel = {

    async getModule(moduleId) {
        return new Promise((resolve, reject) => {
            db.query(
                `SELECT id, title, description
                 FROM modules
                 WHERE id = ?`,
                [moduleId],
                (err, rows) => {
                    if (err) return reject(err);
                    resolve(rows && rows[0] ? rows[0] : null);
                }
            );
        });
    },

    async getModuleSteps(moduleId) {
        return new Promise((resolve, reject) => {
            db.query(
                `SELECT id, step_number, step_title, step_type
                 FROM module_steps
                 WHERE module_id = ?
                 ORDER BY step_number ASC`,
                [moduleId],
                (err, rows) => {
                    if (err) return reject(err);
                    resolve(rows || []);
                }
            );
        });
    },

    async getStepResources(stepIds) {
        if (!stepIds || stepIds.length === 0) return [];
        return new Promise((resolve, reject) => {
            db.query(
                `SELECT step_id, resource_type, resource_path
                 FROM module_step_resources
                 WHERE step_id IN (?)`,
                [stepIds],
                (err, rows) => {
                    if (err) return reject(err);
                    resolve(rows || []);
                }
            );
        });
    },

    async getStudentProgress(userId, moduleId) {
        return new Promise((resolve, reject) => {
            db.query(
                `SELECT completed_steps, progress_percent
                 FROM student_module_progress
                 WHERE user_id = ? AND module_id = ?`,
                [userId, moduleId],
                (err, rows) => {
                    if (err) return reject(err);
                    resolve(rows && rows[0] ? rows[0] : null);
                }
            );
        });
    }

};

module.exports = StudentLearningModel;