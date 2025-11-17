const { Container, PluginRegistry, HTMLRenderer, JSONRenderer, registerBuiltins } = require('cms-sdk');
const { MongoPluginsRepository } = require('./repos/plugins.mongo');

function buildContainer() {
  const c = new Container();
  // optional plugin definitions repo
  c.register('PluginDefinitionsRepository', () => {
    const uri = process.env.CMS_MONGODB_URI;
    const dbName = process.env.CMS_DB_NAME || 'linksaver';
    if (uri) return new MongoPluginsRepository({ uri, dbName });
    // default repo returns null (no allowlist restrictions)
    return { listActivePluginIds: async () => null };
  }, { singleton: true });

  c.register('PluginRegistry', (container) => {
    const repo = container.resolve('PluginDefinitionsRepository');
    const registry = new PluginRegistry({ repo });
    registerBuiltins(registry);
    // non-blocking allowlist load
    if (repo && typeof repo.listActivePluginIds === 'function') {
      registry.loadAllowlistFromRepo().catch(() => {});
    }
    return registry;
  }, { singleton: true });

  c.register('HTMLRenderer', (container) => new HTMLRenderer({ registry: container.resolve('PluginRegistry') }), { singleton: true });
  c.register('JSONRenderer', () => new JSONRenderer(), { singleton: true });

  return c;
}

module.exports = { buildContainer };
