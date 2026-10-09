const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
require('dotenv').config();
const prisma = new PrismaClient();

async function main() {
  console.log('Generating complete production inventory and diagnosis...');

  const targetEmail = 'brendenozie@gmail.com';
  const user = await prisma.user.findFirst({
    where: {
      OR: [
        { email: targetEmail },
        { id: '68f1e945dcb9542a6b0a08eb' },
        { id: '67c5b0182e2372b5f2366dbe' }
      ]
    }
  });

  console.log(`User resolved: ${user?.name} (${user?.email}), ID: ${user?.id}`);

  // Fetch all in-scope companies belonging to this user
  const companies = await prisma.company.findMany({
    where: {
      OR: [
        { userId: user?.id },
        { userId: '67c5b0192e2372b5f2366dbf' } // legacy associated stores
      ]
    },
    include: {
      StoreCategory: {
        include: {
          category: {
            select: { id: true, name: true, slug: true }
          }
        }
      },
      Product: {
        include: {
          productCategory: { select: { id: true, name: true, slug: true } },
          marketplaceListings: { select: { id: true, name: true, sellingPrice: true, status: true, ghubaStatus: true } }
        }
      },
      marketplaceListings: {
        include: {
          product: { select: { id: true, name: true, model: true, brand: true, sellingPrice: true } },
          productCategory: { select: { id: true, name: true, slug: true } }
        }
      }
    },
    orderBy: { createdAt: 'asc' }
  });

  console.log(`Total in-scope stores: ${companies.length}`);

  const dummyNames = [
    "nike air max", "samsung galaxy s23", "dell xps 13", "genuine leather wallet",
    "apple watch series 8", "ergonomic gaming chair", "jbl flip 6",
    "kitchenaid mixer", "oak coffee table", "sony bravia 43”", "new name"
  ];

  const inventory = {
    metadata: {
      generatedAt: new Date().toISOString(),
      account: targetEmail,
      userId: user?.id,
      totalStores: companies.length,
      activeStoresWithCatalog: companies.filter(c => c.Product.length > 0 || c.marketplaceListings.length > 0).length,
      totalProducts: companies.reduce((sum, c) => sum + c.Product.length, 0),
      totalMarketplaceListings: companies.reduce((sum, c) => sum + c.marketplaceListings.length, 0)
    },
    stores: []
  };

  const diagnosis = {
    metadata: {
      generatedAt: new Date().toISOString(),
      totalStores: companies.length
    },
    storeDiagnoses: []
  };

  for (const c of companies) {
    const storeObj = {
      storeId: c.id,
      name: c.name,
      slug: c.slug,
      domain: c.domain,
      category: c.category,
      variant: c.variant,
      contactEmail: c.contactEmail,
      showOnGhuba: c.showOnGhuba,
      hasWebsite: c.hasWebsite,
      storeCategories: c.StoreCategory.map(sc => ({
        id: sc.id,
        categoryId: sc.categoryId,
        categoryName: sc.category?.name || 'ORPHANED_OR_NULL',
        displayName: sc.displayName,
        sortOrder: sc.sortOrder,
        visible: sc.visible
      })),
      products: c.Product.map(p => ({
        id: p.id,
        name: p.name,
        description: p.description,
        model: p.model,
        brand: p.brand,
        categoryString: p.category,
        productCategoryId: p.productCategoryId,
        productCategoryName: p.productCategory?.name || null,
        subCategory: p.subCategory,
        subCategoryName: p.subCategoryName,
        images: p.images,
        costPrice: p.costPrice,
        sellingPrice: p.sellingPrice,
        finalPrice: p.finalPrice,
        currency: c.currency || 'KES',
        quantity: p.quantity,
        isAvailable: p.isAvailable,
        status: p.status,
        active: p.active,
        showOnGhuba: p.showOnGhuba,
        linkedListings: p.marketplaceListings.map(l => ({
          id: l.id,
          name: l.name,
          sellingPrice: l.sellingPrice,
          status: l.status,
          ghubaStatus: l.ghubaStatus
        }))
      })),
      marketplaceListings: c.marketplaceListings.map(l => ({
        id: l.id,
        name: l.name,
        description: l.description,
        model: l.model,
        brand: l.brand,
        categoryString: l.category,
        productCategoryId: l.productCategoryId,
        productCategoryName: l.productCategory?.name || null,
        subCategory: l.subCategory,
        subCategoryName: l.subCategoryName,
        images: l.images,
        buyingPrice: l.buyingPrice,
        sellingPrice: l.sellingPrice,
        finalPrice: l.finalPrice,
        quantity: l.quantity,
        isAvailable: l.isAvailable,
        status: l.status,
        showOnGhuba: l.showOnGhuba,
        ghubaAdminApproved: l.ghubaAdminApproved,
        ghubaStatus: l.ghubaStatus,
        productId: l.productId,
        linkedProductName: l.product?.name || null
      }))
    };

    inventory.stores.push(storeObj);

    // Diagnosis per store
    const storeDiag = {
      storeId: c.id,
      storeName: c.name,
      storeSlug: c.slug,
      storeCategory: c.category,
      storeVariant: c.variant,
      totalProducts: c.Product.length,
      totalListings: c.marketplaceListings.length,
      issues: {
        confirmedDuplicates: [],
        suspectedDuplicates: [],
        missingCategory: [],
        missingSubCategory: [],
        missingBrand: [],
        missingOrInvalidImages: [],
        brokenProductLinks: [],
        unlinkedListings: [],
        categoryMismatch: [],
        zeroOrInvalidPrice: [],
        placeholderOrDummyRecords: []
      }
    };

    // Diagnose Products
    for (const p of c.Product) {
      if (!p.brand) storeDiag.issues.missingBrand.push({ type: 'Product', id: p.id, name: p.name });
      if (!p.productCategoryId && !p.category) storeDiag.issues.missingCategory.push({ type: 'Product', id: p.id, name: p.name });
      if (!p.subCategory && !p.subCategoryName) storeDiag.issues.missingSubCategory.push({ type: 'Product', id: p.id, name: p.name });
      if (!p.images || p.images.length === 0 || JSON.stringify(p.images).includes('[""]')) {
        storeDiag.issues.missingOrInvalidImages.push({ type: 'Product', id: p.id, name: p.name, images: p.images });
      }
      if (p.sellingPrice <= 0) storeDiag.issues.zeroOrInvalidPrice.push({ type: 'Product', id: p.id, name: p.name, price: p.sellingPrice });
      if (p.marketplaceListings.length === 0) {
        storeDiag.issues.unlinkedListings.push({ type: 'ProductWithoutListing', id: p.id, name: p.name });
      }
    }

    // Diagnose Listings
    const listingNameMap = {};
    for (const l of c.marketplaceListings) {
      const normName = (l.name || '').trim().toLowerCase();
      listingNameMap[normName] = (listingNameMap[normName] || []);
      listingNameMap[normName].push(l.id);

      if (dummyNames.includes(normName)) {
        storeDiag.issues.placeholderOrDummyRecords.push({ id: l.id, name: l.name });
      }

      if (!l.brand) storeDiag.issues.missingBrand.push({ type: 'Listing', id: l.id, name: l.name });
      if (!l.productCategoryId && !l.category) storeDiag.issues.missingCategory.push({ type: 'Listing', id: l.id, name: l.name });
      if (!l.subCategory && !l.subCategoryName) storeDiag.issues.missingSubCategory.push({ type: 'Listing', id: l.id, name: l.name });
      if (!l.images || l.images.length === 0) {
        storeDiag.issues.missingOrInvalidImages.push({ type: 'Listing', id: l.id, name: l.name });
      }
      if (l.sellingPrice <= 0) storeDiag.issues.zeroOrInvalidPrice.push({ type: 'Listing', id: l.id, name: l.name, price: l.sellingPrice });
      if (!l.productId) {
        storeDiag.issues.unlinkedListings.push({ type: 'UnlinkedListing', id: l.id, name: l.name });
      }

      // Check Category appropriateness vs Store
      // For example, if store is Automotive, and listing is "KitchenAid Mixer" or category is "Health And Beauty"
      if (c.category === 'Automotive' && l.category !== 'Cars' && l.category !== 'Automotive') {
        storeDiag.issues.categoryMismatch.push({ id: l.id, name: l.name, listingCategory: l.category, storeCategory: c.category });
      }
      if (c.category === 'Shoes Store' && l.category !== 'Shoes' && l.category !== 'Fashion') {
        storeDiag.issues.categoryMismatch.push({ id: l.id, name: l.name, listingCategory: l.category, storeCategory: c.category });
      }
      if (c.category === 'Furniture Shop' && l.category !== 'Furniture' && l.category !== 'Home And Garden') {
        storeDiag.issues.categoryMismatch.push({ id: l.id, name: l.name, listingCategory: l.category, storeCategory: c.category });
      }
    }

    // Check duplicate listing names
    for (const [n, ids] of Object.entries(listingNameMap)) {
      if (ids.length > 1) {
        storeDiag.issues.confirmedDuplicates.push({ name: n, count: ids.length, ids });
      }
    }

    diagnosis.storeDiagnoses.push(storeDiag);
  }

  fs.writeFileSync('scratch/stage_a_inventory.json', JSON.stringify(inventory, null, 2));
  fs.writeFileSync('scratch/stage_b_diagnosis.json', JSON.stringify(diagnosis, null, 2));
  console.log('Saved scratch/stage_a_inventory.json and scratch/stage_b_diagnosis.json successfully!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
