const mongoose = require("mongoose");

mongoose.Promise = global.Promise;

const tokenSchema = new mongoose.Schema({
  token: {
    type: String,
    required: "Please provide a token",
  },
  user: {
    type: mongoose.Schema.ObjectId,
    required: "Please provide a user",
    ref: "User",
  },
  createdAt: {
    type: Date,
    required: true,
    default: Date.now,
  },
});

tokenSchema.index(
  {
    createdAt: 1,
  },
  {
    expireAfterSeconds: 43200, // 12 hours
  }
);

module.exports = mongoose.model("Token", tokenSchema);
