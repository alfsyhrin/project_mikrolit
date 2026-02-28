const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const UserModel = require("../models/UserModel");

exports.login = (req, res) => {
    const { email, nidn, password } = req.body;

    // ✅ Validasi: minimal ada email atau nidn
    if (!password) {
        return res.status(400).json({ message: "Password harus diisi" });
    }

    if (!email && !nidn) {
        return res.status(400).json({ message: "Email atau NIDN harus diisi" });
    }

    // ✅ Jika email ada, cari berdasarkan email
    if (email) {
        UserModel.findByEmail(email, (err, results) => {
            if (err) return res.status(500).json({ message: "Server error" });

            if (results.length === 0) {
                return res.status(401).json({ message: "Email tidak ditemukan" });
            }

            authenticateUser(results[0], password, res);
        });
    }
    // ✅ Jika nidn ada, cari berdasarkan nidn
    else if (nidn) {
        UserModel.findByNidn(nidn, (err, results) => {
            if (err) return res.status(500).json({ message: "Server error" });

            if (results.length === 0) {
                return res.status(401).json({ message: "NIDN tidak ditemukan" });
            }

            authenticateUser(results[0], password, res);
        });
    }
};

// ✅ TAMBAHKAN FUNGSI INI (helper function)
function authenticateUser(user, password, res) {
    bcrypt.compare(password, user.password, (err, isMatch) => {
        if (err) {
            return res.status(500).json({ message: "Server error" });
        }

        if (!isMatch) {
            return res.status(401).json({ message: "Password salah" });
        }

        // ✅ Generate token dengan data lengkap
        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role, nidn: user.nidn },
            process.env.JWT_SECRET || "secret",
            { expiresIn: "1h" }
        );

        res.json({
            message: "Login berhasil",
            token,
            id: user.id,
            role: user.role,
            name: user.name,
            nidn: user.nidn,
            email: user.email
        });
    });
}

exports.logout = (req, res) => {
    res.json({ message: "Logout berhasil" });
};
