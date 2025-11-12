const mongoose = require("mongoose");
require("dotenv/config");

require("./models/user");
require("./models/token");
require("./models/tag");
require("./models/link");
const db = require("./utils/db");

const app = require("./app");

async function main() {
  await db.connect(process.env.MONGODB_URI);

  // Tell Mongoose to use ES6 promises
  mongoose.Promise = global.Promise;

  app.set("port", process.env.PORT || 7777);

  const port = app.get("port");
  app.listen(port, () => {
    console.log(`Express running on PORT ${port}`);
  });
}

main().catch((err) => {
  console.error(err);
});
