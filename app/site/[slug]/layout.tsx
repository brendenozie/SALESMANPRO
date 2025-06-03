// app/[slug]/layout.tsx
import { notFound } from 'next/navigation';
import { ReactNode, Suspense } from 'react';
import prisma from '../../../server/db/prismadb';
import { StoreContextProvider,} from '../../../contexts/StoreContext';
import categoryLayoutMap from '@/components/site/layouts/categoryLayoutMap';
import { transformCompanyToStoreForm } from '../../../utils/transformPrismaToStoreForm';

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
    title: `${raw.name} – Your One-Stop Shop`,
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
    // include: {
    //   socialLinks: true,
    //   policies: true,
    //   faqs: true,
    //   testimonials: true,
    //   heroSlides: true,
    //   promotions: true,
    //   seo: true,

    //   // Now singular, not array:
    //   analyticsConfig: true,
    //   paymentSettings: true,
    //   shippingSettings: true,

    //   MarketplaceListing: {
    //     take: 12,
    //     select: {
    //       id: true,
    //       title: true,
    //       description: true,
    //       finalPrice: true,
    //       images: true,
    //       isAvailable: true,
    //       isFeatured: true,
    //       product: {
    //         select: {
    //           id: true,
    //           name: true,
    //           description: true,
    //           brand: true,
    //           color: true,
    //           size: true,
    //         },
    //       },
    //     },
    //   },
      
    //   StoreCategory: {
    //     orderBy: { sortOrder: 'asc' },
    //     include: {
    //       category: {
    //         select: { id: true, name: true, slug: true, image: true, icon: true },
    //       },
    //     },
    //   },
    // },
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
      // awards: true,
      // metrics: true,
      // stats: true,
      // themeSettings: true,
    },
  });

  if (!raw) return notFound();

  // Transform the raw data into the StoreForm shape
  const storeFormData = transformCompanyToStoreForm(raw);

  // Normalize the category string (lowercase + trim)
  const rawCategory = storeFormData.category?.trim().toLowerCase() ?? 'default';
  const LayoutComponent = categoryLayoutMap[rawCategory] ?? categoryLayoutMap['default'];

  return (
    <StoreContextProvider initialStore={storeFormData}>
      <div className="bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
        {/* You can wrap in Suspense if you used dynamic imports for LayoutComponent */}
        <Suspense fallback={<div>Loading layout…</div>}>
          <LayoutComponent params={{ storeFormData }}>{children}</LayoutComponent>
        </Suspense>
      </div>
    </StoreContextProvider>
  );
}
