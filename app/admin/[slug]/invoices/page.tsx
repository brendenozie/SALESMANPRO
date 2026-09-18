import React from "react";
import { notFound } from "next/navigation";
import InvoicingClient from "./InvoicingClient";
import { getAuthSession } from "@/lib/auth";
import { findCompanyCached } from "@/lib/company-fetcher";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function InvoicesPage({ params }: PageProps) {
  const { slug } = await params;
  const session = await getAuthSession();

  const identifier = slug || session?.user?.id || "";
  const company = await findCompanyCached(identifier, "page");

  if (!company) {
    notFound();
  }

  return (
    <InvoicingClient
      companyId={company.id}
      companySlug={slug}
      currency={company.currency || "KES"}
      companyName={company.name || "Business"}
    />
  );
}
