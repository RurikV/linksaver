const mongoose = require("mongoose");
require("dotenv").config();

const { parseUser } = require("../utils/parse-user");
const { verifyToken } = require("../utils/crypto");

const User = mongoose.model("User");

exports.validation = async (req, res, next) => {
  const authHeader = req.get("Authorization");

  if (!authHeader) {
    res.status(403).send({
      error: "No authorization header provided.",
    });
    return;
  }

  // Grab the token from the auth header
  const token = authHeader.split(" ")[1];
  if (!token) {
    res.status(403).send({
      error: "No token provided.",
    });
    return;
  }

  try {
    const decoded = await verifyToken(token);
    const foundUser = await User.findOne({ userId: decoded.userId });

    if (!foundUser) {
      res.status(500).send({
        error: "There was a problem finding the provided user.",
      });
      return;
    }

    const user = foundUser.toObject();

    req.user = parseUser(user);
    req.userId = foundUser._id;
    req.token = token;

    next();
  } catch (err) {
    res.status(403).send({
      auth: false,
      error: "Failed to authenticate token.",
    });
  }
};
