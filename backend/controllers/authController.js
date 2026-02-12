const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const users = require("../models/User");

exports.login = (req, res) => {
    const { email, password } = req.body;

    const user = users.find(u => u.email === email);

    if (!user) {
        return res.status(401).json({ message: "User tidak ditemukan" });
    }

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
            role: user.role
        });
    });
};
