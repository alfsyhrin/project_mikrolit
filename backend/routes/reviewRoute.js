const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");

const {
    createQuestion,
    createOption,
    getQuiz
} = require("../controllers/reviewController");

router.post("/question", auth, createQuestion);
router.post("/option", auth, createOption);
router.get("/unit/:unitId", auth, getQuiz);

module.exports = router;