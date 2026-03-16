const express = require("express");
const router = express.Router();

const discussionController = require("../controllers/discussionController");
const authMiddleware = require("../middleware/authMiddleware");

router.get(
 "/all",
 authMiddleware,
 discussionController.getRooms
);

router.get(
 "/rooms/:roomId/messages",
 authMiddleware,
 discussionController.getMessages
);

router.post(
 "/messages",
 authMiddleware,
 discussionController.sendMessage
);

router.post(
 "/:roomId/read",
 authMiddleware,
 discussionController.markAsRead
);

module.exports = router;