const express = require("express");
const { syncProductsToChroma } = require("../controllers/syncController");

const router = express.Router();

router.post("/", syncProductsToChroma);

module.exports = router;
