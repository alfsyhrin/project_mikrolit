const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

const {
    createTask,
    getTasksByModule,
    submitWriting,
    gradeSubmission,
    getAllTasks
} = require("../controllers/writingController");

router.get("/", auth, getAllTasks);
router.post("/task", auth, upload.tasks.single("attachment"), createTask);
router.get("/module/:moduleId", auth, getTasksByModule); // FIXED
router.post("/submit", auth, upload.tasks.single("file"), submitWriting);
router.post("/grade/:submissionId", auth, gradeSubmission);

module.exports = router;