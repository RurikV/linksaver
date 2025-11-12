const mongoose = require("mongoose");
require("dotenv/config");

let connection;

const connect = async (connectionURI) => {
  const uri = connectionURI || process.env.MONGODB_URI;
  try {
    return mongoose.connect(uri);
  } catch (error) {
    console.error(error);
  }
};

const disconnect = async () => mongoose.disconnect();

const getConnection = () => connection;

module.exports = {
  connect,
  disconnect,
  getConnection,
};
