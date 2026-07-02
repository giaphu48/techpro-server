const express = require("express");
const { getChatHistory, sendMessage, clearChatHistory } = require("../controllers/chatController");
const { protect } = require("../middlewares/authMiddleware");

const router = express.Router();

// Tất cả các route chat đều cần đăng nhập
router.use(protect);

// Lấy lịch sử chat của user hiện tại
router.get("/", getChatHistory);

// Gửi tin nhắn mới
router.post("/", sendMessage);

// Làm mới (xóa) cuộc trò chuyện
router.delete("/", clearChatHistory);

module.exports = router;
