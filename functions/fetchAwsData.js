const AWS = require("aws-sdk");
const { Pool } = require("pg");

// Configure DB connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
});

exports.handler = async (event) => {
  const { user_id } = event;

  try {
    // Step 1: Get IAM Role from DB
    const roleRes = await pool.query("SELECT * FROM iam_roles WHERE user_id = $1", [user_id]);
    if (roleRes.rows.length === 0) {
      return { statusCode: 404, body: JSON.stringify({ error: "IAM Role not found" }) };
    }

    const { role_arn, external_id } = roleRes.rows[0];

    // Step 2: Assume Role via STS
    const sts = new AWS.STS();
    const { Credentials } = await sts.assumeRole({
      RoleArn: role_arn,
      RoleSessionName: `cloud-balance-session-${user_id}`,
      ExternalId: external_id || undefined,
      DurationSeconds: 3600,
    }).promise();

    const creds = {
      accessKeyId: Credentials.AccessKeyId,
      secretAccessKey: Credentials.SecretAccessKey,
      sessionToken: Credentials.SessionToken,
    };

    // Step 3: Fetch Cost Data
    const costExplorer = new AWS.CostExplorer({ region: "us-east-1", ...creds });
    const costData = await costExplorer.getCostAndUsage({
      TimePeriod: {
        Start: "2024-03-01", // TODO: dynamic range?
        End: "2024-03-31"
      },
      Granularity: "MONTHLY",
      Metrics: ["UnblendedCost"],
      GroupBy: [{ Type: "DIMENSION", Key: "SERVICE" }],
    }).promise();

    const costRows = costData.ResultsByTime[0]?.Groups.map(group => ({
      service_name: group.Keys[0],
      cost: parseFloat(group.Metrics.UnblendedCost.Amount),
      currency: group.Metrics.UnblendedCost.Unit,
      period_start: "2024-03-01",
      period_end: "2024-03-31"
    })) || [];

    // Step 4: Fetch Resources
    const tagging = new AWS.ResourceGroupsTaggingAPI({ region: "us-east-1", ...creds });
    const resData = await tagging.getResources({}).promise();

    const resourceRows = resData.ResourceTagMappingList.map(resource => ({
      arn: resource.ResourceARN,
      tags: JSON.stringify(resource.Tags),
      resource_type: resource.ResourceType || null
    }));

    // Step 5: Cache Data in DB
    await pool.query("BEGIN");

    await pool.query("DELETE FROM aws_costs WHERE user_id = $1", [user_id]);
    for (const row of costRows) {
      await pool.query(
        `INSERT INTO aws_costs (user_id, service_name, cost, currency, period_start, period_end)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [user_id, row.service_name, row.cost, row.currency, row.period_start, row.period_end]
      );
    }

    await pool.query("DELETE FROM aws_resources WHERE user_id = $1", [user_id]);
    for (const row of resourceRows) {
      await pool.query(
        `INSERT INTO aws_resources (user_id, arn, tags, resource_type)
         VALUES ($1, $2, $3, $4)`,
        [user_id, row.arn, row.tags, row.resource_type]
      );
    }

    await pool.query("COMMIT");

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "AWS data fetched and cached successfully",
        costs_cached: costRows.length,
        resources_cached: resourceRows.length,
      }),
    };

  } catch (err) {
    await pool.query("ROLLBACK").catch(() => {});
    console.error("❌ Lambda error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to fetch and cache AWS data", details: err.message }),
    };
  }
};
