const { register } = require("./register");
const { verify } = require("./verify");
const { login } = require("./login");
const { getUser } = require("./get-user");

module.exports = {
  register,
  verify,
  login,
  getUser,
};
