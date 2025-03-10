const express = require("express");
const { createUser, getAllUsers, getUserById } = require("../controllers/userController");

const router = express.Router();

// Create User
router.post("/", createUser);

// Get All Users
router.get("/", getAllUsers);

// Get User by ID
router.get("/:id", getUserById);

module.exports = router;
