const express = require("express");
const router = express.Router();

const studentLearningController =
require("../controllers/studentLearningController");

const DiscussionController = require("../controllers/studentDiscussionController");

const authMiddleware =
require("../middleware/authMiddleware");

router.post(
    "/modules/:moduleId/start",
    authMiddleware,
    studentLearningController.startModule
);

router.post(
'/modules/:moduleId/steps/:stepNumber/start',
authMiddleware,
studentLearningController.startStep
);

router.post(
'/modules/:moduleId/steps/:stepNumber/complete',
authMiddleware,
studentLearningController.completeStep
);

router.get(
    "/modules/:moduleId/learn",
    authMiddleware,
    studentLearningController.getModuleLearning
);

router.get(
    "/modules",
    authMiddleware,
    studentLearningController.getStudentModules
);

router.get(
    "/modules/:moduleId/steps",
    authMiddleware,
    studentLearningController.getModuleSteps
);


router.post(
'/modules/:moduleId/steps/:stepNumber/discussion',
authMiddleware,
DiscussionController.submitDiscussion
);

// Tambah route baru ini
router.get(
    "/modules/:moduleId/steps/:stepNumber/detail",
    authMiddleware,
    studentLearningController.getStepDetail
);

// ✅ Endpoint untuk actual file download
router.get(
    "/modules/:moduleId/steps/:stepNumber/download/:resourceType",
    authMiddleware,
    studentLearningController.downloadFile
);

module.exports = router;