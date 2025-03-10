const express = require("express");
const { createUser, getAllUsers, getUserById, updateUserById, deleteUserById } = require("../controllers/userController");

const router = express.Router();

// Create User
router.post("/", createUser);

// Get All Users
router.get("/", getAllUsers);

// Get User by ID
router.get("/:id", getUserById);

// Update User by ID
router.put("/:id", updateUserById);

// Delete User by ID
router.delete("/:id", deleteUserById);

module.exports = router;
