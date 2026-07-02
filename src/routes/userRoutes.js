const express = require("express");
const { registerUser, loginUser, getAllUsers, deleteAllUser, toggleFavorite, getFavorites } = require("../controllers/userController");
const { protect } = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/", registerUser);
router.post("/login", loginUser);
router.get("/", getAllUsers);
router.delete("/", deleteAllUser);

router.post("/favorites", protect, toggleFavorite);
router.get("/favorites", protect, getFavorites);

module.exports = router;
