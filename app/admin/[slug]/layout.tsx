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
    redirect("/auth/signin");
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
