const db = require("../config/db");

const Reflect = {
    createReflection: (data, callback) => {
        const sql = `
            INSERT INTO reflections (unit_id, question)
            VALUES (?, ?)
        `;
        db.query(sql, [data.unit_id, data.question], callback);
    },

    getQuestions: (unitId, callback) => {
        db.query(`SELECT * FROM reflections WHERE unit_id = ?`, [unitId], callback);
    },

    submitAnswer: (data, callback) => {
        const sql = `
            INSERT INTO reflection_answers (reflection_id, student_id, answer)
            VALUES (?, ?, ?)
        `;
        db.query(sql, [data.reflection_id, data.student_id, data.answer], callback);
    }
};

module.exports = Reflect;