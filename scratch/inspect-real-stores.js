const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const stores = await prisma.company.findMany({
    take: 15,
    select: {
      id: true,
      name: true,
      slug: true,
      category: true,
      variant: true,
      website: {
        select: {
          id: true,
          templateKey: true,
          status: true,
          publishedAt: true,
        },
      },
    },
  });
  console.log("REAL STORES IN DB:");
  console.table(
    stores.map((s) => ({
      id: s.id,
      name: s.name,
      slug: s.slug,
      category: s.category,
      variant: s.variant,
      templateKey: s.website?.templateKey || "NONE",
      status: s.website?.status || "NO_WEBSITE",
    }))
  );
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
