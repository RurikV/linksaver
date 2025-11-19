/* eslint-disable no-console */
const { MongoClient } = require('mongodb');

async function main() {
  const uri = process.env.CMS_MONGODB_URI || 'mongodb://root:pass@localhost:27017/linksaver?authSource=admin';
  const dbName = process.env.CMS_DB_NAME || 'linksaver';
  const client = new MongoClient(uri, { ignoreUndefined: true });
  await client.connect();
  const db = client.db(dbName);
  const plugins = db.collection('plugins');

  if (process.env.RESET) {
    try { await plugins.drop(); } catch (_) {}
  }

  await plugins.createIndex({ id: 1 }, { unique: true }).catch(() => {});

  const builtins = ['Container', 'TextBlock', 'Image', 'List'];
  for (const id of builtins) {
    await plugins.updateOne(
      { id },
      { $set: { id, active: true } },
      { upsert: true }
    );
  }
  console.log('Seeded plugins:', builtins.join(', '));
  await client.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
