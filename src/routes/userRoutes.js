const express = require("express");
const { registerUser, getAllUsers, deleteAllUser } = require("../controllers/userController");

const router = express.Router();

router.post("/", registerUser);
router.get("/", getAllUsers);
router.delete("/", deleteAllUser);

module.exports = router;
