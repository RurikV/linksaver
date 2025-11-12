const { v4: uuid } = require("uuid");
const mongoose = require("mongoose");

mongoose.Promise = global.Promise;

const tagSchema = new mongoose.Schema(
  {
    tagId: {
      type: String,
      required: "Please provide a tag Id",
      default: uuid,
    },
    title: {
      type: String,
      required: "Please provide a title",
    },
    user: {
      type: mongoose.Schema.ObjectId,
      required: "Please provide a user",
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Tag", tagSchema);
