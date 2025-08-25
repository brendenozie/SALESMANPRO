// app/[slug]/layout.tsx
import { notFound } from 'next/navigation';
import { ReactNode, Suspense } from 'react';
import prisma from '@/server/db/prismadb';
import { StoreContextProvider } from '@/contexts/StoreContext';
import categoryHeaderFooterLayoutMap from '@/components/site/layouts/categoryHeaderFooterLayoutMap';
import { transformCompanyToStoreForm } from '@/utils/transformPrismaToStoreForm';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: { slug: string } }) {
  // Metadata query can remain lightweight, no changes needed here.
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
  const raw = await prisma.company.findUnique({
    where: { slug: params.slug },
    // UPDATE: Expanded the 'include' object to fetch all necessary related data
    // for the updated StoreForm interface.
    include: {
      // --- Existing Relations ---
      socialLinks: true,
      blogs: { orderBy: { publishedAt: 'desc' } }, // Fetch blogs, optionally order them
      policies: true,
      faqs: { orderBy: { order: 'asc' } }, // Fetch FAQs, ordered
      testimonials: { orderBy: { order: 'asc' } }, // Fetch testimonials, ordered
      heroSlides: { orderBy: { order: 'asc' } }, // This corresponds to the Banner model
      promotions: true,
      SEO: true,
      AnalyticsConfig: true,
      PaymentSettings: true,
      ShippingSettings: true,
      
      // --- NEW: Added missing relations from the updated interface ---
      PageSection: { orderBy: { order: 'asc' } }, // For modular page content
      appPromos: true,                             // For the app promotion section
      Collection: { orderBy: { order: 'asc' } },     // For product collections
      Announcement: { orderBy: { publishedAt: 'desc' } }, // For site announcements
      events: { orderBy: { startDateTime: 'asc' } },     // For company events
      
      // --- Existing relations with minor adjustments if needed ---
      marketplaceListings: {
        where: { status: 'ACTIVE' }, // It's good practice to only fetch active listings
        take: 20, // Increased limit slightly, adjust as needed
        select: {
          id: true,
          name: true,
          description: true,
          finalPrice: true,
          sellingPrice: true,
          images: true,
          isAvailable: true,
          isFeatured: true,
          // slug: true, // Assuming you add a slug to marketplaceListings
          category: true,
        },
      },
      StoreCategory: { // This relation name must match your schema
        orderBy: { sortOrder: 'asc' },
        include: {
          category: {
            select: { id: true, name: true, slug: true, image: true, icon: true },
          },
        },
      },

      Writer:{
        include: {
          user:{
            select: { id: true, name: true, image: true, },
          }
        },
      },

      Doctor:{
        include: {
          User:{
            select: { id: true, name: true, image: true, },
          },
        },
      },

      salesAgents:{
        include: {
          user:{
            select: { id: true, name: true, image: true, },
          }
        },
      },
      
      Podcast :true,

      courses:true,

      services:true,

      CompanyLocation:{
        include:{
          location:true
        }
      }

    },
  });

  if (!raw) return notFound();

  console.log(raw);

  // The transformation function and context provider will now receive the complete data
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

function normalizeHeaderFooterCategory(raw:string) {
  return raw
    .trim()             // remove leading/trailing spaces
    .toLowerCase()
    .replace(/[^a-z0-9& ]/g, '') // strip out unexpected characters (except “&” or space)
    .replace(/\s+/g, ' ');      // collapse multiple spaces to one
}