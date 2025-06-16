// app/[slug]/layout.tsx
import { notFound } from 'next/navigation';
import { ReactNode, Suspense } from 'react';
import prisma from '../../../server/db/prismadb';
import { StoreContextProvider } from '../../../contexts/StoreContext';
import { transformCompanyToStoreForm } from '../../../utils/transformPrismaToStoreForm';
import categoryHeaderFooterLayoutMap from '@/components/site/layouts/categoryHeaderFooterLayoutMap';

import AdminLayout from '@/components/AdminLayout';
import UserNav from '@/components/UserNav';

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
    title: `${raw.name} – Your One-Stop ${params.slug}`,
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
  const raw = await prisma.company.findUnique({
    where: { slug: params.slug },
    include: {
      socialLinks: true,
      policies: true,
      faqs: true,
      testimonials: true,
      heroSlides: true,
      promotions: true,
      seo: true,
      analyticsConfig: true,
      paymentSettings: true,
      shippingSettings: true,
      MarketplaceListing: {
        take: 12,
        select: {
          id: true,
          title: true,
          description: true,
          finalPrice: true,
          images: true,
          isAvailable: true,
          isFeatured: true,
          product: {
            select: {
              id: true,
              name: true,
              description: true,
              brand: true,
              color: true,
              size: true,
            },
          },
        },
      },
      StoreCategory: {
        orderBy: { sortOrder: 'asc' },
        include: {
          category: {
            select: { id: true, name: true, slug: true, image: true, icon: true },
          },
        },
      },
    },
  });

  if (!raw) return notFound();

  const storeFormData = transformCompanyToStoreForm(raw);
  const type = normalizeHeaderFooterCategory(storeFormData.category || 'other');
  const LayoutComponent = categoryHeaderFooterLayoutMap[type] ?? categoryHeaderFooterLayoutMap['default'];

  return (
    <StoreContextProvider initialStore={storeFormData}>
      <div className="bg-gray-900 text-white min-h-screen w-full">
        <AdminLayout>
          <UserNav />
          <div className="container mx-auto py-4">
            <Suspense fallback={<div>Loading layout…</div>}>
              <LayoutComponent params={{ storeFormData }}>
                {children}
              </LayoutComponent>
            </Suspense>
          </div>
        </AdminLayout>
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
