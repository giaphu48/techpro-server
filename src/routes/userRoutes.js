const express = require("express");
const { registerUser, loginUser, getAllUsers, deleteAllUser } = require("../controllers/userController");

const router = express.Router();

router.post("/", registerUser);
router.post("/login", loginUser);
router.get("/", getAllUsers);
router.delete("/", deleteAllUser);

module.exports = router;
