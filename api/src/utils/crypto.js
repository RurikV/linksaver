const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
require("dotenv/config");

const salt = bcrypt.genSaltSync(12);

// Generate a hash for a password
exports.generateHash = (password) => {
  const hashedPassword = bcrypt.hashSync(password, salt);
  return hashedPassword;
};

// Generate a JWT token
exports.generateToken = (user) => {
  const token = jwt.sign(
    {
      userId: user.userId,
      email: user.email,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: 60 * 60 * 24 * 7, // 7 days
    }
  );

  return token;
};

// Verify a JWT token
exports.verifyToken = async (token) => {
  return new Promise((resolve, reject) =>
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) =>
      err ? reject(err) : resolve(decoded)
    )
  );
};

// Generate a random hash for email validation
exports.generateCryptoToken = () => crypto.randomBytes(32).toString("hex");
