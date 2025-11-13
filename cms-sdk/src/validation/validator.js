const Ajv = require('ajv');
const addFormats = require('ajv-formats');
const { nodeSchema, pageSchema } = require('./schemas');

class ValidationError extends Error {
  constructor(message, details) {
    super(message);
    this.name = 'ValidationError';
    this.details = details || [];
  }
}

function buildAjv() {
  const ajv = new Ajv({
    allErrors: true,
    strict: false,
    removeAdditional: false,
  });
  addFormats(ajv);
  ajv.addSchema(nodeSchema);
  ajv.addSchema(pageSchema);
  return ajv;
}

const ajv = buildAjv();

const validateNodeFn = ajv.getSchema('https://linksaver.dev/cms/node.schema.json');
const validatePageFn = ajv.getSchema('https://linksaver.dev/cms/page.schema.json');

function validateNode(node) {
  const ok = validateNodeFn(node);
  if (!ok) {
    throw new ValidationError('Invalid node', validateNodeFn.errors);
  }
  return true;
}

function validatePage(page) {
  const ok = validatePageFn(page);
  if (!ok) {
    throw new ValidationError('Invalid page', validatePageFn.errors);
  }
  // also validate the root node explicitly to get node-specific error context
  if (page && page.root) validateNode(page.root);
  return true;
}

module.exports = { validatePage, validateNode, ValidationError };
