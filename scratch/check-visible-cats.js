const { PrismaClient } = require('@prisma/client');
require('dotenv').config();
const prisma = new PrismaClient();

async function main() {
  const cats = await prisma.productCategory.findMany({
    where: { visible: true },
    select: { id: true, name: true, slug: true, isFeatured: true, sortOrder: true }
  });
  console.log(`Visible categories in Ghuba (${cats.length}):`);
  cats.forEach(c => console.log(`  - [${c.id}] ${c.name} (slug: ${c.slug}, featured: ${c.isFeatured})`));
}

main().catch(console.error).finally(() => prisma.$disconnect());
