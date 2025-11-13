const { HTMLRenderer, RenderError } = require('./html');
const { PluginRegistry } = require('../plugins/registry');

describe('HTMLRenderer', () => {
  function setupRegistry() {
    const r = new PluginRegistry();
    r.register({ id: 'Container', render: ({ children }) => `<div>${children}</div>` });
    r.register({
      id: 'Text',
      schema: {
        type: 'object',
        additionalProperties: false,
        required: ['text'],
        properties: { text: { type: 'string', minLength: 1 } },
      },
      render: ({ params }) => params.text,
    });
    r.register({ id: 'NoRender' });
    r.register({ id: 'BadReturn', render: () => ({ nope: true }) });
    r.register({ id: 'NeedsNum', schema: { type: 'object', required: ['n'], properties: { n: { type: 'number' } }, additionalProperties: false }, render: () => '' });
    return r;
  }

  test('renders nested tree depth-first', async () => {
    const registry = setupRegistry();
    const renderer = new HTMLRenderer({ registry });
    const tree = {
      type: 'Container',
      params: {},
      children: [
        { type: 'Text', params: { text: 'Hello' } },
        { type: 'Text', params: { text: ' World' } },
      ],
    };
    const html = await renderer.render(tree);
    expect(html).toBe('<div>Hello World</div>');
  });

  test('enforces allowlist', async () => {
    const registry = setupRegistry();
    registry.setAllowlist(['Text']);
    const renderer = new HTMLRenderer({ registry });
    const tree = { type: 'Container', params: {} };
    await expect(renderer.render(tree)).rejects.toThrow(RenderError);
  });

  test('validates params using plugin schema', async () => {
    const registry = setupRegistry();
    const renderer = new HTMLRenderer({ registry });
    const tree = { type: 'Text', params: {} };
    await expect(renderer.render(tree)).rejects.toThrow();
  });

  test('throws if plugin missing render fn', async () => {
    const registry = setupRegistry();
    const renderer = new HTMLRenderer({ registry });
    await expect(renderer.render({ type: 'NoRender', params: {} })).rejects.toThrow(RenderError);
  });

  test('throws if plugin returns non-string', async () => {
    const registry = setupRegistry();
    const renderer = new HTMLRenderer({ registry });
    await expect(renderer.render({ type: 'BadReturn', params: {} })).rejects.toThrow(RenderError);
  });

  test('params schema rejection bubbles up', async () => {
    const registry = setupRegistry();
    const renderer = new HTMLRenderer({ registry });
    await expect(renderer.render({ type: 'NeedsNum', params: { } })).rejects.toThrow();
  });
});
