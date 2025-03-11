const express = require("express");
const { createResource, getAllResources, getResourceById, deleteResourceById } = require("../controllers/resourceController");

const router = express.Router();

// Create Resource
router.post("/", createResource);

// Get All Resources
router.get("/", getAllResources);

// Get Resource by ID
router.get("/:id", getResourceById);

// Delete Resource by ID
router.delete("/:id", deleteResourceById);

module.exports = router;
