// app/[slug]/products/page.tsx
import React from 'react';
import { notFound } from 'next/navigation';
import prisma from '@/server/db/prismadb';
import ProductsClient from './ProductsClient';

export const dynamic = 'force-dynamic';

// import React from 'react';
// import { notFound } from 'next/navigation';
// import prisma from '@/server/db/prismadb';
// import { unstable_cache } from 'next/cache';
// import ProductsClient from './ProductsClient';

// export const dynamic = 'force-dynamic';
// export const revalidate = 60;

// // Cached company lookup
// const getCompanyCached = unstable_cache(
//   async (slug: string) => {
//     return prisma.company.findUnique({ where: { slug } });
//   },
//   ['company-by-slug'],
//   { revalidate: 300 }
// );

// export default async function ProductListPage({ params }: { params: { slug: string } }) {
//   const baseCompany = await getCompanyCached(params.slug);
//   if (!baseCompany) notFound();

//   return <ProductsClient companyId={baseCompany.id} slug={params.slug} />;
// }


export default async function ProductListPage({ params, searchParams }: any) {
  const { slug } = await params;
  const { page, search, category, sort } = await searchParams;

  const baseCompany = await prisma.company.findUnique({ where: { slug } });
  if (!baseCompany) notFound();

  const pageSize = 12;
  const pageNum = parseInt(page || '1', 10);
  const where: any = { companyId: baseCompany.id };
  if (search) where.title = { contains: search, mode: 'insensitive' };
  if (category) where.productCategoryId = category;

  let orderBy: any = { createdAt: 'desc' };
  if (sort === 'priceAsc') orderBy = { finalPrice: 'asc' };
  if (sort === 'priceDesc') orderBy = { finalPrice: 'desc' };
  if (sort === 'rating') orderBy = { rating: 'desc' };

  const [listings, totalCount, categories] = await Promise.all([
    prisma.marketplaceListings.findMany({
      where,
      skip: (pageNum - 1) * pageSize,
      take: pageSize,
      orderBy,
      select: {
        id: true,
        name: true,
        finalPrice: true,
        sellingPrice: true,
        images: true,
      },
    }),
    prisma.marketplaceListings.count({ where }),
    prisma.storeCategory.findMany({
      where: { companyId: baseCompany.id },
      orderBy: { displayName: 'asc' },
      select: { id: true, displayName: true, categoryId: true },
    }),
  ]);

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <ProductsClient
      companyId={baseCompany.id}
      slug={slug}
      initialData={{
        listings,
        pagination: { totalCount, totalPages, page: pageNum },
        categories,
      }}
      initialFilters={{ search, category, sort, page: pageNum }}
    />
  );
}
