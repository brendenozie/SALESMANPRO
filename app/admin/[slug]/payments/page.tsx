import React from "react";
import { notFound, redirect } from "next/navigation";
import { getAuthSession } from "@/lib/auth";
import { findCompanyCached } from "@/lib/company-fetcher";
import { canAccessCompanyAdmin } from "@/lib/auth/authorization";
import prisma from "@/server/db/prismadb";
import {
  getStorePaymentMetrics,
  getStorePaymentTransactions,
} from "@/lib/payments/reportingService";
import PaymentsClient from "./PaymentsClient";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function StorePaymentsPage({ params }: PageProps) {
  const { slug } = await params;
  const session = await getAuthSession();

  if (!session?.user?.id) {
    redirect(
      "https://auth.salesmanpro.site/signin?callbackUrl=" +
        encodeURIComponent(`https://salesmanpro.site/admin/${slug}/payments`)
    );
  }

  const user = session.user as any;
  const identifier = slug || user.id;
  const company = await findCompanyCached(identifier, "page");

  if (!company) {
    notFound();
  }

  const staff = await prisma.staffProfile.findUnique({
    where: { userId: user.id },
    select: { companyId: true },
  });

  const isAuthorized =
    user.role === "SUPER_ADMIN" ||
    canAccessCompanyAdmin({
      user: {
        id: user.id,
        role: user.role,
        companyId: user.companyId,
        emailVerified: user.emailVerified,
        isActive: user.isActive,
      },
      company: { id: company.id, userId: company.userId },
      staffCompanyId: staff?.companyId,
    });

  if (!isAuthorized) {
    redirect("/unauthorized?reason=forbidden");
  }

  // Pre-load 30-day metrics and transactions on server
  const [metrics, transactionData] = await Promise.all([
    getStorePaymentMetrics(company.id, { period: "30days" }),
    getStorePaymentTransactions({
      companyId: company.id,
      period: "30days",
      page: 1,
      pageSize: 25,
    }),
  ]);

  return (
    <PaymentsClient
      companyId={company.id}
      companyName={company.name}
      slug={slug}
      initialMetrics={metrics}
      initialTransactions={transactionData.transactions}
      initialPagination={transactionData.pagination}
    />
  );
}
