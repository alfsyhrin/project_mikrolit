const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const UserModel = require("../models/UserModel");

exports.login = (req, res) => {
    console.log("🔥 LOGIN HIT");
    console.log("BODY:", req.body);

    const { email, nidn, password } = req.body;

    // ✅ Validasi input
    if (!password) {
        return res.status(400).json({ message: "Password harus diisi" });
    }

    if (!email && !nidn) {
        return res.status(400).json({ message: "Email atau NIDN harus diisi" });
    }

    // 🔍 Helper untuk handle hasil query
    const handleQueryResult = (err, results) => {
        console.log("📦 HASIL QUERY:", results);

        if (err) {
            console.error("❌ DB ERROR:", err);
            return res.status(500).json({ message: "Database error" });
        }

        // ✅ Fix penting: handle undefined/null
        if (!results || results.length === 0) {
            return res.status(401).json({ message: "User tidak ditemukan" });
        }

        const user = results[0];

        console.log("👤 USER DATA:", user);

        // ✅ Validasi field penting
        if (!user.password) {
            console.error("❌ PASSWORD TIDAK ADA DI DB");
            return res.status(500).json({ message: "Data user tidak valid" });
        }

        authenticateUser(user, password, res);
    };

    // 🔄 Pilih query
    if (email) {
        UserModel.findByEmail(email, handleQueryResult);
    } else {
        UserModel.findByNidn(nidn, handleQueryResult);
    }
};

// ✅ AUTH FUNCTION YANG SUDAH AMAN
function authenticateUser(user, password, res) {
    console.log("🔐 AUTH PROCESS");

    if (user.status === "pending") {
        return res.status(403).json({
            message: "Pengguna belum diverifikasi"
        });
    }

    if (user.status === "ditolak") {
        return res.status(403).json({
            message: "Pengguna ditolak"
        });
    }

    bcrypt.compare(password, user.password, (err, isMatch) => {
        if (err) {
            console.error("❌ BCRYPT ERROR:", err);
            return res.status(500).json({ message: "Error saat verifikasi password" });
        }

        console.log("🔑 PASSWORD MATCH:", isMatch);

        if (!isMatch) {
            return res.status(401).json({ message: "Password salah" });
        }

        // ✅ Validasi JWT SECRET
        if (!process.env.JWT_SECRET) {
            console.error("❌ JWT_SECRET TIDAK ADA");
            return res.status(500).json({ message: "Server config error" });
        }

        const token = jwt.sign(
            {
                id: user.id,
                email: user.email,
                role: user.role,
                nidn: user.nidn
            },
            process.env.JWT_SECRET,
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