const { notFound } = require("../handlers/not-found");

const baseRoutes = require("./base");
const authRoutes = require("./auth");
const linksRoutes = require("./links");
const tagsRoutes = require("./tags");
const cmsStatsRoutes = require("./cms-stats");
const collectionsRoutes = require("./collections");
const adaptersRoutes = require("./adapters");
const commandsRoutes = require("./commands");
const strategiesRoutes = require("./strategies");
const cmsControllerRoutes = require("./cms-controller");

module.exports = (app) => {
  app.use("/", baseRoutes);
  app.use("/auth", authRoutes);
  app.use("/links", linksRoutes);
  app.use("/tags", tagsRoutes);
  app.use("/cms-stats", cmsStatsRoutes);
  app.use("/collections", collectionsRoutes);
  app.use("/adapters", adaptersRoutes);
  app.use("/commands", commandsRoutes);
  app.use("/strategies", strategiesRoutes);
  app.use("/cms-controller", cmsControllerRoutes);

  // 404 fallback if nothing catches above
  app.use(notFound);
};
