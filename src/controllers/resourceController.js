const pool = require("../config/database");

exports.createResource = async (req, res) => {
    const { user_id, resource_type, resource_id, status } = req.body;

    if (!user_id || !resource_type || !resource_id) {
        return res.status(400).json({ error: "user_id, resource_type, and resource_id are required" });
    }

    try {
        const result = await pool.query(
            "INSERT INTO resources (user_id, resource_type, resource_id, status) VALUES ($1, $2, $3, $4) RETURNING *",
            [user_id, resource_type, resource_id, status || 'active']
        );

        res.status(201).json({
            message: "Resource created successfully!",
            resource: result.rows[0],
        });

    } catch (err) {
        console.error("Error creating resource:", err.message);  // Log the exact error message
        res.status(500).json({ error: "Failed to create resource", details: err.message });
    }
};


exports.getAllResources = async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM resources");

        res.status(200).json({
            message: "Resources fetched successfully!",
            resources: result.rows,
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch resources" });
    }
};

exports.getResourceById = async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query("SELECT * FROM resources WHERE id = $1", [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Resource not found" });
        }

        res.status(200).json({
            message: "Resource fetched successfully!",
            resource: result.rows[0],
        });

    } catch (err) {
        console.error("Error fetching resource:", err.message);
        res.status(500).json({ error: "Failed to fetch resource" });
    }
};

exports.deleteResourceById = async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query("DELETE FROM resources WHERE id = $1 RETURNING *", [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Resource not found" });
        }

        res.status(200).json({
            message: "Resource deleted successfully!",
            resource: result.rows[0],
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to delete resource" });
    }
    
};
