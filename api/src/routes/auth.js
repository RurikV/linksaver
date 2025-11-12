const express = require("express");

const { getUser, login, register, verify } = require("../handlers/auth");
const { validation } = require("../handlers/validation");
const response = require("../utils/response");

const router = express.Router();

router.get("/", response(validation), response(getUser));
router.post("/register", response(register));
router.post("/login", response(login));
router.put("/verify/:token", response(verify));

module.exports = router;
