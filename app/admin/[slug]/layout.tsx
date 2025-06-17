// app/admin/[id]/layout.tsx

import React, { ReactNode, Suspense } from "react";
import { notFound } from "next/navigation";
import prisma from "@/server/db/prismadb";
import AdminLayout from "@/components/AdminLayout";
import UserNav from "@/components/UserNav";
import { normalizeCategory } from "@/utils/normalizeCategory";
import { adminCategorySidebarMap } from "@/constant/adminCategorySidebarMap";
import { StoreContextProvider } from "@/contexts/StoreContext";
import { transformCompanyToStoreForm } from "@/utils/transformPrismaToStoreForm";

export const dynamic = 'force-dynamic';

export default async function AdminStoreLayout({
  params,
  children,
}: {
  params: { slug: string };
  children: ReactNode;
}) {
  
  const raw = await prisma.company.findUnique({
      where: { id: params.slug },
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
            name: true,
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

  // normalize down to your keys like "e‑commerce", "real estate", etc.
  // const categoryKey = normalizeCategory(store.category || "other");

  // Pass only plain data
  return (
    <StoreContextProvider initialStore={storeFormData}>
      <AdminLayout
      >
        {children}
      </AdminLayout>
    </StoreContextProvider>
  );
}
