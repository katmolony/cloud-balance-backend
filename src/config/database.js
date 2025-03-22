const { Pool } = require("pg");
require("dotenv").config();

const isProduction = process.env.NODE_ENV === "production";
const connectionString = process.env.DATABASE_URL;

const pool = new Pool({
  connectionString: connectionString,
  ssl: isProduction ? { rejectUnauthorized: false } : false,
});

// Debug logs to verify in CloudWatch
console.log("DATABASE_URL:", connectionString);
console.log("SSL Mode:", isProduction ? "ENABLED" : "DISABLED");
console.log("DB Pool Config:", {
  connectionString: connectionString,
  ssl: isProduction ? { rejectUnauthorized: false } : false,
});

module.exports = pool;
