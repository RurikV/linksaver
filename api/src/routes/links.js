const express = require("express");

const {
  addLink,
  getLinks,
  updateLink,
  deleteLink,
} = require("../handlers/links");
const { validation } = require("../handlers/validation");
const response = require("../utils/response");

const router = express.Router();

router.post("/", response(validation), response(addLink));
router.get("/", response(validation), response(getLinks));
router.put("/:linkId", response(validation), response(updateLink));
router.delete("/:linkId", response(validation), response(deleteLink));

module.exports = router;
