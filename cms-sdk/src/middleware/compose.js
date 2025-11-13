class MiddlewareError extends Error {}

function compose(middleware) {
  if (!Array.isArray(middleware)) throw new MiddlewareError('Middleware stack must be an array');
  for (const fn of middleware) {
    if (typeof fn !== 'function') throw new MiddlewareError('Middleware must be functions');
  }
  return function run(ctx, next) {
    let index = -1;
    function dispatch(i) {
      if (i <= index) return Promise.reject(new MiddlewareError('next() called multiple times'));
      index = i;
      let fn = middleware[i];
      if (i === middleware.length) fn = next;
      if (!fn) return Promise.resolve();
      try {
        return Promise.resolve(fn(ctx, () => dispatch(i + 1)));
      } catch (err) {
        return Promise.reject(err);
      }
    }
    return dispatch(0);
  };
}

module.exports = { compose, MiddlewareError };
