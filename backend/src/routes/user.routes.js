const express = require("express");
const router = express.Router();
const { searchUsers, getAllUsers } = require("../controller/user.controller");
const { protect } = require("../middleware/auth.middleware");

router.get("/", protect, getAllUsers);
router.get("/search", protect, searchUsers);

module.exports = router;
