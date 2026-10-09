const { PrismaClient } = require('@prisma/client');
require('dotenv').config();
const prisma = new PrismaClient();

async function main() {
  console.log('Auditing foreign key relationships in marketplaceListings and Product...\n');

  const [companies, categories, products, listings] = await Promise.all([
    prisma.company.findMany({ select: { id: true } }),
    prisma.productCategory.findMany({ select: { id: true } }),
    prisma.product.findMany({ select: { id: true, companyId: true, productCategoryId: true } }),
    prisma.marketplaceListings.findMany({ select: { id: true, companyId: true, productId: true, productCategoryId: true } })
  ]);

  const companyIdSet = new Set(companies.map(c => c.id));
  const categoryIdSet = new Set(categories.map(c => c.id));
  const productIdSet = new Set(products.map(p => p.id));

  console.log(`Entities count: Companies=${companies.length}, Categories=${categories.length}, Products=${products.length}, Listings=${listings.length}`);

  // Check Product relations
  const brokenProductCompany = products.filter(p => p.companyId && !companyIdSet.has(p.companyId));
  const brokenProductCategory = products.filter(p => p.productCategoryId && !categoryIdSet.has(p.productCategoryId));
  console.log(`Products with broken companyId: ${brokenProductCompany.length}`);
  console.log(`Products with broken productCategoryId: ${brokenProductCategory.length}`);

  // Check Listing relations
  const brokenListingCompany = listings.filter(l => l.companyId && !companyIdSet.has(l.companyId));
  const brokenListingProduct = listings.filter(l => l.productId && !productIdSet.has(l.productId));
  const brokenListingCategory = listings.filter(l => l.productCategoryId && !categoryIdSet.has(l.productCategoryId));
  console.log(`Listings with broken companyId: ${brokenListingCompany.length}`);
  console.log(`Listings with broken productId: ${brokenListingProduct.length}`);
  console.log(`Listings with broken productCategoryId: ${brokenListingCategory.length}`);
  if (brokenListingCategory.length > 0) {
    console.log('Sample broken category IDs in listings:', brokenListingCategory.slice(0, 5).map(l => ({ id: l.id, catId: l.productCategoryId })));
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
