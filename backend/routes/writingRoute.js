const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const upload = require("../middleware/upload");

const {
    createTask,
    getTaskByModule,
    submitWriting,
    gradeSubmission
} = require("../controllers/writingController");
const { getTaskByModule } = require("../models/Writing");

router.post("/task", auth, uploadTask.single("attachment"), createTask);
router.get("/module/:moduleId", auth, getTaskByModule);
router.get("/tasks", auth, getTaskByModule);
router.post("/submit", auth, upload.task.single("file"), submitWriting);
router.post("/grade/:submissionId", auth, gradeSubmission);

module.exports = router;