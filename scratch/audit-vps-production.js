const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

const prisma = new PrismaClient();

async function audit() {
  console.log("=== STARTING LIVE VPS PRODUCTION DATABASE AUDIT ===");

  // 1. Base Collection Counts
  const [
    userCount,
    companyCount,
    productCount,
    listingCount,
    orderCount,
    orderItemCount,
    storeCatCount,
    prodCatCount
  ] = await Promise.all([
    prisma.user.count(),
    prisma.company.count(),
    prisma.product.count(),
    prisma.marketplaceListings.count(),
    prisma.customerOrder.count(),
    prisma.orderItem.count(),
    prisma.storeCategory.count(),
    prisma.productCategory.count()
  ]);

  console.log("\n1. BASE SYSTEM COUNTS:");
  console.log(`  Users: ${userCount}`);
  console.log(`  Companies: ${companyCount}`);
  console.log(`  Products: ${productCount}`);
  console.log(`  Marketplace Listings: ${listingCount}`);
  console.log(`  Customer Orders: ${orderCount}`);
  console.log(`  Order Items: ${orderItemCount}`);
  console.log(`  Store Categories: ${storeCatCount}`);
  console.log(`  Product Categories: ${prodCatCount}`);

  // 2. Deep Investigation of 1,596 Listings vs 1,555 Storefront Count
  const allListings = await prisma.marketplaceListings.findMany({
    select: {
      id: true,
      name: true,
      companyId: true,
      productId: true,
      status: true,
      isAvailable: true,
      showOnGhuba: true,
      sellingPrice: true,
      finalPrice: true,
      category: true,
      subCategoryName: true,
      productCategoryId: true,
      images: true,
      createdAt: true
    }
  });

  const statusMap = {};
  const availableMap = {};
  const showOnGhubaMap = {};
  let withProductId = 0;
  let withoutProductId = 0;

  for (const l of allListings) {
    statusMap[l.status || 'UNSET'] = (statusMap[l.status || 'UNSET'] || 0) + 1;
    availableMap[String(l.isAvailable)] = (availableMap[String(l.isAvailable)] || 0) + 1;
    showOnGhubaMap[String(l.showOnGhuba)] = (showOnGhubaMap[String(l.showOnGhuba)] || 0) + 1;
    if (l.productId) withProductId++;
    else withoutProductId++;
  }

  console.log("\n2. LISTINGS STATUS & DISCREPANCY ANALYSIS:");
  console.log("  Status distribution:", statusMap);
  console.log("  isAvailable distribution:", availableMap);
  console.log("  showOnGhuba distribution:", showOnGhubaMap);
  console.log(`  With linked productId: ${withProductId}`);
  console.log(`  Without linked productId (standalone): ${withoutProductId}`);

  // Check the exact filter for Ghuba search / storefront
  // In SearchService: isAvailable !== false, company.site !== false, etc.
  const activeAvailableGhuba = allListings.filter(l => 
    l.status === 'ACTIVE' && l.isAvailable !== false && l.showOnGhuba !== false
  );
  console.log(`  Listings matching ACTIVE + isAvailable!=false + showOnGhuba!=false: ${activeAvailableGhuba.length}`);

  const activeOnly = allListings.filter(l => l.status === 'ACTIVE');
  console.log(`  Listings with status === 'ACTIVE': ${activeOnly.length}`);

  const availableOnly = allListings.filter(l => l.isAvailable === true);
  console.log(`  Listings with isAvailable === true: ${availableOnly.length}`);

  // 3. Audit of the 15 Products
  const products = await prisma.product.findMany({
    select: {
      id: true,
      name: true,
      companyId: true,
      sellingPrice: true,
      costPrice: true,
      status: true,
      category: true,
      images: true,
      company: {
        select: { id: true, name: true, slug: true }
      }
    }
  });
  console.log("\n3. AUDIT OF THE 15 INVENTORY PRODUCTS:");
  console.table(products.map(p => ({
    id: p.id,
    name: p.name.slice(0, 35),
    company: p.company?.slug || p.companyId,
    price: p.sellingPrice,
    status: p.status
  })));

  // 4. Audit of the 196 Customer Orders and OrderItems Dependencies
  const orderItems = await prisma.orderItem.findMany({
    select: {
      id: true,
      orderId: true,
      marketplaceListingId: true,
      productId: true,
      quantity: true,
      price: true
    }
  });

  const referencedListingIds = new Set(orderItems.map(oi => oi.marketplaceListingId).filter(Boolean));
  const referencedProductIds = new Set(orderItems.map(oi => oi.productId).filter(Boolean));

  console.log("\n4. ORDER & ORDERITEM DEPENDENCY AUDIT:");
  console.log(`  Total OrderItem records: ${orderItems.length}`);
  console.log(`  Unique marketplaceListingIds referenced in OrderItems: ${referencedListingIds.size}`);
  console.log(`  Unique productIds referenced in OrderItems: ${referencedProductIds.size}`);

  const referencedListingsDetails = allListings.filter(l => referencedListingIds.has(l.id));
  console.log("  Sample listings referenced by active orders:");
  console.table(referencedListingsDetails.map(l => ({
    id: l.id,
    name: l.name.slice(0, 30),
    companyId: l.companyId,
    productId: l.productId
  })));

  // 5. Clone vs Authentic Pattern Analysis across all 1,596 listings
  const dummyTitlePatterns = [
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

  let dummyCloneCount = 0;
  let authenticListingCount = 0;
  const dummyListings = [];
  const authenticListings = [];

  for (const l of allListings) {
    const lowerName = (l.name || '').toLowerCase();
    const isDummy = dummyTitlePatterns.some(pat => lowerName.includes(pat));
    const isOrderReferenced = referencedListingIds.has(l.id);

    if (isDummy && !isOrderReferenced) {
      dummyCloneCount++;
      dummyListings.push(l);
    } else {
      authenticListingCount++;
      authenticListings.push({
        ...l,
        isOrderReferenced
      });
    }
  }

  console.log("\n5. CATALOG AUTHENTICITY & CLONE CLASSIFICATION:");
  console.log(`  Synthetic Dummy Seed Clones: ${dummyCloneCount}`);
  console.log(`  Authentic / Order-Protected Offerings: ${authenticListingCount}`);

  // Breakdown of authentic offerings by store
  const authenticByCompany = {};
  for (const a of authenticListings) {
    authenticByCompany[a.companyId] = (authenticByCompany[a.companyId] || 0) + 1;
  }
  console.log(`  Authentic listings distributed across ${Object.keys(authenticByCompany).length} companies.`);

  // 6. Companies Audit
  const companies = await prisma.company.findMany({
    select: {
      id: true,
      name: true,
      slug: true
    }
  });

  const companyListingsMap = {};
  for (const l of allListings) {
    companyListingsMap[l.companyId] = (companyListingsMap[l.companyId] || 0) + 1;
  }

  const companiesWithListings = companies.filter(c => (companyListingsMap[c.id] || 0) > 0);
  const companiesWithoutListings = companies.filter(c => (companyListingsMap[c.id] || 0) === 0);

  console.log("\n6. COMPANY STOREFRONT AUDIT:");
  console.log(`  Total Companies in DB: ${companies.length}`);
  console.log(`  Companies with listings: ${companiesWithListings.length}`);
  console.log(`  Companies without listings: ${companiesWithoutListings.length}`);

  // Summary object to save
  const auditReport = {
    timestamp: new Date().toISOString(),
    baseCounts: {
      users: userCount,
      companies: companyCount,
      products: productCount,
      listings: listingCount,
      orders: orderCount,
      orderItems: orderItemCount,
      storeCategories: storeCatCount,
      productCategories: prodCatCount
    },
    listingsBreakdown: {
      total: listingCount,
      statuses: statusMap,
      availability: availableMap,
      showOnGhuba: showOnGhubaMap,
      withProductId,
      withoutProductId,
      activeAvailableGhubaCount: activeAvailableGhuba.length
    },
    orders: {
      totalOrders: orderCount,
      totalOrderItems: orderItems.length,
      referencedListingCount: referencedListingIds.size,
      referencedListingIds: Array.from(referencedListingIds)
    },
    authenticity: {
      dummyCloneCount,
      authenticListingCount,
      authenticListingsSummary: authenticListings.map(a => ({
        id: a.id,
        name: a.name,
        companyId: a.companyId,
        productId: a.productId,
        sellingPrice: a.sellingPrice,
        isOrderReferenced: a.isOrderReferenced
      }))
    },
    products: products.map(p => ({
      id: p.id,
      name: p.name,
      companyId: p.companyId,
      companySlug: p.company?.slug,
      sellingPrice: p.sellingPrice,
      status: p.status
    }))
  };

  fs.writeFileSync('/var/www/salesmanpro/production_catalog_audit_results.json', JSON.stringify(auditReport, null, 2));
  console.log("\nSaved complete audit results to /var/www/salesmanpro/production_catalog_audit_results.json");
}

audit()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
