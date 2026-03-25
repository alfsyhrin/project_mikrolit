const db = require("../config/db");

const Step = {
    createStep: (data, callback) => {
        const sql = `
            INSERT INTO module_steps
            (module_id, step_number, step_title, step_type, discussion_enabled)
            VALUES (?, ?, ?, ?, ?)
            `;
        db.query(sql, [data.module_id, data.step_number, data.step_title, data.step_type, data.discussion_enabled || false], callback);
    },

    // add to backend/models/StepModel.js

    getStepsByModule: (moduleId, callback) => {
        const sql = `
            SELECT
                id,
                step_number,
                step_title,
                step_type,
                discussion_enabled
            FROM module_steps
            WHERE module_id = ?
            ORDER BY step_number ASC
        `;
        db.query(sql, [moduleId], callback);
    },

    getStepByNumber: (moduleId, stepNumber) => {
        return new Promise((resolve, reject) => {
            const query = `
                SELECT id, step_number
                FROM module_steps
                WHERE module_id = ?
                AND step_number = ?
                LIMIT 1
            `;
            db.query(query, [moduleId, stepNumber], (err, rows) => {
                if (err) return reject(err);
                resolve(rows && rows[0] ? rows[0] : null);
            });
        });
    },

    deleteByModule: (moduleId, callback) => {
        const sql = `DELETE FROM module_steps WHERE module_id = ?`;
            db.query(sql, [moduleId], callback);
    },

    getStepsByModule: (moduleId, callback) => {
        const sql = `
            SELECT id, step_number, step_title, step_type, discussion_enabled
            FROM module_steps
            WHERE module_id = ?
            ORDER BY step_number ASC
        `;
        db.query(sql, [moduleId], callback);
    },

    deleteStep: (stepId, callback) => {
        const sql = `DELETE FROM module_steps WHERE id = ?`;
        db.query(sql, [stepId], callback);
    }

};

module.exports = Step;