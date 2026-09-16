import prisma from '@/server/db/prismadb';
import ProductsClient from './ProductsClient';
import { findCompanyCached } from '@/lib/company-fetcher';
import { notFound } from 'next/navigation';
import { fetchWithCache, buildTenantCacheKey } from '@/lib/cache';

export const revalidate = 60;

export default async function ProductListPage({ params, searchParams }: {
  params: { slug: string };
  searchParams: { [key: string]: string | undefined };
}) {
  const { slug } = params;
  const company = await findCompanyCached(slug, "lean");

  if (!company) notFound();

  const companyId = company.id;

  // get categories + initial products
  const pageSize = 12;
  const page = parseInt(searchParams.page || "1", 10);

  const cacheKey = buildTenantCacheKey(companyId, "products_page", { page, pageSize });

  const { categories, initialListings, totalCount } = await fetchWithCache(
    cacheKey,
    async () => {
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
          orderBy: { createdAt: "desc" },
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
      return { categories, initialListings, totalCount };
    },
    180
  );

  return (
    <main>
      <ProductsClient
        companyId={companyId}
        slug={slug}
        initialListings={initialListings}
        categories={categories}
        totalPages={Math.ceil(totalCount / pageSize)}
      />
    </main>
  );
}
