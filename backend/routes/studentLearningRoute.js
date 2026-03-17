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

router.get(
    "/modules/:moduleId/steps/:stepNumber/download",
    authMiddleware,
    studentLearningController.downloadResource
);

router.post(
'/modules/:moduleId/steps/:stepNumber/discussion',
authMiddleware,
DiscussionController.submitDiscussion
);

module.exports = router;