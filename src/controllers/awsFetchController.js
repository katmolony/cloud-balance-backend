const { LambdaClient, InvokeCommand } = require("@aws-sdk/client-lambda");

const lambda = new LambdaClient({ region: "us-east-1" }); // Update region if needed

exports.fetchAwsDataForUser = async (req, res) => {
  const { user_id } = req.params;
  const { role_arn, external_id } = req.body;

  if (!role_arn || !user_id) {
    return res.status(400).json({ error: "Missing user_id or role_arn" });
  }

  try {
    const command = new InvokeCommand({
      FunctionName: process.env.FETCH_AWS_DATA_LAMBDA_NAME, // e.g. cloud-balance-fetch
      InvocationType: "RequestResponse",
      Payload: Buffer.from(JSON.stringify({
        user_id,
        role_arn,
        external_id,
      })),
    });

    const response = await lambda.send(command);

    const payload = JSON.parse(Buffer.from(response.Payload).toString());

    if (response.StatusCode === 200) {
      return res.status(200).json({
        message: "Lambda invoked successfully",
        lambda_result: JSON.parse(payload.body),
      });
    } else {
      return res.status(500).json({
        error: "Lambda invocation failed",
        lambda_output: payload,
      });
    }
  } catch (err) {
    console.error("Error invoking Lambda:", err);
    return res.status(500).json({ error: "Failed to trigger Lambda", details: err.message });
  }
};
