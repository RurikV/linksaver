/* eslint-disable no-console */
const { MongoClient } = require('mongodb');

async function main() {
  const uri = process.env.CMS_MONGODB_URI || 'mongodb://root:pass@localhost:27017/linksaver?authSource=admin';
  const dbName = process.env.CMS_DB_NAME || 'linksaver';
  const client = new MongoClient(uri, { ignoreUndefined: true });
  await client.connect();
  const db = client.db(dbName);
  const pages = db.collection('pages');

  if (process.env.RESET) {
    try { await pages.drop(); } catch (_) {}
  }

  await pages.createIndex({ slug: 1 }, { unique: true }).catch(() => {});

  const home = {
    slug: 'home',
    version: '1.0.0',
    meta: { slug: 'home', title: 'Home' },
    root: {
      type: 'Container',
      params: { class: 'container' },
      children: [
        { type: 'TextBlock', params: { text: 'Welcome!' } },
        { type: 'List', params: { items: ['One', 'Two', 'Three'] } },
        { type: 'TextBlock', params: { text: 'New Header', featureFlag: 'newHeader' } },
      ],
    },
  };

  await pages.updateOne(
    { slug: home.slug },
    { $set: { version: home.version, meta: home.meta, root: home.root } },
    { upsert: true }
  );

  console.log('Seeded pages: home');
  await client.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
