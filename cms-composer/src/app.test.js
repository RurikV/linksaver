const request = require('supertest');
const { createApp } = require('./app');

describe('cms-composer /v1/pages', () => {
  let app;
  beforeAll(() => {
    process.env.UI_URL = 'http://allowed.local';
    app = createApp();
  });

  test('returns 403 when Origin differs and X-Link-Saver missing', async () => {
    await request(app)
      .get('/v1/pages/home')
      .set('Origin', 'http://evil.local')
      .expect(403);
  });

  test('allows when Origin matches UI_URL', async () => {
    const res = await request(app)
      .get('/v1/pages/home')
      .set('Origin', process.env.UI_URL)
      .expect(200);
    expect(res.body).toHaveProperty('meta.slug', 'home');
  });

  test('allows when X-Link-Saver header present', async () => {
    const res = await request(app)
      .get('/v1/pages/home')
      .set('Origin', 'http://evil.local')
      .set('X-Link-Saver', '1')
      .expect(200);
    expect(res.body).toHaveProperty('meta.slug', 'home');
  });

  test('returns 404 for unknown slug', async () => {
    await request(app)
      .get('/v1/pages/unknown')
      .set('Origin', process.env.UI_URL)
      .expect(404);
  });

  test('locale resolver sets meta.locale from Accept-Language', async () => {
    const res = await request(app)
      .get('/v1/pages/home')
      .set('Origin', process.env.UI_URL)
      .set('Accept-Language', 'fr-CA,fr;q=0.9')
      .expect(200);
    expect(res.body).toHaveProperty('meta.locale', 'fr');
  });

  test('featureFlagGate prunes gated nodes when flag not set', async () => {
    const res = await request(app)
      .get('/v1/pages/home')
      .set('Origin', process.env.UI_URL)
      .expect(200);
    const children = res.body.root.children || [];
    const hasNewHeader = children.some((n) => n.type === 'TextBlock' && n.params && n.params.text === 'New Header');
    expect(hasNewHeader).toBe(false);
  });

  test('featureFlagGate keeps gated nodes when flag is set', async () => {
    const res = await request(app)
      .get('/v1/pages/home')
      .set('Origin', process.env.UI_URL)
      .set('X-Flags', 'newHeader')
      .expect(200);
    const children = res.body.root.children || [];
    const hasNewHeader = children.some((n) => n.type === 'TextBlock' && n.params && n.params.text === 'New Header');
    expect(hasNewHeader).toBe(true);
  });
});
