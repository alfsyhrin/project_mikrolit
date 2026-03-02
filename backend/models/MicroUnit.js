const db = require("../config/db");

const MicroUnit = {
    create: (data, callback) => {
        const sql = `
            INSERT INTO micro_units (module_id, unit_type, title, content, attachment_url)
            VALUES (?, ?, ?, ?, ?)
        `;
        db.query(sql, [
            data.module_id,
            data.unit_type,
            data.title,
            data.content,
            data.attachment_url
        ], callback);
    },

    getByModule: (moduleId, callback) => {
        db.query(
            `SELECT * FROM micro_units WHERE module_id = ? ORDER BY id ASC`,
            [moduleId],
            callback
        );
    },

    getDetail: (id, callback) => {
        db.query(`SELECT * FROM micro_units WHERE id = ?`, [id], callback);
    },

    update: (data, callback) => {
        const sql = `
            UPDATE micro_units SET title=?, content=?, attachment_url=?
            WHERE id=?
        `;
        db.query(sql, [data.title, data.content, data.attachment_url, data.id], callback);
    },

    delete: (id, callback) => {
        db.query(`DELETE FROM micro_units WHERE id = ?`, [id], callback);
    }
};

module.exports = MicroUnit;