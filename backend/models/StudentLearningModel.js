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
    },

    async getModuleObjectives(moduleId) {
        return new Promise((resolve, reject) => {
            db.query(
                `SELECT objective_text
                FROM module_objectives
                WHERE module_id = ?
                ORDER BY sort_order ASC`,
                [moduleId],
                (err, rows) => {
                    if (err) return reject(err);
                    resolve(rows || []);
                }
            );
        });
    },

async getStepResourcesById(stepId) {
    return new Promise((resolve, reject) => {
        db.query(
            `SELECT id, step_id, resource_type, resource_path
             FROM module_step_resources
             WHERE step_id = ?
             ORDER BY id ASC`,
            [stepId],
            (err, rows) => {
                if (err) return reject(err);
                resolve(rows || []);
            }
        );
    });
},

async getStepByNumber(moduleId, stepNumber) {
    return new Promise((resolve, reject) => {
        db.query(
            `SELECT id, module_id, step_number, step_title, step_type, discussion_enabled
             FROM module_steps
             WHERE module_id = ? AND step_number = ?`,
            [moduleId, stepNumber],
            (err, rows) => {
                if (err) return reject(err);
                resolve(rows && rows[0] ? rows[0] : null);
            }
        );
    });
}

};

module.exports = StudentLearningModel;