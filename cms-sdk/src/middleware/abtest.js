const crypto = require('crypto');

function hashToInt(input, modulo) {
  const h = crypto.createHash('sha1').update(String(input)).digest();
  // use first 4 bytes as uint32
  const n = (h[0] << 24) | (h[1] << 16) | (h[2] << 8) | h[3];
  // convert to positive 32-bit int
  const pos = (n >>> 0);
  return pos % modulo;
}

function abBucket({ buckets = ['A', 'B'], salt = 'cms-ab', source = 'user-id' } = {}) {
  const bucketCount = Array.isArray(buckets) && buckets.length > 0 ? buckets.length : 2;
  return async function abMiddleware(ctx, next) {
    // Determine identity source: ctx.userId or header/cookie fallback
    let identity = null;
    if (source === 'user-id') identity = ctx?.userId || ctx?.request?.userId;
    if (!identity) identity = ctx?.request?.headers?.['x-user-id'] || ctx?.request?.cookies?.abid;
    if (!identity) identity = 'anon';
    const idx = hashToInt(String(identity) + ':' + salt, bucketCount);
    ctx.ab = { bucket: buckets[idx], buckets };
    await next();
  };
}

module.exports = { abBucket, hashToInt };
