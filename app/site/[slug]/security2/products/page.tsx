import prisma from '@/server/db/prismadb';
import { loadStore } from '@/lib/loadStore';
import ProductsClient from './ProductsClient';
import { findCompanyCached } from '@/lib/company-fetcher';

export const revalidate = 60;

export default async function ProductListPage({ params, searchParams }: {
  params: { slug: string };
  searchParams: { [key: string]: string | undefined };
}) {
  const { slug } = params;
  const { company } = await findCompanyCached(slug, "lean");

  const companyId = company.id;

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
