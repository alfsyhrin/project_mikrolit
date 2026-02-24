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
    },

    findByRole: (role, callback) => {
        const sql = "SELECT * FROM users WHERE role = ?";
        db.query(sql, [role], callback);
    },

    findByStatus: (status, callback) => {
        const sql = "SELECT * FROM users WHERE status = ?";
        db.query(sql, [status], callback);
    },
    
    updateStatus: (id, status, callback) => {
        const sql = "UPDATE users SET status = ? WHERE id = ?";
        db.query(sql, [status, id], callback);
    }  
    
};

module.exports = UserModel;
