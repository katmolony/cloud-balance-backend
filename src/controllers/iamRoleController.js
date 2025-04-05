const pool = require("../config/database");

exports.saveIamRole = async (req, res) => {
    const { user_id, role_arn, external_id } = req.body;
    if (!user_id || !role_arn) {
        return res.status(400).json({ error: "user_id and role_arn are required" });
    }

    try {
        const result = await pool.query(
            "INSERT INTO iam_roles (user_id, role_arn, external_id) VALUES ($1, $2, $3) RETURNING *",
            [user_id, role_arn, external_id || null]
        );
        res.status(201).json({ message: "IAM Role saved!", iamRole: result.rows[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to save IAM Role", details: err.message });
    }
};

exports.getIamRoleByUserId = async (req, res) => {
    const { user_id } = req.params;
    try {
        const result = await pool.query("SELECT * FROM iam_roles WHERE user_id = $1", [user_id]);
        if (result.rows.length === 0) return res.status(404).json({ error: "IAM Role not found for user" });

        res.status(200).json({ iamRole: result.rows[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch IAM Role", details: err.message });
    }
};
