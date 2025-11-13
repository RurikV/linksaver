function parseAcceptLanguage(header) {
  if (!header || typeof header !== 'string') return null;
  const first = header.split(',')[0]?.trim();
  if (!first) return null;
  // normalize to primary subtag (e.g., en-US -> en)
  return first.split('-')[0].toLowerCase();
}

function localeResolver({ defaultLocale = 'en' } = {}) {
  return async function localeMiddleware(ctx, next) {
    const q = ctx?.request?.query || {};
    const headers = ctx?.request?.headers || {};
    let locale = q.locale || q.lang || parseAcceptLanguage(headers['accept-language']) || defaultLocale;
    if (typeof locale !== 'string' || !locale) locale = defaultLocale;
    ctx.locale = locale;
    await next();
  };
}

module.exports = { localeResolver };
