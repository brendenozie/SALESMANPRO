const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
require('dotenv').config();
const prisma = new PrismaClient();

async function main() {
  const prodCats = await prisma.productCategory.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
      status: true,
      allBrands: true,
      subcategories: true,
      _count: {
        select: {
          Product: true,
          marketplaceListings: true,
          StoreCategory: true
        }
      }
    },
    orderBy: { name: 'asc' }
  });

  console.log(`Total ProductCategory records: ${prodCats.length}`);
  prodCats.forEach(c => {
    let subCount = 0;
    if (Array.isArray(c.subcategories)) {
      subCount = c.subcategories.length;
    } else if (c.subcategories && typeof c.subcategories === 'object') {
      subCount = Object.keys(c.subcategories).length;
    }
    console.log(`- [${c.id}] "${c.name}" (slug: ${c.slug}) | Subs: ${subCount} | Brands: ${c.allBrands?.length || 0} | Prods: ${c._count.Product} | Listings: ${c._count.marketplaceListings} | StoreCats: ${c._count.StoreCategory}`);
  });

  fs.writeFileSync('scratch/product_categories.json', JSON.stringify(prodCats, null, 2));

  // Also inspect StoreCategory records grouped by store
  const storeCats = await prisma.storeCategory.findMany({
    include: {
      company: { select: { id: true, name: true, slug: true } },
      category: { select: { id: true, name: true, slug: true } }
    }
  });

  console.log(`\nTotal StoreCategory records: ${storeCats.length}`);
  const storeCatMap = {};
  storeCats.forEach(sc => {
    const sName = sc.company?.name || sc.companyId;
    if (!storeCatMap[sName]) storeCatMap[sName] = [];
    storeCatMap[sName].push({
      id: sc.id,
      categoryName: sc.category?.name || 'NO_CAT',
      displayName: sc.displayName,
      categoryId: sc.categoryId,
      subcategories: sc.subcategories,
      allBrands: sc.allBrands
    });
  });

  for (const [storeName, cats] of Object.entries(storeCatMap)) {
    console.log(`Store "${storeName}" has ${cats.length} StoreCategories:`);
    cats.forEach(c => console.log(`   - ${c.displayName || c.categoryName} (catId: ${c.categoryId})`));
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
