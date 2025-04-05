const pool = require("../config/database");

// GET /api/aws/costs/:user_id
exports.getAwsCostsByUserId = async (req, res) => {
  const { user_id } = req.params;

  try {
    const result = await pool.query(
      "SELECT * FROM aws_costs WHERE user_id = $1 ORDER BY period_start DESC",
      [user_id]
    );

    res.status(200).json({
      message: "AWS costs fetched successfully",
      costs: result.rows,
    });
  } catch (err) {
    console.error("Error fetching AWS costs:", err);
    res.status(500).json({ error: "Failed to fetch AWS costs" });
  }
};

// GET /api/aws/resources/:user_id
exports.getAwsResourcesByUserId = async (req, res) => {
  const { user_id } = req.params;

  try {
    const result = await pool.query(
      "SELECT * FROM aws_resources WHERE user_id = $1 ORDER BY last_updated DESC",
      [user_id]
    );

    res.status(200).json({
      message: "AWS resources fetched successfully",
      resources: result.rows,
    });
  } catch (err) {
    console.error("Error fetching AWS resources:", err);
    res.status(500).json({ error: "Failed to fetch AWS resources" });
  }
};
