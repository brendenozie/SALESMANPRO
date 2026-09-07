// app/admin/targets/page.tsx

import React from "react";
import TargetsClient from "./TargetsClient";
import { getAuthSession } from '@/lib/auth';
import { findCompanyCached } from '@/lib/company-fetcher';

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "/api";

interface PageProps {
  params:Promise<{ slug: string }>
}

/**
 * Server Component that simply renders the client‐side logic.
 * All data fetching and rendering happen in TargetsClient.
 */
export default async function TargetsPage({ params }: PageProps) {

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

  return <TargetsClient companyId={slug} />;
}
