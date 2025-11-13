const { validatePage, validateNode, ValidationError } = require('./validator');

describe('validator (Ajv)', () => {
  test('valid node passes', () => {
    const node = { type: 'Box', params: { any: 'thing' } };
    expect(validateNode(node)).toBe(true);
  });

  test('invalid node (missing params) throws', () => {
    const node = { type: 'Box' };
    expect(() => validateNode(node)).toThrow(ValidationError);
  });

  test('valid page passes and validates root node', () => {
    const page = {
      version: '1.0.0',
      meta: { slug: 'home', title: 'Home', locale: 'en' },
      root: { type: 'Container', params: {}, children: [ { type: 'Text', params: { text: 'Hello' } } ] },
    };
    expect(validatePage(page)).toBe(true);
  });

  test('invalid page (missing version) throws', () => {
    const page = {
      meta: { slug: 'home' },
      root: { type: 'Container', params: {} },
    };
    expect(() => validatePage(page)).toThrow(ValidationError);
  });
});
