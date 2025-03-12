require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const app = express();

// Middleware
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());

// Register User Routes
const userRoutes = require("./routes/userRoutes");
app.use("/api/users", userRoutes);

const resourceRoutes = require("./routes/resourceRoutes");

// Register Resource Routes
app.use("/api/resources", resourceRoutes);

const alertRoutes = require("./routes/alertRoutes");

// Register Alerts Routes
app.use("/api/alerts", alertRoutes);

// Health Check Route
app.get("/", (req, res) => {
  res.json({ message: "Cloud Balance API is running!" });
});

// Only start the server if it's not in test mode
if (require.main === module) {
  const PORT = process.env.PORT || 5001;
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

module.exports = app;
