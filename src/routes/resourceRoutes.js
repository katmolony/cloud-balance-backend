const express = require("express");
const { createResource } = require("../controllers/resourceController");

const router = express.Router();

// Create Resource
router.post("/", createResource);

module.exports = router;
