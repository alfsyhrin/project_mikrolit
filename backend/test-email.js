require("dotenv").config();
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

// Test send
const mailOptions = {
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to: "arraygithub@gmail.com", // Ganti dengan email untuk test
    subject: "Test Email dari Mikrolit",
    text: "Jika Anda menerima email ini, konfigurasi email berhasil!"
};

transporter.sendMail(mailOptions, (err, info) => {
    if (err) {
        console.log("❌ ERROR:", err);
    } else {
        console.log("✅ EMAIL SENT:", info.response);
    }
    process.exit(0);
});