// app/admin/[slug]/ads/page.tsx
import React from "react";
import { getAuthSession } from "@/lib/auth";
import { findCompanyCached } from "@/lib/company-fetcher";
import StoreAdCenter from "@/components/admin/StoreAdCenter";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function StoreAdsPage({ params }: PageProps) {
  const { slug } = await params;
  const session = await getAuthSession();

  const identifier = slug || session?.user?.id || "";
  const company = await findCompanyCached(identifier, "page");

  if (!company) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-6">
        <div className="text-center space-y-2">
          <h2 className="text-xl font-bold">Store Not Found</h2>
          <p className="text-slate-400 text-sm">
            Could not resolve store context for advertising center.
          </p>
        </div>
      </div>
    );
  }

  return (
    <StoreAdCenter
      companyId={company.id}
      companyName={company.name}
      slug={company.slug}
    />
  );
}
