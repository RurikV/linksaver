const { Container, PluginRegistry, HTMLRenderer, JSONRenderer, registerBuiltins } = require('cms-sdk');

function buildContainer() {
  const c = new Container();
  c.register('PluginRegistry', () => {
    const registry = new PluginRegistry();
    registerBuiltins(registry);
    return registry;
  }, { singleton: true });

  c.register('HTMLRenderer', (container) => new HTMLRenderer({ registry: container.resolve('PluginRegistry') }), { singleton: true });
  c.register('JSONRenderer', () => new JSONRenderer(), { singleton: true });

  return c;
}

module.exports = { buildContainer };
