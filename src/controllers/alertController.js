const pool = require("../config/database");

exports.createAlert = async (req, res) => {
    const { user_id, type, message } = req.body;

    if (!user_id || !type || !message) {
        return res.status(400).json({ error: "user_id, type, and message are required" });
    }

    try {
        const userCheck = await pool.query("SELECT * FROM users WHERE id = $1", [user_id]);
        if (userCheck.rows.length === 0) {
            return res.status(404).json({ error: "User not found" });
        }

        const result = await pool.query(
            "INSERT INTO alerts (user_id, type, message) VALUES ($1, $2, $3) RETURNING *",
            [user_id, type, message]
        );

        res.status(201).json({
            message: "Alert created successfully!",
            alert: result.rows[0],
        });

    } catch (err) {
        console.error("Error creating alert:", err.message);
        res.status(500).json({ error: "Failed to create alert", details: err.message });
    }
};

exports.getAllAlerts = async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM alerts");

        res.status(200).json({
            message: "Alerts fetched successfully!",
            alerts: result.rows,
        });

    } catch (err) {
        console.error("Error fetching alerts:", err.message);
        res.status(500).json({ error: "Failed to fetch alerts" });
    }
};

exports.deleteAlertById = async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query("DELETE FROM alerts WHERE id = $1 RETURNING *", [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Alert not found" });
        }

        res.status(200).json({
            message: "Alert deleted successfully!",
            alert: result.rows[0],
        });

    } catch (err) {
        console.error("Error deleting alert:", err.message);
        res.status(500).json({ error: "Failed to delete alert" });
    }
};

exports.updateAlertById = async (req, res) => {
    const { id } = req.params;
    const { type, message } = req.body;

    if (!type && !message) {
        return res.status(400).json({ error: "At least one of type or message must be provided for update" });
    }

    try {
        // Check if the alert exists
        const existingAlert = await pool.query("SELECT * FROM alerts WHERE id = $1", [id]);
        if (existingAlert.rows.length === 0) {
            return res.status(404).json({ error: "Alert not found" });
        }

        // Update the alert
        const updatedAlert = await pool.query(
            `UPDATE alerts 
             SET type = COALESCE($1, type), 
                 message = COALESCE($2, message),
                 created_at = CURRENT_TIMESTAMP
             WHERE id = $3 RETURNING *`,
            [type, message, id]
        );

        res.status(200).json({
            message: "Alert updated successfully!",
            alert: updatedAlert.rows[0],
        });

    } catch (err) {
        console.error("Error updating alert:", err.message);
        res.status(500).json({ error: "Failed to update alert", details: err.message });
    }
};

