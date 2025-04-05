const express = require("express");
const { saveIamRole, getIamRoleByUserId } = require("../controllers/iamRoleController");

const router = express.Router();

router.post("/", saveIamRole);
router.get("/:user_id", getIamRoleByUserId);

module.exports = router;
