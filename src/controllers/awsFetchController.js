const { LambdaClient, InvokeCommand } = require("@aws-sdk/client-lambda");
const { Pool } = require("pg");

const lambda = new LambdaClient({ region: "us-east-1" });
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
});

exports.fetchAwsDataForUser = async (req, res) => {
  const { user_id } = req.params;
  const { role_arn, external_id } = req.body;

  if (!user_id || !role_arn) {
    return res.status(400).json({ error: "Missing user_id or role_arn" });
  }

  try {
    const command = new InvokeCommand({
      FunctionName: process.env.FETCH_AWS_DATA_LAMBDA_NAME,
      InvocationType: "RequestResponse",
      Payload: Buffer.from(JSON.stringify({ user_id, role_arn, external_id })),
    });

    const response = await lambda.send(command);
    const payload = JSON.parse(Buffer.from(response.Payload).toString());
    const parsed = JSON.parse(payload.body);

    // Store AWS Cost Data
    for (const cost of parsed.cost) {
      await pool.query(
        `INSERT INTO aws_costs (user_id, service_name, cost, period_start, period_end)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT DO NOTHING`, // prevent duplicates
        [user_id, "Total", cost.Total.UnblendedCost.Amount, cost.TimePeriod.Start, cost.TimePeriod.End]
      );
    }

    // Store AWS Resources (EC2 Instances)
    for (const reservation of parsed.ec2_instances) {
      for (const instance of reservation.Instances) {
        await pool.query(
          `INSERT INTO aws_resources (user_id, arn, resource_type, tags)
           VALUES ($1, $2, $3, $4)
           ON CONFLICT DO NOTHING`,
          [
            user_id,
            instance.InstanceId,
            "EC2",
            JSON.stringify(instance.Tags || {}),
          ]
        );
      }
    }

    return res.status(200).json({
      message: "Lambda invoked and data saved successfully",
      lambda_result: parsed,
    });
  } catch (err) {
    console.error("Error invoking Lambda:", err);
    return res.status(500).json({ error: "Failed to fetch or save AWS data", details: err.message });
  }
};
