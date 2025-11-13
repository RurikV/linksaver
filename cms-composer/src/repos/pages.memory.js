// Simple in-memory pages repository for development and tests

class InMemoryPagesRepository {
  constructor() {
    this._pages = new Map();
    // seed a sample page
    this._pages.set('home', {
      version: '1.0.0',
      meta: { slug: 'home', title: 'Home' },
      root: {
        type: 'Container',
        params: {},
        children: [
          { type: 'TextBlock', params: { text: 'Welcome!' } },
          { type: 'List', params: { items: ['One', 'Two', 'Three'] } },
          // This node is gated by a feature flag, useful for middleware tests
          { type: 'TextBlock', params: { text: 'New Header', featureFlag: 'newHeader' } },
        ],
      },
    });
  }

  async findBySlug(slug) {
    return this._pages.get(slug) || null;
  }
}

module.exports = { InMemoryPagesRepository };
