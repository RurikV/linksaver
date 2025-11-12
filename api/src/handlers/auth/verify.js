const mongoose = require("mongoose");

const User = mongoose.model("User");
const Token = mongoose.model("Token");

exports.verify = async (req, res) => {
  const { token } = req.params;

  const foundToken = await Token.findOne({ token });

  if (!foundToken) {
    res.status(400).send({ error: "Token has either expired or is invalid." });
    return;
  }

  const user = await User.findOneAndUpdate(
    { _id: foundToken.user },
    { isVerified: true }
  );

  if (!user) {
    res.status(500).send({ error: "Failed to verify user" });
    return;
  }

  res.status(200).send({
    isVerified: true,
  });
};
