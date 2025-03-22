const pool = require("../../src/config/database");

module.exports = async () => {
  try {
    // Drop all tables with CASCADE to avoid foreign key issues
    await pool.query("DROP TABLE IF EXISTS alerts, resources, users CASCADE");

    console.log("✅ All tables dropped after all tests.");
  } catch (error) {
    console.error("❌ Failed to drop tables after all tests.", error);
  }
};
