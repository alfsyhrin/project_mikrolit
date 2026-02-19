const userModel = require("../models/UserModel");
const bcrypt = require("bcryptjs");

exports.register = (req, res) => {
    console.log("Data yang diterima:", req.body); // Debugging: cek data yang diterima
    const {name, email, password, role, nidn} = req.body;

    userModel.findByEmail(email, (err, results) => {
        if (err) {
            console.log("Error saat mencari email:", err);
            return res.status(500).json({ message: "Server error" });
        }

        if (results.length > 0) {
            return res.status(400).json({message: "Email sudah terdaftar"});
        }

        const hashPassword = bcrypt.hashSync(password, 10);

        const newUser = {
            name,
            email,
            password: hashPassword,
            role : "mahasiswa",
            status : "pending",
            nidn
        };

        userModel.createUser(newUser, (err, result) => {
            if (err) {
                console.log("Error saat membuat user:", err);
                return res.status(500).json({ message: "Server error" });
            }

            res.json({ message: "Registrasi berhasil" });
        });
    });
}