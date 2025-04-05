const express = require("express");
const { fetchAwsDataForUser } = require("../controllers/awsFetchController");

const router = express.Router();

router.post("/fetch/:user_id", fetchAwsDataForUser);

module.exports = router;
