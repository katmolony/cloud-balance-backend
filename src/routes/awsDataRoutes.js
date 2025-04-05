const express = require("express");
const {
  getAwsCostsByUserId,
  getAwsResourcesByUserId
} = require("../controllers/awsDataController");

const router = express.Router();

router.get("/costs/:user_id", getAwsCostsByUserId);
router.get("/resources/:user_id", getAwsResourcesByUserId);

module.exports = router;
