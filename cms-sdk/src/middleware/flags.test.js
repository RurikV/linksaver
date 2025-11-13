const { compose } = require('./compose');
const { featureFlagGate } = require('./flags');

describe('middleware/feature flags', () => {
  test('prunes nodes with disabled flags', async () => {
    const tree = {
      type: 'Container',
      params: {},
      children: [
        { type: 'A', params: { featureFlag: 'newHeader' } },
        { type: 'B', params: {} },
      ],
    };
    const ctx = { tree, flags: { newHeader: false } };
    const fn = compose([featureFlagGate()]);
    await fn(ctx);
    expect(ctx.tree.children).toHaveLength(1);
    expect(ctx.tree.children[0].type).toBe('B');
    // featureFlag key removed from remaining nodes' params as well (no-op here)
  });

  test('keeps nodes when flag enabled', async () => {
    const tree = { type: 'X', params: { featureFlag: 'exp' }, children: [] };
    const ctx = { tree, flags: { exp: true } };
    const fn = compose([featureFlagGate()]);
    await fn(ctx);
    expect(ctx.tree.type).toBe('X');
    expect(ctx.tree.params.featureFlag).toBeUndefined();
  });

  test('invert flag removes node when enabled', async () => {
    const tree = { type: 'X', params: { featureFlag: { name: 'exp', invert: true } }, children: [] };
    const ctx = { tree, flags: { exp: true } };
    const fn = compose([featureFlagGate()]);
    await fn(ctx);
    expect(ctx.tree).toBeNull();
  });
});
