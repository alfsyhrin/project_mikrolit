const express = require("express");
const router = express.Router();
const { getUsers, updateUsers } = require("../controllers/userController");

router.get("/users", getUsers);
router.post("/users/:id/status", updateUsers);

module.exports = router;