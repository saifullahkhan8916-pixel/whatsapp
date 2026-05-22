const express = require("express");
const router = express.Router();
const {
  getOrCreateConversation,
  getConversations,
  getMessages,
  sendMessage,
} = require("../controller/conversation.controller");
const { protect } = require("../middleware/auth.middleware");

router.post("/", protect, getOrCreateConversation);
router.get("/", protect, getConversations);
router.get("/:id/messages", protect, getMessages);
router.post("/:id/messages", protect, sendMessage);

module.exports = router;
