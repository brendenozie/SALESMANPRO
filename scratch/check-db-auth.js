const { MongoClient } = require('/var/www/salesmanpro/current/node_modules/mongodb');

async function check() {
  const uri = "mongodb://127.0.0.1:27017/salesmanprodb?replicaSet=rs0&directConnection=true";
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db();
  const collections = await db.collections();
  console.log("Searching collections for 'salesmanpro.store' and 'auth.salesmanpro.store'...");
  for (const col of collections) {
    const regex = /salesmanpro\.site/i;
    try {
      const sample = await col.findOne({
        $or: [
          { domain: regex },
          { url: regex },
          { callbackUrl: regex },
          { redirectUrl: regex },
          { origin: regex },
          { baseUrl: regex },
          { customDomain: regex }
        ]
      });
      if (sample) {
        const count = await col.countDocuments({
          $or: [
            { domain: regex },
            { url: regex },
            { callbackUrl: regex },
            { redirectUrl: regex },
            { origin: regex },
            { baseUrl: regex },
            { customDomain: regex }
          ]
        });
        console.log(`FOUND in ${col.collectionName}: ${count} docs`);
        console.log(` Sample:`, JSON.stringify(sample).slice(0, 300));
      }
    } catch (e) {
      // skip collection without matching schema
    }
  }
  await client.close();
}

check().catch(console.error);
