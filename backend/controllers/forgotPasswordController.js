const bcrypt = require("bcryptjs");
const UserModel = require("../models/UserModel");
const ForgotPasswordModel = require("../models/ForgotPasswordModel");
const emailService = require("../services/emailService");
const otpService = require("../services/otpService");

// Simpan reset token di memory (untuk tahap 2 ke 3)
// Idenya: key = email, value = {token, expiryTime}
let resetTokenStore = {};

const forgotPasswordController = {
    // ============ TAHAP 1: Request OTP ============
    requestOTP: (req, res) => {
        const { email } = req.body;

        // Validasi input
        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Email harus diisi"
            });
        }

        // Cek format email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: "Format email tidak valid"
            });
        }

        // Cek apakah user dengan email tersebut ada
        UserModel.findByEmail(email, (err, results) => {
            if (err) {
                return res.status(500).json({
                    success: false,
                    message: "Terjadi error di server"
                });
            }

            // Email tidak ditemukan
            if (results.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Email tidak terdaftar di sistem"
                });
            }

            // Generate OTP
            const otp = otpService.generateOTP();
            const expiryTime = otpService.getOTPExpiry(10); // 10 menit

            // Simpan OTP ke database
            ForgotPasswordModel.saveOTP(email, otp, expiryTime, (err, results) => {
                if (err) {
                    return res.status(500).json({
                        success: false,
                        message: "Gagal menyimpan OTP"
                    });
                }

                // Kirim email OTP
                emailService.sendOTPEmail(email, otp, (err, info) => {
                    if (err) {
                        console.log("Error sending email:", err);
                        return res.status(500).json({
                            success: false,
                            message: "Gagal mengirim OTP ke email"
                        });
                    }

                    res.status(200).json({
                        success: true,
                        message: "OTP telah dikirim ke email Anda. Berlaku selama 10 menit",
                        data: {
                            email: email
                        }
                    });
                });
            });
        });
    },

    // ============ TAHAP 2: Verify OTP ============
    verifyOTP: (req, res) => {
        const { email, otp } = req.body;

        // Validasi input
        if (!email || !otp) {
            return res.status(400).json({
                success: false,
                message: "Email dan OTP harus diisi"
            });
        }

        if (otp.length !== 6 || isNaN(otp)) {
            return res.status(400).json({
                success: false,
                message: "OTP harus 6 digit angka"
            });
        }

        // Ambil user dengan OTP-nya
        ForgotPasswordModel.getUserWithOTP(email, (err, results) => {
            if (err) {
                return res.status(500).json({
                    success: false,
                    message: "Terjadi error di server"
                });
            }

            // User tidak ditemukan
            if (results.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Email tidak terdaftar"
                });
            }

            const user = results[0];
            const { id, otp_code, otp_expires_at } = user;

            // Validasi OTP
            if (!otpService.isOTPValid(otp_code, otp, otp_expires_at)) {
                return res.status(401).json({
                    success: false,
                    message: "OTP tidak valid atau sudah kadaluarsa"
                });
            }

            // Generate reset token (valid 10 menit)
            const resetToken = otpService.generateResetToken();
            const tokenExpiry = otpService.getOTPExpiry(10);

            // Simpan token di memory
            resetTokenStore[email] = {
                token: resetToken,
                expiry: tokenExpiry,
                userId: id
            };

            res.status(200).json({
                success: true,
                message: "OTP berhasil diverifikasi. Lanjut ke reset password",
                data: {
                    token: resetToken,
                    email: email
                }
            });
        });
    },

    // ============ TAHAP 3: Reset Password ============
    resetPassword: (req, res) => {
        const { email, token, password, confirmPassword } = req.body;

        // Validasi input
        if (!email || !token || !password || !confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "Semua field harus diisi"
            });
        }

        // Validasi password cocok
        if (password !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "Password dan konfirmasi password tidak cocok"
            });
        }

        // Validasi password strength (minimal 8 karakter)
        if (password.length < 8) {
            return res.status(400).json({
                success: false,
                message: "Password minimal 8 karakter"
            });
        }

        // Cek token
        const tokenData = resetTokenStore[email];
        if (!tokenData || tokenData.token !== token) {
            return res.status(401).json({
                success: false,
                message: "Token tidak valid"
            });
        }

        // Cek token expired
        if (new Date() > new Date(tokenData.expiry)) {
            delete resetTokenStore[email];
            return res.status(401).json({
                success: false,
                message: "Token sudah kadaluarsa, ulangi dari tahap 1"
            });
        }

        // Hash password baru
        const saltRounds = 10;
        bcrypt.hash(password, saltRounds, (err, hashedPassword) => {
            if (err) {
                return res.status(500).json({
                    success: false,
                    message: "Gagal melakukan hash password"
                });
            }

            // Update password di database
            const userId = tokenData.userId;
            ForgotPasswordModel.updatePasswordAndClearOTP(userId, hashedPassword, (err, results) => {
                if (err) {
                    return res.status(500).json({
                        success: false,
                        message: "Gagal update password"
                    });
                }

                // Hapus token dari memory
                delete resetTokenStore[email];

                res.status(200).json({
                    success: true,
                    message: "Password berhasil direset. Silakan login dengan password baru"
                });
            });
        });
    }
};

module.exports = forgotPasswordController;