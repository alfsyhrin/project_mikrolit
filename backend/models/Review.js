const db = require("../config/db");

const Review = {
    createQuestion: (data, callback) => {
        const sql = `
            INSERT INTO review_questions (unit_id, question, type)
            VALUES (?, ?, ?)
        `;
        db.query(sql, [data.unit_id, data.question, data.type], callback);
    },

    createOption: (data, callback) => {
        const sql = `
            INSERT INTO review_options (question_id, option_text, is_correct)
            VALUES (?, ?, ?)
        `;
        db.query(sql, [data.question_id, data.option_text, data.is_correct], callback);
    },

    getQuestionsByUnit: (unitId, callback) => {
        const sql = `
            SELECT * FROM review_questions WHERE unit_id = ?
        `;
        db.query(sql, [unitId], callback);
    },

    getOptionsByQuestion: (questionId, callback) => {
        const sql = `SELECT * FROM review_options WHERE question_id = ?`;
        db.query(sql, [questionId], callback);
    }
};

module.exports = Review;