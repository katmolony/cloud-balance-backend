const pool = require("../../src/config/database");

module.exports = async () => {
    try {
        await pool.query("DROP TABLE IF EXISTS resources");
        await pool.query("DROP TABLE IF EXISTS users");
        console.log("All tables dropped after all tests.");
    } catch (error) {
        console.error("Failed to drop tables after all tests.", error);
    }
};
