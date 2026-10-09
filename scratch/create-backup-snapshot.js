const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
require('dotenv').config();
const prisma = new PrismaClient();

async function main() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupDir = path.join(__dirname, 'backups', `snapshot_${timestamp}`);
  fs.mkdirSync(backupDir, { recursive: true });

  console.log(`Creating comprehensive before-state backup snapshot in ${backupDir}...`);

  const [products, listings, storeCategories, productCategories, companies] = await Promise.all([
    prisma.product.findMany({}),
    prisma.marketplaceListings.findMany({}),
    prisma.storeCategory.findMany({}),
    prisma.productCategory.findMany({}),
    prisma.company.findMany({})
  ]);

  fs.writeFileSync(path.join(backupDir, 'products.json'), JSON.stringify(products, null, 2));
  fs.writeFileSync(path.join(backupDir, 'marketplaceListings.json'), JSON.stringify(listings, null, 2));
  fs.writeFileSync(path.join(backupDir, 'storeCategories.json'), JSON.stringify(storeCategories, null, 2));
  fs.writeFileSync(path.join(backupDir, 'productCategories.json'), JSON.stringify(productCategories, null, 2));
  fs.writeFileSync(path.join(backupDir, 'companies.json'), JSON.stringify(companies, null, 2));

  const manifest = {
    backupTimestamp: timestamp,
    counts: {
      products: products.length,
      marketplaceListings: listings.length,
      storeCategories: storeCategories.length,
      productCategories: productCategories.length,
      companies: companies.length
    },
    files: [
      'products.json',
      'marketplaceListings.json',
      'storeCategories.json',
      'productCategories.json',
      'companies.json'
    ]
  };

  fs.writeFileSync(path.join(backupDir, 'manifest.json'), JSON.stringify(manifest, null, 2));
  console.log(`Backup completed successfully! Counts:`, manifest.counts);
  console.log(`Saved manifest to ${path.join(backupDir, 'manifest.json')}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
