const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");

const {
    startUnit,
    completeUnit,
    getProgressByModule
} = require("../controllers/progressController");

router.post("/start", auth, startUnit);
router.post("/complete", auth, completeUnit);
router.get("/module/:moduleId", auth, getProgressByModule);

module.exports = router;