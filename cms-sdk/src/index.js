const { Container } = require('./ioc/container');
const { PluginRegistry } = require('./plugins/registry');
const { validatePage, validateNode, ValidationError } = require('./validation/validator');
const { HTMLRenderer } = require('./renderers/html');
const { JSONRenderer } = require('./renderers/json');
const { registerBuiltins } = require('./plugins/builtins');
const { compose } = require('./middleware/compose');
const { localeResolver } = require('./middleware/locale');
const { featureFlagGate } = require('./middleware/flags');
const { abBucket } = require('./middleware/abtest');

module.exports = {
  Container,
  PluginRegistry,
  validatePage,
  validateNode,
  ValidationError,
  HTMLRenderer,
  JSONRenderer,
  registerBuiltins,
  compose,
  localeResolver,
  featureFlagGate,
  abBucket,
};
