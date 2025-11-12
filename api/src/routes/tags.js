const express = require("express");

const { getTags } = require("../handlers/tags");
const { validation } = require("../handlers/validation");
const response = require("../utils/response");

const router = express.Router();

router.get("/", response(validation), response(getTags));

module.exports = router;
