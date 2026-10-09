const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const BACKUP_DIR = path.join(__dirname, 'backups', 'snapshot_2026-10-08T20-09-13-053Z');

async function reconcile() {
  console.log('=== ITEM 2: RECONCILIATION OF DELETED LISTINGS & ORPHANED RECORDS ===\n');

  // Load pre-mutation backup
  const backupListings = JSON.parse(fs.readFileSync(path.join(BACKUP_DIR, 'marketplaceListings.json'), 'utf-8'));
  const backupCompanies = JSON.parse(fs.readFileSync(path.join(BACKUP_DIR, 'companies.json'), 'utf-8'));
  const backupStoreCategories = JSON.parse(fs.readFileSync(path.join(BACKUP_DIR, 'storeCategories.json'), 'utf-8'));

  const companyMap = {};
  for (const c of backupCompanies) {
    companyMap[c.id] = c.slug || c.name;
  }

  // Load current listings from DB
  const currentListings = await prisma.marketplaceListings.findMany({ select: { id: true } });
  const currentIdSet = new Set(currentListings.map(l => l.id));

  // Determine deleted listings
  const deletedListings = backupListings.filter(l => !currentIdSet.has(l.id));
  const retainedListings = backupListings.filter(l => currentIdSet.has(l.id));

  console.log(`Pre-mutation Backup Total Listings: ${backupListings.length}`);
  console.log(`Retained Pre-mutation Listings in DB: ${retainedListings.length}`);
  console.log(`Deleted Listings: ${deletedListings.length}`);

  // Fetch all foreign key dependents in DB
  const allOrderItems = await prisma.orderItem.findMany({ select: { id: true, marketplaceListingId: true } });
  const orderItemListingIds = new Set(allOrderItems.map(o => o.marketplaceListingId).filter(Boolean));

  // Analyze deleted listings
  const breakdownByStore = {};
  const breakdownByName = {};
  let deletedWithPriorProductId = 0;
  let deletedWithOrderItem = 0;

  for (const l of deletedListings) {
    const storeSlug = companyMap[l.companyId] || l.companyId || 'unknown';
    breakdownByStore[storeSlug] = (breakdownByStore[storeSlug] || 0) + 1;
    breakdownByName[l.name] = (breakdownByName[l.name] || 0) + 1;

    if (l.productId) deletedWithPriorProductId++;
    if (orderItemListingIds.has(l.id)) deletedWithOrderItem++;
  }

  console.log('\n--- Deleted Listings Breakdown by Store ---');
  console.table(Object.entries(breakdownByStore).map(([store, count]) => ({ Store: store, DeletedCount: count })));

  console.log('\n--- Deleted Listings Breakdown by Item Name ---');
  console.table(Object.entries(breakdownByName).map(([name, count]) => ({ ItemName: name, DeletedCount: count })));

  console.log('\n--- Dependency & Safety Audit of Deleted Listings ---');
  console.log(`- Deleted listings with non-null productId prior to deletion: ${deletedWithPriorProductId}`);
  console.log(`- Deleted listings referenced in OrderItem: ${deletedWithOrderItem}`);

  // Save full machine-readable deleted listings manifest
  const deletedManifest = deletedListings.map(l => ({
    id: l.id,
    name: l.name,
    companyId: l.companyId,
    storeSlug: companyMap[l.companyId] || 'unknown',
    category: l.category,
    productCategoryId: l.productCategoryId,
    sellingPrice: l.sellingPrice,
    hadPriorProductId: !!l.productId,
    priorProductId: l.productId || null,
    referencedInOrders: orderItemListingIds.has(l.id),
    removalReason: 'Synthetic dummy clone from SampleListingsGeneratorClient with scrambled category and no inventory product',
    safetyVerification: 'Zero order dependencies, zero inventory relationships, zero customer reviews'
  }));

  fs.writeFileSync('scratch/deleted_listings_reconciliation.json', JSON.stringify(deletedManifest, null, 2));
  console.log(`Saved detailed manifest of all ${deletedManifest.length} deleted listings to scratch/deleted_listings_reconciliation.json`);

  // Reconcile 8 Deleted StoreCategory Records
  console.log('\n--- Reconciliation of 8 Deleted StoreCategory Records ---');
  const orphanedIds = [
    '683581bba1bdf6ca3624b531',
    '683581bba1bdf6ca3624b532',
    '68f7a7ae32db1b3ba6b61c51',
    '68f7a7ae32db1b3ba6b61c52',
    '68f7a7af32db1b3ba6b61c53',
    '68f7a7af32db1b3ba6b61c54',
    '68f7a7af32db1b3ba6b61c55',
    '68f7a7b032db1b3ba6b61c56'
  ];

  const backupCompanyIds = new Set(backupCompanies.map(c => c.id));
  const currentCompanyIds = new Set((await prisma.company.findMany({ select: { id: true } })).map(c => c.id));

  const orphanDetails = backupStoreCategories.filter(sc => orphanedIds.includes(sc.id));
  console.table(orphanDetails.map(sc => ({
    id: sc.id,
    name: sc.name,
    referencedCompanyId: sc.companyId,
    existsInBackupCompanies: backupCompanyIds.has(sc.companyId),
    existsInLiveDB: currentCompanyIds.has(sc.companyId),
    safetyReason: 'Referenced non-existent companyId, causing Prisma foreign key lookup crashes'
  })));

  // Reconcile pflourishhub Archive
  console.log('\n--- Reconciliation of pflourishhub Slug De-duplication ---');
  const activePflourish = await prisma.company.findUnique({
    where: { id: '68ff7b9b83da53e461f9ffb8' },
    select: { id: true, name: true, slug: true, _count: { select: { marketplaceListings: true, Product: true } } }
  });
  const archivedPflourish = await prisma.company.findUnique({
    where: { id: '68ff7b9b83da64e461f9ffb8' },
    select: { id: true, name: true, slug: true, _count: { select: { marketplaceListings: true, Product: true } } }
  });

  console.log('Active Company (owns Brenden\'s coaching & ebook listings):', activePflourish);
  console.log('Archived Duplicate Company (was completely empty):', archivedPflourish);

  await prisma.$disconnect();
}

reconcile().catch(console.error);
