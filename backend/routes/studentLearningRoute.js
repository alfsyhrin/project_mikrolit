const express = require("express");
const router = express.Router();

const studentLearningController =
require("../controllers/studentLearningController");

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

module.exports = router;