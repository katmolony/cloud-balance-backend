const chai = require("chai");
const chaiHttp = require("chai-http");
const app = require("../src/index");
const pool = require("../src/config/database");

chai.use(chaiHttp);
const { expect } = chai;

describe("Alerts API Routes", () => {
    before(async () => {
        await pool.query("DROP TABLE IF EXISTS alerts CASCADE");
     // Recreate users table if it doesn't exist
        await pool.query(`
                CREATE TABLE IF NOT EXISTS users (
                    id SERIAL PRIMARY KEY,
                    name VARCHAR(100) NOT NULL,
                    email VARCHAR(100) UNIQUE NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
            `);

        await pool.query(`
            CREATE TABLE IF NOT EXISTS alerts (
                id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL,
                type VARCHAR(50) NOT NULL CHECK (type IN ('cost', 'security')),
                message TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            );
        `);
        console.log("Alerts table is ready for tests.");
    });

    beforeEach(async () => {
        await pool.query("DELETE FROM alerts");
        await pool.query("DELETE FROM users");
    });

    it("should create a new alert", async () => {
        // Create a user first
        const userResult = await pool.query(
            "INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *",
            ["Alert User", `alert-${Date.now()}@example.com`]
        );

        const res = await chai.request(app).post("/api/alerts").send({
            user_id: userResult.rows[0].id,
            type: "security",
            message: "Security alert triggered!"
        });

        expect(res).to.have.status(201);
        expect(res.body).to.have.property("message").equal("Alert created successfully!");
        expect(res.body.alert).to.have.property("type").equal("security");
    });

    it("should return 404 if user does not exist", async () => {
        const res = await chai.request(app).post("/api/alerts").send({
            user_id: 999,
            type: "cost",
            message: "Cost alert triggered!"
        });

        expect(res).to.have.status(404);
        expect(res.body).to.have.property("error").equal("User not found");
    });

    it("should fetch all alerts", async () => {
        const userResult = await pool.query(
            "INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *",
            ["Alert Owner", `alert-${Date.now()}@example.com`]
        );
    
        await pool.query(
            "INSERT INTO alerts (user_id, type, message) VALUES ($1, $2, $3)",
            [userResult.rows[0].id, "security", "Security alert!"]
        );
    
        const res = await chai.request(app).get("/api/alerts");
    
        expect(res).to.have.status(200);
        expect(res.body).to.have.property("message").equal("Alerts fetched successfully!");
        expect(res.body.alerts).to.be.an("array").that.is.not.empty;
    });
    
    it("should delete an existing alert", async () => {
        const userResult = await pool.query(
            "INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *",
            ["Delete User", `delete-${Date.now()}@example.com`]
        );
    
        const alertResult = await pool.query(
            "INSERT INTO alerts (user_id, type, message) VALUES ($1, $2, $3) RETURNING *",
            [userResult.rows[0].id, "cost", "Cost alert!"]
        );
    
        const res = await chai.request(app).delete(`/api/alerts/${alertResult.rows[0].id}`);
    
        expect(res).to.have.status(200);
        expect(res.body).to.have.property("message").equal("Alert deleted successfully!");
    });
    
    it("should return 404 if trying to delete a non-existent alert", async () => {
        const res = await chai.request(app).delete(`/api/alerts/999`);
        expect(res).to.have.status(404);
        expect(res.body).to.have.property("error").equal("Alert not found");
    });

    it("should update an existing alert", async () => {
        const userResult = await pool.query(
            "INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *",
            ["Update User", `update-${Date.now()}@example.com`]
        );
    
        const alertResult = await pool.query(
            "INSERT INTO alerts (user_id, type, message) VALUES ($1, $2, $3) RETURNING *",
            [userResult.rows[0].id, "cost", "Initial alert"]
        );
    
        const res = await chai.request(app).put(`/api/alerts/${alertResult.rows[0].id}`).send({
            type: "security",
            message: "Updated alert message"
        });
    
        expect(res).to.have.status(200);
        expect(res.body).to.have.property("message").equal("Alert updated successfully!");
        expect(res.body.alert).to.have.property("type").equal("security");
    });
    
    it("should return 404 if trying to update a non-existent alert", async () => {
        const res = await chai.request(app).put(`/api/alerts/999`).send({
            type: "cost",
            message: "This alert does not exist"
        });
    
        expect(res).to.have.status(404);
        expect(res.body).to.have.property("error").equal("Alert not found");
    });
    
    
});
