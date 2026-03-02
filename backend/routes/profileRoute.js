const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");
const { getProfile, upProfile, upPassword, deletePhoto } = require("../controllers/profileController");

router.get("/profile", authMiddleware, getProfile);
router.put("/profile", authMiddleware, upload.profile.single("photo"), upProfile);
router.put("/profile/password", authMiddleware, upPassword);
router.delete("/profile/photo", authMiddleware, deletePhoto);

module.exports = router;