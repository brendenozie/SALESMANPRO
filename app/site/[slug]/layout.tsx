// app/[slug]/layout.tsx
import { notFound } from 'next/navigation';
import { ReactNode, Suspense } from 'react';
import prisma from '@/server/db/prismadb';
import { StoreContextProvider } from '@/contexts/StoreContext';
import categoryHeaderFooterLayoutMap from '@/components/site/layouts/categoryHeaderFooterLayoutMap';
import { transformCompanyToStoreForm } from '@/utils/transformPrismaToStoreForm';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const raw = await prisma.company.findUnique({
    where: { slug: params.slug },
    select: {
      name: true,
      description: true,
      logoUrl: true,
    },
  });

  if (!raw) {
    return {
      title: 'Store not found',
      description: "We couldn’t find that store.",
    };
  }

  return {
    title: `${raw.name}`,
    description: raw.description ?? 'Discover our exclusive collection of products.',
    openGraph: {
      title: `${raw.name} – Shop`,
      description: raw.description ?? '',
      images: [
        {
          url: raw.logoUrl ?? 'https://via.placeholder.com/1200x630?text=Store',
          width: 1200,
          height: 630,
          alt: raw.name,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${raw.name} – Shop`,
      description: raw.description ?? '',
      images: [raw.logoUrl ?? 'https://via.placeholder.com/1200x630?text=Store'],
    },
  };
}

export default async function StoreLayout({
  params,
  children,
}: {
  params: { slug: string };
  children: ReactNode;
}) {
  // Refactored to fetch only essential data for the layout.
  const raw = await prisma.company.findUnique({
    where: { slug: params.slug },
    select: {
      id: true,
      name: true,
      slug: true,
      category: true,
      logoUrl: true,
      socialLinks: true, // Assuming social links are in the header/footer
      Announcement: { orderBy: { publishedAt: 'desc' }, take: 1 }, // For a header announcement bar
    },
  });

  if (!raw) return notFound();

  const storeFormData = transformCompanyToStoreForm(raw);
  
  const type = normalizeHeaderFooterCategory(storeFormData.category || 'other');
  const LayoutComponent = categoryHeaderFooterLayoutMap[type] ?? categoryHeaderFooterLayoutMap['default'];

  return (
    <StoreContextProvider initialStore={storeFormData} userRole='ADMIN' userId={``}>
      <div className="bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
        <Suspense fallback={<div>Loading layout…</div>}>
          <LayoutComponent params={{ storeFormData }}>{children}</LayoutComponent>
        </Suspense>
      </div>
    </StoreContextProvider>
  );
}

function normalizeHeaderFooterCategory(raw: string) {
  return raw
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9& ]/g, '')
    .replace(/\s+/g, ' ');
}