const express = require("express");
const router = express.Router();
const { register } = require("../controllers/registController");

router.post("/register", register);
router.get("/", (req, res) => {
    res.send("API Registrasi Aktif");
});

module.exports = router;