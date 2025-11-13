const { PluginRegistry, PluginRegistryError } = require('./registry');

describe('PluginRegistry', () => {
  test('registers plugin and validates params via schema', () => {
    const registry = new PluginRegistry();
    const Text = {
      id: 'Text',
      schema: {
        type: 'object',
        additionalProperties: false,
        required: ['text'],
        properties: { text: { type: 'string', minLength: 1 } },
      },
      render: ({ params }) => params.text,
    };

    const events = [];
    registry.on('register', (e) => events.push(e));

    registry.register(Text);
    expect(registry.has('Text')).toBe(true);
    expect(events).toEqual([{ id: 'Text' }]);

    // valid params
    expect(registry.validateParams('Text', { text: 'hello' })).toBe(true);

    // invalid params
    expect(() => registry.validateParams('Text', { })).toThrow(PluginRegistryError);
  });

  test('allowlist filter and setter', () => {
    const r = new PluginRegistry();
    r.register({ id: 'A', render: () => '' });
    r.register({ id: 'B', render: () => '' });

    const events = [];
    r.on('allowlistChanged', (e) => events.push(e));

    expect(r.isAllowed('A')).toBe(true);
    r.setAllowlist(['B']);
    expect(r.isAllowed('A')).toBe(false);
    expect(r.isAllowed('B')).toBe(true);
    expect(events).toEqual([{ allowlist: ['B'] }]);

    // reset to allow all
    r.setAllowlist(null);
    expect(r.isAllowed('A')).toBe(true);
  });

  test('load allowlist from repo', async () => {
    const repo = { listActivePluginIds: jest.fn().mockResolvedValue(['X']) };
    const r = new PluginRegistry({ repo });
    await r.loadAllowlistFromRepo();
    expect(repo.listActivePluginIds).toHaveBeenCalled();
    expect(r.isAllowed('X')).toBe(true);
    expect(r.isAllowed('Y')).toBe(false);
  });

  test('duplicate registration throws', () => {
    const r = new PluginRegistry();
    r.register({ id: 'Z', render: () => '' });
    expect(() => r.register({ id: 'Z', render: () => '' })).toThrow(PluginRegistryError);
  });
});
