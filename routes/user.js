const express = require("express");
const { register } = require("../controllers/user");

const router = express.Router();

router.post("/user/register", register);

module.exports = router;
