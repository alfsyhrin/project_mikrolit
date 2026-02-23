const userModel = require("../models/UserModel");
const jwt = require("jsonwebtoken");

exports.getUsers = (req, res) => {
    userModel.getAllUsers((err, results) => {
        if (err) {
            console.log("Error saat mengambil data pengguna", err);
            return res.status(500).json({ message: "Server error" });
        }
        res.status(200).json(results);
    });
}