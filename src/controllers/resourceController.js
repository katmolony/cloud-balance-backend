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
        console.error(err);
        res.status(500).json({ error: "Failed to create resource" });
    }

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
};
