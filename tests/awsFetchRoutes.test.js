// tests/awsFetchRoutes.test.js
const chai = require("chai");
const chaiHttp = require("chai-http");
const sinon = require("sinon");
const { expect } = chai;
const app = require("../src/index"); // adjust if needed
const { LambdaClient, InvokeCommand } = require("@aws-sdk/client-lambda");
const pool = require("../src/config/database");

chai.use(chaiHttp);

describe("AWS Fetch API", () => {
  let lambdaStub;
  const testUserId = 9999;
  const testRoleArn = "arn:aws:iam::123456789012:role/test-role";

  before(async () => {
    // Insert test user and IAM role
    await pool.query(
      `INSERT INTO users (id, name, email) VALUES ($1, $2, $3)`,
      [testUserId, "Test User", "testfetch@example.com"]
    );
    await pool.query(
      `INSERT INTO iam_roles (user_id, role_arn) VALUES ($1, $2)`,
      [testUserId, testRoleArn]
    );

    // Stub Lambda invocation
    lambdaStub = sinon.stub(LambdaClient.prototype, "send").resolves({
      StatusCode: 200,
      Payload: Buffer.from(
        JSON.stringify({
          body: JSON.stringify({
            user_id: testUserId,
            cost: [
              {
                TimePeriod: { Start: "2025-04-01", End: "2025-04-02" },
                Total: { UnblendedCost: { Amount: "7.77" } },
              },
            ],
            ec2_instances: [
              {
                Instances: [
                  {
                    InstanceId: "i-abc123",
                    Tags: [{ Key: "Env", Value: "Test" }],
                  },
                ],
              },
            ],
          }),
        })
      ),
    });
  });

  after(async () => {
    lambdaStub.restore();
    await pool.query("DELETE FROM aws_costs WHERE user_id = $1", [testUserId]);
    await pool.query("DELETE FROM aws_resources WHERE user_id = $1", [testUserId]);
    await pool.query("DELETE FROM iam_roles WHERE user_id = $1", [testUserId]);
    await pool.query("DELETE FROM users WHERE id = $1", [testUserId]);
  });

  it("should invoke Lambda and store AWS data", async () => {
    const res = await chai
      .request(app)
      .post(`/api/aws/fetch/${testUserId}`)
      .send({ role_arn: testRoleArn });

    expect(res.status).to.equal(200);
    expect(res.body.message).to.include("Lambda invoked");

    const costCheck = await pool.query("SELECT * FROM aws_costs WHERE user_id = $1", [testUserId]);
    const resourceCheck = await pool.query("SELECT * FROM aws_resources WHERE user_id = $1", [testUserId]);

    expect(costCheck.rows.length).to.be.above(0);
    expect(resourceCheck.rows.length).to.be.above(0);
  });
});
