const { LambdaClient, InvokeCommand } = require("@aws-sdk/client-lambda");
const { Pool } = require("pg");

const lambda = new LambdaClient({ region: "us-east-1" });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
});

console.log("Using Lambda name:", process.env.FETCH_AWS_DATA_LAMBDA_NAME);

exports.fetchAwsDataForUser = async (req, res) => {
  const { user_id } = req.params;
  const { role_arn, external_id } = req.body;

  if (!user_id || !role_arn) {
    console.warn("❗ Missing required params:", { user_id, role_arn });
    return res.status(400).json({ error: "Missing user_id or role_arn" });
  }

  const https = require("https");

exports.handler = async () => {
  return new Promise((resolve, reject) => {
    https.get("https://ipinfo.io/json", (res) => {
      let data = "";
      res.on("data", chunk => data += chunk);
      res.on("end", () => resolve({ body: data }));
    }).on("error", reject);
  });
};


  try {
    console.log("🚀 Invoking Lambda:", process.env.FETCH_AWS_DATA_LAMBDA_NAME);
    const payloadToSend = { user_id, role_arn, external_id };
    console.log("📦 Payload to Lambda:", JSON.stringify(payloadToSend, null, 2));
    console.log("Using Lambda name:", process.env.FETCH_AWS_DATA_LAMBDA_NAME);
    console.log("Payload being sent to fetch lambda:", payloadToSend);


    const command = new InvokeCommand({
      FunctionName: process.env.FETCH_AWS_DATA_LAMBDA_NAME,
      InvocationType: "RequestResponse",
      Payload: Buffer.from(JSON.stringify(payloadToSend)),
    });

    const response = await lambda.send(command);
    console.log("📨 Lambda response received");
    console.log("🔢 Status code:", response.StatusCode);
    console.log("⚠️ FunctionError:", response.FunctionError);

    const rawPayload = Buffer.from(response.Payload).toString();
    console.log("🧾 Raw Payload:", rawPayload);

    if (response.FunctionError) {
      console.error("💥 Lambda function error:", rawPayload);
      return res.status(502).json({ error: "Fetch Lambda error", details: rawPayload });
    }

    let parsedLambdaResponse;
    try {
      parsedLambdaResponse = JSON.parse(rawPayload);
    } catch (parseErr) {
      console.error("🛑 Failed to parse Lambda response:", parseErr);
      return res.status(500).json({ error: "Invalid response from Lambda", rawPayload });
    }

    const parsed = JSON.parse(parsedLambdaResponse.body);
    console.log("✅ Parsed Lambda body:", JSON.stringify(parsed, null, 2));

    // Insert AWS Cost Data
    for (const cost of parsed.cost || []) {
      try {
        console.log("💰 Inserting cost entry:", cost);
        await pool.query(
          `INSERT INTO aws_costs (user_id, service_name, cost, period_start, period_end)
           VALUES ($1, $2, $3, $4, $5)
           ON CONFLICT DO NOTHING`,
          [user_id, "Total", cost.Total.UnblendedCost.Amount, cost.TimePeriod.Start, cost.TimePeriod.End]
        );
      } catch (dbErr) {
        console.error("❌ Error inserting cost into DB:", dbErr);
      }
    }

    // Insert EC2 instances
    for (const reservation of parsed.ec2_instances || []) {
      for (const instance of reservation.Instances || []) {
        try {
          console.log("🖥️ Inserting EC2 instance:", instance.InstanceId);
          await pool.query(
            `INSERT INTO aws_resources (user_id, arn, resource_type, tags)
             VALUES ($1, $2, $3, $4)
             ON CONFLICT DO NOTHING`,
            [user_id, instance.InstanceId, "EC2", JSON.stringify(instance.Tags || {})]
          );
        } catch (dbErr) {
          console.error("❌ Error inserting EC2 instance:", dbErr);
        }
      }
    }

    console.log("✅ Lambda completed, data stored.");
    return res.status(200).json({
      message: "Lambda invoked and data saved successfully",
      lambda_result: parsed,
    });

  } catch (err) {
    console.error("💥 Unexpected error invoking Lambda:", {
      message: err.message,
      name: err.name,
      stack: err.stack,
      cause: err.cause,
    });

    return res.status(500).json({
      error: "Failed to fetch or save AWS data",
      details: err.message,
      stack: err.stack,
    });
  }
};
