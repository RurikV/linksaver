const { Container } = require('cms-sdk');
const { InMemoryPagesRepository } = require('./repos/pages.memory');

function buildContainer() {
  const c = new Container();
  // repositories
  c.register(
    'PagesRepository',
    () => {
      const uri = process.env.CMS_MONGODB_URI;
      const dbName = process.env.CMS_DB_NAME || 'linksaver';
      if (uri) {
        // Lazy-load to avoid requiring mongodb in test envs when not needed
        // eslint-disable-next-line global-require
        const { MongoPagesRepository } = require('./repos/pages.mongo');
        return new MongoPagesRepository({ uri, dbName });
      }
      return new InMemoryPagesRepository();
    },
    { singleton: true }
  );
  return c;
}

module.exports = { buildContainer };
