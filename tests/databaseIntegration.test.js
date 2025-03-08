const chai = require("chai");
const pool = require("../src/config/database"); // Ensure this is your database config
const { expect } = chai;

describe("Database Integration Tests", () => {

  before(async () => {
    await pool.query(`CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(100) UNIQUE NOT NULL
    )`);
  });

  after(async () => {
    await pool.query("DROP TABLE IF EXISTS users");
  });

  it("should insert a new user into the database", async () => {
    const result = await pool.query(
      "INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *",
      ["Test User", "test@example.com"]
    );
    expect(result.rows[0]).to.have.property("id");
    expect(result.rows[0].name).to.equal("Test User");
  });

  it("should retrieve all users from the database", async () => {
    const result = await pool.query("SELECT * FROM users");
    expect(result.rows.length).to.be.greaterThan(0);
  });

});
