const express = require("express");
const { createUser, getAllUsers } = require("../controllers/userController");

const router = express.Router();

// Create User
router.post("/", createUser);

// Get All Users
router.get("/", getAllUsers);

module.exports = router;