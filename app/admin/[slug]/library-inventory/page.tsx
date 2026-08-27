import { cookies } from "next/headers";
import LibraryInventoryClient from "./LibraryInventoryClient";
import { getAuthSession } from '@/lib/auth';
import { findCompanyCached } from '@/lib/company-fetcher';

export default async function LibraryInventoryPage({ params }: { params: Promise<{ slug: string }> }) {
  
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

  let initialItems = [];
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/admin/library/inventory?companyId=${companyId}`,
      { headers: { cookie: cookieHeader }, cache: 'no-store' }
    );
    if (res.ok) {
      initialItems = (await res.json()).data;
    }
  } catch (err) {
    // console.error("Inventory load failed", err);
  }

  return <LibraryInventoryClient initialItems={initialItems} schoolId={companyId} />;
}