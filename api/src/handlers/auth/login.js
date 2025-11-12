const mongoose = require("mongoose");

const { generateToken } = require("../../utils/crypto");
const { parseUser } = require("../../utils/parse-user");

const User = mongoose.model("User");

exports.login = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (!user || !user.validatePassword(password)) {
    res.status(401).send({ error: "Incorrect email or password" });
    return;
  }

  const token = generateToken(user);
  const parsedUser = parseUser(user);

  res.status(200).send({
    token,
    user: parsedUser,
  });
};
