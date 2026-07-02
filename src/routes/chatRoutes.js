const express = require("express");
const { handleChat, getUserSessions, getSessionDetails, deleteSession } = require("../controllers/chatController");
const { syncProductsToChroma } = require("../controllers/chromaController");
const { protect } = require("../middlewares/authMiddleware");

const router = express.Router();

// Apply auth protection to all chat routes (including sessions)
router.use(protect);

router.post("/", handleChat);
router.get("/sessions", getUserSessions);
router.get("/sessions/:sessionId", getSessionDetails);
router.delete("/sessions/:sessionId", deleteSession);

router.post("/sync", syncProductsToChroma);

module.exports = router;
