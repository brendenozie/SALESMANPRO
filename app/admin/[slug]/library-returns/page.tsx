// app/admin/library/returns/page.tsx
import { cookies } from "next/headers";
import LibraryReturnsPageClient from "./LibraryReturnsPageClient";
import { getAuthSession } from '@/lib/auth';
import { findCompanyCached } from '@/lib/company-fetcher';

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

export default async function LibraryReturnsPage({ params }: { params: Promise<{ slug: string }> }) {
  
  const { slug }  = await params;
  
  const cookieHeader = (await cookies()).toString();
    
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

  let initialHistory = [];
  try {
    // Fetch returns from the last 24 hours
    const res = await fetch(
      `${apiBaseUrl}/admin/library/issuance/return-scan?companyId=${companyId}&history=true`,
      { headers: { cookie: cookieHeader }, cache: 'no-store' }
    );
    if (res.ok) initialHistory = (await res.json()).data;
  } catch (err) {
    // console.error("Failed to load return history", err);
  }

  return <LibraryReturnsPageClient schoolId={companyId} initialHistory={initialHistory} />;
}