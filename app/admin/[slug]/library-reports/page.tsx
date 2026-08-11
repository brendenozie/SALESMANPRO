import { cookies } from "next/headers";
import LibraryReportingClient from "./LibraryReportingClient";
import { getAuthSession } from '@/lib/auth';
import { findCompanyCached } from '@/lib/company-fetcher';

export default async function LibraryReportsPage({ params }: { params: Promise<{ slug: string }> }) {
 
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

  let stats = null;
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/admin/library/reports?companyId=${companyId}`,
      { headers: { cookie: cookieHeader }, cache: 'no-store' }
    );
    if (res.ok) {
      const result = await res.json();
      stats = result.data;
    }
  } catch (err) {
    // console.error("Failed to load library analytics", err);
  }

  return <LibraryReportingClient initialStats={stats} schoolId={companyId} />;
}