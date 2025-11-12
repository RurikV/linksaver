const { v4: uuid } = require("uuid");
const mongoose = require("mongoose");

mongoose.Promise = global.Promise;

const linkSchema = new mongoose.Schema(
  {
    linkId: {
      type: String,
      required: "Please provide a link Id",
      default: uuid,
    },
    url: {
      type: String,
      required: "Please provide a url",
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
    tags: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "Tag",
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Link", linkSchema);
