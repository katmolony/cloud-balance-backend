require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const serverless = require("aws-serverless-express");

const app = express();

// Middleware
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());

// Attach routes under the base path
const basePath = process.env.BASE_PATH || "/";
const router = express.Router();

// User Routes
const userRoutes = require("./routes/userRoutes");
router.use("/api/users", userRoutes);

// Resource Routes
const resourceRoutes = require("./routes/resourceRoutes");
router.use("/api/resources", resourceRoutes);

// Alert Routes
const alertRoutes = require("./routes/alertRoutes");
router.use("/api/alerts", alertRoutes);

// Health Check Route
router.get("/", (req, res) => {
  res.json({ message: "Cloud Balance API is running!" });
});

// Attach router to the base path
app.use(basePath, router);

// Serverless handler for AWS Lambda
const server = serverless.createServer(app);

exports.handler = (event, context) => {
  return serverless.proxy(server, event, context);
};

// Local Development (only runs if not in Lambda)
if (require.main === module) {
  const PORT = process.env.PORT || 5001;
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}
