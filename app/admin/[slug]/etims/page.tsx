import React from "react";
import { notFound, redirect } from "next/navigation";
import { getAuthSession } from "@/lib/auth";
import { findCompanyCached } from "@/lib/company-fetcher";
import EtimsDashboardClient from "./EtimsDashboardClient";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function EtimsDashboardPage({ params }: PageProps) {
  const { slug } = await params;
  const session = await getAuthSession();

  if (!session?.user) {
    redirect(`/login?callbackUrl=/admin/${slug}/etims`);
  }

  const company = await findCompanyCached(slug);
  if (!company) {
    notFound();
  }

  return (
    <EtimsDashboardClient
      companyId={company.id}
      companyName={company.name}
      slug={slug}
      userName={session.user.name || "Admin"}
    />
  );
}
