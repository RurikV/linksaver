const { Container } = require('cms-sdk');
const { InMemoryPagesRepository } = require('./repos/pages.memory');

function buildContainer() {
  const c = new Container();
  // repositories
  c.register('PagesRepository', () => new InMemoryPagesRepository(), { singleton: true });
  return c;
}

module.exports = { buildContainer };
