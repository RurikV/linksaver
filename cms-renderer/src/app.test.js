const request = require('supertest');
const { createApp } = require('./app');

describe('cms-renderer /v1/render', () => {
  let app;
  beforeAll(() => {
    process.env.UI_URL = 'http://allowed.local';
    app = createApp();
  });

  test('returns 403 when Origin differs and X-Link-Saver missing', async () => {
    await request(app)
      .post('/v1/render')
      .set('Origin', 'http://evil.local')
      .send({ tree: { type: 'TextBlock', params: { text: 'x' } } })
      .expect(403);
  });

  test('renders HTML when Accept prefers text/html', async () => {
    const res = await request(app)
      .post('/v1/render')
      .set('Origin', process.env.UI_URL)
      .set('Accept', 'text/html')
      .send({ tree: { type: 'Container', params: { class: 'wrap' }, children: [ { type: 'TextBlock', params: { text: 'Hello' } } ] } })
      .expect(200);
    expect(res.headers['content-type']).toContain('text/html');
    expect(res.text).toBe('<div class="wrap"><p>Hello</p></div>');
  });

  test('returns JSON by default', async () => {
    const res = await request(app)
      .post('/v1/render')
      .set('Origin', process.env.UI_URL)
      .send({ tree: { type: 'TextBlock', params: { text: 'Hi' } } })
      .expect(200);
    expect(res.headers['content-type']).toContain('application/json');
    expect(res.body).toHaveProperty('tree.type', 'TextBlock');
  });

  test('returns 400 on invalid input', async () => {
    await request(app)
      .post('/v1/render')
      .set('Origin', process.env.UI_URL)
      .send({ tree: { type: 'TextBlock' } })
      .expect(400);
  });
});
