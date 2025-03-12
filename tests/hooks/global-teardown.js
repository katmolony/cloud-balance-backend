const pool = require("../../src/config/database");

module.exports = async () => {
    try {
        // Drop dependent tables first to avoid foreign key constraint issues
        await pool.query("DROP TABLE IF EXISTS alerts");
        await pool.query("DROP TABLE IF EXISTS resources");
        await pool.query("DROP TABLE IF EXISTS users");
        
        console.log("All tables dropped after all tests.");
    } catch (error) {
        console.error("Failed to drop tables after all tests.", error);
    }
};
