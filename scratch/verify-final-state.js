const { MongoClient } = require('/var/www/salesmanpro/node_modules/mongodb');
const { execSync } = require('child_process');

async function main() {
  const uri = "mongodb://127.0.0.1:27017/salesmanprodb?replicaSet=rs0&directConnection=true";
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db();

  console.log("=== COMPREHENSIVE FINAL VERIFICATION ===");

  // 1. Resolve User and Company Ownership
  const user = await db.collection("User").findOne({ email: "brendenozie@gmail.com" });
  console.log(`User brendenozie@gmail.com ID: ${user._id}`);

  const allCompanies = await db.collection("Company").find({}, { projection: { _id: 1, name: 1, userId: 1 } }).toArray();
  const ownedCompanies = allCompanies.filter(c => c.userId?.toString() === user._id.toString());
  const externalCompanies = allCompanies.filter(c => c.userId?.toString() !== user._id.toString());
  
  console.log(`Total Companies: ${allCompanies.length}`);
  console.log(`Companies owned by brendenozie@gmail.com: ${ownedCompanies.length}`);
  console.log(`External Merchant Companies: ${externalCompanies.length}`);

  const ownedCompanyIds = new Set(ownedCompanies.map(c => c._id.toString()));
  const externalCompanyIds = new Set(externalCompanies.map(c => c._id.toString()));

  // 2. Check all modified products/listings against ownership
  const listings = await db.collection("marketplaceListings").find({}).toArray();
  const products = await db.collection("Product").find({}).toArray();

  let externalListingsCount = 0;
  let ownedListingsCount = 0;
  let unownedListings = [];

  for (const l of listings) {
    const cId = l.companyId?.toString();
    if (ownedCompanyIds.has(cId)) {
      ownedListingsCount++;
    } else if (externalCompanyIds.has(cId)) {
      externalListingsCount++;
    } else {
      unownedListings.push(l._id.toString());
    }
  }

  console.log(`Total marketplaceListings: ${listings.length}`);
  console.log(`  Owned listings: ${ownedListingsCount}`);
  console.log(`  External merchant listings: ${externalListingsCount}`);
  console.log(`  Unowned/Orphan listings: ${unownedListings.length}`);

  let externalProductsCount = 0;
  let ownedProductsCount = 0;
  for (const p of products) {
    const cId = p.companyId?.toString();
    if (ownedCompanyIds.has(cId)) {
      ownedProductsCount++;
    } else if (externalCompanyIds.has(cId)) {
      externalProductsCount++;
    }
  }
  console.log(`Total Products: ${products.length}`);
  console.log(`  Owned products: ${ownedProductsCount}`);
  console.log(`  External merchant products: ${externalProductsCount}`);

  // 3. Verify CustomerOrder and OrderItem integrity
  const ordersCount = await db.collection("CustomerOrder").countDocuments();
  const orderItemsCount = await db.collection("OrderItem").countDocuments();
  console.log(`CustomerOrder count: ${ordersCount} (Target: 196)`);
  console.log(`OrderItem count: ${orderItemsCount} (Target: 295)`);

  // 4. Verify PM2 processes
  const pm2Out = execSync("pm2 jlist", { encoding: "utf8" });
  const pm2List = JSON.parse(pm2Out);
  const targetIds = [525, 526, 527, 528, 530];
  console.log("=== PM2 WORKER STATUSES ===");
  for (const p of pm2List) {
    if (targetIds.includes(p.pm_id)) {
      console.log(`Worker [${p.pm_id}] ${p.name}: status=${p.pm2_env.status}, uptime=${Math.round((Date.now() - p.pm2_env.pm_uptime)/1000)}s, restarts=${p.pm2_env.restart_time}`);
    }
  }

  await client.close();
  console.log("=== VERIFICATION COMPLETE ===");
}

main().catch(err => {
  console.error("Verification failed:", err);
  process.exit(1);
});
