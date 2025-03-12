const express = require("express");
const { createAlert, getAllAlerts, deleteAlertById, updateAlertById } = require("../controllers/alertController");

const router = express.Router();

// Create Alert
router.post("/", createAlert);

// Get All Alerts
router.get("/", getAllAlerts);

// Update Alert by ID
router.put("/:id", updateAlertById);

// Delete Alert by ID
router.delete("/:id", deleteAlertById);

module.exports = router;
