const { PrismaClient } = require('@prisma/client');
require('dotenv').config();
const prisma = new PrismaClient();

async function main() {
  const products = await prisma.product.findMany({
    include: {
      company: { select: { id: true, name: true, slug: true } },
      productCategory: { select: { id: true, name: true, slug: true } },
      marketplaceListings: {
        select: {
          id: true,
          name: true,
          brand: true,
          category: true,
          subCategory: true,
          subCategoryName: true,
          images: true,
          sellingPrice: true,
          finalPrice: true,
          status: true,
          showOnGhuba: true,
          ghubaAdminApproved: true,
          ghubaStatus: true
        }
      }
    }
  });

  console.log(`--- SUMMARY OF ALL ${products.length} PRODUCTS ---\n`);

  products.forEach((p, i) => {
    console.log(`[Product ${i + 1}] ID: ${p.id}`);
    console.log(`  Name: "${p.name}"`);
    console.log(`  Store: "${p.company?.name}" (${p.company?.slug})`);
    console.log(`  Model/SKU: "${p.model || 'N/A'}"`);
    console.log(`  Brand: "${p.brand || 'N/A'}"`);
    console.log(`  Category (string): "${p.category || 'N/A'}" | ProductCategory (rel): "${p.productCategory?.name || 'N/A'}" (${p.productCategoryId || 'N/A'})`);
    console.log(`  SubCategory (json): ${JSON.stringify(p.subCategory)} | SubCategoryName: "${p.subCategoryName || 'N/A'}"`);
    console.log(`  Images (${p.images?.length || 0}): ${JSON.stringify(p.images)}`);
    console.log(`  Price: selling=${p.sellingPrice}, final=${p.finalPrice}, cost=${p.costPrice}`);
    console.log(`  Status: ${p.status}, Active: ${p.active}, showOnGhuba: ${p.showOnGhuba}`);
    console.log(`  Linked Listings (${p.marketplaceListings.length}):`);
    p.marketplaceListings.forEach(l => {
      console.log(`    - Listing [${l.id}]: name="${l.name}", brand="${l.brand}", cat="${l.category}", subCat="${l.subCategoryName}", images=${l.images?.length}, price=${l.sellingPrice}, ghuba=${l.showOnGhuba}/${l.ghubaStatus}`);
    });
    console.log('--------------------------------------------------------------------------------');
  });
}

main().catch(console.error).finally(() => prisma.$disconnect());
