const chai = require("chai");
const chaiHttp = require("chai-http");
const app = require("../src/index");
const pool = require("../src/config/database");

chai.use(chaiHttp);
const { expect } = chai;

describe("User API Routes", () => {

    // Ensure the users table exists before tests start
    before(async () => {
        try {
            await pool.query(`
                CREATE TABLE IF NOT EXISTS users (
                    id SERIAL PRIMARY KEY,
                    name VARCHAR(100) NOT NULL,
                    email VARCHAR(100) UNIQUE NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
            `);
            console.log("✅ Users table is ready for tests.");
        } catch (error) {
            console.error("❌ Failed to create 'users' table", error);
            throw error;
        }
    });

    // Clean up the users table before each test
    beforeEach(async () => {
        await pool.query("DELETE FROM users");
    });

    // Test for creating a new user
    it("should create a new user", async () => {
        const res = await chai.request(app).post("/api/users").send({
            name: "Test User",
            email: "test@example.com",
        });

        expect(res).to.have.status(201);
        expect(res.body).to.have.property("message").equal("User created successfully!");
        expect(res.body.user).to.have.property("name").equal("Test User");
        expect(res.body.user).to.have.property("email").equal("test@example.com");
    });

    // Test for fetching all users
    it("should fetch all users", async () => {
        await pool.query("INSERT INTO users (name, email) VALUES ($1, $2)", ["Jane Doe", "jane@example.com"]);

        const res = await chai.request(app).get("/api/users");

        expect(res).to.have.status(200);
        expect(res.body).to.have.property("message").equal("Users fetched successfully!");
        expect(res.body.users).to.be.an("array").that.is.not.empty;
        expect(res.body.users[0]).to.have.property("name").equal("Jane Doe");
    });

});
