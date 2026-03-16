const db = require("../config/db");
const { getByModule } = require("./MicroUnit");

const Module = {
    createModule: (data, callback) => {
        const sql = `
        INSERT INTO modules (title, description, learning_outcomes, discussion_enabled, created_by)
        VALUES (?, ?, ?, ?, ?)
        `;
        db.query(sql, [data.title, data.description, data.learning_outcomes, data.discussion_enabled, data.created_by], callback);
    },

getModules: (userId, callback) => {
    const sql = `
        SELECT
        id,
        title,
        description,
        learning_outcomes,
        discussion_enabled,
        created_by,
        created_at
        FROM modules
        ORDER BY created_at DESC
        LIMIT 50
        `;
    console.log("🔍 Query all modules (no WHERE), userId:", userId);
    db.query(sql, callback);
},

// replace getById in backend/models/Module.js
    getById: (id, callback) => {
        const sql = `SELECT id, title, description, learning_outcomes, discussion_enabled, created_by, created_at FROM modules WHERE id = ?`;
        db.query(sql, [id], (err, rows) => {
            if (err) return callback(err);
            if (!rows || rows.length === 0) return callback(new Error("Module not found"));
            return callback(null, rows[0]);
        });
    },

    getByModule: (moduleId, callback) => {
        const sql = `
            SELECT
            id,
            objective_text
            FROM module_objectives
            WHERE module_id = ?
            ORDER BY sort_order ASC
        `;
        db.query(sql, [moduleId], callback);
    },

    getStepByModule: (moduleId, callback) => {
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

    getResourcesByStep: (stepId, callback) => {
        const sql = `
            SELECT
                resource_type,
                resource_path
            FROM module_step_resources
            WHERE step_id = ?
            ORDER BY id ASC
        `;
        db.query(sql, [stepId], callback);
    },

    updateModule: (id, data, callback) => {
        const sql = `UPDATE modules SET title = ?, description = ?, learning_outcomes = ?, discussion_enabled = ? WHERE id = ?`;
        db.query(sql, [data.title, data.description, data.learning_outcomes, data.discussion_enabled, id], callback);
    },

    deleteModule: (id, callback) => {
        const sql = `DELETE FROM modules WHERE id = ?`;
        db.query(sql, [id], callback);
    }
    

};

module.exports = Module;