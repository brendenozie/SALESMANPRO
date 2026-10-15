const { PrismaClient, ObjectId } = require('@prisma/client');
const prisma = new PrismaClient();

const TARGET_SLUGS = [
  'duka-yangu',
  'shoes-store',
  'ghuba',
  'fashion-store',
  'furniture-store',
  'agrovet',
  'baby-duka',
  'cake-duka',
  'pets-duka',
  'watch-duka',
  'honey-duka',
  'peanut-duka',
  'glasses-duka',
  'gaming-duka',
  'flowers-duka',
  'earphones-duka',
  'groceries-duka',
  'service-provider',
  'booking',
  'portfolio-personal-branding',
  'blog-content',
  'directory-listings',
  'educational-online-courses',
  'nonprofit-community',
  'restaurant-food-delivery',
  'event-ticketing',
  'real-estate',
  'healthcare-clinics',
  'media-entertainment',
  'finance-legal',
  'automotive',
  'travel-tourism',
  'fitness-wellness',
  'marketplace',
  'security-services',
  'security-services-2',
  '3educational-online-courses',
  '2educational-online-courses',
  'logistics',
  'barbershop',
  'executive-coach',
  'public-speaking',
  'flourishhub-2',
  'bike-store',
  'motorcycle-store',
  'property-management',
  'meat-store',
  'hardware-store',
  'books-store'
];

const AUTHORIZED_USER_ID = '67c5b0182e2372b5f2366dbe';
const AUTHORIZED_EMAIL = 'brendenozie@gmail.com';

async function run() {
  console.log('--- PHASE 1 & 2 DISCOVERY ---');
  
  // 1. Verify authorized user
  const user = await prisma.user.findUnique({
    where: { email: AUTHORIZED_EMAIL }
  });
  console.log('Authorized User in DB:', user ? { id: user.id, email: user.email, name: user.name } : 'NOT FOUND');
  if (!user || user.id !== AUTHORIZED_USER_ID) {
    console.error('FATAL: Authorized user mismatch or not found!');
    return;
  }

  // 2. Query all companies owned by this user
  const ownedCompanies = await prisma.company.findMany({
    where: { userId: AUTHORIZED_USER_ID }
  });
  console.log(`Total companies owned by ${AUTHORIZED_EMAIL}: ${ownedCompanies.length}`);

  const ownedMap = new Map();
  ownedCompanies.forEach(c => ownedMap.set(c.slug, c));

  // 3. For each target slug, discover state
  const report = [];

  for (const slug of TARGET_SLUGS) {
    // Search by slug globally to check ownership
    const company = await prisma.company.findUnique({
      where: { slug }
    });

    if (!company) {
      report.push({
        slug,
        status: 'NOT_FOUND',
        owned: false
      });
      continue;
    }

    const isOwned = company.userId === AUTHORIZED_USER_ID;

    // Get product count and listing count
    const [productCount, listingCount] = await Promise.all([
      prisma.product.count({ where: { companyId: company.id } }),
      prisma.marketplaceListings.count({ where: { companyId: company.id } })
    ]);

    // Check order references
    const products = await prisma.product.findMany({
      where: { companyId: company.id },
      select: { id: true, name: true, category: true, subCategoryName: true, sellingPrice: true, showOnGhuba: true, status: true, images: true }
    });
    const productIds = products.map(p => p.id);

    // Check if any product is referenced by OrderItem
    let orderItemCount = 0;
    if (productIds.length > 0) {
      orderItemCount = await prisma.orderItem.count({
        where: {
          productId: { in: productIds }
        }
      });
    }

    report.push({
      slug,
      status: 'FOUND',
      companyId: company.id,
      companyName: company.name,
      userId: company.userId,
      isOwned,
      category: company.category,
      variant: company.variant,
      companyCategoryId: company.companyCategoryId,
      description: company.description,
      site: company.site,
      productCount,
      listingCount,
      orderItemCount,
      productsSample: products.slice(0, 5).map(p => ({
        id: p.id,
        name: p.name,
        category: p.category,
        subCategoryName: p.subCategoryName,
        sellingPrice: p.sellingPrice,
        showOnGhuba: p.showOnGhuba,
        imagesCount: (p.images || []).length
      }))
    });
  }

  console.log(JSON.stringify(report, null, 2));
}

run()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
