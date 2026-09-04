// app/admin/[slug]/marketing/page.tsx
import React from "react";
import { getAuthSession } from "@/lib/auth";
import { findCompanyCached } from "@/lib/company-fetcher";
import MarketingIntelligenceCenter from "@/components/admin/MarketingIntelligenceCenter";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function StoreMarketingPage({ params }: PageProps) {
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
            Could not resolve store context for Marketing Intelligence Center.
          </p>
        </div>
      </div>
    );
  }

  return (
    <MarketingIntelligenceCenter
      companyId={company.id}
      companyName={company.name}
      slug={company.slug}
    />
  );
}
