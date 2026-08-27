// app/admin/[adminSlug]/analytics/page.tsx
import React from "react";
import { getAuthSession } from "@/lib/auth";
import { findCompanyCached } from "@/lib/company-fetcher";
import AnalyticsClient from "./AnalyticsClient";

interface PageProps {
  params: Promise<{ adminSlug: string }>;
}

export default async function AnalyticsPage({ params }: PageProps) {
  const { adminSlug } = await params;

  const session = await getAuthSession();

  // Safely resolve the exact same identifier used in AdminStoreLayout
  const identifier = adminSlug || session?.user?.id || "";

  // Retrieve the memoized company data
  const company = await findCompanyCached(identifier, "page");

  if (!company) {
    return <div>Company not found</div>;
  }

  return <AnalyticsClient companyId={company.id} />;
}