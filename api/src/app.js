const bodyParser = require("body-parser");
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
require("dotenv/config");

const routes = require("./routes");

const app = express();

// Use helmet for security
app.use(helmet());

// Takes the raw requests and turns them into usable properties on req.body
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(morgan("dev"));

app.use(
  cors({
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization", "X-Link-Saver"],
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  })
);

// Check if the origin is not the same, not the UI url, or if it doesn't have our custom header
app.use((req, res, next) => {
  if (
    req.method !== "OPTIONS" &&
    req.headers["origin"] &&
    req.headers["origin"] !== process.env.UI_URL &&
    !req.headers["x-link-saver"]
  ) {
    return res.status(403).send();
  }
  next();
});

routes(app);

module.exports = app;
