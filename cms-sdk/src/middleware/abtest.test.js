const { compose } = require('./compose');
const { abBucket, hashToInt } = require('./abtest');

describe('middleware/abBucket', () => {
  test('assigns stable bucket for same identity', async () => {
    const ctx1 = { request: { headers: { 'x-user-id': 'user-123' } } };
    const ctx2 = { request: { headers: { 'x-user-id': 'user-123' } } };
    const fn = compose([abBucket({ buckets: ['A','B','C'], salt: 'test' })]);
    await fn(ctx1);
    await fn(ctx2);
    expect(ctx1.ab.bucket).toBe(ctx2.ab.bucket);
  });

  test('distributes into provided buckets', async () => {
    const ctx = { request: { headers: { 'x-user-id': 'xyz' } } };
    const fn = compose([abBucket({ buckets: ['X','Y'], salt: 's' })]);
    await fn(ctx);
    expect(['X','Y']).toContain(ctx.ab.bucket);
  });

  test('hashToInt respects modulo', () => {
    for (let i = 1; i <= 10; i++) {
      const v = hashToInt('seed-' + i, 5);
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(5);
    }
  });
});
