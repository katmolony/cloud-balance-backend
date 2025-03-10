const express = require("express");
const { createUser } = require("../controllers/userController");

const router = express.Router();

// Create User Endpoint
router.post("/", createUser);

module.exports = router;