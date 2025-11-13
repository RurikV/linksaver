// JSON Schemas for the CMS DSL

const nodeSchema = {
  $id: 'https://linksaver.dev/cms/node.schema.json',
  type: 'object',
  additionalProperties: false,
  required: ['type', 'params'],
  properties: {
    type: { type: 'string', minLength: 1 },
    key: { type: 'string' },
    params: { type: 'object' },
    children: {
      type: 'array',
      items: { $ref: 'https://linksaver.dev/cms/node.schema.json' },
    },
  },
};

const pageSchema = {
  $id: 'https://linksaver.dev/cms/page.schema.json',
  type: 'object',
  additionalProperties: false,
  required: ['version', 'meta', 'root'],
  properties: {
    version: { type: 'string', pattern: '^(0|[1-9]\\d*)(\\.(0|[1-9]\\d*)){0,2}$' },
    meta: {
      type: 'object',
      additionalProperties: true,
      properties: {
        slug: { type: 'string' },
        title: { type: 'string' },
        locale: { type: 'string' },
      },
    },
    root: { $ref: 'https://linksaver.dev/cms/node.schema.json' },
  },
};

module.exports = {
  nodeSchema,
  pageSchema,
};
