// app/site/[slug]/layout.tsx
// LEAN LAYOUT: Only fetches essential data for the app shell (header/footer)
import { notFound } from 'next/navigation';
import { ReactNode, Suspense } from 'react';
import { headers } from 'next/headers';
import prisma from '@/server/db/prismadb';
import { StoreContextProvider } from '@/contexts/StoreContext';
import categoryHeaderFooterLayoutMap from '@/components/site/layouts/categoryHeaderFooterLayoutMap';
import { transformCompanyToStoreForm } from '@/utils/transformPrismaToStoreForm';
import LoadingSpinner from '@/components/site/LoadingSpinner';
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
      include: leanShellInclude(),
    });
  }

  // ---- 2. Lookup by forwarded subdomain ----
  if (!raw && requestedSubdomain) {
    raw = await prisma.company.findUnique({
      where: { slug: requestedSubdomain },
      include: leanShellInclude(),
    });
  }

  // ---- 3. Fallback to slug param ----
  if (!raw) {
    raw = await prisma.company.findUnique({
      where: { slug: params.slug },
      include: leanShellInclude(),
    });
  }

  if (!raw) {
    notFound();
  }

  const storeFormData = transformCompanyToStoreForm(raw);

  const type = normalizeHeaderFooterCategory(storeFormData.category || 'other');
  const LayoutComponent = categoryHeaderFooterLayoutMap[type] ?? categoryHeaderFooterLayoutMap['default'];

  // TODO: Replace hardcoded userId with actual session data if available
  const userId = '';

  return (
    <StoreContextProvider initialStore={storeFormData} userRole="ADMIN" userId={userId}>
      <div className="bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
        {/* Header/Footer wrapper with shell data */}
        <LayoutComponent params={{ storeFormData }}>
          {/* Wrap children in Suspense to enable streaming */}
          <Suspense fallback={<LoadingSpinner />}>
            {children}
          </Suspense>
        </LayoutComponent>
      </div>
    </StoreContextProvider>
  );
}

/**
 * LEAN SHELL INCLUDE: Only fetch data needed for header, footer, and global theme
 * Page-specific data (listings, testimonials, blogs, etc.) will be fetched in page.tsx
 */
function leanShellInclude() {
  return {
    // Essential for theme and branding
    SEO: true,
    AnalyticsConfig: true,
    
    // Navigation categories (needed for header menu)
    StoreCategory: { 
      orderBy: { sortOrder: "asc" as const }, 
      include: { 
        category: { 
          select: { id: true, name: true, slug: true, image: true, icon: true } 
        } 
      } 
    },
    
    // Latest announcement (often shown in header/banner)
    Announcement: { 
      orderBy: { publishedAt: "desc" as const },
      take: 1, // Only get the latest one
    },
    
    // Social links for footer
    socialLinks: true,
    
    // Policies for footer
    policies: true,
    
    // Company locations for footer/contact
    CompanyLocation: { 
      include: { 
        location: true 
      } 
    },
  };
}

function normalizeHeaderFooterCategory(raw: string) {
  return raw
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9& ]/g, '')
    .replace(/\s+/g, ' ');
}
 