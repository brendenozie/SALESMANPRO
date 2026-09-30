import React from "react";
import { notFound } from "next/navigation";
import { getAuthSession } from "@/lib/auth";
import { findCompanyCached } from "@/lib/company-fetcher";
import QuotationsClient from "./QuotationsClient";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function QuotationsPage({ params }: PageProps) {
  const { slug } = await params;
  const session = await getAuthSession();

  const identifier = slug || session?.user?.id || "";
  const company = await findCompanyCached(identifier, "page");

  if (!company) {
    notFound();
  }

  return (
    <QuotationsClient
      companyId={company.id}
      companySlug={slug}
      currency={company.currency || "KES"}
      companyName={company.name || "Business"}
    />
  );
}
