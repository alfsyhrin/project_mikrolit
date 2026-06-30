const nodemailer = require("nodemailer");

// Baca dari .env
const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

// Verifikasi koneksi email (optional, untuk testing)
transporter.verify((error, success) => {
    if (error) {
        console.log("❌ Email Config Error:", error);
    } else {
        console.log("✅ Email Server Ready!");
    }
});

const emailService = {
    sendOTPEmail: (email, otp, callback) => {
        const mailOptions = {
            from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
            to: email,
            subject: "Kode OTP Reset Password Mikrolit",
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto;">
                    <h2 style="color: #333;">Reset Password Mikrolit</h2>
                    <p>Anda telah meminta reset password. Gunakan kode OTP berikut:</p>
                    
                    <div style="background-color: #f0f0f0; padding: 20px; text-align: center; margin: 20px 0; border-radius: 5px;">
                        <h1 style="color: #007bff; letter-spacing: 5px; margin: 0;">${otp}</h1>
                    </div>
                    
                    <p style="color: #666;">Kode OTP ini berlaku selama <strong>${process.env.EMAIL_OTP_EXPIRY || 10} menit</strong>.</p>
                    <p style="color: #666;">Jika Anda tidak melakukan request ini, abaikan email ini.</p>
                    
                    <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
                    <p style="font-size: 12px; color: #999;">© 2026 Mikrolit LMS. All rights reserved.</p>
                </div>
            `
        };

        transporter.sendMail(mailOptions, callback);
    }
};

module.exports = emailService;