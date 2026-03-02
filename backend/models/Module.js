const db = require("../config/db");

const Module = {
    create: (data, callback) => {
        const sql = `
            INSERT INTO modules (title, description, learning_outcomes, created_by)
            VALUES (?, ?, ?, ?)
        `;
        db.query(sql, [data.title, data.description, data.learning_outcomes, data.created_by], callback);
    },

    getByDosen: (id, callback) => {
        const sql = `SELECT * FROM modules WHERE created_by = ? ORDER BY created_at DESC`;
        db.query(sql, [id], callback);
    },

    getDetail: (id, callback) => {
        const sql = `SELECT * FROM modules WHERE id = ?`;
        db.query(sql, [id], callback);
    }
};

module.exports = Module;