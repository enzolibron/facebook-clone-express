const express = require("express");
const { register, activateAccount, login } = require("../controllers/user");

const router = express.Router();

router.post("/user/register", register);

router.post("/user/activate", activateAccount);

router.post("/user/login", login);

module.exports = router;
