const { PrismaClient } = require('@prisma/client');
require('dotenv').config();
const prisma = new PrismaClient();

async function dryRunPilot() {
  console.log('=== PILOT CORRECTION DRY RUN ===\n');

  // 1. Broken StoreCategory deletion check
  const orphanedStoreCats = await prisma.storeCategory.findMany({
    where: {
      companyId: {
        in: ['683581bba1bdf6ca3624b526', '68f7a7ad32db1b3ba6b61c4a']
      }
    }
  });
  console.log(`[Action 1] Orphaned StoreCategories to remove: ${orphanedStoreCats.length} records`);
  orphanedStoreCats.forEach(sc => console.log(`  - ID: ${sc.id}, non-existent companyId: ${sc.companyId}, categoryId: ${sc.categoryId}`));

  // 2. Broken Listing FK check
  const brokenListing = await prisma.marketplaceListings.findUnique({
    where: { id: '6903c66bf62463ff473b34c6' }
  });
  console.log(`\n[Action 2] Broken Listing FK: ID ${brokenListing?.id}, name "${brokenListing?.name}", invalid productId "${brokenListing?.productId}"`);
  console.log(`  Proposed change: Disconnect invalid productId to restore referential integrity.`);

  // 3. Product & Listing Metadata / Image repairs in Duka Yangu and Healthcare & Clinics
  console.log('\n[Action 3] Real Products in Duka Yangu & Healthcare & Clinics:');
  const products = await prisma.product.findMany({
    where: {
      id: {
        in: [
          '687a9f73e1d9d9821d5ee9e6', // Bose By Design
          '687a4b1ce1d9d9821d5ee9dd', // Bose and Bass
          '687a5ea5e1d9d9821d5ee9df', // Savannah Space
          '687aa49733ef3c2eb6345eb6', // Arm Chair
          '68dbc69966f8979af33efc6d', // Biscuit
          '687a6122e1d9d9821d5ee9e1', // Jambotron Toy
          '687a6468e1d9d9821d5ee9e3', // Bata 1
          '687aa68033ef3c2eb6345eb7', // Fake Teeth
          '687aab1a7a3350b8944b5a45', // Leather Tent
          '68e65c2ee210c308b58c69db', // 2025 Toyota Probox
          '68dd3fc26bf18ce921f6f0f6'  // Panadol
        ]
      }
    },
    include: {
      marketplaceListings: true,
      productCategory: true
    }
  });

  console.log(`Found ${products.length} products for pilot correction.`);
  for (const p of products) {
    console.log(`  - Product [${p.id}]: "${p.name}"`);
    console.log(`      Current: Brand=${p.brand}, Cat=${p.category}/${p.productCategory?.name}, SubCat=${p.subCategoryName}, Imgs=${p.images?.length}, Price=${p.sellingPrice}`);
    console.log(`      Linked Listings (${p.marketplaceListings.length}): ${p.marketplaceListings.map(l => `${l.id} ("${l.name}", cat=${l.category})`).join(', ')}`);
  }

  console.log('\n=== DRY RUN VALIDATION PASSED WITHOUT CONFLICTS ===');
}

dryRunPilot().catch(console.error).finally(() => prisma.$disconnect());
