const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");

const {
    createReflection,
    getReflectionQuestions,
    submitReflection
} = require("../controllers/reflectController");

router.post("/", auth, createReflection);
router.get("/unit/:unitId", auth, getReflectionQuestions);
router.post("/submit", auth, submitReflection);

module.exports = router;