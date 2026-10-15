import prisma from "../server/db/prismadb";
import { FilterService } from "../lib/search/filterService";

async function main() {
  console.log("=== DB QUERY TEST FOR CURSOR PAGINATION ===");
  const where = FilterService.buildPrismaWhereFilters({}, "GHUBA");

  // Page 1
  const p1 = await prisma.marketplaceListings.findMany({
    where,
    select: { id: true, name: true, createdAt: true },
    take: 10,
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
  });
  console.log("DB Page 1:", p1.map(x => ({ id: x.id, name: x.name, createdAt: x.createdAt })));

  const cursor1 = p1[p1.length - 1].id;

  // Page 2
  const p2 = await prisma.marketplaceListings.findMany({
    where,
    select: { id: true, name: true, createdAt: true },
    take: 10,
    skip: 1,
    cursor: { id: cursor1 },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
  });
  console.log("DB Page 2:", p2.map(x => ({ id: x.id, name: x.name, createdAt: x.createdAt })));

  const p1Ids = new Set(p1.map(x => x.id));
  const duplicates = p2.filter(x => p1Ids.has(x.id));
  console.log("DB Duplicates between P1 and P2:", duplicates.length);

  process.exit(0);
}

main().catch(console.error);
