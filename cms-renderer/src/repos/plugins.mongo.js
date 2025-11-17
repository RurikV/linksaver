const { MongoClient } = require('mongodb');

class MongoPluginsRepository {
  constructor({ uri, dbName = 'linksaver', collectionName = 'plugins' }) {
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
      await this._coll.createIndex({ id: 1 }, { unique: true }).catch(() => {});
    }
    return this._coll;
  }

  async listActivePluginIds() {
    const coll = await this._connect();
    const docs = await coll.find({ active: true }).project({ id: 1, _id: 0 }).toArray();
    return docs.map((d) => d.id);
  }
}

module.exports = { MongoPluginsRepository };
