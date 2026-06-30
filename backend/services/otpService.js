const crypto = require("crypto");

const otpService = {
    // Generate OTP 6 digit random
    generateOTP: () => {
        return Math.floor(100000 + Math.random() * 900000).toString();
    },

    // Generate waktu expired (default 10 menit)
    getOTPExpiry: (minutes = 10) => {
        const now = new Date();
        now.setMinutes(now.getMinutes() + minutes);
        return now;
    },

    // Validasi apakah OTP masih berlaku
    isOTPValid: (storedOTP, inputOTP, expiryTime) => {
        const now = new Date();
        
        // Cek apakah OTP cocok
        if (storedOTP !== inputOTP) {
            return false;
        }
        
        // Cek apakah OTP sudah expired
        if (now > new Date(expiryTime)) {
            return false;
        }
        
        return true;
    },

    // Generate token untuk reset password (simple UUID)
    generateResetToken: () => {
        return crypto.randomBytes(32).toString("hex");
    }
};

module.exports = otpService;