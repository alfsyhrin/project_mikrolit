const express = require("express");
const router = express.Router();
const { login } = require("../controllers/authController");
const { logout } = require("../controllers/authController");

router.post("/login", login);
router.post("/logout", logout);
router.get("/", (req, res) => {
    res.send("API Autentikasi Aktif");
})


module.exports = router;
