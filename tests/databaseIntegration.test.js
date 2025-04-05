const chai = require("chai");
const pool = require("../src/config/database");
const { expect } = chai;

describe("Database Integration Tests", () => {
    
    // Build users tables before tests run
    before(async () => {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                email VARCHAR(100) UNIQUE NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log("Users table is ready for integration tests.");
    });

    it("should insert a new user into the database", async () => {
        const result = await pool.query(
            "INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *",
            ["Test User", "testuser@example.com"]
        );
        expect(result.rows[0]).to.have.property("id");
    });

    it("should retrieve all users from the database", async () => {
        const result = await pool.query("SELECT * FROM users");
        expect(result.rows.length).to.be.greaterThan(0);
    });

    // after(async () => {
    //     try {
    //         await pool.query("DROP TABLE IF EXISTS users");
    //         console.log("Users table dropped after integration tests.");
    //     } catch (error) {
    //         console.error("Failed to drop users table after tests.", error);
    //     }
    // });
});
