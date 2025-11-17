const { MongoClient } = require('mongodb');
const { validatePage } = require('cms-sdk');

class MongoPagesRepository {
  constructor({ uri, dbName = 'linksaver', collectionName = 'pages' }) {
    this._uri = uri;
    this._dbName = dbName;
    this._collectionName = collectionName;
    this._client = null;
    this._db = null;
    this._coll = null;
  }

  async _connect() {
    if (this._coll) return this._coll;
    if (!this._client) {
      this._client = new MongoClient(this._uri, { ignoreUndefined: true });
      await this._client.connect();
      this._db = this._client.db(this._dbName);
      this._coll = this._db.collection(this._collectionName);
      await this._coll.createIndex({ slug: 1 }, { unique: true }).catch(() => {});
    }
    return this._coll;
  }

  async findBySlug(slug) {
    const coll = await this._connect();
    const doc = await coll.findOne({ slug });
    if (!doc) return null;
    // Normalize document to page DTO
    const page = {
      version: doc.version,
      meta: doc.meta,
      root: doc.root,
    };
    // Validate before returning
    validatePage(page);
    return page;
  }
}

module.exports = { MongoPagesRepository };
