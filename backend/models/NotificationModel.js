const db = require("../config/db");

const Notification = {

    create: async (data) => {

        const query = `
            INSERT INTO notifications
            (title, message, type, reference_id, reference_type)
            VALUES (?, ?, ?, ?, ?)
        `;

        const [result] = await db.promise().query(query, [
            data.title,
            data.message,
            data.type,
            data.reference_id,
            data.reference_type
        ]);

        return result; // result.insertId, affectedRows, dsb.
    },

    getAll: (callback) => {
        db.query(`SELECT id, title, message, type, reference_id, reference_type, created_at FROM notifications ORDER BY created_at DESC`, callback);
    }

};

module.exports = Notification;