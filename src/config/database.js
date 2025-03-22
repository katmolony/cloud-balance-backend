const { Pool } = require("pg");
require("dotenv").config();

if (!process.env.DATABASE_URL) {
  console.log("Using test DB connection:", `postgres://${process.env.TEST_DB_USER}@${process.env.TEST_DB_HOST}/${process.env.TEST_DB_NAME}`);
} else {
  console.log("Using DATABASE_URL for production.");
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || `postgres://${process.env.TEST_DB_USER}:${process.env.TEST_DB_PASSWORD}@${process.env.TEST_DB_HOST}:${process.env.TEST_DB_PORT}/${process.env.TEST_DB_NAME}`,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false
});

module.exports = pool;
