const chai = require("chai");
const chaiHttp = require("chai-http");
const app = require("../src/index");
const pool = require("../src/config/database");

chai.use(chaiHttp);
const { expect } = chai;

describe("Resource API Routes", () => {

    before(async () => {
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

        // Recreate resources table if it doesn't exist
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

        console.log("Users and Resources tables are ready for tests.");
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

    it("should fetch all resources", async () => {
        const email = `unique-${Date.now()}@example.com`;
    
        // Insert a user
        const userResult = await pool.query(
            "INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *",
            ["Resource Owner", email]
        );
    
        // Insert multiple resources for that user
        await pool.query(
            "INSERT INTO resources (user_id, resource_type, resource_id, status) VALUES ($1, $2, $3, $4)",
            [userResult.rows[0].id, "S3", "bucket-123", "active"]
        );
    
        await pool.query(
            "INSERT INTO resources (user_id, resource_type, resource_id, status) VALUES ($1, $2, $3, $4)",
            [userResult.rows[0].id, "EC2", "instance-123", "inactive"]
        );
    
        // Fetch all resources
        const res = await chai.request(app).get("/api/resources");
    
        expect(res).to.have.status(200);
        expect(res.body).to.have.property("message").equal("Resources fetched successfully!");
        expect(res.body.resources).to.be.an("array").that.is.not.empty;
        expect(res.body.resources.length).to.equal(2); // Check if 2 resources are returned
    });
    

    it("should fetch a resource by ID", async () => {
        const email = `unique-${Date.now()}@example.com`;
    
        // Insert a user and resource
        const userResult = await pool.query(
            "INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *",
            ["Resource Owner", email]
        );
    
        const resourceResult = await pool.query(
            "INSERT INTO resources (user_id, resource_type, resource_id, status) VALUES ($1, $2, $3, $4) RETURNING *",
            [userResult.rows[0].id, "Lambda", "lambda-123", "active"]
        );
    
        const res = await chai.request(app).get(`/api/resources/${resourceResult.rows[0].id}`);
    
        expect(res).to.have.status(200);
        expect(res.body).to.have.property("message").equal("Resource fetched successfully!");
        expect(res.body.resource).to.have.property("resource_type").equal("Lambda");
    });
    
    it("should return 404 if trying to fetch a non-existent resource", async () => {
        const res = await chai.request(app).get(`/api/resources/999`);
        expect(res).to.have.status(404);
        expect(res.body).to.have.property("error").equal("Resource not found");
    });
    

    it("should delete an existing resource", async () => {
        const email = `unique-${Date.now()}@example.com`;
    
        // Insert a user and resource
        const userResult = await pool.query(
            "INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *",
            ["Resource Owner", email]
        );
    
        const resourceResult = await pool.query(
            "INSERT INTO resources (user_id, resource_type, resource_id, status) VALUES ($1, $2, $3, $4) RETURNING *",
            [userResult.rows[0].id, "Lambda", "lambda-123", "active"]
        );
    
        const res = await chai.request(app).delete(`/api/resources/${resourceResult.rows[0].id}`);
    
        expect(res).to.have.status(200);
        expect(res.body).to.have.property("message").equal("Resource deleted successfully!");
        expect(res.body.resource).to.have.property("resource_type").equal("Lambda");
    });
    
    it("should return 404 if trying to delete a non-existent resource", async () => {
        const res = await chai.request(app).delete(`/api/resources/999`);
        expect(res).to.have.status(404);
        expect(res.body).to.have.property("error").equal("Resource not found");
    });
    
});

