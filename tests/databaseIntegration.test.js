const chai = require("chai");
const pool = require("../src/config/database");
const { expect } = chai;

describe("Database Integration Tests", () => {
    it("should successfully connect to the database", async () => {
        const result = await pool.query("SELECT NOW()");
        expect(result.rows.length).to.be.greaterThan(0);
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

    after(async () => {
        try {
            // Drop dependent tables first
            await pool.query("DROP TABLE IF EXISTS resources");
            await pool.query("DROP TABLE IF EXISTS users");
            console.log("✅ Tables dropped successfully after tests.");
        } catch (error) {
            console.error("❌ Failed to drop tables after tests.", error);
        }
    });
});

