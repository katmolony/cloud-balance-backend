const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  user: process.env.TEST_DB_USER,
  host: process.env.TEST_DB_HOST,
  database: process.env.TEST_DB_NAME,
  password: process.env.TEST_DB_PASSWORD,
  port: process.env.TEST_DB_PORT,
});

module.exports = pool;
