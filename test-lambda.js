// test-lambda.js
const { handler } = require("./functions/fetchAwsData");

handler({ user_id: 1 }).then(console.log).catch(console.error);
