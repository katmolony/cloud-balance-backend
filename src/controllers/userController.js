const pool = require("../config/database");

exports.createUser = async (req, res) => {
    const { name, email } = req.body;

    if (!name || !email) {
        return res.status(400).json({ error: "Name and email are required" });
    }

    try {
        const result = await pool.query(
            "INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *",
            [name, email]
        );
        res.status(201).json({
            message: "User created successfully!",
            user: result.rows[0],
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to create user" });
    }
};
