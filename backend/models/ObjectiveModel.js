const db = require("../config/db");

const Objective = {
    createObjective: (data, callback) => {
        const sql = `
            INSERT INTO module_objectives (module_id, objective_text, sort_order)
            VALUES (?, ?, ?)
        `;
        db.query(sql, [data.module_id, data.objective_text, data.sort_order], callback);
    },

    // add to backend/models/ObjectiveModel.js

    getByModule: (moduleId, callback) => {
        const sql = `
            SELECT
                objective_text
            FROM module_objectives
            WHERE module_id = ?
            ORDER BY sort_order ASC
        `;
        db.query(sql, [moduleId], callback);
    },

    deleteByModule: (moduleId, callback) => {
        const sql = `DELETE FROM module_objectives WHERE module_id = ?`;
        db.query(sql, [moduleId], callback);
    }
};

module.exports = Objective;