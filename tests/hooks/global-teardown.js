const pool = require("../../src/config/database");

module.exports = async () => {
  try {
    // Drop all tables in dependency-safe order with CASCADE
    await pool.query(`
      DROP TABLE IF EXISTS alerts CASCADE;
      DROP TABLE IF EXISTS iam_roles CASCADE;
      DROP TABLE IF EXISTS resources CASCADE;
      DROP TABLE IF EXISTS users CASCADE;
    `);

    console.log("✅ All tables dropped after all tests.");
  } catch (error) {
    console.error("❌ Failed to drop tables after all tests.", error);
  }
};
