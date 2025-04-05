const chai = require("chai");
const chaiHttp = require("chai-http");
const app = require("../src/index");
const pool = require("../src/config/database");

chai.use(chaiHttp);
const { expect } = chai;

describe("IAM Role API", () => {
    let userId;

    before(async () => {
        // Create test user
        const res = await pool.query(`INSERT INTO users (name, email) VALUES ('Test User', 'iamtest@example.com') RETURNING id`);
        userId = res.rows[0].id;
    });

    after(async () => {
        await pool.query("DELETE FROM iam_roles WHERE user_id = $1", [userId]);
        await pool.query("DELETE FROM users WHERE id = $1", [userId]);
    });

    it("should save a new IAM role", async () => {
        const res = await chai.request(app).post("/api/iam-roles").send({
            user_id: userId,
            role_arn: "arn:aws:iam::123456789012:role/CloudBalanceUser",
            external_id: "external-test-id"
        });

        expect(res).to.have.status(201);
        expect(res.body).to.have.property("message").equal("IAM Role saved!");
        expect(res.body.iamRole).to.have.property("role_arn").equal("arn:aws:iam::123456789012:role/CloudBalanceUser");
    });

    it("should fetch IAM role by user_id", async () => {
        const res = await chai.request(app).get(`/api/iam-roles/${userId}`);
        expect(res).to.have.status(200);
        expect(res.body.iamRole).to.have.property("user_id").equal(userId);
    });

    it("should return 404 if no IAM role exists for user", async () => {
        const res = await chai.request(app).get("/api/iam-roles/999999");
        expect(res).to.have.status(404);
        expect(res.body).to.have.property("error").equal("IAM Role not found for user");
    });
});
