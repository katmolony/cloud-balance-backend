const express = require("express");
const router = express.Router();

// Example GET route
router.get("/", (req, res) => {
  res.json({ message: "Fetching all users..." });
});

// Example POST route
router.post("/", (req, res) => {
  const { name, email } = req.body;
  if (!name || !email) {
    return res.status(400).json({ error: "Name and email are required" });
  }
  res.status(201).json({ message: "User created successfully!", user: { name, email } });
});

// ✅ Export router
module.exports = router;
