// app/[slug]/layout.tsx

import { notFound } from 'next/navigation';
import { ReactNode, Suspense } from 'react';
import prisma from '@/server/db/prismadb';
import { StoreContextProvider } from '@/contexts/StoreContext';
import categoryHeaderFooterLayoutMap from '@/components/site/layouts/categoryHeaderFooterLayoutMap';
import { transformCompanyToStoreForm } from '@/utils/transformPrismaToStoreForm';

// Add this line to cache the page for 60 seconds
export const revalidate = 60; 

// generateMetadata can remain the same, as it only needs a subset of data.
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
  // MOVE THE FULL PRISMA QUERY HERE
  const raw = await prisma.company.findUnique({
    where: { slug: params.slug },
    // This is the complete query from your original page.tsx
    include: {
      socialLinks: true,
      blogs: { orderBy: { publishedAt: 'desc' } },
      policies: true,
      faqs: { orderBy: { order: 'asc' } },
      testimonials: { orderBy: { order: 'asc' } },
      heroSlides: { orderBy: { order: 'asc' } },
      promotions: true,
      SEO: true,
      AnalyticsConfig: true,
      PaymentSettings: true,
      ShippingSettings: true,
      PageSection: { orderBy: { order: 'asc' } },
      appPromos: true,
      Collection: { orderBy: { order: 'asc' } },
      Announcement: { orderBy: { publishedAt: 'desc' } },
      events: { orderBy: { startDateTime: 'asc' } },
      marketplaceListings: {
        where: { status: 'ACTIVE' },
        take: 20,
        select: {
          id: true, name: true, description: true, finalPrice: true, sellingPrice: true, images: true, isAvailable: true, isFeatured: true, category: true,
        },
      },
      StoreCategory: { orderBy: { sortOrder: 'asc' }, include: { category: { select: { id: true, name: true, slug: true, image: true, icon: true } } } },
      Writer: { include: { user: { select: { id: true, name: true, image: true } } } },
      Doctor: { include: { User: { select: { id: true, name: true, image: true } } } },
      salesAgents: { include: { user: { select: { id: true, name: true, image: true } } } },
      Podcast: true,
      courses: true,
      services: true,
      CompanyLocation: { include: { location: true } }
    },
  });

  if (!raw) return notFound();

  // Now, the context will be initialized with the FULL data
  const storeFormData = transformCompanyToStoreForm(raw);
  
  const type = normalizeHeaderFooterCategory(storeFormData.category || 'other');
  const LayoutComponent = categoryHeaderFooterLayoutMap[type] ?? categoryHeaderFooterLayoutMap['default'];

  return (
    // Initialize the context with the COMPLETE store data
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