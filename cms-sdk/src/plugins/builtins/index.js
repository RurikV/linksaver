const { TextBlock } = require('./text');
const { Image } = require('./image');
const { List } = require('./list');
const { Container } = require('./container');

function registerBuiltins(registry) {
  registry.register(Container);
  registry.register(TextBlock);
  registry.register(Image);
  registry.register(List);
  return registry;
}

module.exports = { TextBlock, Image, List, Container, registerBuiltins };
