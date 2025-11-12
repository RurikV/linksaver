const express = require("express");

const router = express.Router();

router.get("/", (req, res) => {
  // Used for health check
  res.status(200).send();
});

module.exports = router;
