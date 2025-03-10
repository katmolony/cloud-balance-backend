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

exports.getAllUsers = async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM users");
        res.status(200).json({
            message: "Users fetched successfully!",
            users: result.rows,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch users" });
    }
};

exports.getUserById = async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query("SELECT * FROM users WHERE id = $1", [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "User not found" });
        }

        res.status(200).json({
            message: "User fetched successfully!",
            user: result.rows[0],
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch user" });
    }
};
