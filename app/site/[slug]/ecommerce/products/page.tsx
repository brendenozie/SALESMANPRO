import prisma from '@/server/db/prismadb';
import { loadStore } from '@/lib/loadStore';
import ProductsClient from './ProductsClient';

export const dynamic = 'force-dynamic';

export default async function ProductListPage({ params, searchParams }: {
  params: { slug: string };
  searchParams: { [key: string]: string | undefined };
}) {
  const { slug } = params;
  const { raw } = await loadStore(slug);

  const companyId = raw.id;

  // get categories + initial products
  const pageSize = 12;
  const page = parseInt(searchParams.page || "1", 10);

  const [categories, initialListings, totalCount] = await Promise.all([
    prisma.storeCategory.findMany({
      where: { companyId },
      orderBy: { displayName: "asc" },
      select: { id: true, displayName: true }
    }),

    prisma.marketplaceListings.findMany({
      where: { companyId },
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { createdAt: "desc" }, // default
      select: {
        id: true,
        name: true,
        finalPrice: true,
        sellingPrice: true,
        images: true
      }
    }),

    prisma.marketplaceListings.count({ where: { companyId } })
  ]);

  const safeInitialListings = initialListings as any;

  return (
    <main>
      <ProductsClient
        companyId={companyId}
        slug={slug}
        initialListings={safeInitialListings}
        categories={categories}
        totalPages={Math.ceil(totalCount / pageSize)}
      />
    </main>
  );
}
