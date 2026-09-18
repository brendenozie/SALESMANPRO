// app/admin/reports/page.tsx (This file remains minimal)
import React from "react";
import ReportsClient from "./ReportsClient";
import { getAuthSession } from '@/lib/auth';
import { findCompanyCached } from '@/lib/company-fetcher';


/**
 * A minimal Server Component that simply renders the client-side report logic.
 */

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function ReportsPage({ params }: PageProps) {
  
    const { slug } = await params;
  
    const session = await getAuthSession();
  
    // 1. Safely resolve the exact same identifier used in AdminStoreLayout
    const identifier = slug || session?.user?.id || '';
  
    // 2. Retrieve the memoized company data (no extra DB cost)
    const company = await findCompanyCached(identifier, "page");
  
    if (!company) {
      return <div>Company not found</div>;
    }
  
    // Use the actual database ID for your API calls, ensuring consistency
    const companyId = company.id;

  return <ReportsClient slug={slug} companyId={companyId} />;
}