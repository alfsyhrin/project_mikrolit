const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");

const { createModule, getModules, getModuleDetail } = require("../controllers/moduleController");

router.post("/modules", auth, createModule);
router.get("/modules", auth, getModules);
router.get("/:id", auth, getModuleDetail);

module.exports = router;