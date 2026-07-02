const express = require("express");
const { getChatHistory, sendMessage, clearChatHistory } = require("../controllers/chatController");

const router = express.Router();

// Lấy lịch sử chat của một phiên
router.get("/:sessionId", getChatHistory);

// Gửi tin nhắn mới trong một phiên
router.post("/:sessionId", sendMessage);

// Làm mới (xóa) cuộc trò chuyện
router.delete("/:sessionId", clearChatHistory);

module.exports = router;
