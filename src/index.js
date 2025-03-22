require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const serverless = require("aws-serverless-express");
const { Pool } = require("pg");

const app = express();
const basePath = process.env.BASE_PATH || "/";

const isProduction = process.env.NODE_ENV === "production";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: isProduction ? { rejectUnauthorized: false } : false,
});

console.log("SSL Mode:", isProduction ? "ENABLED" : "DISABLED");

console.log("DATABASE_URL:", process.env.DATABASE_URL);

// Middleware
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());

// Initialize Database Tables with Retry
const initializeDatabase = async () => {
  let retries = 5;
  while (retries) {
    try {
      await pool.query("SELECT 1");
      console.log("✅ Database connected successfully");
      await pool.query(`
        CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          email VARCHAR(255) UNIQUE NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);
      await pool.query(`
        CREATE TABLE IF NOT EXISTS resources (
          id SERIAL PRIMARY KEY,
          user_id INT NOT NULL,
          resource_type VARCHAR(255) NOT NULL,
          resource_id VARCHAR(255) UNIQUE NOT NULL,
          status VARCHAR(50),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id)
        );
      `);
      await pool.query(`
        CREATE TABLE IF NOT EXISTS alerts (
          id SERIAL PRIMARY KEY,
          user_id INT NOT NULL,
          type VARCHAR(50),
          message TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id)
        );
      `);
      console.log("✅ Tables are initialized or already exist!");
      break;
    } catch (error) {
      console.error("❌ Error initializing database:", error);
      retries -= 1;
      console.log(`Retries left: ${retries}`);
      await new Promise(res => setTimeout(res, 5000));
    }
  }
};

initializeDatabase();

// Attach routes under the base path
const router = express.Router();
const userRoutes = require("./routes/userRoutes");
router.use("/api/users", userRoutes);
const resourceRoutes = require("./routes/resourceRoutes");
router.use("/api/resources", resourceRoutes);
const alertRoutes = require("./routes/alertRoutes");
router.use("/api/alerts", alertRoutes);

// Health Check Route
router.get("/", (req, res) => {
  res.json({ message: "Cloud Balance API is running!" });
});

app.use(basePath, router);

// Serverless handler for AWS Lambda
const server = serverless.createServer(app);
exports.handler = (event, context) => serverless.proxy(server, event, context);

// Local Development (only runs if not in Lambda)
if (require.main === module) {
  const PORT = process.env.PORT || 5001;
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}
