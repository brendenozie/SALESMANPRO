// app/admin/[slug]/layout.tsx

import React, { ReactNode, Suspense } from "react";
import { notFound } from "next/navigation";
import prisma from "@/server/db/prismadb";
import AdminLayout from "@/components/AdminLayout";
import { StoreContextProvider } from "@/contexts/StoreContext";
import { transformCompanyToStoreForm } from "@/utils/transformPrismaToStoreForm";
import { getAuthSession } from '@/lib/auth';

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
      session.user.role?.toLowerCase() !== 'junior' &&
      session.user.role?.toLowerCase() !== 'senior' &&
      session.user.role?.toLowerCase() !== 'student' &&
       session.user.role?.toLowerCase() !== 'educator' &&
       session.user.role?.toLowerCase() !== 'consumer')) {
        console.log(`Unauthorized access attempt by user ID: ${session?.user?.id} with role: ${session?.user?.role}`);
    notFound(); // Using notFound instead of redirect for layout, or redirect to a more appropriate unauthorized page
  }

  let companyId = params.slug || session?.user?.id;

  const raw = await prisma.company.findUnique({
    where: { id: params.slug },
    include: {
      socialLinks: true, policies: true, faqs: true, testimonials: true,
      heroSlides: true, promotions: true, seo: true, analyticsConfig: true,
      paymentSettings: true, shippingSettings: true,
      marketplaceListings: {
        take: 12, select: {
          id: true, name: true, description: true, finalPrice: true, images: true,
          isAvailable: true, isFeatured: true, product: { 
            select: { id: true, name: true, description: true, brand: true, color: true, size: true, }, 
          },
        },
      },
      StoreCategory: {
        orderBy: { sortOrder: 'asc' },
        include: { category: { select: { id: true, name: true, slug: true, image: true, icon: true }, }, },
      },
    },
  });

  // Get the user's role from the session
  const userRole = session.user.role?.toUpperCase() || 'OTHER'; // Default to 'OTHER' if role is not found

  if (!raw && userRole === 'OTHER' || !raw && userRole === 'ADMIN') return notFound();

  let storeFormData = null;

  // Transform the raw data into the StoreForm shape
  if (raw !== null) {
    storeFormData = transformCompanyToStoreForm(raw);
  }

  // Pass storeFormData and userRole to the client component via context
  return (
    <StoreContextProvider initialStore={storeFormData} userRole={userRole} userId={session.user.id}>
      <AdminLayout params={params}>
        {children}
      </AdminLayout>
    </StoreContextProvider>
  );
}