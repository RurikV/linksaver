const { Container, ResolutionError } = require('./container');

describe('Container (IoC)', () => {
  test('register and resolve plain value', () => {
    const c = new Container();
    c.register('answer', 42);
    expect(c.resolve('answer')).toBe(42);
    // resolved value is cached as singleton
    expect(c.resolve('answer')).toBe(42);
  });

  test('factory without singleton returns new instance each time', () => {
    const c = new Container();
    let counter = 0;
    c.register('obj', () => ({ id: ++counter }));
    const a = c.resolve('obj');
    const b = c.resolve('obj');
    expect(a).not.toBe(b);
    expect(a).toHaveProperty('id', 1);
    expect(b).toHaveProperty('id', 2);
  });

  test('factory with singleton returns same instance', () => {
    const c = new Container();
    let counter = 0;
    c.register('obj', () => ({ id: ++counter }), { singleton: true });
    const a = c.resolve('obj');
    const b = c.resolve('obj');
    expect(a).toBe(b);
    expect(a).toHaveProperty('id', 1);
  });

  test('resolving missing dependency throws', () => {
    const c = new Container();
    expect(() => c.resolve('missing')).toThrow(ResolutionError);
  });
});
