// app/[slug]/layout.tsx
import { notFound } from 'next/navigation';
import { ReactNode, Suspense } from 'react';
import { headers } from 'next/headers';
import prisma from '@/server/db/prismadb';
import { StoreContextProvider } from '@/contexts/StoreContext';
import categoryHeaderFooterLayoutMap from '@/components/site/layouts/categoryHeaderFooterLayoutMap';
import { transformCompanyToStoreForm } from '@/utils/transformPrismaToStoreForm';
import type { Metadata } from "next";

// Cache the page and its data for 60 seconds (ISR)
export const revalidate = 60;

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const company = await prisma.company.findUnique({
    where: { slug: params.slug },
    select: {
      name: true,
      SEO: {
        select: { title: true, description: true, keywords: true }
      },
      logoUrl: true,
    },
  });

  if (!company) {
    return { title: 'Store not found' };
  }

  const title = company.SEO?.title || company.name;
  const description = company.SEO?.description || `Discover our exclusive collection of products.`;

  return {
    title,
    description,
    keywords: company.SEO?.keywords || "ecommerce, ghuba, shops, marketplace",
    openGraph: {
      title,
      description,
      images: [company.logoUrl || ''],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [company.logoUrl || ''],
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
  const hdrs = await headers();
  const requestedHost = hdrs.get("x-requested-host");
  const requestedSubdomain = hdrs.get("x-requested-subdomain");

  let raw = null;

  // ---- 1. Lookup by forwarded custom domain ----
  if (requestedHost) {
    raw = await prisma.company.findUnique({
      where: { domain: requestedHost },
      include: baseInclude(),
    });
  }

  // ---- 2. Lookup by forwarded subdomain ----
  if (!raw && requestedSubdomain) {
    raw = await prisma.company.findUnique({
      where: { slug: requestedSubdomain },
      include: baseInclude(),
    });
  }

  // ---- 3. Fallback to slug param ----
  if (!raw) {
    raw = await prisma.company.findUnique({
      where: { slug: params.slug },
      include: baseInclude(),
    });
  }

  if (!raw) {
    notFound();
  }

  const storeFormData = transformCompanyToStoreForm(raw);

  console.log("xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx");
  console.log(raw);
  console.log("qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq");
  console.log(storeFormData);

  const type = normalizeHeaderFooterCategory(storeFormData.category || 'other');
  const LayoutComponent = categoryHeaderFooterLayoutMap[type] ?? categoryHeaderFooterLayoutMap['default'];

  // TODO: Replace hardcoded userId with actual session data if available
  const userId = '';

  return (
    <StoreContextProvider initialStore={storeFormData} userRole="ADMIN" userId={userId}>
      <div className="bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
        <Suspense fallback={<div>Loading...</div> /* Consider a Skeleton UI */}>
          <LayoutComponent params={{ storeFormData }}>{children}</LayoutComponent>
        </Suspense>
      </div>
    </StoreContextProvider>
  );
}

function baseInclude() {
  return {
      socialLinks: true,
      blogs: { orderBy: { publishedAt: "desc" as const } },
      policies: true,
      faqs: { orderBy: { order: "asc" as const } },
      testimonials: { orderBy: { order: "asc" as const } },
      heroSlides: { orderBy: { order: "asc" as const } },
      promotions: {
        select:{
          title: true,
          description: true,
          startsAt: true,
          endsAt: true,
          badgeText: true,
          price: true,
          ctaText: true,
          ctaLink: true,
          bannerUrl: true,

          // New fields for richer site promotion
          featureImage1: true,
          featureImage2: true,
          featureImage3: true,

          perks: true, // e.g. [{ icon: "SparklesIcon", label: "Uncompromising Quality" }]
          trustLogos: true, // e.g. ["/logos/google.svg", "/logos/microsoft.svg"]
        }
      },
      SEO: true,
      AnalyticsConfig: true,
      PaymentSettings: true,
      ShippingSettings: true,
      PageSection: { orderBy: { order: "asc" as const } },
      appPromos: true,
      Collection: { orderBy: { order: "asc" as const } },
      Announcement: { orderBy: { publishedAt: "desc" as const } },
      marketplaceListings: {
        // where: { status: ListingStatus.ACTIVE },
        take: 20,
        select: {
          id: true, name: true, description: true, finalPrice: true, sellingPrice: true, images: true, isAvailable: true, isFeatured: true, category: true,
        },
      },
      StoreCategory: { orderBy: { sortOrder: "asc" as const }, include: { category: { select: { id: true, name: true, slug: true, image: true, icon: true } } } },
      Writer: { include: { user: { select: { id: true, name: true, image: true } } } },
      Doctor: { include: { User: { select: { id: true, name: true, image: true } } } },
      salesAgents: { include: { user: { select: { id: true, name: true, image: true } } } },
      Podcast: true,
      courses: true,
      events:true,
      Project:true,
      services: true,
      CoreValues:true,
      CompanyLocation: { include: { location: true } }
    };    
}

function normalizeHeaderFooterCategory(raw: string) {
  return raw
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9& ]/g, '')
    .replace(/\s+/g, ' ');
}
 