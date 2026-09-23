import React, { ReactNode } from "react";
import { notFound, redirect } from "next/navigation";
import AdminLayout from "@/components/AdminLayout";
import { StoreContextProvider } from "@/contexts/StoreContext";
import { transformCompanyToStoreForm } from "@/utils/transformPrismaToStoreForm";
import { getAuthSession } from "@/lib/auth";
import { findCompanyCached } from "@/lib/company-fetcher";
import { canAccessCompanyAdmin } from "@/lib/auth/authorization";
import prisma from "@/server/db/prismadb";

export const dynamic = "force-dynamic";

const EDUCATION_ROLES = new Set([
  "STUDENT",
  "EDUCATOR",
  "TEACHER",
  "TUTOR",
  "LECTURER",
  "HEADTEACHER",
  "PRINCIPAL",
  "HEAD_OF_SCHOOL",
  "SCHOOL_HEAD",
  "PARENT",
  "JUNIOR",
  "SENIOR",
  "SOPHOMORE",
  "FRESHMAN",
  "SCHOOL_DRIVER",
]);

interface Props {
  params: Promise<{ slug: string }>;
  children: ReactNode;
}

export default async function AdminStoreLayout({ params, children }: Props) {
  const { slug } = await params;
  const session = await getAuthSession();

  if (!session?.user?.id) {
    redirect(
      "https://auth.salesmanpro.site/signin?callbackUrl=" +
        encodeURIComponent(`https://salesmanpro.site/admin/${slug}`),
    );
  }

  const user = session.user as any;
  if (user.emailVerified === false) {
    redirect(`/verify-email?email=${encodeURIComponent(user.email || "")}`);
  }

  const identifier = slug || session.user.id;
  const rawCompany = await findCompanyCached(identifier, "page");

  if (!rawCompany) {
    notFound();
  }

  const staff = await prisma.staffProfile.findUnique({
    where: { userId: session.user.id },
    select: { companyId: true },
  });

  const userRoleUpper = String(user.role || "").toUpperCase();
  const isEducationRole = EDUCATION_ROLES.has(userRoleUpper);

  let isEducationAuthorized = false;
  if (isEducationRole) {
    if (user.companyId === rawCompany.id) {
      isEducationAuthorized = true;
    } else {
      const [educator, student, parent] = await Promise.all([
        prisma.educator.findFirst({
          where: { userId: session.user.id, companyId: rawCompany.id },
          select: { id: true },
        }),
        prisma.student.findFirst({
          where: { userId: session.user.id, companyId: rawCompany.id },
          select: { id: true },
        }),
        prisma.parent.findFirst({
          where: { userId: session.user.id, companyId: rawCompany.id },
          select: { id: true },
        }),
      ]);
      if (educator || student || parent) {
        isEducationAuthorized = true;
      }
    }
  }

  const related =
    canAccessCompanyAdmin({
      user: {
        id: session.user.id,
        role: user.role,
        companyId: user.companyId,
        emailVerified: user.emailVerified,
        isActive: user.isActive,
      },
      company: { id: rawCompany.id, userId: rawCompany.userId },
      staffCompanyId: staff?.companyId,
    }) || isEducationAuthorized;

  if (!related) {
    redirect("/unauthorized?reason=forbidden");
  }

  const storeFormData = transformCompanyToStoreForm(rawCompany);
  const userRole = session.user.role?.toUpperCase() || "USER";

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
