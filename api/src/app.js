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
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      // Allow the UI URL
      if (origin === process.env.UI_URL) return callback(null, true);

      // Allow localhost for development
      if (origin.startsWith('http://localhost:')) return callback(null, true);

      // Allow 127.0.0.1 for development
      if (origin.startsWith('http://127.0.0.1:')) return callback(null, true);

      callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization", "X-Link-Saver"],
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  })
);

routes(app);

module.exports = app;
