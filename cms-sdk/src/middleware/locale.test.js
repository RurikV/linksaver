const { compose } = require('./compose');
const { localeResolver } = require('./locale');

describe('middleware/locale', () => {
  test('defaults to en when no hints provided', async () => {
    const ctx = { request: { headers: {}, query: {} } };
    const fn = compose([localeResolver()]);
    await fn(ctx);
    expect(ctx.locale).toBe('en');
  });

  test('parses Accept-Language and normalizes primary subtag', async () => {
    const ctx = { request: { headers: { 'accept-language': 'fr-CA,fr;q=0.9,en;q=0.8' }, query: {} } };
    const fn = compose([localeResolver({ defaultLocale: 'en' })]);
    await fn(ctx);
    expect(ctx.locale).toBe('fr');
  });

  test('query param overrides header', async () => {
    const ctx = { request: { headers: { 'accept-language': 'de-DE' }, query: { locale: 'es' } } };
    const fn = compose([localeResolver({ defaultLocale: 'en' })]);
    await fn(ctx);
    expect(ctx.locale).toBe('es');
  });
});
