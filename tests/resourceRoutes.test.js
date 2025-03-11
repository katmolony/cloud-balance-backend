const chai = require("chai");
const chaiHttp = require("chai-http");
const app = require("../src/index");
const pool = require("../src/config/database");

chai.use(chaiHttp);
const { expect } = chai;

describe("Resource API Routes", () => {

    before(async () => {
        // ✅ Recreate users table if it doesn't exist
        await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                email VARCHAR(100) UNIQUE NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // ✅ Recreate resources table if it doesn't exist
        await pool.query(`
            CREATE TABLE IF NOT EXISTS resources (
                id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL,
                resource_type VARCHAR(100) NOT NULL,
                resource_id VARCHAR(255) NOT NULL,
                status VARCHAR(50) DEFAULT 'active',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            );
        `);

        console.log("✅ Users and Resources tables are ready for tests.");
    });

    beforeEach(async () => {
        await pool.query("DELETE FROM resources");
        await pool.query("DELETE FROM users");
    });

    it("should create a new resource", async () => {
        const email = `unique-${Date.now()}@example.com`;

        // Insert a user first
        const userResult = await pool.query(
            "INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *",
            ["Resource Owner", email]
        );

        const res = await chai.request(app).post("/api/resources").send({
            user_id: userResult.rows[0].id,
            resource_type: "EC2",
            resource_id: "i-1234567890abcdef0",
            status: "active"
        });

        expect(res).to.have.status(201);
        expect(res.body).to.have.property("message").equal("Resource created successfully!");
        expect(res.body.resource).to.have.property("resource_type").equal("EC2");
    });

});

