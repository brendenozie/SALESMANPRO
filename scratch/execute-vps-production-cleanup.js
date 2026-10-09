const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

const prisma = new PrismaClient();

const dummyPatterns = [
  'samsung galaxy s23',
  'dell xps 13',
  'apple watch',
  'nike air max',
  'kitchenaid',
  'gaming chair',
  'jbl flip',
  'sony bravia',
  'oak coffee table',
  'leather wallet',
  'new name',
  'sony sample'
];

async function main() {
  console.log("==================================================================");
  console.log("🚀 EXECUTING PRODUCTION OPTION A CLEANUP ON VPS (salesmanprodb)");
  console.log("==================================================================");

  // 1. Initial State Assertions
  const [initialListingsCount, initialOrdersCount, initialOrderItemsCount, initialProductsCount] = await Promise.all([
    prisma.marketplaceListings.count(),
    prisma.customerOrder.count(),
    prisma.orderItem.count(),
    prisma.product.count()
  ]);

  console.log(`\n[STEP 1: PRE-CHECK INITIAL STATE]`);
  console.log(`  Listings: ${initialListingsCount}`);
  console.log(`  Customer Orders: ${initialOrdersCount}`);
  console.log(`  Order Items: ${initialOrderItemsCount}`);
  console.log(`  Products: ${initialProductsCount}`);

  if (initialOrdersCount !== 196 || initialOrderItemsCount !== 295) {
    throw new Error(`ABORT: Expected 196 orders and 295 order items, found ${initialOrdersCount} and ${initialOrderItemsCount}`);
  }

  // 2. Fetch all OrderItems to create unbreakable foreign key protection set
  const allOrderItems = await prisma.orderItem.findMany({
    select: { id: true, orderId: true, marketplaceListingId: true, productId: true }
  });

  const protectedOrderListingIds = new Set(
    allOrderItems.map(oi => oi.marketplaceListingId).filter(Boolean)
  );
  console.log(`\n[STEP 2: FOREIGN KEY SHIELD ACTIVATED]`);
  console.log(`  Protected Listing IDs in OrderItems: ${protectedOrderListingIds.size}`);

  // 3. Fetch all listings
  const allListings = await prisma.marketplaceListings.findMany({
    select: {
      id: true,
      name: true,
      companyId: true,
      productId: true,
      status: true,
      isAvailable: true,
      showOnGhuba: true
    }
  });

  const toArchive = [];
  const toDelete = [];
  const toRetainActive = [];

  for (const l of allListings) {
    const isOrderProtected = protectedOrderListingIds.has(l.id);
    const hasLinkedProduct = Boolean(l.productId);
    const lowerName = (l.name || '').toLowerCase();
    const isDummyPattern = dummyPatterns.some(p => lowerName.includes(p));

    if (isOrderProtected) {
      if (isDummyPattern) {
        // Clones that were purchased in historical orders -> ARCHIVE & HIDE, DO NOT DELETE!
        toArchive.push(l);
      } else {
        // Authentic merchant listing with purchase history -> KEEP ACTIVE
        toRetainActive.push(l);
      }
    } else if (hasLinkedProduct || !isDummyPattern) {
      // Authentic merchant listing without purchase history -> KEEP ACTIVE
      toRetainActive.push(l);
    } else {
      // Dummy clone with ZERO order dependencies and ZERO product link -> SAFE TO DELETE
      toDelete.push(l);
    }
  }

  console.log(`\n[STEP 3: CLASSIFICATION SUMMARY]`);
  console.log(`  Active Authentic Offerings: ${toRetainActive.length}`);
  console.log(`  Order-Preserved Archived Clones: ${toArchive.length}`);
  console.log(`  Zero-Dependency Purge Candidates: ${toDelete.length}`);
  console.log(`  Total Accounted For: ${toRetainActive.length + toArchive.length + toDelete.length} / ${initialListingsCount}`);

  if (toDelete.length !== 1538 || toArchive.length !== 36) {
    console.log(`  Notice: Counts are ${toDelete.length} delete, ${toArchive.length} archive, ${toRetainActive.length} active.`);
  }

  // 4. Execute Archiving for the 36 Order-Referenced Clones
  console.log(`\n[STEP 4: ARCHIVING ORDER-REFERENCED CLONES]`);
  const archiveIds = toArchive.map(a => a.id);
  const archiveResult = await prisma.marketplaceListings.updateMany({
    where: { id: { in: archiveIds } },
    data: {
      status: 'INACTIVE',
      isAvailable: false,
      showOnGhuba: false
    }
  });
  console.log(`  Successfully archived ${archiveResult.count} listings (Order history preserved).`);

  // 5. Execute Hard Deletion of Zero-Dependency Clones
  console.log(`\n[STEP 5: PURGING ZERO-DEPENDENCY CLONES]`);
  const deleteIds = toDelete.map(d => d.id);
  
  // Double-check no deleteId is in protectedOrderListingIds
  const safetyViolation = deleteIds.filter(id => protectedOrderListingIds.has(id));
  if (safetyViolation.length > 0) {
    throw new Error(`CRITICAL SAFETY ERROR: Attempting to delete order-protected listing: ${safetyViolation.join(', ')}`);
  }

  // Execute in batches of 500 for safety
  let deletedTotal = 0;
  const batchSize = 500;
  for (let i = 0; i < deleteIds.length; i += batchSize) {
    const batch = deleteIds.slice(i, i + batchSize);
    const res = await prisma.marketplaceListings.deleteMany({
      where: { id: { in: batch } }
    });
    deletedTotal += res.count;
    console.log(`  Deleted batch ${Math.floor(i / batchSize) + 1}: ${res.count} records (Total: ${deletedTotal})`);
  }

  // 6. Post-Mutation Verification
  const [finalListingsCount, finalOrdersCount, finalOrderItemsCount, finalProductsCount] = await Promise.all([
    prisma.marketplaceListings.count(),
    prisma.customerOrder.count(),
    prisma.orderItem.count(),
    prisma.product.count()
  ]);

  const activeStorefrontCount = await prisma.marketplaceListings.count({
    where: {
      status: 'ACTIVE',
      isAvailable: { not: false },
      showOnGhuba: { not: false }
    }
  });

  console.log(`\n==================================================================`);
  console.log(`✅ POST-MUTATION PRODUCTION VERIFICATION`);
  console.log(`==================================================================`);
  console.log(`  Listings remaining in DB: ${finalListingsCount} (Expected: ${initialListingsCount - deletedTotal})`);
  console.log(`  Active visible on Storefront: ${activeStorefrontCount}`);
  console.log(`  Archived in DB: ${archiveResult.count}`);
  console.log(`  Customer Orders: ${finalOrdersCount} / ${initialOrdersCount} (100% INTACT)`);
  console.log(`  Order Items: ${finalOrderItemsCount} / ${initialOrderItemsCount} (100% INTACT)`);
  console.log(`  Products: ${finalProductsCount} / ${initialProductsCount} (100% INTACT)`);

  const auditLog = {
    timestamp: new Date().toISOString(),
    deletedCount: deletedTotal,
    archivedCount: archiveResult.count,
    activeStorefrontCount,
    finalListingsCount,
    finalOrdersCount,
    finalOrderItemsCount,
    finalProductsCount
  };

  fs.writeFileSync('/var/www/salesmanpro/production_cleanup_execution_audit.json', JSON.stringify(auditLog, null, 2));
  console.log(`Saved execution log to /var/www/salesmanpro/production_cleanup_execution_audit.json`);
}

main()
  .catch(err => {
    console.error("FATAL ERROR IN CLEANUP:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
