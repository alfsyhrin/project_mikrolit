const express = require("express");
const router = express.Router();
const { login } = require("../controllers/authController");

router.post("/login", login);
router.get("/", (req, res) => {
    res.send("API Autentikasi Aktif");
})
module.exports = router;
