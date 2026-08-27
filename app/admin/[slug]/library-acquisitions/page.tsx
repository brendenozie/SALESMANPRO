import { cookies } from "next/headers";
import LibraryAcquisitionsClient from "./LibraryAcquisitionsClient";
import { getAuthSession } from '@/lib/auth';
import { findCompanyCached } from '@/lib/company-fetcher';

export default async function LibraryAcquisitionsPage({ params }: { params: Promise<{ slug: string }> }) {
 
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

  let initialOrders = [];
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/admin/library/acquisitions?companyId=${companyId}`,
      { headers: { cookie: cookieHeader }, cache: 'no-store' }
    );
    if (res.ok) {
      const result = await res.json();
      initialOrders = result.data.map((o: any) => ({
        id: o.id,
        title: o.title,
        qty: o.qty,
        cost: o.cost,
        status: o.status,
        vendor: o.vendor,
        date: new Date(o.updatedAt).toLocaleDateString()
      }));
    }
  } catch (err) {
    // console.error("Acquisitions fetch error", err);
  }

  return <LibraryAcquisitionsClient initialOrders={initialOrders} schoolId={companyId} />;
}