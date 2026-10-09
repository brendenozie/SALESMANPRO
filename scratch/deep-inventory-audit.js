const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
require('dotenv').config();
const prisma = new PrismaClient();

async function main() {
  console.log('Starting deep inventory audit across all stores...\n');

  // Fetch all listings with company, product, and category relations
  const listings = await prisma.marketplaceListings.findMany({
    include: {
      company: {
        select: {
          id: true,
          name: true,
          slug: true,
          category: true,
          variant: true,
          userId: true
        }
      },
      product: {
        select: {
          id: true,
          name: true,
          category: true,
          subCategoryName: true,
          brand: true,
          sellingPrice: true,
          finalPrice: true,
          images: true
        }
      },
      productCategory: {
        select: {
          id: true,
          name: true,
          slug: true
        }
      }
    },
    orderBy: [{ companyId: 'asc' }, { createdAt: 'desc' }]
  });

  console.log(`Total listings loaded: ${listings.length}`);

  // Fetch all products
  const products = await prisma.product.findMany({
    include: {
      company: { select: { id: true, name: true, slug: true } },
      productCategory: { select: { id: true, name: true, slug: true } },
      marketplaceListings: { select: { id: true, name: true } }
    }
  });
  console.log(`Total products loaded: ${products.length}`);

  // Fetch all canonical product categories
  const categories = await prisma.productCategory.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
      subcategories: true,
      allBrands: true
    }
  });
  console.log(`Total canonical product categories: ${categories.length}\n`);

  // Group by store
  const storeMap = {};
  for (const l of listings) {
    const compId = l.companyId || 'UNKNOWN';
    const compName = l.company?.name || 'Unknown Store';
    if (!storeMap[compId]) {
      storeMap[compId] = {
        storeId: compId,
        storeName: compName,
        storeSlug: l.company?.slug || 'unknown',
        storeCategory: l.company?.category || 'unknown',
        storeVariant: l.company?.variant || null,
        listings: [],
        products: []
      };
    }
    storeMap[compId].listings.push(l);
  }

  for (const p of products) {
    const compId = p.companyId || 'UNKNOWN';
    if (!storeMap[compId]) {
      storeMap[compId] = {
        storeId: compId,
        storeName: p.company?.name || 'Unknown Store',
        storeSlug: p.company?.slug || 'unknown',
        storeCategory: p.company?.category || 'unknown',
        storeVariant: p.company?.variant || null,
        listings: [],
        products: []
      };
    }
    storeMap[compId].products.push(p);
  }

  const auditReport = {
    generatedAt: new Date().toISOString(),
    totalStores: Object.keys(storeMap).length,
    totalListings: listings.length,
    totalProducts: products.length,
    stores: {}
  };

  for (const [storeId, storeData] of Object.entries(storeMap)) {
    const storeAudit = {
      storeId,
      storeName: storeData.storeName,
      storeSlug: storeData.storeSlug,
      storeCategory: storeData.storeCategory,
      storeVariant: storeData.storeVariant,
      listingCount: storeData.listings.length,
      productCount: storeData.products.length,
      // Findings
      missingCategories: 0,
      missingSubCategories: 0,
      missingBrands: 0,
      missingImages: 0,
      emptyOrPlaceholderNames: 0,
      unlinkedListings: 0,
      linkedListings: 0,
      zeroPrice: 0,
      imageTypes: {
        cloudfront: 0,
        unsplash: 0,
        pexels: 0,
        placeholder: 0,
        empty: 0,
        other: 0
      },
      statuses: {},
      ghubaStatuses: {},
      approvalStatuses: {},
      nameDistribution: {},
      sampleItems: []
    };

    for (const l of storeData.listings) {
      // Check names
      const name = (l.name || '').trim();
      if (!name || name.toLowerCase() === 'new name') {
        storeAudit.emptyOrPlaceholderNames++;
      }
      storeAudit.nameDistribution[name] = (storeAudit.nameDistribution[name] || 0) + 1;

      // Check category
      if (!l.category && !l.productCategoryId) {
        storeAudit.missingCategories++;
      }

      // Check subcategory
      const subCat = l.subCategory;
      const hasSubCat = subCat && (typeof subCat === 'object' ? Object.keys(subCat).length > 0 : Boolean(subCat));
      if (!hasSubCat && !l.subCategoryName) {
        storeAudit.missingSubCategories++;
      }

      // Check brand
      if (!l.brand || l.brand.trim() === '') {
        storeAudit.missingBrands++;
      }

      // Check price
      if (!l.sellingPrice || l.sellingPrice <= 0) {
        storeAudit.zeroPrice++;
      }

      // Check linking
      if (!l.productId) {
        storeAudit.unlinkedListings++;
      } else {
        storeAudit.linkedListings++;
      }

      // Check images
      const imgs = l.images || [];
      if (!Array.isArray(imgs) || imgs.length === 0) {
        storeAudit.missingImages++;
        storeAudit.imageTypes.empty++;
      } else {
        let firstImg = imgs[0];
        let url = typeof firstImg === 'string' ? firstImg : (firstImg?.url || firstImg?.secure_url || '');
        if (!url) {
          storeAudit.missingImages++;
          storeAudit.imageTypes.empty++;
        } else if (url.includes('cloudfront.net')) {
          storeAudit.imageTypes.cloudfront++;
        } else if (url.includes('unsplash.com')) {
          storeAudit.imageTypes.unsplash++;
        } else if (url.includes('pexels.com')) {
          storeAudit.imageTypes.pexels++;
        } else if (url.includes('placeholder') || url.includes('via.placeholder')) {
          storeAudit.imageTypes.placeholder++;
        } else {
          storeAudit.imageTypes.other++;
        }
      }

      // Check statuses
      storeAudit.statuses[l.status] = (storeAudit.statuses[l.status] || 0) + 1;
      const ghubaStat = l.ghubaStatus || 'NOT_SET';
      storeAudit.ghubaStatuses[ghubaStat] = (storeAudit.ghubaStatuses[ghubaStat] || 0) + 1;
      const adminAppr = String(l.ghubaAdminApproved);
      storeAudit.approvalStatuses[adminAppr] = (storeAudit.approvalStatuses[adminAppr] || 0) + 1;

      if (storeAudit.sampleItems.length < 3) {
        storeAudit.sampleItems.push({
          id: l.id,
          name: l.name,
          category: l.category,
          subCategory: l.subCategory,
          subCategoryName: l.subCategoryName,
          brand: l.brand,
          sellingPrice: l.sellingPrice,
          images: l.images,
          status: l.status,
          ghubaStatus: l.ghubaStatus,
          ghubaAdminApproved: l.ghubaAdminApproved,
          productId: l.productId
        });
      }
    }

    auditReport.stores[storeId] = storeAudit;
  }

  fs.writeFileSync('scratch/inventory_audit_summary.json', JSON.stringify(auditReport, null, 2));
  console.log('Deep inventory audit saved to scratch/inventory_audit_summary.json\n');

  // Print summary per store
  for (const s of Object.values(auditReport.stores)) {
    console.log(`STORE: "${s.storeName}" (${s.storeSlug}) [ID: ${s.storeId}]`);
    console.log(`  Listings: ${s.listingCount} | Products: ${s.productCount}`);
    console.log(`  Placeholder/New Names: ${s.emptyOrPlaceholderNames}`);
    console.log(`  Missing Category: ${s.missingCategories} | Missing SubCategory: ${s.missingSubCategories} | Missing Brand: ${s.missingBrands}`);
    console.log(`  Missing Images: ${s.missingImages} | Images breakdown: ${JSON.stringify(s.imageTypes)}`);
    console.log(`  Unlinked Listings: ${s.unlinkedListings} | Linked: ${s.linkedListings} | Zero Price: ${s.zeroPrice}`);
    console.log(`  Statuses: ${JSON.stringify(s.statuses)} | Ghuba Statuses: ${JSON.stringify(s.ghubaStatuses)} | Admin Approved: ${JSON.stringify(s.approvalStatuses)}`);
    console.log('--------------------------------------------------------------------------------');
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
