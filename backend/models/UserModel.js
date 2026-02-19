const db = require("../config/db");

const UserModel = {
    findByEmail: (email, callback) => {
        const sql = "SELECT * FROM users WHERE email = ?";
        db.query(sql, [email], callback);
    },

    createUser: (data, callback) => {
        const sql = "INSERT INTO users SET ?";
        db.query(sql, data, callback);
    },

    findById: (id, callback) => {
        const sql = "SELECT * FROM users WHERE id = ?";
        db.query(sql, [id], callback);
    },

    findByNidn: (nidn, callback) => {
        const sql = "SELECT * FROM users WHERE nidn = ?";
        db.query(sql, [nidn], callback);
    }
};

module.exports = UserModel;
