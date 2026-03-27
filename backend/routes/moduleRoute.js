const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const uploadModuleResource = require("../middleware/uploadModuleResource");
const ModuleResourceController = require("../controllers/moduleResourceController");

const { createModule, getModules, getModuleDetail, updateModule, deleteModule } = require("../controllers/moduleController");

router.post("/modules", auth, createModule);
router.get("/modules", auth, getModules);
router.get("/modules/:id", auth, getModuleDetail);
router.post(
  "/module-resources/upload", auth,
  uploadModuleResource.single("file"),
  ModuleResourceController.uploadResource
);
router.put("/modules/:id", auth, updateModule);
router.delete("/modules/:id", auth, deleteModule);

module.exports = router;