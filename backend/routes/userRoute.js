const express = require("express");
const router = express.Router();
const { getUsers, updateUsers } = require("../controllers/userController");
const authMiddleware = require("../middleware/authMiddleware");

router.get("/users", authMiddleware,getUsers);
router.post("/users/:id/status", authMiddleware, updateUsers);

module.exports = router;