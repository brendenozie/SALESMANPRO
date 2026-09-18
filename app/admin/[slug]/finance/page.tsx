import React from "react";
import { notFound } from "next/navigation";
import { getAuthSession } from "@/lib/auth";
import { findCompanyCached } from "@/lib/company-fetcher";
import FinanceHubClient from "./FinanceHubClient";
import ContentFinanceHubClient from "@/components/admin/ContentFinanceHubClient";

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ tab?: string }>;
}

export default async function FinancePage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const { tab } = await searchParams;
  const session = await getAuthSession();

  const identifier = slug || session?.user?.id || "";
  const company = await findCompanyCached(identifier, "page");

  if (!company) {
    notFound();
  }

  // Detect Blog & Content Stores
  const isContentStore =
    company.category === "Blog & Content" ||
    company.category === "Media & Entertainment" ||
    tab === "content";

  if (isContentStore) {
    return (
      <ContentFinanceHubClient
        companySlug={slug}
        companyName={company.name || "Publishing"}
        currency={company.currency || "KES"}
      />
    );
  }

  return (
    <FinanceHubClient
      companyId={company.id}
      companySlug={slug}
      companyName={company.name || "Business"}
      currency={company.currency || "KES"}
      initialTab={tab || "overview"}
    />
  );
}
