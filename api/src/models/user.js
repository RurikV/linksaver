const { v4: uuid } = require("uuid");
const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");

mongoose.Promise = global.Promise;

const userSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: "Please provide a unique user id",
      unique: true,
      default: uuid,
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
      unique: true,
      required: "Please provide an email address",
      validate: {
        validator: (email) => validator.isEmail(email),
        message: "Invalid email provided.",
      },
    },
    password: {
      type: String,
      required: "Please provide a hashed password",
    },
    name: {
      type: String,
      required: "Please provide a name",
    },
    isVerified: {
      type: Boolean,
      required: "Please provide an account verification status",
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.methods.validatePassword = function validatePassword(password) {
  if (!this.password) {
    return false;
  }

  return bcrypt.compareSync(password, this.password);
};

module.exports = mongoose.model("User", userSchema);
