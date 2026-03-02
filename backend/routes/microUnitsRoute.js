const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const upload = require("../middleware/upload");

const {
    createUnit,
    getUnitsByModule,
    getUnitDetail,
    updateUnit,
    deleteUnit
} = require("../controllers/microUnitController");

router.post("/micro-units", auth, upload.modules.single("attachment"), createUnit);
router.get("/module/:moduleId", auth, getUnitsByModule);
router.get("/:unitId", auth, getUnitDetail);
router.put("/:unitId", auth, upload.single("attachment"), updateUnit);
router.delete("/:unitId", auth, deleteUnit);

module.exports = router;