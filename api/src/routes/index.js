const { notFound } = require("../handlers/not-found");

const baseRoutes = require("./base");
const authRoutes = require("./auth");
const linksRoutes = require("./links");
const tagsRoutes = require("./tags");

module.exports = (app) => {
  app.use("/", baseRoutes);
  app.use("/auth", authRoutes);
  app.use("/links", linksRoutes);
  app.use("/tags", tagsRoutes);

  // 404 fallback if nothing catches above
  app.use(notFound);
};
