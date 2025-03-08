const chai = require("chai");
const chaiHttp = require("chai-http");
const app = require("../src/index"); // ✅ Ensure this is correctly pointing to Express app

// ✅ Correctly configure chai-http
chai.use(chaiHttp);
const { expect } = chai;

describe("User API Routes", () => {

  it("should return API status", async () => {
    const res = await chai.request(app).get("/"); // ✅ FIXED
    expect(res).to.have.status(200);
    expect(res.body).to.have.property("message").equal("Cloud Balance API is running!");
  });

  it("should fetch all users", async () => {
    const res = await chai.request(app).get("/api/users"); // ✅ FIXED
    expect(res).to.have.status(200);
    expect(res.body).to.have.property("message").equal("Fetching all users...");
  });

  it("should create a new user", async () => {
    const res = await chai.request(app)
      .post("/api/users")
      .send({ name: "Test User", email: "test@example.com" });

    expect(res).to.have.status(201);
    expect(res.body).to.have.property("message").equal("User created successfully!");
    expect(res.body.user).to.have.property("name").equal("Test User");
  });

});
