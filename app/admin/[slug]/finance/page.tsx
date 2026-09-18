import React from "react";
import { notFound } from "next/navigation";
import { getAuthSession } from "@/lib/auth";
import { findCompanyCached } from "@/lib/company-fetcher";
import FinanceHubClient from "./FinanceHubClient";

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
