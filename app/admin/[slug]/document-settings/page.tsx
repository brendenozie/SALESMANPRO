import React from "react";
import { notFound } from "next/navigation";
import { getAuthSession } from "@/lib/auth";
import { findCompanyCached } from "@/lib/company-fetcher";
import DocumentsPrintingClient from "./DocumentsPrintingClient";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function DocumentSettingsPage({ params }: PageProps) {
  const { slug } = await params;
  const session = await getAuthSession();

  const identifier = slug || session?.user?.id || "";
  const company = await findCompanyCached(identifier, "page");

  if (!company) {
    notFound();
  }

  return (
    <DocumentsPrintingClient
      companyId={company.id}
      companySlug={slug}
      companyName={company.name || "Business"}
      currency={company.currency || "KES"}
    />
  );
}
