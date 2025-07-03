// app/admin/[slug]/layout.tsx

import React, { ReactNode, Suspense } from "react";
import { notFound } from "next/navigation";
import prisma from "@/server/db/prismadb";
import AdminLayout from "@/components/AdminLayout"; // This is the client component
import { StoreContextProvider } from "@/contexts/StoreContext";
import { transformCompanyToStoreForm } from "@/utils/transformPrismaToStoreForm";
import { getAuthSession } from '../../../lib/auth'; // Import getAuthSession

export const dynamic = 'force-dynamic';

export default async function AdminStoreLayout({
  params,
  children,
}: {
  params: { slug: string };
  children: ReactNode;
}) {
  // Fetch the session to get the user's role
  const session = await getAuthSession();

  // Redirect if no session or user, or if the user doesn't have a valid role
  // This check should ideally mirror the one in page.tsx for consistency
  if (!session?.user?.id ||
      (session.user.role?.toLowerCase() !== 'admin' &&
       session.user.role?.toLowerCase() !== 'student' &&
       session.user.role?.toLowerCase() !== 'educator')) {
    notFound(); // Using notFound instead of redirect for layout, or redirect to a more appropriate unauthorized page
  }

  const raw = await prisma.company.findUnique({
    where: { id: params.slug },
    include: {
      socialLinks: true, policies: true, faqs: true, testimonials: true,
      heroSlides: true, promotions: true, seo: true, analyticsConfig: true,
      paymentSettings: true, shippingSettings: true,
      MarketplaceListing: {
        take: 12, select: {
          id: true, name: true, description: true, finalPrice: true, images: true,
          isAvailable: true, isFeatured: true, product: { select: { id: true, name: true, description: true, brand: true, color: true, size: true, }, },
        },
      },
      StoreCategory: {
        orderBy: { sortOrder: 'asc' },
        include: { category: { select: { id: true, name: true, slug: true, image: true, icon: true }, }, },
      },
    },
  });

  if (!raw) return notFound();

  // Transform the raw data into the StoreForm shape
  const storeFormData = transformCompanyToStoreForm(raw);

  // Get the user's role from the session
  const userRole = session.user.role?.toUpperCase() || 'OTHER'; // Default to 'OTHER' if role is not found

  // Pass storeFormData and userRole to the client component via context
  return (
    <StoreContextProvider initialStore={storeFormData} userRole={userRole} userId={session.user.id}>
      <AdminLayout>
        {children}
      </AdminLayout>
    </StoreContextProvider>
  );
}