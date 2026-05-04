const db = require("../config/db");

const ForgotPasswordModel = {
    // Simpan OTP & expiry time ke user
    saveOTP: (email, otp, expiryTime, callback) => {
        const sql = "UPDATE users SET otp_code = ?, otp_expires_at = ? WHERE email = ?";
        db.query(sql, [otp, expiryTime, email], callback);
    },

    // Ambil user beserta OTP-nya
    getUserWithOTP: (email, callback) => {
        const sql = "SELECT id, email, otp_code, otp_expires_at FROM users WHERE email = ?";
        db.query(sql, [email], callback);
    },

    // Update password & hapus OTP
    updatePasswordAndClearOTP: (userId, hashedPassword, callback) => {
        const sql = "UPDATE users SET password = ?, otp_code = NULL, otp_expires_at = NULL WHERE id = ?";
        db.query(sql, [hashedPassword, userId], callback);
    },

    // Hapus OTP setelah timeout
    clearExpiredOTP: (email, callback) => {
        const sql = "UPDATE users SET otp_code = NULL, otp_expires_at = NULL WHERE email = ?";
        db.query(sql, [email], callback);
    }
};

module.exports = ForgotPasswordModel;