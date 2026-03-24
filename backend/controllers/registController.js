const userModel = require("../models/UserModel");
const bcrypt = require("bcryptjs");
const eventBus = require("../events/eventBus");

exports.register = (req, res) => {
    console.log("Data yang diterima:", req.body);
    const { name, email, password, role, nidn } = req.body;

    userModel.findByEmail(email, (err, emailResults) => {
        if (err) {
            console.log("Error saat mencari email:", err);
            return res.status(500).json({ message: "Server error" });
        }

        if (emailResults.length > 0) {
            return res.status(400).json({ message: "Email sudah terdaftar" });
        }

        userModel.findByNidn(nidn, (err, nidnResults) => {
            if (err) {
                console.log("Error saat mencari NIDN:", err);
                return res.status(500).json({ message: "Server error" });
            }

            if (nidnResults.length > 0) {
                return res.status(400).json({ message: "NPM sudah terdaftar" });
            }

            const hashPassword = bcrypt.hashSync(password, 10);

            const newUser = {
                name,
                email,
                password: hashPassword,
                role: "mahasiswa",
                status: "pending",
                nidn
            };

            userModel.createUser(newUser, (err, result) => {
                if (err) {
                    console.log("Error saat membuat user:", err);
                    return res.status(500).json({ message: "Server error" });
                }

                // ✅ PERBAIKAN: Gunakan newUser + result.insertId untuk emit event
                eventBus.emit("user_registered", {
                    id: result.insertId,  // ← Data dari callback result
                    name: newUser.name,
                    email: newUser.email,
                    nidn: newUser.nidn,
                    role: newUser.role,
                    status: newUser.status
                });

                console.log(`✅ User registered: ${newUser.email} - event emitted`);

                res.json({ message: "Registrasi berhasil" });
            });
        });
    });
};