const { compose, MiddlewareError } = require('./compose');

describe('middleware compose', () => {
  test('runs in order and allows async next', async () => {
    const calls = [];
    const m1 = async (ctx, next) => { calls.push('m1:before'); await next(); calls.push('m1:after'); };
    const m2 = async (ctx, next) => { calls.push('m2:before'); await next(); calls.push('m2:after'); };
    const m3 = async (ctx, next) => { calls.push('m3'); };
    const fn = compose([m1, m2, m3]);
    await fn({});
    expect(calls).toEqual(['m1:before','m2:before','m3','m2:after','m1:after']);
  });

  test('short-circuits when next is not called', async () => {
    const calls = [];
    const m1 = async (ctx, next) => { calls.push('m1'); /* no next */ };
    const m2 = async () => { calls.push('m2'); };
    const fn = compose([m1, m2]);
    await fn({});
    expect(calls).toEqual(['m1']);
  });

  test('throws on next() called multiple times', async () => {
    const m = async (ctx, next) => { await next(); await next(); };
    const fn = compose([m]);
    await expect(fn({})).rejects.toThrow(MiddlewareError);
  });
});
