import React, { ReactNode } from "react";
import { notFound, redirect } from "next/navigation";
import AdminLayout from "@/components/AdminLayout";
import { StoreContextProvider } from "@/contexts/StoreContext";
import { transformCompanyToStoreForm } from "@/utils/transformPrismaToStoreForm";
import { getAuthSession } from "@/lib/auth";
import { findCompanyCached } from "@/lib/company-fetcher";

export const dynamic = "force-dynamic";

// Allowed roles for dashboard access
const ALLOWED_ADMIN_ROLES = new Set([
  "ADMIN",
  "USER",
  "JUNIOR",
  "SENIOR",
  "STUDENT",
  "EDUCATOR",
  "SCHOOL_DRIVER",
  "STORE_DRIVER",
  "PARENT",
  "CONSUMER",
]);

interface Props {
  params: Promise<{ slug: string }>;
  children: ReactNode;
}

export default async function AdminStoreLayout({ params, children }: Props) {
  const { slug } = await params;
  const session = await getAuthSession();

  // 1. Authentication check
  if (!session?.user?.id) {
    redirect("/auth/login");
  }

  const userRole = session.user.role?.toUpperCase() || "OTHER";

  // 2. Authorization check
  if (!ALLOWED_ADMIN_ROLES.has(userRole)) {
    notFound();
  }

  // 3. Identifier resolution (Supports slug, ID, or fallback to user ID)
  const identifier = slug || session.user.id;

  // 4. Cached company fetch using the page strategy
  const rawCompany = await findCompanyCached(identifier, "page");

  if (!rawCompany) {
    notFound();
  }

  // 5. Transform raw Prisma data into StoreForm state
  const storeFormData = transformCompanyToStoreForm(rawCompany);

  return (
    <StoreContextProvider
      initialStore={storeFormData}
      userRole={userRole}
      userId={session.user.id}
    >
      <AdminLayout params={params}>{children}</AdminLayout>
    </StoreContextProvider>
  );
}
// // app/admin/[slug]/layout.tsx

// import React, { ReactNode, Suspense } from "react";
// import { notFound } from "next/navigation";
// import prisma from "@/server/db/prismadb";
// import AdminLayout from "@/components/AdminLayout";
// import { StoreContextProvider } from "@/contexts/StoreContext";
// import { transformCompanyToStoreForm } from "@/utils/transformPrismaToStoreForm";
// import { getAuthSession } from '@/lib/auth';

// export const dynamic = 'force-dynamic';

// interface Props {
//   params: Promise<{ slug: string }>;
//   children: ReactNode;
// }

// export default async function AdminStoreLayout({
//   params,
//   children,
// }: Props)  {
//   const { slug } = await params;
//   // Fetch the session to get the user's role
//   const session = await getAuthSession();

//   // Redirect if no session or user, or if the user doesn't have a valid role
//   // This check should ideally mirror the one in page.tsx for consistency
//   if (!session?.user?.id ||
//       session.user.role?.toLowerCase() !== 'user' &&
//       (session.user.role?.toLowerCase() !== 'admin' &&
//       session.user.role?.toLowerCase() !== 'junior' &&
//       session.user.role?.toLowerCase() !== 'senior' &&
//       session.user.role?.toLowerCase() !== 'student' &&
//       session.user.role?.toLowerCase() !== 'educator' &&
//       session.user.role?.toLowerCase() !== 'school_driver' &&
//       session.user.role?.toLowerCase() !== 'store_driver' &&
//       session.user.role?.toLowerCase() !== 'parent' &&
//       session.user.role?.toLowerCase() !== 'consumer')) {
//     notFound(); // Using notFound instead of redirect for layout, or redirect to a more appropriate unauthorized page
//   }

//   let companyId = slug || session?.user?.id;

//   const raw = await prisma.company.findUnique({
//     where: { id: companyId },
//     include: {
//       socialLinks: true, policies: true, faqs: true, testimonials: true,
//       heroSlides: true, promotions: true, SEO: true, AnalyticsConfig: true,
//       PaymentSettings: true, ShippingSettings: true,
//       marketplaceListings: {
//         take: 12, select: {
//           id: true, name: true, description: true, finalPrice: true, images: true,
//           isAvailable: true, isFeatured: true, product: { 
//             select: { id: true, name: true, description: true, brand: true, color: true, size: true, }, 
//           },
//         },
//       },
//       StoreCategory: {
//         orderBy: { sortOrder: 'asc' },
//         include: { category: { select: { id: true, name: true, slug: true, image: true, icon: true }, }, },
//       },
//     },
//   });

//   // Get the user's role from the session
//   const userRole = session.user.role?.toUpperCase() || 'OTHER'; // Default to 'OTHER' if role is not found

//   if (!raw && userRole === 'OTHER' || !raw && userRole === 'ADMIN' || !raw && userRole === 'USER' ) return notFound();

//   let storeFormData = null;

//   // Transform the raw data into the StoreForm shape
//   if (raw !== null) {
//     storeFormData = transformCompanyToStoreForm(raw);
//   }

//   // Pass storeFormData and userRole to the client component via context
//   return (
//     <StoreContextProvider initialStore={storeFormData} userRole={userRole} userId={session.user.id}>
//       <AdminLayout params={params}>
//         {children}
//       </AdminLayout>
//     </StoreContextProvider>
//   );
// }