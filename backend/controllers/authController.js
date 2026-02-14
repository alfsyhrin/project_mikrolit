const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const UserModel = require("../models/UserModel");


exports.login = (req, res) => {
    const { email, password } = req.body;

    UserModel.findByEmail(email, (err, results) => {
        if (err) return res.status(500).json({ message: "Server error" });

        if (results.length === 0) {
            return res.status(401).json({ message: "User tidak ditemukan" });
        }

        const user = results[0];

        bcrypt.compare(password, user.password, (err, isMatch) => {
            if (!isMatch) {
                return res.status(401).json({ message: "Password salah" });
            }

            const token = jwt.sign(
                { id: user.id, role: user.role },
                process.env.JWT_SECRET,
                { expiresIn: "1h" }
            );

            res.json({
                message: "Login berhasil",
                token,
                role: user.role,
                name: user.name,
                nidn: user.nidn
            });
        });
    });
};

exports.logout = (req, res) => {
    // Untuk logout, cukup hapus token di sisi klien
    res.json({ message: "Logout berhasil" });

}
